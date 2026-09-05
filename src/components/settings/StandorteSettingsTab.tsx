import React from 'react';
import { MerchantSettings, AdditionalLocation } from '../../types';
import {
  Building2,
  Plus,
  ShieldCheck,
  MapPin,
  Edit3,
  Trash2
} from 'lucide-react';

interface StandorteSettingsTabProps {
  settings: MerchantSettings;
  setActiveSubTab: (tab: any) => void;
  handleOpenAddLocation: () => void;
  handleOpenEditLocation: (loc: AdditionalLocation) => void;
  handleDeleteLocation: (id: string) => void;
}

export const StandorteSettingsTab: React.FC<StandorteSettingsTabProps> = ({
  settings,
  setActiveSubTab,
  handleOpenAddLocation,
  handleOpenEditLocation,
  handleDeleteLocation
}) => {
  return (
    <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-6">
      <div className="pb-4 border-b border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            <span>7. Zusätzliche Standorte & Filialen</span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Verwalten Sie Zweigstellen, Außenlager, Werkstätten und Showrooms (Haupt-Rechnungsadresse bleibt stets auf den Firmensitz fixiert).
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddLocation}
          className="metallic-btn-primary px-4 py-2 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 metallic-debossed-icon" />
          <span>Standort hinzufügen</span>
        </button>
      </div>

      {/* Fixed Main Address Notice */}
      <div className="metallic-inner-subbox border border-white/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900/10 text-slate-950 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4 metallic-debossed-icon text-slate-800" />
          </div>
          <div>
            <div className="font-black text-slate-950 flex items-center gap-2">
              <span>Haupt-Rechnungsadresse (Firmensitz)</span>
              <span className="metallic-pill px-2 py-0.5 text-emerald-800 text-[10px] font-black">Fixiert</span>
            </div>
            <div className="text-slate-700 font-medium mt-0.5">
              {settings.street}, {settings.postalCode} {settings.city} ({settings.companyName})
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveSubTab('adresse')}
          className="metallic-btn-secondary px-3 py-1.5 rounded-lg text-slate-950 font-black text-xs cursor-pointer shrink-0 transition"
        >
          Bearbeiten
        </button>
      </div>

      {/* Locations List */}
      <div className="space-y-3">
        {(settings.additionalLocations || []).length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-white/80 bg-white/20 rounded-2xl text-slate-600 font-medium text-xs">
            Keine zusätzlichen Standorte vorhanden. Klicken Sie oben auf „Standort hinzufügen“.
          </div>
        ) : (
          (settings.additionalLocations || []).map((loc) => (
            <div
              key={loc.id}
              className="p-4 rounded-2xl metallic-inner-subbox border border-white/60 hover:border-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900/10 text-slate-950 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 metallic-debossed-icon text-slate-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-950 text-sm">{loc.name}</span>
                    <span className="metallic-pill px-2.5 py-0.5 text-slate-900 font-bold text-[10px]">
                      {loc.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-1">
                    {loc.street}, {loc.postalCode} {loc.city} {loc.country && `• ${loc.country}`}
                  </div>
                  {(loc.contactPerson || loc.phone) && (
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {loc.contactPerson && `Ansprechpartner: ${loc.contactPerson}`}
                      {loc.phone && ` • Tel: ${loc.phone}`}
                    </div>
                  )}
                  {loc.notes && (
                    <div className="text-[11px] text-slate-500 italic mt-0.5">
                      Notiz: {loc.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenEditLocation(loc)}
                  className="p-2 text-slate-700 hover:text-slate-950 hover:bg-white/60 rounded-xl transition cursor-pointer"
                  title="Bearbeiten"
                >
                  <Edit3 className="w-4 h-4 metallic-debossed-icon" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLocation(loc.id)}
                  className="p-2 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4 metallic-debossed-icon" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
