import React from 'react';
import { Send, Car, Calendar, Gauge, Fuel, Hash, Zap } from 'lucide-react';
import { Vehicle } from '../../types';

interface LagerCardProps {
  vehicle: Vehicle;
  onClick: () => void;
  onSendToOperations: (e: React.MouseEvent) => void;
}

export const LagerCard: React.FC<LagerCardProps> = ({
  vehicle,
  onClick,
  onSendToOperations
}) => {
  const brandAndModel = `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Fahrzeug';

  const formattedEz = vehicle.firstRegistration || 'N/A';
  const formattedKm = `${(vehicle.mileage || 0).toLocaleString('de-DE')} km`;
  const formattedPrice = `${(vehicle.sellingPrice || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`;
  const formattedVin = vehicle.vin || 'Keine FIN';
  const powerInfo = vehicle.powerPs ? `${vehicle.powerPs} PS` : (vehicle.powerKw ? `${vehicle.powerKw} kW` : null);

  const getStatusBadge = () => {
    switch (vehicle.status) {
      case 'verfuegbar':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-emerald-300 shadow-xs">
            <span className="w-2 h-2 rounded-full jewel-emerald" />
            <span className="text-[11px] font-black text-emerald-800">Verfügbar</span>
          </div>
        );
      case 'reserviert':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-amber-300 shadow-xs">
            <span className="w-2 h-2 rounded-full jewel-amber" />
            <span className="text-[11px] font-black text-amber-800">Reserviert</span>
          </div>
        );
      case 'aufbereitung':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-sky-300 shadow-xs">
            <span className="w-2 h-2 rounded-full jewel-blue" />
            <span className="text-[11px] font-black text-sky-800">In Aufbereitung</span>
          </div>
        );
      case 'verkauft':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-rose-300 shadow-xs">
            <span className="w-2 h-2 rounded-full jewel-red" />
            <span className="text-[11px] font-black text-rose-800">Verkauft</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[11px] font-bold text-slate-700">Lager</span>
          </div>
        );
    }
  };

  return (
    <div
      id={`vehicle-card-${vehicle.id}`}
      onClick={onClick}
      className="group relative metallic-card-luminous rounded-3xl border border-slate-300/80 hover:border-slate-400 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer select-none"
    >
      {/* Top Section: Large Prominent Image */}
      <div className="relative w-full h-48 sm:h-56 bg-slate-200 overflow-hidden border-b border-slate-300/70">
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={brandAndModel}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
            <Car className="w-14 h-14 mb-2 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Kein Bild hinterlegt</span>
          </div>
        )}

        {/* Top-Left: Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          {getStatusBadge()}
        </div>

        {/* Top-Right: Tax Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black text-slate-800 border border-slate-300/80 shadow-xs">
            {vehicle.taxType === 'diff_25a' ? '§ 25a Differenz' : '19% MwSt.'}
          </span>
        </div>

        {/* Bottom subtle gradient on image */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
      </div>

      {/* Middle Section: Vehicle Details */}
      <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        
        {/* Title and Price */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {brandAndModel}
            </h3>
          </div>
          
          {/* Selling Price Display */}
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-slate-500">VK:</span>
            <span className="text-lg sm:text-xl font-black font-mono text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl metallic-inner-subbox border border-slate-300/60 text-xs">
          {/* EZ */}
          <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs font-medium">EZ {formattedEz}</span>
          </div>

          {/* Mileage */}
          <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
            <Gauge className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs font-medium">{formattedKm}</span>
          </div>

          {/* Fuel / Power */}
          <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
            {vehicle.fuelType ? (
              <>
                <Fuel className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs capitalize font-medium">{vehicle.fuelType}</span>
              </>
            ) : powerInfo ? (
              <>
                <Zap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs font-medium">{powerInfo}</span>
              </>
            ) : (
              <>
                <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs font-medium">{vehicle.color || 'Pkw'}</span>
              </>
            )}
          </div>

          {/* VIN */}
          <div className="flex items-center gap-1.5 text-slate-700 min-w-0" title={`FIN: ${formattedVin}`}>
            <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-mono text-[10px] sm:text-[11px] truncate font-medium">{formattedVin}</span>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="pt-2">
          <button
            type="button"
            id={`btn-send-operations-veh-${vehicle.id}`}
            onClick={onSendToOperations}
            className="w-full min-h-[44px] px-4 py-2.5 metallic-btn-primary rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>In den Hub übernehmen</span>
          </button>
        </div>

      </div>
    </div>
  );
};
