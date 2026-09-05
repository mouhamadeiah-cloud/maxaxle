import React, { useState, useRef } from 'react';
import { 
  Globe, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  MessageSquare, 
  FileText, 
  ExternalLink, 
  Eye, 
  Layers, 
  Wrench, 
  Car, 
  CheckCircle2, 
  HelpCircle,
  Smartphone,
  Copy,
  Sliders,
  RefreshCw,
  Phone,
  Building2,
  Trash2
} from 'lucide-react';
import { MerchantSettings, WebShowroomSettings } from '../../types';
import { firebaseService } from '../../services/firebaseService';
import { compressImage } from '../../utils/mediaProcessor';

interface ShowroomSettingsTabProps {
  settings: MerchantSettings;
  onSave: (updated: MerchantSettings, message: string) => void;
  onOpenShowroomPreview: () => void;
}

const HERO_BG_PRESETS = [
  {
    id: 'luxury_showroom',
    label: 'Exklusiver Showroom',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
    preview: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=60'
  },
  {
    id: 'night_dealership',
    label: 'Modernes Autohaus Nacht',
    url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1920&q=80',
    preview: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=300&q=60'
  },
  {
    id: 'modern_glass',
    label: 'Glas-Architektur & Lounge',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80',
    preview: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=300&q=60'
  },
  {
    id: 'dark_studio',
    label: 'Dark Studio High-End',
    url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1920&q=80',
    preview: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=300&q=60'
  }
];

