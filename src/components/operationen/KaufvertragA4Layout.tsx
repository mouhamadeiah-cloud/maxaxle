import React from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  Calendar, 
  Car, 
  Key, 
  FileText,
  Clock,
  PenTool,
  CheckCircle2,
  ArrowLeftRight,
  Trash2,
  Sparkles,
  Info,
  User
} from 'lucide-react';
import { 
  Customer, 
  MerchantSettings, 
  KaufvertragDetails,
  KaufvertragParty
} from '../../types';

export interface KaufvertragA4LayoutProps {
  kaufvertrag: KaufvertragDetails;
  merchantSettings: MerchantSettings;
  internalRefNumber?: string;
  pageNumber?: number;
  totalPages?: number;
  
  // Interactive Handlers
  onUpdateField?: (field: keyof KaufvertragDetails, value: any) => void;
  onUpdateSeller?: (field: keyof KaufvertragParty, value: any) => void;
  onUpdateBuyer?: (field: keyof KaufvertragParty, value: any) => void;
  onSwapParties?: () => void;
  onSign?: (type: 'seller' | 'buyer') => void;
  onClearSignature?: (type: 'seller' | 'buyer') => void;
  onSelectWarrantyTemplate?: (type: 'b2c_haendler_12m' | 'gewerblich_ausschluss' | 'privat_ausschluss' | 'herstellergarantie') => void;
}

