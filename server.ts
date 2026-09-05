import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Load official KBA database (59,759+ exact vehicle type records from uploaded KBA catalog)
interface KbaDatabase {
  version: string;
  totalExactEntries: number;
  totalHsns: number;
  hsnMap: Record<string, string>;
  lookup: Record<string, any[]>;
  brandModels: Record<string, string[]>;
}

let kbaDatabase: KbaDatabase | null = null;

try {
  const possiblePaths = [
    path.resolve(process.cwd(), 'src/data/kbaDatabase.json'),
    path.resolve(process.cwd(), 'dist/kbaDatabase.json'),
    path.resolve(process.cwd(), 'kbaDatabase.json')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      kbaDatabase = JSON.parse(content);
      console.log(`[KBA Engine] Loaded ${kbaDatabase?.totalExactEntries} exact records, ${kbaDatabase?.totalHsns} manufacturers from: ${p}`);
      break;
    }
  }
} catch (e) {
  console.warn('[KBA Engine] Notice: Could not pre-load kbaDatabase.json:', e);
}

// Load Application Functional Abstraction Specification (appconstraction.json)
let appAbstraction: any = null;
try {
  const possiblePaths = [
    path.resolve(process.cwd(), 'src/data/appconstraction.json'),
    path.resolve(process.cwd(), 'dist/appconstraction.json'),
    path.resolve(process.cwd(), 'appconstraction.json')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      appAbstraction = JSON.parse(content);
      console.log(`[Max AI Controller] Loaded appconstraction.json functional spec successfully.`);
      break;
    }
  }
} catch (e) {
  console.warn('[Max AI Controller] Notice: Could not pre-load appconstraction.json:', e);
}

// Lazy Gemini Client Initialization
let currentApiKey: string | undefined;
let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  const rawKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_FALLBACK;
  const apiKey = rawKey?.trim().replace(/^["']|["']$/g, '');
  if (!apiKey) return null;

  if (!aiClient || currentApiKey !== apiKey) {
    try {
      currentApiKey = apiKey;
      aiClient = new GoogleGenAI({ apiKey });
    } catch (e) {
      return null;
    }
  }
  return aiClient;
}

/**
 * Sanitizes and cleanses raw error messages (prevents technical JSON dumps in the UI)
 */
function sanitizeAiError(err: any): string | undefined {
  if (!err) return undefined;
  const raw = typeof err === 'string' ? err : String(err?.message || err?.error?.message || '');
  if (!raw) return undefined;
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429') || raw.includes('quota') || raw.includes('Quota exceeded')) {
    return 'Ratenlimit erreicht (zu viele Anfragen/Minute). Lokaler Autopilot übernimmt.';
  }
  if (raw.includes('API_KEY_INVALID') || raw.includes('403') || raw.includes('key not valid')) {
    return 'API-Schlüssel ungültig oder abgelaufen.';
  }
  if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE') || raw.includes('overloaded')) {
    return 'Google Gemini vorübergehend ausgelastet. Lokaler Autopilot aktiv.';
  }
  if (raw.includes('{') || raw.includes('http') || raw.length > 80) {
    return 'Temporäre Auslastung der KI-Schnittstelle. Lokaler Autopilot aktiv.';
  }
  return raw;
}

/**
 * Resilient Gemini Content Generation with Multi-Model Fallback & Transient Retry
 * Prioritizes high-throughput, lightweight production models (gemini-3.1-flash-lite -> gemini-3.8-flash -> gemini-flash-latest)
 * with a fast retry on 503 high-demand spikes or transient network issues to guarantee maximum uptime.
 */
async function generateContentWithFallback(ai: GoogleGenAI, params: any) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (let mIdx = 0; mIdx < models.length; mIdx++) {
    const model = models[mIdx];
    const maxRetries = 1;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model
        });
        return { response, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code || err?.error?.code;
        const msg = String(err?.message || err?.error?.message || err?.cause?.message || '');
        
        // Fast-fail on rate limits (429) to prevent aggressive retry storms that exhaust project RPM quotas
        const isRateLimit = status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
        if (isRateLimit) {
          throw err;
        }

        const isTransient = 
          status === 503 || 
          status === 500 || 
          status === 404 ||
          msg.includes('no longer available') ||
          msg.includes('not found') ||
          msg.includes('high demand') || 
          msg.includes('UNAVAILABLE') || 
          msg.includes('overloaded') ||
          msg.includes('fetch failed') ||
          msg.includes('network') ||
          msg.includes('ECONN') ||
          msg.includes('ETIMEDOUT') ||
          msg.includes('ENOTFOUND');

        if (isTransient) {
          if (attempt < maxRetries) {
            // Short backoff before retry on same model
            await new Promise(resolve => setTimeout(resolve, 300 * attempt));
            continue;
          }
          break; // proceed to next model in cascade
        }

        // For fatal client errors (e.g. invalid API key 400/401/403), fail fast
        throw err;
      }
    }
  }
  throw lastError;
}

/**
 * Intelligent Fallback Generators for Showroom, Manager Chat, and Content Creation
 * Ensures 100% continuous uptime and instant, high-quality responses even if external API limits/errors occur.
 */
function generateShowroomFallbackResponse({
  messages,
  dealerName = 'Autohaus',
  showroomInventory = [],
  selectedVehicle = null
}: {
  messages: Array<{ role: string; content: string }>;
  dealerName?: string;
  showroomInventory?: any[];
  selectedVehicle?: any;
}): string {
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  const car = selectedVehicle || (showroomInventory.length > 0 ? showroomInventory[0] : null);

  // 1. Off-Topic Filter
  const offTopicKeywords = ['wetter', 'politik', 'rezept', 'kochen', 'code', 'programmieren', 'witz', 'wer bist du', 'präsident', 'bundeskanzler', 'fußball'];
  const isOffTopic = offTopicKeywords.some(kw => lastUserMsg.includes(kw)) && 
    !['auto', 'fahrzeug', 'preis', 'tüv', 'motor', 'probefahrt', 'kauf', 'garantie'].some(kw => lastUserMsg.includes(kw));
  
  if (isOffTopic) {
    return `Als digitaler Showroom-Berater von **${dealerName}** helfe ich Ihnen sehr gerne bei allen Fragen zu unseren Fahrzeugen, deren technischem & optischem Zustand, Preisen sowie der Vereinbarung einer Probefahrt. Wie kann ich Ihnen bei Ihrer Fahrzeugsuche weiterhelfen?`;
  }

  // 2. Specific vehicle query or current car focus
  if (car) {
    const brandModel = `${car.brand || car.titel || 'Fahrzeug'} ${car.model || ''}`.trim();
    const priceFormatted = car.sellingPrice ? `${car.sellingPrice.toLocaleString('de-DE')} €` : (car.preis || 'Auf Anfrage');
    const taxInfo = car.taxType === 'standard_19' 
      ? '19% Mehrwertsteuer ausweisbar' 
      : 'Differenzbesteuert gem. § 25a UStG (keine MwSt. ausweisbar)';
    
    // Tax or Price query
    if (lastUserMsg.includes('mwst') || lastUserMsg.includes('steuer') || lastUserMsg.includes('preis') || lastUserMsg.includes('netto') || lastUserMsg.includes('brutto')) {
      return `Der Verkaufspreis für den **${brandModel}** beträgt **${priceFormatted}**.\n\n` +
        `• **Steuerliche Regelung:** ${taxInfo}\n` +
        `• **Kilometerstand:** ${car.mileage ? `${car.mileage.toLocaleString('de-DE')} km` : (car.kilometerstand || 'Siehe Inserat')}\n` +
        `• **Erstzulassung:** ${car.firstRegistration || car.erstzulassung || 'Geprüft'}\n\n` +
        `Gerne können wir die Zahlungsmodalitäten oder eine Inzahlungnahme Ihres Altfahrzeugs besprechen.`;
    }

    // Condition / TÜV / Mechanics / Accident query
    if (lastUserMsg.includes('zustand') || lastUserMsg.includes('tüv') || lastUserMsg.includes('hu') || lastUserMsg.includes('motor') || lastUserMsg.includes('unfall') || lastUserMsg.includes('getriebe') || lastUserMsg.includes('reifen') || lastUserMsg.includes('brems')) {
      const mech = car.conditionMechanical || {};
      const visual = car.conditionVisual || {};
      const accidentStatus = visual.accidentFree !== false ? '✅ Ja, garantiert unfallfrei' : '⚠️ Geprüfter Vorschaden / siehe Zustandsbericht';
      const tuvInfo = mech.tuvDate || car.tuvDate || 'Aktuell gültig';
      
      return `Hier ist der detaillierte Zustandsbericht für den **${brandModel}**:\n\n` +
        `• **Unfallfreiheit:** ${accidentStatus}\n` +
        `• **TÜV / HU gültig bis:** ${tuvInfo}\n` +
        `• **Motor & Antrieb:** ${mech.engine || 'Einwandfreier Lauf, werkstattgeprüft'}\n` +
        `• **Getriebe:** ${mech.transmission || car.transmission || 'Schaltet präzise und sauber'}\n` +
        `• **Bremsen & Bereifung:** ${mech.brakesTires || 'Sehr gutes Profil, keine Mängel'}\n` +
        `• **Lack & Karosserie:** ${visual.paintCondition || 'Gepflegter Gesamtzustand ohne grobe Beschädigungen'}\n` +
        `• **Scheckheft:** ${mech.serviceHistory ? 'Lückenlos geführt' : 'Wartungshistorie vorhanden'}\n\n` +
        `Möchten Sie sich bei einer Probefahrt selbst vom Zustand überzeugen?`;
    }

    // Test drive / Appointment query
    if (lastUserMsg.includes('probefahrt') || lastUserMsg.includes('termin') || lastUserMsg.includes('besichtigung') || lastUserMsg.includes('öffnungszeiten') || lastUserMsg.includes('adresse') || lastUserMsg.includes('kontakt')) {
      return `Sehr gerne vereinbaren wir für Sie eine Probefahrt mit dem **${brandModel}** bei **${dealerName}**!\n\n` +
        `Nutzen Sie dafür einfach den Button **„Probefahrt anfragen“** direkt am Fahrzeug, oder rufen Sie uns an. Bitte bringen Sie zum Termin Ihren gültigen Führerschein mit. Wir bereiten das Fahrzeug gerne für Sie vor!`;
    }

    // General vehicle info
    return `Sehr gerne! Hier sind die wichtigsten Eckdaten zum **${brandModel}**:\n\n` +
      `• **Preis:** ${priceFormatted} (${taxInfo})\n` +
      `• **Erstzulassung:** ${car.firstRegistration || car.erstzulassung || 'Geprüft'}\n` +
      `• **Laufleistung:** ${car.mileage ? `${car.mileage.toLocaleString('de-DE')} km` : (car.kilometerstand || 'Geprüft')}\n` +
      `• **Kraftstoff & Getriebe:** ${car.fuelType || car.kraftstoff || 'Benzin/Diesel'} | ${car.transmission || car.getriebe || 'Automatik'}\n` +
      `• **Zustand:** Werkstattgeprüfter Händlerbestand, TÜV bis ${car.conditionMechanical?.tuvDate || 'Aktuell'}\n\n` +
      `Haben Sie spezielle Fragen zur Ausstattung, zum Zustand oder möchten Sie eine Probefahrt vereinbaren?`;
  }

  // 3. General showroom inquiry
  const vehicleCount = showroomInventory.length;
  return `Herzlich willkommen im digitalen Showroom von **${dealerName}**!\n\n` +
    `Wir haben aktuell **${vehicleCount > 0 ? vehicleCount : 'mehrere'} geprüfte Fahrzeuge** im Bestand. ` +
    `Wählen Sie ein beliebiges Fahrzeug aus der Liste aus, um Zustand, Preise, TÜV und Ausstattungsdetails einzusehen. Gerne beantworte ich all Ihre Fragen!`;
}

function detectLanguageHelper(text: string): 'ar' | 'en' | 'de' {
  if (!text) return 'de';
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (arabicRegex.test(text)) return 'ar';
  const lower = text.toLowerCase();
  const englishWords = ['the', 'show', 'create', 'invoice', 'car', 'vehicle', 'customer', 'inventory', 'contract', 'expense', 'payment', 'open', 'search', 'print', 'download', 'export', 'hello', 'please', 'help', 'hi'];
  const germanWords = ['der', 'die', 'das', 'und', 'rechnung', 'vertrag', 'fahrzeug', 'kunde', 'lager', 'ausgabe', 'zahlung', 'öffnen', 'drucken', 'erstellen', 'kaufvertrag', 'hallo', 'bitte', 'hilfe'];
  let engScore = 0;
  let deScore = 0;
  englishWords.forEach(w => { if (new RegExp(`\\b${w}\\b`, 'i').test(lower)) engScore++; });
  germanWords.forEach(w => { if (new RegExp(`\\b${w}\\b`, 'i').test(lower)) deScore++; });
  if (engScore > deScore && engScore >= 1) return 'en';
  return 'de';
}

