import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Key, 
  Clock, 
  Route, 
  ShieldAlert, 
  Gauge, 
  Fuel, 
  Coins, 
  FileText,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { MerchantSettings, TextTemplate } from '../../types';
import { DocumentTextController } from '../../controllers/DocumentTextController';

export type ProbefahrtEditFieldType = 
  | 'plate' 
  | 'duration' 
  | 'route' 
  | 'mileage' 
  | 'fuel' 
  | 'deposit' 
  | 'deductible' 
  | 'liability';

interface ProbefahrtQuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: ProbefahrtEditFieldType | null;
  merchantSettings: MerchantSettings;
  currentPlate: string;
  currentDuration: number;
  currentStartTime: string;
  currentRouteLimit: number;
  currentMileage: number;
  currentFuelLevel: string;
  currentDeposit: number;
  currentDeductible: number;
  currentCustomLiabilityText?: string;
  onSave: (updates: {
    plate?: string;
    duration?: number;
    startTime?: string;
    routeLimit?: number;
    mileage?: number;
    fuelLevel?: string;
    deposit?: number;
    deductible?: number;
    customLiabilityText?: string;
  }) => void;
}

export const ProbefahrtQuickEditModal: React.FC<ProbefahrtQuickEditModalProps> = ({
  isOpen,
  onClose,
  field,
  merchantSettings,
  currentPlate,
  currentDuration,
  currentStartTime,
  currentRouteLimit,
  currentMileage,
  currentFuelLevel,
  currentDeposit,
  currentDeductible,
  currentCustomLiabilityText = '',
  onSave
}) => {
  const [plate, setPlate] = useState(currentPlate);
  const [duration, setDuration] = useState(currentDuration);
  const [startTime, setStartTime] = useState(currentStartTime || '10:00');
  const [routeLimit, setRouteLimit] = useState(currentRouteLimit);
  const [mileage, setMileage] = useState(currentMileage);
  const [fuelLevel, setFuelLevel] = useState(currentFuelLevel);
  const [deposit, setDeposit] = useState(currentDeposit);
  const [deductible, setDeductible] = useState(currentDeductible);
  const [customLiabilityText, setCustomLiabilityText] = useState(currentCustomLiabilityText);

  // Synchronize when opened
  useEffect(() => {
    if (isOpen) {
      setPlate(currentPlate);
      setDuration(currentDuration);
      setStartTime(currentStartTime || '10:00');
      setRouteLimit(currentRouteLimit);
      setMileage(currentMileage);
      setFuelLevel(currentFuelLevel || '75% (3/4 Voll)');
      setDeposit(currentDeposit || 0);
      setDeductible(currentDeductible || 1000);
      setCustomLiabilityText(currentCustomLiabilityText || '');
    }
  }, [isOpen, field, currentPlate, currentDuration, currentStartTime, currentRouteLimit, currentMileage, currentFuelLevel, currentDeposit, currentDeductible, currentCustomLiabilityText]);

  if (!isOpen || !field) return null;

  // Text templates from settings
  const warrantyTemplates: TextTemplate[] = DocumentTextController.getTemplatesByCategory('warranty');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      plate,
      duration,
      startTime,
      routeLimit,
      mileage,
      fuelLevel,
      deposit,
      deductible,
      customLiabilityText
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 select-none print:hidden">
      <div className="w-full max-w-lg metallic-modal-container rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-in zoom-in-95 duration-200 border border-slate-600/60 my-0 sm:my-1">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl metallic-node flex items-center justify-center">
              {field === 'plate' && <Key className="w-5 h-5 metallic-debossed-icon" />}
              {field === 'duration' && <Clock className="w-5 h-5 metallic-debossed-icon" />}
              {field === 'route' && <Route className="w-5 h-5 metallic-debossed-icon" />}
              {field === 'mileage' && <Gauge className="w-5 h-5 metallic-debossed-icon" />}
              {field === 'fuel' && <Fuel className="w-5 h-5 metallic-debossed-icon" />}
              {field === 'deposit' && <Coins className="w-5 h-5 metallic-debossed-icon" />}
              {field === 'deductible' && <ShieldAlert className="w-5 h-5 metallic-debossed-icon" />}
              {field === 'liability' && <FileText className="w-5 h-5 metallic-debossed-icon" />}
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-100">
                {field === 'plate' && 'Rotes Händler-Kennzeichen auswählen'}
                {field === 'duration' && 'Probefahrt-Dauer & Abfahrtszeit'}
                {field === 'route' && 'Erlaubte Kilometer (Fahrtstrecke)'}
                {field === 'mileage' && 'Start-Kilometerstand anpassen'}
                {field === 'fuel' && 'Tankfüllung bei Abfahrt festlegen'}
                {field === 'deposit' && 'Hinterlegte Sicherheitskaution'}
                {field === 'deductible' && 'Kasko-Selbstbeteiligung (SB)'}
                {field === 'liability' && 'Haftungsvereinbarung & Nutzungsregeln'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Schnellanpassung für das aktive Probefahrt-Dokument
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4 metallic-debossed-icon" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">

          {/* 1. Rotes Kennzeichen */}
          {field === 'plate' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Rote Kennzeichennummer (§ 16 FZV):
              </label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="z. B. B-06124"
                className="metallic-input w-full px-4 py-2.5 font-mono font-black text-base text-emerald-300 focus:outline-none uppercase tracking-widest text-center"
              />

              {/* Pre-stored Plates from Merchant Settings */}
              {merchantSettings.redLicensePlates && merchantSettings.redLicensePlates.length > 0 ? (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    Gespeicherte Rote Nummern aus Einstellungen:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {merchantSettings.redLicensePlates.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPlate(p.plateNumber)}
                        className={`px-3 py-2 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                          plate === p.plateNumber
                            ? 'metallic-btn-primary font-black scale-105'
                            : 'metallic-btn-secondary text-slate-300'
                        }`}
                      >
                        {p.plateNumber} <span className="opacity-75 font-sans font-normal">({p.internalName || `Schild ${idx + 1}`})</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 metallic-card p-2.5 rounded-xl">
                  Tipp: Sie können feste Rote Kennzeichen dauerhaft in den Einstellungen hinterlegen.
                </div>
              )}
            </div>
          )}

          {/* 2. Kilometerstand */}
          {field === 'mileage' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Aktueller Tachostand bei Übergabe (km):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="999999"
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value) || 0)}
                  className="metallic-input w-full pl-4 pr-12 py-2.5 font-mono font-black text-base text-emerald-300 focus:outline-none text-center"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">km</span>
              </div>
              <div className="flex gap-2">
                {[10, 50, 100, 500].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setMileage((prev) => prev + inc)}
                    className="metallic-btn-secondary flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    +{inc} km
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Erlaubte Kilometer */}
          {field === 'route' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Maximal erlaubte Fahrtstrecke (in km):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="1000"
                  step="5"
                  value={routeLimit}
                  onChange={(e) => setRouteLimit(Number(e.target.value) || 50)}
                  className="metallic-input w-full pl-4 pr-12 py-2.5 font-mono font-black text-base text-emerald-300 focus:outline-none text-center"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">km</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[25, 50, 75, 100, 150].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setRouteLimit(km)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      routeLimit === km
                        ? 'metallic-btn-primary font-black'
                        : 'metallic-btn-secondary text-slate-300'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Tankfüllung */}
          {field === 'fuel' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Füllstand Kraftstoff / Batterie:
              </label>
              <input
                type="text"
                value={fuelLevel}
                onChange={(e) => setFuelLevel(e.target.value)}
                placeholder="z.B. 75% (3/4 Voll)"
                className="metallic-input w-full px-4 py-2.5 font-bold text-sm text-emerald-300 focus:outline-none text-center"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  '100% (Voll)',
                  '75% (3/4)',
                  '50% (1/2)',
                  '25% (1/4)',
                  'Reserve',
                  '100% (Geladen)'
                ].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFuelLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      fuelLevel === lvl
                        ? 'metallic-btn-primary'
                        : 'metallic-btn-secondary text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Hinterlegte Kaution */}
          {field === 'deposit' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Hinterlegte Sicherheitsleistung / Kaution (€):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="50"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value) || 0)}
                  className="metallic-input w-full pl-4 pr-12 py-2.5 font-mono font-black text-base text-emerald-300 focus:outline-none text-center"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-emerald-400">€</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDeposit(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      deposit === amt
                        ? 'metallic-btn-primary font-black'
                        : 'metallic-btn-secondary text-slate-300'
                    }`}
                  >
                    {amt === 0 ? 'Keine' : `${amt} €`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. Dauer der Probefahrt */}
          {field === 'duration' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Startzeit (Uhrzeit):
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="metallic-input w-full px-3 py-2 font-mono font-bold text-sm text-white focus:outline-none text-center cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Dauer (Minuten):
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="360"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value) || 30)}
                    className="metallic-input w-full px-3 py-2 font-mono font-black text-sm text-emerald-300 focus:outline-none text-center"
                  />
                </div>
              </div>

              <label className="block text-[11px] font-bold text-slate-400">
                Schnellauswahl Dauer:
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {[15, 30, 45, 60, 90, 120].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      duration === d
                        ? 'metallic-btn-primary font-black'
                        : 'metallic-btn-secondary text-slate-300'
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 7. Kasko-Selbstbeteiligung */}
          {field === 'deductible' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Kasko-Selbstbeteiligung im Schadensfall (€):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="100"
                  value={deductible}
                  onChange={(e) => setDeductible(Number(e.target.value) || 0)}
                  className="metallic-input w-full pl-4 pr-12 py-2.5 font-mono font-black text-base text-emerald-300 focus:outline-none text-center"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-emerald-400">€</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 500, 1000, 1500, 2500].map((sb) => (
                  <button
                    key={sb}
                    type="button"
                    onClick={() => setDeductible(sb)}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      deductible === sb
                        ? 'metallic-btn-primary font-black'
                        : 'metallic-btn-secondary text-slate-300'
                    }`}
                  >
                    {sb === 0 ? '0 €' : `${sb.toLocaleString('de-DE')} €`}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* 8. Haftungsvereinbarung & Nutzungsregeln */}
          {field === 'liability' && (
            <div className="space-y-3.5">
              {/* Quick Template Selector */}
              {warrantyTemplates.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gespeicherte Klauseln / Vorlagen aus Einstellungen:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {warrantyTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setCustomLiabilityText(tpl.content);
                        }}
                        className="metallic-btn-secondary px-3 py-1.5 rounded-xl text-[11px] text-slate-200 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{tpl.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Deductible Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kasko-Selbstbeteiligung (€):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 1500, 2500].map((sb) => (
                    <button
                      key={sb}
                      type="button"
                      onClick={() => setDeductible(sb)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        deductible === sb
                          ? 'metallic-btn-primary font-black'
                          : 'metallic-btn-secondary text-slate-300'
                      }`}
                    >
                      {sb} €
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom / Addendum Text */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Zusätzliche Haftungs- oder Nutzungsvereinbarungen:
                  </label>
                  {customLiabilityText && (
                    <button
                      type="button"
                      onClick={() => setCustomLiabilityText('')}
                      className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Auf Standard zurücksetzen</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={customLiabilityText}
                  onChange={(e) => setCustomLiabilityText(e.target.value)}
                  placeholder="Standard-Haftungsregeln werden automatisch gedruckt. Geben Sie hier bei Bedarf individuelle Sonderklauseln oder Einschränkungen (z.B. Autobahnverbot, Begleitperson) ein..."
                  className="metallic-input w-full p-3 text-xs text-slate-200 focus:outline-none font-sans leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="metallic-btn-secondary px-4 py-2 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="metallic-btn-primary px-5 py-2 font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 metallic-debossed-icon" />
              <span>Übernehmen</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
