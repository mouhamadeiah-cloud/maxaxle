import React from 'react';
import { MerchantSettings } from '../../types';
import {
  MapPin,
  ShieldCheck,
  Info,
  Save
} from 'lucide-react';

interface AdresseSettingsTabProps {
  settings: MerchantSettings;
  setSettings: React.Dispatch<React.SetStateAction<MerchantSettings>>;
  handleSaveGeneralSettings: (e?: React.FormEvent) => void;
}

export const AdresseSettingsTab: React.FC<AdresseSettingsTabProps> = ({
  settings,
  setSettings,
  handleSaveGeneralSettings
}) => {
  return (
    <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-6">
      <div className="pb-4 border-b border-white/30 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
            <MapPin className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            <span>2. Firmenadresse (Haupt-Rechnungsadresse)</span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Diese Anschrift ist fest verankert und erscheint auf allen Rechnungen, Verträgen und Übergabeprotokollen.
          </p>
        </div>
        <span className="metallic-pill px-3 py-1 text-xs font-black text-emerald-800 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 metallic-debossed-icon text-emerald-700" />
          <span>Hauptsitz</span>
        </span>
      </div>

      {/* Informational Callout */}
      <div className="metallic-inner-subbox rounded-2xl p-4 border border-white/60 flex items-start gap-3 text-xs text-slate-900 shadow-sm">
        <Info className="w-5 h-5 metallic-debossed-icon text-slate-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-black text-slate-950">Rechtlicher Hinweis zur Rechnungsanschrift:</span>
          <p className="mt-0.5 text-slate-700 font-medium leading-relaxed">
            Die hier hinterlegte Adresse gilt als unveränderliche Hauptanschrift Ihres Händlerbetriebs. Weitere Verkaufsplätze, Showrooms oder Werkstätten können unter Punkt 7 („Zusätzliche Standorte“) hinterlegt werden.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveGeneralSettings} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-slate-900 font-black mb-1.5">
              Straße und Hausnummer *
            </label>
            <input
              type="text"
              required
              value={settings.street}
              onChange={(e) => setSettings({ ...settings, street: e.target.value })}
              placeholder="z.B. Kurfürstendamm 210"
              className="metallic-input w-full p-3 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              Postleitzahl (PLZ) *
            </label>
            <input
              type="text"
              required
              value={settings.postalCode}
              onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
              placeholder="10719"
              className="metallic-input w-full p-3 rounded-xl font-mono font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              Stadt / Ort *
            </label>
            <input
              type="text"
              required
              value={settings.city}
              onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              placeholder="Berlin"
              className="metallic-input w-full p-3 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-900 font-black mb-1.5">
              Land
            </label>
            <input
              type="text"
              value={settings.country}
              onChange={(e) => setSettings({ ...settings, country: e.target.value })}
              placeholder="Deutschland"
              className="metallic-input w-full p-3 rounded-xl font-bold text-slate-950"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/30 flex justify-end">
          <button
            type="submit"
            className="metallic-btn-primary px-5 py-2.5 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4 metallic-debossed-icon" />
            <span>Adresse speichern</span>
          </button>
        </div>
      </form>
    </div>
  );
};