export const KaufvertragA4Layout: React.FC<KaufvertragA4LayoutProps> = ({
  kaufvertrag,
  merchantSettings,
  internalRefNumber = 'KV-2026-1000',
  pageNumber = 1,
  totalPages = 1,
  onUpdateField,
  onUpdateSeller,
  onUpdateBuyer,
  onSwapParties,
  onSign,
  onClearSignature,
  onSelectWarrantyTemplate
}) => {
  const { seller, buyer } = kaufvertrag;

  const isSellerDealer = kaufvertrag.contractMode === 'verkauf';
  const headerTitle = isSellerDealer 
    ? 'Kaufvertrag für ein gebrauchtes Kraftfahrzeug' 
    : 'Ankaufsvertrag für ein gebrauchtes Kraftfahrzeug';

  // Helper for safe updates
  const handleFieldChange = (field: keyof KaufvertragDetails, value: any) => {
    if (onUpdateField) {
      onUpdateField(field, value);
    }
  };

  const handleSellerChange = (field: keyof KaufvertragParty, value: any) => {
    if (onUpdateSeller) {
      onUpdateSeller(field, value);
    }
  };

  const handleBuyerChange = (field: keyof KaufvertragParty, value: any) => {
    if (onUpdateBuyer) {
      onUpdateBuyer(field, value);
    }
  };

  const remainingAmount = Math.max(0, (kaufvertrag.purchasePrice || 0) - (kaufvertrag.depositAmount || 0));

  return (
    <div 
      id="document-a4-sheet"
      className="a4-print-sheet bg-white text-slate-900 mx-auto p-7 sm:p-9 shadow-2xl border border-slate-200 rounded-none sm:rounded-lg font-sans relative flex flex-col justify-between"
      style={{
        width: '100%',
        maxWidth: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box'
      }}
    >
      <div className="space-y-3.5">
        
        {/* CONTRACT HEADER */}
        <div className="border-b-2 border-slate-900 pb-2.5 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block">
                Rechtsverbindlicher Vertrag
              </span>
              <span className="print:hidden text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded font-semibold border border-emerald-300">
                {isSellerDealer ? 'Verkauf an Kunden' : 'Fahrzeug-Ankauf'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
              {headerTitle}
            </h1>
            <p className="text-[10.5px] text-slate-600 font-medium">
              Abschluss gemäß den Bestimmungen des Bürgerlichen Gesetzbuches (BGB)
            </p>
          </div>

          <div className="text-right">
            <div className="font-bold text-slate-900 text-xs">
              {merchantSettings.companyName || 'MaxFleet Autohandelsgruppe'}
            </div>
            <div className="text-[10px] text-slate-500">
              {merchantSettings.street}, {merchantSettings.postalCode} {merchantSettings.city}
            </div>
            <div className="text-[9.5px] text-slate-600 pt-0.5 flex items-center justify-end gap-1">
              <span>Datum:</span>
              <input
                type="text"
                value={kaufvertrag.contractDate || ''}
                onChange={(e) => handleFieldChange('contractDate', e.target.value)}
                className="font-mono text-slate-800 text-right bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mr-1 transition border-none font-bold w-24"
                placeholder="TT.MM.JJJJ"
              />
            </div>
          </div>
        </div>

        {/* SECTION 1: VERTRAGSPARTEIEN (VERKÄUFER & KÄUFER) WITH GLOWING SWAP ICON */}
        <div className="relative">
          
          {/* Glowing Yellow Dual-Arrow Swap Button */}
          {onSwapParties && (
            <div className="print:hidden absolute left-1/2 -top-2.5 -translate-x-1/2 z-20">
              <button
                type="button"
                onClick={onSwapParties}
                className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-slate-950 rounded-full font-bold text-[10px] shadow-[0_0_15px_rgba(16, 185, 129,0.6)] border border-emerald-500 hover:border-emerald-600 transition flex items-center gap-1.5 cursor-pointer hover:brightness-105"
                title="Rollen sofort tauschen: Verkäufer ⇄ Käufer (Verkauf / Ankauf)"
              >
                <ArrowLeftRight className="w-3 h-3 text-slate-950 stroke-[2.5]" />
                <span className="hidden sm:inline">Rollen tauschen (Verkäufer ⇄ Käufer)</span>
                <span className="sm:hidden">Tauschen</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            
            {/* 1. Verkäufer Box */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 relative group">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-extrabold text-[10.5px] uppercase tracking-wide text-slate-900">
                  1. Verkäufer
                </span>
                <span className="text-[9px] font-semibold text-slate-500">
                  {isSellerDealer ? 'Autohaus / Händler' : 'Kunde / Vorbesitzer'}
                </span>
              </div>
              <div className="space-y-0.5 text-[11px]">
                <input
                  type="text"
                  value={seller.companyName || ''}
                  onChange={(e) => handleSellerChange('companyName', e.target.value)}
                  placeholder="Firma / Unternehmen (optional)"
                  className="w-full font-bold text-slate-900 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                />
                <input
                  type="text"
                  value={seller.name || ''}
                  onChange={(e) => handleSellerChange('name', e.target.value)}
                  placeholder="Name des Verkäufers / Ansprechpartner"
                  className="w-full font-bold text-slate-900 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                />
                <input
                  type="text"
                  value={seller.street || ''}
                  onChange={(e) => handleSellerChange('street', e.target.value)}
                  placeholder="Straße und Hausnummer"
                  className="w-full text-slate-700 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={seller.postalCode || ''}
                    onChange={(e) => handleSellerChange('postalCode', e.target.value)}
                    placeholder="PLZ"
                    className="w-16 text-slate-700 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                  />
                  <input
                    type="text"
                    value={seller.city || ''}
                    onChange={(e) => handleSellerChange('city', e.target.value)}
                    placeholder="Ort"
                    className="flex-1 text-slate-700 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                  />
                  <input
                    type="text"
                    value={seller.country || 'Deutschland'}
                    onChange={(e) => handleSellerChange('country', e.target.value)}
                    placeholder="Land"
                    className="w-20 text-slate-600 text-right bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                  />
                </div>
                <div className="pt-1 text-[10px] text-slate-600 grid grid-cols-2 gap-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-[9px]">Tel:</span>
                    <input
                      type="text"
                      value={seller.phone || ''}
                      onChange={(e) => handleSellerChange('phone', e.target.value)}
                      placeholder="Telefonnummer"
                      className="w-full text-slate-800 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-0.5 transition placeholder:text-slate-300"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-[9px]">Mail:</span>
                    <input
                      type="text"
                      value={seller.email || ''}
                      onChange={(e) => handleSellerChange('email', e.target.value)}
                      placeholder="E-Mail"
                      className="w-full text-slate-800 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-0.5 transition placeholder:text-slate-300"
                    />
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <span className="text-slate-400 text-[9px]">Ausweis:</span>
                    <input
                      type="text"
                      value={seller.idCardNumber || ''}
                      onChange={(e) => handleSellerChange('idCardNumber', e.target.value)}
                      placeholder="Ausweis-/Passnummer (optional)"
                      className="w-full font-mono text-slate-800 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-0.5 transition placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Käufer Box */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 relative group">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-extrabold text-[10.5px] uppercase tracking-wide text-slate-900">
                  2. Käufer
                </span>
                <span className="text-[9px] font-semibold text-slate-500">
                  {isSellerDealer ? 'Kunde / Erwerber' : 'Autohaus / Ankäufer'}
                </span>
              </div>
              <div className="space-y-0.5 text-[11px]">
                <input
                  type="text"
                  value={buyer.companyName || ''}
                  onChange={(e) => handleBuyerChange('companyName', e.target.value)}
                  placeholder="Firma / Unternehmen (optional)"
                  className="w-full font-bold text-slate-900 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                />
                <input
                  type="text"
                  value={buyer.name || ''}
                  onChange={(e) => handleBuyerChange('name', e.target.value)}
                  placeholder="Name des Käufers / Ansprechpartner"
                  className="w-full font-bold text-slate-900 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                />
                <input
                  type="text"
                  value={buyer.street || ''}
                  onChange={(e) => handleBuyerChange('street', e.target.value)}
                  placeholder="Straße und Hausnummer"
                  className="w-full text-slate-700 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={buyer.postalCode || ''}
                    onChange={(e) => handleBuyerChange('postalCode', e.target.value)}
                    placeholder="PLZ"
                    className="w-16 text-slate-700 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                  />
                  <input
                    type="text"
                    value={buyer.city || ''}
                    onChange={(e) => handleBuyerChange('city', e.target.value)}
                    placeholder="Ort"
                    className="flex-1 text-slate-700 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                  />
                  <input
                    type="text"
                    value={buyer.country || 'Deutschland'}
                    onChange={(e) => handleBuyerChange('country', e.target.value)}
                    placeholder="Land"
                    className="w-20 text-slate-600 text-right bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 -mx-1 transition placeholder:text-slate-300"
                  />
                </div>
                <div className="pt-1 text-[10px] text-slate-600 grid grid-cols-2 gap-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-[9px]">Tel:</span>
                    <input
                      type="text"
                      value={buyer.phone || ''}
                      onChange={(e) => handleBuyerChange('phone', e.target.value)}
                      placeholder="Telefonnummer"
                      className="w-full text-slate-800 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-0.5 transition placeholder:text-slate-300"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-[9px]">Mail:</span>
                    <input
                      type="text"
                      value={buyer.email || ''}
                      onChange={(e) => handleBuyerChange('email', e.target.value)}
                      placeholder="E-Mail"
                      className="w-full text-slate-800 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-0.5 transition placeholder:text-slate-300"
                    />
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <span className="text-slate-400 text-[9px]">Ausweis:</span>
                    <input
                      type="text"
                      value={buyer.idCardNumber || ''}
                      onChange={(e) => handleBuyerChange('idCardNumber', e.target.value)}
                      placeholder="Ausweis-/Passnummer (optional)"
                      className="w-full font-mono text-slate-800 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-0.5 transition placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: FAHRZEUGDATEN (DIRECT INLINE EDITING) */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-extrabold text-[10.5px] uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              <span>A. Gegenstand des Vertrages (Fahrzeugdaten)</span>
            </span>
            <div className="flex items-center gap-1 font-bold text-slate-900 text-xs">
              <input
                type="text"
                value={kaufvertrag.brand || ''}
                onChange={(e) => handleFieldChange('brand', e.target.value)}
                placeholder="Hersteller"
                className="w-20 text-right font-bold bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 transition placeholder:text-slate-300"
              />
              <input
                type="text"
                value={kaufvertrag.model || ''}
                onChange={(e) => handleFieldChange('model', e.target.value)}
                placeholder="Modell"
                className="w-28 font-bold bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 transition placeholder:text-slate-300"
              />
              <input
                type="text"
                value={kaufvertrag.variant || ''}
                onChange={(e) => handleFieldChange('variant', e.target.value)}
                placeholder="Ausführung / Variante"
                className="w-32 text-slate-600 text-[11px] bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 transition placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-[10.5px]">
            {/* VIN / FIN */}
            <div>
              <span className="text-slate-500 block text-[9.5px]">Fahrzeug-Identnummer (VIN / FIN):</span>
              <input
                type="text"
                value={kaufvertrag.vin || ''}
                onChange={(e) => handleFieldChange('vin', e.target.value.toUpperCase())}
                placeholder="17-stellige FIN"
                className="w-full font-mono font-bold text-slate-900 text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 focus:outline-none transition tracking-wide"
              />
            </div>

            {/* Erstzulassung */}
            <div>
              <span className="text-slate-500 block text-[9.5px]">Erstzulassung (EZ):</span>
              <input
                type="text"
                value={kaufvertrag.firstRegistration || ''}
                onChange={(e) => handleFieldChange('firstRegistration', e.target.value)}
                placeholder="MM/JJJJ"
                className="w-full font-bold text-slate-900 text-[11px] bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 transition"
              />
            </div>

            {/* Kilometerstand */}
            <div>
              <span className="text-slate-500 block text-[9.5px]">Kilometerstand (abgelesen):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={kaufvertrag.mileage || 0}
                  onChange={(e) => handleFieldChange('mileage', Number(e.target.value) || 0)}
                  className="w-24 font-bold font-mono text-slate-900 text-[11px] bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 transition"
                />
                <span className="font-bold text-slate-700">km</span>
              </div>
            </div>

            {/* Nächste HU */}
            <div>
              <span className="text-slate-500 block text-[9.5px]">Nächste Hauptuntersuchung (HU):</span>
              <input
                type="text"
                value={kaufvertrag.nextHuDate || 'Neu vor Übergabe'}
                onChange={(e) => handleFieldChange('nextHuDate', e.target.value)}
                placeholder="z. B. 05/2026 oder Neu"
                className="w-full font-bold text-emerald-800 text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 focus:outline-none transition"
              />
            </div>

            {/* Nächste AU */}
            <div>
              <span className="text-slate-500 block text-[9.5px]">Nächste Abgasuntersuchung (AU):</span>
              <input
                type="text"
                value={kaufvertrag.nextAuDate || kaufvertrag.nextHuDate || 'Neu vor Übergabe'}
                onChange={(e) => handleFieldChange('nextAuDate', e.target.value)}
                placeholder="z. B. 05/2026 oder Neu"
                className="w-full font-bold text-emerald-800 text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 focus:outline-none transition"
              />
            </div>

            {/* Bisheriges Kennzeichen */}
            <div>
              <span className="text-slate-500 block text-[9.5px]">Bisheriges Kennzeichen:</span>
              <input
                type="text"
                value={kaufvertrag.licensePlate || 'Abgemeldet'}
                onChange={(e) => handleFieldChange('licensePlate', e.target.value.toUpperCase())}
                placeholder="z. B. B-AB 1234"
                className="w-full font-mono font-bold text-slate-800 text-[11px] bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 transition"
              />
            </div>

            {/* Leistung & Hubraum */}
            <div>
              <span className="text-slate-500 block text-[9.5px]">Leistung (kW / PS) & Hubraum:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={kaufvertrag.powerKw || Math.round((kaufvertrag.powerPs || 150) * 0.735)}
                  onChange={(e) => {
                    const kw = Number(e.target.value) || 0;
                    handleFieldChange('powerKw', kw);
                    handleFieldChange('powerPs', Math.round(kw / 0.735));
                  }}
                  className="w-12 font-bold text-slate-800 text-[11px] bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-0.5 transition"
                />
                <span>kW /</span>
                <input
                  type="number"
                  value={kaufvertrag.powerPs || 150}
                  onChange={(e) => {
                    const ps = Number(e.target.value) || 0;
                    handleFieldChange('powerPs', ps);
                    handleFieldChange('powerKw', Math.round(ps * 0.735));
                  }}
                  className="w-12 font-bold text-slate-800 text-[11px] bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-0.5 transition"
                />
                <span>PS</span>
                {kaufvertrag.displacementCc !== undefined && (
                  <span className="text-slate-400">• {kaufvertrag.displacementCc} ccm</span>
                )}
              </div>
            </div>

            {/* Farbe / Lackierung */}
            <div>
              <span className="text-slate-500 block text-[9.5px]">Farbe / Lackierung:</span>
              <input
                type="text"
                value={kaufvertrag.color || 'Schwarz'}
                onChange={(e) => handleFieldChange('color', e.target.value)}
                placeholder="Lackfarbe"
                className="w-full font-bold text-slate-800 text-[11px] bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 transition"
              />
            </div>

            {/* Anzahl Vorbesitzer */}
            <div>
              <span className="text-slate-500 block text-[9.5px]">Anzahl Vorbesitzer (lt. Brief):</span>
              <input
                type="number"
                min="0"
                max="10"
                value={kaufvertrag.previousOwnersCount !== undefined ? kaufvertrag.previousOwnersCount : 1}
                onChange={(e) => handleFieldChange('previousOwnersCount', Number(e.target.value) || 0)}
                className="w-16 font-mono font-bold text-slate-900 text-[11px] bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 focus:outline-none rounded px-1 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: KAUFPREIS & ZAHLUNGSWEISE (DIRECT INLINE EDITING) */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-extrabold text-[10.5px] uppercase tracking-wide text-slate-900">
              B. Kaufpreis & Zahlungsweise
            </span>
            <div className="flex items-center gap-1 text-xs font-black text-slate-900">
              <span>Gesamtpreis:</span>
              <span className="font-mono text-blue-900">
                {(kaufvertrag.purchasePrice || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
            
            {/* Kaufpreis Gesamt */}
            <div className="p-2 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 transition">
              <span className="text-[9.5px] text-slate-500 block">Kaufpreis (Gesamtbetrag):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="50"
                  value={kaufvertrag.purchasePrice || 0}
                  onChange={(e) => handleFieldChange('purchasePrice', Number(e.target.value) || 0)}
                  className="w-full font-black text-slate-900 text-sm font-mono bg-transparent focus:outline-none"
                />
                <span className="font-bold text-slate-900">€</span>
              </div>
            </div>

            {/* Zahlungsart */}
            <div className="p-2 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 transition">
              <span className="text-[9.5px] text-slate-500 block">Zahlungsart:</span>
              <select
                value={kaufvertrag.paymentMethod || 'Überweisung'}
                onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                className="w-full font-bold text-slate-800 text-[11px] bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="Überweisung">Banküberweisung</option>
                <option value="Bar">Barzahlung</option>
                <option value="Finanzierung">Finanzierung / Bank</option>
                <option value="Kartenzahlung">EC / Kartenzahlung</option>
                <option value="Treuhand">Treuhandservice</option>
              </select>
            </div>

            {/* Anzahlung */}
            <div className="p-2 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 transition">
              <span className="text-[9.5px] text-slate-500 block">Anzahlung (sofort fällig):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="50"
                  value={kaufvertrag.depositAmount || 0}
                  onChange={(e) => handleFieldChange('depositAmount', Number(e.target.value) || 0)}
                  className="w-full font-bold font-mono text-slate-800 text-xs bg-transparent focus:outline-none"
                />
                <span className="font-bold text-slate-700">€</span>
              </div>
            </div>

            {/* Restbetrag (auto computed) */}
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[9.5px] text-slate-500 block">Verbleibender Restbetrag:</span>
              <span className="font-black text-blue-900 text-sm font-mono block pt-0.5">
                {remainingAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </span>
            </div>

          </div>

          <p className="text-[9.5px] text-slate-600 italic pt-0.5">
            Hinweis: Sonderregelung gem. § 25a UStG (Differenzbesteuerung für Gebrauchtgegenstände, kein gesonderter MwSt.-Ausweis) bzw. Regelbesteuerung soweit zutreffend.
          </p>
        </div>

        {/* SECTION 4: WARRANTY & VEHICLE HISTORY (INTERACTIVE CHECKBOXES - UNCHECKED BY DEFAULT) */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-extrabold text-[10.5px] uppercase tracking-wide text-slate-900 block">
              C. Zusicherungen des Verkäufers & Fahrzeughistorie
            </span>
            <span className="print:hidden text-[9px] text-slate-400 italic">
              Klicken zum Aktivieren / Abwählen
            </span>
          </div>

          <div className="space-y-1 text-[10.5px] text-slate-800 leading-tight">
            
            {/* 1. Eigentumsbestätigung */}
            <div 
              onClick={() => handleFieldChange('ownershipConfirmed', !kaufvertrag.ownershipConfirmed)}
              className="flex items-start gap-2 p-1 rounded-lg hover:bg-emerald-50/70 transition cursor-pointer group"
            >
              <div className="pt-0.5 text-blue-600 group-hover:scale-110 transition-transform">
                {kaufvertrag.ownershipConfirmed ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <strong>Eigentumsbestätigung:</strong> Der Verkäufer versichert, dass das Fahrzeug sein unbeschränktes Eigentum ist und frei von Rechten Dritter (z. B. Sicherungsübereignungen, Pfandrechten).
              </div>
            </div>

            {/* 2. Unfallfreiheit / Vorschäden */}
            <div className="flex items-start gap-2 p-1 rounded-lg hover:bg-emerald-50/70 transition group">
              <div 
                onClick={() => handleFieldChange('isAccidentFree', !kaufvertrag.isAccidentFree)}
                className="pt-0.5 text-blue-600 cursor-pointer group-hover:scale-110 transition-transform"
              >
                {kaufvertrag.isAccidentFree ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <span 
                  onClick={() => handleFieldChange('isAccidentFree', !kaufvertrag.isAccidentFree)}
                  className="cursor-pointer"
                >
                  <strong>Unfallfreiheit:</strong> {kaufvertrag.isAccidentFree 
                    ? 'Das Fahrzeug hatte in der Zeit, in der es im Besitz des Verkäufers war, und nach Kenntnis des Verkäufers in der Vorbesitzzeit keinen Unfallschaden.' 
                    : 'Folgende Unfallschäden / Nachlackierungen / Beschädigungen sind bekannt:'}
                </span>
                {!kaufvertrag.isAccidentFree && (
                  <input
                    type="text"
                    value={kaufvertrag.knownDamages || ''}
                    onChange={(e) => handleFieldChange('knownDamages', e.target.value)}
                    placeholder="Bekannte Schäden hier genau beschreiben (z. B. Nachlackierung Stoßstange vorne rechts)..."
                    className="w-full mt-1 text-[10.5px] font-medium text-emerald-900 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
              </div>
            </div>

            {/* 3. Re-Import Status */}
            <div className="flex items-start gap-2 p-1 rounded-lg hover:bg-emerald-50/70 transition group">
              <div 
                onClick={() => handleFieldChange('isReImport', !kaufvertrag.isReImport)}
                className="pt-0.5 text-blue-600 cursor-pointer group-hover:scale-110 transition-transform"
              >
                {!kaufvertrag.isReImport ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <span 
                  onClick={() => handleFieldChange('isReImport', !kaufvertrag.isReImport)}
                  className="cursor-pointer"
                >
                  <strong>Re-Import Status:</strong> {!kaufvertrag.isReImport 
                    ? 'Das Fahrzeug ist kein Re-Import (Deutsche Ausführung / Erstauslieferung Deutschland).' 
                    : 'Das Fahrzeug ist ein Re-Import / EU-Fahrzeug (Herkunftsland:'}
                </span>
                {kaufvertrag.isReImport && (
                  <input
                    type="text"
                    value={kaufvertrag.reImportCountry || 'EU'}
                    onChange={(e) => handleFieldChange('reImportCountry', e.target.value)}
                    placeholder="Herkunftsland (z. B. Österreich, Italien)"
                    className="inline-block w-32 ml-1 text-[10.5px] font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-300 focus:outline-none"
                  />
                )}
                {kaufvertrag.isReImport && <span>).</span>}
              </div>
            </div>

            {/* 4. Nutzungsart (Privat vs Gewerblich) */}
            <div className="flex items-start gap-2 p-1 rounded-lg hover:bg-emerald-50/70 transition group">
              <div 
                onClick={() => handleFieldChange('usageType', kaufvertrag.usageType === 'privat' ? 'gewerblich' : 'privat')}
                className="pt-0.5 text-blue-600 cursor-pointer group-hover:scale-110 transition-transform"
              >
                {kaufvertrag.usageType === 'privat' ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <span 
                  onClick={() => handleFieldChange('usageType', kaufvertrag.usageType === 'privat' ? 'gewerblich' : 'privat')}
                  className="cursor-pointer"
                >
                  <strong>Nutzungsart:</strong> {kaufvertrag.usageType === 'privat' 
                    ? 'Das Fahrzeug wurde nach Kenntnis des Verkäufers rein privat genutzt.' 
                    : 'Gewerbliche Nutzung / Mietwagen / Taxi / Fahrschule'}
                </span>
                {kaufvertrag.usageType === 'gewerblich' && (
                  <input
                    type="text"
                    value={kaufvertrag.commercialUsageNotes || 'Gewerbliche Nutzung'}
                    onChange={(e) => handleFieldChange('commercialUsageNotes', e.target.value)}
                    placeholder="Art der gewerblichen Nutzung angeben..."
                    className="w-full mt-1 text-[10.5px] font-medium text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* 5. Originalmotor */}
            <div className="flex items-start gap-2 p-1 rounded-lg hover:bg-emerald-50/70 transition group">
              <div 
                onClick={() => handleFieldChange('isOriginalEngine', !kaufvertrag.isOriginalEngine)}
                className="pt-0.5 text-blue-600 cursor-pointer group-hover:scale-110 transition-transform"
              >
                {kaufvertrag.isOriginalEngine ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <span 
                  onClick={() => handleFieldChange('isOriginalEngine', !kaufvertrag.isOriginalEngine)}
                  className="cursor-pointer"
                >
                  <strong>Motor:</strong> {kaufvertrag.isOriginalEngine 
                    ? 'Das Fahrzeug ist mit dem ersten Originalmotor ausgestattet.' 
                    : 'Austauschmotor verbaut (Laufleistung des Motors:'}
                </span>
                {!kaufvertrag.isOriginalEngine && (
                  <input
                    type="number"
                    value={kaufvertrag.engineMileageKm || 0}
                    onChange={(e) => handleFieldChange('engineMileageKm', Number(e.target.value) || 0)}
                    placeholder="km-Stand Motor"
                    className="inline-block w-24 ml-1 text-[10.5px] font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-300 focus:outline-none font-mono"
                  />
                )}
                {!kaufvertrag.isOriginalEngine && <span> km).</span>}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 5: GEWÄHRLEISTUNG & UMMELDEPFLICHT (DIRECT INLINE EDITING & TEMPLATE PICKER) */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-extrabold text-[10.5px] uppercase tracking-wide text-slate-900 block">
              D. Gewährleistung, Eigentumsvorbehalt & Ummeldeverpflichtung
            </span>
            
            {/* Quick Template Switcher Pills (Print Hidden) */}
            <div className="print:hidden flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectWarrantyTemplate?.('b2c_haendler_12m')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition ${
                  kaufvertrag.warrantyType === 'b2c_haendler_12m'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                12M B2C (§ 476)
              </button>
              <button
                type="button"
                onClick={() => onSelectWarrantyTemplate?.('gewerblich_ausschluss')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition ${
                  kaufvertrag.warrantyType === 'gewerblich_ausschluss'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                B2B / Export Ausschluss
              </button>
              <button
                type="button"
                onClick={() => onSelectWarrantyTemplate?.('privat_ausschluss')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition ${
                  kaufvertrag.warrantyType === 'privat_ausschluss'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Privat (§ 444)
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px] text-slate-700 leading-relaxed">
            
            {/* 1. Sachmängelhaftung */}
            <div>
              <strong>1. Sachmängelhaftung / Garantie:</strong>
              <div className="mt-0.5">
                <textarea
                  rows={2}
                  value={
                    kaufvertrag.warrantyCustomNotes !== undefined
                      ? kaufvertrag.warrantyCustomNotes
                      : kaufvertrag.warrantyType === 'b2c_haendler_12m'
                      ? 'Für dieses gebrauchte Fahrzeug gilt die gesetzliche Sachmängelhaftung von 12 Monaten ab Übergabe gem. § 476 BGB. Verschleißteile und natürliche Abnutzung sind ausgeschlossen.'
                      : kaufvertrag.warrantyType === 'gewerblich_ausschluss'
                      ? 'Der Verkauf erfolgt unter vollständigem Ausschluss jeglicher Sachmängelhaftung, soweit gesetzlich zulässig (B2B / Export / Händler- oder Gewerbegeschäft).'
                      : kaufvertrag.warrantyType === 'privat_ausschluss'
                      ? 'Der Verkauf erfolgt unter Ausschluss jeglicher Sachmängelhaftung von Privatperson an Privatperson gem. § 444 BGB.'
                      : 'Herstellergarantie vorhanden und auf den Erwerber übertragbar.'
                  }
                  onChange={(e) => handleFieldChange('warrantyCustomNotes', e.target.value)}
                  className="w-full text-[10px] text-slate-800 bg-white p-1.5 rounded border border-slate-200 hover:border-emerald-400 focus:border-emerald-500 focus:outline-none transition leading-tight resize-none"
                />
              </div>
            </div>

            {/* 2. Eigentumsvorbehalt */}
            <div>
              <strong>2. Eigentumsvorbehalt (§ 449 BGB):</strong> Das Fahrzeug, sämtliche Fahrzeugpapiere und übergebenes Zubehör bleiben bis zur vollständigen Bezahlung des gesamten Kaufpreises und aller Nebenforderungen uneingeschränktes Eigentum des Verkäufers.
            </div>

            {/* 3. Ummeldeverpflichtung */}
            <div className="flex items-center gap-1 flex-wrap">
              <strong>3. Ummeldeverpflichtung des Käufers:</strong> Der Käufer verpflichtet sich ausdrücklich, das Fahrzeug unverzüglich, spätestens jedoch innerhalb von
              <input
                type="number"
                min="1"
                max="30"
                value={kaufvertrag.reRegistrationDeadlineDays || 7}
                onChange={(e) => handleFieldChange('reRegistrationDeadlineDays', Number(e.target.value) || 7)}
                className="w-12 text-center font-bold text-slate-900 bg-white px-1 py-0.2 rounded border border-slate-300 font-mono text-[10px] focus:outline-none"
              />
              <span>Werktagen</span>
              <input
                type="text"
                value={kaufvertrag.reRegistrationDeadlineDate || ''}
                onChange={(e) => handleFieldChange('reRegistrationDeadlineDate', e.target.value)}
                placeholder="(bis TT.MM.JJJJ)"
                className="w-24 text-[9.5px] text-slate-700 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:outline-none rounded px-1"
              />
              <span>bei der zuständigen Zulassungsbehörde um- bzw. abzumelden.</span>
            </div>

          </div>
        </div>

        {/* SECTION 6: ÜBERGABEUMFANG & SONDERVEREINBARUNG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          {/* Handover Checklist (Interactive Checkboxes + Direct Keys Count Editing) */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="font-extrabold text-[10.5px] uppercase tracking-wide text-slate-900 block">
                E. Übergabeumfang & Dokumente
              </span>
              <span className="print:hidden text-[9px] text-slate-400 italic">Klickbar</span>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              
              {/* Keys with direct number edit */}
              <div className="flex items-center gap-1.5 p-0.5 rounded hover:bg-emerald-50/60 transition">
                <div 
                  onClick={() => handleFieldChange('keysCount', (kaufvertrag.keysCount || 0) > 0 ? 0 : 2)}
                  className="cursor-pointer"
                >
                  {(kaufvertrag.keysCount || 0) > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <span>Schlüssel:</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={kaufvertrag.keysCount !== undefined ? kaufvertrag.keysCount : 2}
                  onChange={(e) => handleFieldChange('keysCount', Number(e.target.value) || 0)}
                  className="w-8 text-center font-bold text-slate-900 bg-white px-0.5 py-0.2 rounded border border-slate-300 font-mono text-[10px] focus:outline-none"
                />
                <span className="font-bold">Stk.</span>
              </div>

              {/* KFZ-Schein */}
              <div 
                onClick={() => handleFieldChange('hasKfzSchein', !kaufvertrag.hasKfzSchein)}
                className="flex items-center gap-1.5 p-0.5 rounded hover:bg-emerald-50/60 transition cursor-pointer"
              >
                {kaufvertrag.hasKfzSchein ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>KFZ-Schein (Teil I)</span>
              </div>

              {/* KFZ-Brief */}
              <div 
                onClick={() => handleFieldChange('hasKfzBrief', !kaufvertrag.hasKfzBrief)}
                className="flex items-center gap-1.5 p-0.5 rounded hover:bg-emerald-50/60 transition cursor-pointer"
              >
                {kaufvertrag.hasKfzBrief ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>KFZ-Brief (Teil II)</span>
              </div>

              {/* HU/AU-Bericht */}
              <div 
                onClick={() => handleFieldChange('hasHuAuBericht', !kaufvertrag.hasHuAuBericht)}
                className="flex items-center gap-1.5 p-0.5 rounded hover:bg-emerald-50/60 transition cursor-pointer"
              >
                {kaufvertrag.hasHuAuBericht ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>HU/AU-Berichte</span>
              </div>

              {/* Kennzeichen */}
              <div 
                onClick={() => handleFieldChange('hasLicensePlates', !kaufvertrag.hasLicensePlates)}
                className="flex items-center gap-1.5 p-0.5 rounded hover:bg-emerald-50/60 transition cursor-pointer"
              >
                {kaufvertrag.hasLicensePlates ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Kennzeichen</span>
              </div>

              {/* Abmeldebescheinigung */}
              <div 
                onClick={() => handleFieldChange('hasDeregistrationDoc', !kaufvertrag.hasDeregistrationDoc)}
                className="flex items-center gap-1.5 p-0.5 rounded hover:bg-emerald-50/60 transition cursor-pointer"
              >
                {kaufvertrag.hasDeregistrationDoc ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Abmeldebescheinigung</span>
              </div>

            </div>

            {/* Brief-Nr. Inline Edit */}
            <div className="pt-1 text-[9.5px] text-slate-600 border-t border-slate-200 flex items-center gap-1">
              <span>Brief-Nr. (Teil II):</span>
              <input
                type="text"
                value={kaufvertrag.kfzBriefNumber || ''}
                onChange={(e) => handleFieldChange('kfzBriefNumber', e.target.value.toUpperCase())}
                placeholder="z. B. AB123456"
                className="font-mono font-bold text-slate-800 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:outline-none rounded px-1 transition placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Sondervereinbarung Block (Free-form Manual Entry) */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 flex flex-col justify-between">
            <div>
              <span className="font-extrabold text-[10.5px] uppercase tracking-wide text-slate-900 block border-b border-slate-200 pb-1">
                F. Besondere Vereinbarungen
              </span>
              <textarea
                rows={3}
                value={kaufvertrag.specialAgreements || ''}
                onChange={(e) => handleFieldChange('specialAgreements', e.target.value)}
                placeholder="Hier individuelle Sondervereinbarungen eintragen (z. B. 8-fach bereift auf Alufelgen übergeben, Inspektion und TÜV neu vor Auslieferung, Fahrzeug wie besichtigt und probegefahren)..."
                className="w-full mt-1 text-[10px] text-slate-800 bg-white p-1.5 rounded border border-slate-200 hover:border-emerald-400 focus:border-emerald-500 focus:outline-none transition leading-relaxed resize-none placeholder:text-slate-300"
              />
            </div>
            <div className="text-[9px] text-slate-500 italic pt-0.5 border-t border-slate-200">
              Mündliche Nebenabreden haben keine Gültigkeit. Änderungen bedürfen der Schriftform.
            </div>
          </div>

        </div>

        {/* SECTION 7: ORT, DATUM & DIGITALE UNTERSCHRIFTEN */}
        <div className="pt-2 border-t-2 border-slate-900 space-y-2">
          
          <div className="flex justify-between items-center text-xs text-slate-700">
            <div className="flex items-center gap-1">
              <span>Ort, Datum:</span>
              <input
                type="text"
                value={kaufvertrag.place || merchantSettings.city || 'Bonn'}
                onChange={(e) => handleFieldChange('place', e.target.value)}
                placeholder="Ort"
                className="font-bold text-slate-900 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:outline-none rounded px-1"
              />
              <span>,</span>
              <input
                type="text"
                value={kaufvertrag.contractDate || ''}
                onChange={(e) => handleFieldChange('contractDate', e.target.value)}
                placeholder="Datum"
                className="font-bold text-slate-900 bg-transparent hover:bg-emerald-50/50 focus:bg-emerald-50 focus:outline-none rounded px-1 font-mono w-24"
              />
            </div>
            <div className="text-[9.5px] text-slate-500">
              Beide Parteien bestätigen den Erhalt je eines gleichlautenden Vertragsexemplars.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-1 text-xs">
            
            {/* Seller Signature Box */}
            <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/50 flex flex-col justify-between h-24 relative group">
              <div className="flex justify-between items-start text-[9.5px] text-slate-500">
                <span className="font-bold uppercase text-slate-700">
                  Unterschrift {isSellerDealer ? 'Verkäufer (Autohaus)' : 'Verkäufer (Vorbesitzer)'}:
                </span>
                <span className="truncate max-w-[120px]">{seller.name || merchantSettings.companyName}</span>
              </div>
              
              {/* Signature Display or Interactive Button */}
              <div 
                onClick={() => onSign?.('seller')}
                className="flex-1 flex items-center justify-center my-0.5 cursor-pointer hover:bg-emerald-50/40 rounded transition"
              >
                {kaufvertrag.sellerSignature ? (
                  <img 
                    src={kaufvertrag.sellerSignature} 
                    alt="Unterschrift Verkäufer" 
                    className="max-h-12 max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 group-hover:text-emerald-600 transition">
                    <PenTool className="w-3.5 h-3.5" />
                    <span className="italic">(Hier digital unterschreiben / Händlersignatur)</span>
                  </div>
                )}
              </div>

              {/* Reset Signature Button */}
              {kaufvertrag.sellerSignature && onClearSignature && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSignature('seller');
                  }}
                  className="print:hidden absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                  title="Unterschrift löschen"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              <div className="border-t border-slate-300 pt-0.5 text-[8.5px] text-slate-400 text-center">
                Ort, Datum, Stempel & Unterschrift Verkäufer
              </div>
            </div>

            {/* Buyer Signature Box */}
            <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/50 flex flex-col justify-between h-24 relative group">
              <div className="flex justify-between items-start text-[9.5px] text-slate-500">
                <span className="font-bold uppercase text-slate-700">
                  Unterschrift {isSellerDealer ? 'Käufer (Kunde)' : 'Käufer (Autohaus)'}:
                </span>
                <span className="truncate max-w-[120px]">{buyer.name || 'Kunde'}</span>
              </div>

              {/* Signature Display or Interactive Button */}
              <div 
                onClick={() => onSign?.('buyer')}
                className="flex-1 flex items-center justify-center my-0.5 cursor-pointer hover:bg-emerald-50/40 rounded transition"
              >
                {kaufvertrag.buyerSignature ? (
                  <img 
                    src={kaufvertrag.buyerSignature} 
                    alt="Unterschrift Käufer" 
                    className="max-h-12 max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 group-hover:text-emerald-600 transition">
                    <PenTool className="w-3.5 h-3.5" />
                    <span className="italic">(Hier digital unterschreiben)</span>
                  </div>
                )}
              </div>

              {/* Reset Signature Button */}
              {kaufvertrag.buyerSignature && onClearSignature && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSignature('buyer');
                  }}
                  className="print:hidden absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                  title="Unterschrift löschen"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              <div className="border-t border-slate-300 pt-0.5 text-[8.5px] text-slate-400 text-center">
                Ort, Datum & Unterschrift Käufer
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FOOTER & PAGINATION */}
      <div className="mt-3 pt-2 border-t border-slate-200 text-[8px] text-slate-500 flex justify-between items-center">
        <div>
          {merchantSettings.companyName || 'MaxFleet Autohandelsgruppe'} • {merchantSettings.street}, {merchantSettings.postalCode} {merchantSettings.city} • Tel: {merchantSettings.phone || ''}
        </div>
        <div className="font-mono text-slate-400">
          Vertragsdokument • Seite {pageNumber} von {totalPages}
        </div>
      </div>

    </div>
  );
};
