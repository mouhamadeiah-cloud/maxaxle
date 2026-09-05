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
  Download,
  DollarSign,
  FolderTree
} from 'lucide-react';
import { Invoice } from '../../types';
import { exportInvoicesToPdf, exportInvoicesToCsv } from '../../utils/exportUtils';

export type RechnungenTimeFilter = 'all' | 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';

interface RechnungenSearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  taxFilter: string;
  onTaxFilterChange: (tax: string) => void;
  folderFilter: string;
  onFolderFilterChange: (folder: string) => void;
  timeFilter: RechnungenTimeFilter;
  onTimeFilterChange: (tf: RechnungenTimeFilter) => void;
  dateFrom: string;
  onDateFromChange: (d: string) => void;
  dateTo: string;
  onDateToChange: (d: string) => void;
  amountMin: number | undefined;
  onAmountMinChange: (val: number | undefined) => void;
  amountMax: number | undefined;
  onAmountMaxChange: (val: number | undefined) => void;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'number';
  onSortByChange: (sort: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'number') => void;
  onResetFilters: () => void;
  matchingCount: number;
  totalCount: number;
  filteredInvoices: Invoice[];
}

export const RechnungenSearchFilterModal: React.FC<RechnungenSearchFilterModalProps> = ({
  isOpen,
  onClose,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  taxFilter,
  onTaxFilterChange,
  folderFilter,
  onFolderFilterChange,
  timeFilter,
  onTimeFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  amountMin,
  onAmountMinChange,
  amountMax,
  onAmountMaxChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  matchingCount,
  totalCount,
  filteredInvoices
}) => {
  if (!isOpen) return null;

  const handleExportCsv = () => {
    exportInvoicesToCsv(filteredInvoices, 'Rechnungsarchiv_Export');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-2 sm:pt-4 md:pt-6 px-2 sm:px-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="metallic-modal-container max-w-2xl w-full border border-slate-300/80 shadow-2xl overflow-hidden text-slate-900 animate-in slide-in-from-top-4 duration-200 my-1">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-100/90 border-b border-slate-300/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-card-luminous border border-slate-300/80 text-emerald-700 flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Rechnungs-Filter & Zeitraum</h2>
              <p className="text-xs text-slate-600 font-semibold">
                {matchingCount} von {totalCount} Belegen ausgewählt
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
          
          {/* 1. Time Range Filter (Zeitraum / Period) */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Zeitraum / Datumsfilter</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'all', label: 'Alle Daten' },
                { id: 'today', label: 'Heute' },
                { id: 'yesterday', label: 'Gestern' },
                { id: 'this_week', label: 'Diese Woche' },
                { id: 'last_week', label: 'Letzte Woche' },
                { id: 'this_month', label: 'Diesen Monat' },
                { id: 'last_month', label: 'Letzten Monat' },
                { id: 'this_year', label: 'Dieses Jahr' },
                { id: 'last_year', label: 'Letztes Jahr' },
                { id: 'custom', label: 'Individuell (von-bis)' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTimeFilterChange(item.id as RechnungenTimeFilter)}
                  className={`py-2 px-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer text-center ${
                    timeFilter === item.id
                      ? 'metallic-btn-primary text-slate-950 font-black shadow-xs'
                      : 'metallic-card-luminous text-slate-700 hover:text-slate-950 border border-slate-300/70'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Date Range Picker Fields */}
            {timeFilter === 'custom' && (
              <div className="p-3 rounded-2xl metallic-card-luminous border border-slate-300/80 space-y-2 mt-2">
                <p className="text-[11px] font-bold text-slate-700">Genauen Datumsbereich definieren (von / bis):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 mb-1 block">Von Datum:</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => onDateFromChange(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-emerald-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 mb-1 block">Bis Datum:</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => onDateToChange(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-emerald-500 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Invoice Status Filter */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold">Zahlungs- & Belegstatus</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'all', label: 'Alle Belege', icon: '⚪' },
                { id: 'bezahlt', label: 'Bezahlt', icon: '🟢' },
                { id: 'teilbezahlt', label: 'Teilbezahlt', icon: '🟡' },
                { id: 'offen', label: 'Offen / Fällig', icon: '🟠' },
                { id: 'storniert', label: 'Storniert', icon: '🔴' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onStatusFilterChange(item.id)}
                  className={`py-2.5 px-2 rounded-2xl font-bold transition cursor-pointer flex items-center justify-center gap-1 text-center text-xs ${
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

          {/* 3. Document Type Filter */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold">Dokumententyp</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Alle Belegarten' },
                { id: 'rechnung', label: 'Handelsrechnung (§ 25a / 19%)' },
                { id: 'eu_export', label: 'EU-Export (steuerfrei)' },
                { id: 'export', label: 'Export Drittland' },
                { id: 'storno', label: 'Stornorechnungen' },
                { id: 'gutschrift', label: 'Gutschriften' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTypeFilterChange(item.id)}
                  className={`py-2 px-2.5 rounded-2xl font-bold text-[11px] transition cursor-pointer text-center ${
                    typeFilter === item.id
                      ? 'metallic-btn-primary text-slate-950 font-black shadow-xs'
                      : 'metallic-card-luminous text-slate-700 hover:text-slate-950 border border-slate-300/70'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Tax Rate / Taxation Filter */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-600" />
              <span>Besteuerung & Steuersatz</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'Alle Sätze' },
                { id: 'margin_scheme', label: '§ 25a Differenz' },
                { id: 'standard_19', label: '19% Regelbesteuert' },
                { id: 'tax_free_export', label: 'Steuerfreier Export' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTaxFilterChange(item.id)}
                  className={`py-2 px-2 rounded-2xl font-bold text-[11px] transition cursor-pointer text-center ${
                    taxFilter === item.id
                      ? 'metallic-btn-primary text-slate-950 font-black shadow-xs'
                      : 'metallic-card-luminous text-slate-700 hover:text-slate-950 border border-slate-300/70'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Amount Range Filter */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-600" />
              <span>Betragsbereich (€ Brutto)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min. Betrag (€)"
                  value={amountMin !== undefined ? amountMin : ''}
                  onChange={(e) => onAmountMinChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-emerald-500 text-xs"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max. Betrag (€)"
                  value={amountMax !== undefined ? amountMax : ''}
                  onChange={(e) => onAmountMaxChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-emerald-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 6. Sorting Order */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Sortierung</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'date_desc', label: 'Datum (Neueste zuerst)' },
                { id: 'date_asc', label: 'Datum (Älteste zuerst)' },
                { id: 'amount_desc', label: 'Betrag (Höchste zuerst)' },
                { id: 'amount_asc', label: 'Betrag (Niedrigste zuerst)' },
                { id: 'number', label: 'Belegnummer' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSortByChange(item.id as any)}
                  className={`py-2 px-2 rounded-2xl font-bold text-[11px] transition cursor-pointer text-center ${
                    sortBy === item.id
                      ? 'metallic-btn-primary text-slate-950 font-black shadow-xs'
                      : 'metallic-card-luminous text-slate-700 hover:text-slate-950 border border-slate-300/70'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-100/90 border-t border-slate-300/80 flex flex-wrap items-center justify-between gap-3">
          
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 font-bold transition rounded-xl hover:bg-slate-200/80 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Alle Filter zurücksetzen</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl metallic-btn-secondary text-slate-800 font-bold border border-slate-300/80 hover:bg-slate-200/80 transition cursor-pointer"
              title="Gefilterte Rechnungen als CSV exportieren"
            >
              <Download className="w-3.5 h-3.5 text-slate-700" />
              <span>CSV Export</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl metallic-btn-primary text-slate-950 font-black shadow-sm transition cursor-pointer active:scale-95"
            >
              Anwenden ({matchingCount})
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