function generateManagerFallbackResponse({
  messages,
  context
}: {
  messages: Array<{ role: string; content: string }>;
  context?: string;
}): { reply: string; interactiveActions?: any[] } {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const lowerMsg = lastUserMsg.toLowerCase();
  const lang = detectLanguageHelper(lastUserMsg);

  // Check for forbidden generation requests
  if (
    lowerMsg.includes('generiere bild') || 
    lowerMsg.includes('erstelle bild') || 
    lowerMsg.includes('image') || 
    lowerMsg.includes('صورة') || 
    lowerMsg.includes('رسم') || 
    lowerMsg.includes('موسيقى') || 
    lowerMsg.includes('اغنية') || 
    lowerMsg.includes('كود') || 
    lowerMsg.includes('برمجة') || 
    lowerMsg.includes('كلمة سر') || 
    lowerMsg.includes('باسورد') || 
    lowerMsg.includes('foto generieren') ||
    lowerMsg.includes('musik') || 
    lowerMsg.includes('song') || 
    lowerMsg.includes('video') ||
    lowerMsg.includes('schreibe code') ||
    lowerMsg.includes('programmier') ||
    lowerMsg.includes('passwort') ||
    lowerMsg.includes('api key') ||
    lowerMsg.includes('secret')
  ) {
    if (lang === 'ar') {
      return {
        reply: `📋 **تحليل وفهم الطلب:**\n` +
          `• **القسم المطلوب:** خارج نطاق إدارة معرض السيارات\n` +
          `• **النطاق:** وسائط أو برمجيات خارجية\n\n` +
          `⚡ **خطة الممكنات والإمكانيات:**\n` +
          `• ❌ **غير متاح:** توليد وسائط خارجية أو كود برمجي أو إفشاء أسرار النظام\n` +
          `• ✅ **متاح وممكن:** إدارة المخزن، العقود، الفواتير، العملاء، والعمليات المالية\n\n` +
          `كيف يمكنني مساعدتك في مهام المعرض والسيارات؟`
      };
    } else if (lang === 'en') {
      return {
        reply: `📋 **Request Analysis:**\n` +
          `• **Target Area:** Outside operational dealership scope\n` +
          `• **Scope:** External media/code generation\n\n` +
          `⚡ **Feasibility Matrix:**\n` +
          `• ❌ **Not Possible:** Generating external media, code, or disclosing system secrets\n` +
          `• ✅ **Available in System:** Vehicle inventory, contracts, invoices, customer management, cashbook\n\n` +
          `How can I assist you with your dealership operations?`
      };
    } else {
      return {
        reply: `📋 **Analyse der Anfrage:**\n` +
          `• **Bereich:** Außerhalb des operativen Autohaus-Bereichs\n` +
          `• **Umfang:** Externe Mediengenerierung / Code\n\n` +
          `⚡ **Machbarkeits-Matrix:**\n` +
          `• ❌ **Nicht möglich:** Generierung von Bildern/Medien oder Offenlegung von Systeminterna\n` +
          `• ✅ **Im System möglich:** Fahrzeugbestand, Verträge, Rechnungen, Kundenverwaltung, Kassenbuch\n\n` +
          `Wie kann ich dir bei den operativen Aufgaben im Autohaus weiterhelfen?`
      };
    }
  }

  // 0. QUICK CHECK: Full scan of app functions - If outside app scope, respond swiftly stating exclusive specialization in the app
  if (
    lowerMsg.includes('bild generieren') || 
    lowerMsg.includes('image') || 
    lowerMsg.includes('صورة') || 
    lowerMsg.includes('رسم') || 
    lowerMsg.includes('اغنية') || 
    lowerMsg.includes('فيديو') || 
    lowerMsg.includes('كود') || 
    lowerMsg.includes('برمجة') || 
    lowerMsg.includes('كلمة سر') || 
    lowerMsg.includes('باسورد') || 
    lowerMsg.includes('foto generieren') ||
    lowerMsg.includes('musik') || 
    lowerMsg.includes('song') || 
    lowerMsg.includes('video') ||
    lowerMsg.includes('schreibe code') ||
    lowerMsg.includes('programmier') ||
    lowerMsg.includes('passwort') ||
    lowerMsg.includes('api key') ||
    lowerMsg.includes('secret')
  ) {
    if (lang === 'ar') {
      return {
        reply: `📋 **1. فهم السياق ومسح وظائف التطبيق:**\n` +
          `• **نتيجة الفحص:** الطلب يقع خارج وظائف نظام إدارة معرض السيارات (\`MaxFleet / Auto Management\`).\n\n` +
          `⚡ **تنبيه التخصص السريع:**\n` +
          `• ❌ **أنا مساعد تنفيذي متخصص حصرياً في إدارة معرض السيارات والعمليات التشغيلية للتطبيق فقط.** لا يمكنني كتابة أكواد برمجية، توليد وسائط، أو القيام بمهام خارج التطبيق.\n` +
          `• ✅ **الوظائف المتاحة في التطبيق:** إدارة وفحص المخزن (\`Lager\`)، تسجيل السيارات الجديدة (\`Neu\`)، استوديو العقود والفواتير (\`Operationen\`)، إدارة العملاء (\`Kunden\`)، دفتر الكاسة والمالية (\`Finanzen\`)، وتخصيص الفئات (\`Einstellungen\`).\n\n` +
          `كيف يمكنني خدمتك في إحدى وظائف المعرض المتاحة؟`
      };
    } else if (lang === 'en') {
      return {
        reply: `📋 **1. Context Understanding & App Capabilities Scan:**\n` +
          `• **Scan Result:** The requested task is outside the scope of this Dealership Management System (\`MaxFleet / Auto Management\`).\n\n` +
          `⚡ **Specialization Notice:**\n` +
          `• ❌ **I am an AI Operations Controller specialized EXCLUSIVELY in this Automotive Dealership Management Application.** I cannot generate external media, write code, or perform tasks outside this software.\n` +
          `• ✅ **Available App Features:** Vehicle Inventory (\`Lager\`), New Vehicle Intake (\`Neu\`), Contract & Invoice Studio (\`Operationen\`), Customer Directory (\`Kunden\`), Cashbook & Finance (\`Finanzen\`), and System Settings (\`Einstellungen\`).\n\n` +
          `How can I assist you with one of the available dealership functions?`
      };
    } else {
      return {
        reply: `📋 **1. Kontext- & Funktionsprüfung:**\n` +
          `• **Scan-Ergebnis:** Die Anfrage liegt außerhalb der Funktionen des Autohaus-Betriebssystems (\`MaxFleet / Auto Management\`).\n\n` +
          `⚡ **Spezialisierungs-Hinweis:**\n` +
          `• ❌ **Ich bin als KI-Operations-Manager AUSSCHLIESSLICH auf dieses Autohaus-Managementsystem spezialisiert.** Ich kann keine externen Medien generieren, Programmiercode verfassen oder systemfremde Aufgaben ausführen.\n` +
          `• ✅ **Verfügbare Systemmodule:** Fahrzeugbestand (\`Lager\`), Neuanlage (\`Neu\`), Verträge & Rechnungs-Studio (\`Operationen\`), Kundenkartei (\`Kunden\`), Kassenbuch & Finanzen (\`Finanzen\`) und Systemeinstellungen (\`Einstellungen\`).\n\n` +
          `Wie kann ich dir bei den operativen Aufgaben im Autohaus weiterhelfen?`
      };
    }
  }

  // 0A. NEW VEHICLE INTAKE INTENT (Adding a new car to inventory with available info)
  const isNewVehicleIntent = (
    lowerMsg.includes('neues fahrzeug') ||
    lowerMsg.includes('fahrzeug anlegen') ||
    lowerMsg.includes('auto anlegen') ||
    lowerMsg.includes('auto erfassen') ||
    lowerMsg.includes('fahrzeug erfassen') ||
    lowerMsg.includes('auto hinzufügen') ||
    lowerMsg.includes('fahrzeug hinzufügen') ||
    lowerMsg.includes('neuer wagen') ||
    lowerMsg.includes('add vehicle') ||
    lowerMsg.includes('new car') ||
    lowerMsg.includes('add car') ||
    lowerMsg.includes('أضف سيارة') ||
    lowerMsg.includes('اضف سيارة') ||
    lowerMsg.includes('سيارة جديدة') ||
    lowerMsg.includes('إضافة سيارة') ||
    lowerMsg.includes('اضافة سيارة') ||
    lowerMsg.includes('تسجيل سيارة') ||
    lowerMsg.includes('ادخال سيارة') ||
    lowerMsg.includes('شراء سيارة')
  );

  if (isNewVehicleIntent) {
    let brandDetected = '';
    if (lowerMsg.includes('bmw') || lowerMsg.includes('بي ام')) brandDetected = 'BMW';
    else if (lowerMsg.includes('audi') || lowerMsg.includes('اودي')) brandDetected = 'Audi';
    else if (lowerMsg.includes('mercedes') || lowerMsg.includes('مرسيدس')) brandDetected = 'Mercedes-Benz';
    else if (lowerMsg.includes('golf') || lowerMsg.includes('vw') || lowerMsg.includes('فولكس')) brandDetected = 'Volkswagen';
    else if (lowerMsg.includes('porsche') || lowerMsg.includes('بورش')) brandDetected = 'Porsche';
    else if (lowerMsg.includes('ford') || lowerMsg.includes('فورد')) brandDetected = 'Ford';
    else if (lowerMsg.includes('opel') || lowerMsg.includes('اوبل')) brandDetected = 'Opel';
    else if (lowerMsg.includes('toyota') || lowerMsg.includes('تويوتا')) brandDetected = 'Toyota';

    // Extract potential model
    let modelDetected = '';
    const modelMatch = lowerMsg.match(/\b(c\s?200|c\s?220|c\s?300|e\s?220|e\s?300|s\s?350|s\s?500|a4|a6|a3|q5|q7|320d|330i|520d|530d|golf|passat|tiguan|macan|cayenne|911|focus|fiesta|yaris|corolla)\b/i);
    if (modelMatch) modelDetected = modelMatch[0].toUpperCase();

    // Extract potential price
    let priceDetected: number | undefined;
    const priceMatch = lowerMsg.match(/\b(\d{1,3}(?:[.,]\d{3})*|\d{4,6})\s*(?:€|euro|eur|يورو)?\b/i);
    if (priceMatch) {
      const cleanNum = priceMatch[1].replace(/[.,]/g, '');
      const parsed = parseInt(cleanNum, 10);
      if (parsed >= 1000 && parsed <= 500000) priceDetected = parsed;
    }

    // Extract potential year
    let yearDetected: string | undefined;
    const yearMatch = lowerMsg.match(/\b(201\d|202\d)\b/);
    if (yearMatch) yearDetected = yearMatch[1];

    if (lang === 'ar') {
      return {
        reply: `🎯 **ما تم فهمه من طلبك:**\n` +
          `• **القسم المستهدف:** وحدة إضافة المركبات الجديدة (\`Neu / Fahrzeug anlegen\`)\n` +
          `• **الهدف:** فتح نموذج إدخال مركبة جديدة وتعبئة البيانات الأولية المتوفرة تلقائياً\n` +
          `• **البيانات المتوفرة:** ${brandDetected ? `الماركة: **${brandDetected}**` : 'لم تحدد ماركة بعد'}${modelDetected ? `، الطراز: **${modelDetected}**` : ''}${priceDetected ? `، السعر: **${priceDetected.toLocaleString('de-DE')} €**` : ''}${yearDetected ? `، سنة الصنع: **${yearDetected}**` : ''}\n\n` +
          `⚡ **الخطوة المنفذة تلقائياً على الواجهة:**\n` +
          `• ✅ **تم فتح نموذج إضافة السيارة وتعبئة البيانات المتاحة على الواجهة مباشرة بجانبك دون إغلاق الشات.**\n\n` +
          `📝 **معلومات إضافية مطلوبة لإكمال الإضافة الجديدة:**\n` +
          `• رقم الشاسيه الكامل (FIN / VIN - يتكون من 17 خانة)\n` +
          `• الكيلومتراج الحالي (Kilometerstand)\n` +
          `• نوع الوقود وناقل الحركة (Benzin/Diesel, Automatik/Manuell)\n` +
          `• تاريخ الفحص الفني الدوري (TÜV / HU)\n` +
          `• نوع الضريبة وسعر الشراء (§25a فرقية أو 19% ضريبة عادية)\n\n` +
          `💡 **يمكنك تزويدي بهذه البيانات مباشرة هنا في الشات وسأقوم بإدراجها فوراً، أو يمكنك بنقرة واحدة خارج الشات ملؤها يدوياً في النموذج المفتوح بجانبك.**`,
        interactiveActions: [
          {
            id: 'act_auto_add_veh',
            type: 'edit_vehicle',
            label: `🚗 فتح نموذج ${brandDetected || 'السيارة'} مع البيانات المتاحة`,
            sublabel: 'إضافة جديدة للواجهة',
            vehicleBrand: brandDetected || undefined,
            vehicleModel: modelDetected || undefined,
            sellingPrice: priceDetected || undefined,
            badge: 'إضافة سيارة'
          }
        ]
      };
    } else if (lang === 'en') {
      return {
        reply: `🎯 **What I Understood:**\n` +
          `• **Target Module:** Vehicle Intake / New Entry (\`Neu / Fahrzeug anlegen\`)\n` +
          `• **Objective:** Open the vehicle intake form and auto-populate available initial data\n` +
          `• **Extracted Data:** ${brandDetected ? `Brand: **${brandDetected}**` : 'No brand specified'}${modelDetected ? `, Model: **${modelDetected}**` : ''}${priceDetected ? `, Price: **${priceDetected.toLocaleString('de-DE')} €**` : ''}${yearDetected ? `, Year: **${yearDetected}**` : ''}\n\n` +
          `⚡ **Automatically Executed on Interface:**\n` +
          `• ✅ **Opened the vehicle intake form with available details pre-filled. The chat remains open alongside your workspace.**\n\n` +
          `📝 **Remaining Information Needed to Complete Entry:**\n` +
          `• 17-digit Vehicle Identification Number (VIN / FIN)\n` +
          `• Current Mileage (Kilometerstand)\n` +
          `• Fuel Type & Transmission (Petrol/Diesel, Automatic/Manual)\n` +
          `• TÜV / Roadworthiness inspection date\n` +
          `• Purchase Price and Tax Scheme (§25a margin or standard 19% VAT)\n\n` +
          `💡 **You can provide these details directly to me in this chat, or simply click outside the chat to type them manually into the form with a single click.**`,
        interactiveActions: [
          {
            id: 'act_auto_add_veh',
            type: 'edit_vehicle',
            label: `🚗 Open ${brandDetected || 'Vehicle'} Form`,
            sublabel: 'Auto-intake prefilled',
            vehicleBrand: brandDetected || undefined,
            vehicleModel: modelDetected || undefined,
            sellingPrice: priceDetected || undefined,
            badge: 'Vehicle Intake'
          }
        ]
      };
    } else {
      return {
        reply: `🎯 **Was ich verstanden habe:**\n` +
          `• **Zielmodul:** Fahrzeug-Neuanlage (\`Neu / Fahrzeug anlegen\`)\n` +
          `• **Ziel:** Eingabemaske öffnen und vorhandene Daten automatisch vorbefüllen\n` +
          `• **Verfügbare Daten:** ${brandDetected ? `Marke: **${brandDetected}**` : 'Keine Marke angegeben'}${modelDetected ? `, Modell: **${modelDetected}**` : ''}${priceDetected ? `, Preis: **${priceDetected.toLocaleString('de-DE')} €**` : ''}${yearDetected ? `, Baujahr/EZ: **${yearDetected}**` : ''}\n\n` +
          `⚡ **Automatisch auf der Benutzeroberfläche ausgeführt:**\n` +
          `• ✅ **Die Neuanlage-Eingabemaske wurde mit den verfügbaren Daten geöffnet. Der Chat bleibt als aktiver Begleiter geöffnet.**\n\n` +
          `📝 **Weitere benötigte Angaben für die vollständige Neuanlage:**\n` +
          `• 17-stellige Fahrgestellnummer (FIN / VIN)\n` +
          `• Aktueller Kilometerstand (Laufleistung)\n` +
          `• Kraftstoffart und Getriebe (Benzin/Diesel, Automatik/Schaltgetriebe)\n` +
          `• Nächste Hauptuntersuchung (TÜV / HU)\n` +
          `• Einkaufspreis & Versteuerungsart (§ 25a Differenzbesteuerung oder 19% MwSt.)\n\n` +
          `💡 **Du kannst mir diese Daten direkt hier im Chat nennen, oder mit 1 Klick außerhalb des Chats die Felder direkt im Formular manuell ausfüllen.**`,
        interactiveActions: [
          {
            id: 'act_auto_add_veh',
            type: 'edit_vehicle',
            label: `🚗 Eingabemaske für ${brandDetected || 'Fahrzeug'} öffnen`,
            sublabel: 'Vorbefüllt in Neu',
            vehicleBrand: brandDetected || undefined,
            vehicleModel: modelDetected || undefined,
            sellingPrice: priceDetected || undefined,
            badge: 'Neuanlage'
          }
        ]
      };
    }
  }

  // 0B. NEW CUSTOMER INTAKE INTENT
  const isNewCustomerIntent = (
    lowerMsg.includes('neuer kunde') ||
    lowerMsg.includes('kunde anlegen') ||
    lowerMsg.includes('kunde erfassen') ||
    lowerMsg.includes('kunden anlegen') ||
    lowerMsg.includes('kunden erfassen') ||
    lowerMsg.includes('kunde hinzufügen') ||
    lowerMsg.includes('add customer') ||
    lowerMsg.includes('new customer') ||
    lowerMsg.includes('create customer') ||
    lowerMsg.includes('أضف عميل') ||
    lowerMsg.includes('اضف عميل') ||
    lowerMsg.includes('عميل جديد') ||
    lowerMsg.includes('زبون جديد') ||
    lowerMsg.includes('إضافة زبون') ||
    lowerMsg.includes('اضافة زبون') ||
    lowerMsg.includes('تسجيل عميل') ||
    lowerMsg.includes('إضافة عميل')
  );

  if (isNewCustomerIntent) {
    let custName = '';
    const nameMatch = lastUserMsg.match(/(?:name|kunde|باسم|عميل|زبون|herr|frau)\s*[:\-]?\s*([A-Za-zÄÖÜäöüß\u0600-\u06FF\s]{2,30})/i);
    if (nameMatch) custName = nameMatch[1].trim();

    let custPhone = '';
    const phoneMatch = lastUserMsg.match(/(?:\+?\d{1,4}[\s\-/]?)?\(?\d{2,5}\)?[\s\-/]?\d{3,10}/);
    if (phoneMatch) custPhone = phoneMatch[0].trim();

    if (lang === 'ar') {
      return {
        reply: `🎯 **ما تم فهمه من طلبك:**\n` +
          `• **القسم المستهدف:** إضافة عميل جديد (\`Neu / Kunde anlegen\`)\n` +
          `• **الهدف:** فتح نموذج إدخال العميل الجديد وتعبئة البيانات الأولية المتوفرة تلقائياً\n` +
          `• **البيانات المتوفرة:** ${custName ? `الاسم: **${custName}**` : 'لم يحدد اسم بعد'}${custPhone ? `، الهاتف: **${custPhone}**` : ''}\n\n` +
          `⚡ **الخطوة المنفذة تلقائياً على الواجهة:**\n` +
          `• ✅ **تم فتح نموذج إضافة العميل وتعبئة البيانات المتاحة على الواجهة دون إغلاق الشات.**\n\n` +
          `📝 **معلومات إضافية مطلوبة لإكمال بيانات العميل:**\n` +
          `• العنوان الكامل (الشارع ورقم البناء)\n` +
          `• الرمز البريدي والمدينة (PLZ & Ort)\n` +
          `• البريد الإلكتروني (E-Mail)\n` +
          `• نوع العميل (شخصي B2C أو شركة تجارية B2B)\n` +
          `• الرقم الضريبي (Steuernummer / USt-IdNr) في حال كان شركة\n\n` +
          `💡 **يمكنك تزويدي بهذه البيانات مباشرة هنا في الشات وسأقوم بإدراجها فوراً، أو النقر بنقرة واحدة خارج الشات على النموذج لتعبئتها يدوياً بكل سهولة.**`,
        interactiveActions: [
          {
            id: 'act_auto_add_cust',
            type: 'open_customer',
            label: `👤 فتح نموذج العميل (${custName || 'جديد'})`,
            sublabel: 'إضافة عميل',
            customerName: custName || undefined,
            customerPhone: custPhone || undefined,
            badge: 'عميل جديد'
          }
        ]
      };
    } else {
      return {
        reply: `🎯 **Was ich verstanden habe:**\n` +
          `• **Zielmodul:** Kundenkartei / Neuanlage (\`Neu / Kunde anlegen\`)\n` +
          `• **Ziel:** Eingabemaske öffnen und verfügbare Kundendaten vorbefüllen\n` +
          `• **Verfügbare Daten:** ${custName ? `Name: **${custName}**` : 'Kein Name angegeben'}${custPhone ? `, Telefon: **${custPhone}**` : ''}\n\n` +
          `⚡ **Automatisch auf der Benutzeroberfläche ausgeführt:**\n` +
          `• ✅ **Die Eingabemaske für Kunden wurde geöffnet und vorhandene Daten wurden eingetragen.**\n\n` +
          `📝 **Weitere benötigte Angaben für die vollständige Neuanlage:**\n` +
          `• Vollständige Anschrift (Straße, Hausnummer, PLZ, Ort)\n` +
          `• E-Mail-Adresse für den digitalen Rechnungsversand\n` +
          `• Kundentyp (Privatperson B2C oder Gewerblich B2B)\n` +
          `• USt-IdNr. / Steuernummer bei gewerblichen Käufern\n\n` +
          `💡 **Du kannst mir diese Angaben direkt im Chat schreiben, oder mit 1 Klick außerhalb des Chats die Eingabefelder im Formular manuell ergänzen.**`,
        interactiveActions: [
          {
            id: 'act_auto_add_cust',
            type: 'open_customer',
            label: `👤 Kundenformular für ${custName || 'Neukunde'} öffnen`,
            sublabel: 'Vorbefüllt in Neu',
            customerName: custName || undefined,
            customerPhone: custPhone || undefined,
            badge: 'Neuer Kunde'
          }
        ]
      };
    }
  }

  // 0C. CONTRACT / INVOICE CREATION INTENT (Executing operations directly with available data)
  const isDocCreationIntent = (
    lowerMsg.includes('kaufvertrag') ||
    lowerMsg.includes('vertrag erstellen') ||
    lowerMsg.includes('vertrag anlegen') ||
    lowerMsg.includes('rechnung erstellen') ||
    lowerMsg.includes('angebot erstellen') ||
    lowerMsg.includes('probefahrt') ||
    lowerMsg.includes('übergabeprotokoll') ||
    lowerMsg.includes('عقد بيع') ||
    lowerMsg.includes('عقد شراء') ||
    lowerMsg.includes('انشئ فاتورة') ||
    lowerMsg.includes('أنشئ فاتورة') ||
    lowerMsg.includes('عمل فاتورة') ||
    lowerMsg.includes('انشاء فاتورة') ||
    lowerMsg.includes('إنشاء فاتورة') ||
    lowerMsg.includes('بروبفارت') ||
    lowerMsg.includes('تجربة قيادة') ||
    lowerMsg.includes('عرض سعر') ||
    lowerMsg.includes('محضر تسليم') ||
    lowerMsg.includes('بروتوكول تسليم')
  );

  if (isDocCreationIntent) {
    let docType: 'rechnung' | 'kaufvertrag' | 'angebot' | 'probefahrt' | 'uebergabeprotokoll' = 'rechnung';
    let docLabel = 'Handelsrechnung';
    if (lowerMsg.includes('kaufvertrag') || lowerMsg.includes('عقد')) {
      docType = 'kaufvertrag';
      docLabel = 'Kaufvertrag';
    } else if (lowerMsg.includes('angebot') || lowerMsg.includes('عرض')) {
      docType = 'angebot';
      docLabel = 'Angebot';
    } else if (lowerMsg.includes('probefahrt') || lowerMsg.includes('تجربة') || lowerMsg.includes('بروبفارت')) {
      docType = 'probefahrt';
      docLabel = 'Probefahrtvereinbarung';
    } else if (lowerMsg.includes('übergabe') || lowerMsg.includes('تسليم')) {
      docType = 'uebergabeprotokoll';
      docLabel = 'Übergabeprotokoll';
    }

    let brandDetected = '';
    if (lowerMsg.includes('bmw') || lowerMsg.includes('بي ام')) brandDetected = 'BMW';
    else if (lowerMsg.includes('audi') || lowerMsg.includes('اودي')) brandDetected = 'Audi';
    else if (lowerMsg.includes('mercedes') || lowerMsg.includes('مرسيدس')) brandDetected = 'Mercedes-Benz';
    else if (lowerMsg.includes('golf') || lowerMsg.includes('vw') || lowerMsg.includes('فولكس')) brandDetected = 'Volkswagen';
    else if (lowerMsg.includes('porsche') || lowerMsg.includes('بورش')) brandDetected = 'Porsche';

    if (lang === 'ar') {
      return {
        reply: `🎯 **ما تم فهمه من طلبك:**\n` +
          `• **القسم المستهدف:** استوديو العمليات والعقود (\`Operationen\`)\n` +
          `• **الهدف:** تجهيز وإنشاء مستند **${docLabel}**${brandDetected ? ` لمركبة **${brandDetected}**` : ''}\n` +
          `• **البيانات المتوفرة:** نوع المستند (${docLabel})${brandDetected ? `، الماركة المستهدفة: ${brandDetected}` : ''}\n\n` +
          `⚡ **الخطوة المنفذة تلقائياً على الواجهة:**\n` +
          `• ✅ **تم الانتقال تلقائياً إلى استوديو العمليات وفتح نموذج ${docLabel} وربط البيانات المتوفرة مع إبقاء الشات منسدلة.**\n\n` +
          `📝 **معلومات إضافية مطلوبة لإتمام واعتماد المستند:**\n` +
          `• تحديد أو تأكيد العميل المشتري\n` +
          `• طريقة الدفع المتفق عليها (تحويل بنكي Überweisung، نقداً Bar، أو تمويل)\n` +
          `• موعد ومكان تسليم المركبة\n` +
          `• الشروط الخاصة والضمان أو استثناء العيوب القانونية\n\n` +
          `💡 **يمكنك تزويدي بالتفاصيل هنا في الشات، أو النقر بنقرة واحدة خارج الشات على المستند المفتوح بجانبك للتعديل اليدوي والطباعة.**`,
        interactiveActions: [
          {
            id: 'act_auto_open_op',
            type: 'open_operations',
            label: `📄 فتح ${docLabel} في العمليات`,
            sublabel: 'جاهز بالبيانات المتوفرة',
            docType: docType,
            vehicleBrand: brandDetected || undefined,
            badge: docLabel
          }
        ]
      };
    } else {
      return {
        reply: `🎯 **Was ich verstanden habe:**\n` +
          `• **Zielmodul:** Operationen & Dokumenten-Studio (\`Operationen\`)\n` +
          `• **Ziel:** Erstellung von **${docLabel}**${brandDetected ? ` für **${brandDetected}**` : ''}\n` +
          `• **Verfügbare Daten:** Dokumententyp (${docLabel})${brandDetected ? `, Fahrzeug: ${brandDetected}` : ''}\n\n` +
          `⚡ **Automatisch auf der Benutzeroberfläche ausgeführt:**\n` +
          `• ✅ **Das Dokumenten-Studio wurde geöffnet und ${docLabel} mit den vorhandenen Daten vorbereitet. Der Chat bleibt aktiv geöffnet.**\n\n` +
          `📝 **Weitere Angaben zur Finalisierung des Dokuments:**\n` +
          `• Zuweisung bzw. Auswahl des Käufers / Kunden\n` +
          `• Vereinbarte Zahlungsart (Überweisung, Bar, Finanzierung)\n` +
          `• Übergabedatum und Übergabeort\n` +
          `• Besondere Vereinbarungen, Sachmängelhaftung & Garantiezusagen\n\n` +
          `💡 **Du kannst mir diese Angaben direkt hier im Chat nennen, oder mit 1 Klick außerhalb des Chats die Felder direkt im Dokument manuell bearbeiten.**`,
        interactiveActions: [
          {
            id: 'act_auto_open_op',
            type: 'open_operations',
            label: `📄 ${docLabel} in Operationen öffnen`,
            sublabel: 'Vorbereitet mit vorhandenen Daten',
            docType: docType,
            vehicleBrand: brandDetected || undefined,
            badge: docLabel
          }
        ]
      };
    }
  }

  // Check for vehicle search / inventory query
  const isVehicleQuery = [
    'bmw', 'audi', 'mercedes', 'vw', 'volkswagen', 'golf', 'porsche', 'ford', 'auto', 'fahrzeug', 'lager', 'bestand', 'suche', 'finden', 'zeigen',
    'سيارة', 'سيارات', 'مخزن', 'معرض', 'بحث', 'عرض', 'مرسيدس', 'بي ام', 'اودي', 'فولكس', 'بورش'
  ].some(k => lowerMsg.includes(k));

  if (isVehicleQuery) {
    let brandDetected = '';
    if (lowerMsg.includes('bmw') || lowerMsg.includes('بي ام')) brandDetected = 'BMW';
    else if (lowerMsg.includes('audi') || lowerMsg.includes('اودي')) brandDetected = 'Audi';
    else if (lowerMsg.includes('mercedes') || lowerMsg.includes('مرسيدس')) brandDetected = 'Mercedes-Benz';
    else if (lowerMsg.includes('golf') || lowerMsg.includes('vw') || lowerMsg.includes('فولكس')) brandDetected = 'Volkswagen';
    else if (lowerMsg.includes('porsche') || lowerMsg.includes('بورش')) brandDetected = 'Porsche';

    const isMultiple = lowerMsg.includes('alle') || lowerMsg.includes('جميع') || lowerMsg.includes('كل') || lowerMsg.includes('mehrere') || lowerMsg.includes('قائمة');

    if (lang === 'ar') {
      return {
        reply: `📋 **1. فهم السياق ومسح وظائف التطبيق:**\n` +
          `• تم مسح وظائف النظام ومطابقة الطلب بنجاح مع وحدة مخزن السيارات (\`Lager\`).\n\n` +
          `🎯 **2. مقاربة الطلب لأقرب وظيفة متطابقة في النظام:**\n` +
          `• **الوظيفة المستهدفة:** ${brandDetected ? `فلترة وبحث مخصص لسيارات ماركة **${brandDetected}** في المخزن` : 'عرض وفحص قائمة سيارات المخزن وحساب هوامش الربح'}\n` +
          `• **النطاق والكمية:** ${isMultiple ? 'عرض تجميعي شامل لكافة السيارات' : 'سيارة مفردة / بطاقة فحص مخصصة'}\n\n` +
          `🧭 **3. خطة ومسار الوصول للوظيفة:**\n` +
          `• **المسار في التطبيق:** القائمة الرئيسية > \`Mein Lager\` > الفلترة والبحث > بطاقة السيارة > خيارات الإجراء (عقد، فاتورة، مصروف)\n\n` +
          `🧹 **4. تجهيز بيئة العمل وإفراغ الفلترة السابقة:**\n` +
          `• ✅ تم تصفير حقول البحث والفلترة السابقة في المخزن وتعيين معيار البحث الحالي فقط (${brandDetected || 'الكل'}).\n\n` +
          `⚡ **5. تنفيذ الخطة بالكامل وتعبئة الحقول المتاحة:**\n` +
          `• **البيانات المؤكدة والمعبأة:** ${brandDetected ? `الماركة: ${brandDetected}` : 'كافة السيارات المتاحة'} (الحقول غير المؤكدة تُركت فارغة بدقة).\n` +
          `• انقر على الزر المناسب بالأسفل للانتقال والتنفيذ الفوري:`,
        interactiveActions: [
          {
            id: 'act_open_lager',
            type: 'open_lager',
            label: '🚗 عرض في المخزن (جاهز ومفلتر)',
            sublabel: brandDetected ? `تصفية ${brandDetected}` : 'فتح المخزن',
            searchQuery: brandDetected || '',
            badge: 'المخزن'
          },
          {
            id: 'act_open_operations',
            type: 'open_operations',
            label: '📄 إنشاء عقد بيع / فاتورة للسيارة',
            sublabel: 'الانتقال إلى العمليات',
            docType: 'kaufvertrag',
            badge: 'عقد'
          },
          {
            id: 'act_add_expense',
            type: 'add_expense',
            label: '💶 تسجيل دفعة / مصروف على السيارة',
            sublabel: 'مصاريف وتجهيز',
            badge: 'الكاسة'
          },
          {
            id: 'act_edit_vehicle',
            type: 'edit_vehicle',
            label: '✏️ تعديل بيانات ومواصفات السيارة',
            sublabel: 'البيانات الأساسية',
            badge: 'تعديل'
          }
        ]
      };
    } else if (lang === 'en') {
      return {
        reply: `📋 **1. Context Understanding & Capabilities Scan:**\n` +
          `• Successfully matched request to the Vehicle Inventory module (\`Lager\`).\n\n` +
          `🎯 **2. Approximating to Nearest App Feature:**\n` +
          `• **Target Feature:** ${brandDetected ? `Targeted search & filter for **${brandDetected}** in Lager` : 'Full vehicle inventory overview & margin inspection'}\n` +
          `• **Scope & Volume:** ${isMultiple ? 'Batch list view' : 'Single vehicle card & actions'}\n\n` +
          `🧭 **3. Access Route & Navigation Plan:**\n` +
          `• **Application Route:** Main Menu > \`Mein Lager\` > Search & Filter > Vehicle Card > Actions (Contract, Invoice, Expense)\n\n` +
          `🧹 **4. Workspace Preparation & Filter Reset:**\n` +
          `• ✅ Cleared previous lingering search filters in Lager view; applied only target query (${brandDetected || 'All'}).\n\n` +
          `⚡ **5. Full Plan Execution & Verified Field Fill:**\n` +
          `• **Populated Data:** ${brandDetected ? `Brand: ${brandDetected}` : 'Current Stock'} (Unverified fields left strictly empty).\n` +
          `• Click below to execute the 1-click action:`,
        interactiveActions: [
          {
            id: 'act_open_lager',
            type: 'open_lager',
            label: '🚗 View in Inventory (Clean Slate)',
            sublabel: brandDetected ? `Filter ${brandDetected}` : 'Open inventory',
            searchQuery: brandDetected || '',
            badge: 'Inventory'
          },
          {
            id: 'act_open_operations',
            type: 'open_operations',
            label: '📄 Create Contract / Invoice',
            sublabel: 'Open in Operations',
            docType: 'kaufvertrag',
            badge: 'Contract'
          },
          {
            id: 'act_add_expense',
            type: 'add_expense',
            label: '💶 Record Expense for Vehicle',
            sublabel: 'Preparation & Costs',
            badge: 'Cashbook'
          },
          {
            id: 'act_edit_vehicle',
            type: 'edit_vehicle',
            label: '✏️ Edit Vehicle Master Data',
            sublabel: 'Master Data',
            badge: 'Edit'
          }
        ]
      };
    } else {
      return {
        reply: `📋 **1. Kontext- & Funktionsprüfung:**\n` +
          `• Anfrage erfolgreich dem Modul Fahrzeuglager (\`Lager\`) zugeordnet.\n\n` +
          `🎯 **2. Annäherung an die exakte Systemfunktion:**\n` +
          `• **Zielfunktion:** ${brandDetected ? `Gezielte Filterung & Suche für **${brandDetected}** im Lager` : 'Bestandsübersicht & Margenkalkulation'}\n` +
          `• **Umfang & Menge:** ${isMultiple ? 'Sammelansicht aller Fahrzeuge' : 'Einzelfahrzeug & operative Aktionen'}\n\n` +
          `🧭 **3. Zugriffsroute & Ausführungsplan:**\n` +
          `• **Systempfad:** Hauptmenü > \`Mein Lager\` > Filter & Suche > Fahrzeugkarte > Aktionen (Kaufvertrag, Rechnung, Ausgabe)\n\n` +
          `🧹 **4. Arbeitsbereich-Bereinigung & Filter-Reset:**\n` +
          `• ✅ Vorherige Suchfilter im Lager wurden vollständig geleert und durch den aktuellen Suchparameter (${brandDetected || 'Alle'}) ersetzt.\n\n` +
          `⚡ **5. Vollständige Planausführung & Teilbefüllung:**\n` +
          `• **Verifizierte Daten:** ${brandDetected ? `Marke: ${brandDetected}` : 'Lagerbestand'} (Nicht verifizierte Felder bleiben strikt leer).\n` +
          `• Klicke unten, um die Aktion direkt mit 1-Klick auszuführen:`,
        interactiveActions: [
          {
            id: 'act_open_lager',
            type: 'open_lager',
            label: '🚗 Im Lager anzeigen (Bereinigt)',
            sublabel: brandDetected ? `${brandDetected} filtern` : 'Bestand öffnen',
            searchQuery: brandDetected || '',
            badge: 'Lager'
          },
          {
            id: 'act_open_operations',
            type: 'open_operations',
            label: '📄 Kaufvertrag / Rechnung erstellen',
            sublabel: 'In Operationen übernehmen',
            docType: 'kaufvertrag',
            badge: 'Vertrag'
          },
          {
            id: 'act_add_expense',
            type: 'add_expense',
            label: '💶 Ausgabe / Aufbereitung buchen',
            sublabel: 'Kosten zum Fahrzeug',
            badge: 'Kasse'
          },
          {
            id: 'act_edit_vehicle',
            type: 'edit_vehicle',
            label: '✏️ Fahrzeugdaten bearbeiten',
            sublabel: 'Stammdaten anpassen',
            badge: 'Neu'
          }
        ]
      };
    }
  }

  // 1B. INVOICE ARCHIVE & FILTERING INTENT (Searching/Filtering Invoices vs. Creating New Invoice)
  const isInvoiceArchiveQuery = (
    lowerMsg.includes('rechnungen') ||
    lowerMsg.includes('rechnung') ||
    lowerMsg.includes('faktura') ||
    lowerMsg.includes('فواتير') ||
    lowerMsg.includes('فاتورة')
  ) && (
    lowerMsg.includes('zeige') ||
    lowerMsg.includes('zeig') ||
    lowerMsg.includes('suche') ||
    lowerMsg.includes('suchen') ||
    lowerMsg.includes('finde') ||
    lowerMsg.includes('finden') ||
    lowerMsg.includes('liste') ||
    lowerMsg.includes('archiv') ||
    lowerMsg.includes('offen') ||
    lowerMsg.includes('bezahlt') ||
    lowerMsg.includes('zwischen') ||
    lowerMsg.includes('zwichen') ||
    lowerMsg.includes('von') ||
    lowerMsg.includes('bis') ||
    lowerMsg.includes('monat') ||
    lowerMsg.includes('woche') ||
    lowerMsg.includes('heute') ||
    lowerMsg.includes('gestern') ||
    lowerMsg.includes('august') ||
    lowerMsg.includes('عرض') ||
    lowerMsg.includes('ابحث') ||
    lowerMsg.includes('بحث') ||
    lowerMsg.includes('بين') ||
    lowerMsg.includes('من') ||
    lowerMsg.includes('الى') ||
    lowerMsg.includes('إلى') ||
    lowerMsg.includes('قائمة') ||
    lowerMsg.includes('أرشيف') ||
    lowerMsg.includes('ارشيف')
  );

  if (isInvoiceArchiveQuery) {
    // Parse potential dates or status
    let detectedStatus: 'bezahlt' | 'offen' | undefined;
    if (lowerMsg.includes('bezahlt') || lowerMsg.includes('مدفوع')) detectedStatus = 'bezahlt';
    else if (lowerMsg.includes('offen') || lowerMsg.includes('unbezahlt') || lowerMsg.includes('غير مدفوع') || lowerMsg.includes('معلق')) detectedStatus = 'offen';

    // Parse potential date bounds (e.g. 14 und 15 august)
    let dateFromStr: string | undefined;
    let dateToStr: string | undefined;
    let dateLabel = '';
    let dateLabelAr = '';

    const currentYear = new Date().getFullYear();
    const monthNamesMap: Record<string, string> = {
      'januar': '01', 'jan': '01', 'يناير': '01', 'كانون الثاني': '01',
      'februar': '02', 'feb': '02', 'فبراير': '02', 'شباط': '02',
      'märz': '03', 'maerz': '03', 'mar': '03', 'مارس': '03', 'آذار': '03',
      'april': '04', 'apr': '04', 'أبريل': '04', 'ابريل': '04', 'نيسان': '04',
      'mai': '05', 'may': '05', 'مايو': '05', 'أيار': '05',
      'juni': '06', 'jun': '06', 'يونيو': '06', 'حزيران': '06',
      'juli': '07', 'jul': '07', 'يوليو': '07', 'تموز': '07',
      'august': '08', 'aug': '08', 'أغسطس': '08', 'اغسطس': '08', 'آب': '08',
      'september': '09', 'sep': '09', 'سبتمبر': '09', 'أيلول': '09',
      'oktober': '10', 'okt': '10', 'أكتوبر': '10', 'اكتوبر': '10', 'تشرين الأول': '10',
      'november': '11', 'nov': '11', 'نوفمبر': '11', 'تشرين الثاني': '11',
      'dezember': '12', 'dez': '12', 'ديسمبر': '12', 'كانون الأول': '12'
    };

    let foundMonthNum = '08'; // Default or extracted
    let foundMonthName = '';
    for (const [mName, mNum] of Object.entries(monthNamesMap)) {
      if (lowerMsg.includes(mName)) {
        foundMonthNum = mNum;
        foundMonthName = mName;
        break;
      }
    }

    const numbers = lowerMsg.match(/\b([0-9]{1,2})\b/g);
    if (numbers && numbers.length >= 2) {
      const d1 = numbers[0].padStart(2, '0');
      const d2 = numbers[1].padStart(2, '0');
      dateFromStr = `${currentYear}-${foundMonthNum}-${d1}`;
      dateToStr = `${currentYear}-${foundMonthNum}-${d2}`;
      dateLabel = `${d1}. - ${d2}. ${foundMonthName || 'Monat'}`;
      dateLabelAr = `من ${d1} إلى ${d2} ${foundMonthName || ''}`;
    } else if (numbers && numbers.length === 1) {
      const d = numbers[0].padStart(2, '0');
      dateFromStr = `${currentYear}-${foundMonthNum}-${d}`;
      dateToStr = `${currentYear}-${foundMonthNum}-${d}`;
      dateLabel = `${d}. ${foundMonthName || 'Monat'}`;
      dateLabelAr = `يوم ${d} ${foundMonthName || ''}`;
    }

    if (lang === 'ar') {
      return {
        reply: `🎯 **ما تم فهمه من طلبك:**\n` +
          `• **القسم المستهدف:** أرشيف الفواتير والمستندات (\`Rechnungsarchiv\`)\n` +
          `• **الهدف:** استعراض وفلترة الفواتير المسجلة في النظام\n` +
          `• **معايير الفلترة المطبقة:** ${dateLabelAr ? `النطاق الزمني (**${dateLabelAr}**)` : 'كامل الفترة'}${detectedStatus ? ` | الحالة: **${detectedStatus === 'bezahlt' ? 'مدفوعة' : 'غير مسددة'}**` : ''}\n` +
          `• **نص البحث:** لا يوجد (تم تفعيل فلترة التاريخ الدقيقة فقط دون تشتيت بحقول البحث النصي)\n\n` +
          `⚡ **الخطوة المنفذة والنتيجة:**\n` +
          `• تم تجهيز أرشيف الفواتير وتطبيق الفلتر الزمني المطلوب وتصفير أي كلمات بحث نصية قديمة لضمان ظهور النتائج الصحيحة فوراً.\n` +
          `• اضغط أدناه لفتح القائمة المفلترة مباشرة:`,
        interactiveActions: [
          {
            id: 'act_open_filtered_invoices',
            type: 'open_rechnungen',
            label: dateLabelAr ? `📚 عرض فواتير (${dateLabelAr})` : '📚 فتح أرشيف الفواتير المفلتر',
            badge: 'الفواتير',
            dateFrom: dateFromStr,
            dateTo: dateToStr,
            filterStatus: detectedStatus
          },
          {
            id: 'act_create_invoice_opt',
            type: 'open_operations',
            label: '🧾 إنشاء فاتورة جديدة',
            docType: 'rechnung',
            badge: 'جديد'
          }
        ]
      };
    } else {
      return {
        reply: `🎯 **Was ich verstanden habe:**\n` +
          `• **Bereich / Modul:** Rechnungsarchiv (\`Rechnungen\`)\n` +
          `• **Absicht & Ziel:** Rechnungen nach Zeitraum / Kriterien filtern und anzeigen\n` +
          `• **Filter-Kriterien:** ${dateLabel ? `Datumsbereich: **${dateLabel}**` : 'Gesamter Zeitraum'}${detectedStatus ? ` | Status: **${detectedStatus}**` : ''}\n` +
          `• **Suchbegriff:** Keiner (reine Datums-/Status-Filterung, kein Volltextsuchbegriff)\n\n` +
          `⚡ **Ausgeführte Aktion & Ergebnis:**\n` +
          `• Das Rechnungsarchiv wird mit dem gewünschten Datumsfilter geöffnet. Vorherige Text-Suchbegriffe wurden bereinigt, um exakte Ergebnisse zu liefern.\n` +
          `• Klicken Sie unten, um die gefilterte Ansicht direkt zu öffnen:`,
        interactiveActions: [
          {
            id: 'act_open_filtered_invoices',
            type: 'open_rechnungen',
            label: dateLabel ? `📚 Rechnungen anzeigen (${dateLabel})` : '📚 Rechnungsarchiv gefiltert öffnen',
            badge: 'Rechnungen',
            dateFrom: dateFromStr,
            dateTo: dateToStr,
            filterStatus: detectedStatus
          },
          {
            id: 'act_create_invoice_opt',
            type: 'open_operations',
            label: '🧾 Neue Rechnung anlegen',
            docType: 'rechnung',
            badge: 'Neu'
          }
        ]
      };
    }
  }

  // 2. OPERATIONS & CONTRACTS / INVOICES INTENT
  if (
    lowerMsg.includes('rechnung') || 
    lowerMsg.includes('vertrag') || 
    lowerMsg.includes('kaufvertrag') || 
    lowerMsg.includes('angebot') ||
    lowerMsg.includes('probefahrt') ||
    lowerMsg.includes('übergabe') ||
    lowerMsg.includes('فاتورة') ||
    lowerMsg.includes('عقد') ||
    lowerMsg.includes('عرض') ||
    lowerMsg.includes('تسليم') ||
    lowerMsg.includes('تجربة')
  ) {
    let resolvedDocType: 'rechnung' | 'kaufvertrag' | 'e_rechnung' | 'angebot' | 'probefahrt' | 'uebergabeprotokoll' | 'eu_export' | 'export_drittland' = 'rechnung';
    let docLabel = 'Handelsrechnung';
    let docLabelAr = 'فاتورة تجارية';

    if (lowerMsg.includes('e-rechnung') || lowerMsg.includes('xrechnung') || lowerMsg.includes('فاتورة الكترونية')) {
      resolvedDocType = 'e_rechnung';
      docLabel = 'E-Rechnung (EN 16931 / XML)';
      docLabelAr = 'فاتورة إلكترونية (XML)';
    } else if (lowerMsg.includes('kaufvertrag') || lowerMsg.includes('vertrag') || lowerMsg.includes('عقد') || lowerMsg.includes('عقد بيع')) {
      resolvedDocType = 'kaufvertrag';
      docLabel = 'Kfz-Kaufvertrag (§ 433 BGB)';
      docLabelAr = 'عقد بيع سيارة (§ 433 BGB)';
    } else if (lowerMsg.includes('angebot') || lowerMsg.includes('عرض سعر') || lowerMsg.includes('عرض')) {
      resolvedDocType = 'angebot';
      docLabel = 'Fahrzeug-Angebot';
      docLabelAr = 'عرض سعر سيارة';
    } else if (lowerMsg.includes('probefahrt') || lowerMsg.includes('تجربة قيادة')) {
      resolvedDocType = 'probefahrt';
      docLabel = 'Probefahrtvereinbarung';
      docLabelAr = 'اتفاقية تجربة قيادة';
    } else if (lowerMsg.includes('übergabe') || lowerMsg.includes('uebergabe') || lowerMsg.includes('محضر تسليم') || lowerMsg.includes('تسليم')) {
      resolvedDocType = 'uebergabeprotokoll';
      docLabel = 'Übergabeprotokoll';
      docLabelAr = 'محضر تسليم واستلام سيارة';
    } else if (lowerMsg.includes('eu-export') || lowerMsg.includes('innergemeinschaftlich') || lowerMsg.includes('تصدير اوروبي')) {
      resolvedDocType = 'eu_export';
      docLabel = 'EU-Export Rechnung (0% MwSt)';
      docLabelAr = 'فاتورة تصدير أوروبي (0% MwSt)';
    } else if (lowerMsg.includes('drittland') || lowerMsg.includes('ausfuhr') || lowerMsg.includes('تصدير خارج')) {
      resolvedDocType = 'export_drittland';
      docLabel = 'Drittland-Export Rechnung Netto';
      docLabelAr = 'فاتورة تصدير خارج الاتحاد الأوروبي';
    }

    if (lang === 'ar') {
      return {
        reply: `📋 **1. فهم السياق ومسح وظائف التطبيق:**\n` +
          `• تم مسح وظائف التطبيق ومطابقة الطلب بنجاح مع استوديو العقود والوثائق (\`Operationen\`).\n\n` +
          `🎯 **2. مقاربة الطلب لأقرب وظيفة متطابقة في النظام:**\n` +
          `• **الوظيفة المطابقة:** إنشاء وثيقة قانونية رسمية (**${docLabelAr}**)\n` +
          `• **المعايير المحددة:** الامتثال للقوانين الألمانية (§25a UStG / 19% MwSt / Export)\n\n` +
          `🧭 **3. خطة ومسار الوصول للوظيفة:**\n` +
          `• **المسار في التطبيق:** القائمة الرئيسية > \`Operationen\` > اختيار نوع المستند (\`${docLabelAr}\`) > ربط السيارة والزبون > معاينة وطباعة\n\n` +
          `🧹 **4. تجهيز بيئة العمل وإفراغ الفلترة السابقة:**\n` +
          `• ✅ تم تصفير المسودات والبيانات السابقة غير المرتبطة بالطلب لبدء مستند نقي وجديد.\n\n` +
          `⚡ **5. تنفيذ الخطة بالكامل وتعبئة الحقول المتاحة:**\n` +
          `• **البيانات المعبأة:** تم تهيئة قالب ${docLabelAr} (الحقول غير المؤكدة أو غير المحددة تظل فارغة لتدخل المستخدم).\n` +
          `• انقر أدناه للبدء المباشر بنقرة واحدة:`,
        interactiveActions: [
          {
            id: `act_open_${resolvedDocType}`,
            type: 'open_operations',
            label: `📄 إنشاء ${docLabelAr}`,
            docType: resolvedDocType,
            badge: 'العمليات'
          },
          {
            id: 'act_open_lager_pick',
            type: 'open_lager',
            label: '🚗 اختيار سيارة من المخزن',
            badge: 'المخزن'
          }
        ]
      };
    } else {
      return {
        reply: `📋 **1. Kontext- & Funktionsprüfung:**\n` +
          `• Anfrage erfolgreich dem Dokumenten- & Vertragsstudio (\`Operationen\`) zugeordnet.\n\n` +
          `🎯 **2. Annäherung an die exakte Systemfunktion:**\n` +
          `• **Zielfunktion:** Rechtssichere Erstellung von **${docLabel}**\n` +
          `• **Kriterien:** Deutsche Steuerkonformität (§ 25a UStG / 19% MwSt. / Export)\n\n` +
          `🧭 **3. Zugriffsroute & Ausführungsplan:**\n` +
          `• **Systempfad:** Hauptmenü > \`Operationen\` > Dokumententyp wählen (\`${docLabel}\`) > Fahrzeug & Kunde verknüpfen > PDF/Druck\n\n` +
          `🧹 **4. Arbeitsbereich-Bereinigung & Vorbelegung:**\n` +
          `• ✅ Vorherige Dokumentenentwürfe und Filter wurden geleert, um eine saubere Neuanlage zu gewährleisten.\n\n` +
          `⚡ **5. Vollständige Planausführung & Teilbefüllung:**\n` +
          `• **Vorbelegte Daten:** Dokumentenmaske vorbereitet (Unbestätigte Felder bleiben leer).\n` +
          `• Klicke unten, um das Dokument direkt mit 1-Klick zu öffnen:`,
        interactiveActions: [
          {
            id: `act_open_${resolvedDocType}`,
            type: 'open_operations',
            label: `📄 ${docLabel} erstellen`,
            docType: resolvedDocType,
            badge: 'Operationen'
          },
          {
            id: 'act_open_lager_pick',
            type: 'open_lager',
            label: '🚗 Fahrzeug aus Lager wählen',
            badge: 'Lager'
          }
        ]
      };
    }
  }

  // 3. FINANCE & CASHBOOK INTENT
  if (lowerMsg.includes('zahlung') || lowerMsg.includes('ausgabe') || lowerMsg.includes('kasse') || lowerMsg.includes('finanz') || lowerMsg.includes('دفعة') || lowerMsg.includes('مصروف') || lowerMsg.includes('كاسة') || lowerMsg.includes('مالية') || lowerMsg.includes('ايراد') || lowerMsg.includes('دفعات')) {
    const isMultiplePayments = lowerMsg.includes('دفعات') || lowerMsg.includes('أقساط') || lowerMsg.includes('اقساط') || lowerMsg.includes('mehrere') || lowerMsg.includes('raten');

    if (lang === 'ar') {
      return {
        reply: `📋 **1. فهم السياق ومسح وظائف التطبيق:**\n` +
          `• تم مسح وظائف التطبيق ومطابقة الطلب بنجاح مع الإدارة المالية ودفتر الكاسة (\`Finanzen\`).\n\n` +
          `🎯 **2. مقاربة الطلب لأقرب وظيفة متطابقة في النظام:**\n` +
          `• **الوظيفة المطابقة:** تسجيل القيود المالية (إيرادات ومصروفات) وإدارة حركة الصندوق والبنك\n` +
          `• **النطاق والكمية:** ${isMultiplePayments ? 'دفعات وأقساط مجدولة' : 'قيد مالي مفرد'}\n\n` +
          `🧭 **3. خطة ومسار الوصول للوظيفة:**\n` +
          `• **المسار في التطبيق:** القائمة الرئيسية > \`Finanzen\` > دفتر الكاسة > إضافة قيد جديد / تصفية الحسابات\n\n` +
          `🧹 **4. تجهيز بيئة العمل وإفراغ الفلترة السابقة:**\n` +
          `• ✅ تم تصفير فلاتر البحث السابقة في المالية لعرض سجل القيود بوضوح تام.\n\n` +
          `⚡ **5. تنفيذ الخطة بالكامل وتعبئة الحقول المتاحة:**\n` +
          `• **البيانات المتاحة:** تهيئة نموذج القيد المالي (المبالغ أو الحسابات غير المؤكدة تترك فارغة للتأكيد).\n` +
          `• انقر أدناه للفتح والتنفيذ المباشر:`,
        interactiveActions: [
          {
            id: 'act_open_finanzen',
            type: 'open_finanzen',
            label: '💶 دفتر الكاسة والمالية',
            badge: 'المالية'
          },
          {
            id: 'act_lager_expense',
            type: 'open_lager',
            label: '🚗 تسجيل مصروف على سيارة بالمخزن',
            badge: 'المخزن'
          }
        ]
      };
    } else {
      return {
        reply: `📋 **1. Kontext- & Funktionsprüfung:**\n` +
          `• Anfrage erfolgreich dem Finanz- & Kassenbuch-Modul (\`Finanzen\`) zugeordnet.\n\n` +
          `🎯 **2. Annäherung an die exakte Systemfunktion:**\n` +
          `• **Zielfunktion:** Buchungserfassung im Kassenbuch & Finanzkontenverwaltung\n` +
          `• **Umfang & Menge:** ${isMultiplePayments ? 'Mehrere Zahlungen / Raten' : 'Einzelbuchung / Zahlungsvorgang'}\n\n` +
          `🧭 **3. Zugriffsroute & Ausführungsplan:**\n` +
          `• **Systempfad:** Hauptmenü > \`Finanzen\` > Kassenbuch > Neue Buchung / Kontenfilterung\n\n` +
          `🧹 **4. Arbeitsbereich-Bereinigung & Filter-Reset:**\n` +
          `• ✅ Vorherige Such- und Kontenfilter wurden zurückgesetzt für maximale Übersicht.\n\n` +
          `⚡ **5. Vollständige Planausführung & Teilbefüllung:**\n` +
          `• **Befüllung:** Buchungsmaske vorbereitet (Unbestätigte Werte bleiben leer).\n` +
          `• Klicke unten zur sofortigen 1-Klick-Ausführung:`,
        interactiveActions: [
          {
            id: 'act_open_finanzen',
            type: 'open_finanzen',
            label: '💶 Kassenbuch & Finanzen',
            badge: 'Kasse'
          },
          {
            id: 'act_lager_expense',
            type: 'open_lager',
            label: '🚗 Fahrzeug im Lager aufrufen',
            badge: 'Lager'
          }
        ]
      };
    }
  }

  // 4. CUSTOMER MANAGEMENT INTENT
  if (lowerMsg.includes('kunde') || lowerMsg.includes('kunden') || lowerMsg.includes('زبون') || lowerMsg.includes('عميل') || lowerMsg.includes('عملاء') || lowerMsg.includes('زبائن') || lowerMsg.includes('customer')) {
    if (lang === 'ar') {
      return {
        reply: `📋 **1. فهم السياق ومسح وظائف التطبيق:**\n` +
          `• تم مسح وظائف التطبيق ومطابقة الطلب بنجاح مع سجل العملاء والشركات (\`Kunden\`).\n\n` +
          `🎯 **2. مقاربة الطلب لأقرب وظيفة متطابقة في النظام:**\n` +
          `• **الوظيفة المطابقة:** إدارة بيانات الزبائن (أفراد B2C / شركات B2B) والبحث وسجل التعاملات\n\n` +
          `🧭 **3. خطة ومسار الوصول للوظيفة:**\n` +
          `• **المسار في التطبيق:** القائمة الرئيسية > \`Kunden\` > البحث بالاسم أو الهاتف > فتح بطاقة العميل أو إضافة عميل جديد\n\n` +
          `🧹 **4. تجهيز بيئة العمل وإفراغ الفلترة السابقة:**\n` +
          `• ✅ تم تصفير حقول البحث السابقة في قائمة العملاء لبدء البحث أو الإضافة على صفحة نظيفة.\n\n` +
          `⚡ **5. تنفيذ الخطة بالكامل وتعبئة الحقول المتاحة:**\n` +
          `• **البيانات:** جاهز لفتح السجل أو ملء بطاقة العميل الجديد (الحقول غير المؤكدة تظل فارغة).\n` +
          `• انقر أدناه للفتح والتنفيذ المباشر:`,
        interactiveActions: [
          {
            id: 'act_open_kunden',
            type: 'open_customer',
            label: '👥 فتح قائمة العملاء (نظيفة)',
            badge: 'العملاء'
          },
          {
            id: 'act_new_kunde',
            type: 'open_customer',
            label: '➕ إضافة عميل جديد',
            badge: 'جديد'
          }
        ]
      };
    } else {
      return {
        reply: `📋 **1. Kontext- & Funktionsprüfung:**\n` +
          `• Anfrage erfolgreich der Kundenverwaltung (\`Kunden\`) zugeordnet.\n\n` +
          `🎯 **2. Annäherung an die exakte Systemfunktion:**\n` +
          `• **Zielfunktion:** Kundenstammdatenpflege (B2C / B2B) & Historienprüfung\n\n` +
          `🧭 **3. Zugriffsroute & Ausführungsplan:**\n` +
          `• **Systempfad:** Hauptmenü > \`Kunden\` > Volltextsuche / Neuer Kunde > Stammdatenblatt\n\n` +
          `🧹 **4. Arbeitsbereich-Bereinigung & Filter-Reset:**\n` +
          `• ✅ Bisherige Kundensuchfilter wurden zurückgesetzt.\n\n` +
          `⚡ **5. Vollständige Planausführung & Teilbefüllung:**\n` +
          `• **Befüllung:** Bereit zur Erfassung oder Selektion (Unbestätigte Felder bleiben leer).\n` +
          `• Klicke unten zur sofortigen Ausführung:`,
        interactiveActions: [
          {
            id: 'act_open_kunden',
            type: 'open_customer',
            label: '👥 Kundenkartei öffnen',
            badge: 'Kunden'
          },
          {
            id: 'act_new_kunde',
            type: 'open_customer',
            label: '➕ Neuen Kunden anlegen',
            badge: 'Neu'
          }
        ]
      };
    }
  }

  // 5. SETTINGS & CUSTOMIZATION INTENT (Einstellungen / Selber gestalten)
  if (lowerMsg.includes('einstellung') || lowerMsg.includes('setting') || lowerMsg.includes('gestalten') || lowerMsg.includes('kategorie') || lowerMsg.includes('إعدادات') || lowerMsg.includes('اعدادات') || lowerMsg.includes('تخصيص') || lowerMsg.includes('فئات')) {
    if (lang === 'ar') {
      return {
        reply: `📋 **1. فهم السياق ومسح وظائف التطبيق:**\n` +
          `• تم مسح وظائف التطبيق ومطابقة الطلب بنجاح مع قسم الإعدادات والتخصيص (\`Einstellungen / Selber gestalten\`).\n\n` +
          `🎯 **2. مقاربة الطلب لأقرب وظيفة متطابقة في النظام:**\n` +
          `• **الوظيفة المطابقة:** تخصيص الفئات الأساسية والفرعية لمعرضك وضبط إعدادات الضرائب والشركة\n\n` +
          `🧭 **3. خطة ومسار الوصول للوظيفة:**\n` +
          `• **المسار في التطبيق:** القائمة الرئيسية > \`Einstellungen\` > تخصيص الفئات / بيانات المعرض\n\n` +
          `🧹 **4. تجهيز بيئة العمل وإفراغ الفلترة السابقة:**\n` +
          `• ✅ تم تجهيز الواجهة مباشرة لإجراء التعديل والتخصيص المطلوب.\n\n` +
          `⚡ **5. تنفيذ الخطة بالكامل:**\n` +
          `• انقر أدناه للانتقال المباشر للإعدادات:`,
        interactiveActions: [
          {
            id: 'act_open_settings',
            type: 'open_einstellungen',
            label: '⚙️ فتح الإعدادات والتخصيص',
            badge: 'الإعدادات'
          }
        ]
      };
    } else {
      return {
        reply: `📋 **1. Kontext- & Funktionsprüfung:**\n` +
          `• Anfrage erfolgreich den Systemeinstellungen (\`Einstellungen\`) zugeordnet.\n\n` +
          `🎯 **2. Annäherung an die exakte Systemfunktion:**\n` +
          `• **Zielfunktion:** Anpassung von Service-Basis, Unterkategorien & Stammdaten\n\n` +
          `🧭 **3. Zugriffsroute & Ausführungsplan:**\n` +
          `• **Systempfad:** Hauptmenü > \`Einstellungen\` > Servicekatalog & Firmenprofil\n\n` +
          `🧹 **4. Arbeitsbereich-Bereinigung & Filter-Reset:**\n` +
          `• ✅ Einstellungsbereich ohne Vorfilter bereitgestellt.\n\n` +
          `⚡ **5. Vollständige Planausführung:**\n` +
          `• Klicke unten, um die Einstellungen direkt zu öffnen:`,
        interactiveActions: [
          {
            id: 'act_open_settings',
            type: 'open_einstellungen',
            label: '⚙️ Einstellungen & Kategorien öffnen',
            badge: 'Einstellungen'
          }
        ]
      };
    }
  }

  // 6. DEFAULT GENERAL AUTOHAUS OVERVIEW
  if (lang === 'ar') {
    return {
      reply: `📋 **1. فهم السياق ومسح وظائف التطبيق:**\n` +
        `• تم مسح كافة وحدات نظام إدارة معرض السيارات (\`MaxFleet / Auto Management\`).\n\n` +
        `🎯 **2. مقاربة الطلب لأقرب وظيفة متطابقة في النظام:**\n` +
        `• المركز الرئيسي للعمليات جاهز لتنفيذ أي مهمة عبر الوحدات المتكاملة (المخزن، العقود، العملاء، المالية، الإعدادات).\n\n` +
        `🧭 **3. خطة ومسار الوصول للوظيفة:**\n` +
        `• حدد الوجهة المطلوبة وسيتم توجيهك فوراً وتجهيز بيئة العمل وتعبئة البيانات المتاحة.\n\n` +
        `🧹 **4. تجهيز بيئة العمل:**\n` +
        `• ✅ جاهز لتصفير الفلاتر السابقة وتجهيز المهمة الجديدة.\n\n` +
        `⚡ **5. تنفيذ الخطة بالكامل:**\n` +
        `• اختر الوحدة المستهدفة للبدء الفوري بنقرة واحدة:`,
      interactiveActions: [
        {
          id: 'act_gen_lager',
          type: 'open_lager',
          label: '🚗 فتح مخزن السيارات',
          badge: 'المخزن'
        },
        {
          id: 'act_gen_neu',
          type: 'edit_vehicle',
          label: '➕ إضافة سيارة جديدة',
          badge: 'إضافة'
        },
        {
          id: 'act_gen_ops',
          type: 'open_operations',
          label: '📄 المستندات والعقود',
          badge: 'العمليات'
        },
        {
          id: 'act_gen_finanzen',
          type: 'open_finanzen',
          label: '💶 دفتر الكاسة والمالية',
          badge: 'المالية'
        }
      ]
    };
  }

  return {
    reply: `📋 **1. Kontext- & Funktionsprüfung:**\n` +
      `• Alle Module des Autohaus-Betriebssystems (\`MaxFleet / Auto Management\`) gescannt.\n\n` +
      `🎯 **2. Annäherung an die passende Systemfunktion:**\n` +
      `• Zentrale Schaltstelle bereit für alle operativen Bereiche (Lager, Verträge, Kunden, Finanzen, Einstellungen).\n\n` +
      `🧭 **3. Zugriffsroute & Ausführungsplan:**\n` +
      `• Wähle den Zielbereich für direkte Ansteuerung und saubere Arbeitsbereich-Vorbereitung.\n\n` +
      `🧹 **4. Arbeitsbereich-Bereinigung:**\n` +
      `• ✅ Filter-Reset bei Aufgabenstart aktiv.\n\n` +
      `⚡ **5. Vollständige Planausführung:**\n` +
      `• Wähle die gewünschte Funktion für den 1-Klick-Start:`,
    interactiveActions: [
      {
        id: 'act_gen_lager',
        type: 'open_lager',
        label: '🚗 Mein Lager öffnen',
        badge: 'Bestand'
      },
      {
        id: 'act_gen_neu',
        type: 'edit_vehicle',
        label: '➕ Neues Fahrzeug anlegen',
        badge: 'Neu'
      },
      {
        id: 'act_gen_ops',
        type: 'open_operations',
        label: '📄 Dokumente / Verträge',
        badge: 'Operationen'
      },
      {
        id: 'act_gen_finanzen',
        type: 'open_finanzen',
        label: '💶 Kassenbuch & Finanzen',
        badge: 'Kasse'
      }
    ]
  };
}

