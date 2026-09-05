import React from 'react';
import { 
  SlidersHorizontal, 
  X, 
  User, 
  Building, 
  Calendar, 
  ArrowUpDown, 
  RotateCcw,
  FileText,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Customer } from '../../types';
import { exportCustomersToPdf, exportCustomersToExcel } from '../../utils/exportUtils';

export type KundenDateRange = 'all' | 'month' | 'quarter' | 'year' | 'custom';

interface KundenSearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: 'all' | 'B2C' | 'B2B';
  onTypeFilterChange: (type: 'all' | 'B2C' | 'B2B') => void;
  dateRange: KundenDateRange;
  onDateRangeChange: (range: KundenDateRange) => void;
  customDateFrom: string;
  onCustomDateFromChange: (val: string) => void;
  customDateTo: string;
  onCustomDateToChange: (val: string) => void;
  sortBy: 'name_asc' | 'name_desc' | 'spent_desc' | 'recent';
  onSortByChange: (sort: 'name_asc' | 'name_desc' | 'spent_desc' | 'recent') => void;
  onResetFilters: () => void;
  matchingCount: number;
  totalCount: number;
  filteredCustomers: Customer[];
}

export const KundenSearchFilterModal: React.FC<KundenSearchFilterModalProps> = ({
  isOpen,
  onClose,
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange,
  typeFilter,
  onTypeFilterChange,
  dateRange,
  onDateRangeChange,
  customDateFrom,
  onCustomDateFromChange,
  customDateTo,
  onCustomDateToChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  matchingCount,
  totalCount,
  filteredCustomers
}) => {
  if (!isOpen) return null;

  const handleExportPdf = () => {
    const filterDesc = [
      typeFilter !== 'all' ? `Typ: ${typeFilter}` : null,
      dateRange !== 'all' ? `Zeitraum: ${dateRange}` : null
    ].filter(Boolean).join(', ') || 'Alle Kunden';

    exportCustomersToPdf(filteredCustomers, filterDesc);
  };

  const handleExportExcel = () => {
    exportCustomersToExcel(filteredCustomers, 'Kundenliste_Export');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-start justify-center pt-1 sm:pt-2 md:pt-3 px-2 sm:px-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="metallic-modal-container rounded-3xl max-w-xl w-full border border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden text-slate-100 animate-in slide-in-from-top-4 duration-200 my-0 sm:my-1">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-md">
              <SlidersHorizontal className="w-5 h-5 text-[#0e264b] metallic-debossed-icon" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Kunden-Filter & Export</h2>
              <p className="text-xs text-slate-400">
                {matchingCount} von {totalCount} Kunden ausgewählt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 metallic-btn-secondary text-slate-300 hover:text-white rounded-xl transition cursor-pointer active:scale-95"
            title="Schließen"
          >
            <X className="w-4 h-4 metallic-debossed-icon" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs max-h-[78vh] overflow-y-auto">
          
          {/* Customer Type Filter */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold">Kundentyp</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onTypeFilterChange('all')}
                className={`py-2.5 px-3 rounded-2xl font-bold transition cursor-pointer text-center text-xs active:scale-95 ${
                  typeFilter === 'all'
                    ? 'metallic-btn-primary text-[#091a34] font-black shadow-md'
                    : 'metallic-btn-secondary text-slate-300'
                }`}
              >
                Alle Kunden
              </button>
              <button
                type="button"
                onClick={() => onTypeFilterChange('B2C')}
                className={`py-2.5 px-3 rounded-2xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 text-xs active:scale-95 ${
                  typeFilter === 'B2C'
                    ? 'metallic-btn-primary text-[#091a34] font-black shadow-md'
                    : 'metallic-btn-secondary text-slate-300'
                }`}
              >
                <User className="w-3.5 h-3.5 metallic-debossed-icon" />
                <span>Privat (B2C)</span>
              </button>
              <button
                type="button"
                onClick={() => onTypeFilterChange('B2B')}
                className={`py-2.5 px-3 rounded-2xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 text-xs active:scale-95 ${
                  typeFilter === 'B2B'
                    ? 'metallic-btn-primary text-[#091a34] font-black shadow-md'
                    : 'metallic-btn-secondary text-slate-300'
                }`}
              >
                <Building className="w-3.5 h-3.5 metallic-debossed-icon" />
                <span>Gewerbe (B2B)</span>
              </button>
            </div>
          </div>

          {/* Date Range / Time Frame Filter */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 metallic-debossed-icon" />
              <span>Zeitraum / Neuzugänge & Kontakt</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'all', label: 'Gesamt' },
                { id: 'month', label: 'Diesen Monat' },
                { id: 'quarter', label: 'Dieses Quartal' },
                { id: 'year', label: 'Dieses Jahr' },
                { id: 'custom', label: 'Individuell' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onDateRangeChange(item.id as KundenDateRange)}
                  className={`py-2.5 px-2 rounded-2xl font-bold text-[11px] transition cursor-pointer text-center active:scale-95 ${
                    dateRange === item.id
                      ? 'metallic-btn-primary text-[#091a34] font-black shadow-md'
                      : 'metallic-btn-secondary text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range Picker (Von / Bis) */}
            {dateRange === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 p-3 metallic-card rounded-2xl border border-slate-700/60 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[11px] text-slate-300 font-bold mb-1">
                    Von Datum (Start)
                  </label>
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => onCustomDateFromChange(e.target.value)}
                    className="w-full p-2 metallic-input rounded-xl text-white text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 font-bold mb-1">
                    Bis Datum (Ende)
                  </label>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => onCustomDateToChange(e.target.value)}
                    className="w-full p-2 metallic-input rounded-xl text-white text-xs font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sorting */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400 metallic-debossed-icon" />
              <span>Sortierung</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="w-full p-3 metallic-input rounded-2xl text-xs text-white cursor-pointer font-medium"
            >
              <option value="recent">Neueste Erfassung / Aktivität zuerst (Standard)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="spent_desc">Umsatz (Höchster zuerst)</option>
            </select>
          </div>

          {/* Dedicated Instant Export Section (PDF & Excel) */}
          <div className="p-3.5 metallic-card rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-400 metallic-debossed-icon" />
                <span>Gefilterte Kunden exportieren ({matchingCount} Kunden)</span>
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* PDF Export Button */}
              <button
                type="button"
                id="btn-export-kunden-pdf"
                onClick={handleExportPdf}
                disabled={matchingCount === 0}
                className="py-2.5 px-3 metallic-btn-secondary hover:border-rose-500/50 disabled:opacity-40 disabled:cursor-not-allowed text-rose-300 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
                title="Aktuell gefilterte Kunden als druckoptimiertes PDF exportieren"
              >
                <FileText className="w-4 h-4 text-rose-400 metallic-debossed-icon" />
                <span>PDF Export</span>
              </button>

              {/* Excel Export Button */}
              <button
                type="button"
                id="btn-export-kunden-excel"
                onClick={handleExportExcel}
                disabled={matchingCount === 0}
                className="py-2.5 px-3 metallic-btn-secondary hover:border-emerald-500/50 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-300 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
                title="Aktuell gefilterte Kunden als Excel (.xlsx) Tabelle exportieren"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 metallic-debossed-icon" />
                <span>Excel (.xlsx)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-gradient-to-t from-slate-950 to-slate-900/90 border-t border-slate-700/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 metallic-btn-secondary text-slate-300 hover:text-white rounded-2xl font-bold text-xs transition cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 metallic-debossed-icon" />
            <span>Zurücksetzen</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 metallic-btn-primary text-[#091a34] font-black rounded-2xl text-xs shadow-md transition cursor-pointer active:scale-95"
          >
            Filter anwenden ({matchingCount})
          </button>
        </div>

      </div>
    </div>
  );
};
