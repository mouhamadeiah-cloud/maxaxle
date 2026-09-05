import React from 'react';
import { MerchantSettings } from '../../types';
import {
  Landmark,
  Copy,
  Check,
  Save
} from 'lucide-react';

interface BankSettingsTabProps {
  settings: MerchantSettings;
  setSettings: React.Dispatch<React.SetStateAction<MerchantSettings>>;
  handleSaveGeneralSettings: (e?: React.FormEvent) => void;
  copiedField: string | null;
  handleCopy: (text: string, fieldKey: string) => void;
}

export const BankSettingsTab: React.FC<BankSettingsTabProps> = ({
  settings,
  setSettings,
  handleSaveGeneralSettings,
  copiedField,
  handleCopy
}) => {
  return (
    <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-6">
      <div className="pb-4 border-b border-white/30 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
            <Landmark className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            <span>5. Bankverbindung</span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Geschäftskonto für Rechnungsüberweisungen, EPC-QR-Codes und Kaufpreisabwicklungen.
          </p>
        </div>
        <span className="metallic-pill px-3 py-1 text-xs font-black">
          SEPA Banking
        </span>
      </div>

      <form onSubmit={handleSaveGeneralSettings} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-slate-900 font-black mb-1.5">
              Kontoinhaber / Begünstigter *
            </label>
            <input
              type="text"
              required
              value={settings.accountHolder}
              onChange={(e) => setSettings({ ...settings, accountHolder: e.target.value })}
              placeholder="z.B. MaxFleet Autohandelsgruppe GmbH"
              className="metallic-input w-full p-3 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              Kreditinstitut / Bankname *
            </label>
            <input
              type="text"
              required
              value={settings.bankName}
              onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
              placeholder="z.B. Commerzbank AG Berlin"
              className="metallic-input w-full p-3 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              BIC / SWIFT-Code *
            </label>
            <input
              type="text"
              required
              value={settings.bic}
              onChange={(e) => setSettings({ ...settings, bic: e.target.value.toUpperCase() })}
              placeholder="COBADEFFXXX"
              className="metallic-input w-full p-3 rounded-xl font-mono font-bold text-slate-950"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-900 font-black">
                Internationale Kontonummer (IBAN) *
              </label>
              <button
                type="button"
                onClick={() => handleCopy(settings.iban, 'iban')}
                className="metallic-pill px-3 py-1 text-slate-900 font-bold hover:bg-white/70 flex items-center gap-1.5 cursor-pointer text-[11px] transition shadow-xs"
              >
                {copiedField === 'iban' ? (
                  <>
                    <Check className="w-3.5 h-3.5 metallic-debossed-icon text-emerald-700" />
                    <span className="text-emerald-700 font-black">Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 metallic-debossed-icon text-slate-800" />
                    <span>IBAN kopieren</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              required
              value={settings.iban}
              onChange={(e) => setSettings({ ...settings, iban: e.target.value.toUpperCase() })}
              placeholder="DE89 1004 0000 0123 4567 89"
              className="metallic-input w-full p-3.5 rounded-xl text-slate-950 font-mono font-black text-sm sm:text-base tracking-wider"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/30 flex justify-end">
          <button
            type="submit"
            className="metallic-btn-primary px-5 py-2.5 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4 metallic-debossed-icon" />
            <span>Bankverbindung speichern</span>
          </button>
        </div>
      </form>
    </div>
  );
};
