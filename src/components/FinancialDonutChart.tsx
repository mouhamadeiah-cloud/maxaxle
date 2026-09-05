import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Car, 
  ShoppingCart, 
  Landmark, 
  Wallet, 
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';
import { CoinOrbitalNode } from './CoinOrbitalNode';

export type TimePeriod = 'current_month' | 'previous_month' | 'current_quarter' | 'current_year' | 'last_30_days' | 'june_2026' | 'may_2026';

export interface VehicleDonutData {
  salesCount: number;
  totalSalesGross: number;
  avgSalesPrice: number;
  purchaseCount: number;
  totalPurchases: number;
  avgPurchasePrice: number;
}

export interface LiquidityDonutData {
  revenues: number;
  expenses: number;
  bankBalance: number;
  cashBalance: number;
  expenseCategories?: {
    werkstatt: number;
    aufbereitung: number;
    tuev: number;
    sonstiges: number;
  };
}

export interface DonutChartsProps {
  periodLabel: string;
  selectedPeriod?: TimePeriod;
  onPeriodChange?: (period: TimePeriod) => void;
  vehicleData: VehicleDonutData;
  liquidityData: LiquidityDonutData;
  onNavigateTab?: (tab: 'lager' | 'rechnungen' | 'finanzen') => void;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutArc(
  x: number, 
  y: number, 
  radius: number, 
  innerRadius: number, 
  startAngle: number, 
  endAngle: number,
  isHovered: boolean
) {
  const clampedDiff = Math.min(Math.max(endAngle - startAngle, 0.1), 359.99);
  const r = isHovered ? radius + 4 : radius;
  const ir = isHovered ? Math.max(innerRadius - 2, 20) : innerRadius;

  const actualEndAngle = startAngle + clampedDiff;
  const start = polarToCartesian(x, y, r, actualEndAngle);
  const end = polarToCartesian(x, y, r, startAngle);
  const innerStart = polarToCartesian(x, y, ir, actualEndAngle);
  const innerEnd = polarToCartesian(x, y, ir, startAngle);
  const largeArcFlag = clampedDiff <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'L', innerEnd.x, innerEnd.y,
    'A', ir, ir, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    'Z',
  ].join(' ');
}

// ============================================================================
// EMBEDDED PERIOD SWITCHER TOOLBAR (INTEGRATED DIRECTLY INSIDE EACH CARD)
// ============================================================================
export const CardInternalPeriodSelector: React.FC<{
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}> = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { id: 'current_month' as TimePeriod, label: 'Aktueller Monat' },
    { id: 'previous_month' as TimePeriod, label: 'Vormonat' },
    { id: 'current_quarter' as TimePeriod, label: 'Q3 2026' },
    { id: 'current_year' as TimePeriod, label: 'Jahr 2026' },
    { id: 'last_30_days' as TimePeriod, label: '30 Tage' }
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-1.5 p-1 bg-white/70 rounded-2xl border border-slate-300/80 shadow-2xs backdrop-blur-sm">
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="w-5 h-5 rounded-full metallic-node flex items-center justify-center shrink-0">
          <Calendar className="w-3 h-3 metallic-debossed-icon" />
        </div>
        <span className="text-[10px] font-black metallic-dark-text-subtle uppercase tracking-wider hidden sm:inline">
          Zeitraum:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {periods.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPeriodChange(p.id);
            }}
            className={`px-2 py-0.5 rounded-xl text-xs font-black transition cursor-pointer ${
              selectedPeriod === p.id
                ? 'metallic-btn-primary shadow-xs'
                : 'text-[#485c6e] hover:text-[#1e2b37] hover:bg-white/90'
            }`}
          >
            {p.label}
          </button>
        ))}

        <select
          value={selectedPeriod}
          onChange={(e) => {
            e.stopPropagation();
            onPeriodChange(e.target.value as TimePeriod);
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Erweiterte Monatsauswahl"
          className="text-xs font-black metallic-dark-text bg-white/80 rounded-lg border border-slate-300 px-2 py-0.5 focus:outline-none cursor-pointer"
        >
          <option value="current_month">August 2026</option>
          <option value="previous_month">Juli 2026</option>
          <option value="june_2026">Juni 2026</option>
          <option value="may_2026">Mai 2026</option>
          <option value="current_quarter">3. Quartal 2026</option>
          <option value="current_year">Gesamtjahr 2026</option>
          <option value="last_30_days">Letzte 30 Tage</option>
        </select>
      </div>
    </div>
  );
};

