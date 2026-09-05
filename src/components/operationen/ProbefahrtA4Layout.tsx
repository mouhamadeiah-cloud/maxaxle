import React from 'react';
import { MerchantSettings, ProbefahrtDetails } from '../../types';
import { ShieldAlert, PenTool, RotateCcw, User, Key, Gauge, Route, Fuel, Coins, Clock, Sparkles } from 'lucide-react';

export type ProbefahrtEditField = 
  | 'plate'
  | 'driver'
  | 'mileage'
  | 'route'
  | 'fuel'
  | 'deposit'
  | 'duration'
  | 'liability'
  | 'signatureDriver'
  | 'signatureDealer';

interface ProbefahrtA4LayoutProps {
  probefahrt: ProbefahrtDetails;
  merchantSettings: MerchantSettings;
  internalRefNumber?: string;
  pageNumber?: number;
  totalPages?: number;
  onEditField?: (field: ProbefahrtEditField) => void;
  onSign?: (type: 'driver' | 'dealer') => void;
  onClearSignature?: (type: 'driver' | 'dealer') => void;
}

export const ProbefahrtA4Layout: React.FC<ProbefahrtA4LayoutProps> = ({
  probefahrt,
  merchantSettings,
  internalRefNumber = 'PF-2608-1000',
  pageNumber = 1,
  totalPages = 1,
  onEditField,
  onSign,
  onClearSignature
}) => {
  // Minimalist Glowing Edit Dot (Strictly print:hidden)
  const GlowingEditDot: React.FC<{
    onClick: () => void;
    title: string;
    className?: string;
  }> = ({ onClick, title, className = '' }) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={`group relative inline-flex items-center justify-center p-1 rounded-full cursor-pointer print:hidden select-none outline-none focus:outline-none transition-transform hover:scale-135 ${className}`}
    >
      {/* Outer Pulse Arc */}
      <span className="absolute w-4 h-4 rounded-full bg-emerald-400/35 animate-ping pointer-events-none" />
      {/* Inner Glowing Emerald Dot */}
      <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-200 shadow-[0_0_8px_#10b981] group-hover:bg-emerald-300 group-hover:shadow-[0_0_14px_#34d399] transition-all" />
    </button>
  );

  return (
    <div 
      id="operationen-probefahrt-a4-sheet"
      className="w-full bg-white text-slate-900 font-sans text-xs leading-relaxed print:p-0 print:m-0 flex flex-col justify-between min-h-[1050px] p-8 sm:p-12 shadow-xl print:shadow-none transition-all relative"
    >
      {/* Top Header */}
      <div className="space-y-5">
        
        {/* Company Letterhead & Red License Plate Badge */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
          <div>
            <div className="text-xl font-black tracking-tight text-slate-950 uppercase">
              {merchantSettings.companyName || 'MaxFleet Autohandel'}
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              {merchantSettings.street}, {merchantSettings.postalCode} {merchantSettings.city}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Tel: {merchantSettings.phone || '+49 30 8920100'} • E-Mail: {merchantSettings.email || 'info@maxfleet.de'}
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            {/* Red License Plate High-Visibility Badge */}
            <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-50/90 border-2 border-red-600 text-red-700 font-mono font-black text-sm tracking-wider shadow-xs">
              <span>ROTE NUMMER:</span>
              <span className="underline decoration-red-400">{probefahrt.redLicensePlate || 'B-06124'}</span>
              
              {/* Glowing Edit Dot for Red Plates */}
              {onEditField && (
                <div className="ml-1 flex items-center">
                  <GlowingEditDot
                    onClick={() => onEditField('plate')}
                    title="Rotes Kennzeichen auswählen / ändern"
                  />
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-mono mt-2">
              Protokoll-Nr.: <span className="font-bold text-slate-800">{internalRefNumber}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Datum: <span className="font-bold text-slate-800">{probefahrt.date || new Date().toLocaleDateString('de-DE')}</span>
            </div>
          </div>
        </div>

        {/* Document Title Banner */}
        <div className="text-center py-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
          <h1 className="text-sm sm:text-base font-black tracking-wider uppercase">
            Probefahrt-Vereinbarung & Fahrzeughaftung
          </h1>
          <p className="text-[10px] text-slate-300 font-medium">
            Rechtsverbindliche Überlassung für Prüfungs- und Probefahrtzwecke gem. § 16 Abs. 2 FZV
          </p>
        </div>

        {/* 2-Column Parties Section */}
        <div className="grid grid-cols-2 gap-5 text-[11px]">
          {/* Autohaus / Geber */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5 uppercase text-[10px] tracking-wider text-slate-500 flex justify-between items-center">
              <span>Fahrzeugüberlasser (Autohaus)</span>
              <span className="text-[9px] text-slate-400 font-normal">Händler</span>
            </div>
            <div className="font-bold text-slate-900">{merchantSettings.companyName || 'MaxFleet Autohandel'}</div>
            <div className="text-slate-600">{merchantSettings.responsiblePerson || 'Inhaber / GF'}</div>
            <div className="text-slate-600">{merchantSettings.street}</div>
            <div className="text-slate-600">{merchantSettings.postalCode} {merchantSettings.city}</div>
            <div className="text-slate-600">Tel: {merchantSettings.phone}</div>
          </div>

          {/* Probefahrer / Interessent */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1 relative group">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5 uppercase text-[10px] tracking-wider text-slate-500 flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <span>Probefahrer (Interessent)</span>
                {onEditField && (
                  <GlowingEditDot
                    onClick={() => onEditField('driver')}
                    title="Probefahrer / Kundendaten ändern"
                  />
                )}
              </span>
              <span className="text-[9px] text-slate-400 font-normal">Fahrzeugführer</span>
            </div>
            <div className="font-bold text-slate-900">{probefahrt.driverName || 'N.N.'}</div>
            <div className="text-slate-600">{probefahrt.driverStreet || 'Straße nicht angegeben'}</div>
            <div className="text-slate-600">{probefahrt.driverPostalCode} {probefahrt.driverCity}</div>
            <div className="text-slate-600">Tel: {probefahrt.driverPhone || '-'}</div>
            <div className="font-mono font-bold text-slate-800 text-[10px] pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Führerschein: {probefahrt.drivingLicenseNumber || 'Geprüft'}</span>
              <span className="text-slate-500 text-[9px] font-sans">Klassen: {probefahrt.drivingLicenseClasses || 'B'}</span>
            </div>
          </div>
        </div>

        {/* 1. Vehicle Data Section */}
        <div className="space-y-1.5">
          <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
            <span className="uppercase tracking-wider text-[11px] text-slate-700">1. Fahrzeugdaten (Probefahrzeug)</span>
            <span className="text-[10px] text-slate-400 font-normal italic">
              (Rein fahrtechnische Überlassung — kein Kaufbeleg)
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
            <div className="grid grid-cols-4 bg-slate-50/80 p-2.5 border-b border-slate-200">
              <div className="font-bold text-slate-600">Fahrzeug:</div>
              <div className="font-bold text-slate-900">{probefahrt.brand} {probefahrt.model} {probefahrt.variant}</div>
              <div className="font-bold text-slate-600">Fahrgestell-Nr. (FIN):</div>
              <div className="font-mono font-bold text-slate-900">{probefahrt.vin || '-'}</div>
            </div>

            <div className="grid grid-cols-4 p-2.5 border-b border-slate-200 items-center">
              <div className="font-bold text-slate-600 flex items-center gap-1.5">
                <span>Rotes Kennzeichen:</span>
                {onEditField && (
                  <GlowingEditDot
                    onClick={() => onEditField('plate')}
                    title="Rotes Kennzeichen ändern"
                  />
                )}
              </div>
              <div className="font-mono font-black text-red-600">{probefahrt.redLicensePlate || 'B-06124'}</div>
              <div className="font-bold text-slate-600">Farbe / Lack:</div>
              <div className="text-slate-900">{probefahrt.color || 'Schwarz'}</div>
            </div>

            <div className="grid grid-cols-4 bg-slate-50/80 p-2.5 border-b border-slate-200 items-center">
              <div className="font-bold text-slate-600 flex items-center gap-1.5">
                <span>Start-Kilometerstand:</span>
                {onEditField && (
                  <GlowingEditDot
                    onClick={() => onEditField('mileage')}
                    title="Tachostand bei Übergabe anpassen"
                  />
                )}
              </div>
              <div className="font-bold text-slate-900 font-mono">{probefahrt.mileageStart?.toLocaleString('de-DE')} km</div>
              
              <div className="font-bold text-slate-600 flex items-center gap-1.5">
                <span>Max. Fahrtstrecke:</span>
                {onEditField && (
                  <GlowingEditDot
                    onClick={() => onEditField('route')}
                    title="Freikilometer-Limit bearbeiten"
                  />
                )}
              </div>
              <div className="text-slate-900 font-bold font-mono">{probefahrt.routeLimitKm || 50} km</div>
            </div>

            <div className="grid grid-cols-4 p-2.5 items-center">
              <div className="font-bold text-slate-600 flex items-center gap-1.5">
                <span>Tankstand bei Abfahrt:</span>
                {onEditField && (
                  <GlowingEditDot
                    onClick={() => onEditField('fuel')}
                    title="Tankfüllung festlegen"
                  />
                )}
              </div>
              <div className="text-slate-900">{probefahrt.fuelLevelStart || '75% (3/4 Voll)'}</div>

              <div className="font-bold text-slate-600 flex items-center gap-1.5">
                <span>Hinterlegte Kaution:</span>
                {onEditField && (
                  <GlowingEditDot
                    onClick={() => onEditField('deposit')}
                    title="Sicherheitsleistung / Kaution anpassen"
                  />
                )}
              </div>
              <div className="font-bold text-slate-900">
                {probefahrt.depositAmount && probefahrt.depositAmount > 0 
                  ? `${probefahrt.depositAmount.toLocaleString('de-DE')} € (Bar/Karte)` 
                  : 'Keine'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Nutzungsdauer & Rückgabezeit */}
        <div className="space-y-1.5">
          <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-slate-700">
              <span>2. Vereinbarte Nutzungsdauer & Rückgabezeit</span>
              {onEditField && (
                <GlowingEditDot
                  onClick={() => onEditField('duration')}
                  title="Fahrtdauer & Zeitfenster ändern"
                />
              )}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center text-[11px]">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Abfahrt (Startzeit)</span>
              <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block">{probefahrt.startTime || '10:00'} Uhr</span>
            </div>
            <div className="border-x border-slate-200 px-2">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Vereinbarte Fahrtdauer</span>
              <span className="font-black text-red-600 text-sm mt-0.5 block">{probefahrt.durationMinutes || 30} Minuten</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Geplante Rückkehr</span>
              <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block">{probefahrt.expectedReturnTime || '10:30'} Uhr</span>
            </div>
          </div>
        </div>

        {/* 3. Haftungsvereinbarung & Nutzungsregeln */}
        <div className="space-y-1.5">
          <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-slate-700">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>3. Haftungsvereinbarung & Nutzungsregeln</span>
              {onEditField && (
                <GlowingEditDot
                  onClick={() => onEditField('liability')}
                  title="Haftungsregeln, Textvorlagen & Selbstbeteiligung bearbeiten"
                />
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold">
              Kasko-SB: <strong className="text-slate-900 font-mono">{probefahrt.liabilityDeductible?.toLocaleString('de-DE')} €</strong>
            </span>
          </div>

          <div className="text-[10px] text-slate-600 space-y-1.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 leading-relaxed">
            <p>
              <strong>1. Fahrerlaubnis & StVO:</strong> Der Fahrer bestätigt den Besitz einer gültigen Fahrerlaubnis der erforderlichen Klasse. Er verpflichtet sich zur strikten Einhaltung aller Vorschriften der Straßenverkehrsordnung (StVO).
            </p>
            <p>
              <strong>2. Ausschließlichkeit:</strong> Das Fahrzeug darf nur von der im Vertrag benannten Person geführt werden. Eine Überlassung an Dritte ist ausdrücklich untersagt.
            </p>
            <p>
              <strong>3. Alkohol- und Drogenverbot:</strong> Es gilt ein absolutes Verbot von Alkohol (0,0 ‰), Betäubungsmitteln und die Fahrtüchtigkeit beeinträchtigenden Medikamenten.
            </p>
            <p>
              <strong>4. Kaskoversicherung & Selbstbeteiligung:</strong> Für das Fahrzeug besteht Versicherungsschutz. Im Falle eines selbstverschuldeten Unfallschadens haftet der Fahrer bis zu einem Höchstbetrag von <strong>{probefahrt.liabilityDeductible?.toLocaleString('de-DE')} €</strong> je Schadensfall. Bei Vorsatz oder grober Fahrlässigkeit haftet der Fahrer in voller Höhe.
            </p>
            <p>
              <strong>5. Ordnungswidrigkeiten & Maut:</strong> Sämtliche Bußgelder, Verwarnungsgelder, Parkverstöße und Mautgebühren, die während der Probefahrt anfallen, gehen zu Lasten des Probefahrers.
            </p>

            {/* Custom Notes / Addendums */}
            {probefahrt.notes && (
              <div className="pt-2 mt-2 border-t border-slate-200/80 text-slate-800">
                <strong className="text-slate-900 block mb-0.5">Zusatzvereinbarungen / Sonderklauseln:</strong>
                <p className="italic">{probefahrt.notes}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Signatures & Footer Block */}
      <div className="pt-6 border-t-2 border-slate-900 space-y-5">
        <div className="text-[10px] text-slate-600 text-center font-medium">
          Ort, Datum: <strong className="text-slate-900">{probefahrt.place || merchantSettings.city || 'Berlin'}</strong>, den <strong className="text-slate-900">{probefahrt.date || new Date().toLocaleDateString('de-DE')}</strong>
        </div>

        <div className="grid grid-cols-2 gap-10 pt-1">
          
          {/* Driver Signature Box */}
          <div className="text-center space-y-1.5 relative group">
            <div className="h-16 border-b-2 border-slate-400 flex items-end justify-center pb-1 relative bg-slate-50/40 rounded-t-lg">
              {probefahrt.driverSignature ? (
                <img
                  src={probefahrt.driverSignature}
                  alt="Unterschrift Probefahrer"
                  className="max-h-14 max-w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-slate-400 italic">
                  Hier digital unterschreiben
                </span>
              )}

              {/* Glowing Dot on Driver Signature */}
              {onSign && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 print:hidden">
                  <GlowingEditDot
                    onClick={() => onSign('driver')}
                    title={probefahrt.driverSignature ? "Unterschrift Probefahrer neu erfassen" : "Digitale Unterschrift Probefahrer erfassen"}
                  />
                  {probefahrt.driverSignature && onClearSignature && (
                    <button
                      type="button"
                      onClick={() => onClearSignature('driver')}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Unterschrift löschen"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-[10px] font-bold text-slate-800 flex items-center justify-center gap-1">
              <span>Unterschrift Probefahrer ({probefahrt.driverName || 'Interessent'})</span>
            </div>
          </div>

          {/* Dealer Signature Box */}
          <div className="text-center space-y-1.5 relative group">
            <div className="h-16 border-b-2 border-slate-400 flex items-end justify-center pb-1 relative bg-slate-50/40 rounded-t-lg">
              {probefahrt.dealerSignature ? (
                <img
                  src={probefahrt.dealerSignature}
                  alt="Unterschrift Autohaus"
                  className="max-h-14 max-w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-slate-400 italic">
                  Hier digital unterschreiben
                </span>
              )}

              {/* Glowing Dot on Dealer Signature */}
              {onSign && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 print:hidden">
                  <GlowingEditDot
                    onClick={() => onSign('dealer')}
                    title={probefahrt.dealerSignature ? "Unterschrift Autohaus neu erfassen" : "Digitale Unterschrift Autohaus erfassen"}
                  />
                  {probefahrt.dealerSignature && onClearSignature && (
                    <button
                      type="button"
                      onClick={() => onClearSignature('dealer')}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Unterschrift löschen"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-[10px] font-bold text-slate-800">
              Unterschrift Autohaus ({merchantSettings.responsiblePerson || 'Inhaber / Geschäftsleitung'})
            </div>
          </div>

        </div>

        {/* Page numbering & Document Identity */}
        <div className="flex justify-between items-center text-[9px] text-slate-400 pt-2 border-t border-slate-100">
          <span>{merchantSettings.companyName || 'MaxFleet Autohandel'} • Probefahrt-Vereinbarung {internalRefNumber}</span>
          <span>Seite {pageNumber} von {totalPages}</span>
        </div>
      </div>
    </div>
  );
};
