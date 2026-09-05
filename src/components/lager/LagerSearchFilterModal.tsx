import React from 'react';
import { 
  SlidersHorizontal, 
  X, 
  Calendar, 
  RotateCcw, 
  Tag, 
  ArrowUpDown, 
  FileText, 
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Vehicle } from '../../types';
import { exportVehiclesToPdf, exportVehiclesToExcel, exportVehiclesToCsv } from '../../utils/exportUtils';

export type LagerDateRange = 'all' | 'month' | 'quarter' | 'year' | 'custom';

interface LagerSearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  dateRange: LagerDateRange;
  onDateRangeChange: (range: LagerDateRange) => void;
  customDateFrom: string;
  onCustomDateFromChange: (val: string) => void;
  customDateTo: string;
  onCustomDateToChange: (val: string) => void;
  taxFilter: string;
  onTaxFilterChange: (tax: string) => void;
  sortBy: 'created_desc' | 'created_asc' | 'price_desc' | 'price_asc' | 'mileage_asc';
  onSortByChange: (sort: 'created_desc' | 'created_asc' | 'price_desc' | 'price_asc' | 'mileage_asc') => void;
  onResetFilters: () => void;
  matchingCount: number;
  totalCount: number;
  filteredVehicles: Vehicle[];
}

export const LagerSearchFilterModal: React.FC<LagerSearchFilterModalProps> = ({
  isOpen,
  onClose,
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  customDateFrom,
  onCustomDateFromChange,
  customDateTo,
  onCustomDateToChange,
  taxFilter,
  onTaxFilterChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  matchingCount,
  totalCount,
  filteredVehicles
}) => {
  if (!isOpen) return null;

  const handleExportPdf = () => {
    const filterDesc = [
      statusFilter !== 'all' ? `Status: ${statusFilter}` : null,
      dateRange !== 'all' ? `Zeitraum: ${dateRange}` : null,
      taxFilter !== 'all' ? `Steuer: ${taxFilter}` : null
    ].filter(Boolean).join(', ') || 'Alle Fahrzeuge';

    exportVehiclesToPdf(filteredVehicles, filterDesc);
  };

  const handleExportExcel = () => {
    exportVehiclesToExcel(filteredVehicles, 'Lagerbestand_Export');
  };

  const handleExportCsv = () => {
    exportVehiclesToCsv(filteredVehicles, 'Lagerbestand_Export');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-2 sm:pt-4 md:pt-6 px-2 sm:px-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="metallic-modal-container max-w-xl w-full border border-slate-300/80 shadow-2xl overflow-hidden text-slate-900 animate-in slide-in-from-top-4 duration-200 my-1">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-100/90 border-b border-slate-300/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-card-luminous border border-slate-300/80 text-emerald-700 flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Lager-Filter & Export</h2>
              <p className="text-xs text-slate-600 font-semibold">
                {matchingCount} von {totalCount} Fahrzeugen ausgewählt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-200/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs max-h-[78vh] overflow-y-auto">
          
          {/* Vehicle Status Filter */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold">Fahrzeugstatus</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Alle Statusse', icon: '⚪' },
                { id: 'verfuegbar', label: 'Verfügbar', icon: '🟢' },
                { id: 'reserviert', label: 'Reserviert', icon: '🟡' },
                { id: 'aufbereitung', label: 'In Aufbereitung', icon: '🔵' },
                { id: 'verkauft', label: 'Verkauft (×)', icon: '🔴' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onStatusFilterChange(item.id)}
                  className={`py-2.5 px-2.5 rounded-2xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 text-center text-xs ${
                    statusFilter === item.id
                      ? 'metallic-btn-primary text-slate-950 font-black shadow-xs'
                      : 'metallic-card-luminous text-slate-700 hover:text-slate-950 border border-slate-300/70'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Zeitraum / Neuzugänge</span>
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
                  onClick={() => onDateRangeChange(item.id as LagerDateRange)}
                  className={`py-2.5 px-2 rounded-2xl font-bold text-[11px] transition cursor-pointer text-center ${
                    dateRange === item.id
                      ? 'metallic-btn-primary text-slate-950 font-black shadow-xs'
                      : 'metallic-card-luminous text-slate-700 hover:text-slate-950 border border-slate-300/70'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range Picker */}
            {dateRange === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 p-3 metallic-inner-subbox rounded-2xl border border-slate-300/60 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[11px] text-slate-700 font-bold mb-1">
                    Von Datum (Start)
                  </label>
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => onCustomDateFromChange(e.target.value)}
                    className="w-full p-2 metallic-input rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 font-bold mb-1">
                    Bis Datum (Ende)
                  </label>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => onCustomDateToChange(e.target.value)}
                    className="w-full p-2 metallic-input rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tax Filter */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-600" />
              <span>Besteuerung</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Alle' },
                { id: 'diff_25a', label: '§ 25a Differenz' },
                { id: 'standard_19', label: '19% Regelbesteuert' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTaxFilterChange(item.id)}
                  className={`py-2.5 px-2 rounded-2xl font-bold transition cursor-pointer text-center truncate text-[11px] sm:text-xs ${
                    taxFilter === item.id
                      ? 'metallic-btn-primary text-slate-950 font-black shadow-xs'
                      : 'metallic-card-luminous text-slate-700 hover:text-slate-950 border border-slate-300/70'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Sortierung</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="w-full p-3 metallic-input rounded-2xl text-xs text-slate-900 cursor-pointer font-semibold"
            >
              <option value="created_desc">Neueste Erfassung / Aktualisierung zuerst</option>
              <option value="created_asc">Älteste Erfassung zuerst</option>
              <option value="price_desc">Verkaufspreis (Höchster zuerst)</option>
              <option value="price_asc">Verkaufspreis (Niedrigster zuerst)</option>
              <option value="mileage_asc">Kilometerstand (Niedrigster zuerst)</option>
            </select>
          </div>

          {/* Dedicated Instant Export Section (PDF & Excel) */}
          <div className="p-3.5 metallic-inner-subbox rounded-2xl border border-slate-300/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Gefilterte Datensätze exportieren ({matchingCount} Fzg.)</span>
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* CSV Export Button */}
              <button
                type="button"
                id="btn-export-lager-csv"
                onClick={handleExportCsv}
                disabled={matchingCount === 0}
                className="py-2.5 px-3 metallic-card-luminous hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 border border-slate-300/80 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                title="Aktuell gefilterte Fahrzeuge als CSV-Datei exportieren"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>CSV (.csv)</span>
              </button>

              {/* Excel Export Button */}
              <button
                type="button"
                id="btn-export-lager-excel"
                onClick={handleExportExcel}
                disabled={matchingCount === 0}
                className="py-2.5 px-3 metallic-card-luminous hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 border border-slate-300/80 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                title="Aktuell gefilterte Fahrzeuge als Excel (.xlsx) Tabelle exportieren"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel (.xlsx)</span>
              </button>

              {/* PDF Export Button */}
              <button
                type="button"
                id="btn-export-lager-pdf"
                onClick={handleExportPdf}
                disabled={matchingCount === 0}
                className="py-2.5 px-3 metallic-card-luminous hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 border border-slate-300/80 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                title="Aktuell gefilterte Fahrzeuge als druckoptimiertes PDF exportieren"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>PDF (.pdf)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-100/90 border-t border-slate-300/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 text-slate-700 hover:text-slate-900 metallic-card-luminous border border-slate-300/80 rounded-2xl font-bold text-xs transition cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zurücksetzen</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 metallic-btn-primary text-slate-950 font-black rounded-2xl text-xs shadow-md transition cursor-pointer"
          >
            Filter anwenden ({matchingCount})
          </button>
        </div>

      </div>
    </div>
  );
};
