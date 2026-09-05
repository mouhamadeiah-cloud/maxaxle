import React from 'react';
import { AdditionalLocation } from '../../../types';
import { MapPin, X } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLocation: AdditionalLocation | null;
  locationForm: Partial<AdditionalLocation>;
  setLocationForm: React.Dispatch<React.SetStateAction<Partial<AdditionalLocation>>>;
  handleSaveLocation: (e: React.FormEvent) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  editingLocation,
  locationForm,
  setLocationForm,
  handleSaveLocation
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-card-luminous rounded-3xl max-w-lg w-full shadow-2xl border border-white/80 overflow-hidden animate-in fade-in zoom-in-95 my-0 sm:my-1 max-h-[92vh] flex flex-col">
        <div className="p-5 border-b border-white/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900/10 text-slate-950 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base">
                {editingLocation ? 'Standort bearbeiten' : 'Zusätzlichen Standort anlegen'}
              </h3>
              <p className="text-xs text-slate-700 font-semibold">Filiale, Showroom oder Werkstatt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-white/60 transition cursor-pointer"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        <form onSubmit={handleSaveLocation} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-black text-slate-900 mb-1">Bezeichnung des Standorts *</label>
            <input
              type="text"
              required
              value={locationForm.name || ''}
              onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
              placeholder="z.B. Filiale Berlin-Spandau"
              className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-slate-900 mb-1">Standort-Typ</label>
              <select
                value={locationForm.type || 'Filiale'}
                onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value })}
                className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
              >
                <option value="Filiale">Filiale (Verkauf)</option>
                <option value="Showroom">Showroom</option>
                <option value="Werkstatt">Werkstatt / Aufbereitung</option>
                <option value="Außenlager">Außenlager / Stellplatz</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-900 mb-1">Ansprechpartner / Leiter</label>
              <input
                type="text"
                value={locationForm.contactPerson || ''}
                onChange={(e) => setLocationForm({ ...locationForm, contactPerson: e.target.value })}
                placeholder="Stefan Becker"
                className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-slate-900 mb-1">Straße und Hausnummer *</label>
            <input
              type="text"
              required
              value={locationForm.street || ''}
              onChange={(e) => setLocationForm({ ...locationForm, street: e.target.value })}
              placeholder="Nonnendammallee 42"
              className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-slate-900 mb-1">PLZ *</label>
              <input
                type="text"
                required
                value={locationForm.postalCode || ''}
                onChange={(e) => setLocationForm({ ...locationForm, postalCode: e.target.value })}
                placeholder="13599"
                className="metallic-input w-full p-2.5 rounded-xl font-mono font-bold text-slate-950"
              />
            </div>
            <div>
              <label className="block font-black text-slate-900 mb-1">Stadt *</label>
              <input
                type="text"
                required
                value={locationForm.city || ''}
                onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                placeholder="Berlin"
                className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-slate-900 mb-1">Telefon / Notizen</label>
            <input
              type="text"
              value={locationForm.phone || ''}
              onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
              placeholder="+49 30 3345100"
              className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div className="pt-4 border-t border-white/30 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="metallic-btn-secondary px-4 py-2 text-slate-950 font-black rounded-xl transition cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="metallic-btn-primary px-5 py-2 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer"
            >
              Standort speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
