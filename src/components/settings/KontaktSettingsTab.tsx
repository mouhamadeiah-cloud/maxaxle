import React from 'react';
import { MerchantSettings } from '../../types';
import {
  Phone,
  Mail,
  Globe,
  Save
} from 'lucide-react';

interface KontaktSettingsTabProps {
  settings: MerchantSettings;
  setSettings: React.Dispatch<React.SetStateAction<MerchantSettings>>;
  handleSaveGeneralSettings: (e?: React.FormEvent) => void;
}

export const KontaktSettingsTab: React.FC<KontaktSettingsTabProps> = ({
  settings,
  setSettings,
  handleSaveGeneralSettings
}) => {
  return (
    <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-6">
      <div className="pb-4 border-b border-white/30 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
            <Phone className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            <span>3. Kontaktdaten</span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Telefonnummern, E-Mail-Adresse und Online-Auftritt für Kundenkommunikation und Rechnungs-Header.
          </p>
        </div>
        <span className="metallic-pill px-3 py-1 text-xs font-black">
          Kommunikation
        </span>
      </div>

      <form onSubmit={handleSaveGeneralSettings} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-900 font-black mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 metallic-debossed-icon text-slate-700" />
              <span>Telefonzentrale *</span>
            </label>
            <input
              type="text"
              required
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+49 30 8920100"
              className="metallic-input w-full p-3 rounded-xl font-mono font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 metallic-debossed-icon text-slate-700" />
              <span>Mobiltelefon / Verkaufsleitung</span>
            </label>
            <input
              type="text"
              value={settings.mobile || ''}
              onChange={(e) => setSettings({ ...settings, mobile: e.target.value })}
              placeholder="+49 171 4509122"
              className="metallic-input w-full p-3 rounded-xl font-mono font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 metallic-debossed-icon text-slate-700" />
              <span>Offizielle E-Mail-Adresse *</span>
            </label>
            <input
              type="email"
              required
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="info@maxfleet-gruppe.de"
              className="metallic-input w-full p-3 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 metallic-debossed-icon text-slate-700" />
              <span>Website / Web-Präsenz</span>
            </label>
            <input
              type="url"
              value={settings.website || ''}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              placeholder="https://www.maxfleet-gruppe.de"
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
            <span>Kontaktdaten speichern</span>
          </button>
        </div>
      </form>
    </div>
  );
};
