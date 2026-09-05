import React from 'react';
import { Building, User, Send, Phone, Mail, MapPin } from 'lucide-react';
import { Customer } from '../../types';

interface KundenCardProps {
  customer: Customer;
  onClick: () => void;
  onSendToOperations: (e: React.MouseEvent) => void;
  layout?: 'row' | 'grid';
}

export const KundenCard: React.FC<KundenCardProps> = ({
  customer,
  onClick,
  onSendToOperations,
  layout = 'row'
}) => {
  const isB2B = customer.type === 'B2B';
  const displayName = isB2B
    ? (customer.companyName || customer.name)
    : customer.name;

  const addressComponents = [customer.street, customer.postalCode, customer.city].filter(Boolean);
  const formattedAddress = addressComponents.length > 0
    ? addressComponents.join(', ')
    : 'Keine Adresse hinterlegt';

  if (layout === 'row') {
    return (
      <div
        id={`customer-row-card-${customer.id}`}
        onClick={onClick}
        className="group relative metallic-card-luminous rounded-3xl p-4 sm:p-5 border border-slate-300/80 hover:border-[#1e3a5f]/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer overflow-hidden select-none active:scale-[0.99]"
      >
        {/* Left Side: Customer Representative Icon & Main Details */}
        <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 w-full sm:w-auto min-w-0">
          
          {/* Representative Type Icon */}
          <div
            title={isB2B ? 'Gewerbekunde' : 'Privatkunde'}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl metallic-node flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 border border-slate-300/80"
          >
            {isB2B ? (
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-[#0e264b] metallic-debossed-icon" />
            ) : (
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#0e264b] metallic-debossed-icon" />
            )}
          </div>

          {/* Customer Name & Sub-line Address */}
          <div className="min-w-0 flex-1 space-y-1">
            {/* Main Line: Customer Name + Type Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-[#0e264b] group-hover:text-emerald-700 transition-colors truncate">
                {displayName}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#1e3a5f]/20 bg-[#0e264b]/10 text-[#0e264b]">
                {isB2B ? 'B2B Gewerbe' : 'B2C Privat'}
              </span>
            </div>

            {/* Sub-line: Address */}
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#1e3a5f]/80 font-normal truncate">
              <MapPin className="w-3.5 h-3.5 text-[#1e3a5f] shrink-0 metallic-debossed-icon" />
              <span className="truncate">{formattedAddress}</span>
            </div>

            {/* Optional contact chips */}
            {(customer.phone || customer.email) && (
              <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-[#1e3a5f]/90 pt-0.5">
                {customer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#1e3a5f] metallic-debossed-icon" />
                    <span className="font-mono font-semibold text-[#0e264b]">{customer.phone}</span>
                  </span>
                )}
                {customer.email && (
                  <span className="hidden md:flex items-center gap-1 truncate max-w-[200px]">
                    <Mail className="w-3 h-3 text-[#1e3a5f] metallic-debossed-icon" />
                    <span className="truncate font-semibold text-[#0e264b]">{customer.email}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Action Button */}
        <div className="relative z-10 w-full sm:w-auto shrink-0 flex items-center justify-end">
          <button
            type="button"
            id={`btn-send-operations-${customer.id}`}
            onClick={onSendToOperations}
            className="w-full sm:w-auto min-h-[42px] px-4 sm:px-5 py-2.5 metallic-btn-primary text-[#091a34] rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-[#091a34] metallic-debossed-icon" />
            <span>Zu Operationen</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid Card Layout
  return (
    <div
      id={`customer-card-${customer.id}`}
      onClick={onClick}
      className="group relative metallic-card-luminous rounded-3xl p-5 sm:p-6 border border-slate-300/80 hover:border-[#1e3a5f]/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[190px] overflow-hidden select-none active:scale-[0.99]"
    >
      {/* Top Details */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2.5">
          <div
            title={isB2B ? 'Gewerbekunde' : 'Privatkunde'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl metallic-node flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 border border-slate-300/80"
          >
            {isB2B ? (
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-[#0e264b] metallic-debossed-icon" />
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#0e264b] metallic-debossed-icon" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-black text-[#0e264b] group-hover:text-emerald-700 transition-colors truncate">
              {displayName}
            </h3>
            <span className="inline-block text-[10px] font-bold text-[#1e3a5f]">
              {isB2B ? 'Gewerbekunde (B2B)' : 'Privatkunde (B2C)'}
            </span>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-[#1e3a5f]/80 font-normal line-clamp-2">
          {formattedAddress}
        </p>
      </div>

      {/* Action Button */}
      <div className="relative z-10 pt-3">
        <button
          type="button"
          id={`btn-send-operations-${customer.id}`}
          onClick={onSendToOperations}
          className="w-full min-h-[40px] py-2 px-3 metallic-btn-primary text-[#091a34] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
        >
          <Send className="w-3.5 h-3.5 text-[#091a34] metallic-debossed-icon" />
          <span>In den Hub übernehmen</span>
        </button>
      </div>
    </div>
  );
};
