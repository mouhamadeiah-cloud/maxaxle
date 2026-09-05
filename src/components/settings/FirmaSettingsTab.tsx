import React from 'react';
import { MerchantSettings } from '../../types';
import {
  Building2,
  ImageIcon,
  CheckCircle2,
  Upload,
  Trash2,
  FileUp,
  PenTool,
  Save
} from 'lucide-react';

interface FirmaSettingsTabProps {
  settings: MerchantSettings;
  setSettings: React.Dispatch<React.SetStateAction<MerchantSettings>>;
  handleSaveGeneralSettings: (e?: React.FormEvent) => void;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  handleLogoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogoDrop: (e: React.DragEvent) => void;
  handleRemoveLogo: () => void;
  isDraggingLogo: boolean;
  setIsDraggingLogo: (dragging: boolean) => void;
  signatureInputRef: React.RefObject<HTMLInputElement | null>;
  handleSignatureFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSignatureDrop: (e: React.DragEvent) => void;
  handleRemoveSignature: () => void;
  isDraggingSignature: boolean;
  setIsDraggingSignature: (dragging: boolean) => void;
  setShowSignatureDrawModal: (show: boolean) => void;
}

export const FirmaSettingsTab: React.FC<FirmaSettingsTabProps> = ({
  settings,
  setSettings,
  handleSaveGeneralSettings,
  logoInputRef,
  handleLogoFileChange,
  handleLogoDrop,
  handleRemoveLogo,
  isDraggingLogo,
  setIsDraggingLogo,
  signatureInputRef,
  handleSignatureFileChange,
  handleSignatureDrop,
  handleRemoveSignature,
  isDraggingSignature,
  setIsDraggingSignature,
  setShowSignatureDrawModal
}) => {
  return (
    <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-6">
      <div className="pb-4 border-b border-white/30 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            <span>1. Persönliche Daten & Firma</span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Offizielle Firmenbezeichnung, vertretungsberechtigte Organe und Händler-Logo für Dokumente.
          </p>
        </div>
        <span className="metallic-pill px-3 py-1 text-xs font-black">
          Stammdaten
        </span>
      </div>

      {/* HÄNDLER-LOGO UPLOAD BEREICH */}
      <div className="metallic-inner-subbox p-5 rounded-2xl border border-white/60 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900/10 text-slate-950 flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4 metallic-debossed-icon" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-950">Firmenlogo / Händlerlogo</h3>
              <p className="text-[11px] text-slate-700 font-semibold">
                Wird auf allen Rechnungen, Angeboten, E-Rechnungen und Kaufverträgen abgedruckt.
              </p>
            </div>
          </div>
          {settings.logoUrl && (
            <span className="metallic-pill px-2.5 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5 metallic-debossed-icon text-emerald-700" />
              <span>Logo aktiv</span>
            </span>
          )}
        </div>

        {/* Hidden Native File Input */}
        <input
          type="file"
          ref={logoInputRef}
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleLogoFileChange}
          className="hidden"
        />

        {settings.logoUrl ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 metallic-card-luminous p-4 rounded-xl border border-white/60">
            <div className="w-40 h-20 bg-white/60 border border-white/80 rounded-lg flex items-center justify-center p-2 overflow-hidden relative group">
              <img
                src={settings.logoUrl}
                alt="Firmenlogo Vorschau"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-1 text-xs">
              <div className="font-black text-slate-950">Aktuelles Firmenlogo</div>
              <div className="text-slate-700 font-medium text-[11px]">
                Eingebunden als Standard-Briefkopf für {settings.companyName || 'Ihr Unternehmen'}.
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3 py-1.5 metallic-btn-secondary text-slate-950 font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 metallic-debossed-icon" />
                  <span>Logo ersetzen</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 border border-rose-300/80 text-rose-900 font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 metallic-debossed-icon" />
                  <span>Logo entfernen</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
            onDragLeave={() => setIsDraggingLogo(false)}
            onDrop={handleLogoDrop}
            onClick={() => logoInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDraggingLogo
                ? 'border-slate-800 bg-white/50'
                : 'border-white/80 bg-white/30 hover:bg-white/50'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-slate-900/10 text-slate-900 flex items-center justify-center">
              <FileUp className="w-6 h-6 metallic-debossed-icon" />
            </div>
            <div className="space-y-0.5">
              <div className="font-black text-sm text-slate-950">
                Händlerlogo hochladen (Hierher ziehen oder klicken)
              </div>
              <div className="text-xs text-slate-700 font-medium">
                Unterstützte Formate: PNG, SVG, JPG oder WebP (maximal 4 MB)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Händler-Unterschrift (Digitale Standard-Signatur) Upload & Draw Box */}
      <div className="metallic-inner-subbox rounded-2xl p-4 sm:p-5 border border-white/60 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 metallic-debossed-icon text-slate-900" />
            <span className="font-black text-slate-950 text-xs">
              Digitale Händler-Unterschrift (Standard-Signatur)
            </span>
          </div>
          <span className="metallic-pill px-2.5 py-0.5 text-[10px] font-bold text-slate-900">
            Probefahrt & Verträge
          </span>
        </div>

        {/* Hidden Native Signature File Input */}
        <input
          type="file"
          ref={signatureInputRef}
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleSignatureFileChange}
          className="hidden"
        />

        {settings.signatureUrl ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 metallic-card-luminous p-4 rounded-xl border border-white/60">
            <div className="w-44 h-20 bg-white/60 border border-white/80 rounded-lg flex items-center justify-center p-2 overflow-hidden relative group">
              <img
                src={settings.signatureUrl}
                alt="Händlerunterschrift Vorschau"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-1 text-xs">
              <div className="font-black text-slate-950">Aktuelle Händler-Signatur</div>
              <div className="text-slate-700 font-medium text-[11px]">
                Wird auf Probefahrt-Vereinbarungen, Kaufverträgen und Übergabeprotokollen als Standard-Unterschrift eingefügt.
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignatureDrawModal(true)}
                  className="px-3 py-1.5 metallic-btn-primary text-slate-950 font-black rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <PenTool className="w-3.5 h-3.5 metallic-debossed-icon" />
                  <span>Neu zeichnen</span>
                </button>
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  className="px-3 py-1.5 metallic-btn-secondary text-slate-950 font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 metallic-debossed-icon" />
                  <span>Bild hochladen</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveSignature}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 border border-rose-300/80 text-rose-900 font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 metallic-debossed-icon" />
                  <span>Entfernen</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setShowSignatureDrawModal(true)}
              className="border-2 border-dashed border-white/90 bg-white/40 hover:bg-white/60 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-900/10 text-slate-950 flex items-center justify-center group-hover:scale-110 transition">
                <PenTool className="w-5 h-5 metallic-debossed-icon" />
              </div>
              <div>
                <div className="font-black text-xs text-slate-950">
                  Unterschrift jetzt zeichnen
                </div>
                <div className="text-[11px] text-slate-700 font-semibold">
                  Per Maus, Touchscreen oder Stylus-Pen
                </div>
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingSignature(true); }}
              onDragLeave={() => setIsDraggingSignature(false)}
              onDrop={handleSignatureDrop}
              onClick={() => signatureInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                isDraggingSignature
                  ? 'border-slate-800 bg-white/50'
                  : 'border-white/80 bg-white/30 hover:bg-white/50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-900/10 text-slate-950 flex items-center justify-center">
                <FileUp className="w-5 h-5 metallic-debossed-icon" />
              </div>
              <div>
                <div className="font-black text-xs text-slate-950">
                  Signaturbild hochladen
                </div>
                <div className="text-[11px] text-slate-700 font-semibold">
                  PNG (transparent), JPG oder WebP
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveGeneralSettings} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-slate-900 font-black mb-1.5">
              Firmenname / Handelsbezeichnung *
            </label>
            <input
              type="text"
              required
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              placeholder="z.B. MaxFleet Autohandelsgruppe GmbH"
              className="metallic-input w-full p-3 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              Verantwortliche Person (Inhaber / Geschäftsführer) *
            </label>
            <input
              type="text"
              required
              value={settings.responsiblePerson}
              onChange={(e) => setSettings({ ...settings, responsiblePerson: e.target.value })}
              placeholder="z.B. Max Mustermann"
              className="metallic-input w-full p-3 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              Rechtsform
            </label>
            <select
              value={settings.legalForm}
              onChange={(e) => setSettings({ ...settings, legalForm: e.target.value })}
              className="metallic-input w-full p-3 rounded-xl font-bold text-slate-950"
            >
              <option value="GmbH">GmbH (Gesellschaft mit beschränkter Haftung)</option>
              <option value="UG (haftungsbeschränkt)">UG (haftungsbeschränkt)</option>
              <option value="Einzelunternehmen">Einzelunternehmen / Eingetragener Kaufmann (e.K.)</option>
              <option value="GbR">GbR (Gesellschaft bürgerlichen Rechts)</option>
              <option value="GmbH & Co. KG">GmbH & Co. KG</option>
              <option value="AG">AG (Aktiengesellschaft)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              Handelsregister-Nummer (HRB / HRA)
            </label>
            <input
              type="text"
              value={settings.commercialRegister || ''}
              onChange={(e) => setSettings({ ...settings, commercialRegister: e.target.value })}
              placeholder="z.B. HRB 198421 B"
              className="metallic-input w-full p-3 rounded-xl font-mono font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1.5">
              Zuständiges Registergericht
            </label>
            <input
              type="text"
              value={settings.registerCourt || ''}
              onChange={(e) => setSettings({ ...settings, registerCourt: e.target.value })}
              placeholder="z.B. Amtsgericht Charlottenburg (Berlin)"
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
            <span>Firmendaten speichern</span>
          </button>
        </div>
      </form>
    </div>
  );
};
