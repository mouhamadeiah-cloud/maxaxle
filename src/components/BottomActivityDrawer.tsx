import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Receipt, 
  Clock, 
  X, 
  ArrowUpRight,
  Car,
  Wallet
} from 'lucide-react';
import { Invoice, Vehicle, CashTransaction, NavTab } from '../types';

interface BottomActivityDrawerProps {
  invoices: Invoice[];
  vehicles: Vehicle[];
  transactions: CashTransaction[];
  onNavigateTab: (tab: NavTab) => void;
  onOpenVehicle?: (vehicle: Vehicle) => void;
}

interface ActivityCard {
  id: string;
  type: 'invoice' | 'transaction' | 'vehicle' | 'alert';
  title: string;
  subtitle: string;
  timestamp: string;
  amount?: number;
  amountFormatted?: string;
  isAlert?: boolean;
  statusBadge: {
    label: string;
    color: string;
  };
  actionLabel: string;
  targetTab: NavTab;
  payload?: any;
}

export const BottomActivityDrawer: React.FC<BottomActivityDrawerProps> = ({
  invoices,
  vehicles,
  transactions,
  onNavigateTab,
  onOpenVehicle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchStartY = useRef<number | null>(null);
  const [maxAiX, setMaxAiX] = useState<string>('50%');

  // Track the exact bounding box center-x of the MAX AI button for perfect vertical alignment
  useEffect(() => {
    const updatePosition = () => {
      const el = document.getElementById('centerpiece-max-ai-hub');
      if (el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const xPos = `${centerX}px`;
        setMaxAiX(xPos);
        document.documentElement.style.setProperty('--max-ai-x', xPos);
      } else {
        setMaxAiX('50%');
        document.documentElement.style.setProperty('--max-ai-x', '50%');
      }
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    const interval = setInterval(updatePosition, 300);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearInterval(interval);
    };
  }, []);

  // Derive the last 5 recent activities
  const recentActivities: ActivityCard[] = React.useMemo(() => {
    const list: ActivityCard[] = [];

    // 1. Invoices
    (invoices || []).slice(0, 3).forEach((inv) => {
      const isOverdue = inv.status === 'offen' || inv.status === 'teilbezahlt';
      list.push({
        id: `act-inv-${inv.id}`,
        type: 'invoice',
        title: `Rechnung #${inv.invoiceNumber}`,
        subtitle: `${inv.customerName} • ${inv.items?.[0]?.description || 'Fahrzeugverkauf'}`,
        timestamp: inv.date || 'Heute',
        amount: inv.amountGross,
        amountFormatted: `${inv.amountGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`,
        isAlert: isOverdue,
        statusBadge: {
          label: inv.status === 'bezahlt' ? 'Bezahlt' : inv.status === 'storniert' ? 'Storno' : 'Offen',
          color: inv.status === 'bezahlt' ? 'bg-slate-700/80 text-emerald-300 border-emerald-500/40' : inv.status === 'storniert' ? 'bg-slate-800 text-slate-400 border-slate-600' : 'bg-slate-800 text-rose-300 border-rose-500/40'
        },
        actionLabel: 'Beleg prüfen',
        targetTab: 'rechnungen',
        payload: inv
      });
    });

    // 2. Cash Transactions
    (transactions || []).slice(0, 2).forEach((tx) => {
      const isEinnahme = tx.type === 'einnahme';
      list.push({
        id: `act-tx-${tx.id}`,
        type: 'transaction',
        title: tx.category || (isEinnahme ? 'Kasseneingang' : 'Betriebsausgabe'),
        subtitle: tx.description || 'Kassenbuch Buchung',
        timestamp: tx.timestamp || 'Heute',
        amount: tx.amount,
        amountFormatted: `${isEinnahme ? '+' : '-'}${tx.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`,
        isAlert: false,
        statusBadge: {
          label: tx.type === 'einnahme' ? 'Einzahlung' : 'Ausgabe',
          color: tx.type === 'einnahme' ? 'bg-slate-700/80 text-emerald-300 border-emerald-500/40' : 'bg-slate-700/80 text-slate-300 border-slate-500/40'
        },
        actionLabel: 'Kassenbuch öffnen',
        targetTab: 'finanzen',
        payload: tx
      });
    });

    // 3. Vehicles
    (vehicles || []).slice(0, 2).forEach((v) => {
      list.push({
        id: `act-veh-${v.id}`,
        type: 'vehicle',
        title: `${v.brand} ${v.model}`,
        subtitle: `FIN: ${v.vin.slice(-6)} • Bestand seit ${v.daysInStock || 0} Tagen`,
        timestamp: 'Lagerzugang',
        amount: v.sellingPrice,
        amountFormatted: `${v.sellingPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`,
        isAlert: false,
        statusBadge: {
          label: v.status === 'verfuegbar' ? 'Verfügbar' : 'Reserviert',
          color: 'bg-slate-700/80 text-blue-300 border-blue-500/40'
        },
        actionLabel: 'Fahrzeug öffnen',
        targetTab: 'lager',
        payload: v
      });
    });

    return list.slice(0, 5);
  }, [invoices, transactions, vehicles]);

  // Touch Swipe handlers with live drag
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartY.current;

    if (isOpen) {
      if (diffY > 0) {
        setDragOffsetY(diffY);
      }
    } else {
      if (diffY < -30) {
        setIsOpen(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null) return;
    
    if (isOpen) {
      if (dragOffsetY > 60) {
        setIsOpen(false);
      }
      setDragOffsetY(0);
    }
    
    setIsDragging(false);
    touchStartY.current = null;
  };

  const handleCardClick = (card: ActivityCard) => {
    if (card.type === 'vehicle' && onOpenVehicle && card.payload) {
      onOpenVehicle(card.payload);
    }
    onNavigateTab(card.targetTab);
    setIsOpen(false);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FIXED BOTTOM DOME TRIGGER (3D MINTED SEMI-CIRCLE WITH PULSATING FLASH)   */}
      {/* ========================================================================= */}
      <button
        id="bottom-activity-drawer-handle"
        type="button"
        onClick={() => {
          setDragOffsetY(0);
          setIsOpen(!isOpen);
        }}
        aria-label={isOpen ? 'Aktivitäten-Leiste schließen (Klicken oder nach unten wischen)' : 'Aktuelle Vorgänge & Belege öffnen (Klicken oder nach oben wischen)'}
        title={isOpen ? 'Schließen (Klicken oder nach unten wischen)' : 'Aktuelle Vorgänge & Belege anzeigen'}
        style={{ left: maxAiX }}
        className="fixed bottom-0 z-50 group pointer-events-auto w-16 sm:w-20 h-8 sm:h-10 rounded-t-full rounded-b-none m-0 mb-0 p-0 pb-0 hub-footer-dome flex items-center justify-center transition-transform duration-300 cursor-pointer animate-dome-flash select-none"
      >
        {/* Inner Recessed Concentric Dome Groove */}
        <div className="absolute inset-x-2 top-1.5 bottom-0 rounded-t-full border-t border-x border-white/80 pointer-events-none" />

        {/* Deeply Engraved Upward Vector Arrow */}
        <div className="relative z-10 flex items-center justify-center pb-0.5 sm:pb-1">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.8] hub-engraved-icon transition-transform group-hover:translate-y-0.5" />
          ) : (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.8] hub-engraved-icon transition-transform group-hover:-translate-y-0.5" />
          )}
        </div>
      </button>

      {/* ========================================================================= */}
      {/* 2. SMOOTH 0.45s METALLIC PULL-UP DRAWER                                   */}
      {/* ========================================================================= */}
      <div 
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity duration-400 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div 
        id="bottom-activity-drawer-body"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isOpen 
            ? `translate3d(0, ${dragOffsetY}px, 0)` 
            : 'translate3d(0, 105%, 0)',
          transition: isDragging 
            ? 'none' 
            : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
          opacity: isOpen ? (dragOffsetY > 0 ? Math.max(0.4, 1 - dragOffsetY / 300) : 1) : 0
        }}
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-4xl mx-auto metallic-modal-container rounded-t-3xl p-4 sm:p-6 text-slate-900 max-h-[80vh] flex flex-col will-change-transform ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Drawer Top Handle Indicator */}
        <div 
          onClick={() => setIsOpen(false)}
          className="flex flex-col items-center pb-3 border-b border-white/60 cursor-pointer group"
          title="Klicken oder nach unten wischen zum Schließen"
        >
          <div className="w-14 h-1.5 rounded-full bg-slate-400/80 group-hover:bg-slate-300 transition-colors mb-3 shadow-inner" />
          
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full metallic-node flex items-center justify-center font-bold">
                <Clock className="w-4 h-4 metallic-debossed-icon" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 hub-engraved-text">
                  Letzte 5 Vorgänge & Transaktionen
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Tippen Sie auf einen Beleg für direkte Prüfung & Details
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                aria-label="Aktivitäten schließen"
                className="p-1.5 px-3 rounded-full metallic-btn-secondary flex items-center gap-1 text-xs font-bold transition cursor-pointer"
              >
                <ChevronDown className="w-4 h-4 metallic-debossed-icon" />
                <span className="hidden sm:inline">Schließen</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                aria-label="Schließen"
                className="w-8 h-8 rounded-full metallic-btn-secondary flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4 metallic-debossed-icon" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable List of 5 Recent Activities */}
        <div className="overflow-y-auto py-3 space-y-2.5 max-h-[60vh] pr-1">
          {recentActivities.map((act) => (
            <div
              key={act.id}
              onClick={() => handleCardClick(act)}
              className="p-3.5 rounded-2xl metallic-card hover:scale-[1.01] transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl metallic-node flex items-center justify-center shrink-0 relative">
                  {act.type === 'vehicle' ? (
                    <Car className="w-5 h-5 metallic-debossed-icon" />
                  ) : act.type === 'transaction' ? (
                    <Wallet className="w-5 h-5 metallic-debossed-icon" />
                  ) : (
                    <Receipt className="w-5 h-5 metallic-debossed-icon" />
                  )}
                  {act.isAlert && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900 group-hover:text-slate-950 transition-colors">
                      {act.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${act.statusBadge.color}`}>
                      {act.statusBadge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                    {act.subtitle}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {act.timestamp}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/60">
                {act.amountFormatted && (
                  <div className="text-right">
                    <div className="font-mono font-black text-sm text-slate-900">
                      {act.amountFormatted}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl metallic-btn-primary font-black text-xs flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
                >
                  <span>{act.actionLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
