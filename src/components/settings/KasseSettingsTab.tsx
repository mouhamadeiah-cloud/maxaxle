import React from 'react';
import { MerchantSettings } from '../../types';
import {
  Wallet,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Check,
  Save,
  Info
} from 'lucide-react';

interface KasseSettingsTabProps {
  settings: MerchantSettings;
  kasseInputAmount: number;
  setKasseInputAmount: (val: number) => void;
  kasseInputDate: string;
  setKasseInputDate: (val: string) => void;
  handleRegisterInitialCash: () => void;
  bankInputAmount: number;
  setBankInputAmount: (val: number) => void;
  bankInputDate: string;
  setBankInputDate: (val: string) => void;
  handleRegisterInitialBank: () => void;
}

export const KasseSettingsTab: React.FC<KasseSettingsTabProps> = ({
  settings,
  kasseInputAmount,
  setKasseInputAmount,
  kasseInputDate,
  setKasseInputDate,
  handleRegisterInitialCash,
  bankInputAmount,
  setBankInputAmount,
  bankInputDate,
  setBankInputDate,
  handleRegisterInitialBank
}) => {
  return (
    <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-6">
      <div className="pb-4 border-b border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
            <Wallet className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            <span>6. Anfangskapital (Kasse & Bank)</span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Erfassung der Eröffnungssalden für Bargeldkasse und Geschäftskonto. Das Kassen-Startkapital wird direkt in das Kassenbuch gebucht, das Bank-Startkapital synchronisiert das Geschäftskonto.
          </p>
        </div>
      </div>

      {/* Combined Liquidity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* SECTION A: ANFANGSKAPITAL KASSE */}
        <div className="metallic-inner-subbox p-5 rounded-2xl border border-white/60 space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900/10 text-slate-950 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4 metallic-debossed-icon" />
                </div>
                <div>
                  <div className="font-black text-sm text-slate-950">Anfangskapital Kasse (Bar)</div>
                  <div className="text-[11px] text-slate-700 font-semibold">Kassenlade & Barkassen-Eröffnung</div>
                </div>
              </div>
              <span className={`metallic-pill px-3 py-1 text-[11px] font-bold flex items-center gap-1.5 ${
                settings.initialCashRegistered
                  ? 'text-emerald-800'
                  : 'text-emerald-800'
              }`}>
                {settings.initialCashRegistered ? (
                  <CheckCircle2 className="w-3.5 h-3.5 metallic-debossed-icon text-emerald-700" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 metallic-debossed-icon text-emerald-700" />
                )}
                <span>{settings.initialCashRegistered ? 'Verbucht' : 'Offen'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block text-slate-900 font-black mb-1">
                  Kassenbestand (€) *
                </label>
                <div className="flex items-center metallic-input rounded-xl overflow-hidden shadow-xs">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={kasseInputAmount}
                    onChange={(e) => setKasseInputAmount(parseFloat(e.target.value) || 0)}
                    placeholder="5000.00"
                    className="w-full py-2.5 pl-3.5 pr-2 bg-transparent font-mono text-sm font-black text-slate-950 focus:outline-none"
                  />
                  <div className="px-3.5 py-2.5 bg-white/40 border-l border-white/60 text-slate-900 font-black text-sm select-none shrink-0 flex items-center justify-center">
                    €
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-900 font-black mb-1">
                  Startdatum Kasse *
                </label>
                <input
                  type="date"
                  value={kasseInputDate}
                  onChange={(e) => setKasseInputDate(e.target.value)}
                  className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
              Wird als Eröffnungsbeleg in das Kassenjournal (<code className="font-mono bg-white/60 px-1 py-0.5 rounded text-slate-900 border border-white/70">kasse/transaktionen</code>) übertragen.
            </p>
          </div>

          <div className="pt-3 border-t border-white/30 flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold text-slate-700">
              Aktuell: <span className="text-slate-950 font-black">{(settings.initialCashBalance || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
            </div>
            <button
              type="button"
              onClick={handleRegisterInitialCash}
              className="metallic-btn-primary px-4 py-2 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <Check className="w-3.5 h-3.5 metallic-debossed-icon text-slate-950" />
              <span>Kassenstart verbuchen</span>
            </button>
          </div>
        </div>

        {/* SECTION B: ANFANGSKAPITAL BANK */}
        <div className="metallic-inner-subbox p-5 rounded-2xl border border-white/60 space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900/10 text-slate-950 flex items-center justify-center font-bold">
                  <Landmark className="w-4 h-4 metallic-debossed-icon" />
                </div>
                <div>
                  <div className="font-black text-sm text-slate-950">Anfangskapital Bank (Konto)</div>
                  <div className="text-[11px] text-slate-700 font-semibold">{settings.bankName || 'Geschäftskonto'}</div>
                </div>
              </div>
              <span className={`metallic-pill px-3 py-1 text-[11px] font-bold flex items-center gap-1.5 ${
                settings.initialBankRegistered
                  ? 'text-emerald-800'
                  : 'text-emerald-800'
              }`}>
                {settings.initialBankRegistered ? (
                  <CheckCircle2 className="w-3.5 h-3.5 metallic-debossed-icon text-emerald-700" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 metallic-debossed-icon text-emerald-700" />
                )}
                <span>{settings.initialBankRegistered ? 'Aktiv' : 'Offen'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block text-slate-900 font-black mb-1">
                  Bank-Anfangssaldo (€) *
                </label>
                <div className="flex items-center metallic-input rounded-xl overflow-hidden shadow-xs">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bankInputAmount}
                    onChange={(e) => setBankInputAmount(parseFloat(e.target.value) || 0)}
                    placeholder="145000.00"
                    className="w-full py-2.5 pl-3.5 pr-2 bg-transparent font-mono text-sm font-black text-slate-950 focus:outline-none"
                  />
                  <div className="px-3.5 py-2.5 bg-white/40 border-l border-white/60 text-slate-900 font-black text-sm select-none shrink-0 flex items-center justify-center">
                    €
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-900 font-black mb-1">
                  Startdatum Bank *
                </label>
                <input
                  type="date"
                  value={bankInputDate}
                  onChange={(e) => setBankInputDate(e.target.value)}
                  className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
              Konto: <code className="font-mono bg-white/60 px-1 py-0.5 rounded text-slate-900 border border-white/70">{settings.iban || 'DE89 1004...'}</code> ({settings.bankName || 'Bank'}).
            </p>
          </div>

          <div className="pt-3 border-t border-white/30 flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold text-slate-700">
              Aktuell: <span className="text-slate-950 font-black">{(settings.initialBankBalance || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
            </div>
            <button
              type="button"
              onClick={handleRegisterInitialBank}
              className="metallic-btn-primary px-4 py-2 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5 metallic-debossed-icon text-slate-950" />
              <span>Bank-Startkapital buchen</span>
            </button>
          </div>
        </div>

      </div>

      {/* Audit Trail Note */}
      <div className="metallic-card-luminous p-4 rounded-xl border border-white/60 text-xs text-slate-800 flex items-start gap-3 shadow-xs">
        <Info className="w-4 h-4 metallic-debossed-icon text-slate-800 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-black text-slate-950">Hinweis zu Eröffnungsbilanzen & Anfangsbeständen</div>
          <p className="text-slate-700 font-medium leading-relaxed">
            Sowohl das Anfangskapital der Kasse als auch der Eröffnungssaldo des Geschäftskontos werden für die Finanzübersichten und GoBD-Exporte herangezogen. Alle Aktualisierungen werden unveränderlich in Firebase Firestore unter <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-slate-900 border border-white/80">settings/haendler</code> und <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-slate-900 border border-white/80">kasse/transaktionen</code> protokolliert.
          </p>
        </div>
      </div>
    </div>
  );
};
