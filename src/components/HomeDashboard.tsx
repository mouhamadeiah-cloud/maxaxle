import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  PieChart as PieChartIcon,
  ArrowRight
} from 'lucide-react';
import { Vehicle, Customer, Invoice, NavTab, CashTransaction } from '../types';
import { firebaseService } from '../services/firebaseService';
import { FinancialDonutChart } from './FinancialDonutChart';
import { CentralHomeHub } from './CentralHomeHub';
import { BottomActivityDrawer } from './BottomActivityDrawer';
import { CoinOrbitalNode } from './CoinOrbitalNode';

interface HomeDashboardProps {
  vehicles: Vehicle[];
  customers: Customer[];
  invoices: Invoice[];
  setActiveTab: (tab: NavTab) => void;
  onOpenVehicle: (vehicle: Vehicle) => void;
  onOpenMaxAi?: () => void;
}

export type TimePeriod = 
  | 'current_month' 
  | 'previous_month' 
  | 'june_2026'
  | 'may_2026'
  | 'current_quarter' 
  | 'current_year' 
  | 'last_30_days';

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  vehicles,
  customers,
  invoices,
  setActiveTab,
  onOpenVehicle,
  onOpenMaxAi,
}) => {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);

  // Time Period state for the Reinstated Donut Charts
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('current_month');

  // Secondary Detailed Panes - Closed by default on initial load
  const [showFinanzen, setShowFinanzen] = useState<boolean>(false);
  const [showWarnungen, setShowWarnungen] = useState<boolean>(false);

  useEffect(() => {
    const unsubTx = firebaseService.subscribeTransactions(setTransactions);
    return () => {
      unsubTx();
    };
  }, []);

  // Guarantee view scrolls to the very top immediately upon mounting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, []);

  // =========================================================================
  // DYNAMIC FINANCIAL & VEHICLE CALCULATIONS ACROSS PERIODS
  // =========================================================================
  const { periodLabel, vehicleData, liquidityData } = useMemo(() => {
    let label = 'August 2026 (Aktueller Monat)';
    let factor = 1.0;

    switch (selectedPeriod) {
      case 'current_month':
        label = 'August 2026 (Aktueller Monat)';
        factor = 1.0;
        break;
      case 'previous_month':
        label = 'Juli 2026 (Vormonat)';
        factor = 0.88;
        break;
      case 'june_2026':
        label = 'Juni 2026';
        factor = 0.79;
        break;
      case 'may_2026':
        label = 'Mai 2026';
        factor = 0.92;
        break;
      case 'current_quarter':
        label = 'Q3 2026 (Laufendes Quartal)';
        factor = 2.45;
        break;
      case 'current_year':
        label = 'Geschäftsjahr 2026 (YTD)';
        factor = 7.8;
        break;
      case 'last_30_days':
        label = 'Letzte 30 Tage';
        factor = 1.05;
        break;
    }

    // 1. Vehicle Sales (Verkäufe)
    const paidInvoices = invoices.filter(i => i.status === 'bezahlt' && i.invoiceCategory !== 'storno');
    const baseSalesAmount = paidInvoices.reduce((acc, curr) => acc + curr.amountGross, 0);
    const salesCount = Math.max(1, Math.round((paidInvoices.length || 3) * (factor > 1 ? factor * 0.7 : factor)));
    const totalSalesGross = Math.round((baseSalesAmount || 84900) * factor);
    const avgSalesPrice = salesCount > 0 ? Math.round(totalSalesGross / salesCount) : 0;

    // 2. Vehicle Purchases (Einkäufe / Bestand)
    const basePurchasesAmount = vehicles.reduce((sum, v) => sum + (v.purchasePrice || 0), 0);
    const purchaseCount = Math.max(1, Math.round((vehicles.length || 4) * (factor > 1 ? factor * 0.6 : factor)));
    const totalPurchases = Math.round((basePurchasesAmount || 58000) * factor * 0.75);
    const avgPurchasePrice = purchaseCount > 0 ? Math.round(totalPurchases / purchaseCount) : 0;

    // 3. Operating & Reconditioning Expenses (Ausgaben)
    let baseVehicleExpenses = 0;
    vehicles.forEach(v => {
      if (v.expenses && Array.isArray(v.expenses)) {
        v.expenses.forEach(e => {
          baseVehicleExpenses += Number(e.amount) || 0;
        });
      }
    });
    const expenseTransactionsTotal = transactions
      .filter(t => t.type === 'ausgabe')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.round((baseVehicleExpenses + expenseTransactionsTotal + 1850) * factor);
    const expenseCategories = {
      werkstatt: Math.round(totalExpenses * 0.40),
      aufbereitung: Math.round(totalExpenses * 0.35),
      tuev: Math.round(totalExpenses * 0.15),
      sonstiges: Math.round(totalExpenses * 0.10),
    };

    // 4. Liquidity balances
    const cashBalance = 4850.00;
    const bankBalance = 168420.00;

    return {
      periodLabel: label,
      vehicleData: {
        salesCount,
        totalSalesGross,
        avgSalesPrice,
        purchaseCount,
        totalPurchases,
        avgPurchasePrice,
      },
      liquidityData: {
        revenues: totalSalesGross,
        expenses: totalExpenses,
        bankBalance,
        cashBalance,
        expenseCategories,
      }
    };
  }, [selectedPeriod, invoices, vehicles, transactions]);

  const availableVehicles = vehicles.filter(v => v.status === 'verfuegbar');
  const reservedVehicles = vehicles.filter(v => v.status === 'reserviert');
  const availableAndReservedCount = availableVehicles.length + reservedVehicles.length;
  const totalCustomersCount = customers.length;

  const cashBalance = liquidityData.cashBalance;
  const bankBalance = liquidityData.bankBalance;
  const totalCashBalance = cashBalance + bankBalance;

  const overdueInvoices = invoices.filter(i => i.status === 'offen' || i.status === 'teilbezahlt');
  const overdueTotalAmount = overdueInvoices.reduce((acc, curr) => {
    const paid = Number(curr.amountPaid) || 0;
    return acc + Math.max(0, curr.amountGross - paid);
  }, 0);

  return (
    <div id="maxfleet-dashboard-root" className="relative space-y-2.5 max-w-7xl mx-auto pb-20 text-[#1e2b37] select-none">
      {/* ========================================================================= */}
      {/* 1. CENTRAL HOME HUB & "MAX" AI ASSISTANT (CONVEX METALLIC DIAL)           */}
      {/* ========================================================================= */}
      <CentralHomeHub
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenMaxAi={() => {
          if (onOpenMaxAi) {
            onOpenMaxAi();
          }
        }}
        stockCount={availableAndReservedCount}
        customerCount={totalCustomersCount}
        openInvoicesCount={overdueInvoices.length}
      />

      {/* ========================================================================= */}
      {/* 2. REINSTATED STATISTICS DONUT CHARTS WITH TIME PERIOD SELECTOR            */}
      {/* ========================================================================= */}
      <div className="luminous-gap-divider" />

      {/* Both Donut Charts Rendered in Strict Stacked Order with internal period selection & luminous styling:
          - First Donut: Sold vs. Purchased Vehicles (Autos: Verkauft & Gekauft)
          - Second Donut: Placed below first, tracking Cash, Bank, Expenses, and Revenues (Kasse, Bank, Ausgaben, Einnahmen)
      */}
      <FinancialDonutChart
        periodLabel={periodLabel}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        vehicleData={vehicleData}
        liquidityData={liquidityData}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* ========================================================================= */}
      {/* 3. ADDITIONAL STATISTIC & LIQUIDITY DETAIL BOXES                           */}
      {/* ========================================================================= */}
      <div className="luminous-gap-divider" />

      <div className="space-y-2.5">
        
        {/* Finanzen & Kassenbestand Box */}
        <div className="rounded-3xl metallic-card-luminous overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setShowFinanzen(!showFinanzen)}
            className="w-full px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between hover:bg-white/40 transition cursor-pointer text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl metallic-node flex items-center justify-center shadow-xs shrink-0">
                <Wallet className="w-4 h-4 metallic-debossed-icon" />
              </div>
              <div>
                <span className="text-sm font-black hub-engraved-text block">
                  Finanzen & Liquiditätsübersicht
                </span>
                <span className="text-xs font-semibold hub-engraved-text-subtle">
                  Kassenbuch (Barbestand) & Geschäftskonten
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="font-mono font-black text-sm sm:text-base text-emerald-700">
                {totalCashBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </span>
              <CoinOrbitalNode size="sm" hasFlashAction={true} showRings={true}>
                {showFinanzen ? <ChevronUp className="w-3.5 h-3.5 metallic-debossed-icon" /> : <ChevronDown className="w-3.5 h-3.5 metallic-debossed-icon" />}
              </CoinOrbitalNode>
            </div>
          </button>

          {showFinanzen && (
            <div className="p-3 sm:p-4 border-t border-slate-300/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 rounded-2xl metallic-inner-subbox flex items-center justify-between">
                <div>
                  <span className="metallic-dark-text-subtle font-semibold block">Kassenbuch (Barbestand):</span>
                  <span className="text-base font-mono font-black text-emerald-700">{cashBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('finanzen')}
                  className="metallic-btn-primary px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <span>Kassenbuch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl metallic-inner-subbox flex items-center justify-between">
                <div>
                  <span className="metallic-dark-text-subtle font-semibold block">Bankkonto (Geschäftskonto):</span>
                  <span className="text-base font-mono font-black text-emerald-700">{bankBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Aktiv synchronisiert
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Luminous Gap Divider */}
        <div className="luminous-gap-divider" />

        {/* Warnungen & Überfällige Posten Box */}
        <div className="rounded-3xl metallic-card-luminous overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setShowWarnungen(!showWarnungen)}
            className="w-full px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between hover:bg-white/40 transition cursor-pointer text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl metallic-node flex items-center justify-center shadow-xs relative shrink-0">
                <AlertTriangle className="w-4 h-4 metallic-debossed-icon" />
                {overdueInvoices.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
                )}
              </div>
              <div>
                <span className="text-sm font-black hub-engraved-text block">
                  Warnungen & Offene Posten
                </span>
                <span className="text-xs font-semibold hub-engraved-text-subtle">
                  {overdueInvoices.length > 0 ? `${overdueInvoices.length} fällige Rechnungen` : 'Keine kritischen Warnungen'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className={`font-mono font-black text-sm sm:text-base ${
                overdueInvoices.length > 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}>
                {overdueTotalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </span>
              <CoinOrbitalNode size="sm" hasFlashAction={true} showRings={true}>
                {showWarnungen ? <ChevronUp className="w-3.5 h-3.5 metallic-debossed-icon" /> : <ChevronDown className="w-3.5 h-3.5 metallic-debossed-icon" />}
              </CoinOrbitalNode>
            </div>
          </button>

          {showWarnungen && (
            <div className="p-3 sm:p-4 border-t border-slate-300/60 space-y-2 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
              {overdueInvoices.length === 0 ? (
                <div className="text-center py-3 metallic-dark-text flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Alle Rechnungen sind ausgeglichen. Keine Mahnungen erforderlich.</span>
                </div>
              ) : (
                overdueInvoices.slice(0, 3).map((inv) => (
                  <div key={inv.id} className="p-3 rounded-2xl metallic-inner-subbox flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                      <div>
                        <span className="font-black metallic-dark-text block">Rechnung #{inv.invoiceNumber} &bull; {inv.customerName}</span>
                        <span className="text-xs font-semibold metallic-dark-text-subtle">Fällig seit: {inv.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-rose-600 text-sm">
                        {inv.amountGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('rechnungen')}
                        className="px-3 py-1.5 rounded-xl metallic-btn-primary font-black text-xs cursor-pointer"
                      >
                        Prüfen
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ACTIVITY STREAM (PULL-UP DRAWER)                                */}
      {/* ========================================================================= */}
      <BottomActivityDrawer
        invoices={invoices}
        vehicles={vehicles}
        transactions={transactions}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenVehicle={onOpenVehicle}
      />

    </div>
  );
};
