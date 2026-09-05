import React, { useState, useMemo, useEffect } from 'react';
import { 
  Car, 
  Send, 
  RefreshCw, 
  Calendar,
  Gauge,
  Hash
} from 'lucide-react';
import { Vehicle, VehicleExpense, NavTab } from '../types';
import { VehicleDetailModal } from './VehicleDetailModal';
import { LagerCommandHub } from './lager/LagerCommandHub';
import { LagerCard } from './lager/LagerCard';
import { LagerSearchFilterModal, LagerDateRange } from './lager/LagerSearchFilterModal';
import { exportVehiclesToCsv } from '../utils/exportUtils';

interface MeinLagerViewProps {
  vehicles: Vehicle[];
  setActiveTab: (tab: NavTab) => void;
  onUpdateVehicle?: (id: string, updates: Partial<Vehicle>) => void;
  onDeleteVehicle?: (id: string) => void;
  onAddExpense?: (vehicleId: string, expense: Omit<VehicleExpense, 'id' | 'createdAt' | 'vehicleId'>, pushToKasse: boolean) => void;
  onDeleteExpense?: (vehicleId: string, expenseId: string) => void;
  onSendToOperations?: (vehicle: Vehicle) => void;
  onEditVehicleMaster?: (vehicle: Vehicle, returnTab?: NavTab) => void;
}

