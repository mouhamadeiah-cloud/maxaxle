import React from 'react';
import { RedLicensePlate } from '../../../types';
import { Car, X } from 'lucide-react';

interface PlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlate: RedLicensePlate | null;
  plateForm: Partial<RedLicensePlate>;
  setPlateForm: React.Dispatch<React.SetStateAction<Partial<RedLicensePlate>>>;
  handleSavePlate: (e: React.FormEvent) => void;
}

export const PlateModal: React.FC<PlateModalProps> = ({
  isOpen,
  onClose,
  editingPlate,
  plateForm,
  setPlateForm,
  handleSavePlate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-card-luminous rounded-3xl max-w-md w-full shadow-2xl border border-white/80 overflow-hidden animate-in fade-in zoom-in-95 my-0 sm:my-1 max-h-[92vh] flex flex-col">
        <div className="p-5 border-b border-white/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Car className="w-5 h-5 metallic-debossed-icon" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base">
                {editingPlate ? 'Rotes Kennzeichen bearbeiten' : 'Rotes Kennzeichen anlegen'}
              </h3>
              <p className="text-xs text-slate-700 font-semibold">06er-Händlerkennzeichen für Probefahrten</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-white/60 transition cursor-pointer"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        <form onSubmit={handleSavePlate} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-black text-slate-900 mb-1">Kennzeichen-Kombination *</label>
            <input
              type="text"
              required
              value={plateForm.plateNumber || ''}
              onChange={(e) => setPlateForm({ ...plateForm, plateNumber: e.target.value.toUpperCase() })}
              placeholder="z.B. B-06124"
              className="metallic-input w-full p-2.5 rounded-xl font-mono font-black text-red-600 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-slate-900 mb-1">Gültig bis (Datum)</label>
              <input
                type="date"
                value={plateForm.validUntil || '2027-12-31'}
                onChange={(e) => setPlateForm({ ...plateForm, validUntil: e.target.value })}
                className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
              />
            </div>

            <div>
              <label className="block font-black text-slate-900 mb-1">Aktueller Status</label>
              <select
                value={plateForm.status || 'verfuegbar'}
                onChange={(e) => setPlateForm({ ...plateForm, status: e.target.value as RedLicensePlate['status'] })}
                className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
              >
                <option value="verfuegbar">Im Tresor verfügbar</option>
                <option value="probefahrt">Auf Probefahrt</option>
                <option value="ueberfuehrung">Überführungsfahrt</option>
                <option value="gesperrt">Gesperrt / Verlängern</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-black text-slate-900 mb-1">Zugewiesener Fahrer / Verkäufer</label>
            <input
              type="text"
              value={plateForm.assignedDriver || ''}
              onChange={(e) => setPlateForm({ ...plateForm, assignedDriver: e.target.value })}
              placeholder="Stefan Becker"
              className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block font-black text-slate-900 mb-1">Fahrzeug / FIN (falls im Einsatz)</label>
            <input
              type="text"
              value={plateForm.vehicleAssigned || ''}
              onChange={(e) => setPlateForm({ ...plateForm, vehicleAssigned: e.target.value })}
              placeholder="BMW 320d (WBA31AY0...)"
              className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block font-black text-slate-900 mb-1">Fahrtenbuch-Notiz</label>
            <textarea
              rows={2}
              value={plateForm.logbookNotes || ''}
              onChange={(e) => setPlateForm({ ...plateForm, logbookNotes: e.target.value })}
              placeholder="z.B. Probefahrt Route Stadtring..."
              className="metallic-input w-full p-2.5 rounded-xl font-medium text-slate-950"
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
              Kennzeichen speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