// ============================================================================
// MINIATURE DONUT THUMBNAIL PREVIEW COMPONENT
// ============================================================================
export const MiniDonutThumbnail: React.FC<{
  slices: { amount: number; color: string }[];
  total: number;
  size?: number;
}> = ({ slices, total, size = 38 }) => {
  const center = size / 2;
  const radius = (size / 2) - 2;
  const innerRadius = radius * 0.54;
  const gapAngle = total > 0 && slices.length > 1 ? 4 : 0;

  let currentAngle = 0;
  const validTotal = total > 0 ? total : slices.reduce((sum, s) => sum + s.amount, 0);

  const arcs = slices.map((slice) => {
    const amount = Number(slice.amount) || 0;
    const sweep = validTotal > 0 ? (amount / validTotal) * 360 : 360 / slices.length;
    const startAngle = currentAngle + gapAngle / 2;
    const endAngle = currentAngle + sweep - gapAngle / 2;
    currentAngle += sweep;

    return {
      color: slice.color,
      path: describeDonutArc(center, center, radius, innerRadius, startAngle, endAngle, false)
    };
  });

  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible drop-shadow-xs">
        {validTotal === 0 ? (
          <circle
            cx={center}
            cy={center}
            r={(radius + innerRadius) / 2}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={radius - innerRadius}
          />
        ) : (
          arcs.map((arc, i) => (
            <path
              key={i}
              d={arc.path}
              fill={arc.color}
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="0.8"
            />
          ))
        )}
      </svg>
      <div 
        className="absolute rounded-full metallic-dial shadow-inner"
        style={{
          width: innerRadius * 1.5,
          height: innerRadius * 1.5,
          top: center - (innerRadius * 0.75),
          left: center - (innerRadius * 0.75),
        }}
      />
    </div>
  );
};

