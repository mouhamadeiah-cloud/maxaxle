import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  X, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Save, 
  Briefcase, 
  Tag, 
  Send,
  SlidersHorizontal,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Customer, NavTab } from '../types';
import { KundenCommandHub } from './kunden/KundenCommandHub';
import { KundenCard } from './kunden/KundenCard';
import { KundenSearchFilterModal, KundenDateRange } from './kunden/KundenSearchFilterModal';

interface KundenlisteViewProps {
  customers: Customer[];
  setActiveTab: (tab: NavTab) => void;
  onAddCustomer?: (customer: Partial<Customer>) => void;
  onUpdateCustomer?: (id: string, updates: Partial<Customer>) => void;
  onDeleteCustomer?: (id: string) => void;
  onSendToOperations?: (customer: Customer) => void;
}

export const KundenlisteView: React.FC<KundenlisteViewProps> = ({ 
  customers, 
  setActiveTab,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onSendToOperations
}) => {
  // Persistent View Mode (Horizontal Cards / List by default)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    try {
      const saved = localStorage.getItem('kunden_view_mode');
      if (saved === 'cards' || saved === 'table') return saved;
    } catch {
      // ignore
    }
    return 'table'; // Default is Separated Horizontal Floating List Cards
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    try {
      return localStorage.getItem('kunden_search_query') || '';
    } catch {
      return '';
    }
  });

  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('kunden_search_query');
    } catch {
      return false;
    }
  });
  
  // Persistent Filters (Default: all types, all dates, sorted from newest to oldest)
  const [typeFilter, setTypeFilter] = useState<'all' | 'B2C' | 'B2B'>(() => {
    try {
      const saved = localStorage.getItem('kunden_filter_type');
      if (saved === 'B2C' || saved === 'B2B') return saved;
    } catch {
      // ignore
    }
    return 'all';
  });

  const [dateRange, setDateRange] = useState<KundenDateRange>(() => {
    try {
      const saved = localStorage.getItem('kunden_filter_daterange');
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
      return localStorage.getItem('kunden_filter_custom_from') || '';
    } catch {
      return '';
    }
  });

  const [customDateTo, setCustomDateTo] = useState<string>(() => {
    try {
      return localStorage.getItem('kunden_filter_custom_to') || '';
    } catch {
      return '';
    }
  });

  const [sortBy, setSortBy] = useState<'recent' | 'name_asc' | 'name_desc' | 'spent_desc'>(() => {
    try {
      const saved = localStorage.getItem('kunden_filter_sortby');
      if (saved === 'name_asc' || saved === 'name_desc' || saved === 'spent_desc') return saved;
    } catch {
      // ignore
    }
    return 'recent'; // Default newest to oldest
  });

  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Auto scroll to top on modal open or filter change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [selectedCustomer, showAddModal, searchQuery, typeFilter, dateRange, sortBy]);

  // Sync filter changes to localStorage for continuous persistence across sessions
  useEffect(() => {
    try {
      localStorage.setItem('kunden_view_mode', viewMode);
      localStorage.setItem('kunden_search_query', searchQuery);
      localStorage.setItem('kunden_filter_type', typeFilter);
      localStorage.setItem('kunden_filter_daterange', dateRange);
      localStorage.setItem('kunden_filter_custom_from', customDateFrom);
      localStorage.setItem('kunden_filter_custom_to', customDateTo);
      localStorage.setItem('kunden_filter_sortby', sortBy);
    } catch {
      // ignore
    }
  }, [viewMode, searchQuery, typeFilter, dateRange, customDateFrom, customDateTo, sortBy]);

  // Auto-select and open customer detail card if requested by Max AI or navigation
  useEffect(() => {
    try {
      const targetCustId = localStorage.getItem('kunden_selected_customer_id');
      if (targetCustId) {
        const found = customers.find(c => c.id === targetCustId);
        if (found) {
          setSelectedCustomer(found);
        }
        localStorage.removeItem('kunden_selected_customer_id');
      }
    } catch {
      // ignore
    }
  }, [customers]);

  const [newCustomerData, setNewCustomerData] = useState<Partial<Customer>>({
    type: 'B2C',
    salutation: 'Herr',
    name: '',
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    street: '',
    postalCode: '',
    city: '',
    country: 'Deutschland',
    vatId: '',
    taxNumber: '',
    notes: ''
  });

  // Timestamp extraction helper for newest to oldest sorting (الأحدث للأقدم)
  const getCustomerTimestamp = (c: Customer): number => {
    if (c.updatedAt) {
      const t = new Date(c.updatedAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (c.createdAt) {
      const t = new Date(c.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (c.lastContact) {
      const parts = c.lastContact.split('.');
      if (parts.length === 3) {
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (!isNaN(d.getTime())) return d.getTime();
      }
      const t = new Date(c.lastContact).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    return 0;
  };

  // Filter & Search Logic with Date Range & Default Newest-to-Oldest Sorting
  const filteredCustomers = useMemo(() => {
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

    return customers
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || (
          c.name.toLowerCase().includes(q) ||
          (c.companyName && c.companyName.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.postalCode.toLowerCase().includes(q) ||
          (c.vatId && c.vatId.toLowerCase().includes(q)) ||
          (c.taxNumber && c.taxNumber.toLowerCase().includes(q)) ||
          (c.street && c.street.toLowerCase().includes(q))
        );

        // 1. Kundentyp Filter (Alle, B2C Privat, B2B Gewerbe)
        const matchesType = typeFilter === 'all' || c.type === typeFilter;

        // 2. Date Range Filter (Diesen Monat, Dieses Quartal, Dieses Jahr, Gesamt, Individuell)
        let matchesDate = true;
        const cTime = getCustomerTimestamp(c);

        if (dateRange === 'month') {
          matchesDate = cTime >= monthStart;
        } else if (dateRange === 'quarter') {
          matchesDate = cTime >= quarterStart;
        } else if (dateRange === 'year') {
          matchesDate = cTime >= yearStart;
        } else if (dateRange === 'custom') {
          if (customFromTime !== null && cTime < customFromTime) {
            matchesDate = false;
          }
          if (customToTime !== null && cTime > customToTime) {
            matchesDate = false;
          }
        }

        return matchesSearch && matchesType && matchesDate;
      })
      .sort((a, b) => {
        // Default: Newest to Oldest
        if (sortBy === 'recent') {
          return getCustomerTimestamp(b) - getCustomerTimestamp(a);
        }
        if (sortBy === 'name_asc') {
          const nameA = (a.companyName || a.name).toLowerCase();
          const nameB = (b.companyName || b.name).toLowerCase();
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'name_desc') {
          const nameA = (a.companyName || a.name).toLowerCase();
          const nameB = (b.companyName || b.name).toLowerCase();
          return nameB.localeCompare(nameA);
        }
        if (sortBy === 'spent_desc') {
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        }
        return 0;
      });
  }, [customers, searchQuery, typeFilter, dateRange, customDateFrom, customDateTo, sortBy]);

  const isFilterActive = 
    typeFilter !== 'all' || 
    dateRange !== 'all' || 
    sortBy !== 'recent' ||
    Boolean(customDateFrom) ||
    Boolean(customDateTo);

  const handleResetFilters = () => {
    setSearchQuery('');
    setIsSearchExpanded(false);
    setTypeFilter('all');
    setDateRange('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setSortBy('recent');
  };

  const handleOpenDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditFormData(customer);
    setIsEditing(false);
  };

  const handleCloseDetail = () => {
    setSelectedCustomer(null);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!selectedCustomer || !onUpdateCustomer) return;
    onUpdateCustomer(selectedCustomer.id, {
      ...editFormData,
      updatedAt: new Date().toISOString()
    });
    setSelectedCustomer({
      ...selectedCustomer,
      ...editFormData,
      updatedAt: new Date().toISOString()
    } as Customer);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diesen Kundendatensatz wirklich unwiderruflich löschen?')) {
      if (onDeleteCustomer) {
        onDeleteCustomer(id);
      }
      handleCloseDetail();
    }
  };

  const handleCopy = (text: string, field: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendToOperationsAction = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSendToOperations) {
      onSendToOperations(customer);
    }
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isB2B = newCustomerData.type === 'B2B';
    const displayName = isB2B 
      ? (newCustomerData.companyName || newCustomerData.name || 'Unbenannte Firma')
      : (newCustomerData.name || `${newCustomerData.firstName || ''} ${newCustomerData.lastName || ''}`.trim() || 'Neuer Kunde');

    const customerPayload: Partial<Customer> = {
      ...newCustomerData,
      name: displayName,
      purchasesCount: 0,
      totalSpent: 0,
      lastContact: new Date().toLocaleDateString('de-DE'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onAddCustomer) {
      onAddCustomer(customerPayload);
    }

    setShowAddModal(false);
    setNewCustomerData({
      type: 'B2C',
      salutation: 'Herr',
      name: '',
      firstName: '',
      lastName: '',
      companyName: '',
      email: '',
      phone: '',
      street: '',
      postalCode: '',
      city: '',
      country: 'Deutschland',
      vatId: '',
      taxNumber: '',
      notes: ''
    });
  };

  // Label text for compact filter status bar
  const dateRangeLabel = useMemo(() => {
    switch (dateRange) {
      case 'month': return 'Diesen Monat';
      case 'quarter': return 'Dieses Quartal';
      case 'year': return 'Dieses Jahr';
      case 'custom':
        if (customDateFrom && customDateTo) {
          return `${customDateFrom} bis ${customDateTo}`;
        }
        if (customDateFrom) return `Ab ${customDateFrom}`;
        if (customDateTo) return `Bis ${customDateTo}`;
        return 'Individuell';
      default: return 'Gesamtzeitraum';
    }
  }, [dateRange, customDateFrom, customDateTo]);

  const typeFilterLabel = useMemo(() => {
    switch (typeFilter) {
      case 'B2C': return 'Nur Privat (B2C)';
      case 'B2B': return 'Nur Gewerbe (B2B)';
      default: return 'Alle Kunden';
    }
  }, [typeFilter]);

  return (
    <div id="kundenliste-view-root" className="space-y-5 max-w-7xl mx-auto pb-24 relative">
      
      {/* ===================================================================== */}
      {/* 1. TOP BAR: COMPACT FILTER STATUS (LEFT) & COMMAND HUB (RIGHT)        */}
      {/* ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        
        {/* Left Side: Compact Filter Status Bar (Matching Mein Lager & Home) */}
        <div 
          id="kunden-filter-status-bar"
          className="flex items-center gap-2 flex-wrap text-xs select-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full metallic-card-luminous border border-slate-300/70 shadow-sm text-[#0e264b]">
            <span className="w-2 h-2 rounded-full jewel-emerald animate-pulse" />
            <span className="font-black text-[#0e264b]">
              {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Kunde' : 'Kunden'}
            </span>
            <span className="text-slate-300 font-bold">|</span>
            <span className="text-emerald-700 font-bold">{dateRangeLabel}</span>
            <span className="text-slate-300 font-bold">&bull;</span>
            <span className="text-[#1e3a5f] font-semibold">{typeFilterLabel}</span>

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
              id="btn-quick-reset-kunden-filters"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full metallic-card-luminous hover:bg-white/60 border border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b] text-[11px] font-bold transition cursor-pointer shadow-xs"
              title="Alle Filter & Suche zurücksetzen"
            >
              <RefreshCw className="w-3 h-3 text-[#1e3a5f]" />
              <span>Zurücksetzen</span>
            </button>
          )}
        </div>

        {/* Right Side: Command Hub (Expandable Search Bar, Filter Icon, Add Customer, View Toggles) */}
        <div className="shrink-0 flex justify-end">
          <KundenCommandHub
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            onOpenFilter={() => setIsSearchFilterOpen(true)}
            onOpenAddCustomer={() => setShowAddModal(true)}
            isFilterActive={isFilterActive}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearchExpanded={isSearchExpanded}
            setIsSearchExpanded={setIsSearchExpanded}
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. EMPTY STATE                                                        */}
      {/* ===================================================================== */}
      {filteredCustomers.length === 0 && (
        <div className="metallic-card-luminous rounded-3xl p-12 text-center shadow-sm space-y-3 text-[#0e264b]">
          <div className="w-14 h-14 mx-auto rounded-2xl metallic-node flex items-center justify-center text-[#0e264b] shadow-sm border border-slate-300/80">
            <Users className="w-7 h-7 text-[#0e264b] metallic-debossed-icon" />
          </div>
          <h3 className="text-base font-black text-[#0e264b]">Keine passenden Kunden gefunden</h3>
          <p className="text-xs text-[#1e3a5f]/80 max-w-md mx-auto">
            Für Ihre aktuellen Filter- oder Suchkriterien wurden keine Kundendatensätze gefunden.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-2xl shadow-sm transition cursor-pointer active:scale-95"
          >
            Filter & Suche zurücksetzen
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. SEPARATED & CLEAN HORIZONTAL CARDS (LIST VIEW - DEFAULT)           */}
      {/* ===================================================================== */}
      {viewMode === 'table' && filteredCustomers.length > 0 && (
        <div className="space-y-3 sm:space-y-3.5">
          {filteredCustomers.map((cust) => (
            <KundenCard
              key={cust.id}
              customer={cust}
              layout="row"
              onClick={() => handleOpenDetail(cust)}
              onSendToOperations={(e) => handleSendToOperationsAction(cust, e)}
            />
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. GRID CARDS VIEW                                                    */}
      {/* ===================================================================== */}
      {viewMode === 'cards' && filteredCustomers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredCustomers.map((cust) => (
            <KundenCard
              key={cust.id}
              customer={cust}
              layout="grid"
              onClick={() => handleOpenDetail(cust)}
              onSendToOperations={(e) => handleSendToOperationsAction(cust, e)}
            />
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. SEARCH & FILTER MODAL WITH TOP-ANCHORING & PDF/EXCEL EXPORT        */}
      {/* ===================================================================== */}
      <KundenSearchFilterModal
        isOpen={isSearchFilterOpen}
        onClose={() => setIsSearchFilterOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customDateFrom={customDateFrom}
        onCustomDateFromChange={setCustomDateFrom}
        customDateTo={customDateTo}
        onCustomDateToChange={setCustomDateTo}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
        matchingCount={filteredCustomers.length}
        totalCount={customers.length}
        filteredCustomers={filteredCustomers}
      />

      {/* ===================================================================== */}
      {/* 6. INTERACTIVE DETAIL MODAL (KUNDENAKTE)                              */}
      {/* ===================================================================== */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 pt-2 sm:pt-4 overflow-y-auto">
          <div 
            id="customer-detail-modal"
            className="metallic-modal-container rounded-3xl max-w-2xl w-full border border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-0 sm:my-2 text-slate-100 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-b border-slate-700/60 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-13 h-13 rounded-2xl metallic-node flex items-center justify-center shrink-0 shadow-md">
                  {selectedCustomer.type === 'B2B' ? (
                    <Building className="w-7 h-7 text-[#0e264b] metallic-debossed-icon" />
                  ) : (
                    <User className="w-7 h-7 text-[#0e264b] metallic-debossed-icon" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-slate-600/60 bg-slate-900/90 text-slate-300">
                      {selectedCustomer.type === 'B2B' ? 'Gewerbekunde (B2B)' : 'Privatperson (B2C)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {selectedCustomer.id}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white truncate mt-0.5">
                    {selectedCustomer.companyName || selectedCustomer.name}
                  </h2>
                  {selectedCustomer.companyName && (
                    <p className="text-xs text-slate-400">
                      Ansprechpartner: <span className="font-semibold text-emerald-300">{selectedCustomer.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Close button */}
              <button
                id="btn-modal-close-icon"
                onClick={handleCloseDetail}
                className="flex items-center gap-1.5 px-3 py-1.5 metallic-btn-secondary text-slate-300 hover:text-white rounded-xl transition cursor-pointer text-xs font-bold active:scale-95"
                title="Fenster schließen"
              >
                <X className="w-4 h-4 metallic-debossed-icon" />
                <span>× Schließen</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              
              {/* Stat summary pills */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 metallic-card rounded-2xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-[#1e3a5f] uppercase font-bold tracking-wider">Gesamtumsatz</div>
                  <div className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">
                    {selectedCustomer.totalSpent.toLocaleString('de-DE')} €
                  </div>
                </div>
                <div className="p-3.5 metallic-card rounded-2xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-[#1e3a5f] uppercase font-bold tracking-wider">Gekaufte Fahrzeuge</div>
                  <div className="text-base sm:text-lg font-black text-[#0e264b] mt-0.5">
                    {selectedCustomer.purchasesCount}
                  </div>
                </div>
                <div className="p-3.5 metallic-card rounded-2xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-[#1e3a5f] uppercase font-bold tracking-wider">Letzter Kontakt</div>
                  <div className="text-xs sm:text-sm font-bold text-[#0e264b] mt-1 truncate">
                    {selectedCustomer.lastContact || 'Heute'}
                  </div>
                </div>
              </div>

              {/* Edit vs View Mode */}
              {!isEditing ? (
                <div className="space-y-4 text-xs">
                  {/* Contact & Address Section */}
                  <div className="p-4 metallic-card rounded-2xl border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0e264b] text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 metallic-debossed-icon" />
                        <span>Stammdaten & Anschrift</span>
                      </span>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-xs cursor-pointer active:scale-95"
                      >
                        <Edit2 className="w-3.5 h-3.5 metallic-debossed-icon" />
                        <span>Bearbeiten</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#1e3a5f]">
                      <div>
                        <span className="text-[#1e3a5f]/70 block text-[11px] font-semibold">E-Mail-Adresse:</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-[#0e264b]">{selectedCustomer.email}</span>
                          <button
                            onClick={(e) => handleCopy(selectedCustomer.email, 'email', e)}
                            className="text-[#1e3a5f] hover:text-emerald-700 p-0.5 cursor-pointer"
                            title="E-Mail kopieren"
                          >
                            {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600 metallic-debossed-icon" /> : <Copy className="w-3.5 h-3.5 metallic-debossed-icon" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[#1e3a5f]/70 block text-[11px] font-semibold">Telefonnummer:</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-mono">
                          <span className="font-semibold text-[#0e264b]">{selectedCustomer.phone}</span>
                          <button
                            onClick={(e) => handleCopy(selectedCustomer.phone, 'phone', e)}
                            className="text-[#1e3a5f] hover:text-emerald-700 p-0.5 cursor-pointer"
                            title="Telefon kopieren"
                          >
                            {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600 metallic-debossed-icon" /> : <Copy className="w-3.5 h-3.5 metallic-debossed-icon" />}
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-[#1e3a5f]/70 block text-[11px] font-semibold">Postanschrift:</span>
                        <span className="font-semibold text-[#0e264b] block mt-0.5">
                          {selectedCustomer.street}, {selectedCustomer.postalCode} {selectedCustomer.city} ({selectedCustomer.country || 'Deutschland'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Commercial Tax & Legal Data (B2B) */}
                  {selectedCustomer.type === 'B2B' && (
                    <div className="p-4 metallic-card rounded-2xl border border-slate-700/60 space-y-3">
                      <span className="font-bold text-[#0e264b] text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-600 metallic-debossed-icon" />
                        <span>Steuer- & Unternehmensdaten</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#1e3a5f]">
                        <div>
                          <span className="text-[#1e3a5f]/70 block text-[11px] font-semibold">USt-IdNr. (VAT ID):</span>
                          <span className="font-mono font-bold text-emerald-700 block mt-0.5">
                            {selectedCustomer.vatId || 'Nicht hinterlegt'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#1e3a5f]/70 block text-[11px] font-semibold">Steuernummer:</span>
                          <span className="font-mono font-bold text-emerald-700 block mt-0.5">
                            {selectedCustomer.taxNumber || 'Nicht hinterlegt'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes & Preferences */}
                  <div className="p-4 metallic-card rounded-2xl border border-slate-700/60 space-y-1.5">
                    <span className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-700 metallic-debossed-icon" />
                      <span>Notizen & Kundenpräferenzen</span>
                    </span>
                    <p className="text-[#1e3a5f] leading-relaxed">
                      {selectedCustomer.notes || 'Keine internen Notizen hinterlegt.'}
                    </p>
                  </div>
                </div>
              ) : (
                /* INLINE EDIT FORM */
                <div className="space-y-4 text-xs">
                  <div className="p-4 metallic-card rounded-2xl border border-slate-700/60 space-y-3">
                    <div className="font-bold text-emerald-700 text-sm">Kundendaten bearbeiten</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedCustomer.type === 'B2B' ? (
                        <div className="sm:col-span-2">
                          <label className="block text-[#1e3a5f] mb-1 font-semibold">Firmenname</label>
                          <input
                            type="text"
                            value={editFormData.companyName || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                            className="w-full p-2.5 metallic-input rounded-xl text-xs text-[#0e264b]"
                          />
                        </div>
                      ) : null}

                      <div>
                        <label className="block text-[#1e3a5f] mb-1 font-semibold">Name / Ansprechpartner</label>
                        <input
                          type="text"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full p-2.5 metallic-input rounded-xl text-xs text-[#0e264b]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#1e3a5f] mb-1 font-semibold">E-Mail</label>
                        <input
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="w-full p-2.5 metallic-input rounded-xl text-xs text-[#0e264b]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#1e3a5f] mb-1 font-semibold">Telefon</label>
                        <input
                          type="text"
                          value={editFormData.phone || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="w-full p-2.5 metallic-input rounded-xl text-xs font-mono text-[#0e264b]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#1e3a5f] mb-1 font-semibold">Straße & Nr.</label>
                        <input
                          type="text"
                          value={editFormData.street || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, street: e.target.value })}
                          className="w-full p-2.5 metallic-input rounded-xl text-xs text-[#0e264b]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#1e3a5f] mb-1 font-semibold">PLZ</label>
                        <input
                          type="text"
                          value={editFormData.postalCode || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, postalCode: e.target.value })}
                          className="w-full p-2.5 metallic-input rounded-xl text-xs text-[#0e264b]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#1e3a5f] mb-1 font-semibold">Stadt / Ort</label>
                        <input
                          type="text"
                          value={editFormData.city || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                          className="w-full p-2.5 metallic-input rounded-xl text-xs text-[#0e264b]"
                        />
                      </div>

                      {selectedCustomer.type === 'B2B' && (
                        <>
                          <div>
                            <label className="block text-[#1e3a5f] mb-1 font-semibold">USt-IdNr.</label>
                            <input
                              type="text"
                              value={editFormData.vatId || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, vatId: e.target.value })}
                              className="w-full p-2.5 metallic-input rounded-xl text-xs font-mono text-[#0e264b]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#1e3a5f] mb-1 font-semibold">Steuernummer</label>
                            <input
                              type="text"
                              value={editFormData.taxNumber || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, taxNumber: e.target.value })}
                              className="w-full p-2.5 metallic-input rounded-xl text-xs font-mono text-[#0e264b]"
                            />
                          </div>
                        </>
                      )}

                      <div className="sm:col-span-2">
                        <label className="block text-[#1e3a5f] mb-1 font-semibold">Notizen</label>
                        <textarea
                          rows={2}
                          value={editFormData.notes || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                          className="w-full p-2.5 metallic-input rounded-xl text-xs text-[#0e264b]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3.5 py-2 metallic-btn-secondary text-slate-300 font-bold rounded-xl text-xs cursor-pointer active:scale-95"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 metallic-btn-primary text-[#091a34] font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                      >
                        <Save className="w-3.5 h-3.5 metallic-debossed-icon" />
                        <span>Änderungen speichern</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 bg-gradient-to-t from-slate-950 to-slate-900/90 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id="btn-modal-delete-customer"
                  onClick={() => handleDelete(selectedCustomer.id)}
                  className="px-3.5 py-2 text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-4 h-4 metallic-debossed-icon" />
                  <span>Löschen</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  id="btn-modal-close-footer"
                  onClick={handleCloseDetail}
                  className="px-4.5 py-2 metallic-btn-secondary text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer active:scale-95"
                >
                  × Schließen
                </button>
                <button
                  id="btn-modal-send-to-operations"
                  onClick={(e) => handleSendToOperationsAction(selectedCustomer, e)}
                  className="px-5 py-2 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-[#091a34] metallic-debossed-icon" />
                  <span>In den Hub übernehmen</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. ADD CUSTOMER MODAL                                                 */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 pt-2 sm:pt-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="metallic-modal-container rounded-3xl max-w-xl w-full border border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-0 sm:my-2 text-slate-100 animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreateCustomerSubmit}>
              
              {/* Header */}
              <div className="p-6 bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-b border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-md">
                    <Plus className="w-5 h-5 text-[#0e264b] stroke-[3] metallic-debossed-icon" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Neuen Kunden anlegen</h2>
                    <p className="text-xs text-slate-400">Stammdaten erfassen und in Firebase synchronisieren</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-2 metallic-btn-secondary text-slate-300 hover:text-white rounded-xl transition cursor-pointer active:scale-95"
                >
                  <X className="w-5 h-5 metallic-debossed-icon" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                {/* Type Selection */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Kundentyp</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewCustomerData({ ...newCustomerData, type: 'B2C' })}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer active:scale-95 ${
                        newCustomerData.type === 'B2C'
                          ? 'metallic-btn-primary text-[#091a34] font-black shadow-md'
                          : 'metallic-btn-secondary text-slate-300'
                      }`}
                    >
                      <User className="w-4 h-4 metallic-debossed-icon" />
                      <span>Privatperson (B2C)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCustomerData({ ...newCustomerData, type: 'B2B' })}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer active:scale-95 ${
                        newCustomerData.type === 'B2B'
                          ? 'metallic-btn-primary text-[#091a34] font-black shadow-md'
                          : 'metallic-btn-secondary text-slate-300'
                      }`}
                    >
                      <Building className="w-4 h-4 metallic-debossed-icon" />
                      <span>Gewerbekunde (B2B)</span>
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {newCustomerData.type === 'B2B' && (
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-bold mb-1">Firmenname *</label>
                      <input
                        type="text"
                        required
                        value={newCustomerData.companyName || ''}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, companyName: e.target.value })}
                        placeholder="z.B. Schmidt Fuhrpark & Logistik GmbH"
                        className="w-full p-2.5 metallic-input rounded-xl text-white placeholder-slate-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {newCustomerData.type === 'B2B' ? 'Ansprechpartner' : 'Vollständiger Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newCustomerData.name || ''}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                      placeholder="z.B. Max Mustermann"
                      className="w-full p-2.5 metallic-input rounded-xl text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">E-Mail-Adresse *</label>
                    <input
                      type="email"
                      required
                      value={newCustomerData.email || ''}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                      placeholder="kunde@domain.de"
                      className="w-full p-2.5 metallic-input rounded-xl text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Telefon / Mobil *</label>
                    <input
                      type="text"
                      required
                      value={newCustomerData.phone || ''}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                      placeholder="+49 30 12345678"
                      className="w-full p-2.5 metallic-input rounded-xl text-white placeholder-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Straße & Hausnummer</label>
                    <input
                      type="text"
                      value={newCustomerData.street || ''}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, street: e.target.value })}
                      placeholder="Musterstraße 12"
                      className="w-full p-2.5 metallic-input rounded-xl text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Postleitzahl (PLZ)</label>
                    <input
                      type="text"
                      value={newCustomerData.postalCode || ''}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, postalCode: e.target.value })}
                      placeholder="10115"
                      className="w-full p-2.5 metallic-input rounded-xl text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Stadt / Ort</label>
                    <input
                      type="text"
                      value={newCustomerData.city || ''}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, city: e.target.value })}
                      placeholder="Berlin"
                      className="w-full p-2.5 metallic-input rounded-xl text-white placeholder-slate-500"
                    />
                  </div>

                  {newCustomerData.type === 'B2B' && (
                    <>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">USt-IdNr.</label>
                        <input
                          type="text"
                          value={newCustomerData.vatId || ''}
                          onChange={(e) => setNewCustomerData({ ...newCustomerData, vatId: e.target.value })}
                          placeholder="DE 123456789"
                          className="w-full p-2.5 metallic-input rounded-xl text-white placeholder-slate-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Steuernummer</label>
                        <input
                          type="text"
                          value={newCustomerData.taxNumber || ''}
                          onChange={(e) => setNewCustomerData({ ...newCustomerData, taxNumber: e.target.value })}
                          placeholder="27/123/45678"
                          className="w-full p-2.5 metallic-input rounded-xl text-white placeholder-slate-500 font-mono"
                        />
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-bold mb-1">Interne Notizen</label>
                    <textarea
                      rows={2}
                      value={newCustomerData.notes || ''}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, notes: e.target.value })}
                      placeholder="z.B. Barzahler, bevorzugt Limousinen..."
                      className="w-full p-2.5 metallic-input rounded-xl text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 bg-gradient-to-t from-slate-950 to-slate-900/90 border-t border-slate-700/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 metallic-btn-secondary text-slate-300 font-bold rounded-xl transition cursor-pointer active:scale-95"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 metallic-btn-primary text-[#091a34] font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-4 h-4 metallic-debossed-icon" />
                  <span>Kunde speichern</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
