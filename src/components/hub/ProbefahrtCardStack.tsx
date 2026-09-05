import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  User, 
  Key, 
  Clock, 
  Gauge, 
  Shield, 
  Upload, 
  FileText, 
  CheckCircle2, 
  X, 
  ChevronDown, 
  Sparkles, 
  Printer, 
  Check, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Customer, OperationVehicleItem, MerchantSettings, ProbefahrtDetails } from '../../types';

export interface ProbefahrtCardStackProps {
  vehicle: OperationVehicleItem | null;
  customer: Customer | null;
  onOpenVehicleDrawer: () => void;
  onOpenCustomerDrawer: () => void;
  onRemoveCustomer: () => void;
  merchantSettings: MerchantSettings;
  docNumber: string;
  datum: string;

  // Probefahrt specific state
  probefahrtPlate: string;
  setProbefahrtPlate: (plate: string) => void;
  probefahrtDuration: number;
  setProbefahrtDuration: (dur: number) => void;
  probefahrtRouteLimit: number;
  setProbefahrtRouteLimit: (limit: number) => void;
  probefahrtDeductible: number;
  setProbefahrtDeductible: (deductible: number) => void;

  drivingLicenseNumber: string;
  setDrivingLicenseNumber: (num: string) => void;
  drivingLicenseClasses: string;
  setDrivingLicenseClasses: (classes: string) => void;
  drivingLicensePhoto: { name: string; size?: string; type?: string; dataUrl?: string } | null;
  setDrivingLicensePhoto: (photo: { name: string; size?: string; type?: string; dataUrl?: string } | null) => void;

