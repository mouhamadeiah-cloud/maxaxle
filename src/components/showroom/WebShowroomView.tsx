import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Globe, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Car, 
  Wrench, 
  Layers, 
  Sparkles, 
  Bot, 
  Send, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  SlidersHorizontal, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Info,
  Maximize2,
  Minimize2,
  FileText,
  Building2,
  Gauge,
  Fuel,
  Settings as SettingsIcon,
  Award,
  AlertCircle
} from 'lucide-react';
import { Vehicle, MerchantSettings, WebShowroomSettings } from '../../types';
import { firebaseService } from '../../services/firebaseService';
import { ShowroomVehicleFullScreenView } from './ShowroomVehicleFullScreenView';

interface WebShowroomViewProps {
  onBackToApp?: () => void;
  standalone?: boolean;
}

export const WebShowroomView: React.FC<WebShowroomViewProps> = ({ 
  onBackToApp,
  standalone = false 
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => firebaseService.getVehicles());
  const [settings, setSettings] = useState<MerchantSettings>(() => firebaseService.getMerchantSettings());
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedFuel, setSelectedFuel] = useState<string>('all');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [onlyVatDeductible, setOnlyVatDeductible] = useState(false);

  // Active expanded inspection tab for cards
  const [expandedTabs, setExpandedTabs] = useState<Record<string, 'mechanic' | 'body' | 'features' | null>>({});

  // Viewport simulator mode for dealer preview
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Contact / Test Drive Modal
  const [testDriveModalVehicle, setTestDriveModalVehicle] = useState<Vehicle | null>(null);
  const [testDriveName, setTestDriveName] = useState('');
  const [testDrivePhone, setTestDrivePhone] = useState('');
  const [testDriveEmail, setTestDriveEmail] = useState('');
  const [testDriveDate, setTestDriveDate] = useState('');
  const [testDriveSuccess, setTestDriveSuccess] = useState(false);

  // MAX AI Chatbot Drawer state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Global MAX FLEET Network Search Modal
  const [showNetworkSearchModal, setShowNetworkSearchModal] = useState(false);
  const [networkSearchQuery, setNetworkSearchQuery] = useState('');

  // Active Showroom Settings
  const showroomConfig: WebShowroomSettings = settings.showroomSettings || {
    enabled: true,
    showroomTitle: `${settings.companyName || 'Autohaus'} – Digitaler Showroom`,
    showroomSlogan: 'Geprüfte Premium-Fahrzeuge & Traumwagen mit Garantie',
    heroBgUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
    heroBgPreset: 'luxury_showroom',
    customDomain: 'www.autohaus-angebot.de',
    subdomainSlug: 'autohaus',
    whatsappNumber: settings.mobile || settings.phone || '+49 171 0000000',
    openingHours: {
      weekdays: 'Mo. - Fr.: 09:00 - 18:30 Uhr',
      saturday: 'Sa.: 10:00 - 15:00 Uhr',
      sunday: 'So.: Geschlossen'
    },
    legalImpressum: {
      companyName: settings.companyName || 'MaxFleet Autohandelsgruppe GmbH',
      representedBy: `Geschäftsführer: ${settings.responsiblePerson || 'Max Mustermann'}`,
      streetAddress: settings.street || 'Kurfürstendamm 210',
      zipCity: `${settings.postalCode || '10719'} ${settings.city || 'Berlin'}`,
      phone: settings.phone || '+49 30 8920100',
      email: settings.email || 'info@maxfleet-gruppe.de',
      registerCourt: settings.registerCourt || 'Amtsgericht Charlottenburg',
      registerNumber: settings.commercialRegister || 'HRB 198421 B',
      vatId: settings.vatId || 'DE 319 824 550',
      disclaimerText: 'Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz). Verbraucherinformation gem. Verordnung (EU) Nr. 524/2013: Europäische Plattform zur Online-Streitbeilegung.'
    },
    defaultShowMechanical: true,
    defaultShowBodywork: true,
    defaultShowFeatures: true,
    defaultShowVin: false,
    enableAiChatbot: true,
    aiChatbotWelcomeMessage: `Herzlich willkommen bei ${settings.companyName || 'unserem Autohaus'}! Ich bin MAX, Ihr persönlicher digitaler Showroom-Berater. Wie kann ich Ihnen zu unseren Fahrzeugen, Zustand oder Preisen weiterhelfen?`,
    dealerPreferredChatLanguage: 'de'
  };

  // Auto scroll to top on vehicle selection or filter navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [selectedVehicle, searchQuery, selectedBrand, selectedFuel, selectedTransmission, maxPrice]);

  // Sync with Firestore real-time updates
  useEffect(() => {
    const unsubVehicles = firebaseService.subscribeVehicles((updated) => setVehicles(updated));
    const unsubSettings = firebaseService.subscribeMerchantSettings((updated) => setSettings(updated));
    return () => {
      unsubVehicles();
      unsubSettings();
    };
  }, []);

  // Initialize Chat greeting if empty
  useEffect(() => {
    if (chatMessages.length === 0 && showroomConfig.enableAiChatbot) {
      setChatMessages([
        {
          role: 'assistant',
          content: showroomConfig.aiChatbotWelcomeMessage || 'Willkommen im digitalen Showroom! Ich bin MAX. Fragen Sie mich gerne nach dem Zustand der Motoren, Getriebe, Bremsen, Lack, Preisen oder MwSt.-Ausweis!'
        }
      ]);
    }
  }, [showroomConfig.enableAiChatbot]);

  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Filter vehicles that are marked for showroom (or available in stock)
  const showroomVehicles = useMemo(() => {
    return vehicles.filter(v => {
      // Must be marked for web showroom OR have status 'verfuegbar' / 'reserviert'
      const inShowroom = v.showInWebShowroom !== false && v.status !== 'verkauft';
      if (!inShowroom) return false;

      // Brand filter
      if (selectedBrand !== 'all' && v.brand !== selectedBrand) return false;

      // Fuel filter
      if (selectedFuel !== 'all' && v.fuelType !== selectedFuel) return false;

      // Transmission filter
      if (selectedTransmission !== 'all' && v.transmission !== selectedTransmission) return false;

      // Price filter
      if (v.sellingPrice > maxPrice) return false;

      // VAT filter
      if (onlyVatDeductible && v.taxType !== 'standard_19') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullTitle = `${v.brand} ${v.model} ${v.variant || ''} ${v.color || ''}`.toLowerCase();
        return fullTitle.includes(q) || (v.features || []).some(f => f.toLowerCase().includes(q));
      }

      return true;
    });
  }, [vehicles, selectedBrand, selectedFuel, selectedTransmission, maxPrice, onlyVatDeductible, searchQuery]);

  // Unique brands for filter
  const uniqueBrands = useMemo(() => {
    const brands = new Set(vehicles.map(v => v.brand));
    return Array.from(brands).sort();
  }, [vehicles]);

  const toggleTab = (vehicleId: string, tab: 'mechanic' | 'body' | 'features') => {
    setExpandedTabs(prev => ({
      ...prev,
      [vehicleId]: prev[vehicleId] === tab ? null : tab
    }));
  };

  const handleNextImage = (vehicleId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => ({
      ...prev,
      [vehicleId]: ((prev[vehicleId] || 0) + 1) % totalImages
    }));
  };

  const handlePrevImage = (vehicleId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => ({
      ...prev,
      [vehicleId]: ((prev[vehicleId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const handleOpenAiWithVehicle = (vehicle: Vehicle, customQuery?: string) => {
    setSelectedVehicle(vehicle);
    setIsChatOpen(true);
    const vehiclePrompt = customQuery || `Ich interessiere mich für den ${vehicle.brand} ${vehicle.model} (${vehicle.sellingPrice.toLocaleString('de-DE')} €). Wie ist der technische Zustand und ist die MwSt. ausweisbar?`;
    handleSendChatMessage(vehiclePrompt, vehicle);
  };

  const handleSendChatMessage = async (textToSend?: string, carContext?: Vehicle | null) => {
    const query = textToSend || chatInput.trim();
    if (!query || isChatLoading) return;

    const newMessages = [...chatMessages, { role: 'user' as const, content: query }];
    setChatMessages(newMessages);
    if (!textToSend) setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/ai/showroom-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          dealerName: settings.companyName || 'Autohaus',
          showroomInventory: vehicles.filter(v => v.showInWebShowroom !== false),
          selectedVehicle: carContext !== undefined ? carContext : selectedVehicle
        })
      });

      if (!response.ok) {
        throw new Error('Server-Fehler bei der KI-Antwort');
      }

      const data = await response.json();
      setChatMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      console.warn('AI chat error, using intelligent local showroom response fallback', err);
      
      // Fallback local rule-based response adhering strictly to price & condition
      let fallbackText = `Sehr gerne! Gerne gebe ich Ihnen Auskunft zu unseren aktuellen Fahrzeugen: `;
      if (carContext || selectedVehicle) {
        const car = carContext || selectedVehicle!;
        fallbackText = `Für den **${car.brand} ${car.model}**:\n` +
          `• **Verkaufspreis:** ${car.sellingPrice.toLocaleString('de-DE')} € (${car.taxType === 'standard_19' ? '19% MwSt. ausweisbar' : 'Differenzbesteuert gem. § 25a UStG'})\n` +
          `• **Kilometerstand & EZ:** ${car.mileage.toLocaleString('de-DE')} km | EZ ${car.firstRegistration}\n` +
          `• **Mechanischer Zustand:** ${car.conditionMechanical?.engine || 'Vollständig werkstattgeprüft'} | TÜV bis ${car.conditionMechanical?.tuvDate || 'Aktuell'}\n` +
          `• **Karosserie:** ${car.conditionVisual?.accidentFree !== false ? 'Unfallfrei' : 'Geprüft'} (${car.conditionVisual?.paintCondition || 'Gepflegter Zustand'})\n\n` +
          `Möchten Sie eine Probefahrt vereinbaren oder das Fahrzeug reservieren?`;
      } else {
        fallbackText = `Wir haben aktuell ${showroomVehicles.length} geprüfte Fahrzeuge im Bestand. Gerne beantworte ich all Ihre Fragen zu Preisen, Motorzustand, Karosserie oder Ausstattungsdetails!`;
      }

      setChatMessages([...newMessages, { role: 'assistant', content: fallbackText }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleTestDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDriveName || !testDrivePhone) {
      alert('Bitte füllen Sie Name und Telefonnummer aus.');
      return;
    }
    setTestDriveSuccess(true);
    setTimeout(() => {
      setTestDriveSuccess(false);
      setTestDriveModalVehicle(null);
      setTestDriveName('');
      setTestDrivePhone('');
      setTestDriveEmail('');
      setTestDriveDate('');
    }, 2800);
  };

  // Content rendering based on simulator viewport
  const containerMaxWidth = viewportMode === 'mobile' ? 'max-w-md mx-auto shadow-2xl rounded-3xl border-8 border-slate-800 overflow-hidden my-4' : viewportMode === 'tablet' ? 'max-w-3xl mx-auto shadow-2xl rounded-3xl border-8 border-slate-800 overflow-hidden my-4' : 'w-full';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-20">
      
      {/* Dealer Preview Control Bar (Visible when opened within the management app) */}
      {!standalone && (
        <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            {onBackToApp && (
              <button
                type="button"
                onClick={onBackToApp}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Zurück zur Verwaltung</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Öffentlicher Kunden-Showroom Live-Vorschau</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden md:inline">Ansicht simulieren:</span>
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewportMode === 'desktop' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Desktop Vollbild"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewportMode === 'tablet' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tablet Format"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewportMode === 'mobile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Smartphone Format"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If a vehicle is selected, show the Full-Screen AutoScout24-style Vehicle View */}
      {selectedVehicle ? (
        <div className={`transition-all duration-300 ${containerMaxWidth}`}>
          <ShowroomVehicleFullScreenView
            vehicle={selectedVehicle}
            settings={settings}
            showroomConfig={showroomConfig}
            onBack={() => setSelectedVehicle(null)}
            onRequestTestDrive={(v) => setTestDriveModalVehicle(v)}
            onAskAi={(v, q) => handleOpenAiWithVehicle(v, q)}
          />
        </div>
      ) : (
        /* Main Showroom Canvas */
        <div className={`transition-all duration-300 ${containerMaxWidth} bg-slate-900`}>
        
        {/* =========================================================================
            1. FIXED / STICKY HEADER WITH PERSISTENT MAX FLEET SEARCH BAR
            ========================================================================= */}
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Dealer Identity & Logo */}
            <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-3">
                {settings.logoUrl ? (
                  <img 
                    src={settings.logoUrl} 
                    alt="Dealer Logo" 
                    className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-slate-700 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-500/20">
                    {settings.companyName ? settings.companyName.charAt(0) : 'M'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-black text-white tracking-tight line-clamp-1">
                      {settings.companyName || 'MaxFleet Autohaus'}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verifizierter Händler</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{settings.city ? `${settings.postalCode} ${settings.city}` : 'Berlin, Deutschland'}</span>
                  </p>
                </div>
              </div>

              {/* Direct Fast Contact Mobile */}
              <div className="flex items-center gap-2 md:hidden">
                {showroomConfig.whatsappNumber && (
                  <a
                    href={`https://wa.me/${showroomConfig.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-sm"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-sm"
                    title="Anrufen"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* MANDATORY PERSISTENT MAX FLEET NETWORK SEARCH BUTTON */}
            {/* The user specifically mandated that this button is fixed and cannot be removed to benefit the platform network */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setShowNetworkSearchModal(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/20"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>🔍 In ganzem MAX FLEET Netzwerk suchen</span>
              </button>

              {/* Desktop Direct Contact Action Buttons */}
              <div className="hidden md:flex items-center gap-2">
                {showroomConfig.whatsappNumber && (
                  <a
                    href={`https://wa.me/${showroomConfig.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>{settings.phone}</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </header>

        {/* =========================================================================
            2. HERO BANNER WITH DEALER'S CUSTOM BACKGROUND IMAGE
            ========================================================================= */}
        <div className="relative min-h-[360px] sm:min-h-[420px] flex items-center justify-center px-4 sm:px-8 py-12 overflow-hidden">
          {/* Custom Hero Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src={showroomConfig.heroBgUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80'} 
              alt="Showroom Hero Background" 
              className="w-full h-full object-cover object-center brightness-75 scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            {/* Multi-layered cinematic gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{settings.companyName || 'MaxFleet Partner'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              {showroomConfig.showroomTitle}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
              {showroomConfig.showroomSlogan}
            </p>

            {/* Quick Feature Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Werkstattgeprüft</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Garantie & DEKRA Siegel</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                <span>{showroomVehicles.length} Fahrzeuge sofort verfügbar</span>
              </div>
            </div>

            {/* Hero Quick Search Input */}
            <div className="max-w-xl mx-auto pt-4">
              <div className="relative flex items-center shadow-2xl">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Modell, Marke, Ausstattung oder Farbe suchen (z.B. BMW M Sport, Audi, Taycan)..."
                  className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')} 
                    className="absolute right-3 px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    Löschen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. FILTER BAR & INVENTORY CATALOG
            ========================================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          
          {/* Filter Toolbar */}
          <div className="p-5 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                <span>Fahrzeugfilter ({showroomVehicles.length} von {vehicles.length} Treffern)</span>
              </div>

              {/* VAT Filter Switch */}
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={onlyVatDeductible} 
                  onChange={(e) => setOnlyVatDeductible(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-800 border-slate-700"
                />
                <span className="text-blue-400">Nur mit 19% MwSt. Ausweis (B2B / Leasing)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Brand Filter */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Marke</label>
                <select 
                  value={selectedBrand} 
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Alle Marken ({uniqueBrands.length})</option>
                  {uniqueBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Fuel Filter */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Kraftstoff</label>
                <select 
                  value={selectedFuel} 
                  onChange={(e) => setSelectedFuel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Alle Antriebe</option>
                  <option value="Benzin">Benzin</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Elektro">Elektro</option>
                  <option value="Plug-in-Hybrid">Plug-in-Hybrid</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Transmission Filter */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Getriebe</label>
                <select 
                  value={selectedTransmission} 
                  onChange={(e) => setSelectedTransmission(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Alle Getriebe</option>
                  <option value="Automatik">Automatik</option>
                  <option value="Doppelkupplung">Doppelkupplung (DSG/PDK)</option>
                  <option value="Schaltgetriebe">Schaltgetriebe</option>
                </select>
              </div>

              {/* Max Price Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-400">Preis bis</label>
                  <span className="text-[11px] font-black text-blue-400">{maxPrice.toLocaleString('de-DE')} €</span>
                </div>
                <input 
                  type="range" 
                  min="10000" 
                  max="150000" 
                  step="2500"
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              4. VEHICLE CARDS GRID WITH RICH INSPECTION DETAILS & MULTI-IMAGES
              ========================================================================= */}
          {showroomVehicles.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
              <Car className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Keine passenden Fahrzeuge gefunden</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Bitte passen Sie Ihre Filterkriterien an oder nutzen Sie die globale MAX FLEET Netzwerk-Suche.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('all');
                  setSelectedFuel('all');
                  setSelectedTransmission('all');
                  setMaxPrice(150000);
                  setOnlyVatDeductible(false);
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showroomVehicles.map((vehicle) => {
                const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.imageUrl];
                const activeImg = activeImageIndex[vehicle.id] || 0;
                const currentImgUrl = images[activeImg] || vehicle.imageUrl;
                const activeTab = expandedTabs[vehicle.id] || null;

                return (
                  <div 
                    key={vehicle.id} 
                    className="group bg-slate-900 rounded-3xl border border-slate-800 hover:border-slate-700/80 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                  >
                    
                    {/* Multi-Image Gallery with Swipe Controls */}
                    <div 
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="relative w-full h-56 bg-slate-950 overflow-hidden cursor-pointer"
                    >
                      <img 
                        src={currentImgUrl} 
                        alt={`${vehicle.brand} ${vehicle.model}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                        <div className="flex flex-wrap gap-1.5">
                          {vehicle.showroomBadge && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-wide shadow-md uppercase">
                              {vehicle.showroomBadge}
                            </span>
                          )}
                          {vehicle.status === 'reserviert' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black tracking-wide shadow-md uppercase">
                              Reserviert
                            </span>
                          )}
                        </div>

                        {/* Tax Status Badge */}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-md uppercase tracking-wider backdrop-blur-md ${
                          vehicle.taxType === 'standard_19'
                            ? 'bg-emerald-500/90 text-white border border-emerald-400/40'
                            : 'bg-slate-800/90 text-slate-200 border border-slate-700'
                        }`}>
                          {vehicle.taxType === 'standard_19' ? '19% MwSt.' : '§ 25a Diff.'}
                        </span>
                      </div>

                      {/* Hover Fullscreen Hint Badge */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-blue-400 text-[10px] font-bold border border-slate-700 shadow-md flex items-center gap-1">
                          <Maximize2 className="w-3 h-3" />
                          <span>Exposé öffnen</span>
                        </span>
                      </div>

                      {/* Image navigation controls if multiple images */}
                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handlePrevImage(vehicle.id, images.length, e)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleNextImage(vehicle.id, images.length, e)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                            {images.map((_, idx) => (
                              <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeImg ? 'bg-white w-4' : 'bg-white/40'}`} 
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Vehicle Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      
                      {/* Title & Price */}
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 
                            onClick={() => setSelectedVehicle(vehicle)}
                            className="text-base font-black text-white hover:text-blue-400 transition-colors tracking-tight leading-snug line-clamp-1 cursor-pointer"
                          >
                            {vehicle.brand} {vehicle.model}
                          </h2>
                        </div>
                        {vehicle.variant && (
                          <p className="text-xs text-slate-400 line-clamp-1 font-medium">
                            {vehicle.variant}
                          </p>
                        )}
                        
                        {/* Big Price Display with Tax explanation */}
                        <div className="pt-2 flex items-baseline justify-between">
                          <div>
                            <span className="text-2xl font-black text-white tracking-tight">
                              {vehicle.sellingPrice.toLocaleString('de-DE')} €
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {vehicle.taxType === 'standard_19' 
                                ? 'inkl. 19% MwSt. (ausweisbar)' 
                                : 'Differenzbesteuert gem. § 25a UStG'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Key Technical Specs Chips */}
                      <div className="grid grid-cols-3 gap-2 py-1 text-center">
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-semibold">Erstzulassung</span>
                          <span className="text-xs font-black text-slate-200">{vehicle.firstRegistration}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-semibold">Kilometer</span>
                          <span className="text-xs font-black text-slate-200">{vehicle.mileage.toLocaleString('de-DE')} km</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-semibold">Leistung</span>
                          <span className="text-xs font-black text-slate-200">{vehicle.powerPs} PS</span>
                        </div>
                      </div>

                      {/* Fuel, Transmission, TÜV */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1.5">
                          <Fuel className="w-3 h-3 text-blue-400" />
                          <span>{vehicle.fuelType}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1.5">
                          <Gauge className="w-3 h-3 text-indigo-400" />
                          <span>{vehicle.transmission}</span>
                        </span>
                        {vehicle.conditionMechanical?.tuvDate && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>TÜV bis {vehicle.conditionMechanical.tuvDate}</span>
                          </span>
                        )}
                      </div>

                      {/* Custom Dealer Note */}
                      {vehicle.showroomCustomNote && (
                        <p className="text-xs text-slate-300 bg-blue-950/30 border border-blue-800/40 p-2.5 rounded-xl line-clamp-2 leading-relaxed">
                          💬 <span className="font-semibold">{vehicle.showroomCustomNote}</span>
                        </p>
                      )}

                      {/* INSPECTION ACCORDION TABS (Mechanik, Karosserie, Ausstattung) */}
                      <div className="space-y-2 pt-1 border-t border-slate-800">
                        <div className="flex items-center gap-1">
                          {showroomConfig.defaultShowMechanical && vehicle.conditionMechanical && (
                            <button
                              type="button"
                              onClick={() => toggleTab(vehicle.id, 'mechanic')}
                              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                activeTab === 'mechanic' 
                                  ? 'bg-blue-600 text-white shadow-sm' 
                                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Mechanik</span>
                            </button>
                          )}

                          {showroomConfig.defaultShowBodywork && vehicle.conditionVisual && (
                            <button
                              type="button"
                              onClick={() => toggleTab(vehicle.id, 'body')}
                              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                activeTab === 'body' 
                                  ? 'bg-blue-600 text-white shadow-sm' 
                                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              <Car className="w-3 h-3" />
                              <span>Karosserie</span>
                            </button>
                          )}

                          {showroomConfig.defaultShowFeatures && vehicle.features && vehicle.features.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleTab(vehicle.id, 'features')}
                              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                activeTab === 'features' 
                                  ? 'bg-blue-600 text-white shadow-sm' 
                                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Ausstattung</span>
                            </button>
                          )}
                        </div>

                        {/* Expanded Inspection Drawer */}
                        {activeTab === 'mechanic' && vehicle.conditionMechanical && (
                          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 text-slate-300 animate-in fade-in">
                            <div className="font-bold text-white text-[11px] flex items-center justify-between border-b border-slate-800 pb-1">
                              <span>🔧 Prüfprotokoll Mechanik</span>
                              <span className="text-emerald-400">100% Geprüft</span>
                            </div>
                            {vehicle.conditionMechanical.engine && (
                              <p><strong className="text-slate-400">Motor:</strong> {vehicle.conditionMechanical.engine}</p>
                            )}
                            {vehicle.conditionMechanical.transmission && (
                              <p><strong className="text-slate-400">Getriebe:</strong> {vehicle.conditionMechanical.transmission}</p>
                            )}
                            {vehicle.conditionMechanical.brakesTires && (
                              <p><strong className="text-slate-400">Bremsen/Reifen:</strong> {vehicle.conditionMechanical.brakesTires}</p>
                            )}
                            {vehicle.conditionMechanical.lastService && (
                              <p><strong className="text-slate-400">Service:</strong> {vehicle.conditionMechanical.lastService}</p>
                            )}
                          </div>
                        )}

                        {activeTab === 'body' && vehicle.conditionVisual && (
                          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 text-slate-300 animate-in fade-in">
                            <div className="font-bold text-white text-[11px] flex items-center justify-between border-b border-slate-800 pb-1">
                              <span>🚗 Zustand Karosserie & Lack</span>
                              <span className={vehicle.conditionVisual.accidentFree !== false ? 'text-emerald-400' : 'text-emerald-400'}>
                                {vehicle.conditionVisual.accidentFree !== false ? 'Unfallfrei' : 'Vorschaden geprüft'}
                              </span>
                            </div>
                            {vehicle.conditionVisual.paintCondition && (
                              <p><strong className="text-slate-400">Lack:</strong> {vehicle.conditionVisual.paintCondition}</p>
                            )}
                            {vehicle.conditionVisual.interiorCondition && (
                              <p><strong className="text-slate-400">Innenraum:</strong> {vehicle.conditionVisual.interiorCondition}</p>
                            )}
                            {vehicle.conditionVisual.damagesNotes && (
                              <p><strong className="text-slate-400">Hinweise:</strong> {vehicle.conditionVisual.damagesNotes}</p>
                            )}
                            {vehicle.conditionVisual.paintThicknessUm && (
                              <p><strong className="text-slate-400">Lackschichtdicke:</strong> {vehicle.conditionVisual.paintThicknessUm} µm (Werkslack)</p>
                            )}
                          </div>
                        )}

                        {activeTab === 'features' && vehicle.features && (
                          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 text-slate-300 animate-in fade-in">
                            <div className="font-bold text-white text-[11px] border-b border-slate-800 pb-1">
                              <span>💎 Wichtigste Ausstattungsmerkmale</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {vehicle.features.map((feat, fidx) => (
                                <span key={fidx} className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px] text-slate-200 font-medium">
                                  ✓ {feat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: Details / Vollbild, Probefahrt, AI Chat */}
                      <div className="pt-2 space-y-2">
                        {/* Primary View Details Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedVehicle(vehicle)}
                          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group border border-slate-700 hover:border-transparent"
                        >
                          <span>Fahrzeugdetails & Vollbild</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setTestDriveModalVehicle(vehicle)}
                            className="py-2 px-3 rounded-2xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Probefahrt</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenAiWithVehicle(vehicle)}
                            className="py-2 px-3 rounded-2xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Bot className="w-3.5 h-3.5 text-purple-400" />
                            <span>Frage an MAX</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =========================================================================
              5. STATUTORY IMPRESSUM & LEGAL FOOTER
              ========================================================================= */}
          <footer className="mt-16 pt-12 border-t border-slate-800 space-y-8 text-xs text-slate-400">
            
            {/* Dealer Contact & Opening Hours Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Company Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-white">{settings.companyName || 'MaxFleet Autohandel'}</h4>
                <p className="leading-relaxed">
                  {showroomConfig.legalImpressum?.representedBy || `Inhaber: ${settings.responsiblePerson || 'Geschäftsführung'}`}
                </p>
                <p className="leading-relaxed">
                  {showroomConfig.legalImpressum?.streetAddress || settings.street || 'Kurfürstendamm 210'}<br />
                  {showroomConfig.legalImpressum?.zipCity || `${settings.postalCode} ${settings.city}`}
                </p>
                <p className="pt-2">
                  <strong>Tel:</strong> {settings.phone || '+49 30 8920100'}<br />
                  <strong>E-Mail:</strong> {settings.email || 'info@maxfleet-gruppe.de'}
                </p>
              </div>

              {/* Opening Hours */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-white">Öffnungszeiten</h4>
                <p className="leading-relaxed">
                  <strong>Wochentags:</strong> {showroomConfig.openingHours?.weekdays || 'Mo. - Fr.: 09:00 - 18:30 Uhr'}<br />
                  <strong>Samstag:</strong> {showroomConfig.openingHours?.saturday || 'Sa.: 10:00 - 15:00 Uhr'}<br />
                  <strong>Sonntag:</strong> {showroomConfig.openingHours?.sunday || 'Geschlossen (Online-Schautag 24/7)'}
                </p>
                <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                  ✓ Probefahrten nach vorheriger Terminabsprache flexibel möglich
                </p>
              </div>

              {/* Commercial Register & Tax ID */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-white">Register & Steuern</h4>
                <p className="leading-relaxed">
                  <strong>Registergericht:</strong> {showroomConfig.legalImpressum?.registerCourt || settings.registerCourt || 'Amtsgericht Charlottenburg'}<br />
                  <strong>Handelsregister:</strong> {showroomConfig.legalImpressum?.registerNumber || settings.commercialRegister || 'HRB 198421 B'}<br />
                  <strong>USt-IdNr.:</strong> {showroomConfig.legalImpressum?.vatId || settings.vatId || 'DE 319 824 550'}
                </p>
              </div>

            </div>

            {/* Impressum & Legal Disclaimer Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 leading-relaxed text-[11px] space-y-2">
              <strong className="text-slate-300 block font-bold">Impressum & Pflichtangaben nach § 5 DDG (ehemals TMG):</strong>
              <p>
                {showroomConfig.legalImpressum?.disclaimerText || 'Angaben gemäß § 5 DDG. Plattform der Europäischen Kommission zur Online-Streitbeilegung (OS): https://ec.europa.eu/consumers/odr. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'}
              </p>
              <div className="pt-2 text-slate-500 flex flex-wrap items-center justify-between gap-4 border-t border-slate-900">
                <span>© {new Date().getFullYear()} {settings.companyName || 'MaxFleet Autohaus'}. Alle Rechte vorbehalten.</span>
                <span className="text-slate-400">Powered by MAX FLEET Automotive Cloud</span>
              </div>
            </div>

          </footer>

        </div>

      </div>
      )}

      {/* =========================================================================
          6. FLOATING MAX AI SHOWROOM CONCIERGE CHATBOT WIDGET
          ========================================================================= */}
      {showroomConfig.enableAiChatbot && (
        <>
          {/* Floating Trigger Button */}
          {!isChatOpen && (
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-105 text-white shadow-2xl shadow-blue-500/40 border-2 border-white/20 transition-all flex items-center gap-3 cursor-pointer group animate-bounce-subtle"
            >
              <div className="relative">
                <Bot className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-black block tracking-tight">Fragen zu Zustand & Preisen?</span>
                <span className="text-[10px] text-purple-200 block font-medium">Mit MAX KI sprechen</span>
              </div>
            </button>
          )}

          {/* Chat Drawer / Modal */}
          {isChatOpen && (
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-96 md:w-[420px] h-[550px] max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              
              {/* Chat Header */}
              <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-tight">MAX Showroom-Berater</h3>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Online • Auskunft zu Zustand & Preisen</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/60">
                {chatMessages.map((msg, index) => {
                  const isAssistant = msg.role === 'assistant';
                  return (
                    <div 
                      key={index} 
                      className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAssistant && (
                        <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed ${
                        isAssistant 
                          ? 'bg-slate-800 text-slate-100 border border-slate-700/80' 
                          : 'bg-blue-600 text-white font-medium shadow-md'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}

                {isChatLoading && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Bot className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-800 text-xs text-slate-400 border border-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-200" />
                      <span>MAX analysiert Fahrzeugdaten...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('Welche Fahrzeuge haben 19% MwSt. ausweisbar?')}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  MwSt. 19% Autos?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('Sind alle Fahrzeuge scheckheftgepflegt und unfallfrei?')}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  Unfallfrei & Scheckheft?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('Wie kann ich eine Probefahrt vereinbaren?')}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  Probefahrt anfragen
                </button>
              </div>

              {/* Chat Input Bar */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }}
                className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Frage zu Motor, Lack, Preisen oder MwSt..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          )}
        </>
      )}

      {/* =========================================================================
          7. TEST DRIVE / CONTACT MODAL
          ========================================================================= */}
      {testDriveModalVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 pt-2 sm:pt-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-0 sm:my-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black text-white">Probefahrt & Besichtigung anfragen</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setTestDriveModalVehicle(null)} 
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <img 
                src={testDriveModalVehicle.imageUrl} 
                alt="Selected Car" 
                className="w-16 h-12 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-xs font-black text-white">{testDriveModalVehicle.brand} {testDriveModalVehicle.model}</h4>
                <p className="text-[11px] text-blue-400 font-bold">{testDriveModalVehicle.sellingPrice.toLocaleString('de-DE')} €</p>
                <span className="text-[10px] text-slate-400">{testDriveModalVehicle.location}</span>
              </div>
            </div>

            {testDriveSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-700 text-center space-y-2 text-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-black text-white">Anfrage erfolgreich übermittelt!</h4>
                <p className="text-xs">Das Autohaus {settings.companyName} wird sich in Kürze telefonisch oder per E-Mail bei Ihnen melden.</p>
              </div>
            ) : (
              <form onSubmit={handleTestDriveSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Ihr vollständiger Name *</label>
                  <input 
                    type="text" 
                    required
                    value={testDriveName}
                    onChange={(e) => setTestDriveName(e.target.value)}
                    placeholder="z.B. Max Mustermann"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Telefonnummer *</label>
                    <input 
                      type="tel" 
                      required
                      value={testDrivePhone}
                      onChange={(e) => setTestDrivePhone(e.target.value)}
                      placeholder="+49 171 1234567"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">E-Mail (Optional)</label>
                    <input 
                      type="email" 
                      value={testDriveEmail}
                      onChange={(e) => setTestDriveEmail(e.target.value)}
                      placeholder="kunde@email.de"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Wunschtermin</label>
                  <input 
                    type="date" 
                    value={testDriveDate}
                    onChange={(e) => setTestDriveDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setTestDriveModalVehicle(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md cursor-pointer"
                  >
                    Termin jetzt anfragen
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          8. MANDATORY GLOBAL MAX FLEET NETWORK SEARCH MODAL
          ========================================================================= */}
      {showNetworkSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 pt-2 sm:pt-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 my-0 sm:my-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">MAX FLEET Globales Partner-Netzwerk</h3>
                  <p className="text-xs text-slate-400">Durchsuchen Sie alle registrierten Händler & Fahrzeuge bundesweit</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowNetworkSearchModal(false)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={networkSearchQuery}
                  onChange={(e) => setNetworkSearchQuery(e.target.value)}
                  placeholder="Traumwagen markenübergreifend suchen (z.B. Porsche 911, Audi RS6, Mercedes G-Klasse)..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  autoFocus
                />
              </div>

              {/* Network Stats & Explanation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-950 border border-purple-800/40 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Über 1.200 geprüfte Händler im MAX FLEET Verbund</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sie befinden sich aktuell im Showroom von <strong>{settings.companyName || 'diesem Händler'}</strong>. Über das MAX FLEET Netzwerk haben Sie Zugriff auf verifizierte Händlerfahrzeuge in ganz Deutschland mit Echtheitsprüfung und DEKRA Gutachten.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNetworkSearchModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Schließen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Das globale MAX FLEET Netzwerk leitet die Suche nach "' + (networkSearchQuery || 'allen Fahrzeugen') + '" ein.');
                    setShowNetworkSearchModal(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black shadow-lg cursor-pointer"
                >
                  Im Verbund suchen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
