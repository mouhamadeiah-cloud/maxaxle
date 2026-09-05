import appWorkflowData from './appWorkflow.json';
import { Vehicle, Customer, Invoice, NavTab } from '../types';
import { ChatInteractiveAction } from './aiService';

export function detectLanguage(text: string): 'ar' | 'de' | 'en' {
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

export interface Layer1View {
  id: string;
  tabKey: NavTab;
  title: string;
  keywords: string[];
  description: string;
  allowedNextLayers: string[];
  nextLayerActions: string[];
}

export interface Layer2Field {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  pattern?: string;
  enum?: string[];
  default?: any;
  autoCalculate?: boolean;
  autoGenerate?: boolean;
  autoFilledFromKBA?: boolean;
  source?: string;
  validation?: Record<string, any>;
}

export interface Layer2Section {
  sectionId: string;
  parentView: string;
  documentType?: string;
  title: string;
  keywords: string[];
  fields: Layer2Field[];
  allowedNextLayers: string[];
  nextLayerActions: string[];
}

export interface Layer3Operation {
  opId: string;
  label: string;
  keywords: string[];
  executionType: string;
  parameters?: Record<string, any>;
  prerequisites: string[];
}

export interface CompoundStep {
  stepOrder: number;
  targetLayer: 'LAYER_1_NAVIGATION_MACRO' | 'LAYER_2_ENTITY_FORMS' | 'LAYER_3_OPERATIONAL_EXECUTION';
  action: string;
  targetTab?: NavTab;
  targetSection?: string;
  lookupEntity?: 'vehicles' | 'customers' | 'invoices';
  mapping?: Record<string, any>;
  operations?: string[];
  description: string;
}

export interface CompoundWorkflow {
  compoundId: string;
  title: string;
  keywords: string[];
  description: string;
  steps: CompoundStep[];
  expectedNextSuggestions: Array<{
    label: string;
    opId?: string;
    tabKey?: NavTab;
    docType?: string;
    compoundId?: string;
  }>;
}

export interface WorkflowNavPreFillData {
  vehicle?: Partial<Vehicle>;
  customer?: Partial<Customer>;
  invoice?: Partial<Invoice>;
  documentType?: 'KAUFVERTRAG' | 'HANDELSRECHNUNG' | 'E_RECHNUNG' | 'ANGEBOT' | 'PROBEFAHRT' | 'UEBERGABEPROTOKOLL' | 'EU_EXPORT' | 'DRITTLAND';
  taxMode?: 'DIFF_25A' | 'REGEL_19' | 'STEUERFREI_EXPORT';
  searchQuery?: string;
  statusFilter?: string;
  typeFilter?: string;
  timeFilter?: string;
  filterAccount?: string;
  filterType?: string;
  filterTime?: string;
  filterStatus?: string;
  activeSection?: string;
  amount?: number;
  exactAmount?: number;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  dateRange?: string;
  paymentMethod?: string;
  date?: string;
  category?: string;
  account?: string;
  description?: string;
}

export interface StrictVehicleSearchResult {
  query: string;
  matches: Vehicle[];
  exactMatch?: Vehicle;
  isAmbiguous: boolean;
  matchType?: 'EXACT_ID' | 'EXACT_VIN' | 'EXACT_PLATE' | 'BRAND_AND_MODEL' | 'UNIQUE_MODEL' | 'BRAND_ONLY' | 'NONE';
}

export interface StrictCustomerSearchResult {
  query: string;
  matches: Customer[];
  exactMatch?: Customer;
  isAmbiguous: boolean;
  matchType?: 'EXACT_ID' | 'EXACT_NAME' | 'EXACT_COMPANY' | 'EXACT_EMAIL' | 'EXACT_VAT_ID' | 'UNIQUE_SURNAME' | 'NONE';
}

export interface WorkflowResolutionResult {
  matched: boolean;
  layer?: 'LAYER_1_NAVIGATION_MACRO' | 'LAYER_2_ENTITY_FORMS' | 'LAYER_3_OPERATIONAL_EXECUTION' | 'COMPOUND_MULTI_LAYER';
  layer1View?: Layer1View;
  layer2Section?: Layer2Section;
  layer3Operation?: Layer3Operation;
  compoundWorkflow?: CompoundWorkflow;
  targetTab?: NavTab;
  preFillData?: WorkflowNavPreFillData;
  extractedSearchTerm?: string;
  extractedBrand?: string;
  extractedDocumentType?: string;
  matchedVehicles?: Vehicle[];
  matchedCustomers?: Customer[];
  matchedInvoices?: Invoice[];
  missingParameters?: string[];
  disambiguationRequired?: boolean;
  replyText?: string;
  interactiveActions?: ChatInteractiveAction[];
  executionPlan?: {
    layer1?: { action: string; tabKey?: NavTab; entityId?: string };
    layer2?: { sectionId: string; fields: Record<string, any> };
    layer3?: { operations: string[] };
  };
}

export interface WorkflowLookupOptions {
  activeTab?: NavTab;
  currentDocument?: {
    documentType?: string;
    vehicle?: Partial<Vehicle>;
    customer?: Partial<Customer>;
    invoiceNumber?: string;
    taxMode?: string;
  };
}

export const workflowService = {
  getRawData() {
    return appWorkflowData;
  },

  getLayer1Views(): Layer1View[] {
    const raw = appWorkflowData as any;
    return (raw.layer_1_macro_navigation?.views || raw.layers?.LAYER_1_NAVIGATION_MACRO?.views || []) as Layer1View[];
  },

  getLayer2Sections(): Layer2Section[] {
    const raw = appWorkflowData as any;
    return (raw.layer_2_process_context?.sections || raw.layers?.LAYER_2_ENTITY_FORMS?.sections || []) as Layer2Section[];
  },

  getLayer3Operations(): Layer3Operation[] {
    const raw = appWorkflowData as any;
    return (raw.layer_3_execution_commands?.operations || raw.layers?.LAYER_3_OPERATIONAL_EXECUTION?.operations || []) as Layer3Operation[];
  },

  getCompoundWorkflows(): CompoundWorkflow[] {
    const raw = appWorkflowData as any;
    return (raw.compound_workflows || raw.compoundWorkflows || []) as CompoundWorkflow[];
  },

  getBrandAliasDictionary(): Record<string, string> {
    const raw = appWorkflowData as any;
    return (raw.brand_alias_dictionary || raw.brandAliasDictionary || {}) as Record<string, string>;
  },

  /**
   * Normalizes text by removing non-alphanumeric noise, normalizing Arabic characters, and handling hyphens/spaces.
   */
  normalizeText(input?: string): string {
    if (!input) return '';
    return input
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\-_/\\,.:;!?\"'„“”()]+/g, ' ')
      .replace(/\s+/g, ' ');
  },

  /**
   * Returns a compact version with all spaces and hyphens removed for exact substring matches.
   */
  compactText(input?: string): string {
    if (!input) return '';
    return this.normalizeText(input).replace(/\s+/g, '');
  },

  /**
   * Normalizes colloquial brand/model names into canonical names
   */
  normalizeBrandOrModel(input: string): { normalizedBrand?: string; canonicalQuery: string } {
    const clean = this.normalizeText(input);
    const compact = this.compactText(input);
    const aliasMap = this.getBrandAliasDictionary();
    let detectedBrand: string | undefined;

    // 1. Direct match in alias map
    for (const [alias, canonical] of Object.entries(aliasMap)) {
      const normAlias = this.normalizeText(alias);
      const compAlias = this.compactText(alias);
      if (clean === normAlias || compact === compAlias || clean.includes(normAlias) || compact.includes(compAlias)) {
        detectedBrand = String(canonical);
        break;
      }
    }

    return {
      normalizedBrand: detectedBrand,
      canonicalQuery: detectedBrand || input.trim()
    };
  },

  /**
   * Extracts clean name tokens ignoring titles and common company abbreviations.
   */
  extractCustomerNameTokens(name?: string): string[] {
    if (!name) return [];
    const IGNORED_WORDS = new Set([
      'herr', 'frau', 'dr', 'prof', 'firma', 'gmbh', 'co', 'kg', 'ag', 'e.k.', 'ohg', 'gbr', 'ug',
      'und', '&', 'von', 'zu', 'der', 'die', 'das', 'de', 'autohaus', 'automobile', 'kfz', 'service', 'gbr',
      'سيد', 'سيدة', 'شركة', 'مؤسسة'
    ]);
    return this.normalizeText(name)
      .split(/\s+/)
      .filter(t => t.length >= 2 && !IGNORED_WORDS.has(t));
  },

  /**
   * Cleans license plate or query string for exact comparisons.
   */
  cleanLicensePlate(plate?: string): string {
    return (plate || '').toLowerCase().replace(/[\s\-_]/g, '');
  },

  /**
   * Strict vehicle search based on exact ID, VIN, license plate, canonical brand + model, or specific model.
   * Handles hyphen/space variances (e.g. "Mercedes Benz" vs "Mercedes-Benz") and Arabic brand names seamlessly.
   * If multiple vehicles match, marks isAmbiguous = true and forces user disambiguation.
   */
  searchVehicles(query: string, vehicles: Vehicle[]): StrictVehicleSearchResult {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) {
      return { query: '', matches: [], isAmbiguous: false, matchType: 'NONE' };
    }
    const lowerQuery = cleanQuery.toLowerCase();
    const normQ = this.normalizeText(lowerQuery);
    const compactQ = this.compactText(lowerQuery);
    const cleanQPlate = this.cleanLicensePlate(lowerQuery);

    // 1. Exact ID
    const exactIdMatch = vehicles.filter(v => (v.id || '').toLowerCase() === lowerQuery);
    if (exactIdMatch.length === 1) {
      return { query: cleanQuery, matches: exactIdMatch, exactMatch: exactIdMatch[0], isAmbiguous: false, matchType: 'EXACT_ID' };
    }

    // 2. Exact Full VIN or ending 6+ characters of VIN
    const vinMatches = vehicles.filter(v => {
      const vVin = (v.vin || '').toLowerCase();
      if (!vVin) return false;
      if (vVin === lowerQuery || vVin === compactQ) return true;
      if (compactQ.length >= 6 && vVin.endsWith(compactQ)) return true;
      return false;
    });
    if (vinMatches.length === 1) {
      return { query: cleanQuery, matches: vinMatches, exactMatch: vinMatches[0], isAmbiguous: false, matchType: 'EXACT_VIN' };
    } else if (vinMatches.length > 1) {
      return { query: cleanQuery, matches: vinMatches, isAmbiguous: true, matchType: 'EXACT_VIN' };
    }

    // 3. Exact License Plate
    if (cleanQPlate.length >= 3) {
      const plateMatches = vehicles.filter(v => {
        const p1 = this.cleanLicensePlate(v.licensePlate);
        const p2 = this.cleanLicensePlate(v.kennzeichen);
        return (p1 && p1 === cleanQPlate) || (p2 && p2 === cleanQPlate);
      });
      if (plateMatches.length === 1) {
        return { query: cleanQuery, matches: plateMatches, exactMatch: plateMatches[0], isAmbiguous: false, matchType: 'EXACT_PLATE' };
      } else if (plateMatches.length > 1) {
        return { query: cleanQuery, matches: plateMatches, isAmbiguous: true, matchType: 'EXACT_PLATE' };
      }
    }

    // 4. Canonical Brand + Model Match (with hyphen & space tolerance)
    const { normalizedBrand } = this.normalizeBrandOrModel(lowerQuery);
    const brandAliasMap = this.getBrandAliasDictionary();

    const brandAndModelMatches = vehicles.filter(v => {
      const vBrandNorm = this.normalizeText(v.brand);
      const vBrandComp = this.compactText(v.brand);
      const vModelNorm = this.normalizeText(v.model);
      const vModelComp = this.compactText(v.model);
      const vVariantNorm = this.normalizeText(v.variant);

      const matchesBrand = 
        vBrandNorm === normQ || 
        vBrandComp === compactQ || 
        (normalizedBrand && (vBrandNorm === this.normalizeText(normalizedBrand) || vBrandComp === this.compactText(normalizedBrand))) ||
        normQ.includes(vBrandNorm) ||
        compactQ.includes(vBrandComp);

      const matchesModel = 
        normQ.includes(vModelNorm) || 
        compactQ.includes(vModelComp) ||
        (vVariantNorm && (normQ.includes(vVariantNorm) || compactQ.includes(this.compactText(v.variant))));

      return matchesBrand && matchesModel;
    });

    if (brandAndModelMatches.length === 1) {
      return { query: cleanQuery, matches: brandAndModelMatches, exactMatch: brandAndModelMatches[0], isAmbiguous: false, matchType: 'BRAND_AND_MODEL' };
    } else if (brandAndModelMatches.length > 1) {
      return { query: cleanQuery, matches: brandAndModelMatches, isAmbiguous: true, matchType: 'BRAND_AND_MODEL' };
    }

    // 5. Unique Model or Variant Match (e.g. "Golf", "Passat", "C 200", "C-Klasse")
    const modelOnlyMatches = vehicles.filter(v => {
      const vModelNorm = this.normalizeText(v.model);
      const vModelComp = this.compactText(v.model);
      return vModelComp.length >= 2 && (normQ === vModelNorm || compactQ === vModelComp || normQ.includes(vModelNorm) || compactQ.includes(vModelComp));
    });
    if (modelOnlyMatches.length === 1) {
      return { query: cleanQuery, matches: modelOnlyMatches, exactMatch: modelOnlyMatches[0], isAmbiguous: false, matchType: 'UNIQUE_MODEL' };
    } else if (modelOnlyMatches.length > 1) {
      return { query: cleanQuery, matches: modelOnlyMatches, isAmbiguous: true, matchType: 'UNIQUE_MODEL' };
    }

    // 6. Brand-only match (e.g. "Mercedes Benz", "Mercedes-Benz", "مرسيدس", "BMW", "Volkswagen", "VW")
    const brandOnlyMatches = vehicles.filter(v => {
      const vBrandNorm = this.normalizeText(v.brand);
      const vBrandComp = this.compactText(v.brand);
      return (
        (normalizedBrand && (vBrandNorm === this.normalizeText(normalizedBrand) || vBrandComp === this.compactText(normalizedBrand))) ||
        vBrandNorm === normQ ||
        vBrandComp === compactQ ||
        normQ.includes(vBrandNorm) ||
        compactQ.includes(vBrandComp)
      );
    });
    if (brandOnlyMatches.length === 1) {
      return { query: cleanQuery, matches: brandOnlyMatches, exactMatch: brandOnlyMatches[0], isAmbiguous: false, matchType: 'BRAND_ONLY' };
    } else if (brandOnlyMatches.length > 1) {
      return { query: cleanQuery, matches: brandOnlyMatches, isAmbiguous: true, matchType: 'BRAND_ONLY' };
    }

    return { query: cleanQuery, matches: [], isAmbiguous: false, matchType: 'NONE' };
  },

  /**
   * Strictly extracts vehicles mentioned inside a conversational prompt.
   */
  extractVehiclesFromPrompt(prompt: string, vehicles: Vehicle[]): StrictVehicleSearchResult {
    const cleanPrompt = (prompt || '').trim();
    if (!cleanPrompt) {
      return { query: '', matches: [], isAmbiguous: false, matchType: 'NONE' };
    }
    const lowerPrompt = cleanPrompt.toLowerCase();
    const normPrompt = this.normalizeText(lowerPrompt);
    const compactPrompt = this.compactText(lowerPrompt);

    // 1. Check Full VIN or 6+ char VIN ending in prompt
    const vinMatches = vehicles.filter(v => {
      const vVin = (v.vin || '').toLowerCase();
      if (!vVin || vVin.length < 6) return false;
      if (lowerPrompt.includes(vVin) || compactPrompt.includes(vVin)) return true;
      const vinEnd = vVin.slice(-6);
      return lowerPrompt.includes(vinEnd) || compactPrompt.includes(vinEnd);
    });
    if (vinMatches.length === 1) {
      return { query: vinMatches[0].vin, matches: vinMatches, exactMatch: vinMatches[0], isAmbiguous: false, matchType: 'EXACT_VIN' };
    } else if (vinMatches.length > 1) {
      return { query: cleanPrompt, matches: vinMatches, isAmbiguous: true, matchType: 'EXACT_VIN' };
    }

    // 2. Check License Plate in prompt
    const plateMatches = vehicles.filter(v => {
      const p1 = (v.licensePlate || '').toLowerCase().trim();
      const p2 = (v.kennzeichen || '').toLowerCase().trim();
      if (p1 && p1.length >= 3 && lowerPrompt.includes(p1)) return true;
      if (p2 && p2.length >= 3 && lowerPrompt.includes(p2)) return true;
      const cleanP1 = this.cleanLicensePlate(p1);
      const cleanP2 = this.cleanLicensePlate(p2);
      if (cleanP1 && cleanP1.length >= 4 && compactPrompt.includes(cleanP1)) return true;
      if (cleanP2 && cleanP2.length >= 4 && compactPrompt.includes(cleanP2)) return true;
      return false;
    });
    if (plateMatches.length === 1) {
      return { query: plateMatches[0].licensePlate || plateMatches[0].kennzeichen || '', matches: plateMatches, exactMatch: plateMatches[0], isAmbiguous: false, matchType: 'EXACT_PLATE' };
    } else if (plateMatches.length > 1) {
      return { query: cleanPrompt, matches: plateMatches, isAmbiguous: true, matchType: 'EXACT_PLATE' };
    }

    // 3. Brand + Model combinations in prompt (with brand aliases and hyphen tolerance)
    const brandAliasMap = this.getBrandAliasDictionary();
    const matchedBrandModelMap = new Map<string, Vehicle>();

    for (const v of vehicles) {
      const vBrandNorm = this.normalizeText(v.brand);
      const vBrandComp = this.compactText(v.brand);
      const vModelNorm = this.normalizeText(v.model);
      const vModelComp = this.compactText(v.model);
      const vVariantNorm = this.normalizeText(v.variant);

      let brandInPrompt = normPrompt.includes(vBrandNorm) || compactPrompt.includes(vBrandComp);
      if (!brandInPrompt) {
        for (const [alias, canonical] of Object.entries(brandAliasMap)) {
          const normAlias = this.normalizeText(alias);
          const compAlias = this.compactText(alias);
          if (
            typeof canonical === 'string' &&
            (this.compactText(canonical) === vBrandComp || this.normalizeText(canonical) === vBrandNorm) &&
            (normPrompt.includes(normAlias) || compactPrompt.includes(compAlias))
          ) {
            brandInPrompt = true;
            break;
          }
        }
      }

      const modelInPrompt = vModelComp.length >= 2 && (normPrompt.includes(vModelNorm) || compactPrompt.includes(vModelComp));
      const variantInPrompt = vVariantNorm.length >= 3 && (normPrompt.includes(vVariantNorm) || compactPrompt.includes(this.compactText(v.variant)));

      if (brandInPrompt && (modelInPrompt || variantInPrompt)) {
        matchedBrandModelMap.set(v.id, v);
      }
    }

    const brandModelMatches = Array.from(matchedBrandModelMap.values());
    if (brandModelMatches.length === 1) {
      return { query: `${brandModelMatches[0].brand} ${brandModelMatches[0].model}`, matches: brandModelMatches, exactMatch: brandModelMatches[0], isAmbiguous: false, matchType: 'BRAND_AND_MODEL' };
    } else if (brandModelMatches.length > 1) {
      return { query: cleanPrompt, matches: brandModelMatches, isAmbiguous: true, matchType: 'BRAND_AND_MODEL' };
    }

    // 4. Distinct Model in Prompt (e.g. "Golf", "Passat", "Taycan", "Mustang", "C200")
    const matchedModelMap = new Map<string, Vehicle>();
    for (const v of vehicles) {
      const vModelNorm = this.normalizeText(v.model);
      const vModelComp = this.compactText(v.model);
      if (vModelComp.length >= 3 && (normPrompt.includes(vModelNorm) || compactPrompt.includes(vModelComp))) {
        matchedModelMap.set(v.id, v);
      }
    }
    const modelMatches = Array.from(matchedModelMap.values());
    if (modelMatches.length === 1) {
      return { query: `${modelMatches[0].brand} ${modelMatches[0].model}`, matches: modelMatches, exactMatch: modelMatches[0], isAmbiguous: false, matchType: 'UNIQUE_MODEL' };
    } else if (modelMatches.length > 1) {
      return { query: cleanPrompt, matches: modelMatches, isAmbiguous: true, matchType: 'UNIQUE_MODEL' };
    }

    // 5. Brand Only in Prompt (e.g. "Mercedes Benz", "Mercedes-Benz", "مرسيدس", "BMW", "Volkswagen", "Audi")
    const matchedBrandOnlyMap = new Map<string, Vehicle>();
    for (const v of vehicles) {
      const vBrandNorm = this.normalizeText(v.brand);
      const vBrandComp = this.compactText(v.brand);
      let brandInPrompt = normPrompt.includes(vBrandNorm) || compactPrompt.includes(vBrandComp);
      if (!brandInPrompt) {
        for (const [alias, canonical] of Object.entries(brandAliasMap)) {
          const normAlias = this.normalizeText(alias);
          const compAlias = this.compactText(alias);
          if (
            typeof canonical === 'string' &&
            (this.compactText(canonical) === vBrandComp || this.normalizeText(canonical) === vBrandNorm) &&
            (normPrompt.includes(normAlias) || compactPrompt.includes(compAlias))
          ) {
            brandInPrompt = true;
            break;
          }
        }
      }
      if (brandInPrompt) {
        matchedBrandOnlyMap.set(v.id, v);
      }
    }
    const brandMatches = Array.from(matchedBrandOnlyMap.values());
    if (brandMatches.length === 1) {
      return { query: brandMatches[0].brand, matches: brandMatches, exactMatch: brandMatches[0], isAmbiguous: false, matchType: 'BRAND_ONLY' };
    } else if (brandMatches.length > 1) {
      return { query: cleanPrompt, matches: brandMatches, isAmbiguous: true, matchType: 'BRAND_ONLY' };
    }

    return { query: cleanPrompt, matches: [], isAmbiguous: false, matchType: 'NONE' };
  },

  /**
   * Strict customer search based on exact ID, full name, company, email, VAT ID, or unique surname tokens.
   * If multiple customers match, marks isAmbiguous = true and requires user disambiguation.
   */
  searchCustomers(query: string, customers: Customer[]): StrictCustomerSearchResult {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) {
      return { query: '', matches: [], isAmbiguous: false, matchType: 'NONE' };
    }
    const lowerQuery = cleanQuery.toLowerCase();

    // 1. Exact ID
    const exactIdMatch = customers.filter(c => (c.id || '').toLowerCase() === lowerQuery);
    if (exactIdMatch.length === 1) {
      return { query: cleanQuery, matches: exactIdMatch, exactMatch: exactIdMatch[0], isAmbiguous: false, matchType: 'EXACT_ID' };
    }

    // 2. Exact Name or Company Name
    const exactNameMatches = customers.filter(c => {
      const cName = (c.name || '').toLowerCase();
      const cComp = (c.companyName || '').toLowerCase();
      return cName === lowerQuery || (cComp && cComp === lowerQuery);
    });
    if (exactNameMatches.length === 1) {
      return { query: cleanQuery, matches: exactNameMatches, exactMatch: exactNameMatches[0], isAmbiguous: false, matchType: 'EXACT_NAME' };
    } else if (exactNameMatches.length > 1) {
      return { query: cleanQuery, matches: exactNameMatches, isAmbiguous: true, matchType: 'EXACT_NAME' };
    }

    // 3. Exact Email or VAT ID / Tax number
    const exactIdentifierMatches = customers.filter(c => {
      const cEmail = (c.email || '').toLowerCase();
      const cVat = (c.vatId || '').toLowerCase().replace(/[\s\-_]/g, '');
      const cTax = (c.taxNumber || '').toLowerCase().replace(/[\s\-_/]/g, '');
      const cleanLower = lowerQuery.replace(/[\s\-_/]/g, '');

      return cEmail === lowerQuery || (cVat && cVat === cleanLower) || (cTax && cTax === cleanLower);
    });
    if (exactIdentifierMatches.length === 1) {
      return { query: cleanQuery, matches: exactIdentifierMatches, exactMatch: exactIdentifierMatches[0], isAmbiguous: false, matchType: 'EXACT_EMAIL' };
    } else if (exactIdentifierMatches.length > 1) {
      return { query: cleanQuery, matches: exactIdentifierMatches, isAmbiguous: true, matchType: 'EXACT_EMAIL' };
    }

    // 4. Token-level Strict Match (Surname / Distinct Name Component, e.g. "Weber", "Müller")
    const queryTokens = this.extractCustomerNameTokens(cleanQuery);
    if (queryTokens.length > 0) {
      const tokenMatches = customers.filter(c => {
        const cTokens = [...this.extractCustomerNameTokens(c.name), ...this.extractCustomerNameTokens(c.companyName || '')];
        return queryTokens.every(qTok => cTokens.some(cTok => cTok === qTok || (cTok.length > 4 && cTok.startsWith(qTok))));
      });

      if (tokenMatches.length === 1) {
        return { query: cleanQuery, matches: tokenMatches, exactMatch: tokenMatches[0], isAmbiguous: false, matchType: 'UNIQUE_SURNAME' };
      } else if (tokenMatches.length > 1) {
        return { query: cleanQuery, matches: tokenMatches, isAmbiguous: true, matchType: 'UNIQUE_SURNAME' };
      }
    }

    return { query: cleanQuery, matches: [], isAmbiguous: false, matchType: 'NONE' };
  },

  /**
   * Strictly extracts customers mentioned in a conversational prompt.
   */
  extractCustomersFromPrompt(prompt: string, customers: Customer[]): StrictCustomerSearchResult {
    const cleanPrompt = (prompt || '').trim();
    if (!cleanPrompt) {
      return { query: '', matches: [], isAmbiguous: false, matchType: 'NONE' };
    }
    const lowerPrompt = cleanPrompt.toLowerCase();

    // 1. Direct Full Name or Company Name contained in prompt
    const fullMatches = customers.filter(c => {
      const cName = (c.name || '').toLowerCase();
      const cComp = (c.companyName || '').toLowerCase();
      return (cName.length >= 4 && lowerPrompt.includes(cName)) ||
             (cComp.length >= 4 && lowerPrompt.includes(cComp));
    });

    if (fullMatches.length === 1) {
      return { query: fullMatches[0].name, matches: fullMatches, exactMatch: fullMatches[0], isAmbiguous: false, matchType: 'EXACT_NAME' };
    } else if (fullMatches.length > 1) {
      return { query: cleanPrompt, matches: fullMatches, isAmbiguous: true, matchType: 'EXACT_NAME' };
    }

    // 2. Surnames and Distinct Name Tokens (e.g. "Weber", "Müller")
    const STOP_WORDS = new Set([
      'rechnung', 'vertrag', 'kaufvertrag', 'angebot', 'probefahrt', 'uebergabeprotokoll', 'übergabeprotokoll',
      'kauf', 'verkauf', 'kunde', 'kunden', 'fahrzeug', 'auto', 'wagen', 'bestand', 'kasse', 'bar', 'bank',
      'erstellen', 'öffnen', 'drucken', 'senden', 'export', 'datev', 'xml', 'pdf', 'suche', 'suchen', 'bitte',
      'heute', 'euro', 'betrag', 'anzahlung', 'zahlung', 'firma', 'herr', 'frau', 'dr', 'prof', 'vom', 'von',
      'für', 'fuer', 'mit', 'und', 'den', 'dem', 'der', 'die', 'das', 'ein', 'eine', 'einen', 'einem', 'einer',
      'zeig', 'zeige', 'finde', 'finden', 'öffne'
    ]);

    const promptTokens = lowerPrompt
      .replace(/[.,\-_/\\():;!?\"'„“]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 3 && !STOP_WORDS.has(t));

    const matchedCustomersMap = new Map<string, Customer>();
    let matchedQueryTerm = '';

    for (const c of customers) {
      const cTokens = [...this.extractCustomerNameTokens(c.name), ...this.extractCustomerNameTokens(c.companyName || '')];
      for (const cTok of cTokens) {
        if (cTok.length >= 3 && !STOP_WORDS.has(cTok)) {
          if (promptTokens.includes(cTok)) {
            matchedCustomersMap.set(c.id, c);
            matchedQueryTerm = cTok.charAt(0).toUpperCase() + cTok.slice(1);
            break;
          }
        }
      }
    }

    const tokenMatches = Array.from(matchedCustomersMap.values());
    if (tokenMatches.length === 1) {
      return { query: matchedQueryTerm || tokenMatches[0].name, matches: tokenMatches, exactMatch: tokenMatches[0], isAmbiguous: false, matchType: 'UNIQUE_SURNAME' };
    } else if (tokenMatches.length > 1) {
      return { query: matchedQueryTerm || cleanPrompt, matches: tokenMatches, isAmbiguous: true, matchType: 'UNIQUE_SURNAME' };
    }

    return { query: cleanPrompt, matches: [], isAmbiguous: false, matchType: 'NONE' };
  },

  /**
   * Helper to format a Date into YYYY-MM-DD
   */
  formatIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  /**
   * Helper to format a Date into DD.MM.YYYY
   */
  formatDeDate(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = d.getFullYear();
    return `${day}.${m}.${y}`;
  },

  /**
   * Parses standard or European dates (DD.MM.YYYY or YYYY-MM-DD) into Date object
   */
  parseComparableDate(dateStr?: string): Date | null {
    if (!dateStr) return null;
    const s = dateStr.trim();
    const deMatch = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (deMatch) {
      return new Date(parseInt(deMatch[3], 10), parseInt(deMatch[2], 10) - 1, parseInt(deMatch[1], 10));
    }
    const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  },

  /**
   * Parses temporal and financial context strictly distinguishing dates, relative periods,
   * model years, and monetary amounts in Arabic, German, and English.
   */
  parseTemporalAndFinancialContext(cleanPrompt: string) {
    const lowerPrompt = cleanPrompt.toLowerCase();
    const now = new Date();

    // 1. TEMPORAL PARSING
    let periodKey: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year' | 'custom' | 'year' | 'month' | 'all' = 'all';
    let dateFrom: string | undefined;
    let dateTo: string | undefined;
    let exactDate: string | undefined;
    let isExplicitDate = false;
    let labelAr = '';
    let labelDe = '';
    let labelEn = '';
    const timeTokens: string[] = [];

    // Explicit date ranges: e.g. "vom 01.05.2026 bis 31.05.2026", "من 01.01.2025 إلى 31.12.2025"
    const rangeMatch = cleanPrompt.match(/(?:vom|von|ab|من|from)\s*(\d{1,2}\.\d{1,2}\.\d{4}|\d{4}-\d{2}-\d{2})\s*(?:bis|und|إلى|الي|حتى|to|-)\s*(\d{1,2}\.\d{1,2}\.\d{4}|\d{4}-\d{2}-\d{2})/i);
    if (rangeMatch) {
      const d1 = this.parseComparableDate(rangeMatch[1]);
      const d2 = this.parseComparableDate(rangeMatch[2]);
      if (d1 && d2) {
        periodKey = 'custom';
        dateFrom = this.formatIsoDate(d1);
        dateTo = this.formatIsoDate(d2);
        isExplicitDate = true;
        labelAr = `من ${this.formatDeDate(d1)} إلى ${this.formatDeDate(d2)}`;
        labelDe = `Vom ${this.formatDeDate(d1)} bis ${this.formatDeDate(d2)}`;
        labelEn = `From ${this.formatDeDate(d1)} to ${this.formatDeDate(d2)}`;
      }
    }

    // Explicit single date: e.g. "30.08.2026" or "2026-08-30"
    if (!dateFrom) {
      const singleDateMatch = cleanPrompt.match(/\b(\d{1,2}\.\d{1,2}\.\d{4}|\d{4}-\d{2}-\d{2})\b/);
      if (singleDateMatch) {
        const parsed = this.parseComparableDate(singleDateMatch[1]);
        if (parsed) {
          exactDate = this.formatIsoDate(parsed);
          dateFrom = exactDate;
          dateTo = exactDate;
          periodKey = 'custom';
          isExplicitDate = true;
          labelAr = `بتاريخ ${this.formatDeDate(parsed)}`;
          labelDe = `Am ${this.formatDeDate(parsed)}`;
          labelEn = `On ${this.formatDeDate(parsed)}`;
        }
      }
    }

    // Relative periods
    if (!isExplicitDate) {
      if (lowerPrompt.includes('heute') || lowerPrompt.includes('today') || lowerPrompt.includes('اليوم') || lowerPrompt.includes('هذا اليوم')) {
        periodKey = 'today';
        dateFrom = this.formatIsoDate(now);
        dateTo = this.formatIsoDate(now);
        exactDate = dateFrom;
        isExplicitDate = true;
        labelAr = `اليوم (${this.formatDeDate(now)})`;
        labelDe = `Heute (${this.formatDeDate(now)})`;
        labelEn = `Today (${this.formatDeDate(now)})`;
      } else if (lowerPrompt.includes('gestern') || lowerPrompt.includes('yesterday') || lowerPrompt.includes('البارحة') || lowerPrompt.includes('أمس') || lowerPrompt.includes('امس')) {
        const yDate = new Date(now);
        yDate.setDate(now.getDate() - 1);
        periodKey = 'yesterday';
        dateFrom = this.formatIsoDate(yDate);
        dateTo = this.formatIsoDate(yDate);
        exactDate = dateFrom;
        isExplicitDate = true;
        labelAr = `البارحة (${this.formatDeDate(yDate)})`;
        labelDe = `Gestern (${this.formatDeDate(yDate)})`;
        labelEn = `Yesterday (${this.formatDeDate(yDate)})`;
      } else if (
        lowerPrompt.includes('letzte woche') ||
        lowerPrompt.includes('letzten woche') ||
        lowerPrompt.includes('vorige woche') ||
        lowerPrompt.includes('last week') ||
        lowerPrompt.includes('الاسبوع الماضي') ||
        lowerPrompt.includes('الأسبوع الماضي') ||
        lowerPrompt.includes('الاسبوع السابق') ||
        lowerPrompt.includes('الأسبوع السابق')
      ) {
        // Last week: Monday to Sunday of previous week
        const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
        const distToPrevMonday = (currentDay === 0 ? 6 : currentDay - 1) + 7;
        const lastMon = new Date(now);
        lastMon.setDate(now.getDate() - distToPrevMonday);
        const lastSun = new Date(lastMon);
        lastSun.setDate(lastMon.getDate() + 6);

        periodKey = 'last_week';
        dateFrom = this.formatIsoDate(lastMon);
        dateTo = this.formatIsoDate(lastSun);
        isExplicitDate = true;
        labelAr = `الأسبوع الماضي (${this.formatDeDate(lastMon)} - ${this.formatDeDate(lastSun)})`;
        labelDe = `Letzte Woche (${this.formatDeDate(lastMon)} - ${this.formatDeDate(lastSun)})`;
        labelEn = `Last Week (${this.formatDeDate(lastMon)} - ${this.formatDeDate(lastSun)})`;
      } else if (
        lowerPrompt.includes('diese woche') ||
        lowerPrompt.includes('dieser woche') ||
        lowerPrompt.includes('aktuelle woche') ||
        lowerPrompt.includes('this week') ||
        lowerPrompt.includes('هذا الاسبوع') ||
        lowerPrompt.includes('هذا الأسبوع') ||
        lowerPrompt.includes('الاسبوع الحالي') ||
        lowerPrompt.includes('الأسبوع الحالي')
      ) {
        // Current week: Monday to Sunday
        const currentDay = now.getDay();
        const distToMon = currentDay === 0 ? 6 : currentDay - 1;
        const thisMon = new Date(now);
        thisMon.setDate(now.getDate() - distToMon);
        const thisSun = new Date(thisMon);
        thisSun.setDate(thisMon.getDate() + 6);

        periodKey = 'this_week';
        dateFrom = this.formatIsoDate(thisMon);
        dateTo = this.formatIsoDate(thisSun);
        isExplicitDate = true;
        labelAr = `هذا الأسبوع (${this.formatDeDate(thisMon)} - ${this.formatDeDate(thisSun)})`;
        labelDe = `Diese Woche (${this.formatDeDate(thisMon)} - ${this.formatDeDate(thisSun)})`;
        labelEn = `This Week (${this.formatDeDate(thisMon)} - ${this.formatDeDate(thisSun)})`;
      } else if (
        lowerPrompt.includes('letzten monat') ||
        lowerPrompt.includes('letzter monat') ||
        lowerPrompt.includes('vorigen monat') ||
        lowerPrompt.includes('last month') ||
        lowerPrompt.includes('الشهر الماضي') ||
        lowerPrompt.includes('الشهر السابق') ||
        lowerPrompt.includes('الشهر المنصرم')
      ) {
        // Last month: 1st day to last day of previous month
        const prevMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const prevMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const startLastMonth = new Date(prevMonthYear, prevMonthIdx, 1);
        const endLastMonth = new Date(prevMonthYear, prevMonthIdx + 1, 0);

        periodKey = 'last_month';
        dateFrom = this.formatIsoDate(startLastMonth);
        dateTo = this.formatIsoDate(endLastMonth);
        isExplicitDate = true;
        labelAr = `الشهر الماضي (${this.formatDeDate(startLastMonth)} - ${this.formatDeDate(endLastMonth)})`;
        labelDe = `Letzter Monat (${this.formatDeDate(startLastMonth)} - ${this.formatDeDate(endLastMonth)})`;
        labelEn = `Last Month (${this.formatDeDate(startLastMonth)} - ${this.formatDeDate(endLastMonth)})`;
      } else if (
        lowerPrompt.includes('diesen monat') ||
        lowerPrompt.includes('dieser monat') ||
        lowerPrompt.includes('aktueller monat') ||
        lowerPrompt.includes('this month') ||
        lowerPrompt.includes('هذا الشهر') ||
        lowerPrompt.includes('الشهر الحالي') ||
        lowerPrompt.includes('الشهر الجاري')
      ) {
        const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        periodKey = 'this_month';
        dateFrom = this.formatIsoDate(startThisMonth);
        dateTo = this.formatIsoDate(endThisMonth);
        isExplicitDate = true;
        labelAr = `هذا الشهر (${this.formatDeDate(startThisMonth)} - ${this.formatDeDate(endThisMonth)})`;
        labelDe = `Dieser Monat (${this.formatDeDate(startThisMonth)} - ${this.formatDeDate(endThisMonth)})`;
        labelEn = `This Month (${this.formatDeDate(startThisMonth)} - ${this.formatDeDate(endThisMonth)})`;
      } else if (
        lowerPrompt.includes('letztes jahr') ||
        lowerPrompt.includes('letztem jahr') ||
        lowerPrompt.includes('voriges jahr') ||
        lowerPrompt.includes('last year') ||
        lowerPrompt.includes('السنة الماضية') ||
        lowerPrompt.includes('العام الماضي') ||
        lowerPrompt.includes('السنة السابقة') ||
        lowerPrompt.includes('العام السابق')
      ) {
        const prevYear = now.getFullYear() - 1;
        const startLastYear = new Date(prevYear, 0, 1);
        const endLastYear = new Date(prevYear, 11, 31);

        periodKey = 'last_year';
        dateFrom = this.formatIsoDate(startLastYear);
        dateTo = this.formatIsoDate(endLastYear);
        isExplicitDate = true;
        labelAr = `العام الماضي (${prevYear})`;
        labelDe = `Letztes Jahr (${prevYear})`;
        labelEn = `Last Year (${prevYear})`;
      } else if (
        lowerPrompt.includes('dieses jahr') ||
        lowerPrompt.includes('diesem jahr') ||
        lowerPrompt.includes('aktuelles jahr') ||
        lowerPrompt.includes('this year') ||
        lowerPrompt.includes('هذه السنة') ||
        lowerPrompt.includes('هذا العام') ||
        lowerPrompt.includes('السنة الحالية') ||
        lowerPrompt.includes('العام الحالي')
      ) {
        const curYear = now.getFullYear();
        const startThisYear = new Date(curYear, 0, 1);
        const endThisYear = new Date(curYear, 11, 31);

        periodKey = 'this_year';
        dateFrom = this.formatIsoDate(startThisYear);
        dateTo = this.formatIsoDate(endThisYear);
        isExplicitDate = true;
        labelAr = `هذا العام (${curYear})`;
        labelDe = `Dieses Jahr (${curYear})`;
        labelEn = `This Year (${curYear})`;
      } else {
        // Specific Year: e.g. "im Jahr 2025", "عام 2024", "in 2023", "2025"
        const yearMatch = cleanPrompt.match(/(?:im\s*jahr|jahr|in|عام|سنة|year)?\s*\b(20[2-3][0-9])\b/i);
        if (yearMatch) {
          const matchedYear = parseInt(yearMatch[1], 10);
          // Ensure it's not a model like Peugeot 208 or Golf 2020 if vehicle context
          if (matchedYear >= 2020 && matchedYear <= 2035) {
            const startYear = new Date(matchedYear, 0, 1);
            const endYear = new Date(matchedYear, 11, 31);

            periodKey = 'year';
            dateFrom = this.formatIsoDate(startYear);
            dateTo = this.formatIsoDate(endYear);
            isExplicitDate = true;
            labelAr = `عام ${matchedYear}`;
            labelDe = `Jahr ${matchedYear}`;
            labelEn = `Year ${matchedYear}`;
          }
        }
      }
    }

    // 2. FINANCIAL AMOUNT & RANGE PARSING (Distinguished from years, model numbers, IDs)
    let exactAmount: number | undefined;
    let amountMin: number | undefined;
    let amountMax: number | undefined;
    let currency: string | undefined = '€';
    let hasFinancialIntent = false;

    // A: Amount range (e.g. "zwischen 5000 und 10000 €", "من 5000 الى 10000 يورو", "von 1000 bis 3000 Euro")
    const finRangeMatch = cleanPrompt.match(/(?:zwischen|von|من|between)\s*(\d{1,7}(?:[.,]\d{1,2})?)\s*(?:und|bis|إلى|الي|حتى|and|-)\s*(\d{1,7}(?:[.,]\d{1,2})?)\s*(?:€|euro|eur|\$|يورو|دولار)?/i);
    if (finRangeMatch) {
      const minVal = parseFloat(finRangeMatch[1].replace(',', '.'));
      const maxVal = parseFloat(finRangeMatch[2].replace(',', '.'));
      if (!isNaN(minVal) && !isNaN(maxVal)) {
        amountMin = Math.min(minVal, maxVal);
        amountMax = Math.max(minVal, maxVal);
        hasFinancialIntent = true;
      }
    }

    // B: Amount minimum bounds (e.g. "ab 5000 €", "mindestens 10.000", "mehr als 5000", "أكثر من 5000", "أكبر من 5000", "فوق 5000")
    if (!amountMin && !amountMax) {
      const minBoundMatch = cleanPrompt.match(/(?:ab|mindestens|mehr\s*als|über|ueber|größer\s*als|groesser\s*als|أكثر\s*من|أكبر\s*من|اكثر\s*من|اكبر\s*من|فوق|من|اعلى\s*من|أعلى\s*من|more\s*than|above|at\s*least)\s*[:=]?\s*(\d{1,7}(?:[.,]\d{1,2})?)\s*(?:€|euro|eur|\$|يورو|دولار)?/i);
      if (minBoundMatch) {
        const val = parseFloat(minBoundMatch[1].replace(',', '.'));
        // Ignore if it looks like a year (e.g. "ab 2024" is year, not amount, unless with currency)
        const hasCurr = /€|euro|eur|\$|يورو|دولار/i.test(minBoundMatch[0]);
        if (!isNaN(val) && (hasCurr || val < 1990 || val > 2040)) {
          amountMin = val;
          hasFinancialIntent = true;
        }
      }
    }

    // C: Amount maximum bounds (e.g. "bis 20.000 €", "maximal 1500", "unter 5000", "weniger als 3000", "أقل من 20000", "دون 5000", "حتى 20000")
    if (!amountMax) {
      const maxBoundMatch = cleanPrompt.match(/(?:bis|maximal|unter|weniger\s*als|kleiner\s*als|أقل\s*من|اقل\s*من|دون|حتى|less\s*than|below|under|up\s*to)\s*[:=]?\s*(\d{1,7}(?:[.,]\d{1,2})?)\s*(?:€|euro|eur|\$|يورو|دولار)?/i);
      if (maxBoundMatch) {
        const val = parseFloat(maxBoundMatch[1].replace(',', '.'));
        const hasCurr = /€|euro|eur|\$|يورو|دولار/i.test(maxBoundMatch[0]);
        if (!isNaN(val) && (hasCurr || val < 1990 || val > 2040)) {
          amountMax = val;
          hasFinancialIntent = true;
        }
      }
    }

    // D: Exact Amount (e.g. "500 €", "1500 Euro", "بقيمة 5000", "مبلغ 300", "preis: 12000")
    if (!amountMin && !amountMax) {
      const exactCurrMatch = cleanPrompt.match(/(\d{1,7}(?:[.,]\d{1,2})?)\s*(€|euro|eur|\$|يورو|دولار)/i);
      const exactKeywordMatch = cleanPrompt.match(/(?:betrag|summe|preis|kaufpreis|rechnungsbetrag|بقيمة|مبلغ|بمبلغ|قيمة|دفعة|دفع|ادفع|ادخال|اضف|اضافة|دفعات|تكلفة|مصاريف|سحب|ايداع|إيداع)\s*[:=]?\s*(\d{1,7}(?:[.,]\d{1,2})?)/i);
      
      if (exactCurrMatch) {
        const val = parseFloat(exactCurrMatch[1].replace(',', '.'));
        if (!isNaN(val) && val > 0) {
          exactAmount = val;
          hasFinancialIntent = true;
        }
      } else if (exactKeywordMatch) {
        const val = parseFloat(exactKeywordMatch[1].replace(',', '.'));
        if (!isNaN(val) && val > 0) {
          exactAmount = val;
          hasFinancialIntent = true;
        }
      } else {
        // Fallback: standalone number only if financial booking keywords exist in prompt
        const isBookingContext = 
          lowerPrompt.includes('kasse') || lowerPrompt.includes('kassenbuch') || lowerPrompt.includes('bank') ||
          lowerPrompt.includes('einnahme') || lowerPrompt.includes('ausgabe') || lowerPrompt.includes('buchen') ||
          lowerPrompt.includes('كاسة') || lowerPrompt.includes('إيراد') || lowerPrompt.includes('مصروف') ||
          lowerPrompt.includes('سحب') || lowerPrompt.includes('إيداع');

        if (isBookingContext) {
          const looseNumMatch = cleanPrompt.match(/\b(\d{2,7}(?:[.,]\d{1,2})?)\b/);
          if (looseNumMatch) {
            const val = parseFloat(looseNumMatch[1].replace(',', '.'));
            // Exclude 4-digit years (2020..2030) and postal codes
            if (!isNaN(val) && (val < 1990 || val > 2040) && val !== 10115) {
              exactAmount = val;
              hasFinancialIntent = true;
            }
          }
        }
      }
    }

    return {
      temporal: {
        periodKey,
        dateFrom,
        dateTo,
        exactDate,
        isExplicit: isExplicitDate,
        labelAr,
        labelDe,
        labelEn
      },
      financial: {
        exactAmount,
        amountMin,
        amountMax,
        currency,
        hasFinancialIntent
      }
    };
  },

  /**
   * Evaluates user prompt strictly against the 3 layers and compound workflows.
   * Disambiguates entities strictly whenever multiple candidates match.
   */
  evaluateCommand(
    prompt: string,
    state: {
      vehicles: Vehicle[];
      customers: Customer[];
      invoices: Invoice[];
    },
    options?: WorkflowLookupOptions
  ): WorkflowResolutionResult {
    const cleanPrompt = prompt.trim();
    const lowerPrompt = cleanPrompt.toLowerCase();
    const { vehicles = [], customers = [], invoices = [] } = state;

    // 1. Strict parsing of temporal and financial context
    const { temporal, financial } = this.parseTemporalAndFinancialContext(cleanPrompt);
    const extractedAmount: number | undefined = financial.exactAmount;
    const extractedDate: string = temporal.exactDate || temporal.dateFrom || new Date().toISOString().split('T')[0];
    const isDateDefaulted: boolean = !temporal.isExplicit;

    // Extract potential payment method (bar, kasse, نقدا, كاش, überweisung, تحويل)
    let extractedPaymentMethod = 'BARKASSE';
    let isAccountDefaulted = true;
    if (lowerPrompt.includes('überweisung') || lowerPrompt.includes('bank') || lowerPrompt.includes('تحويل') || lowerPrompt.includes('بنك') || lowerPrompt.includes('girokonto')) {
      extractedPaymentMethod = 'BANK_UEBERWEISUNG';
      isAccountDefaulted = false;
    } else if (lowerPrompt.includes('ec') || lowerPrompt.includes('karte') || lowerPrompt.includes('بطاقة') || lowerPrompt.includes('kartenzahlung')) {
      extractedPaymentMethod = 'EC_KARTE';
      isAccountDefaulted = false;
    } else if (lowerPrompt.includes('bar') || lowerPrompt.includes('kasse') || lowerPrompt.includes('barkasse') || lowerPrompt.includes('كاش') || lowerPrompt.includes('نقدا') || lowerPrompt.includes('كاسة')) {
      extractedPaymentMethod = 'BARKASSE';
      isAccountDefaulted = false;
    }

    // Strict entity identification using deterministic token and identifier matching
    const vehicleSearchResult = this.extractVehiclesFromPrompt(cleanPrompt, vehicles);
    const customerSearchResult = this.extractCustomersFromPrompt(cleanPrompt, customers);

    const matchedVehicle: Vehicle | undefined = vehicleSearchResult.exactMatch;
    const matchedVehiclesList: Vehicle[] = vehicleSearchResult.matches;

    const matchedCustomer: Customer | undefined = customerSearchResult.exactMatch;
    const matchedCustomersList: Customer[] = customerSearchResult.matches;

    // -------------------------------------------------------------
    // 0. CONTEXT-AWARE INVOICE INTENT (Create Invoice vs. View/Archive)
    // -------------------------------------------------------------
    const lang = detectLanguage(prompt);

    const isInvoiceKeyword = 
      lowerPrompt.includes('rechnung') ||
      lowerPrompt.includes('faktura') ||
      lowerPrompt.includes('e-rechnung') ||
      lowerPrompt.includes('erechnung') ||
      lowerPrompt.includes('invoice') ||
      lowerPrompt.includes('فاتورة') ||
      lowerPrompt.includes('فواتير') ||
      lowerPrompt.includes('فاتوره');

    if (isInvoiceKeyword) {
      const isInvoiceCreationIntent = 
        lowerPrompt.includes('erstellen') ||
        lowerPrompt.includes('schreiben') ||
        lowerPrompt.includes('anlegen') ||
        lowerPrompt.includes('neu') ||
        lowerPrompt.includes('ausstellen') ||
        lowerPrompt.includes('generieren') ||
        lowerPrompt.includes('fakturieren') ||
        lowerPrompt.includes('create') ||
        lowerPrompt.includes('new') ||
        lowerPrompt.includes('generate') ||
        lowerPrompt.includes('انشاء') ||
        lowerPrompt.includes('إنشاء') ||
        lowerPrompt.includes('كتابة') ||
        lowerPrompt.includes('عمل') ||
        lowerPrompt.includes('اصدار') ||
        lowerPrompt.includes('إصدار') ||
        lowerPrompt.includes('جديدة') ||
        lowerPrompt.includes('جديد');

      if (isInvoiceCreationIntent) {
        // Determine specific document type
        let docType = 'handelsrechnung';
        let docTitle = 'Handelsrechnung (§25a / 19% MwSt)';
        let docTitleAr = 'فاتورة تجارية (§25a / 19% MwSt)';
        let docTitleEn = 'Commercial Invoice (§25a / 19% VAT)';
        if (lowerPrompt.includes('e-rechnung') || lowerPrompt.includes('erechnung') || lowerPrompt.includes('xml') || lowerPrompt.includes('zugferd') || lowerPrompt.includes('xrechnung') || lowerPrompt.includes('الكترونية')) {
          docType = 'e_rechnung';
          docTitle = 'E-Rechnung (EN16931 / ZUGFeRD)';
          docTitleAr = 'فاتورة إلكترونية (EN16931 / ZUGFeRD)';
          docTitleEn = 'E-Invoice (EN16931 / ZUGFeRD XML)';
        } else if (lowerPrompt.includes('eu export') || lowerPrompt.includes('eu-export') || lowerPrompt.includes('innergemeinschaftlich') || lowerPrompt.includes('تصدير اوروبي')) {
          docType = 'eu_export';
          docTitle = 'EU-Export Rechnung (Innergemeinschaftlich)';
          docTitleAr = 'فاتورة تصدير أوروبي (0% MwSt)';
          docTitleEn = 'EU-Export Invoice (Intra-Community)';
        } else if (lowerPrompt.includes('drittland') || lowerPrompt.includes('export drittland') || lowerPrompt.includes('تصدير دولي') || lowerPrompt.includes('تصدير خارجي')) {
          docType = 'export_drittland';
          docTitle = 'Ausfuhr-Rechnung (Drittland-Export)';
          docTitleAr = 'فاتورة تصدير خارج الاتحاد الأوروبي';
          docTitleEn = 'Export Invoice (Third Country Netto)';
        }

        const vehName = matchedVehicle ? `${matchedVehicle.brand} ${matchedVehicle.model}` : undefined;
        const custName = matchedCustomer ? matchedCustomer.name : undefined;
        const activeDocTitle = lang === 'ar' ? docTitleAr : (lang === 'en' ? docTitleEn : docTitle);

        let invoiceReply = '';
        if (lang === 'ar') {
          invoiceReply = `🧾 **الطبقة 1 (إنشاء فاتورة في مركز المستندات):**\n\nتم فتح وحدة إنشاء الفواتير (**${activeDocTitle}**).\n\n` +
            (vehName ? `• **السيارة:** ${vehName} (رقم الهيكل: \`${matchedVehicle?.vin || 'غير محدد'}\`)\n` : '') +
            (custName ? `• **العميل:** ${custName}\n` : '') +
            (extractedAmount ? `• **مبلغ الفاتورة:** ${extractedAmount.toLocaleString('de-DE')} €\n` : '') +
            `\n*كافة الخيارات الضريبية (§25a Differenzbesteuerung، 19% Regelbesteuerung، تصدير معفى) جاهزة للتعبئة فوراً.*`;
        } else if (lang === 'en') {
          invoiceReply = `🧾 **Layer 1 (Invoice Creation in Document Center):**\n\nOpened the invoice creation module (**${activeDocTitle}**).\n\n` +
            (vehName ? `• **Vehicle:** ${vehName} (VIN: \`${matchedVehicle?.vin || 'N/A'}\`)\n` : '') +
            (custName ? `• **Customer:** ${custName}\n` : '') +
            (extractedAmount ? `• **Invoice Amount:** ${extractedAmount.toLocaleString('de-DE')} €\n` : '') +
            `\n*All tax options (§25a differential taxation, 19% standard VAT, zero-rated export) are ready to be filled.*`;
        } else {
          invoiceReply = `🧾 **Schicht 1 (Rechnungs-Erstellung im Dokumenten-Zentrum):**\n\nIch habe für Sie das Rechnungsmodul (**${docTitle}**) in Schicht 1 aufgerufen.\n\n` +
            (vehName ? `• **Fahrzeug:** ${vehName} (FIN: \`${matchedVehicle?.vin || 'k.A.'}\`)\n` : '') +
            (custName ? `• **Kunde:** ${custName}\n` : '') +
            (extractedAmount ? `• **Rechnungsbetrag:** ${extractedAmount.toLocaleString('de-DE')} €\n` : '') +
            `\n*Alle steuerlichen Optionen (§25a Differenzbesteuerung, 19% Regelbesteuerung, Netto-Export) sind sofort ausfüllbar.*`;
        }

        return {
          matched: true,
          layer: 'LAYER_1_NAVIGATION_MACRO',
          targetTab: 'operationen',
          disambiguationRequired: false,
          preFillData: {
            documentType: docType.toUpperCase() as any,
            vehicle: matchedVehicle,
            customer: matchedCustomer,
            amount: extractedAmount
          },
          matchedVehicles: matchedVehicle ? [matchedVehicle] : [],
          matchedCustomers: matchedCustomer ? [matchedCustomer] : [],
          replyText: invoiceReply,
          interactiveActions: [
            {
              id: 'act_open_invoice_editor',
              type: 'open_operations',
              label: lang === 'ar' ? `🧾 إنشاء ${activeDocTitle} الآن` : (lang === 'en' ? `🧾 Create ${activeDocTitle} Now` : `🧾 ${docTitle} jetzt erstellen`),
              sublabel: vehName && custName ? `${vehName} ➔ ${custName}` : (vehName || custName || (lang === 'ar' ? 'فتح في العمليات' : 'In Schicht 1 öffnen')),
              badge: lang === 'ar' ? 'مركز المستندات' : (lang === 'en' ? 'Document Center' : 'Dokumenten-Zentrum'),
              docType: docType as any,
              vehicleId: matchedVehicle?.id,
              customerId: matchedCustomer?.id
            }
          ]
        };
      } else {
        // VIEW / ARCHIVE / SEARCH INVOICE INTENT
        // 1. Detect requested status filter
        let requestedStatusFilter: string | undefined;
        if (
          lowerPrompt.includes('offen') ||
          lowerPrompt.includes('unbezahlt') ||
          lowerPrompt.includes('nicht bezahlt') ||
          lowerPrompt.includes('ausstehend') ||
          lowerPrompt.includes('غير مدفوع') ||
          lowerPrompt.includes('غير مسدد') ||
          lowerPrompt.includes('مفتوح') ||
          lowerPrompt.includes('معلق') ||
          lowerPrompt.includes('unpaid') ||
          lowerPrompt.includes('pending')
        ) {
          requestedStatusFilter = 'offen';
        } else if (
          lowerPrompt.includes('bezahlt') ||
          lowerPrompt.includes('voll bezahlt') ||
          lowerPrompt.includes('abgeschlossen') ||
          lowerPrompt.includes('مدفوع') ||
          lowerPrompt.includes('مسدد') ||
          lowerPrompt.includes('paid')
        ) {
          requestedStatusFilter = 'bezahlt';
        } else if (
          lowerPrompt.includes('teilbezahlt') ||
          lowerPrompt.includes('جزئي') ||
          lowerPrompt.includes('partially paid')
        ) {
          requestedStatusFilter = 'teilbezahlt';
        } else if (
          lowerPrompt.includes('storniert') ||
          lowerPrompt.includes('storno') ||
          lowerPrompt.includes('ملغ') ||
          lowerPrompt.includes('cancelled')
        ) {
          requestedStatusFilter = 'storniert';
        }

        // 2. Detect requested type / category filter
        let requestedTypeFilter: string | undefined;
        if (
          lowerPrompt.includes('eu export') ||
          lowerPrompt.includes('eu-export') ||
          lowerPrompt.includes('innergemeinschaftlich') ||
          lowerPrompt.includes('تصدير اوروبي') ||
          lowerPrompt.includes('تصدير أوروبي')
        ) {
          requestedTypeFilter = 'eu_export';
        } else if (
          lowerPrompt.includes('drittland') ||
          lowerPrompt.includes('ausfuhr') ||
          lowerPrompt.includes('تصدير دولي') ||
          lowerPrompt.includes('خارج الاتحاد')
        ) {
          requestedTypeFilter = 'export_drittland';
        } else if (
          lowerPrompt.includes('gutschrift') ||
          lowerPrompt.includes('اشعار دائن') ||
          lowerPrompt.includes('إشعار دائن')
        ) {
          requestedTypeFilter = 'gutschrift';
        } else if (
          lowerPrompt.includes('e-rechnung') ||
          lowerPrompt.includes('erechnung') ||
          lowerPrompt.includes('xrechnung') ||
          lowerPrompt.includes('zugferd') ||
          lowerPrompt.includes('الكتروني')
        ) {
          requestedTypeFilter = 'e_rechnung';
        }

        // 3. Extract search tokens (excluding generic stopwords, articles, months and temporal/financial keywords)
        const INVOICE_STOPWORDS = new Set([
          'rechnung', 'rechnungen', 'faktura', 'invoice', 'invoices', 'فاتورة', 'فواتير', 'فاتوره',
          'suche', 'suchen', 'finde', 'finden', 'zeige', 'zeig', 'öffne', 'abrufen', 'search', 'find', 'show', 'open',
          'ابحث', 'بحث', 'اعرض', 'عرض', 'افتح', 'فتح', 'هات', 'عن', 'في', 'من', 'كل', 'جميع', 'إلى', 'الى', 'بين', 'حتى',
          'alle', 'aller', 'all', 'liste', 'قائمة', 'list', 'archive', 'archiv', 'أرشيف', 'ارشيف',
          'offen', 'offene', 'offenen', 'bezahlt', 'bezahlte', 'bezahlten', 'unbezahlt', 'غير', 'مدفوعة', 'مدفوع', 'مفتوحة', 'مفتوح',
          'bitte', 'please', 'فضلك', 'سمحت',
          'heute', 'gestern', 'morgen', 'woche', 'monat', 'jahr', 'اليوم', 'امس', 'البارحة', 'الأسبوع', 'الاسبوع', 'الشهر', 'السنة', 'العام',
          'letzte', 'letzten', 'letzter', 'diese', 'diesen', 'diesem', 'الماضي', 'الحالي', 'السابق', 'الجاري', 'الماضية', 'الحالية',
          'euro', 'eur', 'betrag', 'summe', 'مبلغ', 'بقيمة', 'يورو', 'دولار', 'أكثر', 'أقل', 'اكثر', 'اقل', 'فوق', 'تحت',
          'mir', 'dir', 'die', 'der', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'einen', 'einem', 'und', 'oder', 'zwischen', 'zwichen', 'von', 'bis', 'ab', 'seit', 'mit',
          'januar', 'februar', 'märz', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember',
          'يناير', 'فبراير', 'مارس', 'أبريل', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'اغسطس', 'سبتمبر', 'أكتوبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'
        ]);

        const promptTokens = lowerPrompt
          .replace(/[.,\-_/\\():;!?\"'„“]/g, ' ')
          .split(/\s+/)
          .filter(t => t.length >= 2 && !INVOICE_STOPWORDS.has(t) && isNaN(Number(t)));

        // 4. Perform comprehensive multi-criteria filtering (Date Range + Amount Bounds + Status/Type + Search Query)
        const matchedInvoicesList = invoices.filter(inv => {
          // Status filter match
          if (requestedStatusFilter && inv.status !== requestedStatusFilter) {
            return false;
          }

          // Type filter match
          if (requestedTypeFilter) {
            const cat = (inv.invoiceCategory || inv.documentType || '').toLowerCase();
            if (!cat.includes(requestedTypeFilter)) {
              return false;
            }
          }

          // Date filtering (Temporal bounds)
          if (temporal.dateFrom || temporal.dateTo) {
            const invDateObj = this.parseComparableDate(inv.date);
            if (invDateObj) {
              if (temporal.dateFrom) {
                const fromObj = this.parseComparableDate(temporal.dateFrom);
                if (fromObj && invDateObj < fromObj) return false;
              }
              if (temporal.dateTo) {
                const toObj = this.parseComparableDate(temporal.dateTo);
                if (toObj) {
                  // End of day
                  const endOfDay = new Date(toObj);
                  endOfDay.setHours(23, 59, 59, 999);
                  if (invDateObj > endOfDay) return false;
                }
              }
            }
          }

          // Amount bounds filtering
          const invGross = Number(inv.amountGross) || 0;
          if (financial.exactAmount !== undefined) {
            if (Math.abs(invGross - financial.exactAmount) > 1.0) {
              return false;
            }
          }
          if (financial.amountMin !== undefined && invGross < financial.amountMin) {
            return false;
          }
          if (financial.amountMax !== undefined && invGross > financial.amountMax) {
            return false;
          }

          // Text search tokens
          if (promptTokens.length === 0) {
            return true;
          }

          const invNum = (inv.invoiceNumber || '').toLowerCase();
          const cust = (inv.customerName || '').toLowerCase();
          const veh = (inv.vehicleTitle || '').toLowerCase();
          const vin = (inv.vin || '').toLowerCase();

          return promptTokens.some(tok => 
            invNum.includes(tok) ||
            cust.includes(tok) ||
            veh.includes(tok) ||
            vin.includes(tok)
          );
        }).sort((a, b) => {
          // Sort latest first (most recent date / invoice number)
          const dateComp = (b.date || '').localeCompare(a.date || '');
          if (dateComp !== 0) return dateComp;
          return (b.invoiceNumber || '').localeCompare(a.invoiceNumber || '');
        });

        const activeSearchQuery = promptTokens.join(' ');
        const latestInvoice = matchedInvoicesList.length > 0 ? matchedInvoicesList[0] : undefined;

        // Build localized filter summary details
        const filterCriteriaList: string[] = [];
        if (requestedStatusFilter) {
          filterCriteriaList.push(lang === 'ar' ? `الحالة: **${requestedStatusFilter === 'offen' ? 'مفتوحة / غير مسددة' : (requestedStatusFilter === 'bezahlt' ? 'مدفوعة' : requestedStatusFilter)}**` : `Status: **${requestedStatusFilter}**`);
        }
        if (requestedTypeFilter) {
          filterCriteriaList.push(lang === 'ar' ? `النوع: **${requestedTypeFilter}**` : `Typ: **${requestedTypeFilter}**`);
        }
        if (temporal.labelAr || temporal.labelDe) {
          filterCriteriaList.push(lang === 'ar' ? `الفترة الزمنية: **${temporal.labelAr}**` : `Zeitraum: **${temporal.labelDe}**`);
        }
        if (financial.exactAmount !== undefined) {
          filterCriteriaList.push(lang === 'ar' ? `المبلغ المحدد: **${financial.exactAmount.toLocaleString('de-DE')} €**` : `Betrag: **${financial.exactAmount.toLocaleString('de-DE')} €**`);
        } else if (financial.amountMin !== undefined || financial.amountMax !== undefined) {
          const rangeText = (financial.amountMin !== undefined && financial.amountMax !== undefined)
            ? `${financial.amountMin.toLocaleString('de-DE')} € - ${financial.amountMax.toLocaleString('de-DE')} €`
            : (financial.amountMin !== undefined ? `من ${financial.amountMin.toLocaleString('de-DE')} €` : `حتى ${financial.amountMax?.toLocaleString('de-DE')} €`);
          filterCriteriaList.push(lang === 'ar' ? `نطاق المبالغ: **${rangeText}**` : `Betragsbereich: **${rangeText}**`);
        }
        if (activeSearchQuery) {
          filterCriteriaList.push(lang === 'ar' ? `كلمة البحث: \`${activeSearchQuery}\`` : `Suchbegriff: „${activeSearchQuery}“`);
        }

        if (matchedInvoicesList.length === 1) {
          const singleInv = matchedInvoicesList[0];
          let singleInvReply = '';
          if (lang === 'ar') {
            singleInvReply = `📄 **تم العثور على الفاتورة (#${singleInv.invoiceNumber}):**\n\n` +
              `• **العميل:** ${singleInv.customerName || 'غير محدد'}\n` +
              `• **السيارة:** ${singleInv.vehicleTitle || 'غير محدد'} (الهيكل: \`${singleInv.vin ? '...' + singleInv.vin.slice(-7) : 'غير محدد'}\`)\n` +
              `• **المبلغ الإجمالي:** ${(singleInv.amountGross || 0).toLocaleString('de-DE')} €\n` +
              `• **الحالة:** ${singleInv.status === 'bezahlt' ? '✅ مدفوعة' : (singleInv.status === 'offen' ? '⏳ مفتوحة / غير مسددة' : singleInv.status)}\n` +
              `• **التاريخ:** ${singleInv.date || 'غير محدد'}\n` +
              (filterCriteriaList.length > 0 ? `\n📌 **معايير الفلترة المطبقة:**\n• ` + filterCriteriaList.join('\n• ') + `\n` : '') +
              `\n*يقوم ماكس بفتح الفاتورة مباشرة في أرشيف الفواتير.*`;
          } else if (lang === 'en') {
            singleInvReply = `📄 **Invoice Found (#${singleInv.invoiceNumber}):**\n\n` +
              `• **Customer:** ${singleInv.customerName || 'N/A'}\n` +
              `• **Vehicle:** ${singleInv.vehicleTitle || 'N/A'} (VIN: \`${singleInv.vin ? '...' + singleInv.vin.slice(-7) : 'N/A'}\`)\n` +
              `• **Gross Amount:** ${(singleInv.amountGross || 0).toLocaleString('de-DE')} €\n` +
              `• **Status:** ${singleInv.status}\n` +
              `• **Date:** ${singleInv.date || 'N/A'}\n` +
              (filterCriteriaList.length > 0 ? `\n📌 **Applied Filters:**\n• ` + filterCriteriaList.join('\n• ') + `\n` : '') +
              `\n*Max opens the invoice directly in the invoice archive.*`;
          } else {
            singleInvReply = `📄 **Rechnung gefunden (#${singleInv.invoiceNumber}):**\n\n` +
              `• **Kunde:** ${singleInv.customerName || 'k.A.'}\n` +
              `• **Fahrzeug:** ${singleInv.vehicleTitle || 'k.A.'} (FIN: \`${singleInv.vin ? '...' + singleInv.vin.slice(-7) : 'k.A.'}\`)\n` +
              `• **Gesamtbetrag:** ${(singleInv.amountGross || 0).toLocaleString('de-DE')} €\n` +
              `• **Status:** ${singleInv.status === 'bezahlt' ? '✅ Bezahlt' : (singleInv.status === 'offen' ? '⏳ Offen' : singleInv.status)}\n` +
              `• **Datum:** ${singleInv.date || 'k.A.'}\n` +
              (filterCriteriaList.length > 0 ? `\n📌 **Angewendete Filterkriterien:**\n• ` + filterCriteriaList.join('\n• ') + `\n` : '') +
              `\n*Max öffnet die Rechnung direkt im Rechnungsarchiv in Schicht 1.*`;
          }

          return {
            matched: true,
            layer: 'LAYER_1_NAVIGATION_MACRO',
            targetTab: 'rechnungen',
            disambiguationRequired: false,
            preFillData: { 
              invoice: singleInv as any,
              searchQuery: activeSearchQuery || singleInv.invoiceNumber,
              statusFilter: requestedStatusFilter,
              typeFilter: requestedTypeFilter,
              timeFilter: temporal.periodKey !== 'all' ? temporal.periodKey : undefined,
              dateFrom: temporal.dateFrom,
              dateTo: temporal.dateTo,
              amountMin: financial.amountMin,
              amountMax: financial.amountMax,
              exactAmount: financial.exactAmount
            },
            extractedSearchTerm: singleInv.invoiceNumber,
            replyText: singleInvReply,
            interactiveActions: [
              {
                id: `act_preview_inv_${singleInv.id}`,
                type: 'open_rechnungen',
                label: lang === 'ar' ? `📄 معاينة الفاتورة #${singleInv.invoiceNumber}` : (lang === 'en' ? `📄 View Invoice #${singleInv.invoiceNumber}` : `📄 Rechnung #${singleInv.invoiceNumber} ansehen`),
                sublabel: `${singleInv.customerName || ''} • ${(singleInv.amountGross || 0).toLocaleString('de-DE')} €`,
                badge: lang === 'ar' ? 'أحدث نتيجة' : (lang === 'en' ? 'Latest Result' : 'Neuestes Ergebnis'),
                invoiceId: singleInv.id,
                searchQuery: activeSearchQuery || singleInv.invoiceNumber,
                filterStatus: requestedStatusFilter,
                filterType: requestedTypeFilter,
                dateFrom: temporal.dateFrom,
                dateTo: temporal.dateTo,
                amountMin: financial.amountMin,
                amountMax: financial.amountMax
              },
              {
                id: `act_pay_inv_direct_${singleInv.id}`,
                type: 'open_rechnungen',
                label: lang === 'ar' ? `💰 تسجيل دفعة / سداد الفاتورة` : (lang === 'en' ? `💰 Record Payment` : `💰 Zahlung buchen`),
                sublabel: `${singleInv.invoiceNumber} • ${singleInv.status}`,
                badge: lang === 'ar' ? 'سداد' : (lang === 'en' ? 'Payment' : 'Zahlung'),
                invoiceId: singleInv.id,
                amount: singleInv.amountGross
              }
            ]
          };
        } else if (matchedInvoicesList.length > 1) {
          const totalGrossSum = matchedInvoicesList.reduce((sum, inv) => sum + (Number(inv.amountGross) || 0), 0);
          
          let listSummary = matchedInvoicesList.slice(0, 5).map((inv, idx) => {
            const statusBadge = inv.status === 'bezahlt' ? '✅' : (inv.status === 'offen' ? '⏳' : '⚠️');
            const isLatest = idx === 0 ? (lang === 'ar' ? ' 🌟 [الأحدث]' : ' 🌟 [Neueste]') : '';
            return `${idx + 1}. **#${inv.invoiceNumber}**${isLatest} — ${inv.customerName || 'Kunde'} | ${(inv.amountGross || 0).toLocaleString('de-DE')} € (${statusBadge} ${inv.status} • ${inv.date || 'k.A.'})`;
          }).join('\n');

          if (matchedInvoicesList.length > 5) {
            listSummary += `\n*...و ${matchedInvoicesList.length - 5} فواتير إضافية في القائمة المفلترة.*`;
          }

          let multiInvReply = '';
          if (lang === 'ar') {
            multiInvReply = `📚 **تم فرز وعرض ${matchedInvoicesList.length} فواتير مطابقة:**\n\n` +
              `• **إجمالي المبالغ المفلترة:** **${totalGrossSum.toLocaleString('de-DE')} €**\n` +
              `• **أحدث فاتورة مسجلة:** **#${latestInvoice?.invoiceNumber}** (${latestInvoice?.customerName} • ${(latestInvoice?.amountGross || 0).toLocaleString('de-DE')} €)\n` +
              (filterCriteriaList.length > 0 ? `• **الفلاتر المطبقة:** ${filterCriteriaList.join(' | ')}\n` : '') +
              `\n${listSummary}\n\n` +
              `*يقوم ماكس بفتح أرشيف الفواتير وتطبيق الفلترة الحازمة وفتح آخر فاتورة تلقائياً.*`;
          } else if (lang === 'en') {
            multiInvReply = `📚 **Filtered ${matchedInvoicesList.length} Matching Invoices:**\n\n` +
              `• **Total Sum:** **${totalGrossSum.toLocaleString('de-DE')} €**\n` +
              `• **Latest Invoice:** **#${latestInvoice?.invoiceNumber}** (${latestInvoice?.customerName} • ${(latestInvoice?.amountGross || 0).toLocaleString('de-DE')} €)\n` +
              (filterCriteriaList.length > 0 ? `• **Applied Filters:** ${filterCriteriaList.join(' | ')}\n` : '') +
              `\n${listSummary}\n\n` +
              `*Max opens the filtered invoice archive and selects the latest available invoice.*`;
          } else {
            multiInvReply = `📚 **${matchedInvoicesList.length} passende Rechnungen gefiltert:**\n\n` +
              `• **Gesamtsumme:** **${totalGrossSum.toLocaleString('de-DE')} €**\n` +
              `• **Neueste Rechnung:** **#${latestInvoice?.invoiceNumber}** (${latestInvoice?.customerName} • ${(latestInvoice?.amountGross || 0).toLocaleString('de-DE')} €)\n` +
              (filterCriteriaList.length > 0 ? `• **Angewendete Filter:** ${filterCriteriaList.join(' | ')}\n` : '') +
              `\n${listSummary}\n\n` +
              `*Max öffnet das Rechnungsarchiv mit strikten Filterkriterien und markiert die neueste Rechnung.*`;
          }

          const invoiceActions: ChatInteractiveAction[] = [
            ...(latestInvoice ? [{
              id: `act_open_latest_inv_${latestInvoice.id}`,
              type: 'open_rechnungen' as const,
              label: lang === 'ar' ? `🌟 فتح أحدث فاتورة (#${latestInvoice.invoiceNumber})` : (lang === 'en' ? `🌟 Open Latest Invoice (#${latestInvoice.invoiceNumber})` : `🌟 Neueste Rechnung (#${latestInvoice.invoiceNumber}) öffnen`),
              sublabel: `${latestInvoice.customerName || ''} • ${(latestInvoice.amountGross || 0).toLocaleString('de-DE')} € • ${latestInvoice.date}`,
              badge: lang === 'ar' ? 'الأحدث' : (lang === 'en' ? 'Latest' : 'Neueste'),
              invoiceId: latestInvoice.id,
              searchQuery: activeSearchQuery,
              filterStatus: requestedStatusFilter,
              filterType: requestedTypeFilter,
              dateFrom: temporal.dateFrom,
              dateTo: temporal.dateTo,
              amountMin: financial.amountMin,
              amountMax: financial.amountMax
            }] : []),
            {
              id: 'act_open_filtered_invoices_view',
              type: 'open_rechnungen',
              label: lang === 'ar' ? `📚 عرض قائمة الفواتير المفلترة (${matchedInvoicesList.length})` : (lang === 'en' ? `📚 View Filtered Invoices (${matchedInvoicesList.length})` : `📚 Gefilterte Rechnungsliste öffnen (${matchedInvoicesList.length})`),
              sublabel: `${totalGrossSum.toLocaleString('de-DE')} € ${lang === 'ar' ? 'إجمالي' : 'Gesamt'}`,
              badge: lang === 'ar' ? 'قائمة الفواتير' : (lang === 'en' ? 'Invoice List' : 'Rechnungsliste'),
              searchQuery: activeSearchQuery,
              filterStatus: requestedStatusFilter,
              filterType: requestedTypeFilter,
              dateFrom: temporal.dateFrom,
              dateTo: temporal.dateTo,
              amountMin: financial.amountMin,
              amountMax: financial.amountMax
            },
            ...matchedInvoicesList.slice(1, 4).map(inv => ({
              id: `act_sel_inv_${inv.id}`,
              type: 'open_rechnungen' as const,
              label: `📄 #${inv.invoiceNumber} — ${inv.customerName || (lang === 'ar' ? 'العميل' : 'Kunde')}`,
              sublabel: `${inv.vehicleTitle || ''} • ${(inv.amountGross || 0).toLocaleString('de-DE')} € (${inv.status}) • ${inv.date || ''}`,
              badge: lang === 'ar' ? 'فتح' : (lang === 'en' ? 'Open' : 'Öffnen'),
              invoiceId: inv.id,
              searchQuery: activeSearchQuery,
              filterStatus: requestedStatusFilter,
              filterType: requestedTypeFilter,
              dateFrom: temporal.dateFrom,
              dateTo: temporal.dateTo,
              amountMin: financial.amountMin,
              amountMax: financial.amountMax
            }))
          ];

          return {
            matched: true,
            layer: 'LAYER_1_NAVIGATION_MACRO',
            targetTab: 'rechnungen',
            disambiguationRequired: true,
            preFillData: {
              invoice: latestInvoice as any,
              searchQuery: activeSearchQuery,
              statusFilter: requestedStatusFilter,
              typeFilter: requestedTypeFilter,
              timeFilter: temporal.periodKey !== 'all' ? temporal.periodKey : undefined,
              dateFrom: temporal.dateFrom,
              dateTo: temporal.dateTo,
              amountMin: financial.amountMin,
              amountMax: financial.amountMax,
              exactAmount: financial.exactAmount
            },
            extractedSearchTerm: activeSearchQuery,
            replyText: multiInvReply,
            interactiveActions: invoiceActions
          };
        } else {
          // 0 Matches
          let noInvReply = '';
          if (lang === 'ar') {
            noInvReply = `📚 **أرشيف الفواتير:** لم يتم العثور على فواتير مطابقة ` +
              (filterCriteriaList.length > 0 ? `بالمعايير المحددة (${filterCriteriaList.join('، ')})` : '') +
              `.\n\nأفتح لك أرشيف الفواتير العام لمعاينة كامل الفواتير أو إنشاء فاتورة جديدة.`;
          } else if (lang === 'en') {
            noInvReply = `📚 **Invoice Archive:** No invoices found matching ` +
              (filterCriteriaList.length > 0 ? `criteria (${filterCriteriaList.join(', ')})` : '') +
              `.\n\nOpening the general invoice archive for full review.`;
          } else {
            noInvReply = `📚 **Rechnungsarchiv:** Keine Rechnungen gefunden für ` +
              (filterCriteriaList.length > 0 ? `die Kriterien (${filterCriteriaList.join(', ')})` : '') +
              `.\n\nIch öffne das Rechnungsarchiv für Sie.`;
          }

          return {
            matched: true,
            layer: 'LAYER_1_NAVIGATION_MACRO',
            targetTab: 'rechnungen',
            disambiguationRequired: false,
            preFillData: {
              searchQuery: activeSearchQuery,
              statusFilter: requestedStatusFilter,
              typeFilter: requestedTypeFilter
            },
            extractedSearchTerm: activeSearchQuery,
            replyText: noInvReply,
            interactiveActions: [
              {
                id: 'act_open_rechnungen_tab',
                type: 'open_rechnungen',
                label: lang === 'ar' ? '📚 فتح أرشيف الفواتير' : (lang === 'en' ? '📚 Open Invoice Archive' : '📚 Rechnungsarchiv öffnen'),
                badge: lang === 'ar' ? 'أرشيف' : (lang === 'en' ? 'Archive' : 'Archiv'),
                searchQuery: activeSearchQuery,
                filterStatus: requestedStatusFilter,
                filterType: requestedTypeFilter
              },
              {
                id: 'act_create_new_inv',
                type: 'open_operations',
                label: lang === 'ar' ? '🧾 إنشاء فاتورة جديدة' : (lang === 'en' ? '🧾 Create New Invoice' : '🧾 Neue Rechnung anlegen'),
                badge: lang === 'ar' ? 'إنشاء' : (lang === 'en' ? 'Create' : 'Neu'),
                docType: 'rechnung'
              }
            ]
          };
        }
      }
    }

    // -------------------------------------------------------------
    // 0A. CONTEXT-AWARE PAYMENT & FINANCIAL ROUTING
    // (Customer Invoice Payment vs. Vehicle Expense vs. Sold Vehicle Payment vs. General Cashbook/Bank)
    // -------------------------------------------------------------
    const hasExplicitAmount = extractedAmount !== undefined && extractedAmount > 0;
    const isPaymentOrExpenseKeyword = 
      lowerPrompt.includes('دفعة') ||
      lowerPrompt.includes('دفع') ||
      lowerPrompt.includes('مصاري') ||
      lowerPrompt.includes('مصروف') ||
      lowerPrompt.includes('مصاريف') ||
      lowerPrompt.includes('تكلفة') ||
      lowerPrompt.includes('كاسة') ||
      lowerPrompt.includes('كاش') ||
      lowerPrompt.includes('نقدا') ||
      lowerPrompt.includes('تحويل') ||
      lowerPrompt.includes('سداد') ||
      lowerPrompt.includes('تسديد') ||
      lowerPrompt.includes('إيداع') ||
      lowerPrompt.includes('ايداع') ||
      lowerPrompt.includes('سحب') ||
      lowerPrompt.includes('قيمة') ||
      lowerPrompt.includes('مبلغ') ||
      lowerPrompt.includes('zahlung') ||
      lowerPrompt.includes('anzahlung') ||
      lowerPrompt.includes('teilzahlung') ||
      lowerPrompt.includes('restzahlung') ||
      lowerPrompt.includes('ausgabe') ||
      lowerPrompt.includes('kosten') ||
      lowerPrompt.includes('nebenkosten') ||
      lowerPrompt.includes('einzahlung') ||
      lowerPrompt.includes('abhebung') ||
      lowerPrompt.includes('kasse') ||
      lowerPrompt.includes('kassenbuch') ||
      lowerPrompt.includes('überweisung') ||
      lowerPrompt.includes('einnahme') ||
      lowerPrompt.includes('reparatur') ||
      lowerPrompt.includes('aufbereitung') ||
      lowerPrompt.includes('tüv') ||
      lowerPrompt.includes('tanken');

    const isExplicitDocCreationIntent = 
      (lowerPrompt.includes('kaufvertrag') && (lowerPrompt.includes('erstellen') || lowerPrompt.includes('anlegen') || lowerPrompt.includes('انشئ') || lowerPrompt.includes('عمل'))) ||
      (lowerPrompt.includes('angebot') && (lowerPrompt.includes('erstellen') || lowerPrompt.includes('schreiben') || lowerPrompt.includes('عرض سعر'))) ||
      (lowerPrompt.includes('probefahrt') && (lowerPrompt.includes('erstellen') || lowerPrompt.includes('vereinbaren') || lowerPrompt.includes('تجربة قيادة'))) ||
      (lowerPrompt.includes('übergabe') && (lowerPrompt.includes('erstellen') || lowerPrompt.includes('تسليم')));

    if ((hasExplicitAmount || isPaymentOrExpenseKeyword) && !isExplicitDocCreationIntent) {
      const dateFormattedDe = extractedDate && extractedDate.includes('-') 
        ? `${extractedDate.split('-')[2]}.${extractedDate.split('-')[1]}.${extractedDate.split('-')[0]}` 
        : (extractedDate || new Date().toLocaleDateString('de-DE'));

      const paymentMethodLabel = extractedPaymentMethod === 'BANK_UEBERWEISUNG' 
        ? 'Banküberweisung' 
        : (extractedPaymentMethod === 'EC_KARTE' ? 'Kartenzahlung' : 'Barzahlung');

      const accountTypeLabel = extractedPaymentMethod === 'BANK_UEBERWEISUNG' ? 'Bankkonto' : 'Barkasse';

      // =========================================================================
      // CASE 1: Customer is mentioned -> Route to Customer's Invoice Payment
      // =========================================================================
      if (matchedCustomer || customerSearchResult.matches.length > 0) {
        if (customerSearchResult.isAmbiguous) {
          const custActions: ChatInteractiveAction[] = customerSearchResult.matches.map(c => ({
            id: `act_sel_cust_pay_${c.id}`,
            type: 'open_rechnungen',
            label: `👤 ${c.name}`,
            sublabel: lang === 'ar' ? `تسجيل دفعة لهذا العميل` : (lang === 'en' ? `Record payment for this customer` : `Zahlung für diesen Kunden verbuchen`),
            badge: lang === 'ar' ? 'اختيار العميل' : (lang === 'en' ? 'Select Customer' : 'Kunde wählen'),
            customerId: c.id,
            customerName: c.name,
            amount: extractedAmount,
            date: dateFormattedDe,
            paymentMethod: paymentMethodLabel
          }));

          let ambigCustReply = '';
          if (lang === 'ar') {
            ambigCustReply = `👤 **تسجيل دفعة: يلزم اختيار العميل**\n\nتم العثور على **${customerSearchResult.matches.length} عملاء** باسم "${customerSearchResult.query}". لأي عميل ترغب بتسجيل الدفعة؟`;
          } else if (lang === 'en') {
            ambigCustReply = `👤 **Payment Recording: Customer Selection Required**\n\nFound **${customerSearchResult.matches.length} customers** named "${customerSearchResult.query}". For which customer should the payment be recorded?`;
          } else {
            ambigCustReply = `👤 **Zahlungserfassung: Kundenauswahl erforderlich**\n\nEs wurden **${customerSearchResult.matches.length} Kunden** mit dem Namen „${customerSearchResult.query}“ gefunden. Für welchen Kunden soll die Zahlung erfasst werden?`;
          }

          return {
            matched: true,
            layer: 'LAYER_2_ENTITY_FORMS',
            targetTab: 'rechnungen',
            disambiguationRequired: true,
            matchedCustomers: customerSearchResult.matches,
            replyText: ambigCustReply,
            interactiveActions: custActions
          };
        }

        const targetCust = matchedCustomer || customerSearchResult.matches[0];
        const custInvoices = invoices.filter(inv => 
          (inv.customerId && inv.customerId === targetCust.id) ||
          (inv.customerName && inv.customerName.toLowerCase().includes(targetCust.name.toLowerCase())) ||
          (targetCust.name.toLowerCase().includes((inv.customerName || '').toLowerCase()))
        );

        if (custInvoices.length === 1) {
          const targetInv = custInvoices[0];
          const gross = Number(targetInv.amountGross) || 0;
          const paid = Number(targetInv.amountPaid) || 0;
          const remaining = Math.max(0, gross - paid);
          const bookingAmount = extractedAmount !== undefined ? extractedAmount : (remaining > 0 ? remaining : gross);

          let custPayReply = '';
          if (lang === 'ar') {
            custPayReply = `💰 **تسجيل دفعة من فاتورة العميل (${targetCust.name}):**\n\n` +
              `تم العثور على الفاتورة رقم **#${targetInv.invoiceNumber}** المرتبطة بالعميل (السيارة: **${targetInv.vehicleTitle || 'غير محدد'}**).\n\n` +
              `• **إجمالي الفاتورة:** ${gross.toLocaleString('de-DE')} € | **المسدد سابقاً:** ${paid.toLocaleString('de-DE')} € | **المتبقي:** ${remaining.toLocaleString('de-DE')} €\n` +
              `• **المبلغ المطلوب تسجيله:** **${bookingAmount.toLocaleString('de-DE')} €**\n` +
              `• **التاريخ:** ${dateFormattedDe} ${isDateDefaulted ? '*(افتراضي: اليوم)*' : ''}\n` +
              `• **طريقة الدفع / الحساب:** ${paymentMethodLabel} (${accountTypeLabel}) ${isAccountDefaulted ? '*(افتراضي: كاش / كاسة)*' : ''}\n\n` +
              `*تم فتح أرشيف الفواتير وتجهيز نافذة تسجيل الدفعة مع تعبئة كافة الحقول المتوفرة.*`;
          } else if (lang === 'en') {
            custPayReply = `💰 **Customer Invoice Payment (${targetCust.name}):**\n\n` +
              `Invoice **#${targetInv.invoiceNumber}** found for this customer (Vehicle: **${targetInv.vehicleTitle || 'N/A'}**).\n\n` +
              `• **Invoice Total:** ${gross.toLocaleString('de-DE')} € | **Paid So Far:** ${paid.toLocaleString('de-DE')} € | **Outstanding:** ${remaining.toLocaleString('de-DE')} €\n` +
              `• **Amount to Record:** **${bookingAmount.toLocaleString('de-DE')} €**\n` +
              `• **Date:** ${dateFormattedDe}\n` +
              `• **Payment Method:** ${paymentMethodLabel} (${accountTypeLabel})\n\n` +
              `*Invoice archive opened and payment recording dialog prepared with all fields pre-filled.*`;
          } else {
            custPayReply = `💰 **Zahlungseingang für Kundenrechnung (${targetCust.name}):**\n\n` +
              `Rechnung **#${targetInv.invoiceNumber}** gefunden (Fahrzeug: **${targetInv.vehicleTitle || 'k.A.'}**).\n\n` +
              `• **Gesamtbetrag:** ${gross.toLocaleString('de-DE')} € | **Bereits bezahlt:** ${paid.toLocaleString('de-DE')} € | **Offener Betrag:** ${remaining.toLocaleString('de-DE')} €\n` +
              `• **Zu buchender Betrag:** **${bookingAmount.toLocaleString('de-DE')} €**\n` +
              `• **Datum:** ${dateFormattedDe} ${isDateDefaulted ? '*(Standard: Heute)*' : ''}\n` +
              `• **Zahlungsweg:** ${paymentMethodLabel} (${accountTypeLabel}) ${isAccountDefaulted ? '*(Standard: Kasse)*' : ''}\n\n` +
              `*Das Rechnungsarchiv wurde geöffnet und das Zahlungsfenster mit allen Angaben vorbereitet.*`;
          }

          return {
            matched: true,
            layer: 'LAYER_2_ENTITY_FORMS',
            targetTab: 'rechnungen',
            disambiguationRequired: false,
            preFillData: {
              invoice: targetInv,
              amount: bookingAmount,
              date: dateFormattedDe,
              paymentMethod: paymentMethodLabel,
              customer: targetCust
            },
            matchedCustomers: [targetCust],
            replyText: custPayReply,
            interactiveActions: [
              {
                id: `act_pay_invoice_${targetInv.id}`,
                type: 'open_rechnungen',
                label: lang === 'ar' ? `💰 تسجيل دفعة ${bookingAmount.toLocaleString('de-DE')} € للفاتورة #${targetInv.invoiceNumber}` : (lang === 'en' ? `💰 Record ${bookingAmount.toLocaleString('de-DE')} € for Invoice #${targetInv.invoiceNumber}` : `💰 Zahlung ${bookingAmount.toLocaleString('de-DE')} € für Rechnung #${targetInv.invoiceNumber} erfassen`),
                sublabel: `${targetCust.name} • ${targetInv.vehicleTitle || ''} • ${paymentMethodLabel}`,
                badge: lang === 'ar' ? 'سداد فاتورة' : (lang === 'en' ? 'Invoice Settlement' : 'Rechnungsausgleich'),
                invoiceId: targetInv.id,
                amount: bookingAmount,
                date: dateFormattedDe,
                paymentMethod: paymentMethodLabel
              }
            ]
          };
        } else if (custInvoices.length > 1) {
          const invActions: ChatInteractiveAction[] = custInvoices.map(inv => {
            const gr = Number(inv.amountGross) || 0;
            const pd = Number(inv.amountPaid) || 0;
            const rem = Math.max(0, gr - pd);
            return {
              id: `act_pay_inv_sel_${inv.id}`,
              type: 'open_rechnungen',
              label: `📄 #${inv.invoiceNumber} — ${inv.vehicleTitle || 'Fahrzeug'} (${lang === 'ar' ? 'المتبقي' : (lang === 'en' ? 'Open' : 'Offen')}: ${rem.toLocaleString('de-DE')} €)`,
              sublabel: `${lang === 'ar' ? 'الإجمالي' : (lang === 'en' ? 'Total' : 'Gesamt')}: ${gr.toLocaleString('de-DE')} € • ${inv.status}`,
              badge: rem === 0 ? (lang === 'ar' ? 'مسددة' : (lang === 'en' ? 'Paid' : 'Bezahlt')) : (lang === 'ar' ? 'رصيد متبقي' : (lang === 'en' ? 'Open Balance' : 'Offener Saldo')),
              invoiceId: inv.id,
              amount: extractedAmount !== undefined ? extractedAmount : rem,
              date: dateFormattedDe,
              paymentMethod: paymentMethodLabel
            };
          });

          let multiCustInvReply = '';
          if (lang === 'ar') {
            multiCustInvReply = `💰 **تم العثور على عدة فواتير للعميل ${targetCust.name} (${custInvoices.length} فواتير):**\n\nعلى أي فاتورة ترغب في تسجيل دفعة بمبلغ **${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'المبلغ'}**؟`;
          } else if (lang === 'en') {
            multiCustInvReply = `💰 **Multiple Invoices Found for ${targetCust.name} (${custInvoices.length} invoices):**\n\nWhich invoice should the payment of **${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'the amount'}** be booked against?`;
          } else {
            multiCustInvReply = `💰 **Mehrere Rechnungen für ${targetCust.name} gefunden (${custInvoices.length} Rechnungen):**\n\nAuf welche Rechnung soll die Zahlung von **${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'der Betrag'}** verbucht werden?`;
          }

          return {
            matched: true,
            layer: 'LAYER_2_ENTITY_FORMS',
            targetTab: 'rechnungen',
            disambiguationRequired: true,
            matchedCustomers: [targetCust],
            replyText: multiCustInvReply,
            interactiveActions: invActions
          };
        } else {
          // No invoice found for this customer -> Option to create invoice in Operationen or book in Finanzen
          let noInvReply = '';
          if (lang === 'ar') {
            noInvReply = `💼 **تسجيل دفعة للعميل ${targetCust.name}:**\n\nلا توجد فاتورة جاهزة في الأرشيف للعميل **${targetCust.name}**. يمكن تسجيل المبلغ (${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'الدفعة'}) مباشرة كإيداع في الكاسة أو ربطه بفاتورة جديدة في مركز العمليات.`;
          } else if (lang === 'en') {
            noInvReply = `💼 **Payment Recording for ${targetCust.name}:**\n\nNo finished invoice found in the archive for customer **${targetCust.name}**. The amount (${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'payment'}) can be logged directly in the cashbook or linked with a new invoice in Operations.`;
          } else {
            noInvReply = `💼 **Zahlungserfassung für ${targetCust.name}:**\n\nFür den Kunden **${targetCust.name}** liegt noch keine fertige Rechnung im Archiv vor. Der Betrag (${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'Zahlung'}) kann direkt als Kundeneinzahlung im Kassenbuch gebucht oder im Dokumenten-Zentrum mit einer neuen Rechnung verknüpft werden.`;
          }

          return {
            matched: true,
            layer: 'LAYER_1_NAVIGATION_MACRO',
            targetTab: 'finanzen',
            disambiguationRequired: false,
            preFillData: {
              customer: targetCust,
              amount: extractedAmount,
              date: dateFormattedDe,
              paymentMethod: paymentMethodLabel
            },
            replyText: noInvReply,
            interactiveActions: [
              {
                id: `act_book_cust_kasse_${targetCust.id}`,
                type: 'open_finanzen',
                label: lang === 'ar' ? `💰 تسجيل ${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'دفعة'} للعميل ${targetCust.name} في الكاسة` : (lang === 'en' ? `💰 Record ${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'Payment'} for ${targetCust.name} in Cashbook` : `💰 ${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'Zahlung'} für ${targetCust.name} im Kassenbuch buchen`),
                badge: lang === 'ar' ? 'الكاسة' : (lang === 'en' ? 'Cashbook' : 'Kassenbuch'),
                amount: extractedAmount,
                date: extractedDate,
                account: extractedPaymentMethod === 'BANK_UEBERWEISUNG' ? 'Bank' : 'Kasse',
                financeType: 'income',
                category: 'Fahrzeuganzahlung',
                description: `Zahlung von ${targetCust.name}`
              },
              {
                id: `act_create_inv_cust_${targetCust.id}`,
                type: 'open_operations',
                label: lang === 'ar' ? `🧾 إنشاء فاتورة جديدة للعميل ${targetCust.name}` : (lang === 'en' ? `🧾 Create New Invoice for ${targetCust.name}` : `🧾 Neue Rechnung für ${targetCust.name} erstellen`),
                badge: lang === 'ar' ? 'العمليات' : (lang === 'en' ? 'Operations' : 'Operationen'),
                customerId: targetCust.id,
                customerName: targetCust.name,
                docType: 'rechnung'
              }
            ]
          };
        }
      }

      // =========================================================================
      // CASE 2: Vehicle is mentioned (and NO customer specified)
      // If Vehicle is SOLD -> Route to Invoice Payment
      // If Vehicle is IN STOCK -> Route to Vehicle Expense (Nebenkosten) in Vehicle Card (Layer 2)
      // =========================================================================
      if (matchedVehicle || vehicleSearchResult.matches.length > 0) {
        if (vehicleSearchResult.isAmbiguous) {
          const vehActions: ChatInteractiveAction[] = vehicleSearchResult.matches.map(v => ({
            id: `act_sel_veh_fin_${v.id}`,
            type: 'open_lager',
            label: `🚗 ${v.brand} ${v.model} (${(v.sellingPrice || 0).toLocaleString('de-DE')} €)`,
            sublabel: `${lang === 'ar' ? 'الحالة' : 'Status'}: ${v.status} • FIN: ${v.vin ? '...' + v.vin.slice(-6) : 'k.A.'}`,
            badge: v.status === 'sold' || v.status === 'verkauft' ? (lang === 'ar' ? 'مباعة' : (lang === 'en' ? 'Sold' : 'Verkauft')) : (lang === 'ar' ? 'في المخزن' : (lang === 'en' ? 'In Stock' : 'Lagerbestand')),
            vehicleId: v.id,
            amount: extractedAmount,
            date: dateFormattedDe,
            paymentMethod: paymentMethodLabel
          }));

          let ambigVehReply = '';
          if (lang === 'ar') {
            ambigVehReply = `🚗 **يلزم تحديد السيارة لتسجيل الحركة المالية:**\n\nتم العثور على **${vehicleSearchResult.matches.length} سيارات مطابقة**. لأي سيارة ترغب بتسجيل المبلغ (${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'دفعة / مصروف'})؟`;
          } else if (lang === 'en') {
            ambigVehReply = `🚗 **Vehicle Selection Required for Booking:**\n\nFound **${vehicleSearchResult.matches.length} matching vehicles**. For which vehicle should the amount (${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'payment/expense'}) be recorded?`;
          } else {
            ambigVehReply = `🚗 **Fahrzeugauswahl für Buchung erforderlich:**\n\nEs wurden **${vehicleSearchResult.matches.length} passende Fahrzeuge** gefunden. Für welches Fahrzeug soll der Betrag (${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'Zahlung/Ausgabe'}) erfasst werden?`;
          }

          return {
            matched: true,
            layer: 'LAYER_2_ENTITY_FORMS',
            targetTab: 'lager',
            disambiguationRequired: true,
            matchedVehicles: vehicleSearchResult.matches,
            replyText: ambigVehReply,
            interactiveActions: vehActions
          };
        }

        const targetVeh = matchedVehicle || vehicleSearchResult.matches[0];
        const isSold = targetVeh.status === 'sold' || targetVeh.status === 'verkauft';
        const matchingInv = invoices.find(inv => 
          (inv.vehicleId && inv.vehicleId === targetVeh.id) ||
          (inv.vin && targetVeh.vin && inv.vin.toLowerCase() === targetVeh.vin.toLowerCase())
        );

        // 2A: Vehicle is SOLD or has associated invoice -> Payment towards purchase price
        if (isSold || matchingInv) {
          if (matchingInv) {
            const gr = Number(matchingInv.amountGross) || 0;
            const pd = Number(matchingInv.amountPaid) || 0;
            const rem = Math.max(0, gr - pd);
            const bookingAmount = extractedAmount !== undefined ? extractedAmount : (rem > 0 ? rem : gr);

            let soldVehReply = '';
            if (lang === 'ar') {
              soldVehReply = `🚗 **دفعة من ثمن السيارة المباعة (${targetVeh.brand} ${targetVeh.model}):**\n\n` +
                `السيارة مسجلة كسيارة **مباعة (Verkauft)**. تم ربط الدفعة بالفاتورة رقم **#${matchingInv.invoiceNumber}** (المشتري: **${matchingInv.customerName || 'غير محدد'}**).\n\n` +
                `• **المبلغ المطلوب تسجيله:** **${bookingAmount.toLocaleString('de-DE')} €**\n` +
                `• **التاريخ:** ${dateFormattedDe} ${isDateDefaulted ? '*(افتراضي: اليوم)*' : ''}\n` +
                `• **الكونتو / طريقة الدفع:** ${paymentMethodLabel} (${accountTypeLabel}) ${isAccountDefaulted ? '*(افتراضي: كاش / كاسة)*' : ''}\n\n` +
                `*يتم فتح أرشيف الفواتير وتعبئة نافذة تسجيل الدفعة الخاصة بالفاتورة مباشرة.*`;
            } else if (lang === 'en') {
              soldVehReply = `🚗 **Payment for Sold Vehicle (${targetVeh.brand} ${targetVeh.model}):**\n\n` +
                `The vehicle is marked as **Sold**. Linked to invoice **#${matchingInv.invoiceNumber}** (Buyer: **${matchingInv.customerName || 'N/A'}**).\n\n` +
                `• **Amount to Record:** **${bookingAmount.toLocaleString('de-DE')} €**\n` +
                `• **Date:** ${dateFormattedDe}\n` +
                `• **Payment Method:** ${paymentMethodLabel} (${accountTypeLabel})\n\n` +
                `*Invoice archive opened and payment recording dialog initialized.*`;
            } else {
              soldVehReply = `🚗 **Zahlungseingang für verkauftes Fahrzeug (${targetVeh.brand} ${targetVeh.model}):**\n\n` +
                `Das Fahrzeug ist als **verkauft** markiert. Zahlung zugeordnet zu Rechnung **#${matchingInv.invoiceNumber}** (Käufer: **${matchingInv.customerName || 'k.A.'}**).\n\n` +
                `• **Zu buchender Betrag:** **${bookingAmount.toLocaleString('de-DE')} €**\n` +
                `• **Datum:** ${dateFormattedDe} ${isDateDefaulted ? '*(Standard: Heute)*' : ''}\n` +
                `• **Zahlungsweg:** ${paymentMethodLabel} (${accountTypeLabel}) ${isAccountDefaulted ? '*(Standard: Kasse)*' : ''}\n\n` +
                `*Das Rechnungsarchiv wird geöffnet und das Zahlungsfenster direkt vorbereitet.*`;
            }

            return {
              matched: true,
              layer: 'LAYER_2_ENTITY_FORMS',
              targetTab: 'rechnungen',
              disambiguationRequired: false,
              preFillData: {
                invoice: matchingInv,
                vehicle: targetVeh,
                amount: bookingAmount,
                date: dateFormattedDe,
                paymentMethod: paymentMethodLabel
              },
              matchedVehicles: [targetVeh],
              replyText: soldVehReply,
              interactiveActions: [
                {
                  id: `act_pay_veh_inv_${matchingInv.id}`,
                  type: 'open_rechnungen',
                  label: lang === 'ar' ? `💰 تسجيل دفعة ${bookingAmount.toLocaleString('de-DE')} € للفاتورة #${matchingInv.invoiceNumber}` : (lang === 'en' ? `💰 Record ${bookingAmount.toLocaleString('de-DE')} € for Invoice #${matchingInv.invoiceNumber}` : `💰 Zahlung ${bookingAmount.toLocaleString('de-DE')} € für Rechnung #${matchingInv.invoiceNumber} erfassen`),
                  sublabel: `${targetVeh.brand} ${targetVeh.model} • ${matchingInv.customerName || ''}`,
                  badge: lang === 'ar' ? 'سداد دفعة' : (lang === 'en' ? 'Payment Received' : 'Zahlungseingang'),
                  invoiceId: matchingInv.id,
                  amount: bookingAmount,
                  date: dateFormattedDe,
                  paymentMethod: paymentMethodLabel
                }
              ]
            };
          } else {
            // Sold car without invoice in archive -> Route to operations or finance deposit
            let soldNoInvReply = '';
            if (lang === 'ar') {
              soldNoInvReply = `🚗 **دفعة للسيارة المباعة (${targetVeh.brand} ${targetVeh.model}):**\n\nالسيارة مسجلة كـ **مباعة**، ولم يتم العثور على فاتورة مكتملة في الأرشيف بعد. يمكنك تسجيل الدفعة مباشرة في الكاسة أو إنشاء فاتورة بيع في مركز العمليات.`;
            } else if (lang === 'en') {
              soldNoInvReply = `🚗 **Payment for Sold Vehicle (${targetVeh.brand} ${targetVeh.model}):**\n\nVehicle is marked as **Sold**, but no invoice was found in archive. You can book the down payment directly in the cashbook or create a sales invoice in Operations.`;
            } else {
              soldNoInvReply = `🚗 **Anzahlung für verkauftes Fahrzeug (${targetVeh.brand} ${targetVeh.model}):**\n\nDas Fahrzeug ist als **verkauft** markiert, jedoch liegt noch keine fertige Rechnung im Archiv vor. Sie können die Anzahlung im Kassenbuch erfassen oder im Dokumenten-Zentrum eine Rechnung erstellen.`;
            }

            return {
              matched: true,
              layer: 'LAYER_1_NAVIGATION_MACRO',
              targetTab: 'finanzen',
              disambiguationRequired: false,
              matchedVehicles: [targetVeh],
              replyText: soldNoInvReply,
              interactiveActions: [
                {
                  id: `act_pay_sold_veh_fin_${targetVeh.id}`,
                  type: 'open_finanzen',
                  label: lang === 'ar' ? `💰 تسجيل ${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'دفعة مقدمة'} لـ ${targetVeh.brand} في الكاسة` : (lang === 'en' ? `💰 Record ${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'down payment'} for ${targetVeh.brand} in cashbook` : `💰 ${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : 'Anzahlung'} für ${targetVeh.brand} im Kassenbuch buchen`),
                  badge: lang === 'ar' ? 'الكاسة' : (lang === 'en' ? 'Cashbook' : 'Kassenbuch'),
                  amount: extractedAmount,
                  date: extractedDate,
                  account: extractedPaymentMethod === 'BANK_UEBERWEISUNG' ? 'Bank' : 'Kasse',
                  financeType: 'income',
                  category: 'Fahrzeuganzahlung',
                  description: `Anzahlung für ${targetVeh.brand} ${targetVeh.model}`
                },
                {
                  id: `act_create_inv_sold_veh_${targetVeh.id}`,
                  type: 'open_operations',
                  label: lang === 'ar' ? `🧾 إنشاء فاتورة لـ ${targetVeh.brand} ${targetVeh.model}` : (lang === 'en' ? `🧾 Create invoice for ${targetVeh.brand} ${targetVeh.model}` : `🧾 Rechnung für ${targetVeh.brand} ${targetVeh.model} erstellen`),
                  badge: lang === 'ar' ? 'العمليات' : (lang === 'en' ? 'Operations' : 'Operationen'),
                  vehicleId: targetVeh.id,
                  docType: 'rechnung'
                }
              ]
            };
          }
        }

        // 2B: Vehicle is IN STOCK (Not sold) -> Route to Vehicle Expense (Nebenkosten) in Vehicle Card (Layer 2)
        let expenseCategory = 'Sonstige Nebenkosten';
        if (lowerPrompt.includes('reinigung') || lowerPrompt.includes('aufbereitung') || lowerPrompt.includes('wäsche') || lowerPrompt.includes('غسيل') || lowerPrompt.includes('تنظيف')) {
          expenseCategory = 'Reinigung & Aufbereitung';
        } else if (lowerPrompt.includes('reparatur') || lowerPrompt.includes('instandsetzung') || lowerPrompt.includes('werkstatt') || lowerPrompt.includes('bremsen') || lowerPrompt.includes('service') || lowerPrompt.includes('öl') || lowerPrompt.includes('صيانة') || lowerPrompt.includes('تصليح') || lowerPrompt.includes('ميكانيك') || lowerPrompt.includes('قطع') || lowerPrompt.includes('زيت')) {
          expenseCategory = 'Reparatur & Instandsetzung';
        } else if (lowerPrompt.includes('transport') || lowerPrompt.includes('überführung') || lowerPrompt.includes('نقل') || lowerPrompt.includes('شحن') || lowerPrompt.includes('سطحة')) {
          expenseCategory = 'Transport & Überführung';
        } else if (lowerPrompt.includes('tüv') || lowerPrompt.includes('hu') || lowerPrompt.includes('au') || lowerPrompt.includes('gutachten') || lowerPrompt.includes('توف') || lowerPrompt.includes('فحص')) {
          expenseCategory = 'TÜV / HU & Gutachten';
        } else if (lowerPrompt.includes('lack') || lowerPrompt.includes('karosserie') || lowerPrompt.includes('دهان') || lowerPrompt.includes('بودي')) {
          expenseCategory = 'Lackierung & Karosserie';
        } else if (lowerPrompt.includes('zulassung') || lowerPrompt.includes('abmeldung') || lowerPrompt.includes('schilder') || lowerPrompt.includes('تسجيل') || lowerPrompt.includes('لوحات')) {
          expenseCategory = 'Zulassung & Abmeldung';
        } else if (lowerPrompt.includes('reifen') || lowerPrompt.includes('räder') || lowerPrompt.includes('عجلات') || lowerPrompt.includes('اطارات')) {
          expenseCategory = 'Ersatzteile & Reifen';
        }

        let inStockExpReply = '';
        if (lang === 'ar') {
          inStockExpReply = `🔧 **تسجيل مصاريف للسيارة (${targetVeh.brand} ${targetVeh.model}):**\n\n` +
            `السيارة متوفرة في المخزن (غير مباعة). تم توجيه المبلغ كـ **مصاريف سيارة (Nebenkosten)** تُسجل مباشرة في كرت السيارة بالطبقة الثانية وتُحسم من الأرباح:\n\n` +
            `• **نوع المصروف:** **${expenseCategory}**\n` +
            `• **المبلغ:** **${(extractedAmount || 0).toLocaleString('de-DE')} €**\n` +
            `• **التاريخ:** ${dateFormattedDe} ${isDateDefaulted ? '*(افتراضي: اليوم)*' : ''}\n` +
            `• **طريقة الدفع / الحساب:** ${paymentMethodLabel === 'Banküberweisung' ? 'Banküberweisung' : 'Bar / Barkasse'} ${isAccountDefaulted ? '*(افتراضي: كاش / كاسة)*' : ''}\n\n` +
            `*يتم فتح كرت السيارة في الطبقة الثانية تحت تبويب المصاريف (Nebenkosten) وفتح نافذة إضافة المصروف.*`;
        } else if (lang === 'en') {
          inStockExpReply = `🔧 **Vehicle Expense (${targetVeh.brand} ${targetVeh.model}):**\n\n` +
            `Vehicle is in stock (not sold). Routed as **vehicle additional cost (Nebenkosten)** directly into the Layer 2 Vehicle Card:\n\n` +
            `• **Expense Category:** **${expenseCategory}**\n` +
            `• **Amount:** **${(extractedAmount || 0).toLocaleString('de-DE')} €**\n` +
            `• **Date:** ${dateFormattedDe}\n` +
            `• **Payment Method:** ${paymentMethodLabel}\n\n` +
            `*Vehicle card opened in Layer 2 with Nebenkosten expense dialog ready.*`;
        } else {
          inStockExpReply = `🔧 **Fahrzeug-Nebenkosten erfassen (${targetVeh.brand} ${targetVeh.model}):**\n\n` +
            `Das Fahrzeug befindet sich im Lagerbestand. Der Betrag wird als **Nebenkosten** direkt in der Fahrzeugakte (Schicht 2) hinterlegt und schmälert den Fahrzeugertrag:\n\n` +
            `• **Kostenart:** **${expenseCategory}**\n` +
            `• **Betrag:** **${(extractedAmount || 0).toLocaleString('de-DE')} €**\n` +
            `• **Datum:** ${dateFormattedDe} ${isDateDefaulted ? '*(Standard: Heute)*' : ''}\n` +
            `• **Zahlungsweg:** ${paymentMethodLabel}\n\n` +
            `*Die Fahrzeugakte wird in Schicht 2 geöffnet und der Nebenkosten-Dialog sofort bereitgestellt.*`;
        }

        return {
          matched: true,
          layer: 'LAYER_2_ENTITY_FORMS',
          targetTab: 'lager',
          disambiguationRequired: false,
          preFillData: {
            vehicle: targetVeh,
            amount: extractedAmount,
            date: extractedDate,
            category: expenseCategory,
            paymentMethod: extractedPaymentMethod === 'BANK_UEBERWEISUNG' ? 'Banküberweisung' : 'Bar'
          },
          matchedVehicles: [targetVeh],
          replyText: inStockExpReply,
          interactiveActions: [
            {
              id: `act_add_veh_exp_${targetVeh.id}`,
              type: 'open_lager',
              label: lang === 'ar' ? `🔧 إضافة مصروف ${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : ''} لـ ${targetVeh.brand} ${targetVeh.model}` : (lang === 'en' ? `🔧 Add Expense ${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : ''} for ${targetVeh.brand} ${targetVeh.model}` : `🔧 Ausgabe ${extractedAmount ? extractedAmount.toLocaleString('de-DE') + ' €' : ''} für ${targetVeh.brand} erfassen`),
              sublabel: `${expenseCategory} • ${paymentMethodLabel === 'Banküberweisung' ? 'Bank' : 'Bar'}`,
              badge: lang === 'ar' ? 'مصاريف سيارة' : (lang === 'en' ? 'Vehicle Cost' : 'Fahrzeugkosten'),
              vehicleId: targetVeh.id,
              expenseCategory: expenseCategory,
              amount: extractedAmount,
              date: extractedDate,
              paymentMethod: extractedPaymentMethod === 'BANK_UEBERWEISUNG' ? 'Banküberweisung' : 'Bar'
            }
          ]
        };
      }

      // =========================================================================
      // CASE 3: General Cash / Bank / Finance (No Customer, No Vehicle)
      // =========================================================================
      // 3A: Search, Filter or Inquire Accounts / Financials (No explicit amount to book)
      if (!hasExplicitAmount) {
        // Detect target account filter
        let requestedAccount: 'Kasse' | 'Bank' | 'all' = 'all';
        if (lowerPrompt.includes('kasse') || lowerPrompt.includes('kassenbuch') || lowerPrompt.includes('bar') || lowerPrompt.includes('كاسة') || lowerPrompt.includes('كاش') || lowerPrompt.includes('نقدا')) {
          requestedAccount = 'Kasse';
        } else if (lowerPrompt.includes('bank') || lowerPrompt.includes('bankkonto') || lowerPrompt.includes('überweisung') || lowerPrompt.includes('konto') || lowerPrompt.includes('بنك') || lowerPrompt.includes('حساب بنكي') || lowerPrompt.includes('تحويل')) {
          requestedAccount = 'Bank';
        }

        // Detect financial type filter
        let requestedFinType: 'einnahme' | 'ausgabe' | 'transit' | 'all' = 'all';
        if (lowerPrompt.includes('einnahme') || lowerPrompt.includes('einzahlung') || lowerPrompt.includes('erlös') || lowerPrompt.includes('income') || lowerPrompt.includes('دخل') || lowerPrompt.includes('ايراد') || lowerPrompt.includes('إيراد') || lowerPrompt.includes('وارد') || lowerPrompt.includes('إيداع') || lowerPrompt.includes('قبض')) {
          requestedFinType = 'einnahme';
        } else if (lowerPrompt.includes('ausgabe') || lowerPrompt.includes('kosten') || lowerPrompt.includes('abhebung') || lowerPrompt.includes('expense') || lowerPrompt.includes('مصروف') || lowerPrompt.includes('مصاريف') || lowerPrompt.includes('تكلفة') || lowerPrompt.includes('سحب') || lowerPrompt.includes('خرج')) {
          requestedFinType = 'ausgabe';
        } else if (lowerPrompt.includes('transit') || lowerPrompt.includes('umbuchung') || lowerPrompt.includes('تحويل داخلي')) {
          requestedFinType = 'transit';
        }

        // Detect time filter from temporal parsing
        let requestedTime: string = temporal.periodKey !== 'all' ? temporal.periodKey : 'all';
        if (requestedTime === 'all') {
          if (lowerPrompt.includes('heute') || lowerPrompt.includes('today') || lowerPrompt.includes('اليوم')) {
            requestedTime = 'today';
          } else if (lowerPrompt.includes('gestern') || lowerPrompt.includes('yesterday') || lowerPrompt.includes('البارحة') || lowerPrompt.includes('امس')) {
            requestedTime = 'yesterday';
          } else if (lowerPrompt.includes('diese woche') || lowerPrompt.includes('this week') || lowerPrompt.includes('هذا الاسبوع') || lowerPrompt.includes('هذا الأسبوع')) {
            requestedTime = 'this_week';
          } else if (lowerPrompt.includes('letzte woche') || lowerPrompt.includes('last week') || lowerPrompt.includes('الاسبوع الماضي') || lowerPrompt.includes('الأسبوع الماضي')) {
            requestedTime = 'last_week';
          } else if (lowerPrompt.includes('diesen monat') || lowerPrompt.includes('this month') || lowerPrompt.includes('هذا الشهر')) {
            requestedTime = 'this_month';
          } else if (lowerPrompt.includes('letzten monat') || lowerPrompt.includes('last month') || lowerPrompt.includes('الشهر الماضي')) {
            requestedTime = 'last_month';
          } else if (lowerPrompt.includes('dieses jahr') || lowerPrompt.includes('this year') || lowerPrompt.includes('هذه السنة') || lowerPrompt.includes('هذا العام')) {
            requestedTime = 'this_year';
          } else if (lowerPrompt.includes('letztes jahr') || lowerPrompt.includes('last year') || lowerPrompt.includes('السنة الماضية') || lowerPrompt.includes('العام الماضي')) {
            requestedTime = 'last_year';
          }
        }

        // Search tokens (clean out temporal and financial words)
        const cleanFinTokens = lowerPrompt
          .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'0-9]/g, ' ')
          .split(/\s+/)
          .filter(t => t.length > 2)
          .filter(t => !['kasse', 'kassenbuch', 'finanzen', 'bank', 'bankkonto', 'konto', 'zeig', 'zeige', 'offen', 'öffne', 'suche', 'filtern', 'filter', 'einnahme', 'ausgabe', 'buchung', 'buchungen', 'ابحث', 'اعرض', 'افتح', 'فلتر', 'كاسة', 'بنك', 'حساب', 'حسابات', 'مالية', 'سجل', 'دفتر', 'heute', 'gestern', 'woche', 'monat', 'jahr', 'اليوم', 'امس', 'البارحة', 'الماضي', 'الحالي', 'السابق', 'الجاري', 'الماضية', 'الحالية', 'euro', 'eur', 'betrag', 'summe', 'مبلغ', 'بقيمة', 'يورو', 'أكثر', 'أقل', 'اكثر', 'اقل', 'فوق', 'تحت'].includes(t));

        const activeFinSearch = cleanFinTokens.join(' ');
        const periodDisplay = temporal.labelAr || (requestedTime === 'today' ? 'اليوم' : (requestedTime === 'yesterday' ? 'البارحة' : (requestedTime === 'this_week' ? 'هذا الأسبوع' : (requestedTime === 'last_week' ? 'الأسبوع الماضي' : (requestedTime === 'this_month' ? 'هذا الشهر' : (requestedTime === 'last_month' ? 'الشهر الماضي' : (requestedTime === 'this_year' ? 'هذه السنة' : (requestedTime === 'last_year' ? 'السنة الماضية' : requestedTime))))))));
        const periodDisplayDe = temporal.labelDe || (requestedTime === 'today' ? 'Heute' : (requestedTime === 'yesterday' ? 'Gestern' : (requestedTime === 'this_week' ? 'Diese Woche' : (requestedTime === 'last_week' ? 'Letzte Woche' : (requestedTime === 'this_month' ? 'Diesen Monat' : (requestedTime === 'last_month' ? 'Letzten Monat' : (requestedTime === 'this_year' ? 'Dieses Jahr' : (requestedTime === 'last_year' ? 'Letztes Jahr' : requestedTime))))))));

        let searchFinReply = '';
        if (lang === 'ar') {
          searchFinReply = `💼 **دفتر المالية والحسابات (Finanzen & Kassenbuch):**\n\n` +
            `• **الحساب المحدد:** **${requestedAccount === 'Bank' ? 'الحساب البنكي (Bankkonto)' : (requestedAccount === 'Kasse' ? 'الكاسة النقدية (Kassenbuch)' : 'جميع الحسابات (Kasse + Bank)')}**\n` +
            `• **نوع الحركة:** **${requestedFinType === 'einnahme' ? 'الإيرادات فقط (Einnahmen)' : (requestedFinType === 'ausgabe' ? 'المصاريف فقط (Ausgaben)' : (requestedFinType === 'transit' ? 'التحويلات الداخلية (Transit)' : 'كافة الحركات'))}**\n` +
            (requestedTime !== 'all' || temporal.dateFrom ? `• **الفترة الزمنية:** **${periodDisplay}**\n` : '') +
            (financial.amountMin !== undefined || financial.amountMax !== undefined ? `• **حدود المبالغ:** ${financial.amountMin ? 'من ' + financial.amountMin.toLocaleString('de-DE') + ' € ' : ''}${financial.amountMax ? 'حتى ' + financial.amountMax.toLocaleString('de-DE') + ' €' : ''}\n` : '') +
            (activeFinSearch ? `• **كلمة البحث:** \`${activeFinSearch}\`\n` : '') +
            `\n*يقوم ماكس بفتح سجل الحسابات وتطبيق الفلاتر المطلوبة مباشرة.*`;
        } else if (lang === 'en') {
          searchFinReply = `💼 **Financial Accounts & Cashbook:**\n\n` +
            `• **Selected Account:** **${requestedAccount === 'Bank' ? 'Bank Account' : (requestedAccount === 'Kasse' ? 'Cashbook (Kasse)' : 'All Accounts (Cash + Bank)')}**\n` +
            `• **Transaction Type:** **${requestedFinType === 'einnahme' ? 'Income Only' : (requestedFinType === 'ausgabe' ? 'Expenses Only' : (requestedFinType === 'transit' ? 'Transit Transfers' : 'All Transactions'))}**\n` +
            (requestedTime !== 'all' || temporal.dateFrom ? `• **Time Period:** **${temporal.labelEn || requestedTime}**\n` : '') +
            (financial.amountMin !== undefined || financial.amountMax !== undefined ? `• **Amount Bounds:** ${financial.amountMin ? 'Min: ' + financial.amountMin.toLocaleString('de-DE') + ' € ' : ''}${financial.amountMax ? 'Max: ' + financial.amountMax.toLocaleString('de-DE') + ' €' : ''}\n` : '') +
            (activeFinSearch ? `• **Search Term:** \`${activeFinSearch}\`\n` : '') +
            `\n*Max opens the cashbook and applies your selected filters directly.*`;
        } else {
          searchFinReply = `💼 **Finanzübersicht & Kassenbuch:**\n\n` +
            `• **Gewähltes Konto:** **${requestedAccount === 'Bank' ? 'Bankkonto' : (requestedAccount === 'Kasse' ? 'Barkasse (Kassenbuch)' : 'Alle Konten (Kasse + Bank)')}**\n` +
            `• **Buchungsart:** **${requestedFinType === 'einnahme' ? 'Nur Einnahmen' : (requestedFinType === 'ausgabe' ? 'Nur Ausgaben' : (requestedFinType === 'transit' ? 'Umbuchungen / Transit' : 'Alle Buchungsarten'))}**\n` +
            (requestedTime !== 'all' || temporal.dateFrom ? `• **Zeitraum:** **${periodDisplayDe}**\n` : '') +
            (financial.amountMin !== undefined || financial.amountMax !== undefined ? `• **Betragsfilter:** ${financial.amountMin ? 'ab ' + financial.amountMin.toLocaleString('de-DE') + ' € ' : ''}${financial.amountMax ? 'bis ' + financial.amountMax.toLocaleString('de-DE') + ' €' : ''}\n` : '') +
            (activeFinSearch ? `• **Suchbegriff:** „${activeFinSearch}“\n` : '') +
            `\n*Max öffnet die Finanzübersicht und wendet die gewünschten Filterkriterien direkt an.*`;
        }

        return {
          matched: true,
          layer: 'LAYER_1_NAVIGATION_MACRO',
          targetTab: 'finanzen',
          disambiguationRequired: false,
          preFillData: {
            account: requestedAccount !== 'all' ? requestedAccount : undefined,
            filterAccount: requestedAccount,
            filterType: requestedFinType,
            filterTime: requestedTime,
            dateFrom: temporal.dateFrom,
            dateTo: temporal.dateTo,
            amountMin: financial.amountMin,
            amountMax: financial.amountMax,
            exactAmount: financial.exactAmount,
            searchQuery: activeFinSearch
          },
          extractedSearchTerm: activeFinSearch,
          replyText: searchFinReply,
          interactiveActions: [
            {
              id: 'act_open_filtered_finanzen',
              type: 'open_finanzen',
              label: lang === 'ar' ? `💼 فتح سجل المالية (${requestedAccount === 'Bank' ? 'البنك' : (requestedAccount === 'Kasse' ? 'الكاسة' : 'الكل')})` : (lang === 'en' ? `💼 Open Financials (${requestedAccount})` : `💼 Finanzbuchhaltung öffnen (${requestedAccount === 'Bank' ? 'Bank' : (requestedAccount === 'Kasse' ? 'Kasse' : 'Alle')})`),
              badge: requestedAccount === 'Bank' ? 'Bank' : 'Kasse',
              filterAccount: requestedAccount,
              filterType: requestedFinType,
              filterTime: requestedTime,
              dateFrom: temporal.dateFrom,
              dateTo: temporal.dateTo,
              amountMin: financial.amountMin,
              amountMax: financial.amountMax,
              searchQuery: activeFinSearch
            },
            {
              id: 'act_new_fin_income',
              type: 'open_finanzen',
              label: lang === 'ar' ? '➕ تسجيل إيداع جديد' : (lang === 'en' ? '➕ Record New Deposit' : '➕ Neue Einnahme buchen'),
              badge: lang === 'ar' ? 'إيداع' : (lang === 'en' ? 'Income' : 'Einnahme'),
              financeType: 'income',
              account: requestedAccount !== 'all' ? requestedAccount : 'Kasse'
            },
            {
              id: 'act_new_fin_expense',
              type: 'open_finanzen',
              label: lang === 'ar' ? '➖ تسجيل مصروف جديد' : (lang === 'en' ? '➖ Record New Expense' : '➖ Neue Ausgabe buchen'),
              badge: lang === 'ar' ? 'مصروف' : (lang === 'en' ? 'Expense' : 'Ausgabe'),
              financeType: 'expense',
              account: requestedAccount !== 'all' ? requestedAccount : 'Kasse'
            }
          ]
        };
      }

      // 3B: Book explicit amount in Cashbook / Bank
      const isIncome = !lowerPrompt.includes('ausgabe') && 
        !lowerPrompt.includes('abhebung') && 
        !lowerPrompt.includes('سحب') && 
        !lowerPrompt.includes('مصروف') && 
        !lowerPrompt.includes('دفع') && 
        !lowerPrompt.includes('تكلفة') && 
        !lowerPrompt.includes('kosten') &&
        !lowerPrompt.includes('expense') &&
        !lowerPrompt.includes('withdrawal') &&
        !lowerPrompt.includes('bezahlen');

      const targetAccount: 'Kasse' | 'Bank' = extractedPaymentMethod === 'BANK_UEBERWEISUNG' ? 'Bank' : 'Kasse';
      const financeCat = isIncome 
        ? (targetAccount === 'Bank' ? 'Fahrzeugverkauf Banküberweisung' : 'Bareinzahlung Kasse') 
        : (targetAccount === 'Bank' ? 'Fahrzeugeinkauf / Bank' : 'Betriebsausgabe');

      const financeDesc = isIncome 
        ? (targetAccount === 'Bank' ? 'Überweisung Kaufpreis' : 'Bareinzahlung Kassenbuch') 
        : (targetAccount === 'Bank' ? 'Überweisung Lieferant' : 'Barbeleg / Betriebsausgabe');

      let generalFinReply = '';
      if (lang === 'ar') {
        generalFinReply = `💼 **تسجيل حركة مالية في ${targetAccount === 'Bank' ? 'الحساب البنكي (Bankkonto)' : 'الكاسة (Kassenbuch)'}:**\n\n` +
          `• **نوع الحركة:** **${isIncome ? 'إيداع / قبض (Einnahme)' : 'سحب / مصروف (Ausgabe)'}**\n` +
          `• **الحساب (Konto):** **${targetAccount}** ${isAccountDefaulted ? '*(افتراضي: Kasse)*' : ''}\n` +
          `• **المبلغ:** **${(extractedAmount || 0).toLocaleString('de-DE')} €**\n` +
          `• **التاريخ:** ${dateFormattedDe} ${isDateDefaulted ? '*(افتراضي: اليوم)*' : ''}\n` +
          `• **التصنيف:** **${financeCat}**\n\n` +
          `*يتم فتح دفتر اليومية / الكاسة وتجهيز نموذج الإدخال مع تعبئة كافة الحقول.*`;
      } else if (lang === 'en') {
        generalFinReply = `💼 **Financial Entry in ${targetAccount === 'Bank' ? 'Bank Account' : 'Cashbook'}:**\n\n` +
          `• **Type:** **${isIncome ? 'Deposit / Income' : 'Withdrawal / Expense'}**\n` +
          `• **Account:** **${targetAccount}**\n` +
          `• **Amount:** **${(extractedAmount || 0).toLocaleString('de-DE')} €**\n` +
          `• **Date:** ${dateFormattedDe}\n` +
          `• **Category:** **${financeCat}**\n\n` +
          `*Cashbook opened and entry form initialized with pre-filled parameters.*`;
      } else {
        generalFinReply = `💼 **Finanzbuchung im ${targetAccount === 'Bank' ? 'Bankkonto' : 'Kassenbuch'}:**\n\n` +
          `• **Buchungsart:** **${isIncome ? 'Einnahme' : 'Ausgabe'}**\n` +
          `• **Konto:** **${targetAccount}** ${isAccountDefaulted ? '*(Standard: Kasse)*' : ''}\n` +
          `• **Betrag:** **${(extractedAmount || 0).toLocaleString('de-DE')} €**\n` +
          `• **Datum:** ${dateFormattedDe} ${isDateDefaulted ? '*(Standard: Heute)*' : ''}\n` +
          `• **Kategorie:** **${financeCat}**\n\n` +
          `*Das Kassenbuch wird aufgerufen und die Buchungsmaske vorbereitet.*`;
      }

      return {
        matched: true,
        layer: 'LAYER_1_NAVIGATION_MACRO',
        targetTab: 'finanzen',
        disambiguationRequired: false,
        preFillData: {
          account: targetAccount,
          amount: extractedAmount,
          date: extractedDate,
          category: financeCat,
          description: financeDesc
        },
        replyText: generalFinReply,
        interactiveActions: [
          {
            id: `act_book_general_fin`,
            type: 'open_finanzen',
            label: lang === 'ar' ? `💰 تسجيل ${isIncome ? 'إيداع' : 'مصروف'} (${(extractedAmount || 0).toLocaleString('de-DE')} €) في الكاسة` : (lang === 'en' ? `💰 Record ${isIncome ? 'Income' : 'Expense'} (${(extractedAmount || 0).toLocaleString('de-DE')} €) in Cashbook` : `💰 ${isIncome ? 'Einnahme' : 'Ausgabe'} (${(extractedAmount || 0).toLocaleString('de-DE')} €) im Kassenbuch buchen`),
            sublabel: `${targetAccount} • ${financeCat}`,
            badge: lang === 'ar' ? 'الكاسة' : (lang === 'en' ? 'Cashbook' : 'Kassenbuch'),
            financeType: isIncome ? 'income' : 'expense',
            account: targetAccount,
            amount: extractedAmount,
            date: extractedDate,
            category: financeCat,
            description: financeDesc
          }
        ]
      };
    }

    // -------------------------------------------------------------
    // 0B. DIRECT VEHICLE SEARCH, FILTERING & OPENING (Layer 2 & Inventory)
    // -------------------------------------------------------------
    const isVehicleKeyword = 
      lowerPrompt.includes('fahrzeug') ||
      lowerPrompt.includes('fahrzeuge') ||
      lowerPrompt.includes('auto') ||
      lowerPrompt.includes('autos') ||
      lowerPrompt.includes('wagen') ||
      lowerPrompt.includes('bestand') ||
      lowerPrompt.includes('lager') ||
      lowerPrompt.includes('car') ||
      lowerPrompt.includes('cars') ||
      lowerPrompt.includes('vehicle') ||
      lowerPrompt.includes('vehicles') ||
      lowerPrompt.includes('inventory') ||
      lowerPrompt.includes('stock') ||
      lowerPrompt.includes('سيارة') ||
      lowerPrompt.includes('سيارات') ||
      lowerPrompt.includes('عربية') ||
      lowerPrompt.includes('عربيات') ||
      lowerPrompt.includes('المخزن') ||
      lowerPrompt.includes('المستودع') ||
      lowerPrompt.includes('المعرض');

    const isDirectVehicleIntent = 
      isVehicleKeyword ||
      lowerPrompt.startsWith('öffne fahrzeug') ||
      lowerPrompt.startsWith('öffne auto') ||
      lowerPrompt.startsWith('öffne den') ||
      lowerPrompt.startsWith('zeige fahrzeug') ||
      lowerPrompt.startsWith('zeige auto') ||
      lowerPrompt.startsWith('fahrzeug anzeigen') ||
      lowerPrompt.startsWith('auto anzeigen') ||
      lowerPrompt.startsWith('open vehicle') ||
      lowerPrompt.startsWith('open car') ||
      lowerPrompt.startsWith('show vehicle') ||
      lowerPrompt.startsWith('show car') ||
      lowerPrompt.startsWith('افتح سيارة') ||
      lowerPrompt.startsWith('افتح السيارة') ||
      lowerPrompt.startsWith('اعرض سيارة') ||
      lowerPrompt.startsWith('عرض سيارة') ||
      lowerPrompt.startsWith('سيارة ') ||
      (vehicleSearchResult.matches.length > 0 && !lowerPrompt.includes('kaufvertrag') && !lowerPrompt.includes('zahlung') && !lowerPrompt.includes('rechnung') && !lowerPrompt.includes('anzahlung') && !lowerPrompt.includes('übergabe'));

    if (isDirectVehicleIntent && (isVehicleKeyword || vehicleSearchResult.matches.length > 0)) {
      // 1. Detect requested status filter
      let requestedVehStatusFilter: string | undefined;
      if (
        lowerPrompt.includes('bestand') ||
        lowerPrompt.includes('verfügbar') ||
        lowerPrompt.includes('im lager') ||
        lowerPrompt.includes('in stock') ||
        lowerPrompt.includes('available') ||
        lowerPrompt.includes('متاح') ||
        lowerPrompt.includes('متوفر') ||
        lowerPrompt.includes('في المخزن') ||
        lowerPrompt.includes('في المعرض') ||
        lowerPrompt.includes('المخزن')
      ) {
        requestedVehStatusFilter = 'in_stock';
      } else if (
        lowerPrompt.includes('verkauft') ||
        lowerPrompt.includes('sold') ||
        lowerPrompt.includes('مباع') ||
        lowerPrompt.includes('مباعة') ||
        lowerPrompt.includes('تم بيعها')
      ) {
        requestedVehStatusFilter = 'sold';
      } else if (
        lowerPrompt.includes('reserviert') ||
        lowerPrompt.includes('reserved') ||
        lowerPrompt.includes('محجوز') ||
        lowerPrompt.includes('محجوزة')
      ) {
        requestedVehStatusFilter = 'reserved';
      }

      // 2. Extract search tokens (excluding generic vehicle keywords)
      const VEHICLE_STOPWORDS = new Set([
        'fahrzeug', 'fahrzeuge', 'auto', 'autos', 'wagen', 'lager', 'bestand', 'car', 'cars', 'vehicle', 'vehicles',
        'سيارة', 'سيارات', 'عربية', 'عربيات', 'المخزن', 'المعرض', 'المستودع',
        'suche', 'suchen', 'finde', 'finden', 'zeige', 'zeig', 'öffne', 'search', 'find', 'show', 'open',
        'ابحث', 'بحث', 'اعرض', 'عرض', 'افتح', 'هات', 'عن', 'في', 'من', 'كل', 'جميع',
        'alle', 'aller', 'all', 'liste', 'قائمة', 'list', 'bitte', 'please', 'من', 'فضلك'
      ]);

      const promptTokens = lowerPrompt
        .replace(/[.,\-_/\\():;!?\"'„“]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length >= 2 && !VEHICLE_STOPWORDS.has(t));

      // 3. Filter vehicles
      let filteredVehicles = vehicles.filter(v => {
        // Status filter
        if (requestedVehStatusFilter && v.status !== requestedVehStatusFilter) {
          return false;
        }

        // Fuel filter if mentioned
        if (lowerPrompt.includes('diesel') || lowerPrompt.includes('ديزل')) {
          if (!(v.fuelType || '').toLowerCase().includes('diesel')) return false;
        } else if (lowerPrompt.includes('benzin') || lowerPrompt.includes('بنزين') || lowerPrompt.includes('petrol')) {
          if (!(v.fuelType || '').toLowerCase().includes('benzin') && !(v.fuelType || '').toLowerCase().includes('petrol')) return false;
        } else if (lowerPrompt.includes('hybrid') || lowerPrompt.includes('هايبرد') || lowerPrompt.includes('هجين')) {
          if (!(v.fuelType || '').toLowerCase().includes('hybrid')) return false;
        } else if (lowerPrompt.includes('elektro') || lowerPrompt.includes('electric') || lowerPrompt.includes('كهرباء')) {
          if (!(v.fuelType || '').toLowerCase().includes('elektro') && !(v.fuelType || '').toLowerCase().includes('electric')) return false;
        }

        // If no extra tokens extracted, match based on status/fuel
        if (promptTokens.length === 0) {
          return true;
        }

        const brand = (v.brand || '').toLowerCase();
        const model = (v.model || '').toLowerCase();
        const variant = (v.variant || '').toLowerCase();
        const vin = (v.vin || '').toLowerCase();
        const plate = (v.licensePlate || '').toLowerCase();

        return promptTokens.some(tok => 
          brand.includes(tok) ||
          model.includes(tok) ||
          variant.includes(tok) ||
          vin.includes(tok) ||
          plate.includes(tok)
        );
      });

      // If strict vehicleSearchResult has exact matches, prefer those if more specific
      if (vehicleSearchResult.matches.length > 0 && vehicleSearchResult.matchType !== 'NONE') {
        filteredVehicles = vehicleSearchResult.matches;
      }

      const activeVehSearchQuery = promptTokens.join(' ');

      if (filteredVehicles.length === 1) {
        const singleVeh = filteredVehicles[0];
        let singleVehDirectReply = '';
        if (lang === 'ar') {
          singleVehDirectReply = `🚗 **تم فتح كرت السيارة مباشرة:** **${singleVeh.brand} ${singleVeh.model}** ${singleVeh.variant ? '(' + singleVeh.variant + ')' : ''}\n\n` +
            `• **سنة الصنع / التسجيل:** ${singleVeh.firstRegistration || 'غير محدد'} | **العداد:** ${(singleVeh.mileage || 0).toLocaleString('de-DE')} km\n` +
            `• **رقم الهيكل (FIN):** \`${singleVeh.vin || 'غير محدد'}\`\n` +
            `• **سعر البيع:** ${(singleVeh.sellingPrice || 0).toLocaleString('de-DE')} € (${singleVeh.taxType || '§25a'})\n` +
            `• **نوع الوقود:** ${singleVeh.fuelType || 'غير محدد'} | **القوة:** ${singleVeh.powerPs ? singleVeh.powerPs + ' PS' : (singleVeh.powerKw ? singleVeh.powerKw + ' kW' : 'غير محدد')}\n` +
            `• **الحالة في المخزن:** ${singleVeh.status === 'verfuegbar' ? '✅ متوفر في المخزن' : (singleVeh.status === 'verkauft' ? '🏷️ مباع' : singleVeh.status)}\n\n` +
            `*تم فتح ملف السيارة الكامل في الطبقة الثانية وهو جاهز للتعديل أو إدارة العمليات.*`;
        } else if (lang === 'en') {
          singleVehDirectReply = `🚗 **Vehicle File Opened in Layer 2:** **${singleVeh.brand} ${singleVeh.model}** ${singleVeh.variant ? '(' + singleVeh.variant + ')' : ''}\n\n` +
            `• **First Reg:** ${singleVeh.firstRegistration || 'N/A'} | **Mileage:** ${(singleVeh.mileage || 0).toLocaleString('de-DE')} km\n` +
            `• **VIN:** \`${singleVeh.vin || 'N/A'}\`\n` +
            `• **Selling Price:** ${(singleVeh.sellingPrice || 0).toLocaleString('de-DE')} € (${singleVeh.taxType || '§25a'})\n` +
            `• **Fuel:** ${singleVeh.fuelType || 'N/A'} | **Power:** ${singleVeh.powerPs ? singleVeh.powerPs + ' hp' : (singleVeh.powerKw ? singleVeh.powerKw + ' kW' : 'N/A')}\n` +
            `• **Status:** ${singleVeh.status}\n\n` +
            `*Vehicle dossier opened in Layer 2 and ready for viewing or editing.*`;
        } else {
          singleVehDirectReply = `🚗 **Fahrzeug direkt in Schicht 2 geöffnet:** **${singleVeh.brand} ${singleVeh.model}** ${singleVeh.variant ? '(' + singleVeh.variant + ')' : ''}\n\n` +
            `• **Erstzulassung:** ${singleVeh.firstRegistration || 'k.A.'} | **Kilometer:** ${(singleVeh.mileage || 0).toLocaleString('de-DE')} km\n` +
            `• **FIN:** \`${singleVeh.vin || 'k.A.'}\`\n` +
            `• **Verkaufspreis:** ${(singleVeh.sellingPrice || 0).toLocaleString('de-DE')} € (${singleVeh.taxType || '§25a'})\n` +
            `• **Kraftstoff:** ${singleVeh.fuelType || 'k.A.'} | **Leistung:** ${singleVeh.powerPs ? singleVeh.powerPs + ' PS' : (singleVeh.powerKw ? singleVeh.powerKw + ' kW' : 'k.A.')}\n` +
            `• **Status:** ${singleVeh.status === 'verfuegbar' ? '✅ Im Bestand' : (singleVeh.status === 'verkauft' ? '🏷️ Verkauft' : singleVeh.status)}\n\n` +
            `*Die Fahrzeugakte wurde automatisch in Schicht 2 geöffnet und liegt vor Ihnen zur Bearbeitung bereit.*`;
        }

        return {
          matched: true,
          layer: 'LAYER_2_ENTITY_FORMS',
          targetTab: 'lager',
          disambiguationRequired: false,
          matchedVehicles: [singleVeh],
          preFillData: { 
            vehicle: singleVeh,
            searchQuery: singleVeh.brand + ' ' + singleVeh.model,
            filterStatus: requestedVehStatusFilter
          },
          extractedSearchTerm: singleVeh.brand,
          replyText: singleVehDirectReply,
          interactiveActions: [
            {
              id: `act_open_veh_lager_${singleVeh.id}`,
              type: 'open_lager',
              label: lang === 'ar' ? `🚗 فتح ملف ${singleVeh.brand} ${singleVeh.model}` : (lang === 'en' ? `🚗 Open ${singleVeh.brand} ${singleVeh.model} File` : `🚗 ${singleVeh.brand} ${singleVeh.model} in Schicht 2 öffnen`),
              badge: lang === 'ar' ? 'كرت السيارة' : (lang === 'en' ? 'Vehicle Card' : 'Fahrzeugakte'),
              vehicleId: singleVeh.id,
              searchQuery: singleVeh.brand + ' ' + singleVeh.model,
              filterStatus: requestedVehStatusFilter
            },
            {
              id: `act_create_doc_for_veh_${singleVeh.id}`,
              type: 'open_operations',
              label: lang === 'ar' ? `📄 إنشاء عقد بيع لـ ${singleVeh.brand} ${singleVeh.model}` : (lang === 'en' ? `📄 Create Sales Contract for ${singleVeh.brand} ${singleVeh.model}` : `📄 Kaufvertrag für ${singleVeh.brand} ${singleVeh.model} erstellen`),
              badge: lang === 'ar' ? 'العمليات' : (lang === 'en' ? 'Operations' : 'Operationen'),
              vehicleId: singleVeh.id,
              docType: 'kaufvertrag'
            }
          ]
        };
      } else if (filteredVehicles.length > 1) {
        const totalStockValue = filteredVehicles.reduce((sum, v) => sum + (Number(v.sellingPrice) || 0), 0);

        let listText = filteredVehicles.slice(0, 5).map((v, i) => {
          const statusIcon = v.status === 'verfuegbar' ? '🟢' : (v.status === 'verkauft' ? '🏷️' : '🟡');
          return `${i + 1}. **${v.brand} ${v.model}** ${v.variant ? '(' + v.variant + ')' : ''} — **${(v.sellingPrice || 0).toLocaleString('de-DE')} €** | ${statusIcon} ${v.status} | FIN: \`${v.vin ? '...' + v.vin.slice(-7) : 'k.A.'}\``;
        }).join('\n');

        if (filteredVehicles.length > 5) {
          listText += `\n*...و ${filteredVehicles.length - 5} سيارات إضافية في قائمة المخزن المفلترة.*`;
        }

        let ambigVehDirectReply = '';
        if (lang === 'ar') {
          ambigVehDirectReply = `🚗 **تم العثور على ${filteredVehicles.length} سيارات مطابقة في المخزن:**\n\n` +
            `• **القيمة الإجمالية للسيارات:** **${totalStockValue.toLocaleString('de-DE')} €**\n` +
            (requestedVehStatusFilter ? `• **الفلتر المطبق:** ${requestedVehStatusFilter === 'in_stock' ? 'المخزن المتوفر' : requestedVehStatusFilter}\n` : '') +
            `\n${listText}\n\n` +
            `*اختر سيارة لفتح بطاقتها مباشرة أو افتح قائمة المخزن المفلترة بالكامل.*`;
        } else if (lang === 'en') {
          ambigVehDirectReply = `🚗 **Found ${filteredVehicles.length} Matching Vehicles in Inventory:**\n\n` +
            `• **Total Inventory Value:** **${totalStockValue.toLocaleString('de-DE')} €**\n` +
            (requestedVehStatusFilter ? `• **Active Filter:** ${requestedVehStatusFilter}\n` : '') +
            `\n${listText}\n\n` +
            `*Select a vehicle to open its file directly or view the entire filtered inventory.*`;
        } else {
          ambigVehDirectReply = `🚗 **${filteredVehicles.length} passende Fahrzeuge im Bestand gefunden:**\n\n` +
            `• **Gesamtwert:** **${totalStockValue.toLocaleString('de-DE')} €**\n` +
            (requestedVehStatusFilter ? `• **Aktiver Filter:** ${requestedVehStatusFilter === 'in_stock' ? 'Verfügbarer Bestand' : requestedVehStatusFilter}\n` : '') +
            `\n${listText}\n\n` +
            `*Wählen Sie ein Fahrzeug aus oder öffnen Sie die gefilterte Bestandsliste.*`;
        }

        const vehActions: ChatInteractiveAction[] = [
          {
            id: 'act_open_filtered_lager_view',
            type: 'open_lager',
            label: lang === 'ar' ? `🚗 عرض قائمة السيارات المفلترة (${filteredVehicles.length})` : (lang === 'en' ? `🚗 View Filtered Stock (${filteredVehicles.length})` : `🚗 Gefilterte Bestandsliste öffnen (${filteredVehicles.length})`),
            sublabel: `${totalStockValue.toLocaleString('de-DE')} € ${lang === 'ar' ? 'القيمة' : 'Gesamtwert'}`,
            badge: lang === 'ar' ? 'المخزن' : (lang === 'en' ? 'Stock' : 'Bestand'),
            searchQuery: activeVehSearchQuery,
            filterStatus: requestedVehStatusFilter
          },
          ...filteredVehicles.slice(0, 4).map(v => ({
            id: `act_disambig_veh_${v.id}`,
            type: 'open_lager' as const,
            label: `🚗 ${v.brand} ${v.model} ${v.variant || ''} (${(v.sellingPrice || 0).toLocaleString('de-DE')} €)`,
            sublabel: `FIN: ${v.vin ? '...' + v.vin.slice(-7) : 'k.A.'} • EZ: ${v.firstRegistration || 'k.A.'} • Status: ${v.status}`,
            badge: lang === 'ar' ? 'فتح كرت السيارة' : (lang === 'en' ? 'Open Dossier' : 'In Schicht 2'),
            vehicleId: v.id,
            searchQuery: activeVehSearchQuery,
            filterStatus: requestedVehStatusFilter
          }))
        ];

        return {
          matched: true,
          layer: 'LAYER_2_ENTITY_FORMS',
          targetTab: 'lager',
          disambiguationRequired: true,
          matchedVehicles: filteredVehicles,
          preFillData: {
            searchQuery: activeVehSearchQuery,
            filterStatus: requestedVehStatusFilter
          },
          extractedSearchTerm: activeVehSearchQuery,
          replyText: ambigVehDirectReply,
          interactiveActions: vehActions
        };
      } else {
        // 0 Vehicles Found
        let noVehReply = '';
        if (lang === 'ar') {
          noVehReply = `🚗 **مخزن السيارات:** لم يتم العثور على سيارات مطابقة لبحثك ` +
            (activeVehSearchQuery ? `("${activeVehSearchQuery}")` : '') +
            (requestedVehStatusFilter ? ` بالحالة (${requestedVehStatusFilter})` : '') +
            `.\n\nأفتح لك قائمة المخزن العام لمعاينة كامل السيارات أو إضافة سيارة جديدة.`;
        } else if (lang === 'en') {
          noVehReply = `🚗 **Vehicle Inventory:** No vehicles found matching your query ` +
            (activeVehSearchQuery ? `("${activeVehSearchQuery}")` : '') +
            `.\n\nOpening the vehicle inventory for full overview.`;
        } else {
          noVehReply = `🚗 **Fahrzeugbestand:** Keine Fahrzeuge gefunden für Ihre Anfrage ` +
            (activeVehSearchQuery ? `(„${activeVehSearchQuery}“)` : '') +
            `.\n\nIch öffne die Bestandsliste für Sie.`;
        }

        return {
          matched: true,
          layer: 'LAYER_2_ENTITY_FORMS',
          targetTab: 'lager',
          disambiguationRequired: false,
          preFillData: {
            searchQuery: activeVehSearchQuery,
            filterStatus: requestedVehStatusFilter
          },
          extractedSearchTerm: activeVehSearchQuery,
          replyText: noVehReply,
          interactiveActions: [
            {
              id: 'act_open_lager_tab',
              type: 'open_lager',
              label: lang === 'ar' ? '🚗 فتح مخزن السيارات' : (lang === 'en' ? '🚗 Open Vehicle Inventory' : '🚗 Fahrzeugbestand öffnen'),
              badge: lang === 'ar' ? 'المخزن' : (lang === 'en' ? 'Stock' : 'Bestand'),
              searchQuery: activeVehSearchQuery,
              filterStatus: requestedVehStatusFilter
            }
          ]
        };
      }
    }

    // -------------------------------------------------------------
    // 0C. DIRECT CUSTOMER SEARCH, FILTERING & OPENING (Layer 2 CRM)
    // -------------------------------------------------------------
    const isCustomerKeyword = 
      lowerPrompt.includes('kunde') ||
      lowerPrompt.includes('kunden') ||
      lowerPrompt.includes('kundenkartei') ||
      lowerPrompt.includes('kundenliste') ||
      lowerPrompt.includes('customer') ||
      lowerPrompt.includes('customers') ||
      lowerPrompt.includes('client') ||
      lowerPrompt.includes('clients') ||
      lowerPrompt.includes('crm') ||
      lowerPrompt.includes('عميل') ||
      lowerPrompt.includes('عملاء') ||
      lowerPrompt.includes('زبون') ||
      lowerPrompt.includes('زبائن') ||
      lowerPrompt.includes('الزبائن') ||
      lowerPrompt.includes('العملاء');

    const isDirectCustomerIntent = 
      isCustomerKeyword ||
      lowerPrompt.startsWith('öffne kunde') ||
      lowerPrompt.startsWith('zeige kunde') ||
      lowerPrompt.startsWith('kunde anzeigen') ||
      lowerPrompt.startsWith('kundenkartei') ||
      lowerPrompt.startsWith('open customer') ||
      lowerPrompt.startsWith('show customer') ||
      lowerPrompt.startsWith('customer file') ||
      lowerPrompt.startsWith('افتح عميل') ||
      lowerPrompt.startsWith('افتح العميل') ||
      lowerPrompt.startsWith('اعرض عميل') ||
      lowerPrompt.startsWith('عميل ') ||
      (customerSearchResult.matches.length > 0 && !lowerPrompt.includes('kaufvertrag') && !lowerPrompt.includes('zahlung') && !lowerPrompt.includes('rechnung') && !lowerPrompt.includes('anzahlung'));

    if (isDirectCustomerIntent && (isCustomerKeyword || customerSearchResult.matches.length > 0)) {
      // 1. Detect requested customer type filter (B2B vs B2C)
      let requestedCustTypeFilter: string | undefined;
      if (
        lowerPrompt.includes('b2b') ||
        lowerPrompt.includes('firma') ||
        lowerPrompt.includes('firmen') ||
        lowerPrompt.includes('unternehmen') ||
        lowerPrompt.includes('company') ||
        lowerPrompt.includes('business') ||
        lowerPrompt.includes('شركات') ||
        lowerPrompt.includes('شركة') ||
        lowerPrompt.includes('تجاري')
      ) {
        requestedCustTypeFilter = 'B2B';
      } else if (
        lowerPrompt.includes('b2c') ||
        lowerPrompt.includes('privat') ||
        lowerPrompt.includes('privatkunde') ||
        lowerPrompt.includes('individual') ||
        lowerPrompt.includes('افراد') ||
        lowerPrompt.includes('أفراد') ||
        lowerPrompt.includes('خاص')
      ) {
        requestedCustTypeFilter = 'B2C';
      }

      // 2. Extract search tokens (excluding generic customer keywords)
      const CUSTOMER_STOPWORDS = new Set([
        'kunde', 'kunden', 'kundenkartei', 'kundenliste', 'customer', 'customers', 'client', 'clients', 'crm',
        'عميل', 'عملاء', 'زبون', 'زبائن', 'الزبائن', 'العملاء',
        'suche', 'suchen', 'finde', 'finden', 'zeige', 'zeig', 'öffne', 'search', 'find', 'show', 'open',
        'ابحث', 'بحث', 'اعرض', 'عرض', 'افتح', 'هات', 'عن', 'في', 'من', 'كل', 'جميع',
        'alle', 'aller', 'all', 'liste', 'قائمة', 'list', 'bitte', 'please', 'من', 'فضلك'
      ]);

      const promptTokens = lowerPrompt
        .replace(/[.,\-_/\\():;!?\"'„“]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length >= 2 && !CUSTOMER_STOPWORDS.has(t));

      // 3. Filter customers
      let filteredCustomers = customers.filter(c => {
        // Customer type filter
        if (requestedCustTypeFilter) {
          const isB2B = Boolean(c.companyName || c.vatId || c.taxNumber);
          if (requestedCustTypeFilter === 'B2B' && !isB2B) return false;
          if (requestedCustTypeFilter === 'B2C' && isB2B) return false;
        }

        // If no prompt tokens extracted, include based on type
        if (promptTokens.length === 0) {
          return true;
        }

        const name = (c.name || '').toLowerCase();
        const company = (c.companyName || '').toLowerCase();
        const city = (c.city || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        const vatId = (c.vatId || '').toLowerCase();

        return promptTokens.some(tok => 
          name.includes(tok) ||
          company.includes(tok) ||
          city.includes(tok) ||
          email.includes(tok) ||
          phone.includes(tok) ||
          vatId.includes(tok)
        );
      });

      // If strict customerSearchResult has exact matches, prefer those
      if (customerSearchResult.matches.length > 0 && customerSearchResult.matchType !== 'NONE') {
        filteredCustomers = customerSearchResult.matches;
      }

      const activeCustSearchQuery = promptTokens.join(' ');

      if (filteredCustomers.length === 1) {
        const matchedCustomer = filteredCustomers[0];
        let singleCustDirectReply = '';
        if (lang === 'ar') {
          singleCustDirectReply = `👤 **تم فتح بطاقة العميل مباشرة:** **${matchedCustomer.name}** ${matchedCustomer.companyName ? '(' + matchedCustomer.companyName + ')' : ''}\n\n` +
            `• **النوع:** ${matchedCustomer.companyName ? '🏢 شركة (B2B)' : '👤 فرد (B2C)'}\n` +
            `• **العنوان:** ${matchedCustomer.street || ''}, ${matchedCustomer.postalCode || ''} ${matchedCustomer.city || 'غير محدد'}\n` +
            `• **البريد الإلكتروني:** ${matchedCustomer.email || 'غير محدد'} | **الهاتف:** ${matchedCustomer.phone || 'غير محدد'}\n` +
            (matchedCustomer.vatId ? `• **الرقم الضريبي USt-IdNr:** \`${matchedCustomer.vatId}\`\n` : '') +
            `\n*تم تحميل ملف العميل بالكامل في الطبقة الثانية وهو جاهز للاستخدام.*`;
        } else if (lang === 'en') {
          singleCustDirectReply = `👤 **Customer File Opened in Layer 2:** **${matchedCustomer.name}** ${matchedCustomer.companyName ? '(' + matchedCustomer.companyName + ')' : ''}\n\n` +
            `• **Type:** ${matchedCustomer.companyName ? '🏢 Corporate (B2B)' : '👤 Individual (B2C)'}\n` +
            `• **Address:** ${matchedCustomer.street || ''}, ${matchedCustomer.postalCode || ''} ${matchedCustomer.city || 'N/A'}\n` +
            `• **Email:** ${matchedCustomer.email || 'N/A'} | **Phone:** ${matchedCustomer.phone || 'N/A'}\n` +
            (matchedCustomer.vatId ? `• **VAT ID:** \`${matchedCustomer.vatId}\`\n` : '') +
            `\n*Customer file loaded in Layer 2 CRM.*`;
        } else {
          singleCustDirectReply = `👤 **Kundenkartei in Schicht 2 geöffnet:** **${matchedCustomer.name}** ${matchedCustomer.companyName ? '(' + matchedCustomer.companyName + ')' : ''}\n\n` +
            `• **Typ:** ${matchedCustomer.companyName ? '🏢 Geschäftskunde (B2B)' : '👤 Privatkunde (B2C)'}\n` +
            `• **Adresse:** ${matchedCustomer.street || ''}, ${matchedCustomer.postalCode || ''} ${matchedCustomer.city || 'k.A.'}\n` +
            `• **E-Mail:** ${matchedCustomer.email || 'k.A.'} | **Telefon:** ${matchedCustomer.phone || 'k.A.'}\n` +
            (matchedCustomer.vatId ? `• **USt-IdNr.:** \`${matchedCustomer.vatId}\`\n` : '') +
            `\n*Die Kundenkartei wurde in Schicht 2 geladen.*`;
        }

        return {
          matched: true,
          layer: 'LAYER_2_ENTITY_FORMS',
          targetTab: 'kunden',
          disambiguationRequired: false,
          matchedCustomers: [matchedCustomer],
          preFillData: { 
            customer: matchedCustomer,
            searchQuery: matchedCustomer.name,
            filterType: requestedCustTypeFilter
          },
          extractedSearchTerm: matchedCustomer.name,
          replyText: singleCustDirectReply,
          interactiveActions: [
            {
              id: `act_open_cust_details_${matchedCustomer.id}`,
              type: 'open_customer',
              label: lang === 'ar' ? `👤 فتح ملف العميل ${matchedCustomer.name}` : (lang === 'en' ? `👤 Open Customer File (${matchedCustomer.name})` : `👤 Kundenkartei von ${matchedCustomer.name} öffnen`),
              badge: 'CRM',
              customerId: matchedCustomer.id,
              customerName: matchedCustomer.name,
              searchQuery: matchedCustomer.name,
              filterType: requestedCustTypeFilter
            },
            {
              id: `act_start_contract_cust_${matchedCustomer.id}`,
              type: 'open_operations',
              label: lang === 'ar' ? `📄 إنشاء عقد بيع لـ ${matchedCustomer.name}` : (lang === 'en' ? `📄 Create Sales Contract for ${matchedCustomer.name}` : `📄 Kaufvertrag für ${matchedCustomer.name} erstellen`),
              badge: lang === 'ar' ? 'العمليات' : (lang === 'en' ? 'Operations' : 'Operationen'),
              customerId: matchedCustomer.id,
              customerName: matchedCustomer.name,
              docType: 'kaufvertrag'
            }
          ]
        };
      } else if (filteredCustomers.length > 1) {
        let listText = filteredCustomers.slice(0, 5).map((c, i) => {
          const typeIcon = c.companyName ? '🏢' : '👤';
          return `${i + 1}. **${c.name}** ${c.companyName ? '(' + c.companyName + ')' : ''} — ${typeIcon} ${c.city || 'k.A.'} | 📞 ${c.phone || c.email || 'Keine Kontaktdaten'}`;
        }).join('\n');

        if (filteredCustomers.length > 5) {
          listText += `\n*...و ${filteredCustomers.length - 5} عملاء إضافيين في القائمة المفلترة.*`;
        }

        let ambigCustDirectReply = '';
        if (lang === 'ar') {
          ambigCustDirectReply = `👤 **تم العثور على ${filteredCustomers.length} عملاء مطابقين:**\n\n` +
            (requestedCustTypeFilter ? `• **الفلتر المطبق:** ${requestedCustTypeFilter === 'B2B' ? 'عملاء الشركات B2B' : 'الزبائن الأفراد B2C'}\n` : '') +
            `\n${listText}\n\n` +
            `*يرجى اختيار العميل لفتح بطاقته وملفه مباشرة أو فتح دليل العملاء المفلتر.*`;
        } else if (lang === 'en') {
          ambigCustDirectReply = `👤 **Found ${filteredCustomers.length} Matching Customers:**\n\n` +
            (requestedCustTypeFilter ? `• **Active Filter:** ${requestedCustTypeFilter}\n` : '') +
            `\n${listText}\n\n` +
            `*Select a customer to open their file directly or view the filtered CRM list.*`;
        } else {
          ambigCustDirectReply = `👤 **${filteredCustomers.length} passende Kunden gefunden:**\n\n` +
            (requestedCustTypeFilter ? `• **Aktiver Filter:** ${requestedCustTypeFilter}\n` : '') +
            `\n${listText}\n\n` +
            `*Bitte wählen Sie den Kunden aus oder öffnen Sie die gefilterte Kundenliste:*`;
        }

        const custActions: ChatInteractiveAction[] = [
          {
            id: 'act_open_filtered_kunden_view',
            type: 'open_customer',
            label: lang === 'ar' ? `👤 عرض قائمة العملاء المفلترة (${filteredCustomers.length})` : (lang === 'en' ? `👤 View Filtered Customers (${filteredCustomers.length})` : `👤 Gefilterte Kundenliste öffnen (${filteredCustomers.length})`),
            badge: lang === 'ar' ? 'العملاء' : (lang === 'en' ? 'CRM' : 'Kundenliste'),
            searchQuery: activeCustSearchQuery,
            filterType: requestedCustTypeFilter
          },
          ...filteredCustomers.slice(0, 4).map(c => ({
            id: `act_disambig_cust_${c.id}`,
            type: 'open_customer' as const,
            label: `👤 ${c.name}`,
            sublabel: `${c.companyName ? c.companyName + ' • ' : ''}${c.city ? c.city + ' • ' : ''}${c.email || c.phone || 'Keine Kontaktdaten'}`,
            badge: lang === 'ar' ? 'فتح ملف العميل' : (lang === 'en' ? 'Open Customer' : 'In Schicht 2 öffnen'),
            customerId: c.id,
            customerName: c.name,
            searchQuery: activeCustSearchQuery,
            filterType: requestedCustTypeFilter
          }))
        ];

        return {
          matched: true,
          layer: 'LAYER_2_ENTITY_FORMS',
          targetTab: 'kunden',
          disambiguationRequired: true,
          matchedCustomers: filteredCustomers,
          preFillData: {
            searchQuery: activeCustSearchQuery,
            filterType: requestedCustTypeFilter
          },
          extractedSearchTerm: activeCustSearchQuery,
          replyText: ambigCustDirectReply,
          interactiveActions: custActions
        };
      } else {
        // 0 Customers Found
        let noCustReply = '';
        if (lang === 'ar') {
          noCustReply = `👤 **دليل العملاء:** لم يتم العثور على عملاء مطابقين لبحثك ` +
            (activeCustSearchQuery ? `("${activeCustSearchQuery}")` : '') +
            (requestedCustTypeFilter ? ` من نوع (${requestedCustTypeFilter})` : '') +
            `.\n\nأفتح لك دليل العملاء العام لمعاينة كامل السجلات أو إضافة عميل جديد.`;
        } else if (lang === 'en') {
          noCustReply = `👤 **Customer CRM:** No customers found matching your query ` +
            (activeCustSearchQuery ? `("${activeCustSearchQuery}")` : '') +
            `.\n\nOpening the CRM directory for full overview.`;
        } else {
          noCustReply = `👤 **Kundenkartei:** Keine Kunden gefunden für Ihre Anfrage ` +
            (activeCustSearchQuery ? `(„${activeCustSearchQuery}“)` : '') +
            `.\n\nIch öffne die Kundenkartei für Sie.`;
        }

        return {
          matched: true,
          layer: 'LAYER_2_ENTITY_FORMS',
          targetTab: 'kunden',
          disambiguationRequired: false,
          preFillData: {
            searchQuery: activeCustSearchQuery,
            filterType: requestedCustTypeFilter
          },
          extractedSearchTerm: activeCustSearchQuery,
          replyText: noCustReply,
          interactiveActions: [
            {
              id: 'act_open_kunden_tab',
              type: 'open_customer',
              label: lang === 'ar' ? '👤 فتح دليل العملاء' : (lang === 'en' ? '👤 Open Customer CRM' : '👤 Kundenliste öffnen'),
              badge: lang === 'ar' ? 'العملاء' : (lang === 'en' ? 'CRM' : 'Kundenkartei'),
              searchQuery: activeCustSearchQuery,
              filterType: requestedCustTypeFilter
            }
          ]
        };
      }
    }

    // -------------------------------------------------------------
    // 1. COMPOUND MULTI-LAYER WORKFLOW MATCHING (Highest Precision)
    // -------------------------------------------------------------
    const compoundWorkflows = this.getCompoundWorkflows();
    for (const cw of compoundWorkflows) {
      const matchKw = cw.keywords.find(kw => lowerPrompt.includes(kw.toLowerCase()));
      if (matchKw) {
        // E.g., Adding a cash payment for vehicle
        if (cw.compoundId === 'CW_ADD_VEHICLE_PAYMENT') {
          const vehName = matchedVehicle ? `${matchedVehicle.brand} ${matchedVehicle.model}` : (lang === 'ar' ? 'السيارة' : (lang === 'en' ? 'Vehicle' : 'Fahrzeug'));
          const amountText = extractedAmount ? `${extractedAmount.toLocaleString('de-DE')} €` : (lang === 'ar' ? 'المبلغ' : (lang === 'en' ? 'Amount' : 'Betrag'));
          const dateText = extractedDate || new Date().toLocaleDateString('de-DE');

          // Strict check: if vehicle is ambiguous, require user disambiguation!
          if (vehicleSearchResult.isAmbiguous) {
            const disambigActions: ChatInteractiveAction[] = vehicleSearchResult.matches.map(v => ({
              id: `act_sel_veh_pay_${v.id}`,
              type: 'open_finanzen',
              label: lang === 'ar' ? `💰 تسجيل لـ ${v.brand} ${v.model}` : (lang === 'en' ? `💰 Record for ${v.brand} ${v.model}` : `💰 Für ${v.brand} ${v.model} buchen`),
              sublabel: `FIN: ${v.vin || 'k.A.'} • ${(v.sellingPrice || 0).toLocaleString('de-DE')} €`,
              badge: lang === 'ar' ? 'اختيار السيارة' : (lang === 'en' ? 'Select Vehicle' : 'Fahrzeug wählen'),
              vehicleId: v.id
            }));

            let ambigPayVehReply = '';
            if (lang === 'ar') {
              ambigPayVehReply = `💳 **تسجيل دفعة (${amountText}): يلزم اختيار السيارة**\n\nتم العثور على **${vehicleSearchResult.matches.length} سيارات مطابقة** في المخزن. يرجى اختيار السيارة المحددة لتسجيل الدفعة عليها:`;
            } else if (lang === 'en') {
              ambigPayVehReply = `💳 **Payment Recording (${amountText}): Vehicle Selection Required**\n\nFound **${vehicleSearchResult.matches.length} matching vehicles** in stock. Please choose the exact vehicle for payment booking:`;
            } else {
              ambigPayVehReply = `💳 **Zahlungserfassung (${amountText}): Fahrzeugauswahl erforderlich**\n\nEs wurden **${vehicleSearchResult.matches.length} passende Fahrzeuge** im Bestand gefunden. Bitte wählen Sie das genaue Fahrzeug aus, auf das die Zahlung verbucht werden soll:`;
            }

            return {
              matched: true,
              layer: 'COMPOUND_MULTI_LAYER',
              compoundWorkflow: cw,
              targetTab: 'finanzen',
              disambiguationRequired: true,
              matchedVehicles: vehicleSearchResult.matches,
              replyText: ambigPayVehReply,
              interactiveActions: disambigActions
            };
          }

          let reply = '';
          if (lang === 'ar') {
            reply = matchedVehicle
              ? `💳 **عملية متعددة الطبقات (المالية والكاسة):**\n\n` +
                `• **الطبقة 1 (التنقل):** فتح قسم المالية ودفتر الكاسة.\n` +
                `• **الطبقة 2 (الحقول):** تجهيز إيداع نقدي لـ **${vehName}** (الهيكل: ${matchedVehicle.vin || 'غير محدد'}) بمبلغ **${amountText}** بتاريخ **${dateText}**.\n` +
                `• **الطبقة 3 (التنفيذ):** تسجيل الحركة متوافقة مع GoBD وتحديث رصيد السيارة.`
              : `💳 **تسجيل الدفعة:** يرجى اختيار السيارة المراد تسجيل الدفعة لها (${amountText}).`;
          } else if (lang === 'en') {
            reply = matchedVehicle
              ? `💳 **Multi-Layer Operation (Finance & Cashbook):**\n\n` +
                `• **Layer 1 (Navigation):** Opened Finance & Cashbook module.\n` +
                `• **Layer 2 (Inputs):** Formatted cash deposit for **${vehName}** (VIN: ${matchedVehicle.vin || 'N/A'}) with **${amountText}** on **${dateText}**.\n` +
                `• **Layer 3 (Execution):** Transaction registered in compliance with GoBD and vehicle balance updated.`
              : `💳 **Payment Recording:** Please select the vehicle for which the payment (${amountText}) should be booked.`;
          } else {
            reply = matchedVehicle
              ? `💳 **Mehrschichtige Operation (Finanzen & Kassenbuch):**\n\n` +
                `• **Layer 1 (Navigation):** Bereich Finanzen & Kassenbuch geöffnet.\n` +
                `• **Layer 2 (Eingabefelder):** Bareinzahlung für **${vehName}** (FIN: ${matchedVehicle.vin || 'k.A.'}) über **${amountText}** am **${dateText}** strukturiert.\n` +
                `• **Layer 3 (Ausführung):** Buchung wird GoBD-konform im Kassenbuch eingetragen und der Fahrzeugsaldo aktualisiert.`
              : `💳 **Zahlungserfassung:** Bitte wählen Sie das Fahrzeug aus, für das die Zahlung (${amountText}) verbucht werden soll.`;
          }

          const interactiveActions: ChatInteractiveAction[] = [];
          if (matchedVehicle) {
            interactiveActions.push({
              id: `act_book_payment_${matchedVehicle.id}`,
              type: 'open_finanzen',
              label: lang === 'ar' ? `💰 تسجيل ${amountText} في الكاسة الآن` : (lang === 'en' ? `💰 Book ${amountText} in Cashbook now` : `💰 Jetzt ${amountText} im Kassenbuch buchen`),
              sublabel: `${vehName} (${extractedPaymentMethod})`,
              badge: lang === 'ar' ? 'تنفيذ الطبقة 3' : (lang === 'en' ? 'Layer 3 Execution' : 'Layer 3 Ausführung'),
              vehicleId: matchedVehicle.id
            });
          }

          return {
            matched: true,
            layer: 'COMPOUND_MULTI_LAYER',
            compoundWorkflow: cw,
            targetTab: 'finanzen',
            preFillData: {
              vehicle: matchedVehicle,
              amount: extractedAmount,
              date: extractedDate,
              paymentMethod: extractedPaymentMethod
            },
            matchedVehicles: matchedVehiclesList,
            replyText: reply,
            interactiveActions,
            executionPlan: {
              layer1: { action: 'NAVIGATE_TO_TAB', tabKey: 'finanzen', entityId: matchedVehicle?.id },
              layer2: {
                sectionId: 'FORM_FINANCE_TRANSACTION_ADD',
                fields: {
                  type: 'EINNAHME',
                  category: 'ANZAHLUNG',
                  amount: extractedAmount,
                  date: extractedDate,
                  paymentMethod: extractedPaymentMethod,
                  vehicleId: matchedVehicle?.id
                }
              },
              layer3: { operations: ['OP_SAVE_FINANCE_ENTRY', 'OP_UPDATE_VEHICLE_BALANCE'] }
            }
          };
        }

        // E.g., Creating contract for car & customer
        if (cw.compoundId === 'CW_CREATE_CONTRACT_WITH_CUSTOMER_AND_CAR') {
          // If customer search is ambiguous, require user selection
          if (customerSearchResult.isAmbiguous) {
            const custDisambigActions: ChatInteractiveAction[] = customerSearchResult.matches.map(c => ({
              id: `act_sel_cust_ctr_${c.id}`,
              type: 'open_operations',
              label: lang === 'ar' ? `👤 اختيار ${c.name} كمشتري` : (lang === 'en' ? `👤 Select ${c.name} as Buyer` : `👤 ${c.name} als Käufer wählen`),
              sublabel: `${c.city ? c.city + ' • ' : ''}${c.email || c.phone || 'Keine Kontaktdaten'}`,
              badge: lang === 'ar' ? 'اختيار المشتري' : (lang === 'en' ? 'Select Buyer' : 'Käufer wählen'),
              customerId: c.id,
              customerName: c.name,
              vehicleId: matchedVehicle?.id,
              docType: 'kaufvertrag'
            }));

            let ambigCustCtrReply = '';
            if (lang === 'ar') {
              ambigCustCtrReply = `📝 **إنشاء عقد بيع: يلزم اختيار العميل**\n\nتم العثور على **${customerSearchResult.matches.length} عملاء** باسم "${customerSearchResult.query}". يرجى اختيار المشتري المطلوب:`;
            } else if (lang === 'en') {
              ambigCustCtrReply = `📝 **Create Contract: Customer Selection Required**\n\nFound **${customerSearchResult.matches.length} customers** named "${customerSearchResult.query}". Please select the buyer:`;
            } else {
              ambigCustCtrReply = `📝 **Kaufvertrag erstellen: Kundenauswahl erforderlich**\n\nEs wurden **${customerSearchResult.matches.length} Kunden** mit dem Namen „${customerSearchResult.query}“ gefunden. Bitte wählen Sie den gewünschten Käufer aus:`;
            }

            return {
              matched: true,
              layer: 'COMPOUND_MULTI_LAYER',
              compoundWorkflow: cw,
              targetTab: 'operationen',
              disambiguationRequired: true,
              matchedCustomers: customerSearchResult.matches,
              replyText: ambigCustCtrReply,
              interactiveActions: custDisambigActions
            };
          }

          // If vehicle search is ambiguous, require vehicle selection
          if (vehicleSearchResult.isAmbiguous) {
            const vehDisambigActions: ChatInteractiveAction[] = vehicleSearchResult.matches.map(v => ({
              id: `act_sel_veh_ctr_${v.id}`,
              type: 'open_operations',
              label: `🚗 ${v.brand} ${v.model} (${(v.sellingPrice || 0).toLocaleString('de-DE')} €)`,
              sublabel: `FIN: ${v.vin ? '...' + v.vin.slice(-7) : 'k.A.'}`,
              badge: lang === 'ar' ? 'اختيار السيارة' : (lang === 'en' ? 'Select Vehicle' : 'Fahrzeug wählen'),
              vehicleId: v.id,
              customerId: matchedCustomer?.id,
              docType: 'kaufvertrag'
            }));

            let ambigVehCtrReply = '';
            if (lang === 'ar') {
              ambigVehCtrReply = `📝 **إنشاء عقد بيع: يلزم اختيار السيارة**\n\nتم العثور على **${vehicleSearchResult.matches.length} سيارات مطابقة**. يرجى اختيار سيارة العقد:`;
            } else if (lang === 'en') {
              ambigVehCtrReply = `📝 **Create Contract: Vehicle Selection Required**\n\nFound **${vehicleSearchResult.matches.length} matching vehicles**. Please select the car for the contract:`;
            } else {
              ambigVehCtrReply = `📝 **Kaufvertrag erstellen: Fahrzeugauswahl erforderlich**\n\nEs wurden **${vehicleSearchResult.matches.length} passende Fahrzeuge** gefunden. Bitte wählen Sie das Fahrzeug für den Vertrag aus:`;
            }

            return {
              matched: true,
              layer: 'COMPOUND_MULTI_LAYER',
              compoundWorkflow: cw,
              targetTab: 'operationen',
              disambiguationRequired: true,
              matchedVehicles: vehicleSearchResult.matches,
              replyText: ambigVehCtrReply,
              interactiveActions: vehDisambigActions
            };
          }

          const vehName = matchedVehicle ? `${matchedVehicle.brand} ${matchedVehicle.model}` : (lang === 'ar' ? 'السيارة' : (lang === 'en' ? 'Vehicle' : 'Fahrzeug'));
          const custName = matchedCustomer ? matchedCustomer.name : (lang === 'ar' ? 'العميل' : (lang === 'en' ? 'Customer' : 'Kunde'));

          let reply = '';
          if (lang === 'ar') {
            reply = 
              `📝 **عملية متعددة الطبقات (إنشاء عقد بيع):**\n\n` +
              `• **الطبقة 1 (التنقل):** فتح مركز العمليات والوثائق.\n` +
              `• **الطبقة 2 (ربط البيانات):** ربط السيارة **${vehName}** بالمشتري **${custName}**.\n` +
              `• **الطبقة 3 (التنفيذ):** إنشاء مسودة العقد القانوني وتجهيز المعاينة.`;
          } else if (lang === 'en') {
            reply = 
              `📝 **Multi-Layer Operation (Create Sales Contract):**\n\n` +
              `• **Layer 1 (Navigation):** Document Operations Hub opened.\n` +
              `• **Layer 2 (Data Binding):** Linking **${vehName}** with buyer **${custName}**.\n` +
              `• **Layer 3 (Execution):** Contract draft generated with legally verified clauses.`;
          } else {
            reply = 
              `📝 **Mehrschichtige Operation (Kaufvertrag erstellen):**\n\n` +
              `• **Layer 1 (Navigation):** Dokumenten-Zentrum (Operationen) geöffnet.\n` +
              `• **Layer 2 (Datenbindung):** Verknüpfe **${vehName}** mit Käufer **${custName}**.\n` +
              `• **Layer 3 (Ausführung):** Vertragsentwurf mit rechtssicheren Klauseln generiert.`;
          }

          const interactiveActions: ChatInteractiveAction[] = [
            {
              id: 'act_open_contract_ready',
              type: 'open_operations',
              label: lang === 'ar' ? `📄 فتح عقد البيع (${vehName})` : (lang === 'en' ? `📄 Open Sales Contract (${vehName})` : `📄 Kaufvertrag (${vehName}) öffnen`),
              sublabel: custName,
              badge: lang === 'ar' ? 'معاينة الطبقة 3' : (lang === 'en' ? 'Layer 3 Preview' : 'Layer 3 Vorschau'),
              docType: 'kaufvertrag',
              vehicleId: matchedVehicle?.id,
              customerId: matchedCustomer?.id
            }
          ];

          return {
            matched: true,
            layer: 'COMPOUND_MULTI_LAYER',
            compoundWorkflow: cw,
            targetTab: 'operationen',
            preFillData: {
              documentType: 'KAUFVERTRAG',
              vehicle: matchedVehicle,
              customer: matchedCustomer,
              amount: extractedAmount
            },
            matchedVehicles: matchedVehiclesList,
            matchedCustomers: matchedCustomersList,
            replyText: reply,
            interactiveActions,
            executionPlan: {
              layer1: { action: 'NAVIGATE_TO_TAB', tabKey: 'operationen' },
              layer2: {
                sectionId: 'SEC_DOC_KAUFVERTRAG',
                fields: {
                  vehicleId: matchedVehicle?.id,
                  customerId: matchedCustomer?.id,
                  sellingPrice: extractedAmount || matchedVehicle?.sellingPrice
                }
              },
              layer3: { operations: ['OP_GENERATE_DRAFT', 'OP_RENDER_PDF_PREVIEW'] }
            }
          };
        }

        // E.g., Handover protocol
        if (cw.compoundId === 'CW_CREATE_HANDOVER_PROTOCOL') {
          if (vehicleSearchResult.isAmbiguous) {
            const vehDisambigActions: ChatInteractiveAction[] = vehicleSearchResult.matches.map(v => ({
              id: `act_sel_veh_handover_${v.id}`,
              type: 'open_operations',
              label: `📋 ${lang === 'ar' ? 'بروتوكول تسليم لـ' : 'Übergabeprotokoll für'} ${v.brand} ${v.model}`,
              sublabel: `FIN: ${v.vin || 'k.A.'}`,
              badge: lang === 'ar' ? 'اختيار السيارة' : (lang === 'en' ? 'Select Vehicle' : 'Fahrzeug wählen'),
              vehicleId: v.id,
              customerId: matchedCustomer?.id,
              docType: 'uebergabeprotokoll'
            }));

            let ambigHandoverReply = '';
            if (lang === 'ar') {
              ambigHandoverReply = `📋 **بروتوكول التسليم: يلزم اختيار السيارة**\n\nتم العثور على **${vehicleSearchResult.matches.length} سيارات**. يرجى اختيار السيارة المسلمة:`;
            } else if (lang === 'en') {
              ambigHandoverReply = `📋 **Handover Protocol: Vehicle Selection Required**\n\nFound **${vehicleSearchResult.matches.length} vehicles**. Please select the handed-over vehicle:`;
            } else {
              ambigHandoverReply = `📋 **Übergabeprotokoll: Fahrzeugauswahl erforderlich**\n\nEs wurden **${vehicleSearchResult.matches.length} Fahrzeuge** gefunden. Bitte wählen Sie das übergebene Fahrzeug:`;
            }

            return {
              matched: true,
              layer: 'COMPOUND_MULTI_LAYER',
              compoundWorkflow: cw,
              targetTab: 'operationen',
              disambiguationRequired: true,
              matchedVehicles: vehicleSearchResult.matches,
              replyText: ambigHandoverReply,
              interactiveActions: vehDisambigActions
            };
          }

          let handoverReply = '';
          if (lang === 'ar') {
            handoverReply = `📋 **بدء إعداد بروتوكول التسليم (Übergabeprotokoll):** تم تجهيز بنود الفحص (رخصة السيارة الجزء 1 و 2، شهادة المطابقة COC، الفحص الفني TÜV، المفاتيح، الملحقات) للتسليم.`;
          } else if (lang === 'en') {
            handoverReply = `📋 **Handover Protocol Workflow Started:** All checklist items (Registration Part I & II, COC, TÜV, keys, accessories) prepared for delivery.`;
          } else {
            handoverReply = `📋 **Übergabeprotokoll-Workflow gestartet:** Alle Checklisten-Punkte (Zulassungsbescheinigung Teil I & II, COC, TÜV, Schlüssel, Zubehör) sind für die Auslieferung vorbereitet.`;
          }

          return {
            matched: true,
            layer: 'COMPOUND_MULTI_LAYER',
            compoundWorkflow: cw,
            targetTab: 'operationen',
            preFillData: {
              documentType: 'UEBERGABEPROTOKOLL',
              vehicle: matchedVehicle,
              customer: matchedCustomer
            },
            replyText: handoverReply,
            interactiveActions: [
              {
                id: 'act_open_handover_protocol',
                type: 'open_operations',
                label: lang === 'ar' ? '📋 فتح وفحص بروتوكول التسليم' : (lang === 'en' ? '📋 Open & Review Handover Protocol' : '📋 Übergabeprotokoll öffnen & prüfen'),
                badge: lang === 'ar' ? 'تسليم السيارة' : (lang === 'en' ? 'Delivery' : 'Auslieferung'),
                docType: 'uebergabeprotokoll',
                vehicleId: matchedVehicle?.id,
                customerId: matchedCustomer?.id
              }
            ]
          };
        }
      }
    }

    // -------------------------------------------------------------
    // 2. LAYER 3: OPERATIONAL EXECUTION MATCHING (Print, Export, PDF)
    // -------------------------------------------------------------
    const layer3Ops = this.getLayer3Operations();
    for (const op of layer3Ops) {
      const matchKw = op.keywords.find(kw => lowerPrompt.includes(kw.toLowerCase()));
      if (matchKw) {
        if (op.opId === 'OP_PRINT_DOCUMENT') {
          let printReply = '';
          if (lang === 'ar') printReply = `🖨️ **تنفيذ الطبقة 3 (الطباعة):** جاري تجهيز الوثيقة للطباعة المباشرة بصيغة DIN-A4.`;
          else if (lang === 'en') printReply = `🖨️ **Layer 3 Execution (Printing):** Document formatted for direct DIN-A4 printing.`;
          else printReply = `🖨️ **Layer 3 Ausführung (Drucken):** Das Dokument wird für den direkten DIN-A4-Druck aufbereitet.`;

          return {
            matched: true,
            layer: 'LAYER_3_OPERATIONAL_EXECUTION',
            layer3Operation: op,
            targetTab: 'operationen',
            replyText: printReply,
            interactiveActions: [
              {
                id: 'act_print_exec',
                type: 'open_operations',
                label: lang === 'ar' ? '🖨️ فتح نافذة الطباعة' : (lang === 'en' ? '🖨️ Open Print Dialog' : '🖨️ Druckdialog aufrufen'),
                badge: lang === 'ar' ? 'طباعة' : (lang === 'en' ? 'Print' : 'Drucken')
              }
            ]
          };
        }

        if (op.opId === 'OP_DOWNLOAD_PDF') {
          let pdfReply = '';
          if (lang === 'ar') pdfReply = `📥 **تنفيذ الطبقة 3 (تحميل PDF):** الوثيقة جاهزة كملف PDF عالي الدقة.`;
          else if (lang === 'en') pdfReply = `📥 **Layer 3 Execution (PDF Download):** Document is ready as high-resolution PDF.`;
          else pdfReply = `📥 **Layer 3 Ausführung (PDF-Download):** Das Dokument steht als hochauflösendes PDF bereit.`;

          return {
            matched: true,
            layer: 'LAYER_3_OPERATIONAL_EXECUTION',
            layer3Operation: op,
            targetTab: 'operationen',
            replyText: pdfReply,
            interactiveActions: [
              {
                id: 'act_pdf_download',
                type: 'open_operations',
                label: lang === 'ar' ? '📥 تحميل ملف PDF' : (lang === 'en' ? '📥 Download PDF' : '📥 PDF herunterladen'),
                badge: 'PDF'
              }
            ]
          };
        }

        if (op.opId === 'OP_EXPORT_XML_ERECHNUNG') {
          let xmlReply = '';
          if (lang === 'ar') xmlReply = `⚡ **تنفيذ الطبقة 3 (تصدير الفاتورة الإلكترونية E-Rechnung XML):** تم إنشاء ملف المعيار الأوروبي EN 16931 / ZUGFeRD 2.2.`;
          else if (lang === 'en') xmlReply = `⚡ **Layer 3 Execution (E-Invoice XML):** EN 16931 / ZUGFeRD 2.2 XML dataset generated.`;
          else xmlReply = `⚡ **Layer 3 Ausführung (E-Rechnung XML):** Der EN 16931 / ZUGFeRD 2.2 Datensatz wird erzeugt.`;

          return {
            matched: true,
            layer: 'LAYER_3_OPERATIONAL_EXECUTION',
            layer3Operation: op,
            targetTab: 'operationen',
            replyText: xmlReply,
            interactiveActions: [
              {
                id: 'act_xml_export',
                type: 'open_operations',
                label: lang === 'ar' ? '⚡ تصدير E-Rechnung XML' : (lang === 'en' ? '⚡ Export E-Invoice XML' : '⚡ E-Rechnung XML exportieren'),
                badge: 'ZUGFeRD / XRechnung',
                docType: 'e_rechnung'
              }
            ]
          };
        }

        if (op.opId === 'OP_SEND_EMAIL_DOCUMENT') {
          let emailReply = '';
          if (lang === 'ar') emailReply = `✉️ **تنفيذ الطبقة 3 (إرسال بالبريد الإلكتروني):** جاهز لإرسال الوثيقة كملف PDF مباشرة إلى البريد الإلكتروني للمشتري.`;
          else if (lang === 'en') emailReply = `✉️ **Layer 3 Execution (Email Sending):** Ready to send document as PDF directly to customer email.`;
          else emailReply = `✉️ **Layer 3 Ausführung (E-Mail-Versand):** Bereitstellung für den direkten E-Mail-Versand des Dokuments als PDF an den Kunden.`;

          return {
            matched: true,
            layer: 'LAYER_3_OPERATIONAL_EXECUTION',
            layer3Operation: op,
            targetTab: 'operationen',
            replyText: emailReply,
            interactiveActions: [
              {
                id: 'act_email_send',
                type: 'open_operations',
                label: lang === 'ar' ? '✉️ إرسال عبر البريد للمشتري' : (lang === 'en' ? '✉️ Send via Email to Buyer' : '✉️ Per E-Mail an Käufer senden'),
                badge: 'E-Mail'
              }
            ]
          };
        }

        if (op.opId === 'OP_EXPORT_DATEV_CSV') {
          let datevReply = '';
          if (lang === 'ar') datevReply = `📊 **تنفيذ الطبقة 3 (تصدير DATEV CSV):** تصدير سجلات القيود المحاسبية للمستشار الضريبي.`;
          else if (lang === 'en') datevReply = `📊 **Layer 3 Execution (DATEV CSV):** Exporting accounting booking batches for tax advisor.`;
          else datevReply = `📊 **Layer 3 Ausführung (DATEV CSV):** Export aller Buchungsstapel für den Steuerberater.`;

          return {
            matched: true,
            layer: 'LAYER_3_OPERATIONAL_EXECUTION',
            layer3Operation: op,
            targetTab: 'finanzen',
            replyText: datevReply,
            interactiveActions: [
              {
                id: 'act_datev_csv',
                type: 'open_finanzen',
                label: lang === 'ar' ? '📊 الانتقال للمالية وتصدير DATEV' : (lang === 'en' ? '📊 Go to Finance & DATEV Export' : '📊 Zu den Finanzen & DATEV Export'),
                badge: 'DATEV'
              }
            ]
          };
        }
      }
    }

    // -------------------------------------------------------------
    // 3. LAYER 2: DETAIL FORMS & DOCUMENT SECTIONS MATCHING
    // -------------------------------------------------------------
    const layer2Sections = this.getLayer2Sections();
    for (const sec of layer2Sections) {
      const matchKw = sec.keywords.find(kw => lowerPrompt.includes(kw.toLowerCase()));
      if (matchKw) {
        if (sec.documentType) {
          const docType = sec.documentType as any;
          const targetTab: NavTab = 'operationen';

          let docSecReply = '';
          if (lang === 'ar') docSecReply = `📋 **الطبقة 2 (نموذج ${sec.title}):** فتح نافذة إدخال بيانات ${sec.title} مع تحديد الحقول المطلوبة.`;
          else if (lang === 'en') docSecReply = `📋 **Layer 2 (Form ${sec.title}):** Opening form for ${sec.title} with mandatory fields defined.`;
          else docSecReply = `📋 **Layer 2 (Formular ${sec.title}):** Ich öffne die Eingabemaske für ${sec.title}. Alle Pflichtfelder sind definiert.`;

          return {
            matched: true,
            layer: 'LAYER_2_ENTITY_FORMS',
            layer2Section: sec,
            targetTab,
            preFillData: {
              documentType: docType,
              vehicle: matchedVehicle,
              customer: matchedCustomer,
              amount: extractedAmount
            },
            replyText: docSecReply,
            interactiveActions: [
              {
                id: `act_open_sec_${sec.sectionId}`,
                type: 'open_operations',
                label: lang === 'ar' ? `📝 فتح ${sec.title}` : (lang === 'en' ? `📝 Open ${sec.title}` : `📝 ${sec.title} öffnen`),
                badge: sec.documentType,
                docType: sec.documentType.toLowerCase() as any
              }
            ]
          };
        }

        if (sec.sectionId === 'FORM_VEHICLE_ALL_FIELDS') {
          let newVehReply = '';
          if (lang === 'ar') newVehReply = `🚗 **الطبقة 2 (إدخال سيارة جديدة):** يمكنك إدخال المواصفات التقنية ورقم الهيكل FIN و HSN/TSN والمواصفات الكاملة.`;
          else if (lang === 'en') newVehReply = `🚗 **Layer 2 (New Vehicle Entry):** Enter technical specs, HSN/TSN, VIN and equipment list.`;
          else newVehReply = `🚗 **Layer 2 (Fahrzeug-Neuaufnahme):** Sie können alle technischen Parameter, HSN/TSN, FIN und Ausstattungsmerkmale eingeben.`;

          return {
            matched: true,
            layer: 'LAYER_2_ENTITY_FORMS',
            layer2Section: sec,
            targetTab: 'neu',
            replyText: newVehReply,
            interactiveActions: [
              {
                id: 'act_open_neu_form',
                type: 'open_neu',
                label: lang === 'ar' ? '➕ إضافة سيارة جديدة' : (lang === 'en' ? '➕ Add New Vehicle' : '➕ Neues Fahrzeug anlegen'),
                badge: lang === 'ar' ? 'إدخال جديد' : (lang === 'en' ? 'Intake' : 'Neuaufnahme')
              }
            ]
          };
        }

        if (sec.sectionId === 'FORM_CUSTOMER_ALL_FIELDS') {
          let newCustReply = '';
          if (lang === 'ar') newCustReply = `👤 **الطبقة 2 (بيانات العملاء CRM):** تسجيل بيانات الاتصال والعناوين والبيانات الضريبية للأفراد والشركات.`;
          else if (lang === 'en') newCustReply = `👤 **Layer 2 (Customer CRM Master Data):** Record contact info, addresses, and tax ID for private/business customers.`;
          else newCustReply = `👤 **Layer 2 (Kunden-Stammdaten):** Erfassung aller Kontaktdaten, Adressen und USt-IdNr für Privat- und Firmenkunden.`;

          return {
            matched: true,
            layer: 'LAYER_2_ENTITY_FORMS',
            layer2Section: sec,
            targetTab: 'kunden',
            replyText: newCustReply,
            interactiveActions: [
              {
                id: 'act_open_crm_form',
                type: 'open_customer',
                label: lang === 'ar' ? '👤 فتح سجل العملاء' : (lang === 'en' ? '👤 Open Customer File' : '👤 Kundenkartei öffnen'),
                badge: 'CRM'
              }
            ]
          };
        }
      }
    }

    // -------------------------------------------------------------
    // 4. LAYER 1: MACRO NAVIGATION & TOP-LEVEL VIEWS MATCHING
    // -------------------------------------------------------------
    const layer1Views = this.getLayer1Views();
    for (const view of layer1Views) {
      const matchKw = view.keywords.find(kw => lowerPrompt.includes(kw.toLowerCase()));
      if (matchKw) {
        let actionType: ChatInteractiveAction['type'] = 'open_lager';
        if (view.tabKey === 'operationen') actionType = 'open_operations';
        else if (view.tabKey === 'finanzen') actionType = 'open_finanzen';
        else if (view.tabKey === 'rechnungen') actionType = 'open_rechnungen';
        else if (view.tabKey === 'kunden') actionType = 'open_customer';
        else if (view.tabKey === 'neu') actionType = 'open_neu';
        else if (view.tabKey === 'hub') actionType = 'open_hub';
        else if (view.tabKey === 'einstellungen') actionType = 'open_einstellungen';
        else if (view.tabKey === 'showroom') actionType = 'open_showroom';

        let navReply = '';
        if (lang === 'ar') navReply = `🧭 **الطبقة 1 (التنقل):** فتح قسم **${view.title}** (${view.description}).`;
        else if (lang === 'en') navReply = `🧭 **Layer 1 (Navigation):** Opening **${view.title}** section (${view.description}).`;
        else navReply = `🧭 **Layer 1 (Navigation):** Ich öffne den Bereich **${view.title}** (${view.description}).`;

        return {
          matched: true,
          layer: 'LAYER_1_NAVIGATION_MACRO',
          layer1View: view,
          targetTab: view.tabKey,
          replyText: navReply,
          interactiveActions: [
            {
              id: `act_nav_${view.id}`,
              type: actionType,
              label: lang === 'ar' ? `🧭 الانتقال إلى ${view.title}` : (lang === 'en' ? `🧭 Go to ${view.title}` : `🧭 Zu ${view.title}`),
              badge: lang === 'ar' ? 'التنقل' : (lang === 'en' ? 'Navigation' : 'Navigation')
            }
          ]
        };
      }
    }

    // No deterministic rule matched
    return {
      matched: false
    };
  }
};
