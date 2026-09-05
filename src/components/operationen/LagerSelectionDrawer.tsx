import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Car, 
  Check, 
  Sparkles, 
  Fuel, 
  Gauge, 
  Calendar, 
  MapPin, 
  Coins, 
  ShieldCheck,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Vehicle } from '../../types';

interface LagerSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const LagerSelectionDrawer: React.FC<LagerSelectionDrawerProps> = ({
  isOpen,
  onClose,
  vehicles,
  selectedVehicleId,
  onSelectVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verfuegbar' | 'reserviert'>('all');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || (
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        (v.variant && v.variant.toLowerCase().includes(q)) ||
        v.vin.toLowerCase().includes(q) ||
        (v.location && v.location.toLowerCase().includes(q)) ||
        (v.color && v.color.toLowerCase().includes(q))
      );

      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Slide Drawer Content */}
      <div 
        className="relative z-10 w-full max-w-xl sm:max-w-2xl metallic-modal-container text-[#0e264b] h-full flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-500 border-l border-slate-300/80"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-slate-300/70 flex items-center justify-between bg-gradient-to-b from-white/40 to-slate-200/30 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-sm">
              <Car className="w-5 h-5 text-[#0e264b] metallic-debossed-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#0e264b] tracking-tight">Fahrzeug aus Lager auswählen</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Pflichtfeld
                </span>
              </div>
              <p className="text-xs text-[#1e3a5f]/80 font-medium">
                Wählen Sie einen Bestandswagen zur automatischen Übernahme aller Fahrzeugdaten & Steuerparameter
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-200/60 rounded-xl text-slate-500 hover:text-[#0e264b] transition cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-300/70 bg-white/30 backdrop-blur-xs space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 metallic-debossed-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Marke, Modell, FIN, Standort oder Farbe suchen..."
              className="metallic-input w-full pl-10 pr-8 py-2.5 text-xs font-semibold text-[#0e264b] placeholder:text-slate-400 focus:outline-none transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0e264b] text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-[#1e3a5f]/70 mr-1">Status:</span>
            {(['all', 'verfuegbar', 'reserviert'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer border ${
                  statusFilter === st
                    ? 'metallic-btn-primary text-[#091a34] shadow-xs'
                    : 'metallic-card-luminous border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b]'
                }`}
              >
                {st === 'all' && `Alle (${vehicles.length})`}
                {st === 'verfuegbar' && `Verfügbar (${vehicles.filter(v => v.status === 'verfuegbar').length})`}
                {st === 'reserviert' && `Reserviert (${vehicles.filter(v => v.status === 'reserviert').length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-16 space-y-3 metallic-card border border-slate-300/80 rounded-3xl p-6">
              <Car className="w-12 h-12 text-slate-400 mx-auto stroke-1 metallic-debossed-icon" />
              <div className="text-sm font-bold text-[#0e264b]">Keine Fahrzeuge im Bestand gefunden</div>
              <p className="text-xs text-[#1e3a5f]/70 max-w-xs mx-auto">
                Passen Sie den Suchbegriff oder Filter an, um passende Fahrzeuge aus dem Lager auszuwählen.
              </p>
            </div>
          ) : (
            filteredVehicles.map((veh) => {
              const isSelected = veh.id === selectedVehicleId;
              const isDiffTax = veh.taxType !== 'standard_19';

              return (
                <div
                  key={veh.id}
                  onClick={() => {
                    onSelectVehicle(veh);
                    onClose();
                  }}
                  className={`group p-4 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${
                    isSelected 
                      ? 'metallic-card-luminous border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : 'metallic-card border-slate-300/80 hover:border-slate-400'
                  }`}
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-18 h-14 sm:w-20 sm:h-16 rounded-xl bg-slate-200 overflow-hidden border border-slate-300 shrink-0 relative">
                      {veh.imageUrl ? (
                        <img 
                          src={veh.imageUrl} 
                          alt={`${veh.brand} ${veh.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Car className="w-6 h-6 metallic-debossed-icon" />
                        </div>
                      )}
                      <span className={`absolute bottom-1 left-1 text-[8px] font-black px-1.5 py-0.2 rounded shadow-xs ${
                        isDiffTax ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        {isDiffTax ? '§ 25a' : '19% MwSt'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-[#0e264b] group-hover:text-blue-950 transition-colors truncate">
                          {veh.brand} {veh.model}
                        </span>
                        {veh.variant && (
                          <span className="text-xs text-[#1e3a5f]/80 truncate font-semibold">
                            {veh.variant}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 text-[11px] text-[#1e3a5f] flex-wrap font-medium">
                        <span className="flex items-center gap-1 font-mono text-[#0e264b] font-bold">
                          FIN: {veh.vin || 'Keine FIN'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>EZ {veh.firstRegistration || '-'}</span>
                        <span className="text-slate-300">•</span>
                        <span>{(veh.mileage || 0).toLocaleString('de-DE')} km</span>
                        <span className="text-slate-300">•</span>
                        <span>{veh.powerPs || 150} PS</span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-[#1e3a5f]/70 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 metallic-debossed-icon" />
                        <span className="truncate">{veh.location || 'Hauptstandort'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Selection Badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 border-slate-300/60 pt-2 sm:pt-0 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-800 tracking-tight font-mono">
                        {(veh.sellingPrice || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </div>
                      <span className="text-[10px] text-[#1e3a5f]/70 block font-semibold">
                        {isDiffTax ? 'Differenzbesteuert' : 'Inkl. 19% MwSt.'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-black text-[#0e264b] group-hover:text-blue-900 group-hover:translate-x-1 transition-all">
                      <span>Auswählen</span>
                      <ArrowRight className="w-3.5 h-3.5 metallic-debossed-icon" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar */}
        <div className="p-4 border-t border-slate-300/70 bg-white/40 backdrop-blur-xs flex items-center justify-between text-xs text-[#1e3a5f] font-semibold shrink-0">
          <span>{filteredVehicles.length} von {vehicles.length} Fahrzeugen im Lager</span>
          <button
            type="button"
            onClick={onClose}
            className="metallic-card-luminous border border-slate-300/70 hover:bg-white/60 px-4 py-2 text-[#1e3a5f] font-bold rounded-xl transition cursor-pointer"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};
