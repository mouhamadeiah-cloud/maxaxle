import React from 'react';
import { 
  Building2, 
  User, 
  Car,
  Sparkles, 
  Printer, 
  X,
  Euro
} from 'lucide-react';
import { Customer, MerchantSettings, OperationVehicleItem } from '../../types';

export interface KaufvertragPartyState {
  isDealer: boolean;
  customer: Customer | null;
}

export interface KaufvertragCardStackProps {
  vehicle: OperationVehicleItem | null;
  price: number;
  buyerState: KaufvertragPartyState;
  sellerState: KaufvertragPartyState;
  merchantSettings: MerchantSettings;
  onOpenVehicleDrawer: () => void;
  onChangePrice: (price: number) => void;
  onSelectBuyerDealer: () => void;
  onOpenBuyerCustomerDrawer: () => void;
  onRemoveBuyerCustomer: () => void;
  onSelectSellerDealer: () => void;
  onOpenSellerCustomerDrawer: () => void;
  onRemoveSellerCustomer: () => void;
  onOpenPreview: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const KaufvertragCardStack: React.FC<KaufvertragCardStackProps> = ({
  vehicle,
  price,
  buyerState,
  sellerState,
  merchantSettings,
  onOpenVehicleDrawer,
  onChangePrice,
  onSelectBuyerDealer,
  onOpenBuyerCustomerDrawer,
  onRemoveBuyerCustomer,
  onSelectSellerDealer,
  onOpenSellerCustomerDrawer,
  onRemoveSellerCustomer,
  onOpenPreview,
  onSave,
  isSaving
}) => {
  return (
    <div id="kaufvertrag-workspace-cards" className="flex flex-col space-y-4 z-10 w-full animate-in fade-in duration-300">
      
      {/* ======================================================================= */}
      {/* CARD 1: FAHRZEUG & PREIS (VEHICLE + DIRECT EDITABLE PRICE INPUT)       */}
      {/* ======================================================================= */}
      <div 
        id="card-kv-fahrzeug-preis"
        className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative z-30"
      >
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Fahrzeug & Kaufpreis</h4>
          </div>
          {vehicle?.brand && (
            <button
              type="button"
              id="btn-kv-change-vehicle"
              onClick={onOpenVehicleDrawer}
              className="text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#032318] border border-emerald-500/30 cursor-pointer transition hover:border-emerald-400"
            >
              Fahrzeug ändern
            </button>
          )}
        </div>

        {vehicle?.brand ? (
          <div className="space-y-3">
            {/* Vehicle Info Box */}
            <div className="p-3.5 rounded-xl bg-[#01140e] border border-emerald-500/30 text-xs">
              <div className="font-bold text-white text-sm">
                {vehicle.brand} {vehicle.model} {vehicle.variant || ''}
              </div>
              <div className="text-emerald-200/70 text-[11px] font-mono mt-0.5">
                VIN: {vehicle.vin || 'Keine VIN'} • {vehicle.mileage?.toLocaleString('de-DE')} km {vehicle.firstRegistration ? `• EZ: ${vehicle.firstRegistration}` : ''}
              </div>
            </div>

            {/* Integrated Editable Price Field */}
            <div className="p-3 rounded-xl bg-[#01140e]/90 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Euro className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vereinbarter Kaufpreis (€)</span>
                </label>
                <span className="text-[10px] font-medium text-emerald-300/70">
                  Aus Bestandsdaten geladen • Jederzeit anpassbar
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="input-kv-price"
                  value={price || ''}
                  onChange={(e) => onChangePrice(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full pl-4 pr-12 py-2.5 bg-[#021d15] border border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 rounded-xl text-white font-mono text-base font-black outline-none transition"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm pointer-events-none">
                  €
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-200/70 pt-0.5">
                <span>Betrag formatiert:</span>
                <span className="font-mono font-bold text-amber-300">
                  {price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              id="btn-kv-select-vehicle"
              onClick={onOpenVehicleDrawer}
              className="w-full py-4 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 group"
            >
              <Car className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Fahrzeug aus Fahrzeuglager auswählen (Preis wird auto-geladen)</span>
            </button>

            {/* Editable Price Field even before choosing vehicle or for manual input */}
            <div className="p-3 rounded-xl bg-[#01140e]/60 border border-emerald-500/20 space-y-1.5">
              <label className="text-[11px] font-medium text-emerald-200/80 block">
                Manueller Kaufpreis in Euro (€)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="input-kv-price-empty"
                  value={price || ''}
                  onChange={(e) => onChangePrice(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full pl-4 pr-12 py-2.5 bg-[#021d15] border border-emerald-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 rounded-xl text-white font-mono text-base font-bold outline-none transition"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm pointer-events-none">
                  €
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* CARD 2: KÄUFER (BUYER SELECTION)                                       */}
      {/* ======================================================================= */}
      <div 
        id="card-kv-kaeufer"
        className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative z-25"
      >
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Käufer</h4>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-kv-buyer-dealer"
              onClick={onSelectBuyerDealer}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                buyerState.isDealer
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                  : 'bg-[#032318] text-emerald-300 hover:text-white border-emerald-500/30 hover:border-emerald-400'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Händlerdaten laden</span>
            </button>
            <button
              type="button"
              id="btn-kv-buyer-customer"
              onClick={onOpenBuyerCustomerDrawer}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                !buyerState.isDealer && buyerState.customer
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs'
                  : 'bg-[#032318] text-emerald-300 hover:text-white border-emerald-500/30 hover:border-emerald-400'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Aus Kundenliste</span>
            </button>
          </div>
        </div>

        {/* Selected Buyer Details View */}
        {buyerState.isDealer ? (
          <div className="p-3.5 rounded-xl bg-[#01140e] border border-amber-500/40 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{merchantSettings.companyName || 'MaxFleet Autohandelsgruppe'} (Händler/Eigenbestand)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Gewerblicher Ankäufer
              </span>
            </div>
            <div className="text-emerald-200/80 text-[11px]">
              {merchantSettings.street}, {merchantSettings.postalCode} {merchantSettings.city} • USt-IdNr: {merchantSettings.vatId || 'DE123456789'}
            </div>
          </div>
        ) : buyerState.customer ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#01140e] border border-emerald-500/30 text-xs">
            <div>
              <div className="font-bold text-white text-sm">
                {buyerState.customer.name || buyerState.customer.companyName}
              </div>
              <div className="text-emerald-200/70 text-[11px] mt-0.5">
                {buyerState.customer.street || 'Keine Adresse'}, {buyerState.customer.postalCode || buyerState.customer.zip || ''} {buyerState.customer.city || ''}
              </div>
              {(buyerState.customer.phone || buyerState.customer.email) && (
                <div className="text-emerald-300/80 text-[11px] mt-0.5">
                  Kontakt: {buyerState.customer.phone || buyerState.customer.email}
                </div>
              )}
            </div>
            <button
              type="button"
              id="btn-kv-remove-buyer"
              onClick={onRemoveBuyerCustomer}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#032318] cursor-pointer transition"
              title="Käufer entfernen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-kv-select-buyer-cust"
              onClick={onOpenBuyerCustomerDrawer}
              className="py-3 px-3 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 group"
            >
              <User className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Aus Kundenliste wählen</span>
            </button>
            <button
              type="button"
              id="btn-kv-select-buyer-dlr"
              onClick={onSelectBuyerDealer}
              className="py-3 px-3 rounded-xl border border-dashed border-amber-500/40 hover:border-amber-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-amber-300 flex items-center justify-center gap-2 group"
            >
              <Building2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Händler als Käufer setzen</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* CARD 3: VERKÄUFER (SELLER SELECTION)                                    */}
      {/* ======================================================================= */}
      <div 
        id="card-kv-verkaeufer"
        className="p-4 sm:p-5 rounded-2xl bg-[#021d15]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/40 transition shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 relative z-20"
      >
        <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">Verkäufer</h4>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-kv-seller-dealer"
              onClick={onSelectSellerDealer}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                sellerState.isDealer
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                  : 'bg-[#032318] text-emerald-300 hover:text-white border-emerald-500/30 hover:border-emerald-400'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Händlerdaten laden</span>
            </button>
            <button
              type="button"
              id="btn-kv-seller-customer"
              onClick={onOpenSellerCustomerDrawer}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                !sellerState.isDealer && sellerState.customer
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs'
                  : 'bg-[#032318] text-emerald-300 hover:text-white border-emerald-500/30 hover:border-emerald-400'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Aus Kundenliste</span>
            </button>
          </div>
        </div>

        {/* Selected Seller Details View */}
        {sellerState.isDealer ? (
          <div className="p-3.5 rounded-xl bg-[#01140e] border border-amber-500/40 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{merchantSettings.companyName || 'MaxFleet Autohandelsgruppe'} (Händler/Verkäufer)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Gewerblicher Verkäufer
              </span>
            </div>
            <div className="text-emerald-200/80 text-[11px]">
              {merchantSettings.street}, {merchantSettings.postalCode} {merchantSettings.city} • USt-IdNr: {merchantSettings.vatId || 'DE123456789'}
            </div>
          </div>
        ) : sellerState.customer ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#01140e] border border-emerald-500/30 text-xs">
            <div>
              <div className="font-bold text-white text-sm">
                {sellerState.customer.name || sellerState.customer.companyName}
              </div>
              <div className="text-emerald-200/70 text-[11px] mt-0.5">
                {sellerState.customer.street || 'Keine Adresse'}, {sellerState.customer.postalCode || sellerState.customer.zip || ''} {sellerState.customer.city || ''}
              </div>
              {(sellerState.customer.phone || sellerState.customer.email) && (
                <div className="text-emerald-300/80 text-[11px] mt-0.5">
                  Kontakt: {sellerState.customer.phone || sellerState.customer.email}
                </div>
              )}
            </div>
            <button
              type="button"
              id="btn-kv-remove-seller"
              onClick={onRemoveSellerCustomer}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#032318] cursor-pointer transition"
              title="Verkäufer entfernen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-kv-select-seller-cust"
              onClick={onOpenSellerCustomerDrawer}
              className="py-3 px-3 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 group"
            >
              <User className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Aus Kundenliste wählen</span>
            </button>
            <button
              type="button"
              id="btn-kv-select-seller-dlr"
              onClick={onSelectSellerDealer}
              className="py-3 px-3 rounded-xl border border-dashed border-amber-500/40 hover:border-amber-400 bg-[#01140e]/60 hover:bg-[#032318] text-center cursor-pointer transition text-xs font-bold text-amber-300 flex items-center justify-center gap-2 group"
            >
              <Building2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Händler als Verkäufer setzen</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* BOTTOM ACTION & LIVE PREVIEW BAR                                        */}
      {/* ======================================================================= */}
      <div 
        id="card-kv-actions"
        className="flex items-center justify-end gap-3 pt-2"
      >
        <button
          type="button"
          id="btn-kv-save-and-share"
          onClick={onSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_25px_rgba(245,197,24,0.45)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Synchronisiere & erstelle...' : 'Kaufvertrag erstellen & teilen'}</span>
        </button>
      </div>

    </div>
  );
};
