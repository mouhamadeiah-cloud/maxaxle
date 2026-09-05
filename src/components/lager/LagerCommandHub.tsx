import React, { useRef, useEffect } from 'react';
import { Search, Plus, LayoutGrid, List, SlidersHorizontal, Download, X } from 'lucide-react';

interface LagerCommandHubProps {
  viewMode: 'cards' | 'table';
  onToggleViewMode: (mode: 'cards' | 'table') => void;
  onOpenFilter: () => void;
  onOpenAddVehicle: () => void;
  onExportCsv?: () => void;
  isFilterActive: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSearchExpanded: boolean;
  setIsSearchExpanded: (expanded: boolean) => void;
}

export const LagerCommandHub: React.FC<LagerCommandHubProps> = ({
  viewMode,
  onToggleViewMode,
  onOpenFilter,
  onOpenAddVehicle,
  onExportCsv,
  isFilterActive,
  searchQuery,
  onSearchChange,
  isSearchExpanded,
  setIsSearchExpanded
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  return (
    <div id="lager-command-hub" className="flex items-center justify-end gap-2 w-full select-none">
      
      {/* 1. Dynamic Expandable Horizontal Search Bar (Smooth expansion to the left) */}
      <div className="relative flex items-center justify-end">
        {isSearchExpanded ? (
          <div className="flex items-center metallic-card-luminous border border-slate-300/80 rounded-full pl-3.5 pr-1.5 py-1 shadow-sm transition-all duration-300 w-64 sm:w-72 md:w-80 animate-in fade-in slide-in-from-right-4">
            <Search className="w-4 h-4 text-slate-500 shrink-0 pointer-events-none mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Marke, Modell, FIN..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-semibold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full transition cursor-pointer"
                title="Suchtext löschen"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchExpanded(false)}
              className="ml-1 p-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 hover:text-slate-900 rounded-full border border-slate-300 transition cursor-pointer"
              title="Suche schließen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            id="hub-btn-lager-search-toggle"
            onClick={() => setIsSearchExpanded(true)}
            className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="Schnellsuche öffnen"
          >
            <div
              className={`relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                searchQuery
                  ? 'metallic-node-active text-slate-950 border-emerald-400'
                  : 'metallic-node text-slate-800 border-slate-300/80 hover:border-slate-400'
              }`}
            >
              <Search className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                searchQuery ? 'text-slate-950 stroke-[2.5]' : 'text-slate-800'
              }`} />

              {/* Subtle auxiliary rotating chrome arc */}
              <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
            </div>

            {/* Active search text indicator */}
            {searchQuery && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-[0_0_6px_#10b981] animate-pulse" />
            )}
          </button>
        )}
      </div>

      {/* 2. Command Hub Action Icons Group */}
      <div className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-full metallic-pill-light border border-slate-300/70 shadow-sm shrink-0">
        
        {/* Filter Icon (Dedicated strictly to opening Filter & Sort Panel) */}
        <button
          type="button"
          id="hub-btn-lager-filter"
          onClick={onOpenFilter}
          className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="Filter & Sortierung anpassen"
        >
          <div
            className={`relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border flex items-center justify-center transition-all duration-200 ${
              isFilterActive
                ? 'metallic-node-active text-slate-950 border-emerald-400'
                : 'metallic-node text-slate-800 border-slate-300/80 hover:border-slate-400'
            }`}
          >
            <SlidersHorizontal className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              isFilterActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-800'
            }`} />

            {/* Subtle auxiliary rotating chrome arc */}
            <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
          </div>

          {/* Active filter indicator dot */}
          {isFilterActive && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-[0_0_6px_#10b981] animate-pulse" />
          )}
        </button>

        {/* Add (+) Icon */}
        <button
          type="button"
          id="hub-btn-add-vehicle"
          onClick={onOpenAddVehicle}
          className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="Neues Fahrzeug erfassen"
        >
          <div className="relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border border-slate-300/80 metallic-node text-slate-800 hover:border-slate-400 flex items-center justify-center transition-all duration-200">
            <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-900 stroke-[2.5]" />

            {/* Subtle auxiliary rotating chrome arc */}
            <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
          </div>
        </button>

        {/* CSV Export Button */}
        {onExportCsv && (
          <button
            type="button"
            id="hub-btn-export-csv"
            onClick={onExportCsv}
            className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="Aktuelle Bestandsliste als CSV-Datei exportieren"
          >
            <div className="relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border border-slate-300/80 metallic-node text-slate-800 hover:border-slate-400 flex items-center justify-center transition-all duration-200">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800 stroke-[2.2]" />

              {/* Subtle auxiliary rotating chrome arc */}
              <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
            </div>
          </button>
        )}

        {/* Grid / Cards View Icon (Default: Large Image Cards) */}
        <button
          type="button"
          id="hub-btn-view-lager-cards"
          onClick={() => onToggleViewMode('cards')}
          className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="Kachelansicht mit großen Bildern (Standard)"
        >
          <div
            className={`relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border flex items-center justify-center transition-all duration-200 ${
              viewMode === 'cards'
                ? 'metallic-node-active text-slate-950 border-emerald-400'
                : 'metallic-node text-slate-800 border-slate-300/80 hover:border-slate-400'
            }`}
          >
            <LayoutGrid className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              viewMode === 'cards' ? 'text-slate-950 stroke-[2.5]' : 'text-slate-800'
            }`} />

            {/* Subtle auxiliary rotating chrome arc */}
            <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
          </div>
        </button>

        {/* Table / List View Icon */}
        <button
          type="button"
          id="hub-btn-view-lager-table"
          onClick={() => onToggleViewMode('table')}
          className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="Tabellen- / Listenansicht"
        >
          <div
            className={`relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border flex items-center justify-center transition-all duration-200 ${
              viewMode === 'table'
                ? 'metallic-node-active text-slate-950 border-emerald-400'
                : 'metallic-node text-slate-800 border-slate-300/80 hover:border-slate-400'
            }`}
          >
            <List className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              viewMode === 'table' ? 'text-slate-950 stroke-[2.5]' : 'text-slate-800'
            }`} />

            {/* Subtle auxiliary rotating chrome arc */}
            <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
          </div>
        </button>

      </div>
    </div>
  );
};