export const ShowroomSettingsTab: React.FC<ShowroomSettingsTabProps> = ({
  settings,
  onSave,
  onOpenShowroomPreview
}) => {
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const initialShowroom: WebShowroomSettings = settings.showroomSettings || {
    enabled: true,
    showroomTitle: `${settings.companyName || 'Autohaus'} – Digitaler Showroom`,
    showroomSlogan: 'Geprüfte Premium-Gebrauchtwagen mit DEKRA Zertifikat & Garantie',
    heroBgUrl: HERO_BG_PRESETS[0].url,
    heroBgPreset: 'luxury_showroom',
    customDomain: settings.website ? settings.website.replace(/^https?:\/\//, '') : 'www.autohaus-angebot.de',
    subdomainSlug: (settings.companyName || 'autohaus').toLowerCase().replace(/[^a-z0-9]/g, '-'),
    whatsappNumber: settings.mobile || settings.phone || '+49 171 0000000',
    openingHours: {
      weekdays: 'Mo. - Fr.: 09:00 - 18:30 Uhr',
      saturday: 'Sa.: 10:00 - 15:00 Uhr',
      sunday: 'So.: Geschlossen (Schautag online)'
    },
    legalImpressum: {
      companyName: settings.companyName || 'Autohaus GmbH',
      representedBy: settings.responsiblePerson ? `Geschäftsführung: ${settings.responsiblePerson}` : 'Geschäftsführung',
      streetAddress: settings.street || 'Hauptstraße 1',
      zipCity: `${settings.postalCode || ''} ${settings.city || ''}`.trim(),
      phone: settings.phone || '',
      email: settings.email || '',
      registerCourt: settings.registerCourt || 'Amtsgericht Charlottenburg',
      registerNumber: settings.commercialRegister || 'HRB 00000 B',
      vatId: settings.vatId || '',
      disclaimerText: 'Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz). Verbraucherinformation gem. Verordnung (EU) Nr. 524/2013: Plattform zur Online-Streitbeilegung: ec.europa.eu/consumers/odr.'
    },
    defaultShowMechanical: true,
    defaultShowBodywork: true,
    defaultShowFeatures: true,
    defaultShowVin: false,
    enableAiChatbot: true,
    aiChatbotWelcomeMessage: `Herzlich willkommen bei ${settings.companyName || 'unserem Autohaus'}! Ich bin MAX, Ihr persönlicher KI-Showroom-Berater. Wie kann ich Ihnen zu unseren Fahrzeugen, Zustand oder Preisen weiterhelfen?`,
    dealerPreferredChatLanguage: 'de'
  };

  const [formData, setFormData] = useState<WebShowroomSettings>(initialShowroom);

  const handleUpdate = (patch: Partial<WebShowroomSettings>) => {
    const updated = { ...formData, ...patch };
    setFormData(updated);
  };

  const handleUpdateImpressum = (patch: Partial<NonNullable<WebShowroomSettings['legalImpressum']>>) => {
    const updated = {
      ...formData,
      legalImpressum: {
        ...(formData.legalImpressum || {
          companyName: settings.companyName,
          representedBy: settings.responsiblePerson,
          streetAddress: settings.street,
          zipCity: `${settings.postalCode} ${settings.city}`,
          phone: settings.phone,
          email: settings.email,
          registerCourt: settings.registerCourt || '',
          registerNumber: settings.commercialRegister || '',
          vatId: settings.vatId || '',
          disclaimerText: ''
        }),
        ...patch
      }
    };
    setFormData(updated);
  };

  const handleUpdateOpeningHours = (patch: Partial<NonNullable<WebShowroomSettings['openingHours']>>) => {
    const updated = {
      ...formData,
      openingHours: {
        ...(formData.openingHours || {
          weekdays: 'Mo. - Fr.: 09:00 - 18:30 Uhr',
          saturday: 'Sa.: 10:00 - 15:00 Uhr',
          sunday: 'So.: Geschlossen'
        }),
        ...patch
      }
    };
    setFormData(updated);
  };

  const handleBgFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine gültige Bilddatei aus (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('Das Hintergrundbild darf maximal 15 MB groß sein.');
      return;
    }
    try {
      // Compress website showroom background (optimized for high-res web display at 1920x1080)
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.82,
        format: 'image/jpeg'
      });
      handleUpdate({ heroBgUrl: compressed.dataUrl, heroBgPreset: 'custom' });
    } catch (err) {
      console.error('Compression error, falling back to original FileReader:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        handleUpdate({ heroBgUrl: base64, heroBgPreset: 'custom' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: MerchantSettings = {
      ...settings,
      showroomSettings: formData
    };
    firebaseService.saveMerchantSettings(updatedSettings);
    onSave(updatedSettings, 'Web-Showroom & Impressum-Einstellungen erfolgreich gespeichert!');
  };

  const copyShowroomUrl = () => {
    const url = `${window.location.origin}/#showroom`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner with Quick Actions */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Öffentliche Web-Präsenz & Autohaus-Showroom</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Digitaler Händler-Showroom für Ihre Kunden
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Ihre exklusive Online-Ausstellungsseite. Kunden sehen Ihre Fahrzeuge mit Bildern, Preisen, MwSt.-Status, mechanischem & Karosseriezustand, Impressum und können mit dem KI-Berater MAX chatten.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenShowroomPreview}
              className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Showroom Live ansehen</span>
            </button>
            <button
              type="button"
              onClick={copyShowroomUrl}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/60 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link kopiert!' : 'Showroom-Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Status & Hauptkonfiguration */}
      <div className="metallic-card-luminous rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Showroom Status & Branding</h3>
              <p className="text-xs text-slate-500">Aktivierung und Haupttitel Ihres Web-Showrooms</p>
            </div>
          </div>

          {/* Toggle Online */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.enabled} 
              onChange={(e) => handleUpdate({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-13 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-3 text-xs font-bold text-slate-700">
              {formData.enabled ? 'Showroom Online' : 'Showroom Pausiert'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Showroom Haupttitel (Headline)</label>
            <input 
              type="text" 
              value={formData.showroomTitle} 
              onChange={(e) => handleUpdate({ showroomTitle: e.target.value })}
              placeholder="z.B. MaxFleet Autohandelsgruppe – Digitaler Showroom"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Slogan / Untertitel</label>
            <input 
              type="text" 
              value={formData.showroomSlogan} 
              onChange={(e) => handleUpdate({ showroomSlogan: e.target.value })}
              placeholder="z.B. Geprüfte Premium-Gebrauchtwagen mit DEKRA Siegel"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Eigene Domain (Optional)</label>
            <input 
              type="text" 
              value={formData.customDomain || ''} 
              onChange={(e) => handleUpdate({ customDomain: e.target.value })}
              placeholder="z.B. www.autohaus-mustermann.de"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
            <p className="text-[11px] text-slate-400">DNS CNAME kann direkt auf unseren Server geroutet werden</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">WhatsApp Kontaktnummer für Direkt-Chat</label>
            <input 
              type="text" 
              value={formData.whatsappNumber || ''} 
              onChange={(e) => handleUpdate({ whatsappNumber: e.target.value })}
              placeholder="+49 171 1234567"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Hintergrundbild & Header-Gestaltung */}
      <div className="metallic-card-luminous rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Hero-Hintergrundbild des Showrooms</h3>
            <p className="text-xs text-slate-500">Wählen Sie aus stimmungsvollen Vorlagen oder laden Sie Ihr eigenes Autohaus-Bild hoch</p>
          </div>
        </div>

        {/* Current Banner Preview */}
        <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-slate-300 shadow-inner group">
          <img 
            src={formData.heroBgUrl || HERO_BG_PRESETS[0].url} 
            alt="Showroom Hero Background" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent flex flex-col justify-end p-6 text-white">
            <span className="text-[11px] uppercase tracking-widest text-blue-300 font-bold">Vorschau Header</span>
            <h4 className="text-lg font-black">{formData.showroomTitle}</h4>
            <p className="text-xs text-slate-200 line-clamp-1">{formData.showroomSlogan}</p>
          </div>
        </div>

        {/* Preset Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700">Design-Vorlagen auswählen</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {HERO_BG_PRESETS.map((preset) => {
              const isSelected = formData.heroBgPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleUpdate({ heroBgUrl: preset.url, heroBgPreset: preset.id as any })}
                  className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all p-1 cursor-pointer group ${
                    isSelected ? 'border-blue-600 ring-2 ring-blue-400/30 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-20 rounded-xl overflow-hidden relative">
                    <img 
                      src={preset.preview} 
                      alt={preset.label} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="p-1.5">
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{preset.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Upload or URL */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-700">Eigenes Hintergrundbild hochladen (oder Bild-URL einfügen)</label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input 
              type="text" 
              value={formData.heroBgUrl || ''} 
              onChange={(e) => handleUpdate({ heroBgUrl: e.target.value, heroBgPreset: 'custom' })}
              placeholder="https://... Bild-URL"
              className="flex-1 w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
            <input 
              ref={bgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBgFile(file);
                if (e.target) e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => bgInputRef.current?.click()}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Bilddatei wählen</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Gesetzliches Impressum & Rechtsangaben nach § 5 DDG */}
      <div className="metallic-card-luminous rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Gesetzliches Impressum (§ 5 DDG / TMG)</h3>
            <p className="text-xs text-slate-500">Pflichtangaben für gewerbliche deutsche Autohändler im Internet</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Firmenname (Vollständig)</label>
            <input 
              type="text" 
              value={formData.legalImpressum?.companyName || ''} 
              onChange={(e) => handleUpdateImpressum({ companyName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Vertretungsberechtigte Person(en) / Geschäftsführer</label>
            <input 
              type="text" 
              value={formData.legalImpressum?.representedBy || ''} 
              onChange={(e) => handleUpdateImpressum({ representedBy: e.target.value })}
              placeholder="z.B. Geschäftsführer: Max Mustermann"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Straße & Hausnummer</label>
            <input 
              type="text" 
              value={formData.legalImpressum?.streetAddress || ''} 
              onChange={(e) => handleUpdateImpressum({ streetAddress: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">PLZ & Ort</label>
            <input 
              type="text" 
              value={formData.legalImpressum?.zipCity || ''} 
              onChange={(e) => handleUpdateImpressum({ zipCity: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Telefonnummer</label>
            <input 
              type="text" 
              value={formData.legalImpressum?.phone || ''} 
              onChange={(e) => handleUpdateImpressum({ phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">E-Mail Adresse</label>
            <input 
              type="email" 
              value={formData.legalImpressum?.email || ''} 
              onChange={(e) => handleUpdateImpressum({ email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Registergericht & Registernummer</label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                value={formData.legalImpressum?.registerCourt || ''} 
                onChange={(e) => handleUpdateImpressum({ registerCourt: e.target.value })}
                placeholder="Amtsgericht..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              />
              <input 
                type="text" 
                value={formData.legalImpressum?.registerNumber || ''} 
                onChange={(e) => handleUpdateImpressum({ registerNumber: e.target.value })}
                placeholder="HRB 123456 B"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Umsatzsteuer-Identifikationsnummer (USt-IdNr.)</label>
            <input 
              type="text" 
              value={formData.legalImpressum?.vatId || ''} 
              onChange={(e) => handleUpdateImpressum({ vatId: e.target.value })}
              placeholder="DE 123 456 789"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Rechtlicher Hinweis / Verbraucherstreitbeilegung</label>
          <textarea 
            rows={3}
            value={formData.legalImpressum?.disclaimerText || ''} 
            onChange={(e) => handleUpdateImpressum({ disclaimerText: e.target.value })}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white resize-none"
          />
        </div>
      </div>

      {/* 4. Öffnungszeiten */}
      <div className="metallic-card-luminous rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Öffnungszeiten & Erreichbarkeit</h3>
            <p className="text-xs text-slate-500">Werden prominent im Showroom und Kontakt-Bereich angezeigt</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Montag – Freitag</label>
            <input 
              type="text" 
              value={formData.openingHours?.weekdays || ''} 
              onChange={(e) => handleUpdateOpeningHours({ weekdays: e.target.value })}
              placeholder="Mo. - Fr.: 09:00 - 18:30 Uhr"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Samstag</label>
            <input 
              type="text" 
              value={formData.openingHours?.saturday || ''} 
              onChange={(e) => handleUpdateOpeningHours({ saturday: e.target.value })}
              placeholder="Sa.: 10:00 - 15:00 Uhr"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Sonntag / Feiertage</label>
            <input 
              type="text" 
              value={formData.openingHours?.sunday || ''} 
              onChange={(e) => handleUpdateOpeningHours({ sunday: e.target.value })}
              placeholder="So.: Geschlossen"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
            />
          </div>
        </div>
      </div>

      {/* 5. KI-Showroom Chatbot & Verhaltens-Restriktionen */}
      <div className="metallic-card-luminous rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">MAX KI-Showroom Berater</h3>
              <p className="text-xs text-slate-500">Antwortet Besuchern streng fokussiert auf Zustand, Preise & Probefahrten</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.enableAiChatbot} 
              onChange={(e) => handleUpdate({ enableAiChatbot: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-13 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            <span className="ml-3 text-xs font-bold text-slate-700">
              {formData.enableAiChatbot ? 'KI-Chatbot Aktiv' : 'Deaktiviert'}
            </span>
          </label>
        </div>

        {formData.enableAiChatbot && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-3 text-purple-900 text-xs leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Strikte Sicherheits-Restriktion aktiv:</strong>
                MAX antwortet im öffentlichen Showroom <strong>ausschließlich</strong> auf Fragen zum mechanischen und optischen Zustand der Fahrzeuge, Verkaufspreisen, Besteuerung (19% MwSt. vs. §25a), Ausstattung, Probefahrten und Autohaus-Kontaktdaten. Alle systemfremden Themen werden abgewiesen.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Willkommensnachricht des Chatbots</label>
              <textarea 
                rows={2}
                value={formData.aiChatbotWelcomeMessage} 
                onChange={(e) => handleUpdate({ aiChatbotWelcomeMessage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. Standardanzeige der Inspektions-Details */}
      <div className="metallic-card-luminous rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 shadow-xs">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Standard-Sichtbarkeit von Fahrzeugzustandsfeldern</h3>
            <p className="text-xs text-slate-500">Legen Sie fest, welche Prüfdetails standardmäßig auf den Fahrzeugkarten sichtbar sind</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={formData.defaultShowMechanical} 
              onChange={(e) => handleUpdate({ defaultShowMechanical: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Mechanischer Zustand & Service</span>
              <span className="text-[11px] text-slate-500">Motor, Getriebe, Bremsen, Reifen, TÜV & Scheckheft</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={formData.defaultShowBodywork} 
              onChange={(e) => handleUpdate({ defaultShowBodywork: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Karosserie, Lack & Unfallfreiheit</span>
              <span className="text-[11px] text-slate-500">Lackzustand, Innenraum, Dellen/Kratzer, Schichtdicke</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={formData.defaultShowFeatures} 
              onChange={(e) => handleUpdate({ defaultShowFeatures: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Ausstattungsliste & Highlights</span>
              <span className="text-[11px] text-slate-500">S-Line, AMG, Laserlicht, Panoramadach etc.</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={formData.defaultShowVin} 
              onChange={(e) => handleUpdate({ defaultShowVin: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Fahrgestellnummer (FIN / VIN)</span>
              <span className="text-[11px] text-slate-500">Vollständige 17-stellige FIN öffentlich anzeigen</span>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onOpenShowroomPreview}
          className="px-6 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-blue-600" />
          <span>Vorschau öffnen</span>
        </button>

        <button
          type="submit"
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Showroom-Einstellungen speichern</span>
        </button>
      </div>

    </form>
  );
};