// ============================================================================
// 1. FIRST DONUT: SOLD VS. PURCHASED VEHICLES (AUTOS: VERKAUFT & GEKAUFT)
// ============================================================================
export const VehiclePerformanceDonut: React.FC<{
  data: VehicleDonutData;
  periodLabel: string;
  selectedPeriod?: TimePeriod;
  onPeriodChange?: (period: TimePeriod) => void;
  onNavigateTab?: (tab: 'lager' | 'rechnungen' | 'finanzen') => void;
}> = ({ data, periodLabel, selectedPeriod = 'current_month', onPeriodChange, onNavigateTab }) => {
  // Default to closed state on initial load
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredKey, setHoveredKey] = useState<'sales' | 'purchases' | null>(null);

  const salesAmount = Number(data.totalSalesGross) || 0;
  const purchasesAmount = Number(data.totalPurchases) || 0;
  const totalVolume = salesAmount + purchasesAmount;
  const netMargin = salesAmount - purchasesAmount;
  const marginPct = salesAmount > 0 ? (netMargin / salesAmount) * 100 : 0;
  const isNetPositive = netMargin >= 0;

  const slices = [
    {
      key: 'sales' as const,
      label: 'Autos: Verkauft',
      sublabel: `${data.salesCount} Fahrzeuge abgewickelt`,
      amount: salesAmount,
      color: '#10b981',
      hoverColor: '#34d399',
      gradientId: 'veh-sales-metallic-grad',
      icon: Car,
      count: data.salesCount,
      avgValue: data.avgSalesPrice,
      isPositive: true
    },
    {
      key: 'purchases' as const,
      label: 'Autos: Gekauft (Bestand-EK)',
      sublabel: `${data.purchaseCount} Fahrzeuge angekauft`,
      amount: purchasesAmount,
      color: '#5c7285',
      hoverColor: '#7890a8',
      gradientId: 'veh-purchases-metallic-grad',
      icon: ShoppingCart,
      count: data.purchaseCount,
      avgValue: data.avgPurchasePrice,
      isPositive: false
    }
  ];

  const miniSlices = slices.map(s => ({ amount: s.amount, color: s.color }));

  const size = 260;
  const center = size / 2;
  const radius = 110;
  const innerRadius = 72;
  const gapAngle = totalVolume > 0 ? 2 : 0;

  let currentAngle = 0;
  const arcs = slices.map((slice) => {
    const percentage = totalVolume > 0 ? (slice.amount / totalVolume) * 100 : 50;
    const sweep = totalVolume > 0 ? (slice.amount / totalVolume) * 360 : 180;
    const startAngle = currentAngle + gapAngle / 2;
    const endAngle = currentAngle + sweep - gapAngle / 2;
    currentAngle += sweep;

    return {
      slice,
      percentage,
      startAngle,
      endAngle,
      path: describeDonutArc(center, center, radius, innerRadius, startAngle, endAngle, hoveredKey === slice.key)
    };
  });

  const activeSlice = hoveredKey ? slices.find(s => s.key === hoveredKey) : null;
  const activePercentage = activeSlice && totalVolume > 0 
    ? (((Number(activeSlice.amount) || 0) / totalVolume) * 100).toFixed(1) 
    : null;

  return (
    <div 
      id="first-donut-vehicles-section" 
      className="metallic-card-luminous rounded-3xl overflow-hidden transition-all duration-300"
    >
      {/* Collapsible Header with Miniature Donut Preview & Concise Content Summary */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between hover:bg-white/40 transition cursor-pointer text-left focus:outline-none"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Miniature Graphic Preview */}
          <MiniDonutThumbnail slices={miniSlices} total={totalVolume} size={36} />

          {/* Ultra-Concise Content Summary */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-black tracking-tight hub-engraved-text">
                Autos: Gekauft & Verkauft
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black hub-minted-badge font-mono">
                {periodLabel.split(' ')[0]} &bull; {data.salesCount} Vk. / {data.purchaseCount} Ek.
              </span>
            </div>
            <span className="text-xs font-semibold hub-engraved-text-subtle truncate block mt-0.5">
              Volumen: {totalVolume.toLocaleString('de-DE', { minimumFractionDigits: 0 })} € &bull; Spanne: {isNetPositive ? '+' : ''}{netMargin.toLocaleString('de-DE', { minimumFractionDigits: 0 })} € ({marginPct.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Right Edge: Quick Metric + Discreet Small Arrow Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-2">
          <div className="hidden xs:flex flex-col items-end text-right">
            <span className={`font-mono font-black text-xs sm:text-sm ${
              isNetPositive ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {isNetPositive ? '+' : ''}{netMargin.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
            </span>
            <span className="text-[10px] font-medium metallic-dark-text-subtle">
              Handelsspanne
            </span>
          </div>

          <CoinOrbitalNode size="sm" hasFlashAction={true} showRings={true}>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 metallic-debossed-icon" /> : <ChevronDown className="w-3.5 h-3.5 metallic-debossed-icon" />}
          </CoinOrbitalNode>
        </div>
      </button>

      {/* Expanded Full Donut & Analytics Body */}
      {isOpen && (
        <div className="p-3 sm:p-4 border-t border-slate-300/60 space-y-2.5 sm:space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Integrated Internal Period Filter inside this card */}
          {onPeriodChange && (
            <CardInternalPeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={onPeriodChange}
            />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1">
            <span className="text-xs font-bold metallic-dark-text-subtle">
              Fahrzeugumsätze vs. Bestands-Einkaufsvolumen ({periodLabel})
            </span>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-black bg-white/90 border border-slate-300 shadow-2xs metallic-dark-text font-mono">
              Gesamtvolumen: {totalVolume.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
            {/* SVG Donut Chart with Center Machined Dial */}
            <div className="relative shrink-0 flex flex-col items-center justify-center">
              <div className="relative" style={{ width: size, height: size }}>
                <svg 
                  width={size} 
                  height={size} 
                  viewBox={`0 0 ${size} ${size}`}
                  className="overflow-visible drop-shadow-[0_8px_20px_rgba(45,65,85,0.2)]"
                >
                  <defs>
                    <linearGradient id="veh-sales-metallic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>

                    <linearGradient id="veh-purchases-metallic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="50%" stopColor="#5c7285" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>

                    <filter id="veh-metallic-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ffffff" floodOpacity="0.8" />
                    </filter>
                  </defs>

                  {totalVolume === 0 ? (
                    <circle
                      cx={center}
                      cy={center}
                      r={(radius + innerRadius) / 2}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth={radius - innerRadius}
                    />
                  ) : (
                    arcs.map(({ slice, path }) => {
                      const isHovered = hoveredKey === slice.key;
                      return (
                        <path
                          key={slice.key}
                          id={`veh-slice-${slice.key}`}
                          d={path}
                          fill={`url(#${slice.gradientId})`}
                          stroke="rgba(255, 255, 255, 0.95)"
                          strokeWidth="1.5"
                          className="transition-all duration-200 cursor-pointer"
                          filter={isHovered ? 'url(#veh-metallic-glow)' : undefined}
                          opacity={hoveredKey && !isHovered ? 0.45 : 1}
                          onMouseEnter={() => setHoveredKey(slice.key)}
                          onMouseLeave={() => setHoveredKey(null)}
                          onClick={() => onNavigateTab && onNavigateTab(slice.key === 'sales' ? 'rechnungen' : 'lager')}
                        />
                      );
                    })
                  )}
                </svg>

                {/* Donut Center Hole: Convex Metallic Dial Disc */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2.5 rounded-full metallic-dial shadow-inner"
                  style={{ 
                    width: innerRadius * 2, 
                    height: innerRadius * 2, 
                    top: center - innerRadius, 
                    left: center - innerRadius 
                  }}
                >
                  {activeSlice ? (
                    <div className="space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                      <span className="text-[10px] font-black uppercase tracking-wider metallic-dark-text block">
                        {activeSlice.label.split(' ')[1]}
                      </span>
                      <span className="text-sm sm:text-base font-black font-mono tracking-tight metallic-dark-text block">
                        {(Number(activeSlice.amount) || 0).toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
                      </span>
                      <span className="inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-white/90 border border-slate-300 metallic-dark-text">
                        {activePercentage}% Anteil
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-0.5 animate-in fade-in duration-200">
                      <span className="text-[9px] font-black uppercase tracking-wider metallic-dark-text-subtle block">
                        Handelsspanne
                      </span>
                      
                      <div className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                        isNetPositive ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {isNetPositive ? '+' : ''}{netMargin.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
                      </div>

                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
                          isNetPositive 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {isNetPositive ? (
                            <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5 text-rose-600" />
                          )}
                          <span>{marginPct.toFixed(1)} % Marge</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[10px] font-medium metallic-dark-text-subtle mt-1">
                Hover für Details
              </span>
            </div>

            {/* Legend Cards & Metrics */}
            <div className="flex-1 w-full space-y-2">
              {slices.map((slice) => {
                const percentage = totalVolume > 0 ? (slice.amount / totalVolume) * 100 : 0;
                const isHovered = hoveredKey === slice.key;
                const Icon = slice.icon;

                return (
                  <div
                    key={slice.key}
                    id={`veh-legend-${slice.key}`}
                    onMouseEnter={() => setHoveredKey(slice.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => onNavigateTab && onNavigateTab(slice.key === 'sales' ? 'rechnungen' : 'lager')}
                    className={`p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer metallic-inner-subbox ${
                      isHovered 
                        ? 'shadow-md translate-x-1 border-slate-400' 
                        : 'hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold shrink-0 metallic-node border border-slate-300/80 shadow-2xs"
                        >
                          <Icon className="w-4 h-4 metallic-debossed-icon" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black metallic-dark-text truncate">
                              {slice.label}
                            </span>
                            <span 
                              className="px-1.5 py-0.2 rounded-md text-[10px] font-black font-mono bg-white/90 border border-slate-300 metallic-dark-text"
                            >
                              {percentage.toFixed(1)} %
                            </span>
                          </div>
                          <p className="text-xs font-medium metallic-dark-text-subtle truncate mt-0.5">
                            {slice.sublabel} {slice.avgValue ? `• Ø ${slice.avgValue.toLocaleString('de-DE')} €` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs sm:text-sm font-black font-mono tracking-tight block ${
                          slice.isPositive ? 'text-emerald-700' : 'text-slate-800'
                        }`}>
                          {(Number(slice.amount) || 0).toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
                        </span>
                        <span className="text-[10px] font-bold metallic-dark-text-subtle">
                          {slice.count} Stk.
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Spannen-Zusammenfassung Box */}
              <div className="p-2.5 rounded-xl metallic-inner-subbox flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold metallic-dark-text">Handelsdifferenz ({periodLabel.split(' ')[0]}):</span>
                  <span className="text-[11px] metallic-dark-text-subtle hidden sm:inline">(VK-Umsatz minus EK-Bestand)</span>
                </div>
                <div className="flex items-center gap-2 font-mono font-black text-sm">
                  <span className={isNetPositive ? 'text-emerald-700' : 'text-rose-600'}>
                    {isNetPositive ? '+' : ''}{netMargin.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-black border ${
                    isNetPositive 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}>
                    {marginPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. SECOND DONUT: KASSE, BANK, AUSGABEN, EINNAHMEN
// ============================================================================
export const LiquidityPerformanceDonut: React.FC<{
  data: LiquidityDonutData;
  periodLabel: string;
  selectedPeriod?: TimePeriod;
  onPeriodChange?: (period: TimePeriod) => void;
  onNavigateTab?: (tab: 'lager' | 'rechnungen' | 'finanzen') => void;
}> = ({ data, periodLabel, selectedPeriod = 'current_month', onPeriodChange, onNavigateTab }) => {
  // Default to closed state on initial load
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredKey, setHoveredKey] = useState<'revenues' | 'expenses' | 'bank' | 'cash' | null>(null);

  const revenues = Number(data.revenues) || 0;
  const expenses = Number(data.expenses) || 0;
  const bankBalance = Number(data.bankBalance) || 0;
  const cashBalance = Number(data.cashBalance) || 0;

  const totalVolume = revenues + expenses + bankBalance + cashBalance;
  const netCashflow = revenues - expenses;
  const totalLiquidity = bankBalance + cashBalance;
  const isNetCashflowPositive = netCashflow >= 0;

  const slices = [
    {
      key: 'revenues' as const,
      label: 'Einnahmen (Umsatz)',
      sublabel: 'Geldeingänge & Rechnungen',
      amount: revenues,
      color: '#10b981',
      hoverColor: '#34d399',
      gradientId: 'fin-revenues-metallic-grad',
      icon: TrendingUp,
      isPositive: true
    },
    {
      key: 'expenses' as const,
      label: 'Ausgaben & Aufbereitung',
      sublabel: 'Werkstatt, TÜV & Betrieb',
      amount: expenses,
      color: '#ef4444',
      hoverColor: '#f87171',
      gradientId: 'fin-expenses-metallic-grad',
      icon: ArrowDownRight,
      isPositive: false
    },
    {
      key: 'bank' as const,
      label: 'Bank (Geschäftskonto)',
      sublabel: 'Verfügbares Bankguthaben',
      amount: bankBalance,
      color: '#526b80',
      hoverColor: '#6c8599',
      gradientId: 'fin-bank-metallic-grad',
      icon: Landmark,
      isPositive: true
    },
    {
      key: 'cash' as const,
      label: 'Kasse (Barbestand)',
      sublabel: 'Kassenbuch Barbestand',
      amount: cashBalance,
      color: '#8d99ae',
      hoverColor: '#a2b1c6',
      gradientId: 'fin-cash-metallic-grad',
      icon: Wallet,
      isPositive: true
    }
  ];

  const miniSlices = slices.map(s => ({ amount: s.amount, color: s.color }));

  const size = 260;
  const center = size / 2;
  const radius = 110;
  const innerRadius = 72;
  const gapAngle = totalVolume > 0 ? 1.5 : 0;

  let currentAngle = 0;
  const arcs = slices.map((slice) => {
    const percentage = totalVolume > 0 ? (slice.amount / totalVolume) * 100 : 25;
    const sweep = totalVolume > 0 ? (slice.amount / totalVolume) * 360 : 90;
    const startAngle = currentAngle + gapAngle / 2;
    const endAngle = currentAngle + sweep - gapAngle / 2;
    currentAngle += sweep;

    return {
      slice,
      percentage,
      startAngle,
      endAngle,
      path: describeDonutArc(center, center, radius, innerRadius, startAngle, endAngle, hoveredKey === slice.key)
    };
  });

  const activeSlice = hoveredKey ? slices.find(s => s.key === hoveredKey) : null;
  const activePercentage = activeSlice && totalVolume > 0 
    ? (((Number(activeSlice.amount) || 0) / totalVolume) * 100).toFixed(1) 
    : null;

  return (
    <div 
      id="second-donut-liquidity-section" 
      className="metallic-card-luminous rounded-3xl overflow-hidden transition-all duration-300"
    >
      {/* Collapsible Header with Miniature Donut Preview & Concise Content Summary */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between hover:bg-white/40 transition cursor-pointer text-left focus:outline-none"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Miniature Graphic Preview */}
          <MiniDonutThumbnail slices={miniSlices} total={totalVolume} size={36} />

          {/* Ultra-Concise Content Summary */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-black tracking-tight hub-engraved-text">
                Finanzen & Liquidität: Kasse & Bank
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black hub-minted-badge font-mono">
                {periodLabel.split(' ')[0]} &bull; {totalLiquidity.toLocaleString('de-DE', { minimumFractionDigits: 0 })} € Liquidität
              </span>
            </div>
            <span className="text-xs font-semibold hub-engraved-text-subtle truncate block mt-0.5">
              Erlöse: +{revenues.toLocaleString('de-DE', { minimumFractionDigits: 0 })} € &bull; Ausgaben: -{expenses.toLocaleString('de-DE', { minimumFractionDigits: 0 })} € &bull; Netto: {isNetCashflowPositive ? '+' : ''}{netCashflow.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
            </span>
          </div>
        </div>

        {/* Right Edge: Quick Metric + Discreet Small Arrow Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-2">
          <div className="hidden xs:flex flex-col items-end text-right">
            <span className="font-mono font-black text-xs sm:text-sm text-emerald-700">
              {totalLiquidity.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
            </span>
            <span className="text-[10px] font-medium metallic-dark-text-subtle">
              Kasse + Bank
            </span>
          </div>

          <CoinOrbitalNode size="sm" hasFlashAction={true} showRings={true}>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 metallic-debossed-icon" /> : <ChevronDown className="w-3.5 h-3.5 metallic-debossed-icon" />}
          </CoinOrbitalNode>
        </div>
      </button>

      {/* Expanded Full Donut & Analytics Body */}
      {isOpen && (
        <div className="p-3 sm:p-4 border-t border-slate-300/60 space-y-2.5 sm:space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Integrated Internal Period Filter inside this card */}
          {onPeriodChange && (
            <CardInternalPeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={onPeriodChange}
            />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1">
            <span className="text-xs font-bold metallic-dark-text-subtle">
              Kasse, Bank, Ausgaben & Einnahmen ({periodLabel})
            </span>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-black bg-white/90 border border-slate-300 shadow-2xs metallic-dark-text font-mono">
              Liquidität (Kasse+Bank): {totalLiquidity.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
            {/* SVG Donut Chart with Center Machined Dial */}
            <div className="relative shrink-0 flex flex-col items-center justify-center">
              <div className="relative" style={{ width: size, height: size }}>
                <svg 
                  width={size} 
                  height={size} 
                  viewBox={`0 0 ${size} ${size}`}
                  className="overflow-visible drop-shadow-[0_8px_20px_rgba(45,65,85,0.2)]"
                >
                  <defs>
                    <linearGradient id="fin-revenues-metallic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>

                    <linearGradient id="fin-expenses-metallic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="50%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>

                    <linearGradient id="fin-bank-metallic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7e9bb5" />
                      <stop offset="50%" stopColor="#526b80" />
                      <stop offset="100%" stopColor="#2c3e50" />
                    </linearGradient>

                    <linearGradient id="fin-cash-metallic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#cbd5e1" />
                      <stop offset="50%" stopColor="#8d99ae" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>

                    <filter id="fin-metallic-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ffffff" floodOpacity="0.8" />
                    </filter>
                  </defs>

                  {totalVolume === 0 ? (
                    <circle
                      cx={center}
                      cy={center}
                      r={(radius + innerRadius) / 2}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth={radius - innerRadius}
                    />
                  ) : (
                    arcs.map(({ slice, path }) => {
                      const isHovered = hoveredKey === slice.key;
                      return (
                        <path
                          key={slice.key}
                          id={`fin-slice-${slice.key}`}
                          d={path}
                          fill={`url(#${slice.gradientId})`}
                          stroke="rgba(255, 255, 255, 0.95)"
                          strokeWidth="1.5"
                          className="transition-all duration-200 cursor-pointer"
                          filter={isHovered ? 'url(#fin-metallic-glow)' : undefined}
                          opacity={hoveredKey && !isHovered ? 0.45 : 1}
                          onMouseEnter={() => setHoveredKey(slice.key)}
                          onMouseLeave={() => setHoveredKey(null)}
                          onClick={() => {
                            if (!onNavigateTab) return;
                            if (slice.key === 'revenues') onNavigateTab('rechnungen');
                            else if (slice.key === 'expenses' || slice.key === 'cash' || slice.key === 'bank') onNavigateTab('finanzen');
                          }}
                        />
                      );
                    })
                  )}
                </svg>

                {/* Donut Center Hole: Convex Metallic Dial Disc */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2 rounded-full metallic-dial shadow-inner"
                  style={{ 
                    width: innerRadius * 2, 
                    height: innerRadius * 2, 
                    top: center - innerRadius, 
                    left: center - innerRadius 
                  }}
                >
                  {activeSlice ? (
                    <div className="space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                      <span className="text-[10px] font-black uppercase tracking-wider metallic-dark-text block truncate px-1">
                        {activeSlice.label.split(' ')[0]}
                      </span>
                      <span className="text-sm sm:text-base font-black font-mono tracking-tight metallic-dark-text block">
                        {(Number(activeSlice.amount) || 0).toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
                      </span>
                      <span className="inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-white/90 border border-slate-300 metallic-dark-text">
                        {activePercentage}% Anteil
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-0.5 animate-in fade-in duration-200">
                      <span className="text-[9px] font-black uppercase tracking-wider metallic-dark-text-subtle block">
                        Netto-Cashflow
                      </span>
                      
                      <div className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                        isNetCashflowPositive ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {isNetCashflowPositive ? '+' : ''}{netCashflow.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
                      </div>

                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
                          isNetCashflowPositive 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {isNetCashflowPositive ? (
                            <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5 text-rose-600" />
                          )}
                          <span>Saldo</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[10px] font-medium metallic-dark-text-subtle mt-1">
                Hover für Details
              </span>
            </div>

            {/* Legend Cards & Breakdown */}
            <div className="flex-1 w-full space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {slices.map((slice) => {
                  const percentage = totalVolume > 0 ? (slice.amount / totalVolume) * 100 : 0;
                  const isHovered = hoveredKey === slice.key;
                  const Icon = slice.icon;

                  return (
                    <div
                      key={slice.key}
                      id={`fin-legend-${slice.key}`}
                      onMouseEnter={() => setHoveredKey(slice.key)}
                      onMouseLeave={() => setHoveredKey(null)}
                      onClick={() => {
                        if (!onNavigateTab) return;
                        if (slice.key === 'revenues') onNavigateTab('rechnungen');
                        else onNavigateTab('finanzen');
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer metallic-inner-subbox ${
                        isHovered 
                          ? 'shadow-md translate-y-[-2px] border-slate-400' 
                          : 'hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div 
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold shrink-0 metallic-node border border-slate-300/80 shadow-2xs"
                          >
                            <Icon className="w-3.5 h-3.5 metallic-debossed-icon" />
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs font-black metallic-dark-text block truncate">
                              {slice.label}
                            </span>
                            <span className="text-[10px] font-semibold metallic-dark-text-subtle block truncate">
                              {slice.sublabel}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs sm:text-sm font-black font-mono tracking-tight block ${
                            slice.key === 'revenues'
                              ? 'text-emerald-700'
                              : slice.key === 'expenses'
                              ? 'text-rose-600'
                              : 'metallic-dark-text'
                          }`}>
                            {slice.key === 'expenses' ? '-' : ''}{(Number(slice.amount) || 0).toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
                          </span>
                          <span className="text-[9.5px] font-black font-mono bg-white/90 px-1 rounded border border-slate-300 metallic-dark-text inline-block">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Sub-breakdown for Expenses */}
                      {slice.key === 'expenses' && data.expenseCategories && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-300/60 grid grid-cols-2 gap-1 text-[9.5px] metallic-dark-text-subtle">
                          <div>Werkstatt: <strong className="metallic-dark-text font-mono">{(Number(data.expenseCategories.werkstatt) || 0).toLocaleString('de-DE')} €</strong></div>
                          <div>Aufbereitung: <strong className="metallic-dark-text font-mono">{(Number(data.expenseCategories.aufbereitung) || 0).toLocaleString('de-DE')} €</strong></div>
                          <div>TÜV / HU: <strong className="metallic-dark-text font-mono">{(Number(data.expenseCategories.tuev) || 0).toLocaleString('de-DE')} €</strong></div>
                          <div>Sonstiges: <strong className="metallic-dark-text font-mono">{(Number(data.expenseCategories.sonstiges) || 0).toLocaleString('de-DE')} €</strong></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Liquiditäts-Status Summary Row */}
              <div className="p-2.5 rounded-xl metallic-inner-subbox flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold metallic-dark-text">Netto-Betriebsergebnis ({periodLabel.split(' ')[0]}):</span>
                  <span className="text-[11px] metallic-dark-text-subtle hidden sm:inline">(Erlöse minus Aufwendungen)</span>
                </div>
                <div className="flex items-center gap-2 font-mono font-black text-sm">
                  <span className={isNetCashflowPositive ? 'text-emerald-700' : 'text-rose-600'}>
                    {isNetCashflowPositive ? '+' : ''}{netCashflow.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-black border ${
                    isNetCashflowPositive 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}>
                    {isNetCashflowPositive ? 'Überschuss' : 'Defizit'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. UNIFIED HOME DONUT CHARTS COCKPIT (SEPARATED WITH LUMINOUS SPACING)
// ============================================================================
export const FinancialDonutChart: React.FC<DonutChartsProps> = ({
  periodLabel,
  selectedPeriod = 'current_month',
  onPeriodChange,
  vehicleData,
  liquidityData,
  onNavigateTab
}) => {
  return (
    <div id="home-reinstated-donut-cockpit" className="space-y-2.5 w-full">
      {/* 1. FIRST DONUT: AUTOS (VERKAUFT & GEKAUFT) */}
      <VehiclePerformanceDonut
        data={vehicleData}
        periodLabel={periodLabel}
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
        onNavigateTab={onNavigateTab}
      />

      {/* Luminous Gap Divider */}
      <div className="luminous-gap-divider" />

      {/* 2. SECOND DONUT: KASSE, BANK, AUSGABEN, EINNAHMEN */}
      <LiquidityPerformanceDonut
        data={liquidityData}
        periodLabel={periodLabel}
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
