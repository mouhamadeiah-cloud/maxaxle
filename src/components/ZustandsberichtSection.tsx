import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Wrench, 
  Eye, 
  Sparkles, 
  FileText, 
  ShieldAlert, 
  Tag, 
  SlidersHorizontal,
  DollarSign,
  Info,
  Car
} from 'lucide-react';
import { VehicleDamageEntry } from '../types';
import { VehicleCombobox } from './VehicleCombobox';
import { 
  DAMAGE_PARTS_OPTIONS, 
  DAMAGE_TYPE_OPTIONS, 
  DAMAGE_SEVERITY_OPTIONS 
} from '../data/vehiclePresets';

interface ZustandsberichtSectionProps {
  damages: VehicleDamageEntry[];
  onChangeDamages: (damages: VehicleDamageEntry[]) => void;
  damagesNotes?: string;
  onChangeDamagesNotes?: (notes: string) => void;
  paintThicknessUm?: number;
  onChangePaintThicknessUm?: (thickness: number) => void;
  accidentFree?: boolean;
  onChangeAccidentFree?: (accidentFree: boolean) => void;
}

export const ZustandsberichtSection: React.FC<ZustandsberichtSectionProps> = ({
  damages = [],
  onChangeDamages,
  damagesNotes = '',
  onChangeDamagesNotes,
  paintThicknessUm,
  onChangePaintThicknessUm,
  accidentFree = true,
  onChangeAccidentFree
}) => {
  // New damage entry form state (3 Cascading Comboboxes + optional notes & cost)
  const [partInput, setPartInput] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [severityInput, setSeverityInput] = useState('Leicht');
  const [descInput, setDescInput] = useState('');
  const [costInput, setCostInput] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  // Quick Preset Add Handler
  const handleQuickAdd = (part: string, type: string, severity: string, cost?: number) => {
    const newEntry: VehicleDamageEntry = {
      id: 'dmg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      part,
      damageType: type,
      severity,
      description: '',
      estimatedCost: cost || 0,
      repaired: false
    };
    onChangeDamages([...damages, newEntry]);
  };

  // Add damage handler
  const handleAddDamageEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partInput.trim()) {
      setFormError('Bitte wählen oder tippen Sie das betroffene Bauteil ein.');
      return;
    }
    if (!typeInput.trim()) {
      setFormError('Bitte wählen oder tippen Sie die Schadensart ein.');
      return;
    }

    setFormError('');

    const newEntry: VehicleDamageEntry = {
      id: 'dmg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      part: partInput.trim(),
      damageType: typeInput.trim(),
      severity: severityInput || 'Leicht',
      description: descInput.trim() || undefined,
      estimatedCost: typeof costInput === 'number' ? costInput : 0,
      repaired: false
    };

    onChangeDamages([...damages, newEntry]);

    // Reset inputs
    setPartInput('');
    setTypeInput('');
    setSeverityInput('Leicht');
    setDescInput('');
    setCostInput('');
  };

  // Remove damage handler
  const handleRemoveDamage = (id: string) => {
    onChangeDamages(damages.filter((d) => d.id !== id));
  };

  // Toggle repaired status
  const handleToggleRepaired = (id: string) => {
    onChangeDamages(
      damages.map((d) => (d.id === id ? { ...d, repaired: !d.repaired } : d))
    );
  };

  // Summary tallies
  const totalCost = damages.reduce((sum, d) => sum + (d.estimatedCost || 0), 0);
  const leichtCount = damages.filter((d) => (d.severity || '').toLowerCase().includes('leicht') || (d.severity || '').toLowerCase().includes('bagatelle')).length;
  const mittelCount = damages.filter((d) => (d.severity || '').toLowerCase().includes('mittel')).length;
  const schwerCount = damages.filter((d) => (d.severity || '').toLowerCase().includes('schwer')).length;

  return (
    <div className="space-y-6">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. Header & General Condition Badges                          */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 metallic-card rounded-2xl border border-white/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg metallic-node text-emerald-800 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Strukturierter Zustands- & Schadensbericht
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                Optische und technische Mängel mit Bauteil, Schadensart und Schweregrad erfassen
              </p>
            </div>
          </div>

          {/* Unfallfreiheit Selector Switch */}
          {onChangeAccidentFree && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-700 hidden md:inline">Status:</span>
              <div className="flex items-center p-1 metallic-card rounded-xl border border-white/40 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onChangeAccidentFree(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    accidentFree
                      ? 'metallic-btn-primary text-slate-950 shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Unfallfrei</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeAccidentFree(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    !accidentFree
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Vorschaden bekannt</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tally Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-300/50 text-xs">
          <div className="p-2.5 metallic-card rounded-xl border border-white/40 flex items-center justify-between">
            <span className="text-slate-700 font-bold">Erfasste Mängel:</span>
            <span className="font-extrabold font-mono text-slate-950 metallic-node px-2 py-0.5 rounded-md">
              {damages.length}
            </span>
          </div>

          <div className="p-2.5 metallic-card rounded-xl border border-white/40 flex items-center justify-between">
            <span className="text-slate-700 font-bold">Leicht / Optisch:</span>
            <span className="font-extrabold font-mono text-emerald-900 bg-emerald-200/60 px-2 py-0.5 rounded-md border border-emerald-400/50">
              {leichtCount}
            </span>
          </div>

          <div className="p-2.5 metallic-card rounded-xl border border-white/40 flex items-center justify-between">
            <span className="text-slate-700 font-bold">Mittel / Schwer:</span>
            <span className={`font-extrabold font-mono px-2 py-0.5 rounded-md border ${
              mittelCount + schwerCount > 0 
                ? 'text-rose-900 bg-rose-200/60 border-rose-400/50' 
                : 'text-slate-700 metallic-node border-white/40'
            }`}>
              {mittelCount + schwerCount}
            </span>
          </div>

          <div className="p-2.5 metallic-card rounded-xl border border-white/40 flex items-center justify-between">
            <span className="text-slate-700 font-bold">Reparaturkosten:</span>
            <span className="font-extrabold font-mono text-blue-900">
              {totalCost > 0 ? `${totalCost.toLocaleString('de-DE')} €` : '0 €'}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Three Cascading Dropdowns Input Card                       */}
      {/* ------------------------------------------------------------- */}
      <div className="p-5 metallic-card rounded-2xl border border-white/40 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
            Neuen Schaden / Mangel erfassen
          </h5>
          <span className="text-[11px] text-slate-600 font-medium hidden sm:inline">
            Vorauswahl oder eigene Eingabe
          </span>
        </div>

        {formError && (
          <div className="p-3 bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Dropdown Bauteil */}
          <VehicleCombobox
            id="combobox-damage-part"
            label="Bauteil / Komponente"
            value={partInput}
            onChange={setPartInput}
            options={DAMAGE_PARTS_OPTIONS}
            placeholder="z.B. Stoßstange vorne, Tür..."
            emptyStateText="Kein vordefiniertes Bauteil gefunden. Eigene Eingabe wird direkt übernommen."
            allowCustom={true}
          />

          {/* Dropdown Schadensart */}
          <VehicleCombobox
            id="combobox-damage-type"
            label="Art des Schadens"
            value={typeInput}
            onChange={setTypeInput}
            options={DAMAGE_TYPE_OPTIONS}
            placeholder="z.B. Delle, Kratzer, Lackschaden..."
            emptyStateText="Keine Standard-Schadensart gefunden. Eigene Eingabe wird direkt übernommen."
            allowCustom={true}
          />

          {/* Dropdown Schweregrad */}
          <VehicleCombobox
            id="combobox-damage-severity"
            label="Schweregrad"
            value={severityInput}
            onChange={setSeverityInput}
            options={DAMAGE_SEVERITY_OPTIONS}
            placeholder="z.B. Leicht, Mittel, Schwer"
            allowCustom={true}
          />
        </div>

        {/* Additional Detail Row (Description & Estimated Cost) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-800 text-xs mb-1.5">
              Detailbeschreibung / Lokalisierung (Optional)
            </label>
            <input
              type="text"
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="z.B. ca. 3cm oberhalb des Türgriffs, nicht bis zur Grundierung"
              className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 text-xs mb-1.5">
              Geschätzte Reparaturkosten (€)
            </label>
            <div className="relative">
              <input
                type="number"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
                className="w-full pl-3.5 pr-8 py-2.5 metallic-input rounded-xl text-xs sm:text-sm font-bold text-slate-900"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-500 font-bold text-xs">€</span>
            </div>
          </div>
        </div>

        {/* Action Button & Quick Presets */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600">Schnellauswahl:</span>
            <button
              type="button"
              onClick={() => handleQuickAdd('Stoßstange vorne', 'Lackschaden / Steinschlag', 'Leicht', 120)}
              className="px-2.5 py-1 metallic-card hover:bg-white/60 text-slate-800 rounded-lg text-[11px] font-bold border border-white/40 shadow-2xs transition cursor-pointer"
            >
              + Steinschlag Front
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd('Alufelge vorne rechts', 'Bordsteinschaden / Felgenkratzer', 'Leicht', 90)}
              className="px-2.5 py-1 metallic-card hover:bg-white/60 text-slate-800 rounded-lg text-[11px] font-bold border border-white/40 shadow-2xs transition cursor-pointer"
            >
              + Bordsteinkratzer
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd('Tür hinten links', 'Delle / Beule', 'Mittel', 150)}
              className="px-2.5 py-1 metallic-card hover:bg-white/60 text-slate-800 rounded-lg text-[11px] font-bold border border-white/40 shadow-2xs transition cursor-pointer"
            >
              + Delle Tür
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddDamageEntry}
            className="w-full sm:w-auto px-5 py-2.5 metallic-btn-primary text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Mangel zur Liste hinzufügen</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Recorded Damages Table / List View                         */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
            <span>Erfasste Mängel & Schadensprotokoll</span>
            <span className="px-2 py-0.5 rounded-full metallic-node text-slate-900 text-xs font-bold border border-white/40">
              {damages.length}
            </span>
          </h5>
          {damages.length > 0 && (
            <button
              type="button"
              onClick={() => onChangeDamages([])}
              className="text-[11px] font-bold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer"
            >
              Alle Mängel entfernen
            </button>
          )}
        </div>

        {damages.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-400/40 rounded-2xl text-center space-y-2 metallic-card">
            <div className="w-10 h-10 rounded-full metallic-node text-emerald-800 mx-auto flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-extrabold text-slate-800">
              Keine Schäden oder Mängel protokolliert
            </p>
            <p className="text-[11px] text-slate-600 font-medium max-w-md mx-auto">
              Nutzen Sie die oberen Dropdowns, um Karosserieschäden, Dellen, Lackschäden oder technische Mängel strukturiert zu erfassen.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {damages.map((dmg, idx) => {
              const sev = (dmg.severity || '').toLowerCase();
              let sevColor = 'bg-emerald-100/70 text-emerald-900 border-emerald-300';
              if (sev.includes('schwer')) {
                sevColor = 'bg-rose-100/70 text-rose-900 border-rose-300';
              } else if (sev.includes('mittel')) {
                sevColor = 'bg-orange-100/70 text-orange-900 border-orange-300';
              }

              return (
                <div
                  key={dmg.id || idx}
                  className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    dmg.repaired
                      ? 'bg-emerald-100/40 border-emerald-300 opacity-80'
                      : 'metallic-card border-white/40 hover:border-white/60 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg metallic-node text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Part */}
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {dmg.part}
                        </span>

                        {/* Damage Type */}
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold metallic-node text-slate-900 border border-white/40">
                          {dmg.damageType}
                        </span>

                        {/* Severity */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${sevColor}`}>
                          {dmg.severity}
                        </span>

                        {/* Repaired badge */}
                        {dmg.repaired && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-700 text-white flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Behoben / Aufbereitet</span>
                          </span>
                        )}
                      </div>

                      {/* Optional description */}
                      {dmg.description && (
                        <p className="text-xs text-slate-700 font-medium">
                          {dmg.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Cost */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-300/40 shrink-0">
                    {dmg.estimatedCost ? (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold block">Kosten:</span>
                        <span className="font-extrabold font-mono text-slate-950 text-xs sm:text-sm">
                          {dmg.estimatedCost.toLocaleString('de-DE')} €
                        </span>
                      </div>
                    ) : null}

                    {/* Toggle Repaired button */}
                    <button
                      type="button"
                      onClick={() => handleToggleRepaired(dmg.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                        dmg.repaired
                          ? 'bg-emerald-200/80 text-emerald-950 border-emerald-400'
                          : 'metallic-card hover:bg-white/60 text-slate-800 border-white/40'
                      }`}
                      title={dmg.repaired ? 'Als offen markieren' : 'Als behoben markieren'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">{dmg.repaired ? 'Behoben' : 'Erledigt?'}</span>
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveDamage(dmg.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-100/50 transition cursor-pointer"
                      title="Schadenseintrag löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. General Notes & Paint Thickness Section                   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-300/50 text-xs sm:text-sm">
        {onChangeDamagesNotes && (
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-800 mb-1.5">
              Gesamtzusammenfassung / Vorschäden & Anmerkungen
            </label>
            <input
              type="text"
              value={damagesNotes}
              onChange={(e) => onChangeDamagesNotes(e.target.value)}
              placeholder="z.B. Nachlackierung Kotflügel VR nach Parkrempler fachmännisch instandgesetzt"
              className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-medium"
            />
          </div>
        )}

        {onChangePaintThicknessUm && (
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Lackschichtdicke (Ø µm)
            </label>
            <div className="relative">
              <input
                type="number"
                value={paintThicknessUm || ''}
                onChange={(e) => onChangePaintThicknessUm(Number(e.target.value))}
                placeholder="115"
                className="w-full pl-3.5 pr-10 py-2.5 metallic-input rounded-xl text-slate-900 font-extrabold"
              />
              <span className="absolute right-3 top-3 text-slate-500 font-extrabold text-xs">µm</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