  onOpenPreview: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const ProbefahrtCardStack: React.FC<ProbefahrtCardStackProps> = ({
  vehicle,
  customer,
  onOpenVehicleDrawer,
  onOpenCustomerDrawer,
  onRemoveCustomer,
  merchantSettings,
  docNumber,
  datum,

  probefahrtPlate,
  setProbefahrtPlate,
  probefahrtDuration,
  setProbefahrtDuration,
  probefahrtRouteLimit,
  setProbefahrtRouteLimit,
  probefahrtDeductible,
  setProbefahrtDeductible,

  drivingLicenseNumber,
  setDrivingLicenseNumber,
  drivingLicenseClasses,
  setDrivingLicenseClasses,
  drivingLicensePhoto,
  setDrivingLicensePhoto,

  onOpenPreview,
  onSave,
  isSaving
}) => {
  // Dropdown / Custom state handlers
  const [showPlateMenu, setShowPlateMenu] = useState(false);
  const [isCustomPlate, setIsCustomPlate] = useState(false);
  const [customPlateInput, setCustomPlateInput] = useState('');

  const [showDurationCustom, setShowDurationCustom] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');

  const [showLimitCustom, setShowLimitCustom] = useState(false);
  const [customLimitInput, setCustomLimitInput] = useState('');

  const [showDeductibleCustom, setShowDeductibleCustom] = useState(false);
  const [customDeductibleInput, setCustomDeductibleInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Red license plates from settings or fallback list
  const availablePlates = merchantSettings.redLicensePlates && merchantSettings.redLicensePlates.length > 0 
    ? merchantSettings.redLicensePlates 
    : [
        { id: 'p-1', plateNumber: 'B-06124', status: 'verfuegbar' as const, validUntil: '2027-12-31', logbookNotes: 'Hauptstandort Berlin' },
        { id: 'p-2', plateNumber: 'B-06891', status: 'verfuegbar' as const, validUntil: '2027-12-31', logbookNotes: 'Bereit / Showroom' },
        { id: 'p-3', plateNumber: 'B-06904', status: 'verfuegbar' as const, validUntil: '2028-06-30', logbookNotes: 'Filiale Spandau' },
        { id: 'p-4', plateNumber: 'M-06123', status: 'verfuegbar' as const, validUntil: '2027-06-30', logbookNotes: 'Standort München' }
      ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDrivingLicensePhoto({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
          dataUrl: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDrivingLicensePhoto({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
          dataUrl: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-4 z-10 w-full animate-in fade-in duration-300">
      
      {/* ======================================================================= */}
      {/* CARD 1: FAHRZEUG (STRICTLY WITHOUT PRICE DISPLAY)                       */}
      {/* ======================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative z-30">
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Fahrzeug (Probefahrzeug)</h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Ohne Preisanzeige
            </span>
          </div>
          {vehicle?.brand && (
            <button
              type="button"
              onClick={onOpenVehicleDrawer}
              className="text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#032318] border border-emerald-500/30 cursor-pointer transition hover:border-emerald-400"
            >
              Fahrzeug ändern
            </button>
          )}
        </div>

        {vehicle?.brand ? (
          <div className="p-3.5 rounded-xl bg-[#01140e] border border-emerald-500/30 text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-bold text-white text-sm">
                  {vehicle.brand} {vehicle.model} {vehicle.variant || ''}
                </div>
                <div className="text-emerald-200/70 text-[11px] font-mono mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>VIN: <strong className="text-slate-200 font-bold">{vehicle.vin || 'Nicht angegeben'}</strong></span>
                  <span>•</span>
                  <span>Stand: <strong className="text-slate-200 font-bold">{vehicle.mileage?.toLocaleString('de-DE')} km</strong></span>
                  {vehicle.color && (
                    <>
                      <span>•</span>
                      <span>Farbe: <strong className="text-slate-200 font-bold">{vehicle.color}</strong></span>
                    </>
                  )}
                  {vehicle.firstRegistration && (
                    <>
                      <span>•</span>
                      <span>EZ: <strong className="text-slate-200 font-bold">{vehicle.firstRegistration}</strong></span>
                    </>
                  )}
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-bold self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Probefahrtbereit</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenVehicleDrawer}
            className="w-full py-4 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 group"
          >
            <Car className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Fahrzeug aus Lager auswählen</span>
          </button>
        )}
      </div>

      {/* ======================================================================= */}
      {/* CARD 2: KUNDE (PROBEFAHRER / INTERESSENT)                                */}
      {/* ======================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative z-25">
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Kunde / Probefahrer</h4>
          </div>
          {customer && (
            <button
              type="button"
              onClick={onOpenCustomerDrawer}
              className="text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#032318] border border-emerald-500/30 cursor-pointer transition hover:border-emerald-400"
            >
              Kunde wechseln
            </button>
          )}
        </div>

        {customer ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#01140e] border border-emerald-500/30 text-xs">
            <div>
              <div className="font-bold text-white text-sm">
                {customer.name || customer.companyName}
              </div>
              <div className="text-emerald-200/70 text-[11px] mt-0.5">
                {customer.street || 'Keine Straße'}, {customer.postalCode || customer.zip || ''} {customer.city || ''} • Tel: {customer.phone || customer.mobile || 'Keine Angabe'}
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveCustomer}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#032318] cursor-pointer transition"
              title="Kunde entfernen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenCustomerDrawer}
            className="w-full py-4 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 group"
          >
            <User className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Kunde / Probefahrer auswählen</span>
          </button>
        )}
      </div>

      {/* ======================================================================= */}
      {/* CARD 3: ROTE KENNZEICHEN (DROPDOWN SELECTOR & RED DEALER PLATE)          */}
      {/* ======================================================================= */}
      <div className={`p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative ${
        showPlateMenu ? 'z-[9995]' : 'z-20'
      }`}>
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Rote Kennzeichen</h4>
          </div>
          <span className="text-[11px] font-bold text-red-400 font-mono">
            Händlerkennzeichen gem. § 16 FZV
          </span>
        </div>

        <div className="relative">
          {isCustomPlate ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customPlateInput}
                  onChange={(e) => setCustomPlateInput(e.target.value.toUpperCase())}
                  placeholder="z.B. B-06124 oder M-06999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#01140e] border border-red-500/50 text-red-400 font-mono font-bold text-sm outline-none focus:border-red-400"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (customPlateInput.trim()) {
                    setProbefahrtPlate(customPlateInput.trim());
                  }
                  setIsCustomPlate(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold cursor-pointer transition"
              >
                Übernehmen
              </button>
              <button
                type="button"
                onClick={() => setIsCustomPlate(false)}
                className="p-2.5 rounded-xl bg-[#032318] text-slate-400 hover:text-white border border-emerald-500/20 text-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPlateMenu(!showPlateMenu)}
              className="w-full p-3 rounded-xl bg-[#01140e] border border-emerald-500/30 hover:border-emerald-400 text-white flex items-center justify-between cursor-pointer transition group"
            >
              <div className="flex items-center gap-3">
                {/* Visual German Red Dealer License Plate */}
                <div className="px-3.5 py-1.5 rounded-md bg-white border-2 border-red-600 shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-full bg-blue-700 rounded-xs self-stretch" />
                  <span className="text-red-700 font-mono font-black text-sm tracking-wider">
                    {probefahrtPlate || 'B-06124'}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-200">
                    Ausgewähltes Händlerkennzeichen
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    Klicken zum Wechseln
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                  Verfügbar
                </span>
                <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform ${showPlateMenu ? 'rotate-180' : ''}`} />
              </div>
            </button>
          )}

          {/* Floating High-Z-Index Red License Plate Dropdown */}
          <AnimatePresence>
            {showPlateMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 top-full mt-1.5 z-[9999] bg-[#021d15] border border-emerald-400/60 rounded-xl p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] space-y-1 text-xs backdrop-blur-2xl"
              >
                <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider border-b border-emerald-500/20 mb-1 flex items-center justify-between">
                  <span>Hinterlegte Rote Kennzeichen</span>
                  <span className="text-[9px] text-slate-400">§ 16 FZV</span>
                </div>

                {availablePlates.map((plate) => (
                  <button
                    key={plate.id || plate.plateNumber}
                    type="button"
                    onClick={() => {
                      setProbefahrtPlate(plate.plateNumber);
                      setShowPlateMenu(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left rounded-lg transition font-medium flex items-center justify-between cursor-pointer ${
                      probefahrtPlate === plate.plateNumber 
                        ? 'bg-red-500/20 text-white font-bold border border-red-500/40' 
                        : 'hover:bg-[#032318] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-0.5 rounded bg-white border border-red-600 text-red-700 font-mono font-black text-xs">
                        {plate.plateNumber}
                      </div>
                      <div>
                        <div className="text-slate-200 font-bold">{plate.logbookNotes || 'Händlerkennzeichen'}</div>
                        <div className="text-[10px] text-slate-400">Gültig bis: {plate.validUntil || 'Unbefristet'}</div>
                      </div>
                    </div>
                    {probefahrtPlate === plate.plateNumber ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-emerald-400/80">Wählen</span>
                    )}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setShowPlateMenu(false);
                    setCustomPlateInput(probefahrtPlate);
                    setIsCustomPlate(true);
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-[#032318] text-emerald-300 font-bold border-t border-emerald-500/20 mt-1 cursor-pointer flex items-center justify-between"
                >
                  <span>+ Manuelles / Anderes Kennzeichen eingeben...</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* CARD 4: PROBEFAHRTDETAILS (COMBINED ROW: DAUER, KILOMETERLIMIT, SB)      */}
      {/* ======================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3.5 relative z-15">
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Probefahrtdetails</h4>
          </div>
          <span className="text-xs font-mono text-amber-300 font-bold">Konditionen & Limits</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          
          {/* Element 1: Dauer (30, 45, 60 min or manual) */}
          <div className="p-3 rounded-xl bg-[#01140e] border border-emerald-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-emerald-200/80 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dauer</span>
              </label>
              <span className="font-mono font-black text-amber-300 text-xs">
                {probefahrtDuration} Min.
              </span>
            </div>

            {showDurationCustom ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={customDurationInput}
                  onChange={(e) => setCustomDurationInput(e.target.value)}
                  placeholder="z.B. 90"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#021d15] border border-amber-400/60 text-white font-mono font-bold text-xs outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    const num = parseInt(customDurationInput, 10);
                    if (!isNaN(num) && num > 0) setProbefahrtDuration(num);
                    setShowDurationCustom(false);
                  }}
                  className="px-2 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 text-[10px] font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {[30, 45, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setProbefahrtDuration(d)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer text-center ${
                      probefahrtDuration === d 
                        ? 'bg-amber-400 text-slate-950 shadow-xs' 
                        : 'bg-[#032318] text-slate-300 hover:bg-[#053827] border border-emerald-500/20'
                    }`}
                  >
                    {d}m
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCustomDurationInput(String(probefahrtDuration));
                    setShowDurationCustom(true);
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer text-center ${
                    ![30, 45, 60].includes(probefahrtDuration)
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-[#032318] text-emerald-300 hover:bg-[#053827] border border-emerald-500/20'
                  }`}
                  title="Manuelle Dauer"
                >
                  Frei
                </button>
              </div>
            )}
          </div>

          {/* Element 2: Kilometerlimit (Erlaubte Test-Kilometer, prefilled, fully editable) */}
          <div className="p-3 rounded-xl bg-[#01140e] border border-emerald-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-emerald-200/80 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kilometerlimit</span>
              </label>
              <span className="font-mono font-black text-amber-300 text-xs">
                max. {probefahrtRouteLimit} km
              </span>
            </div>

            {showLimitCustom ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={customLimitInput}
                  onChange={(e) => setCustomLimitInput(e.target.value)}
                  placeholder="z.B. 40"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#021d15] border border-amber-400/60 text-white font-mono font-bold text-xs outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    const num = parseInt(customLimitInput, 10);
                    if (!isNaN(num) && num > 0) setProbefahrtRouteLimit(num);
                    setShowLimitCustom(false);
                  }}
                  className="px-2 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 text-[10px] font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {[30, 40, 50].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setProbefahrtRouteLimit(km)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer text-center ${
                      probefahrtRouteLimit === km 
                        ? 'bg-amber-400 text-slate-950 shadow-xs' 
                        : 'bg-[#032318] text-slate-300 hover:bg-[#053827] border border-emerald-500/20'
                    }`}
                  >
                    {km}k
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCustomLimitInput(String(probefahrtRouteLimit));
                    setShowLimitCustom(true);
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer text-center ${
                    ![30, 40, 50].includes(probefahrtRouteLimit)
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-[#032318] text-emerald-300 hover:bg-[#053827] border border-emerald-500/20'
                  }`}
                  title="Manuelles Kilometerlimit"
                >
                  Frei
                </button>
              </div>
            )}
          </div>

          {/* Element 3: Selbstbeteiligung (Pre-filled 1000 €, fully editable) */}
          <div className="p-3 rounded-xl bg-[#01140e] border border-emerald-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-emerald-200/80 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Selbstbeteiligung</span>
              </label>
              <span className="font-mono font-black text-amber-300 text-xs">
                {probefahrtDeductible.toLocaleString('de-DE')} €
              </span>
            </div>

            {showDeductibleCustom ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="250"
                  value={customDeductibleInput}
                  onChange={(e) => setCustomDeductibleInput(e.target.value)}
                  placeholder="z.B. 1000"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#021d15] border border-amber-400/60 text-white font-mono font-bold text-xs outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    const num = parseInt(customDeductibleInput, 10);
                    if (!isNaN(num) && num >= 0) setProbefahrtDeductible(num);
                    setShowDeductibleCustom(false);
                  }}
                  className="px-2 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 text-[10px] font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {[500, 1000, 1500].map((sb) => (
                  <button
                    key={sb}
                    type="button"
                    onClick={() => setProbefahrtDeductible(sb)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                      probefahrtDeductible === sb 
                        ? 'bg-amber-400 text-slate-950 shadow-xs' 
                        : 'bg-[#032318] text-slate-300 hover:bg-[#053827] border border-emerald-500/20'
                    }`}
                  >
                    {sb >= 1000 ? `${sb / 1000}k` : sb}€
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCustomDeductibleInput(String(probefahrtDeductible));
                    setShowDeductibleCustom(true);
                  }}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                    ![500, 1000, 1500].includes(probefahrtDeductible)
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-[#032318] text-emerald-300 hover:bg-[#053827] border border-emerald-500/20'
                  }`}
                  title="Manuelle Selbstbeteiligung"
                >
                  Frei
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ======================================================================= */}
      {/* CARD 5: FÜHRERSCHEIN (UPLOAD & NUMBER / CLASSES)                         */}
      {/* ======================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3.5 relative z-10">
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Führerschein & Legitimation</h4>
          </div>
          {drivingLicensePhoto && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Foto erfasst</span>
            </span>
          )}
        </div>

        {/* Inputs: Number & Classes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-emerald-200/80 mb-1 block">
              Führerschein-Nummer
            </label>
            <input
              type="text"
              value={drivingLicenseNumber}
              onChange={(e) => setDrivingLicenseNumber(e.target.value.toUpperCase())}
              placeholder="z.B. B070XYZ1234 oder vor Ort vorgelegt"
              className="w-full px-3 py-2 rounded-xl bg-[#01140e] border border-emerald-500/30 text-white font-mono focus:border-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-emerald-200/80 mb-1 block">
              Führerscheinklasse(n)
            </label>
            <input
              type="text"
              value={drivingLicenseClasses}
              onChange={(e) => setDrivingLicenseClasses(e.target.value)}
              placeholder="z.B. B, BE oder A, B"
              className="w-full px-3 py-2 rounded-xl bg-[#01140e] border border-emerald-500/30 text-white font-mono focus:border-amber-400 outline-none"
            />
          </div>
        </div>

        {/* Driver's License Photo Upload Box */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileUpload}
        />

        {drivingLicensePhoto ? (
          <div className="p-3 rounded-xl bg-[#01140e] border border-emerald-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {drivingLicensePhoto.dataUrl && drivingLicensePhoto.type?.includes('image') ? (
                <img
                  src={drivingLicensePhoto.dataUrl}
                  alt="Führerschein Scan"
                  className="w-16 h-12 rounded-lg object-cover border border-emerald-500/30 shadow-xs"
                />
              ) : (
                <div className="w-16 h-12 rounded-lg bg-[#032318] border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{drivingLicensePhoto.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[10px] text-emerald-200/60 mt-0.5">
                  {drivingLicensePhoto.size || 'Erfasst'} • Foto erfolgreich hinterlegt
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-[#032318] hover:bg-[#053827] text-emerald-300 text-[11px] font-bold border border-emerald-500/30 cursor-pointer transition"
              >
                Ersetzen
              </button>
              <button
                type="button"
                onClick={() => setDrivingLicensePhoto(null)}
                className="p-1.5 rounded-lg bg-[#032318] text-slate-400 hover:text-rose-400 border border-emerald-500/20 cursor-pointer transition"
                title="Foto löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-amber-400 bg-[#01140e]/60 hover:bg-[#032318]/80 cursor-pointer transition text-center space-y-1.5 group"
          >
            <div className="flex items-center justify-center gap-2 text-emerald-400 group-hover:text-amber-300 transition-colors">
              <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xs font-bold text-slate-200 group-hover:text-white">
              Führerschein (Foto oder PDF) hochladen
            </div>
            <div className="text-[10px] text-emerald-200/60">
              Drag & Drop oder Klicken (JPG, PNG, HEIC oder PDF)
            </div>
          </div>
        )}

      </div>

      {/* ======================================================================= */}
      {/* BOTTOM FOOTER: PROBEFAHRT SUMMARY & DOKUMENT ERSTELLEN ACTION           */}
      {/* ======================================================================= */}
      <div className="relative p-4 sm:p-5 rounded-2xl bg-[#021d15]/95 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Probefahrt Summary Badge */}
        <div className="space-y-0.5 text-left w-full sm:w-auto">
          <div className="text-[10px] uppercase font-extrabold text-emerald-300 tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Probefahrtvereinbarung (§ 16 FZV)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-200 font-mono">
            <span>Dauer: <strong className="text-amber-300">{probefahrtDuration} Min.</strong></span>
            <span>•</span>
            <span>Limit: <strong className="text-amber-300">{probefahrtRouteLimit} km</strong></span>
            <span>•</span>
            <span>SB: <strong className="text-amber-300">{probefahrtDeductible.toLocaleString('de-DE')} €</strong></span>
          </div>
        </div>

        {/* Action Buttons - Single Source of Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto relative z-10 justify-end">
          <button
            type="button"
            id="btn-probefahrt-create-and-share"
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 text-xs font-black shadow-[0_0_25px_rgba(245,197,24,0.45)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isSaving ? 'Synchronisiere & erstelle...' : 'Probefahrtvereinbarung erstellen & teilen'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
