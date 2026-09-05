import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ChevronDown, Check, Sparkles, Clock, AlertCircle, X, Calendar } from 'lucide-react';
import { RequiredAsterisk } from './VehicleCombobox';

interface TuvMonthYearPickerProps {
  id?: string;
  value: string; // Stored as "YYYY-MM"
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const MONTHS = [
  { num: '01', short: '01 Jan', name: 'Januar' },
  { num: '02', short: '02 Feb', name: 'Februar' },
  { num: '03', short: '03 Mär', name: 'März' },
  { num: '04', short: '04 Apr', name: 'April' },
  { num: '05', short: '05 Mai', name: 'Mai' },
  { num: '06', short: '06 Jun', name: 'Juni' },
  { num: '07', short: '07 Jul', name: 'Juli' },
  { num: '08', short: '08 Aug', name: 'August' },
  { num: '09', short: '09 Sep', name: 'September' },
  { num: '10', short: '10 Okt', name: 'Oktober' },
  { num: '11', short: '11 Nov', name: 'November' },
  { num: '12', short: '12 Dez', name: 'Dezember' }
];

const currentYear = new Date().getFullYear();
const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

// Generate realistic year range (previous 2 years up to next 10 years)
const YEARS = Array.from({ length: 12 }, (_, i) => currentYear - 1 + i);

// German TÜV sticker color cycling (Official StVZO color cycle)
const getTuvBadgeColor = (year: number) => {
  const mod = year % 6;
  switch (mod) {
    case 0: return { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700', name: 'Braun' };
    case 1: return { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700', name: 'Grün' };
    case 2: return { bg: 'bg-emerald-400', text: 'text-slate-900', border: 'border-emerald-500', name: 'Gelb' };
    case 3: return { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700', name: 'Blau' };
    case 4: return { bg: 'bg-emerald-500', text: 'text-slate-900', border: 'border-emerald-600', name: 'Gelb/Grün' };
    case 5: return { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-700', name: 'Orange' };
    default: return { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700', name: 'TÜV' };
  }
};

export const TuvMonthYearPicker: React.FC<TuvMonthYearPickerProps> = ({
  id = 'tuv-month-year-picker',
  value,
  onChange,
  label = 'TÜV / HU Hauptuntersuchung',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value (accepts "YYYY-MM", "MM/YYYY", "MM.YYYY")
  let parsedMonth = currentMonth;
  let parsedYear = currentYear + 2;

  if (value) {
    if (value.includes('-')) {
      const parts = value.split('-');
      if (parts[0] && parts[0].length === 4) {
        parsedYear = parseInt(parts[0], 10) || currentYear;
        parsedMonth = parts[1] ? parts[1].padStart(2, '0') : '01';
      }
    } else if (value.includes('/')) {
      const parts = value.split('/');
      if (parts[0] && parts[1]) {
        parsedMonth = parts[0].padStart(2, '0');
        parsedYear = parseInt(parts[1], 10) || currentYear;
      }
    } else if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[0] && parts[1]) {
        parsedMonth = parts[0].padStart(2, '0');
        parsedYear = parseInt(parts[1], 10) || currentYear;
      }
    }
  }

  const [tempMonth, setTempMonth] = useState<string>(parsedMonth);
  const [tempYear, setTempYear] = useState<number>(parsedYear);

  useEffect(() => {
    setTempMonth(parsedMonth);
    setTempYear(parsedYear);
  }, [value, parsedMonth, parsedYear]);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleApply = (m: string = tempMonth, y: number = tempYear) => {
    const formatted = `${y}-${m.padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleQuickPreset = (monthsToAdd: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsToAdd);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setTempMonth(m);
    setTempYear(y);
    onChange(`${y}-${m}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const badgeStyle = getTuvBadgeColor(parsedYear);
  const displayFormatted = value ? `${parsedMonth} / ${parsedYear}` : '';
  const monthObj = MONTHS.find((m) => m.num === parsedMonth);

  // Calculate remaining months
  const now = new Date();
  const targetDate = new Date(parsedYear, parseInt(parsedMonth, 10) - 1, 1);
  const diffMonths = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());

  return (
    <div 
      ref={containerRef} 
      className={`relative flex flex-col ${isOpen ? 'z-[99999]' : 'z-10'} ${className}`}
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-1.5 min-h-[20px]">
        <label htmlFor={id} className="font-bold text-slate-800 text-xs sm:text-sm flex items-center">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{label}</span>
          </span>
          {required && <RequiredAsterisk />}
        </label>
        
        {value && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
            diffMonths >= 12
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : diffMonths >= 0
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {diffMonths >= 0 ? `Noch ${diffMonths} Monate` : 'TÜV fällig'}
          </span>
        )}
      </div>

      {/* Main trigger button / display box */}
      <div
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 metallic-input rounded-xl flex items-center justify-between cursor-pointer transition ${
          isOpen
            ? 'ring-2 ring-blue-500/20'
            : 'hover:border-slate-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
      >
        <div className="flex items-center gap-3">
          {/* German TÜV Round Badge simulation */}
          <div className={`w-8 h-8 rounded-full ${badgeStyle.bg} ${badgeStyle.text} border-2 ${badgeStyle.border} flex flex-col items-center justify-center font-bold shadow-2xs shrink-0 select-none relative overflow-hidden`}>
            <span className="text-[7px] font-mono leading-none tracking-tighter uppercase font-extrabold opacity-80">HU</span>
            <span className="text-[11px] font-mono leading-tight font-black">{parsedMonth}</span>
            <span className="text-[7px] font-mono leading-none font-bold opacity-90">{String(parsedYear).slice(-2)}</span>
            <div className="absolute top-0 w-2 h-1 bg-black/60 rounded-b-xs"></div>
          </div>

          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{displayFormatted || 'Monat / Jahr wählen'}</span>
              {monthObj && (
                <span className="text-slate-500 font-normal text-xs">({monthObj.name} {parsedYear})</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">
              Nächste Hauptuntersuchung (HU/AU)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-600">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
              title="TÜV-Datum leeren"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            className="p-1 rounded-md text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Popover Selection Box - Dual Dropdown / Direct Month & Year Picker */}
      {isOpen && !disabled && (
        <div 
          className="absolute z-[99999] left-0 right-0 top-[calc(100%+4px)] metallic-modal-container rounded-2xl shadow-2xl p-4 text-xs sm:text-sm space-y-4 text-slate-900 animate-in fade-in zoom-in-98 duration-150"
          style={{ 
            minWidth: '300px'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900 text-xs sm:text-sm">TÜV / HU Gültigkeit</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick 1-Click Presets */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Schnellauswahl:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickPreset(24)}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 text-xs transition cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>+24 Mon. (Neu)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(12)}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-lg border border-blue-200 text-xs transition cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <Clock className="w-3 h-3 text-blue-600" />
                <span>+12 Mon.</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(36)}
                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 text-xs transition cursor-pointer text-center"
              >
                +36 Mon. (Neuwagen)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(-1)}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-200 text-xs transition cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <AlertCircle className="w-3 h-3 text-rose-600" />
                <span>Fällig</span>
              </button>
            </div>
          </div>

          {/* Dual Dropdowns: Monat & Jahr */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100/90 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Prüfmonat (MM):
              </label>
              <select
                value={tempMonth}
                onChange={(e) => {
                  setTempMonth(e.target.value);
                  handleApply(e.target.value, tempYear);
                }}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {MONTHS.map((m) => (
                  <option key={m.num} value={m.num}>
                    {m.short} ({m.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Prüfjahr (YYYY):
              </label>
              <select
                value={tempYear}
                onChange={(e) => {
                  const y = parseInt(e.target.value, 10);
                  setTempYear(y);
                  handleApply(tempMonth, y);
                }}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {YEARS.map((yr) => {
                  const b = getTuvBadgeColor(yr);
                  return (
                    <option key={yr} value={yr}>
                      {yr} ({b.name})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Month Quick-Click Grid */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Monat auswählen (01 - 12):
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
              {MONTHS.map((m) => {
                const isSelected = parsedMonth === m.num;
                return (
                  <button
                    type="button"
                    key={m.num}
                    onClick={() => handleApply(m.num, tempYear)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-mono">{m.num}</span>
                    <span className="text-[9px] font-medium">{m.short.slice(3)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Gewählt:</span>
              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                {tempMonth}/{tempYear}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleApply(tempMonth, tempYear)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Fertig
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
