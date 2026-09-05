import React from 'react';
import { 
  MerchantSettings, 
  UebergabeprotokollDetails, 
  DamageCategoryCode, 
  CheckItemStatus 
} from '../../types';
import { 
  Check, 
  AlertTriangle, 
  X, 
  Wrench, 
  PenTool, 
  Trash2, 
  Sliders, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Disc,
  Info
} from 'lucide-react';

export interface UebergabeProtocolA4LayoutProps {
  protocol: UebergabeprotokollDetails;
  merchantSettings: MerchantSettings;
  internalRefNumber?: string;
  onUpdateField?: (field: string, value: any) => void;
  onToggleCheckItem?: (
    section: 'external' | 'interior' | 'mechanical' | 'equipment' | 'documents', 
    key: string, 
    status?: any, 
    note?: string
  ) => void;
  onSign?: (type: 'buyer' | 'seller') => void;
  onClearSignature?: (type: 'buyer' | 'seller') => void;
  onOpenVehicleSettings?: () => void;
  showGuideNotice?: boolean;
  onDismissGuideNotice?: () => void;
}

export const UebergabeProtocolA4Layout: React.FC<UebergabeProtocolA4LayoutProps> = ({
  protocol,
  merchantSettings,
  internalRefNumber = 'UEP-2608-1000',
  onUpdateField,
  onToggleCheckItem,
  onSign,
  onClearSignature,
  onOpenVehicleSettings,
  showGuideNotice = true,
  onDismissGuideNotice
}) => {
  const getCategoryBadgeText = (cat: DamageCategoryCode) => {
    switch (cat) {
      case 'D1': return 'D1 (Nur Lack / Steinschlag)';
      case 'D2': return 'D2 (Klein < 1 cm)';
      case 'D3': return 'D3 (Mittel / Delle)';
      case 'D4': return 'D4 (Groß / Vorschaden)';
      default: return cat;
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-6 px-2 sm:px-4 bg-slate-900/60 print:bg-white print:p-0 print:m-0 space-y-8">
      
      {/* ========================================================================= */}
      {/* HANDWRITTEN-STYLE FLOATING GUIDANCE NOTICE (DISMISSIBLE, PRINT:HIDDEN)     */}
      {/* ========================================================================= */}
      {showGuideNotice && (
        <div 
          id="uebergabe-handwritten-guide-notice"
          className="w-full max-w-[210mm] print:hidden relative transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <div className="relative bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-100 border border-emerald-300 text-emerald-950 p-4 sm:p-5 rounded-2xl shadow-xl transform sm:-rotate-0.5 hover:rotate-0 transition-transform">
            {/* Post-it tape effect pin at top center */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-emerald-200/80 backdrop-blur-xs border border-emerald-300/60 rounded-sm transform -rotate-1 shadow-xs pointer-events-none" />

            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/30 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-900">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  {/* German Guidance */}
                  <p className="font-serif italic text-sm sm:text-base font-bold text-emerald-950 leading-snug">
                    &bdquo;Fahrzeugdaten & Begutachtung überprüfen: Alle Angaben können bei Bedarf in den Stammdaten angepasst oder direkt unverändert übernommen werden.&ldquo;
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    {onOpenVehicleSettings && (
                      <button
                        type="button"
                        id="btn-uebergabe-open-vehicle-settings"
                        onClick={onOpenVehicleSettings}
                        className="px-3.5 py-1.5 bg-emerald-950 text-emerald-100 hover:bg-black rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Fahrzeugdaten & Mängel prüfen / bearbeiten</span>
                        <ExternalLink className="w-3 h-3 text-emerald-400 ml-0.5" />
                      </button>
                    )}
                    <span className="text-[11px] text-emerald-800/80 font-medium">
                      Speichern übernimmt alle Daten sofort nahtlos zurück in das aktive Übergabeprotokoll.
                    </span>
                  </div>
                </div>
              </div>

              {/* Dismiss Button */}
              {onDismissGuideNotice && (
                <button
                  type="button"
                  onClick={onDismissGuideNotice}
                  className="p-1 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200/60 rounded-lg transition cursor-pointer shrink-0"
                  title="Hinweis ausblenden"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 1: BASISDATEN, FAHRZEUGDATEN, KAROSSERIE & BEREIFUNG                */}
      {/* ========================================================================= */}
      <div 
        id="uebergabeprotokoll-page-1"
        className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 print:mb-0 print:shadow-none print:w-full print:max-w-none print:min-h-0 print:p-0 print:break-after-page text-xs leading-relaxed font-sans flex flex-col justify-between"
      >
        {/* Top Header & Page 1 Content */}
        <div className="space-y-4">
          {/* Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3.5">
            <div>
              <div className="text-xl font-black tracking-tight text-slate-950 uppercase">
                {merchantSettings.companyName || 'MaxFleet Autohandel'}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {merchantSettings.street}, {merchantSettings.postalCode} {merchantSettings.city}
              </div>
              <div className="text-[10px] text-slate-500">
                Tel: {merchantSettings.phone} • E-Mail: {merchantSettings.email}
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-xs text-slate-900">
                Protokoll-Nr.: {internalRefNumber}
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                Datum: <strong>{protocol.protocolDate}</strong>
              </div>
              <div className="text-[10px] text-slate-500">
                Dokumentenseite: <strong className="text-slate-900">1 / 3</strong>
              </div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center py-2 bg-slate-900 text-white rounded-lg shadow-xs">
            <h1 className="text-sm sm:text-base font-black tracking-wide uppercase">
              Fahrzeug-Übergabeprotokoll & Zustandsbericht
            </h1>
            <p className="text-[10px] text-slate-300 font-medium">
              Seite 1 von 3: Basisdaten, Fahrzeugidentifikation, Karosserie-Inspektion & Bereifung
            </p>
          </div>

          {/* 1. Beteiligte Parteien (2 Columns) */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-500 text-[10px] block uppercase border-b border-slate-200 pb-1 mb-1.5">
                Übergeber (Autohaus / Verkäufer)
              </span>
              <div className="font-bold text-slate-900">{merchantSettings.companyName}</div>
              <div className="text-slate-700">{merchantSettings.responsiblePerson || 'Geschäftsleitung'}</div>
              <div className="text-slate-600">{merchantSettings.street}, {merchantSettings.postalCode} {merchantSettings.city}</div>
              <div className="text-slate-600">Tel: {merchantSettings.phone}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-500 text-[10px] block uppercase border-b border-slate-200 pb-1 mb-1.5">
                Übernehmer (Käufer / Erwerber)
              </span>
              <div className="font-bold text-slate-900">{protocol.buyerName || 'Kunde'}</div>
              <div className="text-slate-700">{protocol.buyerStreet || 'Musterstraße 1'}</div>
              <div className="text-slate-600">{protocol.buyerPostalCode} {protocol.buyerCity}</div>
              <div className="text-slate-600">Tel: {protocol.buyerPhone || '-'}</div>
            </div>
          </div>

          {/* 2. Fahrzeugdaten Table */}
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
              <span>1. Fahrzeugdaten & Identifikation</span>
              {onOpenVehicleSettings && (
                <button
                  type="button"
                  onClick={onOpenVehicleSettings}
                  className="print:hidden text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Im Lager anpassen</span>
                </button>
              )}
            </div>
            <table className="w-full text-left text-[11px] border border-slate-200 rounded-lg overflow-hidden">
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-slate-50">
                  <td className="p-1.5 font-bold text-slate-600 w-1/4">Fahrzeug:</td>
                  <td className="p-1.5 font-bold text-slate-900 w-1/4">
                    {protocol.brand} {protocol.model} {protocol.variant || ''}
                  </td>
                  <td className="p-1.5 font-bold text-slate-600 w-1/4">Fahrgestellnummer (FIN):</td>
                  <td className="p-1.5 font-mono font-bold text-slate-900 w-1/4">
                    {protocol.vin || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold text-slate-600">Amtl. Kennzeichen:</td>
                  <td className="p-1.5 font-mono font-bold text-slate-900">{protocol.licensePlate || 'Abgemeldet'}</td>
                  <td className="p-1.5 font-bold text-slate-600">Erstzulassung:</td>
                  <td className="p-1.5 text-slate-900 font-medium">{protocol.firstRegistration || '-'}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 font-bold text-slate-600">Kilometerstand:</td>
                  <td className="p-1.5 font-bold text-slate-900">
                    {Number(protocol.mileage || 0).toLocaleString('de-DE')} km
                  </td>
                  <td className="p-1.5 font-bold text-slate-600">Kraftstoff / Antrieb:</td>
                  <td className="p-1.5 text-slate-900">{protocol.fuelType || 'Benzin'}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold text-slate-600">Farbe / Lackierung:</td>
                  <td className="p-1.5 text-slate-900">{protocol.color || 'Schwarz'}</td>
                  <td className="p-1.5 font-bold text-slate-600">Motorleistung:</td>
                  <td className="p-1.5 text-slate-900">
                    {protocol.powerPs ? `${protocol.powerPs} PS (${protocol.powerKw || Math.round(protocol.powerPs * 0.7355)} kW)` : '-'}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 font-bold text-slate-600">Tankfüllstand:</td>
                  <td className="p-1.5 text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{protocol.fuelLevel || '75% (3/4)'}</span>
                      {onUpdateField && (
                        <div className="print:hidden inline-flex gap-1 text-[9px]">
                          {['50%', '75%', '100%'].map(lvl => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => onUpdateField('fuelLevel', `${lvl} ${lvl === '100%' ? '(Voll)' : ''}`)}
                              className="px-1 py-0.2 bg-white hover:bg-slate-200 border border-slate-300 rounded font-medium cursor-pointer"
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-1.5 font-bold text-slate-600">Anzahl Schlüssel:</td>
                  <td className="p-1.5 font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{protocol.keysCount || 2} Stück</span>
                      {onUpdateField && (
                        <div className="print:hidden inline-flex gap-1 text-[9px]">
                          {[1, 2, 3].map(cnt => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => onUpdateField('keysCount', cnt)}
                              className={`px-1.5 py-0.2 rounded border font-bold cursor-pointer ${
                                protocol.keysCount === cnt ? 'bg-slate-900 text-white' : 'bg-white border-slate-300'
                              }`}
                            >
                              {cnt}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Karosserie- & Außeninspektion Table */}
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-xs flex justify-between items-center">
              <span>2. Karosserie- & Außeninspektion</span>
              <span className="text-[10px] text-slate-500 font-normal">Klicken zum Umschalten [O.K. / Mangel]</span>
            </div>
            <table className="w-full text-left text-[10px] border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-1.5 w-2/5">Prüfpunkt</th>
                  <th className="p-1.5 w-1/5 text-center">Status</th>
                  <th className="p-1.5 w-2/5">Feststellung / Bemerkung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { key: 'bumperFront' as const, label: 'Stoßfänger vorne' },
                  { key: 'bumperRear' as const, label: 'Stoßfänger hinten' },
                  { key: 'grille' as const, label: 'Kühlergrill & Frontmaske' },
                  { key: 'hood' as const, label: 'Motorhaube' },
                  { key: 'fendersFront' as const, label: 'Kotflügel vorne (li / re)' },
                  { key: 'fendersRear' as const, label: 'Seitenwände & Kotflügel hinten' },
                  { key: 'doorsLeft' as const, label: 'Türen links (v/h)' },
                  { key: 'doorsRight' as const, label: 'Türen rechts (v/h)' },
                  { key: 'roof' as const, label: 'Dach & Säulen' },
                  { key: 'trunkLid' as const, label: 'Heckklappe / Kofferraumdeckel' },
                  { key: 'windshield' as const, label: 'Frontscheibe & Verglasung' },
                  { key: 'headlights' as const, label: 'Scheinwerfer & Leuchten' }
                ].map(item => {
                  const current = protocol.externalInspection?.[item.key] || { status: 'ok', note: '' };
                  const isOk = current.status === 'ok';
                  return (
                    <tr key={item.key} className="hover:bg-slate-50 transition">
                      <td className="p-1 font-semibold text-slate-800">{item.label}</td>
                      <td className="p-1 text-center">
                        {onToggleCheckItem ? (
                          <button
                            type="button"
                            onClick={() => onToggleCheckItem('external', item.key, isOk ? 'mangel' : 'ok')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition print:border-none ${
                              isOk 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                                : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                            }`}
                          >
                            {isOk ? 'O.K. [X]' : 'Mangel [!]'}
                          </button>
                        ) : (
                          <span className={`font-bold ${isOk ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isOk ? 'O.K. [X]' : 'Mangel [!]'}
                          </span>
                        )}
                      </td>
                      <td className="p-1 text-slate-600 italic">
                        {current.note || (isOk ? 'Ohne Befund / Einwandfrei' : 'Vorschaden vermerkt')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. Bereifung & Räder */}
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-xs">3. Bereifung & Räder</div>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">Vorne Links (VL)</span>
                <span className="font-bold text-slate-900 text-xs">{protocol.tires?.frontLeftMm || 6.5} mm</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">Vorne Rechts (VR)</span>
                <span className="font-bold text-slate-900 text-xs">{protocol.tires?.frontRightMm || 6.5} mm</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">Hinten Links (HL)</span>
                <span className="font-bold text-slate-900 text-xs">{protocol.tires?.rearLeftMm || 6.0} mm</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">Hinten Rechts (HR)</span>
                <span className="font-bold text-slate-900 text-xs">{protocol.tires?.rearRightMm || 6.0} mm</span>
              </div>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-700 flex justify-between items-center">
              <span>Reifentyp: <strong>{protocol.tires?.tireType || 'Sommerreifen'}</strong></span>
              <span>Felgen: <strong>{protocol.tires?.rimType || 'Alufelgen'} ({protocol.tires?.rimsCondition === 'ok' ? 'Einwandfrei' : 'Gebrauchsspuren'})</strong></span>
              <span>Pannenhilfe: <strong>{protocol.tires?.spareWheel || 'Pannenset'}</strong></span>
            </div>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <div className="text-[10px] text-slate-400 italic text-center">
            (Fortsetzung des Zustandsberichts auf Seite 2: Innenraum & Mechanik)
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 border-t border-slate-100">
            <span>{merchantSettings.companyName} • Übergabeprotokoll {internalRefNumber}</span>
            <span>Seite 1 von 3</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: INNENRAUM, ZUSATZAUSSTATTUNG & MECHANISCHE FUNKTIONSPRÜFUNG       */}
      {/* ========================================================================= */}
      <div 
        id="uebergabeprotokoll-page-2"
        className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 print:mb-0 print:shadow-none print:w-full print:max-w-none print:min-h-0 print:p-0 print:break-after-page text-xs leading-relaxed font-sans flex flex-col justify-between"
      >
        {/* Page 2 Body */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
            <div>
              <div className="text-base font-black text-slate-950 uppercase">
                {merchantSettings.companyName}
              </div>
              <div className="text-[10px] text-slate-500">
                Fahrzeug: {protocol.brand} {protocol.model} • FIN: {protocol.vin || '-'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-slate-800">
                Protokoll-Nr.: {internalRefNumber}
              </div>
              <div className="text-[10px] text-slate-500">
                Dokumentenseite: <strong className="text-slate-900">2 / 3</strong>
              </div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center py-2 bg-slate-900 text-white rounded-lg shadow-xs">
            <h2 className="text-sm sm:text-base font-black tracking-wide uppercase">
              Fahrzeug-Übergabeprotokoll & Zustandsbericht
            </h2>
            <p className="text-[10px] text-slate-300 font-medium">
              Seite 2 von 3: Innenraum, Zusatzausstattung & Mechanische Funktionsprüfung
            </p>
          </div>

          {/* 1. Innenraum & Cockpit-Funktionen */}
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-xs flex justify-between items-center">
              <span>1. Innenraum & Cockpit-Funktionen</span>
              <span className="text-[10px] text-slate-500 font-normal">Klicken zum Umschalten [O.K. / Mangel]</span>
            </div>
            <table className="w-full text-left text-[10px] border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-1.5 w-2/5">Prüfpunkt</th>
                  <th className="p-1.5 w-1/5 text-center">Status</th>
                  <th className="p-1.5 w-2/5">Feststellung / Bemerkung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { key: 'seatsUpholstery' as const, label: 'Sitze, Polster & Kopfstützen' },
                  { key: 'steeringWheel' as const, label: 'Lenkrad & Bedienelemente' },
                  { key: 'dashboardCockpit' as const, label: 'Armaturenbrett & Handschuhfach' },
                  { key: 'infotainmentNavi' as const, label: 'Infotainment & Navigationssystem' },
                  { key: 'airConditioning' as const, label: 'Klimaanlage & Lüftung' },
                  { key: 'seatbelts' as const, label: 'Sicherheitsgurte (alle Plätze)' },
                  { key: 'floorMats' as const, label: 'Fußmatten' },
                  { key: 'headliner' as const, label: 'Dachhimmel' },
                  { key: 'mirrors' as const, label: 'Rückspiegel & Außenspiegel' }
                ].map(item => {
                  const current = protocol.interiorInspection?.[item.key] || { status: 'ok', note: '' };
                  const isOk = current.status === 'ok';
                  return (
                    <tr key={item.key} className="hover:bg-slate-50 transition">
                      <td className="p-1.5 font-semibold text-slate-800">{item.label}</td>
                      <td className="p-1.5 text-center">
                        {onToggleCheckItem ? (
                          <button
                            type="button"
                            onClick={() => onToggleCheckItem('interior', item.key, isOk ? 'mangel' : 'ok')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition print:border-none ${
                              isOk 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                                : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                            }`}
                          >
                            {isOk ? 'O.K. [X]' : 'Mangel [!]'}
                          </button>
                        ) : (
                          <span className={`font-bold ${isOk ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isOk ? 'O.K. [X]' : 'Mangel [!]'}
                          </span>
                        )}
                      </td>
                      <td className="p-1.5 text-slate-600 italic">
                        {current.note || (isOk ? 'Ohne Beanstandung / Sauber' : 'Gebrauchsspuren')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. Zusatzausstattung & Zubehör-Check */}
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-xs">2. Zusatzausstattung & Zubehör</div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {[
                { key: 'centralLocking', label: 'Zentralverriegelung mit Fernbedienung' },
                { key: 'powerWindows', label: 'Elektrische Fensterheber' },
                { key: 'sunroof', label: 'Schiebedach / Panoramadach' },
                { key: 'parkingSensorsPdc', label: 'PDC Parksensoren (vorn / hinten)' },
                { key: 'backupCamera', label: 'Rückfahrkamera / Surround View' },
                { key: 'secondTireSet', label: '2. Satz Räder (Winter/Sommer)' },
                { key: 'firstAidWarningTriangle', label: 'Warndreieck & Verbandskasten' },
                { key: 'onboardTools', label: 'Bordwerkzeug & Wagenheber' }
              ].map(item => {
                const current = (protocol.additionalEquipment as any)?.[item.key] || { present: true };
                const isPresent = current.present !== false;
                return (
                  <div 
                    key={item.key} 
                    onClick={() => onToggleCheckItem && onToggleCheckItem('equipment', item.key, !isPresent)}
                    className={`p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center transition ${
                      onToggleCheckItem ? 'cursor-pointer hover:bg-slate-100' : ''
                    }`}
                  >
                    <span className="font-medium text-slate-800">{item.label}</span>
                    <span className={`font-bold ${isPresent ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {isPresent ? '[X] Vorhanden' : '[-] Fehlt'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Mechanische & Technische Funktionsprüfung */}
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-xs flex justify-between items-center">
              <span>3. Mechanische & Technische Funktionsprüfung</span>
              <span className="text-[10px] text-slate-500 font-normal">Klicken zum Umschalten</span>
            </div>
            <table className="w-full text-left text-[10px] border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-1.5 w-2/5">Komponente</th>
                  <th className="p-1.5 w-1/5 text-center">Zustand</th>
                  <th className="p-1.5 w-2/5">Prüfvermerk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { key: 'engineStartIdle' as const, label: 'Motorstart & Leerlaufverhalten' },
                  { key: 'transmissionGearbox' as const, label: 'Getriebe / Schaltbarkeit' },
                  { key: 'clutch' as const, label: 'Kupplungsfunktion' },
                  { key: 'brakesHandbrake' as const, label: 'Bremsanlage & Handbremse' },
                  { key: 'steeringHandling' as const, label: 'Lenkung & Fahrverhalten' },
                  { key: 'suspensionShockAbsorbers' as const, label: 'Stoßdämpfer & Fahrwerk' },
                  { key: 'oilCoolantLevels' as const, label: 'Flüssigkeiten (Motoröl / Kühlwasser)' },
                  { key: 'starterBattery' as const, label: 'Starterbatterie & Ladezustand' },
                  { key: 'cockpitWarningLights' as const, label: 'Warnleuchten (ABS / Airbag / MKL)' }
                ].map(item => {
                  const current = protocol.mechanicalInspection?.[item.key] || { status: 'ok', note: '' };
                  const isOk = current.status === 'ok';
                  return (
                    <tr key={item.key} className="hover:bg-slate-50 transition">
                      <td className="p-1.5 font-semibold text-slate-800">{item.label}</td>
                      <td className="p-1.5 text-center">
                        {onToggleCheckItem ? (
                          <button
                            type="button"
                            onClick={() => onToggleCheckItem('mechanical', item.key, isOk ? 'mangel' : 'ok')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition print:border-none ${
                              isOk 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                                : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                            }`}
                          >
                            {isOk ? 'Geprüft & O.K.' : 'Mangel'}
                          </button>
                        ) : (
                          <span className={`font-bold ${isOk ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isOk ? 'Geprüft & O.K.' : 'Mangel'}
                          </span>
                        )}
                      </td>
                      <td className="p-1.5 text-slate-600 italic">
                        {current.note || (isOk ? 'Einwandfrei & Funktionsfähig' : 'Prüfhinweis')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page 2 Footer */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <div className="text-[10px] text-slate-400 italic text-center">
            (Fortsetzung auf Seite 3: Schadenserfassung, Fahrzeugunterlagen & Rechtsverbindliche Unterschriften)
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 border-t border-slate-100">
            <span>{merchantSettings.companyName} • Übergabeprotokoll {internalRefNumber}</span>
            <span>Seite 2 von 3</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 3: SCHADENSERFASSUNG, UNTERLAGEN, KÄUFERERKLÄRUNG & SIGNATUREN       */}
      {/* ========================================================================= */}
      <div 
        id="uebergabeprotokoll-page-3"
        className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 print:mb-0 print:shadow-none print:w-full print:max-w-none print:min-h-0 print:p-0 text-xs leading-relaxed font-sans flex flex-col justify-between"
      >
        {/* Page 3 Body */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
            <div>
              <div className="text-base font-black text-slate-950 uppercase">
                {merchantSettings.companyName}
              </div>
              <div className="text-[10px] text-slate-500">
                Fahrzeug: {protocol.brand} {protocol.model} • FIN: {protocol.vin || '-'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-slate-800">
                Protokoll-Nr.: {internalRefNumber}
              </div>
              <div className="text-[10px] text-slate-500">
                Dokumentenseite: <strong className="text-slate-900">3 / 3</strong>
              </div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center py-2 bg-slate-900 text-white rounded-lg shadow-xs">
            <h2 className="text-sm sm:text-base font-black tracking-wide uppercase">
              Fahrzeug-Übergabeprotokoll & Zustandsbericht
            </h2>
            <p className="text-[10px] text-slate-300 font-medium">
              Seite 3 von 3: Schadenserfassung (D1–D4), Unterlagen, Käufererklärung & Rechtsverbindliche Unterschriften
            </p>
          </div>

          {/* 1. Schadenserfassung & Vorschäden (D1–D4) */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 text-xs flex justify-between items-center">
              <span>1. Schadenserfassung & Vorschäden (Klassifizierung D1 – D4)</span>
              <span className="text-[10px] text-slate-500 font-normal">
                D1: Lack | D2: &lt;1cm | D3: Mittel | D4: Groß/Unfall
              </span>
            </div>

            {protocol.damagePoints && protocol.damagePoints.length > 0 ? (
              <table className="w-full text-left text-[10px] border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-1.5 w-10 text-center">Nr.</th>
                    <th className="p-1.5 w-32">Kategorie</th>
                    <th className="p-1.5 w-1/3">Bauteil / Bereich</th>
                    <th className="p-1.5">Schadensbeschreibung / Zustand</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {protocol.damagePoints.map((dmg, idx) => (
                    <tr key={dmg.id || idx} className="hover:bg-slate-50">
                      <td className="p-1.5 text-center font-bold text-slate-500">#{idx + 1}</td>
                      <td className="p-1.5 font-bold text-emerald-900">
                        <span className="px-1.5 py-0.5 bg-emerald-100 border border-emerald-300 rounded text-[9px]">
                          {getCategoryBadgeText(dmg.category)}
                        </span>
                      </td>
                      <td className="p-1.5 font-semibold text-slate-800">{dmg.title}</td>
                      <td className="p-1.5 text-slate-600">{dmg.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Keine unfallbedingten Vorschäden oder optischen Beschädigungen erfasst (Altersübliche Gebrauchsspuren).</span>
                </div>
                {onOpenVehicleSettings && (
                  <button
                    type="button"
                    onClick={onOpenVehicleSettings}
                    className="print:hidden text-[10px] font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    + Mangel erfassen
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. Ausgehändigte Fahrzeugunterlagen */}
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-xs">2. Ausgehändigte Fahrzeugunterlagen</div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {[
                { key: 'hasKfzBrief', label: 'Zulassungsbescheinigung Teil II (KFZ-Brief)' },
                { key: 'hasKfzSchein', label: 'Zulassungsbescheinigung Teil I (KFZ-Schein)' },
                { key: 'hasServiceBook', label: 'Serviceheft / Wartungsnachweise' },
                { key: 'hasCoCDocument', label: 'COC-Papier (EG-Übereinstimmung)' },
                { key: 'hasPreviousInvoice', label: 'Kaufvertrags-Rechnung / Quittung' },
                { key: 'hasDeregistrationDoc', label: 'Abmeldebescheinigung' },
                { key: 'hasManuals', label: 'Bedienungsanleitungen / Bordbuch' }
              ].map(doc => {
                const isChecked = (protocol.associatedDocuments as any)?.[doc.key] !== false;
                return (
                  <div 
                    key={doc.key} 
                    onClick={() => onToggleCheckItem && onToggleCheckItem('documents', doc.key, !isChecked)}
                    className={`p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center transition ${
                      onToggleCheckItem ? 'cursor-pointer hover:bg-slate-100' : ''
                    }`}
                  >
                    <span className="text-slate-800">{doc.label}</span>
                    <span className={`font-bold ${isChecked ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {isChecked ? '[X] Übergeben' : '[-] Nicht vorh.'}
                    </span>
                  </div>
                );
              })}
              <div className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                <span className="text-slate-800">Nächste HU/AU gültig bis:</span>
                <span className="font-bold text-slate-900">{protocol.associatedDocuments?.huValidityDate || 'Neu vor Übergabe'}</span>
              </div>
            </div>
          </div>

          {/* 3. Rechtsverbindliche Käufererklärung & Empfangsbestätigung */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              <span>3. Rechtsverbindliche Käufererklärung & Empfangsbestätigung</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-800 leading-relaxed space-y-2">
              <p>
                Der Käufer/Übernehmer bestätigt hiermit ausdrücklich, das oben bezeichnete Fahrzeug nebst den aufgeführten <strong>{protocol.keysCount || 2} Schlüsseln</strong> und Fahrzeugpapieren im besichtigten und protokollierten Zustand übernommen zu haben. Über den optischen und technischen Zustand sowie bekannte Mängel wurde der Käufer vollumfänglich aufgeklärt.
              </p>
              <div className="space-y-1 pt-1 border-t border-slate-200 text-[9.5px]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Fahrzeug optisch und technisch wie protokolliert besichtigt & übernommen</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Schlüsselanzahl und Fahrzeugunterlagen vollständig ausgehändigt erhalten</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Belehrung über die Pflicht zur unverzüglichen Ummeldung des Fahrzeugs zur Kenntnis genommen</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Footer Block with Signatures */}
        <div className="pt-3 border-t border-slate-200 space-y-3">
          <div className="text-[10px] text-slate-600 text-center">
            Ort, Datum: <strong>{protocol.place || merchantSettings.city || 'Bonn'}</strong>, den <strong>{protocol.handoverDate || protocol.protocolDate || new Date().toLocaleDateString('de-DE')}</strong>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-1">
            {/* Buyer Signature Box */}
            <div className="text-center space-y-1.5">
              <div 
                onClick={() => onSign && onSign('buyer')}
                className={`h-16 border-b-2 border-slate-400 flex items-end justify-center pb-1 relative transition ${
                  onSign ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
              >
                {protocol.buyerSignature ? (
                  <div className="relative group w-full h-full flex items-center justify-center">
                    <img
                      src={protocol.buyerSignature}
                      alt="Unterschrift Käufer"
                      className="max-h-14 max-w-full object-contain"
                    />
                    {onClearSignature && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearSignature('buyer');
                        }}
                        className="print:hidden absolute top-0 right-0 p-1 text-rose-500 hover:text-rose-700 rounded transition cursor-pointer"
                        title="Unterschrift löschen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                    <PenTool className="w-3 h-3 text-slate-400 print:hidden" />
                    <span>Hier unterschreiben (Übernehmer / Käufer)</span>
                  </span>
                )}
              </div>
              <div className="text-[10px] font-bold text-slate-900">
                Unterschrift Käufer ({protocol.buyerName || 'Übernehmer'})
              </div>
            </div>

            {/* Seller Signature Box */}
            <div className="text-center space-y-1.5">
              <div 
                onClick={() => onSign && onSign('seller')}
                className={`h-16 border-b-2 border-slate-400 flex items-end justify-center pb-1 relative transition ${
                  onSign ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
              >
                {protocol.sellerSignature ? (
                  <div className="relative group w-full h-full flex items-center justify-center">
                    <img
                      src={protocol.sellerSignature}
                      alt="Unterschrift Händler"
                      className="max-h-14 max-w-full object-contain"
                    />
                    {onClearSignature && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearSignature('seller');
                        }}
                        className="print:hidden absolute top-0 right-0 p-1 text-rose-500 hover:text-rose-700 rounded transition cursor-pointer"
                        title="Unterschrift löschen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                    <PenTool className="w-3 h-3 text-slate-400 print:hidden" />
                    <span>Hier unterschreiben (Übergeber / Autohaus)</span>
                  </span>
                )}
              </div>
              <div className="text-[10px] font-bold text-slate-900">
                Unterschrift Autohaus ({merchantSettings.responsiblePerson || 'Übergeber'})
              </div>
            </div>
          </div>

          {/* Page 3 Numbering */}
          <div className="flex justify-between items-center text-[9px] text-slate-400 pt-2 border-t border-slate-100">
            <span>{merchantSettings.companyName} • Übergabeprotokoll {internalRefNumber}</span>
            <span>Seite 3 von 3</span>
          </div>
        </div>
      </div>

    </div>
  );
};
