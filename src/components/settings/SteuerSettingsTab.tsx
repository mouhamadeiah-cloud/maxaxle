import React from 'react';
import { MerchantSettings } from '../../types';
import {
  Percent,
  Info,
  Check,
  Save
} from 'lucide-react';

interface SteuerSettingsTabProps {
  settings: MerchantSettings;
  setSettings: React.Dispatch<React.SetStateAction<MerchantSettings>>;
  handleSaveGeneralSettings: (e?: React.FormEvent) => void;
}

export const SteuerSettingsTab: React.FC<SteuerSettingsTabProps> = ({
  settings,
  setSettings,
  handleSaveGeneralSettings
}) => {
  return (
    <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-6">
      <div className="pb-4 border-b border-white/30 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
            <Percent className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            <span>4. Steuer & Zoll</span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Steueridentifikationsnummern, Umsatzsteuer-ID und EORI-Registrierung für den Fahrzeughandel und Export.
          </p>
        </div>
        <span className="metallic-pill px-3 py-1 text-xs font-black">
          Finanzamt & Zoll
        </span>
      </div>

      <form onSubmit={handleSaveGeneralSettings} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              Steuernummer *
            </label>
            <input
              type="text"
              required
              value={settings.taxNumber}
              onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
              placeholder="z.B. 27/451/09812"
              className="metallic-input w-full p-3 rounded-xl font-mono font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              Umsatzsteuer-Identifikationsnummer (USt-IdNr.) *
            </label>
            <input
              type="text"
              required
              value={settings.vatId}
              onChange={(e) => setSettings({ ...settings, vatId: e.target.value })}
              placeholder="z.B. DE 319 824 550"
              className="metallic-input w-full p-3 rounded-xl font-mono font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5 flex items-center justify-between">
              <span>EORI-Nummer (Zoll & Export) *</span>
              <span className="text-slate-600 font-semibold">Economic Operators Registration</span>
            </label>
            <input
              type="text"
              required
              value={settings.eoriNumber}
              onChange={(e) => setSettings({ ...settings, eoriNumber: e.target.value })}
              placeholder="z.B. DE8941205"
              className="metallic-input w-full p-3 rounded-xl font-mono font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              Zuständiges Finanzamt
            </label>
            <input
              type="text"
              value={settings.taxOffice || ''}
              onChange={(e) => setSettings({ ...settings, taxOffice: e.target.value })}
              placeholder="z.B. Finanzamt Charlottenburg"
              className="metallic-input w-full p-3 rounded-xl font-bold text-slate-950"
            />
          </div>

          {/* FLEXIBLER MEHRWERTSTEUERSATZ (MWST. / VAT PERCENTAGE) */}
          <div className="sm:col-span-2 metallic-inner-subbox p-5 rounded-2xl border border-white/60 space-y-3.5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 metallic-debossed-icon text-slate-900" />
                  <span className="font-black text-xs text-slate-950">
                    Mehrwertsteuersatz (MwSt. / USt. in %) *
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 font-semibold mt-0.5">
                  Flexibler Standardsteuersatz für Rechnungen, Angebote und Kaufverträge (anpassbar bei Gesetzesänderungen oder EU-Betrieb).
                </p>
              </div>
              <span className="metallic-pill px-3 py-1 text-xs font-mono font-bold shrink-0 self-start sm:self-auto text-slate-950">
                Aktuell: {settings.vatRate ?? 19.0} %
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-center">
              <div className="sm:col-span-4">
                <label className="block text-slate-800 text-[11px] font-black mb-1">
                  Prozentsatz eingeben:
                </label>
                <div className="flex items-center metallic-input rounded-xl overflow-hidden shadow-xs">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={settings.vatRate ?? 19}
                    onChange={(e) => setSettings({ ...settings, vatRate: parseFloat(e.target.value) || 0 })}
                    placeholder="19.0"
                    className="w-full py-2.5 pl-3.5 pr-2 bg-transparent font-mono text-sm font-black text-slate-950 focus:outline-none"
                  />
                  <div className="px-3.5 py-2.5 bg-white/40 border-l border-white/60 text-slate-900 font-black text-sm select-none shrink-0 flex items-center justify-center">
                    %
                  </div>
                </div>
              </div>

              {/* Schnellwahl-Buttons für europäische Steuersätze */}
              <div className="sm:col-span-8 space-y-1">
                <label className="block text-slate-800 text-[11px] font-black">
                  Schnellauswahl:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, vatRate: 19 })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      (settings.vatRate ?? 19) === 19
                        ? 'metallic-btn-primary text-slate-950 shadow-xs'
                        : 'metallic-btn-secondary text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    19% (DE Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, vatRate: 20 })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      settings.vatRate === 20
                        ? 'metallic-btn-primary text-slate-950 shadow-xs'
                        : 'metallic-btn-secondary text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    20% (Österreich / FR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, vatRate: 21 })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      settings.vatRate === 21
                        ? 'metallic-btn-primary text-slate-950 shadow-xs'
                        : 'metallic-btn-secondary text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    21% (Niederlande / ES)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, vatRate: 8.1 })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      settings.vatRate === 8.1
                        ? 'metallic-btn-primary text-slate-950 shadow-xs'
                        : 'metallic-btn-secondary text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    8.1% (Schweiz)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, vatRate: 7 })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      settings.vatRate === 7
                        ? 'metallic-btn-primary text-slate-950 shadow-xs'
                        : 'metallic-btn-secondary text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    7% (Ermäßigt DE)
                  </button>
                </div>
              </div>
            </div>

            {/* Live-Berechnungsbeispiel */}
            <div className="p-3.5 metallic-card-luminous rounded-xl border border-white/60 text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
              <div className="font-bold text-slate-950 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 metallic-debossed-icon text-slate-800" />
                <span>Live-Berechnung (z.B. bei 25.000,00 € Brutto):</span>
              </div>
              <div className="font-mono font-bold text-xs flex flex-wrap items-center gap-3">
                <span className="text-slate-700">Netto: <span className="text-slate-950 font-black">{(25000 / (1 + (settings.vatRate ?? 19) / 100)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span></span>
                <span className="text-slate-900">+ MwSt. ({settings.vatRate ?? 19}%): <span className="font-black text-slate-950">{(25000 - (25000 / (1 + (settings.vatRate ?? 19) / 100))).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span></span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-900 font-black mb-1.5">
              Standard-Besteuerungsart bei Fahrzeugneuanlage
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, defaultTaxation: 'diff_25a' })}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                  settings.defaultTaxation === 'diff_25a'
                    ? 'metallic-btn-primary text-slate-950 shadow-md font-bold'
                    : 'metallic-inner-subbox border-white/60 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div>
                  <div className="font-black">§ 25a Differenzbesteuerung</div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">Gebrauchtwagen / B2C-Regel</div>
                </div>
                {settings.defaultTaxation === 'diff_25a' && <Check className="w-4 h-4 metallic-debossed-icon text-slate-950" />}
              </button>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, defaultTaxation: 'standard_19' })}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                  settings.defaultTaxation === 'standard_19'
                    ? 'metallic-btn-primary text-slate-950 shadow-md font-bold'
                    : 'metallic-inner-subbox border-white/60 text-slate-800 hover:text-slate-950'
                }`}
              >
                <div>
                  <div className="font-black">{settings.vatRate ?? 19}% Regelbesteuerung</div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">MwSt. voll ausweisbar / B2B</div>
                </div>
                {settings.defaultTaxation === 'standard_19' && <Check className="w-4 h-4 metallic-debossed-icon text-slate-950" />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/30 flex justify-end">
          <button
            type="submit"
            className="metallic-btn-primary px-5 py-2.5 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4 metallic-debossed-icon" />
            <span>Steuerdaten speichern</span>
          </button>
        </div>
      </form>
    </div>
  );
};
