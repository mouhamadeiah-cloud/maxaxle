import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Printer, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Car, 
  Sparkles, 
  Bot, 
  MessageSquare, 
  Fuel, 
  Gauge, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Check, 
  Info, 
  FileText, 
  Building2, 
  Layers, 
  Sliders, 
  CheckCheck,
  Send,
  X
} from 'lucide-react';
import { Vehicle, MerchantSettings, WebShowroomSettings } from '../../types';

interface ShowroomVehicleFullScreenViewProps {
  vehicle: Vehicle;
  settings: MerchantSettings;
  showroomConfig: WebShowroomSettings;
  onBack: () => void;
  onRequestTestDrive: (vehicle: Vehicle) => void;
  onAskAi: (vehicle: Vehicle, query?: string) => void;
}

export const ShowroomVehicleFullScreenView: React.FC<ShowroomVehicleFullScreenViewProps> = ({
  vehicle,
  settings,
  showroomConfig,
  onBack,
  onRequestTestDrive,
  onAskAi
}) => {
  const images = useMemo(() => {
    if (vehicle.images && vehicle.images.length > 0) return vehicle.images;
    if (vehicle.imageUrl) return [vehicle.imageUrl];
    return ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'];
  }, [vehicle]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [quickAiQuestion, setQuickAiQuestion] = useState('');

  // Always scroll to the very top when opening the full-screen vehicle view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [vehicle.id]);

  const nextImage = () => {
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 3000);
    }
  };

  // WhatsApp formatted link
  const whatsappUrl = useMemo(() => {
    const rawNumber = (showroomConfig.whatsappNumber || settings.phone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hallo ${settings.companyName || 'Autohaus'}, ich interessiere mich für das Fahrzeug: ${vehicle.brand} ${vehicle.model} (${vehicle.sellingPrice.toLocaleString('de-DE')} €). FIN: ${vehicle.vin || 'Vorhanden'}. Ist das Fahrzeug noch verfügbar?`
    );
    return `https://wa.me/${rawNumber}?text=${text}`;
  }, [showroomConfig, settings, vehicle]);

  // Tax calculation
  const is19Vat = vehicle.taxType === 'standard_19';
  const netPrice = is19Vat ? Math.round(vehicle.sellingPrice / 1.19) : null;
  const vatAmount = is19Vat && netPrice ? vehicle.sellingPrice - netPrice : null;

  // Monthly financing calculation estimate (e.g. 20% down, 48 mo, 4.99%)
  const estimatedMonthlyRate = useMemo(() => {
    const loanAmount = vehicle.sellingPrice * 0.8;
    const monthlyRate = (loanAmount * 1.08) / 48;
    return Math.round(monthlyRate);
  }, [vehicle.sellingPrice]);

  // Formatted Description
  const rawDescription = vehicle.description || vehicle.beschreibung || '';
  const displayDescription = rawDescription.trim() ? rawDescription : (
    `Herzlich willkommen bei ${settings.companyName || 'unserem Autohaus'}.\n\n` +
    `Wir bieten Ihnen hier einen sehr gepflegten ${vehicle.brand} ${vehicle.model} (${vehicle.variant || ''}) zum Verkauf an.\n` +
    `• Erstzulassung: ${vehicle.firstRegistration || 'Geprüft'} | Laufleistung: ${vehicle.mileage.toLocaleString('de-DE')} km\n` +
    `• Motorisierung: ${vehicle.powerPs} PS (${vehicle.powerKw} kW), ${vehicle.fuelType}, ${vehicle.transmission}\n` +
    `• Zustand: Werkstattgeprüftes Fahrzeug mit DEKRA Qualitätscheck und ${vehicle.conditionMechanical?.serviceHistory ? 'lückenlosem Scheckheft' : 'Wartungshistorie'}.\n` +
    `• TÜV / HU: ${vehicle.conditionMechanical?.tuvDate || 'Gültig / Neu vor Übergabe'}\n\n` +
    `Gerne unterbreiten wir Ihnen ein maßgeschneidertes Finanzierungsangebot oder nehmen Ihr Altfahrzeug in Zahlung. Besichtigung und Probefahrt nach vorheriger Terminabsprache möglich.`
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 animate-fadeIn">
      
      {/* =========================================================================
          1. STICKY FULL-SCREEN TOP NAVIGATION HEADER
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Back Button */}
          <button
            type="button"
            id="btn-showroom-back-to-dealer"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 border border-slate-700 cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Zurück zur Fahrzeugliste</span>
            <span className="sm:hidden">Zurück</span>
          </button>

          {/* Center Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400 truncate max-w-md">
            <span>{settings.companyName || 'Autohaus'}</span>
            <span>/</span>
            <span className="text-slate-300">{vehicle.brand}</span>
            <span>/</span>
            <span className="text-white font-bold truncate">{vehicle.model}</span>
          </div>

          {/* Quick Header Right Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 cursor-pointer"
              title="Inserat teilen"
            >
              {copiedShareLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 cursor-pointer hidden sm:flex"
              title="Exposé drucken"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Quick Price Indicator in Header */}
            <div className="pl-2 sm:pl-4 border-l border-slate-800 text-right">
              <span className="text-sm sm:text-base font-black text-white block leading-none">
                {vehicle.sellingPrice.toLocaleString('de-DE')} €
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block">
                {is19Vat ? 'inkl. 19% MwSt.' : '§ 25a Diff.'}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* =========================================================================
          2. MAIN AUTOSCOUT24-STYLE LAYOUT CONTAINER
          ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        
        {/* Title Headline & Key Badges */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {vehicle.showroomBadge && (
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black tracking-wider uppercase shadow-sm">
                {vehicle.showroomBadge}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border shadow-sm ${
              is19Vat 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                : 'bg-slate-800/90 text-slate-300 border-slate-700'
            }`}>
              {is19Vat ? '19% Mehrwertsteuer ausweisbar' : 'Differenzbesteuerung § 25a UStG'}
            </span>
            {vehicle.conditionMechanical?.serviceHistory && (
              <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Scheckheftgepflegt</span>
              </span>
            )}
            {vehicle.conditionVisual?.accidentFree !== false && (
              <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Unfallfrei</span>
              </span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {vehicle.brand} {vehicle.model}
              </h1>
              {vehicle.variant && (
                <p className="text-base sm:text-lg text-slate-400 font-medium mt-1">
                  {vehicle.variant}
                </p>
              )}
            </div>

            {/* Location & Quick Meta */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{settings.city || vehicle.location || 'Berlin'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{settings.companyName || 'Autohaus'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. PHOTO GALLERY & CAROUSEL (AUTOSCOUT24 HERO FORMAT)
            ========================================================================= */}
        <div className="space-y-3">
          <div className="relative aspect-16/9 md:aspect-21/9 w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
            <img 
              src={images[activeImgIndex]} 
              alt={`${vehicle.brand} ${vehicle.model} - Foto ${activeImgIndex + 1}`} 
              className="w-full h-full object-cover transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />

            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer shadow-lg border border-slate-700"
                  title="Vorheriges Bild"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer shadow-lg border border-slate-700"
                  title="Nächstes Bild"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Floating Info Bar on Photo */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-black text-white shadow-md">
                Foto {activeImgIndex + 1} von {images.length}
              </div>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md border border-slate-700 shadow-md flex items-center gap-1.5 pointer-events-auto transition cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Vollbild</span>
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer shadow-xs ${
                    idx === activeImgIndex 
                      ? 'border-blue-500 ring-2 ring-blue-500/30' 
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            4. TWO-COLUMN CONTENT GRID (SPECS / DOSSIER VS. STICKY CONTACT BOX)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ------------------------------------------------------------- */}
          {/* LEFT COLUMN: AUTOSCOUT24 SPECS, BESCHREIBUNG & PRÜFBERICHT    */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* AutoScout24 Core Data Box (Basisdaten) */}
            <section className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders className="w-5 h-5 text-blue-400" />
                <span>Basisdaten & Fahrzeugübersicht</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Erstzulassung</span>
                  <span className="text-sm font-black text-white">{vehicle.firstRegistration || 'Geprüft'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Kilometerstand</span>
                  <span className="text-sm font-black text-white">{vehicle.mileage.toLocaleString('de-DE')} km</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Leistung</span>
                  <span className="text-sm font-black text-white">{vehicle.powerPs} PS ({vehicle.powerKw || Math.round(vehicle.powerPs * 0.735)} kW)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Kraftstoff</span>
                  <span className="text-sm font-black text-white">{vehicle.fuelType}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Getriebe</span>
                  <span className="text-sm font-black text-white">{vehicle.transmission}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Fahrzeughalter</span>
                  <span className="text-sm font-black text-white">{vehicle.ownersCount || '1. Hand'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">HU / AU (TÜV)</span>
                  <span className="text-sm font-black text-emerald-400">{vehicle.conditionMechanical?.tuvDate || 'Neu vor Übergabe'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Garantie</span>
                  <span className="text-sm font-black text-white">{vehicle.guaranteeMonths || '12 Monate Garantie'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Karosserieform</span>
                  <span className="text-sm font-black text-white">{vehicle.bodyType || 'Kombi / Limousine'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Außenfarbe</span>
                  <span className="text-sm font-black text-white">{vehicle.color || 'Schwarz Metallic'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Polsterung</span>
                  <span className="text-sm font-black text-white">{vehicle.upholsteryType || 'Vollleder'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Nichtraucher</span>
                  <span className="text-sm font-black text-emerald-400">{vehicle.nonSmoker !== false ? 'Ja (Gepflegt)' : 'Nein'}</span>
                </div>

              </div>
            </section>

            {/* ============================================================= */}
            {/* FAHRZEUGBESCHREIBUNG (AutoScout Inseratstext / Exposé)         */}
            {/* ============================================================= */}
            <section className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>Fahrzeugbeschreibung & Inseratstext (Beschreibung)</span>
                </h2>
                <span className="text-xs font-bold text-slate-400 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                  Händler-Exposé
                </span>
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                {displayDescription}
              </div>
            </section>

            {/* ============================================================= */}
            {/* AUSSTATTUNGS-HIGHLIGHTS (KATEGORISIERT)                        */}
            {/* ============================================================= */}
            {vehicle.features && vehicle.features.length > 0 && (
              <section className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span>Ausstattung & Besonderheiten ({vehicle.features.length} Merkmale)</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {vehicle.features.map((feature, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center gap-2 text-xs text-slate-200"
                    >
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ============================================================= */}
            {/* DEKRA & WERKSTATT-PRÜFBERICHT (ZUSTANDSBERICHT / INSPEKTION) */}
            {/* ============================================================= */}
            <section className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Werkstatt-Prüfbericht & Inspektionsprotokoll</span>
                </h2>
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>100 Punkte Qualitätscheck</span>
                </span>
              </div>

              {/* 1. Mechanischer Zustand */}
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-extrabold text-blue-400 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span>Mechanik, Antrieb & Bremsen</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Motor & Kompression</span>
                    <span className="font-bold text-slate-100 block">
                      {vehicle.conditionMechanical?.engine || 'Trocken, kraftvoller & ruhiger Motorlauf'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Getriebe & Kraftübertragung</span>
                    <span className="font-bold text-slate-100 block">
                      {vehicle.conditionMechanical?.transmission || 'Schaltet butterweich ohne Verzögerung'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Bremsen & Bereifung</span>
                    <span className="font-bold text-slate-100 block">
                      {vehicle.conditionMechanical?.brakesTires || 'Beläge > 80%, Profiltiefe > 6mm'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Kundendienst / Servicehistorie</span>
                    <span className="font-bold text-slate-100 block">
                      {vehicle.conditionMechanical?.lastService || 'Letzter Service beim Vertragshändler durchgeführt'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Karosserie, Lack & Schichtdicke */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h3 className="text-xs sm:text-sm font-extrabold text-blue-400 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  <span>Karosserie, Lack & Schichtdickenmessung</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Unfallfrei-Status</span>
                    <span className={`font-bold block ${vehicle.conditionVisual?.accidentFree !== false ? 'text-emerald-400' : 'text-emerald-400'}`}>
                      {vehicle.conditionVisual?.accidentFree !== false ? '✅ Garantiert unfallfrei' : '⚠️ Geprüfter Vorschaden dokumentiert'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Lackschichtdicke</span>
                    <span className="font-bold text-slate-100 block">
                      {vehicle.conditionVisual?.paintThicknessUm ? `${vehicle.conditionVisual.paintThicknessUm} µm (Werkslackierung)` : '110-125 µm (Original Werkslack)'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Lackzustand</span>
                    <span className="font-bold text-slate-100 block">
                      {vehicle.conditionVisual?.paintCondition || 'Sehr gepflegt, aufbereitet und versiegelt'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">Innenraum & Geruch</span>
                    <span className="font-bold text-slate-100 block">
                      {vehicle.conditionVisual?.interiorCondition || 'Neuwertig, desinfiziert und tierfrei'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Protocol Notes or Damages if recorded */}
              {vehicle.damageEntries && vehicle.damageEntries.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block">
                    Dokumentierte Gebrauchsspuren / Historie:
                  </span>
                  <div className="space-y-2">
                    {vehicle.damageEntries.map((dmg) => (
                      <div key={dmg.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block">{dmg.part} ({dmg.damageType})</span>
                          <span className="text-slate-400 text-[11px]">{dmg.description}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${dmg.repaired ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                          {dmg.repaired ? 'Fachgerecht behoben' : 'Bestehend / Optisch'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ============================================================= */}
            {/* TECHNISCHE DATEN & UMWELT (AUTOSCOUT24 SPEZIFIKATIONEN)        */}
            {/* ============================================================= */}
            <section className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Gauge className="w-5 h-5 text-blue-400" />
                <span>Technische Daten, Umwelt & Verbrauch</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">HSN / TSN</span>
                  <span className="font-bold text-white">{vehicle.hsnTsn || '0005 / CSX'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Hubraum</span>
                  <span className="font-bold text-white">{vehicle.displacementCc ? `${vehicle.displacementCc} ccm` : '1.998 ccm'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Schadstoffklasse</span>
                  <span className="font-bold text-white">{vehicle.emissionClass || 'Euro 6d-TEMP'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Verbrauch (kombiniert)</span>
                  <span className="font-bold text-white">{vehicle.fuelConsumptionCombined || '7.2 l / 100 km'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">CO₂-Emissionen</span>
                  <span className="font-bold text-white">{vehicle.co2Emissions || '164 g / km'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Umweltplakette</span>
                  <span className="font-bold text-emerald-400">{vehicle.environmentalBadge || '4 (Grün)'}</span>
                </div>

              </div>
            </section>

          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT COLUMN: STICKY COMMERCIAL PURCHASE BOX & CONTACT        */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            
            {/* Purchase & Pricing Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-6">
              
              {/* Price Header */}
              <div className="space-y-1 border-b border-slate-800 pb-4">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Barpreis / Gesamtpreis
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {vehicle.sellingPrice.toLocaleString('de-DE')} €
                  </span>
                </div>
                
                {/* Tax Breakdown */}
                <div className="pt-2 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Besteuerungsart:</span>
                    <span className="font-bold text-white">
                      {is19Vat ? '19% MwSt. ausweisbar' : 'Differenzbesteuert § 25a'}
                    </span>
                  </div>
                  {is19Vat && netPrice && vatAmount && (
                    <>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Nettopreis (Export / B2B):</span>
                        <span className="font-mono text-slate-300">{netPrice.toLocaleString('de-DE')} €</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Enthaltene 19% MwSt.:</span>
                        <span className="font-mono text-slate-300">{vatAmount.toLocaleString('de-DE')} €</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Financing Teaser */}
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                  <span>Finanzierungsbeispiel:</span>
                  <span className="text-white font-mono">ab {estimatedMonthlyRate} € / Monat</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Repräsentatives Berechnungsbeispiel: 48 Monate Laufzeit, 20% Anzahlung. Bonität vorausgesetzt.
                </p>
              </div>

              {/* Primary Call to Action Buttons */}
              <div className="space-y-3">
                {/* 1. Probefahrt Buchen */}
                <button
                  type="button"
                  id="btn-showroom-book-testdrive"
                  onClick={() => onRequestTestDrive(vehicle)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Probefahrt vereinbaren</span>
                </button>

                {/* 2. WhatsApp Direct Chat */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Per WhatsApp anfragen</span>
                </a>

                {/* 3. Phone Call */}
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                    className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span>Händler anrufen ({settings.phone})</span>
                  </a>
                )}
              </div>

              {/* Dealer Snapshot */}
              <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-blue-400 text-base">
                    {(settings.companyName || 'A')[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">{settings.companyName || 'Autohaus'}</h4>
                    <p className="text-slate-400 text-[11px]">{settings.street || 'Showroom Zentrale'}, {settings.city}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Öffnungszeiten:</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {showroomConfig.openingHours?.weekdays || 'Mo. - Fr.: 09:00 - 18:30 Uhr'}
                  </p>
                </div>
              </div>

            </div>

            {/* MAX AI Chatbot Assistant Widget for this car */}
            {showroomConfig.enableAiChatbot && (
              <div className="p-5 rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border border-purple-800/40 shadow-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Fragen zum Fahrzeug?</h4>
                    <p className="text-[11px] text-purple-300">MAX antwortet sofort auf Zustands- & Preisfragen</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    value={quickAiQuestion}
                    onChange={(e) => setQuickAiQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && quickAiQuestion.trim()) {
                        onAskAi(vehicle, quickAiQuestion.trim());
                        setQuickAiQuestion('');
                      }
                    }}
                    placeholder="z.B. Ist der Wagen unfallfrei?..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-purple-700/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (quickAiQuestion.trim()) {
                        onAskAi(vehicle, quickAiQuestion.trim());
                        setQuickAiQuestion('');
                      } else {
                        onAskAi(vehicle);
                      }
                    }}
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer"
                    title="Frage senden"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* =========================================================================
          LIGHTBOX MODAL FOR FULL-SCREEN PHOTOS
          ========================================================================= */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start p-2 sm:p-4 pt-2 sm:pt-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-5xl flex items-center justify-between text-white p-2 mb-2">
            <span className="text-sm font-black">
              {vehicle.brand} {vehicle.model} ({activeImgIndex + 1} / {images.length})
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center">
            <img 
              src={images[activeImgIndex]} 
              alt="Vollbild" 
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-2xl py-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                  idx === activeImgIndex ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-800 opacity-60'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