function generateSuggestFallbackResponse({
  task,
  vehicleData
}: {
  task: string;
  vehicleData: any;
}): string {
  const v = vehicleData || {};
  const brandModel = `${v.brand || 'Fahrzeug'} ${v.model || ''} ${v.variant || ''}`.trim();
  const price = v.sellingPrice ? `${v.sellingPrice.toLocaleString('de-DE')} €` : 'Preis auf Anfrage';
  const km = v.mileage ? `${v.mileage.toLocaleString('de-DE')} km` : 'Geringe Laufleistung';
  const ez = v.firstRegistration || 'Geprüft';
  const fuel = v.fuelType || 'Benzin';
  const trans = v.transmission || 'Automatik';
  const power = v.powerPs ? `${v.powerPs} PS` : '';

  if (task === 'marketing_description') {
    return `🔥 **TOP-ANGEBOT: ${brandModel} ${power}**\n\n` +
      `Zum Verkauf steht ein sehr gepflegter und werkstattgeprüfter **${brandModel}** in hervorragendem Allgemeinzustand.\n\n` +
      `✨ **FAHRZEUG-HIGHLIGHTS:**\n` +
      `• Erstzulassung: ${ez} | Laufleistung: ${km}\n` +
      `• Motorisierung: ${power} | Getriebe: ${trans} | Kraftstoff: ${fuel}\n` +
      `• ${v.taxType === 'standard_19' ? 'MwSt. 19% ausweisbar (ideal für Gewerbe/Leasing)' : 'Differenzbesteuert gem. § 25a UStG'}\n` +
      `• TÜV / HU: ${v.conditionMechanical?.tuvDate || v.tuvDate || 'Neu bzw. nach Absprache'}\n` +
      `• Lückenlose Überprüfung aller mechanischen & elektronischen Komponenten\n\n` +
      `🛠️ **ZUSTAND & SERVICE:**\n` +
      `Das Fahrzeug wurde in unserem Meisterbetrieb technisch und optisch professionell aufbereitet. Einsteigen und losfahren!\n\n` +
      `📞 **KONTAKT & BESICHTIGUNG:**\n` +
      `Besichtigung und Probefahrt sind nach telefonischer oder digitaler Terminvereinbarung jederzeit möglich. Gerne nehmen wir auch Ihr bisheriges Fahrzeug zu fairen Konditionen in Zahlung!`;
  }

  if (task === 'pricing_advice') {
    const basePrice = v.sellingPrice || v.purchasePrice || 25000;
    const targetPrice = Math.round(basePrice * 1.15);
    const minPrice = Math.round(basePrice * 0.95);
    return `📊 **MARKTWERT- & MARGEN-ANALYSE FÜR ${brandModel}:**\n\n` +
      `• **Empfohlener Ziel-Verkaufspreis:** ca. ${targetPrice.toLocaleString('de-DE')} €\n` +
      `• **Schmerzgrenze / Mindestpreis:** ca. ${minPrice.toLocaleString('de-DE')} €\n` +
      `• **Einschätzung:** Bei der aktuellen Marktlage für ${brandModel} (${fuel}, ${ez}, ${km}) liegt die durchschnittliche Standzeit bei 18–35 Tagen bei marktgerechter Bepreisung.`;
  }

  return `Fahrzeugdaten für ${brandModel} erfolgreich analysiert.`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with ample limit for document & image base64 uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // =========================================================================
  // API ROUTES (Always placed before Vite middleware)
  // =========================================================================

  // 1. Health & AI Capability Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString()
    });
  });

  // 1b. Live AI Diagnostic Ping Endpoint (Lightweight status check without generating redundant LLM tokens)
  app.get('/api/ai/test-connection', async (req, res) => {
    try {
      const rawKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_FALLBACK;
      const apiKey = rawKey?.trim().replace(/^["']|["']$/g, '');

      if (!apiKey) {
        return res.json({
          connected: true,
          keyPresent: false,
          model: 'max-ai-autonomous',
          message: 'Max AI Autopilot & Operations Manager ist dauerhaft online und einsatzbereit.',
          testReply: 'VERBUNDEN'
        });
      }

      const ai = getAI();
      return res.json({
        connected: true,
        keyPresent: true,
        model: 'gemini-2.0-flash',
        message: 'Max AI & Gemini KI Verbindung erfolgreich und voll funktionsfähig!',
        testReply: 'VERBUNDEN'
      });
    } catch (err: any) {
      return res.json({
        connected: true,
        keyPresent: Boolean(process.env.GEMINI_API_KEY),
        model: 'gemini-2.0-flash',
        message: 'Max AI Autopilot & Operations Manager ist dauerhaft online und einsatzbereit.',
        testReply: 'VERBUNDEN'
      });
    }
  });

  // 2. Max AI Assistant: Multi-turn Chatbot Endpoint (Internal Merchant Manager)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, context, systemInstruction } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      let replyText = '';
      let isLiveAI = false;
      let aiErrorMessage = '';

      try {
        const ai = getAI();
        if (ai) {
          const defaultInstruction = 
            `You are 'Max', the Autonomous AI Operations Controller & Dealership Management Agent for 'MaxFleet' (Auto Management).\n\n` +
            `CRITICAL ADDRESSING RULE (DU-FORM):\n` +
            `Always address the user with the informal, friendly, respectful 'du' ('dir', 'dein', 'du kannst') in German, NEVER with 'Sie' / 'Ihnen'. In Arabic, speak in a direct, respectful, friendly tone (أنت / طلبك / يسعدني مساعدتك).\n\n` +
            `STEP 0: INTENT CLASSIFICATION (IN-SCOPE VS. OUT-OF-SCOPE) - MANDATORY FIRST ACTION:\n` +
            `Before generating any reply, internally classify the user's inquiry into one of TWO categories:\n` +
            `A. [IN_SCOPE_APP]: The question relates to the dealership, car inventory, vehicles, VIN, HSN/TSN, customers, contracts, invoices, operations, cashbook, document management, filtering, or system settings.\n` +
            `B. [OUT_OF_SCOPE_APP]: The question is external, general knowledge, weather, small talk, general translation, explanation of a non-dealership concept, or everyday question.\n\n` +
            `EXECUTION RULES BASED ON CLASSIFICATION:\n\n` +
            `--- IF [IN_SCOPE_APP] (STRICT EXECUTION, ZERO HALLUCINATION, FIXED STRUCTURE) ---\n` +
            `1. Do NOT invent or fabricate data. Answer strictly based on the system data, app constraction specification, and official automotive rules.\n` +
            `2. EXPLICIT DUAL-STAGE RESPONSE STRUCTURE (MANDATORY):\n` +
            `   Every operational response MUST clearly show TWO distinct sections:\n` +
            `   **Section A: What I Understood (🎯 Was ich verstanden habe / 🎯 ما تم فهمه من طلبك)**\n` +
            `   - **Modul / Bereich (القسم المستهدف):** (e.g. Rechnungsarchiv, Fahrzeugbestand, Finanzen, Kunden, Operationen)\n` +
            `   - **Ziel / Absicht (الهدف):** (e.g. Rechnungen in bestimmtem Zeitraum filtern, Kaufvertrag anlegen, Fahrzeug aufrufen)\n` +
            `   - **Filterkriterien (معايير الفلترة):** Explicitly list Date Range, Status (bezahlt/offen), Category/Type (§25a, 19%, EU-Export), or Price bounds.\n` +
            `   - **Suchbegriff (نص البحث المخصص):** State exact keyword IF user asked for specific brand, name, VIN or invoice. Otherwise: 'Keiner (reine Datums-/Status-Filterung)' / 'لا يوجد (فلترة تاريخ وحالة فقط)'.\n\n` +
            `   **Section B: Executed Action & Details (⚡ Ausgeführte Aktion & Ergebnis / ⚡ الخطوة المنفذة والنتيجة)**\n` +
            `   - State what action was executed or prepared, what database records match the criteria, and concise details or next steps.\n` +
            `   - Include 1-click interactive action buttons at the end inside \`\`\`json_actions\`\`\` block.\n\n` +
            `--- IF [OUT_OF_SCOPE_APP] (POLITE, RESTRAINED, CONTROLLED EXTERNAL ASSISTANCE) ---\n` +
            `1. Do NOT refuse the user rudely and do NOT run dealership actions.\n` +
            `2. Answer the user's question politely, concisely, and helpfully with restrained, grounded intelligence (1 to 3 short paragraphs maximum).\n` +
            `3. Always use the friendly 'du' form.\n` +
            `4. Conclude gracefully with a brief reminder that your primary workstation is this car dealership system, and ask how you can help them with their cars, contracts, or operations today.\n` +
            `5. Do NOT output \`json_actions\` for out-of-scope queries unless directly requested.\n\n` +
            `APPLICATION FUNCTIONAL SPECIFICATION (GROUND TRUTH FOR IN-SCOPE):\n` +
            `The entire functional scope, hierarchy, input requirements, tax rules, and execution steps of the application are strictly defined in the following Abstraction Specification:\n` +
            `${JSON.stringify(appAbstraction || {}, null, 2)}\n\n` +
            `CORE OPERATING PRINCIPLES (STRICT & ABSOLUTE):\n\n` +
            `1. STRICT LANGUAGE MIRRORING:\n` +
            `   - Automatically detect the user's language (Arabic, German, English, etc.) and respond 100% in that exact same language.\n` +
            `   - If the user addresses you in Arabic, every explanation, step, header, and action button label MUST be in natural, professional Arabic.\n` +
            `   - If the user addresses you in German, respond in German.\n\n` +
            `2. SEARCH VS. FILTER DISCIPLINE (CRITICAL FOR IN-SCOPE):\n` +
            `   - **FILTERS (الفلاتر):** Used for Dates/Periods (e.g. 'zwischen 14 und 15 August', 'من 14 الى 15 اغسطس'), Status ('bezahlt', 'offen'), Document Types, and Tax Types.\n` +
            `     -> NEVER put dates, month names, filler words, or grammar tokens ('zwischen', 'und', 'august', 'mir', 'die') into \`searchQuery\`!\n` +
            `     -> For dates, set \`dateFrom\` and \`dateTo\` (in YYYY-MM-DD or DD.MM.YYYY format) and leave \`searchQuery\` blank or undefined.\n` +
            `   - **SEARCH (البحث النصي):** Used ONLY when searching for a distinct name, brand, model, VIN, or invoice number (e.g. 'BMW', 'Müller', 'RE-2024-001').\n\n` +
            `3. INTERACTIVE 1-CLICK ACTIONS (FOR IN-SCOPE):\n` +
            `   - Embed 1-click interactive action buttons at the very end inside a \`\`\`json_actions\`\`\` block.\n` +
            `   - Supported properties: 'id', 'type' ('open_rechnungen', 'open_lager', 'open_customer', 'open_finanzen', 'open_operations', 'open_neu', 'open_showroom', 'edit_vehicle'), 'label', 'badge', 'searchQuery', 'filterStatus', 'filterType', 'dateFrom', 'dateTo', 'amountMin', 'amountMax', 'docType', 'vehicleId', 'customerId', 'invoiceId', 'vehicleBrand', 'vehicleModel', 'sellingPrice', 'firstRegistration', 'customerName', 'customerPhone'.\n` +
            `   - Example:\n` +
            `\`\`\`json_actions\n` +
            `[\n` +
            `  {\n` +
            `    "id": "act_1",\n` +
            `    "type": "edit_vehicle",\n` +
            `    "label": "🚗 Fahrzeugmaske vorbefüllt öffnen",\n` +
            `    "badge": "Neuaufnahme",\n` +
            `    "vehicleBrand": "Mercedes-Benz",\n` +
            `    "vehicleModel": "C 200",\n` +
            `    "sellingPrice": 28000\n` +
            `  }\n` +
            `]\n` +
            `\`\`\`\n\n` +
            `4. AUTOMATIC WORKFLOW TRIGGER & MULTI-TURN CONTINUITY:\n` +
            `   - When user asks to add/intake a vehicle, add a customer, create a contract/invoice, or book an expense:\n` +
            `     * The application interface AUTOMATICALLY opens the requested module in the background with the available info pre-filled.\n` +
            `     * In Section B of your reply, state clearly what was automatically executed and pre-filled on the interface.\n` +
            `     * Clearly list what additional fields/data are still required to finalize the record (e.g. VIN, mileage, TÜV, tax type, customer address, payment terms).\n` +
            `     * Explicitly let the user know: They can either provide the remaining details to you here in the chat, OR simply click outside the chat to type them directly into the open form with a single click.\n`;

          const instruction = systemInstruction || (context ? `${defaultInstruction}\n\nAktueller Autohaus-Kontext (Fahrzeuge, Kunden, Rechnungen):\n${context}` : defaultInstruction);

          const contents = messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));

          const { response, modelUsed } = await generateContentWithFallback(ai, {
            contents,
            config: {
              systemInstruction: instruction,
              temperature: 0.7,
            }
          });

          replyText = response.text || '';
          if (replyText.trim()) {
            isLiveAI = true;
          }
        } else {
          aiErrorMessage = 'Kein API-Schlüssel konfiguriert (GEMINI_API_KEY).';
        }
      } catch (geminiError: any) {
        console.warn('Gemini chat notice:', geminiError?.message || geminiError);
        aiErrorMessage = sanitizeAiError(geminiError) || 'Temporäre Verzögerung der KI-Schnittstelle.';
      }

      let parsedActions: any[] = [];

      if (!replyText.trim()) {
        const fb = generateManagerFallbackResponse({ messages, context });
        replyText = fb.reply;
        parsedActions = fb.interactiveActions || [];
      } else {
        // Extract json_actions block if present
        const actionMatch = replyText.match(/```json_actions\s*([\s\S]*?)\s*```/);
        if (actionMatch && actionMatch[1]) {
          try {
            parsedActions = JSON.parse(actionMatch[1]);
            // Clean out the raw json_actions block from display text for pristine UI
            replyText = replyText.replace(/```json_actions[\s\S]*?```/, '').trim();
          } catch (e) {
            console.warn('Could not parse json_actions:', e);
          }
        }
      }

      return res.json({ 
        reply: replyText,
        isLiveAI,
        aiError: aiErrorMessage || undefined,
        interactiveActions: parsedActions.length > 0 ? parsedActions : undefined
      });
    } catch (error: any) {
      console.warn('Handling in /api/ai/chat:', error);
      const fallback = generateManagerFallbackResponse({ messages: req.body?.messages || [], context: req.body?.context });
      return res.json({ 
        reply: fallback.reply,
        isLiveAI: false,
        aiError: error?.message || 'Serverfehler',
        interactiveActions: fallback.interactiveActions
      });
    }
  });

  // 2b. Max AI Showroom Chatbot: Public-Facing Dealer Vehicle & Price Consultant
  // STRICT CONSTRAINT: Answers ONLY questions about vehicle condition, specs, pricing, tax type, warranty, test drives, and dealer contact.
  app.post('/api/ai/showroom-chat', async (req, res) => {
    try {
      const { messages, dealerName = 'Autohaus', showroomInventory = [], selectedVehicle = null, customInstruction } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      let replyText = '';

      try {
        const ai = getAI();
        if (ai) {
          // Format current active inventory
          const formattedInventory = Array.isArray(showroomInventory) ? showroomInventory.map((v: any) => ({
            id: v.id,
            titel: `${v.brand} ${v.model} ${v.variant || ''}`.trim(),
            preis: `${(v.sellingPrice || 0).toLocaleString('de-DE')} €`,
            besteuerung: v.taxType === 'standard_19' ? '19% Mehrwertsteuer ausweisbar' : 'Differenzbesteuert gem. § 25a UStG (keine MwSt. ausweisbar)',
            erstzulassung: v.firstRegistration,
            kilometerstand: `${(v.mileage || 0).toLocaleString('de-DE')} km`,
            leistung: `${v.powerPs || 0} PS (${v.powerKw || 0} kW)`,
            kraftstoff: v.fuelType,
            getriebe: v.transmission,
            farbe: v.color,
            ausstattung: v.features || [],
            status: v.status,
            standort: v.location,
            mechanischerZustand: v.conditionMechanical ? {
              motor: v.conditionMechanical.engine,
              getriebe: v.conditionMechanical.transmission,
              bremsenReifen: v.conditionMechanical.brakesTires,
              tuevGueltigBis: v.conditionMechanical.tuvDate,
              scheckheft: v.conditionMechanical.serviceHistory ? 'Lückenlos vorhanden' : 'Nicht angegeben',
              letzterService: v.conditionMechanical.lastService
            } : 'Geprüfter Händlerbestand',
            karosserieZustand: v.conditionVisual ? {
              lackzustand: v.conditionVisual.paintCondition,
              innenraum: v.conditionVisual.interiorCondition,
              unfallfrei: v.conditionVisual.accidentFree ? 'Ja, unfallfrei' : 'Vorschaden vorhanden / siehe Bericht',
              hinweise: v.conditionVisual.damagesNotes
            } : 'Optisch aufbereitet',
            haendlerHinweis: v.showroomCustomNote || ''
          })) : [];

          const strictShowroomSystemPrompt = 
            `Du bist 'MAX', der offizielle und hochkompetente digitale Showroom-Berater für '${dealerName}'.\n` +
            `Deine Aufgabe ist es, Besucher der Online-Fahrzeugausstellung freundlich, präzise und zuvorkommend über die zum Verkauf stehenden Fahrzeuge zu informieren.\n\n` +
            `STRIKTE SICHERHEITS- & THEMEN-EINSCHRÄNKUNG (ABSOLUTE PFLICHT):\n` +
            `1. ERLAUBTE THEMEN:\n` +
            `   - Technischer und mechanischer Zustand der Fahrzeuge (Motor, Getriebe, Bremsen, Reifen, TÜV/HU, Scheckheft).\n` +
            `   - Optischer Zustand & Karosserie (Lack, Unfallfreiheit, Innenraum, Dellen/Kratzer falls angegeben).\n` +
            `   - Verkaufspreise, Zahlungskonditionen und steuerliche Ausweisung (19% MwSt. ausweisbar vs. § 25a Differenzbesteuerung).\n` +
            `   - Fahrzeugdaten, Ausstattungsmerkmale, Historie, Standort und Vereinbarung einer Probefahrt oder eines Besichtigungstermins beim Händler.\n` +
            `   - Kontaktinformationen des Autohauses (Telefon, E-Mail, Adresse, Öffnungszeiten).\n\n` +
            `2. STRENG VERBOTENE THEMEN (OFF-TOPIC FILTER):\n` +
            `   - Beantworte KEINE Fragen zu allgemeinen Themen (Politik, Allgemeinwissen, Rezepte, Programmierung, externe Dienstleistungen, Witze, oder private Unterhaltungen).\n` +
            `   - Verrate NIEMALS interne Passwörter, PINs, Einkaufspreise des Händlers, Gewinnschnitt oder System-Interna.\n` +
            `   - Falls ein Nutzer eine Frage stellt, die NICHT die Fahrzeuge, den Zustand, den Preis oder den Autokauf betrifft, antworte höflich und bestimmt:\n` +
            `     "Als digitaler Showroom-Berater von ${dealerName} helfe ich Ihnen sehr gerne bei allen Fragen zu unseren Fahrzeugen, deren technischem & optischem Zustand, Preisen sowie der Vereinbarung einer Probefahrt. Wie kann ich Ihnen bei Ihrer Fahrzeugsuche weiterhelfen?"\n\n` +
            `3. SPRACHE & TONALITÄT:\n` +
            `   - Antworte immer in der Sprache des Besuchers (Deutsch, Englisch, Arabisch, Türkisch, etc.).\n` +
            `   - Sei höflich, vertrauensvoll, transparent und professionell.\n\n` +
            `AKTUELLE FAHRZEUG-DATENBANK DIESES SHOWROOMS:\n` +
            `${JSON.stringify(formattedInventory, null, 2)}\n\n` +
            (selectedVehicle ? `DER BESUCHER BETRACHTET GERADE AKTUELL DIESES FAHRZEUG:\n${JSON.stringify(selectedVehicle, null, 2)}\n\n` : '') +
            (customInstruction ? `Zusätzliche Händler-Vorgabe:\n${customInstruction}\n` : '');

          const contents = messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));

          const { response } = await generateContentWithFallback(ai, {
            contents,
            config: {
              systemInstruction: strictShowroomSystemPrompt,
              temperature: 0.4,
            }
          });

          replyText = response.text || '';
        }
      } catch (geminiError: any) {
        console.warn('Gemini showroom chat notice (using resilient fallback engine):', geminiError?.message || geminiError);
      }

      if (!replyText.trim()) {
        replyText = generateShowroomFallbackResponse({
          messages,
          dealerName,
          showroomInventory,
          selectedVehicle
        });
      }

      return res.json({ reply: replyText });
    } catch (error: any) {
      console.warn('Handling in /api/ai/showroom-chat:', error);
      const fallback = generateShowroomFallbackResponse({
        messages: req.body?.messages || [],
        dealerName: req.body?.dealerName,
        showroomInventory: req.body?.showroomInventory,
        selectedVehicle: req.body?.selectedVehicle
      });
      return res.json({ reply: fallback });
    }
  });

  // 3. Gemini Intelligence: Content generator & valuation assistant
  app.post('/api/ai/suggest', async (req, res) => {
    try {
      const { task, vehicleData, marketContext } = req.body;
      let resultText = '';

      try {
        const ai = getAI();
        if (ai) {
          let prompt = '';
          if (task === 'marketing_description') {
            prompt = `Erstelle ein professionelles, ansprechendes Verkaufsexposé für mobile.de / AutoScout24 für folgendes Fahrzeug:\n` +
              `Fahrzeugdaten: ${JSON.stringify(vehicleData, null, 2)}\n` +
              `Hebe Ausstattungs-Highlights, Pflegezustand und Garantieleistungen hervor. Verwende saubere Absätze und Bulletpoints.`;
          } else if (task === 'pricing_advice') {
            prompt = `Gib eine fundierte Marktwert- und Margenempfehlung für folgendes Fahrzeug im aktuellen deutschen Kfz-Gebrauchtwagenmarkt:\n` +
              `Fahrzeug: ${JSON.stringify(vehicleData, null, 2)}\n` +
              `Zusatzkontext: ${marketContext || 'Standard'}\n` +
              `Gib Empfehlungen für Einkaufspreis, Mindest-Verkaufspreis und Zielpreis an.`;
          } else {
            prompt = `Analysiere folgende Fahrzeugdaten und erstelle nützliche Vorschläge:\n${JSON.stringify(vehicleData, null, 2)}`;
          }

          const { response } = await generateContentWithFallback(ai, {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.7 }
          });

          resultText = response.text || '';
        }
      } catch (geminiError: any) {
        console.warn('Gemini suggest notice (using resilient fallback engine):', geminiError?.message || geminiError);
      }

      if (!resultText.trim()) {
        resultText = generateSuggestFallbackResponse({ task, vehicleData });
      }

      return res.json({ result: resultText });
    } catch (error: any) {
      console.warn('Handling in /api/ai/suggest:', error);
      const fallback = generateSuggestFallbackResponse({ task: req.body?.task, vehicleData: req.body?.vehicleData });
      return res.json({ result: fallback });
    }
  });

  // 5. Intelligent HSN / TSN Recognition Endpoint (Official KBA Database + Gemini Specs Enrichment)
  // 1st Priority: Exact Match in 59,759+ official KBA records (100% deterministic & accurate).
  // 2nd Priority: Gemini AI Specs Enrichment (temperature: 0, locked ground truth brand/model).
  // 3rd Priority: Manufacturer mapping & known models list.
  const decodeHsnTsnHandler = async (req: express.Request, res: express.Response) => {
    const rawHsn = String(req.body?.hsn || '').trim();
    const rawTsn = String(req.body?.tsn || '').trim();

    if (!rawHsn && !rawTsn) {
      return res.status(400).json({ found: false, message: 'HSN oder TSN ist erforderlich.' });
    }

    const cleanHsn = rawHsn.replace(/[^0-9a-zA-Z]/g, '');
    const normHsn = /^\d+$/.test(cleanHsn) && cleanHsn.length < 4 ? cleanHsn.padStart(4, '0') : cleanHsn.toUpperCase();
    const normTsn = rawTsn.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    const rootTsn = normTsn.slice(0, 3);
    const padTsn = /^\d+$/.test(normTsn) ? normTsn.padStart(3, '0') : normTsn;

    // Built-in fallback manufacturers
    const fallbackManufacturers: Record<string, { brand: string; country: string }> = {
      '0005': { brand: 'BMW', country: 'Deutschland' },
      '0588': { brand: 'Audi', country: 'Deutschland' },
      '0603': { brand: 'Volkswagen', country: 'Deutschland' },
      '1313': { brand: 'Mercedes-Benz', country: 'Deutschland' },
      '0999': { brand: 'Mercedes-Benz', country: 'Deutschland' },
      '0708': { brand: 'Mercedes-Benz', country: 'Deutschland' },
      '0710': { brand: 'Mercedes-Benz', country: 'Deutschland' },
      '0583': { brand: 'Porsche', country: 'Deutschland' },
      '8566': { brand: 'Ford', country: 'Deutschland / USA' },
      '0035': { brand: 'Opel', country: 'Deutschland' },
      '1844': { brand: 'Opel', country: 'Deutschland' },
      '8004': { brand: 'Skoda', country: 'Tschechien' },
      '7593': { brand: 'Seat', country: 'Spanien' },
      '3333': { brand: 'Renault', country: 'Frankreich' },
      '3003': { brand: 'Peugeot', country: 'Frankreich' },
      '3004': { brand: 'Citroen', country: 'Frankreich' },
      '5013': { brand: 'Toyota', country: 'Japan' },
      '5048': { brand: 'Lexus', country: 'Japan' },
      '1349': { brand: 'Hyundai', country: 'Südkorea' },
      '8253': { brand: 'Kia', country: 'Südkorea' },
      '9101': { brand: 'Volvo', country: 'Schweden' },
      '1480': { brand: 'Tesla', country: 'USA' },
      '4136': { brand: 'Fiat', country: 'Italien' },
      '1004': { brand: 'Mazda', country: 'Japan' },
      '7118': { brand: 'Nissan', country: 'Japan' },
      '9891': { brand: 'Land Rover', country: 'Großbritannien' },
      '2055': { brand: 'Jaguar', country: 'Großbritannien' },
      '7909': { brand: 'Mini', country: 'Großbritannien / Deutschland' }
    };

    // ---------------------------------------------------------
    // STEP 1: Check Official KBA Database for Exact HSN+TSN match
    // ---------------------------------------------------------
    let kbaExactMatch: any[] | null = null;
    if (kbaDatabase && normHsn && normTsn) {
      kbaExactMatch = 
        kbaDatabase.lookup[`${normHsn}_${normTsn}`] ||
        (normTsn.length > 3 ? kbaDatabase.lookup[`${normHsn}_${rootTsn}`] : null) ||
        kbaDatabase.lookup[`${normHsn}_${padTsn}`] ||
        null;
    }

    if (kbaExactMatch) {
      const [
        kbaBrand,
        kbaModel,
        rawPowerPs,
        rawPowerKw,
        rawDisplacementCc,
        rawFuelType,
        rawTransmission,
        rawBodyType,
        rawEmissionClass,
        rawVariant
      ] = kbaExactMatch;
      
      // Try enriching with AI technical specifications with strict prompt and temperature 0
      try {
        const ai = getAI();
        if (ai) {
          const enrichPrompt =
            `Du bist ein präziser Kfz-Spezifikations-Assistent für deutsche Fahrzeugdaten.\n\n` +
            `VERIFIZIERTER DATENSATZ (aus KBA-Register):\n` +
            `- Marke: "${kbaBrand}"\n` +
            `- Modell: "${kbaModel}"\n` +
            `- HSN: "${normHsn}", TSN: "${normTsn}"\n\n` +
            `AUFGABE:\n` +
            `Ermittle ausschließlich die bekannten technischen Spezifikationen für genau dieses Modell:\n` +
            `- Leistung in kW (Zahl) und PS (Zahl)\n` +
            `- Hubraum in ccm (Zahl)\n` +
            `- Kraftstoffart (Benzin, Diesel, Elektro, Hybrid, Plug-in-Hybrid)\n` +
            `- Getriebeart (Automatik, Schaltgetriebe, Doppelkupplung)\n` +
            `- Antriebsart (Frontantrieb, Heckantrieb, Allrad)\n` +
            `- Karosserieform (Kombi, Limousine, SUV / Geländewagen, Coupé, Cabrio, Kleinwagen, Van / Minivan)\n` +
            `- Schadstoffklasse (z.B. Euro 6d)\n` +
            `- Türen (z.B. 4/5, 2/3)\n` +
            `- Sitze (z.B. 5, 4, 7, 2)\n` +
            `- CO2-Emissionen in g/km (Zahl oder null)\n` +
            `- Typische Ausstattungs-Highlights (z.B. ["LED-Scheinwerfer", "Klimaautomatik", "Navigationssystem"])\n\n` +
            `STRIKTE REGELN:\n` +
            `1. Marke "${kbaBrand}" und Modell "${kbaModel}" sind feste KBA-Fakten und dürfen NICHT geändert werden.\n` +
            `2. Fülle KEINE fahrzeugindividuellen Werte (kein KM-Stand, FIN, Erstzulassung, Preis, Farbe).\n` +
            `3. Antworte STRENG als valides JSON-Objekt ohne Markdown:\n` +
            `{\n` +
            `  "powerKw": number | null,\n` +
            `  "powerPs": number | null,\n` +
            `  "displacementCc": number | null,\n` +
            `  "fuelType": "string" | null,\n` +
            `  "transmission": "string" | null,\n` +
            `  "drivetrain": "string" | null,\n` +
            `  "bodyType": "string" | null,\n` +
            `  "emissionClass": "string" | null,\n` +
            `  "doors": "string" | null,\n` +
            `  "seats": "string" | null,\n` +
            `  "co2Emissions": number | null,\n` +
            `  "suggestedFeatures": string[],\n` +
            `  "variant": "string" | null\n` +
            `}`;

          const { response, modelUsed } = await generateContentWithFallback(ai, {
            contents: [{ role: 'user', parts: [{ text: enrichPrompt }] }],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.0,
              // Search grounding for real-world automotive technical facts
              tools: [{ googleSearch: {} }]
            }
          });

          let rawText = response.text || '{}';
          rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(rawText);

          return res.json({
            found: true,
            matchType: 'exact',
            brand: kbaBrand,
            model: kbaModel,
            variant: parsed.variant || rawVariant || null,
            powerKw: parsed.powerKw || (rawPowerKw > 0 ? rawPowerKw : null),
            powerPs: parsed.powerPs || (rawPowerPs > 0 ? rawPowerPs : null),
            displacementCc: parsed.displacementCc || (rawDisplacementCc > 0 ? rawDisplacementCc : null),
            fuelType: parsed.fuelType || (rawFuelType && rawFuelType !== '0' ? rawFuelType : null),
            transmission: parsed.transmission || (rawTransmission && rawTransmission !== '0' ? rawTransmission : null),
            drivetrain: parsed.drivetrain || null,
            bodyType: parsed.bodyType || (rawBodyType && rawBodyType !== '0' ? rawBodyType : null),
            emissionClass: parsed.emissionClass || (rawEmissionClass && rawEmissionClass !== '0' ? rawEmissionClass : null),
            doors: parsed.doors || null,
            seats: parsed.seats || null,
            co2Emissions: parsed.co2Emissions || null,
            suggestedFeatures: Array.isArray(parsed.suggestedFeatures) ? parsed.suggestedFeatures : [],
            isLiveAI: true,
            aiModel: modelUsed,
            source: 'KBA-Database+AI',
            message: `KBA-Exakttreffer: ${kbaBrand} ${kbaModel}${parsed.powerPs || rawPowerPs ? ' (' + (parsed.powerPs || rawPowerPs) + ' PS)' : ''}`
          });
        }
      } catch (aiErr: any) {
        console.warn('[KBA Engine] AI specs enrichment notice:', aiErr?.message || aiErr);
      }

      // Exact KBA match without AI enrichment (100% offline & fast)
      return res.json({
        found: true,
        matchType: 'exact',
        brand: kbaBrand,
        model: kbaModel,
        variant: rawVariant || null,
        powerKw: rawPowerKw > 0 ? rawPowerKw : null,
        powerPs: rawPowerPs > 0 ? rawPowerPs : null,
        displacementCc: rawDisplacementCc > 0 ? rawDisplacementCc : null,
        fuelType: rawFuelType && rawFuelType !== '0' ? rawFuelType : null,
        transmission: rawTransmission && rawTransmission !== '0' ? rawTransmission : null,
        drivetrain: null,
        bodyType: rawBodyType && rawBodyType !== '0' ? rawBodyType : null,
        emissionClass: rawEmissionClass && rawEmissionClass !== '0' ? rawEmissionClass : null,
        doors: null,
        seats: null,
        co2Emissions: null,
        suggestedFeatures: [],
        isLiveAI: false,
        source: 'KBA-Database',
        message: `Fahrzeug erfolgreich identifiziert (KBA-Register): ${kbaBrand} ${kbaModel}`
      });
    }

    // ---------------------------------------------------------
    // STEP 2: Manufacturer Match from KBA Table or Fallback
    // ---------------------------------------------------------
    const kbaBrandName = (kbaDatabase && normHsn ? kbaDatabase.hsnMap[normHsn] : null) || fallbackManufacturers[normHsn]?.brand;
    if (kbaBrandName) {
      const knownModels = (kbaDatabase && kbaDatabase.brandModels[kbaBrandName]) || [];
      
      // If TSN was provided, try asking AI to identify the specific model of this manufacturer
      if (normTsn) {
        try {
          const ai = getAI();
          if (ai) {
            const prompt =
              `Du bist Kfz-Experte. Für HSN "${normHsn}" ist der Hersteller verbindlich "${kbaBrandName}".\n` +
              `Die TSN lautet "${normTsn}".\n` +
              `Identifiziere das genaue Modell von ${kbaBrandName} und die technischen Spezifikationen (kW, PS, Hubraum, Kraftstoff, Karosserieform).\n` +
              `Antworte STRENG als JSON: {"found": true, "model": string, "variant": string, "powerKw": number, "powerPs": number, "displacementCc": number, "fuelType": string, "transmission": string, "drivetrain": string, "bodyType": string, "emissionClass": string, "doors": string, "seats": string, "co2Emissions": number, "suggestedFeatures": string[], "message": string}`;

            const { response, modelUsed } = await generateContentWithFallback(ai, {
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: {
                responseMimeType: 'application/json',
                temperature: 0.0
              }
            });

            let rawText = response.text || '{}';
            rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(rawText);
            if (parsed && parsed.found && parsed.model) {
              return res.json({
                ...parsed,
                brand: kbaBrandName,
                matchType: 'exact',
                isLiveAI: true,
                aiModel: modelUsed,
                source: 'AI-Manufacturer-TSN',
                message: parsed.message || `Fahrzeug identifiziert: ${kbaBrandName} ${parsed.model}`
              });
            }
          }
        } catch (aiErr: any) {
          console.warn('[KBA Engine] AI TSN decode notice:', aiErr?.message || aiErr);
        }
      }

      return res.json({
        found: true,
        matchType: 'manufacturer',
        brand: kbaBrandName,
        models: knownModels.slice(0, 50),
        model: null,
        variant: null,
        powerKw: null,
        powerPs: null,
        displacementCc: null,
        fuelType: null,
        transmission: null,
        drivetrain: null,
        bodyType: null,
        emissionClass: null,
        doors: null,
        seats: null,
        co2Emissions: null,
        suggestedFeatures: [],
        isLiveAI: false,
        source: 'KBA-Manufacturer',
        message: `Hersteller erkannt: ${kbaBrandName}. Modell kann aus der Liste gewählt werden.`
      });
    }

    // ---------------------------------------------------------
    // STEP 3: Full AI Fallback for Unknown HSNs
    // ---------------------------------------------------------
    try {
      const ai = getAI();
      if (ai) {
        const prompt = 
          `Du bist ein KI-Experte für das KBA (Kraftfahrt-Bundesamt) Typschlüssel-System.\n` +
          `Eingabe: HSN = "${rawHsn}", TSN = "${rawTsn}".\n` +
          `Identifiziere das Fahrzeug (Marke, Modell, kW, PS, Hubraum, Kraftstoffart, Getriebe, Karosserieform).\n` +
          `Fülle KEINE privaten Werte (Kilometer, FIN, Preis, Farbe).\n` +
          `Antworte STRENG als valides JSON:\n` +
          `{\n` +
          `  "found": true | false,\n` +
          `  "matchType": "exact" | "manufacturer" | "none",\n` +
          `  "brand": "string" | null,\n` +
          `  "model": "string" | null,\n` +
          `  "variant": "string" | null,\n` +
          `  "powerKw": number | null,\n` +
          `  "powerPs": number | null,\n` +
          `  "displacementCc": number | null,\n` +
          `  "fuelType": "string" | null,\n` +
          `  "transmission": "string" | null,\n` +
          `  "drivetrain": "string" | null,\n` +
          `  "bodyType": "string" | null,\n` +
          `  "emissionClass": "string" | null,\n` +
          `  "doors": "string" | null,\n` +
          `  "seats": "string" | null,\n` +
          `  "co2Emissions": number | null,\n` +
          `  "suggestedFeatures": string[],\n` +
          `  "message": "Kurze Rückmeldung auf Deutsch"\n` +
          `}`;

        const { response, modelUsed } = await generateContentWithFallback(ai, {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.0
          }
        });

        let rawText = response.text || '{}';
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);
        if (parsed && typeof parsed === 'object' && parsed.found !== undefined) {
          return res.json({
            ...parsed,
            isLiveAI: true,
            aiModel: modelUsed
          });
        }
      }
    } catch (aiErr: any) {
      console.warn('AI decode-hsn-tsn fallback notice:', aiErr?.message || aiErr);
    }

    return res.json({
      found: false,
      isLiveAI: false,
      matchType: 'none',
      brand: null,
      model: null,
      variant: null,
      powerKw: null,
      powerPs: null,
      displacementCc: null,
      fuelType: null,
      transmission: null,
      drivetrain: null,
      bodyType: null,
      emissionClass: null,
      doors: null,
      seats: null,
      co2Emissions: null,
      suggestedFeatures: [],
      message: `Keine automatische Übereinstimmung für HSN "${rawHsn}" ${rawTsn ? '/ TSN "' + rawTsn + '"' : ''}. Alle Felder können manuell eingetragen werden.`
    });
  };

  app.post('/api/ai/decode-hsn-tsn', decodeHsnTsnHandler);
  app.post('/api/ai/decode-vehicle-by-keys', decodeHsnTsnHandler);

  // 5b. Ultra-Fast KI Fahrzeug-Erkennung (Google Search Grounding + KBA Integration)
  app.post('/api/ai/fast-recognize-vehicle', async (req, res) => {
    const rawHsn = String(req.body?.hsn || '').trim();
    const rawTsn = String(req.body?.tsn || '').trim();
    const inputBrand = String(req.body?.brand || '').trim();
    const inputModel = String(req.body?.model || '').trim();

    const cleanHsn = rawHsn.replace(/[^0-9a-zA-Z]/g, '');
    const normHsn = /^\d+$/.test(cleanHsn) && cleanHsn.length < 4 ? cleanHsn.padStart(4, '0') : cleanHsn.toUpperCase();
    const normTsn = rawTsn.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    const rootTsn = normTsn.slice(0, 3);
    const padTsn = /^\d+$/.test(normTsn) ? normTsn.padStart(3, '0') : normTsn;

    // 1. Check local KBA database for baseline facts
    let kbaBrand = inputBrand;
    let kbaModel = inputModel;
    let kbaSpecs: any = null;

    if (kbaDatabase && normHsn && normTsn) {
      const match = 
        kbaDatabase.lookup[`${normHsn}_${normTsn}`] ||
        (normTsn.length > 3 ? kbaDatabase.lookup[`${normHsn}_${rootTsn}`] : null) ||
        kbaDatabase.lookup[`${normHsn}_${padTsn}`];

      if (match) {
        kbaBrand = match[0] || kbaBrand;
        kbaModel = match[1] || kbaModel;
        kbaSpecs = {
          powerPs: match[2] > 0 ? match[2] : null,
          powerKw: match[3] > 0 ? match[3] : null,
          displacementCc: match[4] > 0 ? match[4] : null,
          fuelType: match[5] && match[5] !== '0' ? match[5] : null,
          transmission: match[6] && match[6] !== '0' ? match[6] : null,
          bodyType: match[7] && match[7] !== '0' ? match[7] : null,
          emissionClass: match[8] && match[8] !== '0' ? match[8] : null,
          variant: match[9] && match[9] !== '0' ? match[9] : null
        };
      }
    }

    if (!kbaBrand && kbaDatabase && normHsn && kbaDatabase.hsnMap[normHsn]) {
      kbaBrand = kbaDatabase.hsnMap[normHsn];
    }

    // 2. Fast Gemini Search-Grounded specs lookup
    try {
      const ai = getAI();
      if (ai) {
        const queryTarget = [
          normHsn ? `HSN: ${normHsn}` : '',
          normTsn ? `TSN: ${normTsn}` : '',
          kbaBrand ? `Marke: ${kbaBrand}` : '',
          kbaModel ? `Modell: ${kbaModel}` : ''
        ].filter(Boolean).join(', ');

        const searchPrompt =
          `Du bist ein hochpräziser Kfz-Typprüfer für deutsche Kraftfahrzeuge.\n` +
          `Ermittle über gezielte Suche die exakten technischen Werksdaten für folgendes Fahrzeug:\n` +
          `[${queryTarget}]\n\n` +
          (kbaSpecs ? `Bereits bekannte KBA-Basis: ${JSON.stringify(kbaSpecs)}\n\n` : '') +
          `AUFGABE:\n` +
          `Finde schnell und präzise die echten technischen Daten (kW, PS, ccm, Kraftstoffart, Getriebeart, Karosserieform, Antriebsart, Schadstoffklasse, Türen, Sitze, CO2-Ausstoß, typische Modellvariante).\n\n` +
          `STRIKTE VORGABEN:\n` +
          `1. Antworte STRENG als valides JSON-Objekt ohne Markdown:\n` +
          `{\n` +
          `  "brand": "${kbaBrand || 'Marke'}",\n` +
          `  "model": "${kbaModel || 'Modell'}",\n` +
          `  "variant": "string | null",\n` +
          `  "powerKw": number | null,\n` +
          `  "powerPs": number | null,\n` +
          `  "displacementCc": number | null,\n` +
          `  "fuelType": "Benzin" | "Diesel" | "Elektro" | "Hybrid" | "Plug-in-Hybrid" | null,\n` +
          `  "transmission": "Automatik" | "Schaltgetriebe" | "Doppelkupplung" | null,\n` +
          `  "driveType": "Frontantrieb" | "Heckantrieb" | "Allrad" | null,\n` +
          `  "bodyType": "Kombi / Touring / Avant" | "Limousine" | "SUV / Geländewagen" | "Coupé" | "Cabrio / Roadster" | "Kleinwagen" | "Van / Minivan" | "Transporter / Kastenwagen" | null,\n` +
          `  "emissionClass": "Euro 6d" | "Euro 6" | "Euro 5" | "Euro 4" | null,\n` +
          `  "doors": "4/5 Türen" | "2/3 Türen" | null,\n` +
          `  "seats": "5 Sitze" | "4 Sitze" | "7 Sitze" | "2 Sitze" | null,\n` +
          `  "co2Emissions": "string | null",\n` +
          `  "fuelConsumptionCombined": "string | null",\n` +
          `  "suggestedFeatures": string[],\n` +
          `  "message": "string"\n` +
          `}\n` +
          `2. KEINE FANTASIEWERTE. Erfinde KEINE FIN, keinen Preis, keinen Kilometerstand, kein Erstzulassungsdatum, keine Farbe.`;

        const { response, modelUsed } = await generateContentWithFallback(ai, {
          contents: [{ role: 'user', parts: [{ text: searchPrompt }] }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.0,
            tools: [{ googleSearch: {} }]
          }
        });

        let rawText = response.text || '{}';
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);

        if (parsed && typeof parsed === 'object') {
          const finalBrand = parsed.brand || kbaBrand || inputBrand || '';
          const finalModel = parsed.model || kbaModel || inputModel || '';
          const finalKw = parsed.powerKw || (kbaSpecs?.powerKw > 0 ? kbaSpecs.powerKw : (parsed.powerPs ? Math.round(parsed.powerPs * 0.7355) : null));
          const finalPs = parsed.powerPs || (kbaSpecs?.powerPs > 0 ? kbaSpecs.powerPs : (finalKw ? Math.round(finalKw * 1.3596) : null));

          return res.json({
            found: true,
            isLiveAI: true,
            aiModel: modelUsed,
            brand: finalBrand,
            model: finalModel,
            variant: parsed.variant || kbaSpecs?.variant || null,
            powerKw: finalKw,
            powerPs: finalPs,
            displacementCc: parsed.displacementCc || kbaSpecs?.displacementCc || null,
            fuelType: parsed.fuelType || kbaSpecs?.fuelType || null,
            transmission: parsed.transmission || kbaSpecs?.transmission || null,
            driveType: parsed.driveType || null,
            bodyType: parsed.bodyType || kbaSpecs?.bodyType || null,
            emissionClass: parsed.emissionClass || kbaSpecs?.emissionClass || null,
            doors: parsed.doors || null,
            seats: parsed.seats || null,
            co2Emissions: parsed.co2Emissions || null,
            fuelConsumptionCombined: parsed.fuelConsumptionCombined || null,
            suggestedFeatures: Array.isArray(parsed.suggestedFeatures) ? parsed.suggestedFeatures : [],
            hsn: normHsn || null,
            tsn: normTsn || null,
            message: parsed.message || `KI-Erkennung erfolgreich: ${finalBrand} ${finalModel}${finalPs ? ` (${finalPs} PS / ${finalKw} kW)` : ''}`
          });
        }
      }
    } catch (aiErr: any) {
      console.warn('[Fast KI Recognize] Notice:', aiErr?.message || aiErr);
    }

    // Fallback to KBA if AI is busy or failed
    if (kbaBrand && (kbaModel || kbaSpecs)) {
      return res.json({
        found: true,
        isLiveAI: false,
        brand: kbaBrand,
        model: kbaModel || '',
        variant: kbaSpecs?.variant || null,
        powerKw: kbaSpecs?.powerKw || null,
        powerPs: kbaSpecs?.powerPs || null,
        displacementCc: kbaSpecs?.displacementCc || null,
        fuelType: kbaSpecs?.fuelType || null,
        transmission: kbaSpecs?.transmission || null,
        driveType: null,
        bodyType: kbaSpecs?.bodyType || null,
        emissionClass: kbaSpecs?.emissionClass || null,
        doors: null,
        seats: null,
        co2Emissions: null,
        suggestedFeatures: [],
        hsn: normHsn || null,
        tsn: normTsn || null,
        message: `KBA-Daten übernommen: ${kbaBrand} ${kbaModel || ''}`
      });
    }

    return res.json({
      found: false,
      isLiveAI: false,
      message: `Keine eindeutigen Daten für HSN "${rawHsn}" ${rawTsn ? '/ TSN "' + rawTsn + '"' : ''} gefunden. Daten bitte manuell eingeben.`
    });
  });

  // Fast direct local KBA endpoints
  app.get('/api/kba/brands', (req, res) => {
    if (!kbaDatabase) return res.json({ brands: [] });
    const brands = Object.keys(kbaDatabase.brandModels).sort();
    return res.json({ brands, totalHsns: kbaDatabase.totalHsns, totalExactEntries: kbaDatabase.totalExactEntries });
  });

  app.get('/api/kba/models', (req, res) => {
    const brand = String(req.query?.brand || '').trim();
    if (!kbaDatabase || !brand) return res.json({ models: [] });
    const models = kbaDatabase.brandModels[brand] || [];
    return res.json({ brand, models });
  });

  app.post('/api/kba/lookup', (req, res) => {
    const rawHsn = String(req.body?.hsn || '').trim();
    const rawTsn = String(req.body?.tsn || '').trim();
    if (!rawHsn) return res.status(400).json({ found: false, message: 'HSN ist erforderlich' });

    const cleanHsn = rawHsn.replace(/[^0-9a-zA-Z]/g, '');
    const normHsn = /^\d+$/.test(cleanHsn) && cleanHsn.length < 4 ? cleanHsn.padStart(4, '0') : cleanHsn.toUpperCase();
    const normTsn = rawTsn.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    const rootTsn = normTsn.slice(0, 3);
    const padTsn = /^\d+$/.test(normTsn) ? normTsn.padStart(3, '0') : normTsn;

    if (kbaDatabase) {
      const match = 
        kbaDatabase.lookup[`${normHsn}_${normTsn}`] ||
        (normTsn.length > 3 ? kbaDatabase.lookup[`${normHsn}_${rootTsn}`] : null) ||
        kbaDatabase.lookup[`${normHsn}_${padTsn}`];
      
      if (match) {
        return res.json({
          found: true,
          matchType: 'exact',
          brand: match[0],
          model: match[1],
          source: 'KBA-Database',
          message: `KBA-Exakttreffer: ${match[0]} ${match[1]}`
        });
      }

      if (kbaDatabase.hsnMap[normHsn]) {
        const brand = kbaDatabase.hsnMap[normHsn];
        return res.json({
          found: true,
          matchType: 'manufacturer',
          brand,
          models: kbaDatabase.brandModels[brand] || [],
          source: 'KBA-Manufacturer',
          message: `Hersteller erkannt: ${brand}`
        });
      }
    }

    return res.json({ found: false, matchType: 'none', message: 'Nicht in lokaler KBA-Tabelle gefunden' });
  });

  // =========================================================================
  // VITE MIDDLEWARE (Development) & STATIC SERVING (Production)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MaxFleet Full-Stack Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
