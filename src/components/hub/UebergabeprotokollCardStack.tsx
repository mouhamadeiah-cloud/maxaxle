import React from 'react';
import { 
  Car, 
  User, 
  Sparkles, 
  Printer, 
  Check, 
  X 
} from 'lucide-react';
import { Customer, OperationVehicleItem } from '../../types';

export interface UebergabeprotokollCardStackProps {
  vehicle: OperationVehicleItem | null;
  customer: Customer | null;
  onOpenVehicleDrawer: () => void;
  onOpenCustomerDrawer: () => void;
  onRemoveCustomer: () => void;
  onOpenPreview: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const UebergabeprotokollCardStack: React.FC<UebergabeprotokollCardStackProps> = ({
  vehicle,
  customer,
  onOpenVehicleDrawer,
  onOpenCustomerDrawer,
  onRemoveCustomer,
  onOpenPreview,
  onSave,
  isSaving
}) => {
  return (
    <div id="uebergabeprotokoll-workspace-cards" className="flex flex-col space-y-4 z-10 w-full animate-in fade-in duration-300">
      
      {/* ======================================================================= */}
      {/* CARD 1: FAHRZEUG (VEHICLE SELECTION)                                    */}
      {/* ======================================================================= */}
      <div 
        id="card-uebergabe-fahrzeug"
        className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative z-30"
      >
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Fahrzeug</h4>
          </div>
          {vehicle?.brand && (
            <button
              type="button"
              id="btn-uebergabe-change-vehicle"
              onClick={onOpenVehicleDrawer}
              className="text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#032318] border border-emerald-500/30 cursor-pointer transition hover:border-emerald-400"
            >
              Fahrzeug ändern
            </button>
          )}
        </div>

        {vehicle?.brand ? (
          <div className="p-3.5 rounded-xl bg-[#01140e] border border-emerald-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">
                  {vehicle.brand} {vehicle.model} {vehicle.variant || ''}
                </div>
                <div className="text-emerald-200/70 text-[11px] font-mono mt-0.5">
                  VIN: {vehicle.vin || 'Keine VIN'} • {vehicle.mileage?.toLocaleString('de-DE')} km
                </div>
                {vehicle.color && (
                  <div className="text-emerald-300/80 text-[11px] mt-0.5">
                    Farbe: {vehicle.color} {vehicle.fuelType ? `• Kraftstoff: ${vehicle.fuelType}` : ''}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                <span>Bereit zur Übergabe</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            id="btn-uebergabe-select-vehicle"
            onClick={onOpenVehicleDrawer}
            className="w-full py-4 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 group"
          >
            <Car className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Fahrzeug auswählen</span>
          </button>
        )}
      </div>

      {/* ======================================================================= */}
      {/* CARD 2: KUNDE (CUSTOMER SELECTION)                                      */}
      {/* ======================================================================= */}
      <div 
        id="card-uebergabe-kunde"
        className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative z-25"
      >
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Kunde</h4>
          </div>
          {customer && (
            <button
              type="button"
              id="btn-uebergabe-change-customer"
              onClick={onOpenCustomerDrawer}
              className="text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#032318] border border-emerald-500/30 cursor-pointer transition hover:border-emerald-400"
            >
              Kunde wechseln
            </button>
          )}
        </div>

        {customer ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#01140e] border border-emerald-500/30 text-xs">
            <div>
              <div className="font-bold text-white text-sm">
                {customer.name || customer.companyName}
              </div>
              <div className="text-emerald-200/70 text-[11px] mt-0.5">
                {customer.street || 'Keine Adresse'}, {customer.postalCode || customer.zip || ''} {customer.city || ''}
              </div>
              {(customer.phone || customer.mobile || customer.email) && (
                <div className="text-emerald-300/80 text-[11px] mt-0.5">
                  Kontakt: {customer.phone || customer.mobile || customer.email}
                </div>
              )}
            </div>
            <button
              type="button"
              id="btn-uebergabe-remove-customer"
              onClick={onRemoveCustomer}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#032318] cursor-pointer transition"
              title="Kunde entfernen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            id="btn-uebergabe-select-customer"
            onClick={onOpenCustomerDrawer}
            className="w-full py-4 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 group"
          >
            <User className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Kunde auswählen</span>
          </button>
        )}
      </div>

      {/* ======================================================================= */}
      {/* BOTTOM ACTION & LIVE PREVIEW BAR                                        */}
      {/* ======================================================================= */}
      <div 
        id="card-uebergabe-actions"
        className="flex items-center justify-end gap-3 pt-2"
      >
        <button
          type="button"
          id="btn-uebergabe-save-and-share"
          onClick={onSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_25px_rgba(245,197,24,0.45)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Synchronisiere & erstelle...' : 'Übergabeprotokoll erstellen & teilen'}</span>
        </button>
      </div>

    </div>
  );
};
