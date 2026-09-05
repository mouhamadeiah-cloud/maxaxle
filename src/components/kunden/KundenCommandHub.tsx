import React, { useRef, useEffect } from 'react';
import { Search, Plus, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';

interface KundenCommandHubProps {
  viewMode: 'cards' | 'table';
  onToggleViewMode: (mode: 'cards' | 'table') => void;
  onOpenFilter: () => void;
  onOpenAddCustomer: () => void;
  isFilterActive: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSearchExpanded: boolean;
  setIsSearchExpanded: (expanded: boolean) => void;
}

export const KundenCommandHub: React.FC<KundenCommandHubProps> = ({
  viewMode,
  onToggleViewMode,
  onOpenFilter,
  onOpenAddCustomer,
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
    <div id="kunden-command-hub" className="flex items-center justify-end gap-2 w-full select-none">
      
      {/* 1. Dynamic Expandable Horizontal Search Bar (Smooth expansion to the left) */}
      <div className="relative flex items-center justify-end">
        {isSearchExpanded ? (
          <div className="flex items-center metallic-card-luminous border border-slate-300/80 rounded-full pl-3.5 pr-1.5 py-1 shadow-sm transition-all duration-300 w-64 sm:w-72 md:w-80 animate-in fade-in slide-in-from-right-4">
            <Search className="w-4 h-4 text-[#1e3a5f] shrink-0 pointer-events-none mr-2 metallic-debossed-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Kundenname, Firma, Ort..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#0e264b] placeholder-[#1e3a5f]/50 focus:outline-none font-semibold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-[#1e3a5f] hover:text-[#0e264b] rounded-full transition cursor-pointer"
                title="Suchtext löschen"
              >
                <X className="w-3.5 h-3.5 metallic-debossed-icon" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchExpanded(false)}
              className="ml-1 p-1.5 bg-slate-200/80 hover:bg-slate-300 text-[#1e3a5f] hover:text-[#0e264b] rounded-full border border-slate-300 transition cursor-pointer"
              title="Suche schließen"
            >
              <X className="w-3.5 h-3.5 metallic-debossed-icon" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            id="hub-btn-kunden-search-toggle"
            onClick={() => setIsSearchExpanded(true)}
            className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="Kundensuche öffnen"
          >
            <div
              className={`relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                searchQuery
                  ? 'metallic-node-active text-[#0e264b] border-emerald-400'
                  : 'metallic-node text-[#0e264b] border-slate-300/80 hover:border-slate-400'
              }`}
            >
              <Search className={`w-3.5 h-3.5 sm:w-4 sm:h-4 metallic-debossed-icon ${
                searchQuery ? 'text-[#0e264b] stroke-[2.5]' : 'text-[#0e264b]'
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
          id="hub-btn-kunden-filter"
          onClick={onOpenFilter}
          className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="Kunden-Filter & Sortierung"
        >
          <div
            className={`relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border flex items-center justify-center transition-all duration-200 ${
              isFilterActive
                ? 'metallic-node-active text-[#0e264b] border-emerald-400'
                : 'metallic-node text-[#0e264b] border-slate-300/80 hover:border-slate-400'
            }`}
          >
            <SlidersHorizontal className={`w-3.5 h-3.5 sm:w-4 sm:h-4 metallic-debossed-icon ${
              isFilterActive ? 'text-[#0e264b] stroke-[2.5]' : 'text-[#0e264b]'
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
          id="hub-btn-add-customer"
          onClick={onOpenAddCustomer}
          className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="Neuen Kunden anlegen"
        >
          <div className="relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border border-slate-300/80 metallic-node text-[#0e264b] hover:border-slate-400 flex items-center justify-center transition-all duration-200">
            <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0e264b] stroke-[2.5] metallic-debossed-icon" />

            {/* Subtle auxiliary rotating chrome arc */}
            <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
          </div>
        </button>

        {/* Grid / Cards View Icon */}
        <button
          type="button"
          id="hub-btn-view-cards"
          onClick={() => onToggleViewMode('cards')}
          className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="Kachelansicht"
        >
          <div
            className={`relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border flex items-center justify-center transition-all duration-200 ${
              viewMode === 'cards'
                ? 'metallic-node-active text-[#0e264b] border-emerald-400'
                : 'metallic-node text-[#0e264b] border-slate-300/80 hover:border-slate-400'
            }`}
          >
            <LayoutGrid className={`w-3.5 h-3.5 sm:w-4 sm:h-4 metallic-debossed-icon ${
              viewMode === 'cards' ? 'text-[#0e264b] stroke-[2.5]' : 'text-[#0e264b]'
            }`} />

            {/* Subtle auxiliary rotating chrome arc */}
            <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
          </div>
        </button>

        {/* List / Row View Icon */}
        <button
          type="button"
          id="hub-btn-view-table"
          onClick={() => onToggleViewMode('table')}
          className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="Listenansicht (Separierte Zeilen)"
        >
          <div
            className={`relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border flex items-center justify-center transition-all duration-200 ${
              viewMode === 'table'
                ? 'metallic-node-active text-[#0e264b] border-emerald-400'
                : 'metallic-node text-[#0e264b] border-slate-300/80 hover:border-slate-400'
            }`}
          >
            <List className={`w-3.5 h-3.5 sm:w-4 sm:h-4 metallic-debossed-icon ${
              viewMode === 'table' ? 'text-[#0e264b] stroke-[2.5]' : 'text-[#0e264b]'
            }`} />

            {/* Subtle auxiliary rotating chrome arc */}
            <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
          </div>
        </button>

      </div>
    </div>
  );
};
