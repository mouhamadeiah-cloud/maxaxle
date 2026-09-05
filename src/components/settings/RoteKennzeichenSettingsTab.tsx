import React from 'react';
import { MerchantSettings, RedLicensePlate } from '../../types';
import {
  Car,
  Plus,
  RefreshCw,
  Edit3,
  Trash2
} from 'lucide-react';

interface RoteKennzeichenSettingsTabProps {
  settings: MerchantSettings;
  handleOpenAddPlate: () => void;
  handleOpenEditPlate: (plate: RedLicensePlate) => void;
  handleDeletePlate: (id: string) => void;
  handleTogglePlateStatus: (id: string) => void;
}

export const RoteKennzeichenSettingsTab: React.FC<RoteKennzeichenSettingsTabProps> = ({
  settings,
  handleOpenAddPlate,
  handleOpenEditPlate,
  handleDeletePlate,
  handleTogglePlateStatus
}) => {
  return (
    <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-6">
      <div className="pb-4 border-b border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
            <Car className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            <span>8. Rote Nummernschilder (Händlerkennzeichen)</span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Verwaltung roter 06er-Dauerkennzeichen für Probefahrten, Überführungen und Werkstattfahrten.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddPlate}
          className="metallic-btn-primary px-4 py-2 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 metallic-debossed-icon" />
          <span>Rotes Kennzeichen anlegen</span>
        </button>
      </div>

      {/* Plates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(settings.redLicensePlates || []).length === 0 ? (
          <div className="col-span-2 p-8 text-center border-2 border-dashed border-white/80 bg-white/20 rounded-2xl text-slate-600 font-medium text-xs">
            Keine roten Kennzeichen hinterlegt.
          </div>
        ) : (
          (settings.redLicensePlates || []).map((plate) => {
            const isOut = plate.status === 'probefahrt' || plate.status === 'ueberfuehrung';
            return (
              <div
                key={plate.id}
                className={`p-4 rounded-2xl metallic-inner-subbox border transition relative space-y-3 shadow-sm ${
                  isOut
                    ? 'border-emerald-400/80 bg-emerald-500/10'
                    : 'border-white/60 hover:border-white'
                }`}
              >
                {/* Plate Header Graphic */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-red-600 rounded-lg shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="font-mono font-black text-red-600 text-sm tracking-wider">
                      {plate.plateNumber}
                    </span>
                  </div>
                  <span className={`metallic-pill px-2.5 py-0.5 text-[10px] font-black ${
                    isOut ? 'text-emerald-900 font-black' : 'text-emerald-800'
                  }`}>
                    {isOut ? 'Auf Probefahrt' : 'Im Tresor verfügbar'}
                  </span>
                </div>

                {/* Plate Details */}
                <div className="text-xs space-y-1 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Gültig bis:</span>
                    <span className="font-bold text-slate-950">{plate.validUntil}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Fahrer / Verkäufer:</span>
                    <span className="font-bold text-slate-950">{plate.assignedDriver || '-'}</span>
                  </div>
                  {plate.vehicleAssigned && plate.vehicleAssigned !== '-' && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-semibold">Fahrzeug:</span>
                      <span className="font-bold text-slate-950 truncate max-w-[160px]">{plate.vehicleAssigned}</span>
                    </div>
                  )}
                  {plate.logbookNotes && (
                    <div className="text-[11px] text-slate-700 bg-white/60 border border-white/70 p-2 rounded-xl mt-1 italic">
                      {plate.logbookNotes}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-white/30 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePlateStatus(plate.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      isOut 
                        ? 'metallic-btn-primary text-slate-950' 
                        : 'metallic-btn-secondary text-slate-950'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 metallic-debossed-icon text-slate-950" />
                    <span>{isOut ? 'Als zurückgebucht markieren' : 'Probefahrt starten'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPlate(plate)}
                      className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-white/60 rounded-lg transition cursor-pointer"
                      title="Bearbeiten"
                    >
                      <Edit3 className="w-3.5 h-3.5 metallic-debossed-icon" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlate(plate.id)}
                      className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5 metallic-debossed-icon" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