export const MeinLagerView: React.FC<MeinLagerViewProps> = ({ 
  vehicles, 
  setActiveTab,
  onUpdateVehicle = () => {},
  onDeleteVehicle = () => {},
  onAddExpense = () => {},
  onDeleteExpense = () => {},
  onSendToOperations = (_veh: Vehicle) => {},
  onEditVehicleMaster
}) => {
  // Default to Card View (Large Image Grid), persisted via localStorage
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    try {
      const saved = localStorage.getItem('lager_view_mode');
      if (saved === 'table' || saved === 'cards') return saved;
    } catch {
      // ignore
    }
    return 'cards'; // Default is Card View with large images
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    try {
      return localStorage.getItem('lager_search_query') || '';
    } catch {
      return '';
    }
  });

  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('lager_search_query');
    } catch {
      return false;
    }
  });

  const [statusFilter, setStatusFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('lager_filter_status') || 'all';
    } catch {
      return 'all';
    }
  });

  const [dateRange, setDateRange] = useState<LagerDateRange>(() => {
    try {
      const saved = localStorage.getItem('lager_filter_daterange');
      if (saved === 'month' || saved === 'quarter' || saved === 'year' || saved === 'custom') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'all';
  });

  const [customDateFrom, setCustomDateFrom] = useState<string>(() => {
    try {
      return localStorage.getItem('lager_filter_custom_from') || '';
    } catch {
      return '';
    }
  });

  const [customDateTo, setCustomDateTo] = useState<string>(() => {
    try {
      return localStorage.getItem('lager_filter_custom_to') || '';
    } catch {
      return '';
    }
  });

  const [taxFilter, setTaxFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('lager_filter_tax') || 'all';
    } catch {
      return 'all';
    }
  });

  const [sortBy, setSortBy] = useState<'created_desc' | 'created_asc' | 'price_desc' | 'price_asc' | 'mileage_asc'>(() => {
    try {
      const saved = localStorage.getItem('lager_filter_sortby');
      if (saved === 'created_asc' || saved === 'price_desc' || saved === 'price_asc' || saved === 'mileage_asc') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'created_desc'; // Default: newest to oldest
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleExportCsv = () => {
    exportVehiclesToCsv(filteredVehicles, 'Lagerbestand_Export');
  };

  // Synchronize filter states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lager_view_mode', viewMode);
      localStorage.setItem('lager_search_query', searchQuery);
      localStorage.setItem('lager_filter_status', statusFilter);
      localStorage.setItem('lager_filter_daterange', dateRange);
      localStorage.setItem('lager_filter_custom_from', customDateFrom);
      localStorage.setItem('lager_filter_custom_to', customDateTo);
      localStorage.setItem('lager_filter_tax', taxFilter);
      localStorage.setItem('lager_filter_sortby', sortBy);
    } catch {
      // ignore
    }
  }, [viewMode, searchQuery, statusFilter, dateRange, customDateFrom, customDateTo, taxFilter, sortBy]);

  // Check for auto-select vehicle ID from Max AI or external links
  useEffect(() => {
    try {
      const targetVehId = localStorage.getItem('lager_selected_vehicle_id');
      if (targetVehId) {
        const found = vehicles.find(v => v.id === targetVehId);
        if (found) {
          setSelectedVehicle(found);
        }
        localStorage.removeItem('lager_selected_vehicle_id');
      }
    } catch {
      // ignore
    }
  }, [vehicles]);

  // Guarantee view scrolls to the very top immediately upon mounting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, []);

  // Helper to get normalized timestamp from vehicle records for chronological sorting (newest to oldest)
  const getVehicleTimestamp = (v: Vehicle): number => {
    if (v.createdAt) {
      const t = new Date(v.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (v.purchaseDate) {
      const t = new Date(v.purchaseDate).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (typeof v.daysInStock === 'number') {
      return Date.now() - v.daysInStock * 86400000;
    }
    return 0;
  };

  // Filter & sort vehicles (Default strictly newest to oldest)
  const filteredVehicles = useMemo(() => {
    const now = new Date();
    // This Month Start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    // This Quarter Start
    const currentQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
    const quarterStart = new Date(now.getFullYear(), currentQuarterMonth, 1).getTime();
    // This Year Start
    const yearStart = new Date(now.getFullYear(), 0, 1).getTime();

    const customFromTime = customDateFrom ? new Date(`${customDateFrom}T00:00:00`).getTime() : null;
    const customToTime = customDateTo ? new Date(`${customDateTo}T23:59:59`).getTime() : null;

    return vehicles
      .filter((v) => {
        // Search query matching
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.variant && v.variant.toLowerCase().includes(q)) ||
          v.vin.toLowerCase().includes(q) ||
          (v.location && v.location.toLowerCase().includes(q)) ||
          (v.firstRegistration && v.firstRegistration.toLowerCase().includes(q));

        // Status Filter
        const matchesStatus = statusFilter === 'all' || v.status === statusFilter;

        // Tax Filter
        const matchesTax = taxFilter === 'all' || v.taxType === taxFilter;

        // Date Range Filter (Diesen Monat, Dieses Quartal, Dieses Jahr, Gesamt, Individuell)
        let matchesDate = true;
        const vTime = getVehicleTimestamp(v);

        if (dateRange === 'month') {
          matchesDate = vTime >= monthStart;
        } else if (dateRange === 'quarter') {
          matchesDate = vTime >= quarterStart;
        } else if (dateRange === 'year') {
          matchesDate = vTime >= yearStart;
        } else if (dateRange === 'custom') {
          if (customFromTime !== null && vTime < customFromTime) {
            matchesDate = false;
          }
          if (customToTime !== null && vTime > customToTime) {
            matchesDate = false;
          }
        }

        return matchesSearch && matchesStatus && matchesTax && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'created_desc') {
          return getVehicleTimestamp(b) - getVehicleTimestamp(a);
        }
        if (sortBy === 'created_asc') {
          return getVehicleTimestamp(a) - getVehicleTimestamp(b);
        }
        if (sortBy === 'price_desc') return (b.sellingPrice || 0) - (a.sellingPrice || 0);
        if (sortBy === 'price_asc') return (a.sellingPrice || 0) - (b.sellingPrice || 0);
        if (sortBy === 'mileage_asc') return (a.mileage || 0) - (b.mileage || 0);
        return 0;
      });
  }, [vehicles, searchQuery, statusFilter, dateRange, customDateFrom, customDateTo, taxFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setIsSearchExpanded(false);
    setStatusFilter('all');
    setDateRange('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setTaxFilter('all');
    setSortBy('created_desc');
  };

  const isFilterActive =
    statusFilter !== 'all' ||
    dateRange !== 'all' ||
    taxFilter !== 'all' ||
    sortBy !== 'created_desc';

  // Format Status label for status bar
  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case 'verfuegbar':
        return 'Nur Verfügbar (🟢)';
      case 'reserviert':
        return 'Nur Reserviert (🟡)';
      case 'aufbereitung':
        return 'In Aufbereitung (🔵)';
      case 'verkauft':
        return 'Nur Verkauft (🔴)';
      default:
        return 'Alle Statusse';
    }
  };

  // Format Date Range label for status bar
  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'month':
        return 'Diesen Monat';
      case 'quarter':
        return 'Dieses Quartal';
      case 'year':
        return 'Dieses Jahr';
      case 'custom':
        if (customDateFrom && customDateTo) {
          return `${customDateFrom} bis ${customDateTo}`;
        }
        if (customDateFrom) return `Ab ${customDateFrom}`;
        if (customDateTo) return `Bis ${customDateTo}`;
        return 'Individuell';
      default:
        return 'Gesamtzeitraum';
    }
  };

  const getTaxFilterLabel = () => {
    switch (taxFilter) {
      case 'diff_25a':
        return '§ 25a Differenz';
      case 'standard_19':
        return '19% MwSt.';
      default:
        return 'Alle Steuern';
    }
  };

  return (
    <div id="mein-lager-view-root" className="space-y-5 max-w-7xl mx-auto pb-16">
      
      {/* Top Section: Persistent Compact Filter Status Bar on Left + Separated Hub with Expandable Search on Right */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        
        {/* Left Side: Compact Filter Status Bar */}
        <div id="lager-filter-status-bar" className="flex items-center gap-2 flex-wrap text-xs select-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full metallic-card-luminous border border-slate-300/70 shadow-sm text-slate-800">
            <span className="w-2 h-2 rounded-full jewel-emerald animate-pulse" />
            <span className="font-black text-slate-900">
              {filteredVehicles.length} {filteredVehicles.length === 1 ? 'Fahrzeug' : 'Fahrzeuge'}
            </span>
            <span className="text-slate-300 font-bold">|</span>
            <span className="text-emerald-700 font-bold">{getDateRangeLabel()}</span>
            <span className="text-slate-300 font-bold">&bull;</span>
            <span className="text-slate-700 font-semibold">{getStatusFilterLabel()}</span>
            {taxFilter !== 'all' && (
              <>
                <span className="text-slate-300 font-bold">&bull;</span>
                <span className="text-slate-600 font-medium">{getTaxFilterLabel()}</span>
              </>
            )}
            {searchQuery && (
              <>
                <span className="text-slate-300 font-bold">&bull;</span>
                <span className="text-emerald-800 font-semibold italic truncate max-w-[140px]">
                  &bdquo;{searchQuery}&ldquo;
                </span>
              </>
            )}
          </div>

          {(isFilterActive || searchQuery) && (
            <button
              type="button"
              id="btn-quick-reset-lager-filters"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full metallic-card-luminous hover:bg-white/60 border border-slate-300/70 text-slate-700 hover:text-slate-950 text-[11px] font-bold transition cursor-pointer shadow-xs"
              title="Alle Filter & Suche zurücksetzen"
            >
              <RefreshCw className="w-3 h-3 text-slate-600" />
              <span>Zurücksetzen</span>
            </button>
          )}
        </div>

        {/* Right Side: Command Hub (Expandable Search Bar, Filter Icon, Add Vehicle, CSV Export, View Toggles) */}
        <div className="shrink-0 flex justify-end">
          <LagerCommandHub
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            onOpenFilter={() => setIsFilterModalOpen(true)}
            onOpenAddVehicle={() => setActiveTab('neu')}
            onExportCsv={handleExportCsv}
            isFilterActive={isFilterActive}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearchExpanded={isSearchExpanded}
            setIsSearchExpanded={setIsSearchExpanded}
          />
        </div>
      </div>

      {/* No Results Fallback */}
      {filteredVehicles.length === 0 && (
        <div className="p-12 metallic-card-luminous rounded-3xl text-center space-y-3 text-slate-900 shadow-xl border border-slate-300/70">
          <Car className="w-12 h-12 mx-auto text-slate-500" />
          <h3 className="text-base font-extrabold text-slate-900">Keine Fahrzeuge gefunden</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Für Ihre aktuellen Filter- oder Suchkriterien wurden keine passenden Bestandsfahrzeuge im Lager gefunden.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 metallic-btn-primary text-slate-950 font-black text-xs rounded-2xl shadow-md transition cursor-pointer"
          >
            Filter & Suche zurücksetzen
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. CARD VIEW (LARGE IMAGE GRID - DEFAULT)                             */}
      {/* ===================================================================== */}
      {viewMode === 'cards' && filteredVehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredVehicles.map((vehicle) => (
            <LagerCard
              key={vehicle.id}
              vehicle={vehicle}
              onClick={() => setSelectedVehicle(vehicle)}
              onSendToOperations={(e) => {
                e.stopPropagation();
                onSendToOperations(vehicle);
              }}
            />
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. TABLE / LIST VIEW (RESPONSIVE & MOBILE OPTIMIZED)                  */}
      {/* ===================================================================== */}
      {viewMode === 'table' && filteredVehicles.length > 0 && (
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden md:block metallic-card-luminous rounded-3xl shadow-xl overflow-hidden border border-slate-300/70">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-900">
                <thead className="bg-slate-200/80 border-b border-slate-300 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Fahrzeug</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Erstzulassung</th>
                    <th className="py-3.5 px-4">Kilometer</th>
                    <th className="py-3.5 px-4">Verkaufspreis</th>
                    <th className="py-3.5 px-4">FIN (Fahrgestellnummer)</th>
                    <th className="py-3.5 px-4 text-right">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300/50">
                  {filteredVehicles.map((vehicle) => {
                    const brandAndModel = `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Fahrzeug';
                    
                    return (
                      <tr
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="hover:bg-white/40 transition-colors cursor-pointer group"
                      >
                        {/* Thumbnail & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                              {vehicle.imageUrl ? (
                                <img
                                  src={vehicle.imageUrl}
                                  alt={brandAndModel}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Car className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {brandAndModel}
                              </div>
                              <span className="text-[10px] text-slate-500 font-semibold">
                                {vehicle.taxType === 'diff_25a' ? '§ 25a Differenz' : '19% MwSt.'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status Dot */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {vehicle.status === 'verfuegbar' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[11px]">
                              <span className="w-2 h-2 rounded-full jewel-emerald" />
                              Verfügbar
                            </span>
                          )}
                          {vehicle.status === 'reserviert' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-bold text-[11px]">
                              <span className="w-2 h-2 rounded-full jewel-amber" />
                              Reserviert
                            </span>
                          )}
                          {vehicle.status === 'aufbereitung' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-300 text-sky-800 font-bold text-[11px]">
                              <span className="w-2 h-2 rounded-full jewel-blue" />
                              In Aufbereitung
                            </span>
                          )}
                          {vehicle.status === 'verkauft' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-800 font-bold text-[11px]">
                              <span className="w-2 h-2 rounded-full jewel-red" />
                              Verkauft
                            </span>
                          )}
                        </td>

                        {/* First Registration */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                          {vehicle.firstRegistration || 'N/A'}
                        </td>

                        {/* Mileage */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                          {(vehicle.mileage || 0).toLocaleString('de-DE')} km
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 whitespace-nowrap font-mono font-black text-slate-900 text-sm">
                          {(vehicle.sellingPrice || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                        </td>

                        {/* VIN */}
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                          {vehicle.vin || '—'}
                        </td>

                        {/* Action: In den Hub übernehmen */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendToOperations(vehicle);
                            }}
                            className="min-h-[38px] px-4 py-1.5 metallic-btn-primary text-slate-950 rounded-xl text-xs font-black shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 text-slate-950" />
                            <span>In den Hub</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Table Fallback */}
          <div className="md:hidden space-y-3">
            {filteredVehicles.map((vehicle) => {
              const brandAndModel = `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Fahrzeug';
              
              return (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="metallic-card-luminous rounded-3xl p-4 border border-slate-300/70 shadow-md space-y-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt={brandAndModel}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Car className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">{brandAndModel}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-800 font-mono font-bold">
                        {(vehicle.sellingPrice || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 bg-slate-100/80 p-2.5 rounded-2xl border border-slate-300/50">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>EZ: {vehicle.firstRegistration || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-slate-500" />
                      <span>{(vehicle.mileage || 0).toLocaleString('de-DE')} km</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <Hash className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="font-mono text-[10px] truncate">{vehicle.vin || 'Keine FIN'}</span>
                    </div>
                  </div>

                  {/* Fully visible Mobile button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendToOperations(vehicle);
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 metallic-btn-primary text-slate-950 rounded-2xl text-xs font-black shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>In den Hub übernehmen</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. CLEAN STATUS LEGEND (AT THE BOTTOM OF THE SCREEN)                 */}
      {/* ===================================================================== */}
      <div id="lager-status-legend" className="p-4 rounded-3xl metallic-card-luminous border border-slate-300/70 shadow-md flex flex-wrap items-center justify-between gap-4 text-xs text-slate-800 select-none">
        <div className="flex items-center gap-2 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
          <span>Status-Legende:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
          {/* 🟢 Available */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full jewel-emerald" />
            <span className="font-bold text-slate-800">Verfügbar (🟢)</span>
          </div>

          {/* 🟡 Reserved */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full jewel-amber" />
            <span className="font-bold text-slate-800">Reserviert (🟡)</span>
          </div>

          {/* 🔵 In Aufbereitung */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full jewel-blue" />
            <span className="font-bold text-slate-800">In Aufbereitung (🔵)</span>
          </div>

          {/* 🔴 Sold */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full jewel-red" />
            <span className="font-bold text-slate-800">Verkauft (🔴)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-semibold">
          Stand: {new Date().toLocaleDateString('de-DE')}
        </div>
      </div>

      {/* Advanced Filter Modal with Top-Anchoring & PDF/Excel Export */}
      <LagerSearchFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customDateFrom={customDateFrom}
        onCustomDateFromChange={setCustomDateFrom}
        customDateTo={customDateTo}
        onCustomDateToChange={setCustomDateTo}
        taxFilter={taxFilter}
        onTaxFilterChange={setTaxFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
        matchingCount={filteredVehicles.length}
        totalCount={vehicles.length}
        filteredVehicles={filteredVehicles}
      />

      {/* Vehicle Detail & Nebenkosten Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onUpdateVehicle={onUpdateVehicle}
          onDeleteVehicle={onDeleteVehicle}
          onAddExpense={onAddExpense}
          onDeleteExpense={onDeleteExpense}
          setActiveTab={setActiveTab}
          onEditVehicleMaster={onEditVehicleMaster}
        />
      )}

    </div>
  );
};
