import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Building2, 
  CreditCard, 
  Banknote,
  Send,
  Eye, 
  Car, 
  Compass, 
  FileCheck2, 
  ShieldCheck, 
  Timer, 
  AlertTriangle, 
  Layers, 
  MapPin, 
  Calendar, 
  User, 
  KeyRound, 
  FileSignature, 
  FileX2, 
  FileBadge, 
  Mail, 
  FolderTree, 
  HardDrive, 
  Check, 
  ChevronRight, 
  FolderCheck, 
  FolderSync, 
  SlidersHorizontal,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  Invoice, 
  TaxType, 
  NavTab, 
  OperationDocument, 
  MerchantSettings, 
  InvoiceStatus, 
  InvoiceCategory 
} from '../types';
import { firebaseService } from '../services/firebaseService';
import { DocumentPreviewModal } from './operationen/DocumentPreviewModal';
import { PaymentModal } from './invoices/PaymentModal';
import { StornoModal } from './invoices/StornoModal';
import { GutschriftModal } from './invoices/GutschriftModal';
import { MahnungModal } from './invoices/MahnungModal';
import { InvoiceFullPdfModal } from './invoices/InvoiceFullPdfModal';
import { HorizontalInvoiceCard } from './invoices/HorizontalInvoiceCard';
import { RechnungenCommandHub } from './invoices/RechnungenCommandHub';
import { RechnungenSearchFilterModal, RechnungenTimeFilter } from './invoices/RechnungenSearchFilterModal';
import { exportInvoicesToCsv } from '../utils/exportUtils';

interface RechnungslisteViewProps {
  invoices: Invoice[];
  setActiveTab: (tab: NavTab) => void;
}

type ArchiveSection = 'invoices' | 'probefahrt' | 'uebergabeprotokoll';

export const RechnungslisteView: React.FC<RechnungslisteViewProps> = ({ 
  invoices: propInvoices, 
  setActiveTab 
}) => {
  const [activeSection, setActiveSection] = useState<ArchiveSection>('invoices');
  const [liveInvoices, setLiveInvoices] = useState<Invoice[]>(propInvoices);
  const [operations, setOperations] = useState<OperationDocument[]>([]);
  const [merchantSettings, setMerchantSettings] = useState<MerchantSettings>(() => firebaseService.getMerchantSettings());
  
  // Persistent View Mode
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return localStorage.getItem('rechnungen_search_query') || '';
    } catch {
      return '';
    }
  });

  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('rechnungen_search_query');
    } catch {
      return false;
    }
  });

  const [statusFilter, setStatusFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('rechnungen_status_filter') || 'all';
    } catch {
      return 'all';
    }
  });

  const [typeFilter, setTypeFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('rechnungen_type_filter') || 'all';
    } catch {
      return 'all';
    }
  });

  const [taxFilter, setTaxFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('rechnungen_tax_filter') || 'all';
    } catch {
      return 'all';
    }
  });

  const [folderFilter, setFolderFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('rechnungen_folder_filter') || 'all';
    } catch {
      return 'all';
    }
  });

  const [timeFilter, setTimeFilter] = useState<RechnungenTimeFilter>(() => {
    try {
      const saved = localStorage.getItem('rechnungen_time_filter');
      if (saved && ['all', 'today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'last_year', 'custom'].includes(saved)) {
        return saved as RechnungenTimeFilter;
      }
    } catch {
      // ignore
    }
    return 'all';
  });

  const [dateFrom, setDateFrom] = useState<string>(() => {
    try {
      return localStorage.getItem('rechnungen_date_from') || '';
    } catch {
      return '';
    }
  });

  const [dateTo, setDateTo] = useState<string>(() => {
    try {
      return localStorage.getItem('rechnungen_date_to') || '';
    } catch {
      return '';
    }
  });

  const [amountMin, setAmountMin] = useState<number | undefined>(() => {
    try {
      const saved = localStorage.getItem('rechnungen_amount_min');
      return saved ? parseFloat(saved) : undefined;
    } catch {
      return undefined;
    }
  });

  const [amountMax, setAmountMax] = useState<number | undefined>(() => {
    try {
      const saved = localStorage.getItem('rechnungen_amount_max');
      return saved ? parseFloat(saved) : undefined;
    } catch {
      return undefined;
    }
  });

  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'number'>(() => {
    try {
      const saved = localStorage.getItem('rechnungen_sort_by');
      if (saved && ['date_desc', 'date_asc', 'amount_desc', 'amount_asc', 'number'].includes(saved)) {
        return saved as any;
      }
    } catch {
      // ignore
    }
    return 'date_desc';
  });
  
  // Storage & Directory Options
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(() => {
    return localStorage.getItem('auto_mgmt_invoice_autosave') !== 'false';
  });

  // Filter Modal State (opens on demand)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Modals state
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [stornoInvoice, setStornoInvoice] = useState<Invoice | null>(null);
  const [gutschriftInvoice, setGutschriftInvoice] = useState<Invoice | null>(null);
  const [mahnungInvoice, setMahnungInvoice] = useState<Invoice | null>(null);
  const [previewOperation, setPreviewOperation] = useState<OperationDocument | null>(null);

  // Robust Helper to parse dates into comparable Local Day Timestamps (eliminating UTC timezone skews)
  const parseDateToNormalizedTimestamp = (dateStr: string | undefined | null): number | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const clean = dateStr.trim();
    if (!clean) return null;

    // Handle DD.MM.YYYY (German format)
    if (clean.includes('.')) {
      const parts = clean.split('.');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          const dt = new Date(y, m, d, 0, 0, 0, 0);
          return isNaN(dt.getTime()) ? null : dt.getTime();
        }
      }
    }

    // Handle YYYY-MM-DD (ISO/input format)
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2].substring(0, 2), 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          const dt = new Date(y, m, d, 0, 0, 0, 0);
          return isNaN(dt.getTime()) ? null : dt.getTime();
        }
      }
    }

    // Fallback standard parse
    const fallback = new Date(clean);
    if (!isNaN(fallback.getTime())) {
      fallback.setHours(0, 0, 0, 0);
      return fallback.getTime();
    }
    return null;
  };

  // Sync state from LocalStorage when externally updated (e.g. by Max AI)
  const syncFiltersFromLocalStorage = () => {
    try {
      const q = localStorage.getItem('rechnungen_search_query');
      if (q !== null) {
        setSearchQuery(q);
        if (q) setIsSearchExpanded(true);
      }
      const st = localStorage.getItem('rechnungen_status_filter');
      if (st) setStatusFilter(st);

      const tp = localStorage.getItem('rechnungen_type_filter');
      if (tp) setTypeFilter(tp);

      const tx = localStorage.getItem('rechnungen_tax_filter');
      if (tx) setTaxFilter(tx);

      const fd = localStorage.getItem('rechnungen_folder_filter');
      if (fd) setFolderFilter(fd);

      const tf = localStorage.getItem('rechnungen_time_filter');
      if (tf && ['all', 'today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'last_year', 'custom'].includes(tf)) {
        setTimeFilter(tf as RechnungenTimeFilter);
      }

      const df = localStorage.getItem('rechnungen_date_from');
      if (df !== null) setDateFrom(df);

      const dt = localStorage.getItem('rechnungen_date_to');
      if (dt !== null) setDateTo(dt);

      const sMin = localStorage.getItem('rechnungen_amount_min');
      setAmountMin(sMin ? parseFloat(sMin) : undefined);

      const sMax = localStorage.getItem('rechnungen_amount_max');
      setAmountMax(sMax ? parseFloat(sMax) : undefined);

      const sBy = localStorage.getItem('rechnungen_sort_by');
      if (sBy && ['date_desc', 'date_asc', 'amount_desc', 'amount_asc', 'number'].includes(sBy)) {
        setSortBy(sBy as any);
      }
    } catch {
      // ignore
    }
  };

  // Listen for live external filter synchronization events (from Max AI or other tabs)
  useEffect(() => {
    const handleSync = () => {
      syncFiltersFromLocalStorage();
    };

    window.addEventListener('maxai_rechnungen_sync', handleSync);
    window.addEventListener('storage', handleSync);

    // Initial check on mount
    syncFiltersFromLocalStorage();

    return () => {
      window.removeEventListener('maxai_rechnungen_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Sync filter states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rechnungen_search_query', searchQuery);
      localStorage.setItem('rechnungen_status_filter', statusFilter);
      localStorage.setItem('rechnungen_type_filter', typeFilter);
      localStorage.setItem('rechnungen_tax_filter', taxFilter);
      localStorage.setItem('rechnungen_folder_filter', folderFilter);
      localStorage.setItem('rechnungen_time_filter', timeFilter);
      localStorage.setItem('rechnungen_date_from', dateFrom);
      localStorage.setItem('rechnungen_date_to', dateTo);
      if (amountMin !== undefined) localStorage.setItem('rechnungen_amount_min', String(amountMin));
      else localStorage.removeItem('rechnungen_amount_min');
      if (amountMax !== undefined) localStorage.setItem('rechnungen_amount_max', String(amountMax));
      else localStorage.removeItem('rechnungen_amount_max');
      localStorage.setItem('rechnungen_sort_by', sortBy);
    } catch {
      // ignore
    }
  }, [searchQuery, statusFilter, typeFilter, taxFilter, folderFilter, timeFilter, dateFrom, dateTo, amountMin, amountMax, sortBy]);

  // Auto-select invoice if requested by Max AI or external navigation
  useEffect(() => {
    try {
      const targetPayInvId = localStorage.getItem('rechnungen_payment_invoice_id');
      if (targetPayInvId) {
        const foundPay = liveInvoices.find(inv => inv.id === targetPayInvId || inv.invoiceNumber === targetPayInvId);
        if (foundPay) {
          setPaymentInvoice(foundPay);
        }
        localStorage.removeItem('rechnungen_payment_invoice_id');
      }

      const targetInvId = localStorage.getItem('rechnungen_selected_invoice_id');
      if (targetInvId) {
        const found = liveInvoices.find(inv => inv.id === targetInvId || inv.invoiceNumber === targetInvId);
        if (found) {
          setPreviewInvoice(found);
        }
        localStorage.removeItem('rechnungen_selected_invoice_id');
      }
    } catch {
      // ignore
    }
  }, [liveInvoices]);

  // Subscribe to live invoices, operations and merchant settings
  useEffect(() => {
    const unsubInvoices = firebaseService.subscribeInvoices((invs) => {
      setLiveInvoices(invs);
    });
    const unsubOps = firebaseService.subscribeOperations(setOperations);
    const unsubSettings = firebaseService.subscribeMerchantSettings(setMerchantSettings);
    return () => {
      unsubInvoices();
      unsubOps();
      unsubSettings();
    };
  }, []);

  // Update liveInvoices if propInvoices changes
  useEffect(() => {
    if (propInvoices && propInvoices.length > 0) {
      setLiveInvoices(propInvoices);
    }
  }, [propInvoices]);

  // Guarantee view scrolls to the very top immediately upon mounting or section/modal change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [activeSection, previewInvoice, paymentInvoice, stornoInvoice, gutschriftInvoice, mahnungInvoice, previewOperation]);

  const handleToggleAutoSave = () => {
    const newVal = !autoSaveEnabled;
    setAutoSaveEnabled(newVal);
    localStorage.setItem('auto_mgmt_invoice_autosave', String(newVal));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setIsSearchExpanded(false);
    setStatusFilter('all');
    setTypeFilter('all');
    setTaxFilter('all');
    setFolderFilter('all');
    setTimeFilter('all');
    setDateFrom('');
    setDateTo('');
    setAmountMin(undefined);
    setAmountMax(undefined);
    setSortBy('date_desc');
  };

  const isFilterActive = 
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    taxFilter !== 'all' ||
    folderFilter !== 'all' ||
    timeFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    amountMin !== undefined ||
    amountMax !== undefined ||
    sortBy !== 'date_desc';

  // Filtered invoices logic
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

    const dayOfWeek = now.getDay();
    const distToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMon);
    const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMon - 7);
    const lastWeekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMon - 1, 23, 59, 59, 999);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

    return liveInvoices.filter((inv) => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !searchLower ||
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.customerName.toLowerCase().includes(searchLower) ||
        inv.vehicleTitle.toLowerCase().includes(searchLower) ||
        inv.vin.toLowerCase().includes(searchLower) ||
        (inv.notes && inv.notes.toLowerCase().includes(searchLower));

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'offen') {
          matchesStatus = inv.status === 'offen';
        } else if (statusFilter === 'bezahlt') {
          matchesStatus = inv.status === 'bezahlt';
        } else if (statusFilter === 'teilbezahlt') {
          matchesStatus = inv.status === 'teilbezahlt';
        } else if (statusFilter === 'storniert') {
          matchesStatus = inv.status === 'storniert' || inv.invoiceCategory === 'storno';
        }
      }

      let matchesType = true;
      if (typeFilter !== 'all') {
        if (typeFilter === 'rechnung') {
          matchesType = (!inv.invoiceCategory || inv.invoiceCategory === 'rechnung') && inv.status !== 'storniert';
        } else if (typeFilter === 'eu_export') {
          matchesType = inv.invoiceCategory === 'eu_export' || inv.documentType === 'eu_export';
        } else if (typeFilter === 'export') {
          matchesType = inv.invoiceCategory === 'export_drittland' || inv.documentType === 'export_drittland';
        } else if (typeFilter === 'storno') {
          matchesType = inv.invoiceCategory === 'storno' || inv.status === 'storniert' || inv.invoiceNumber.startsWith('STORNO');
        } else if (typeFilter === 'gutschrift') {
          matchesType = inv.invoiceCategory === 'gutschrift' || inv.invoiceNumber.startsWith('GS-');
        }
      }

      const matchesTax = taxFilter === 'all' || inv.taxType === taxFilter;

      let matchesFolder = true;
      if (folderFilter === 'current_year') {
        matchesFolder = inv.date.includes('2026') || (inv.dueDate && inv.dueDate.includes('2026'));
      } else if (folderFilter === 'export_folder') {
        matchesFolder = inv.invoiceCategory === 'eu_export' || inv.invoiceCategory === 'export_drittland';
      } else if (folderFilter === 'storno_folder') {
        matchesFolder = inv.status === 'storniert' || inv.invoiceCategory === 'storno' || inv.invoiceCategory === 'gutschrift';
      }

      // Temporal and date range matching
      const invTimestamp = parseDateToNormalizedTimestamp(inv.date);
      let matchesDate = true;
      if (invTimestamp !== null) {
        // Explicit Custom Range or when dateFrom / dateTo are specified
        if (timeFilter === 'custom' || ((dateFrom || dateTo) && timeFilter === 'all')) {
          if (dateFrom) {
            const fromTs = parseDateToNormalizedTimestamp(dateFrom);
            if (fromTs !== null && invTimestamp < fromTs) {
              matchesDate = false;
            }
          }
          if (dateTo) {
            const toTs = parseDateToNormalizedTimestamp(dateTo);
            if (toTs !== null) {
              // Include the entire day: 00:00:00 to 23:59:59.999
              const endOfToDay = toTs + 86399999;
              if (invTimestamp > endOfToDay) {
                matchesDate = false;
              }
            }
          }
        } else if (timeFilter === 'today') {
          matchesDate = invTimestamp >= todayStart.getTime() && invTimestamp <= todayEnd.getTime();
        } else if (timeFilter === 'yesterday') {
          matchesDate = invTimestamp >= yesterdayStart.getTime() && invTimestamp <= yesterdayEnd.getTime();
        } else if (timeFilter === 'this_week') {
          matchesDate = invTimestamp >= thisWeekStart.getTime() && invTimestamp <= todayEnd.getTime();
        } else if (timeFilter === 'last_week') {
          matchesDate = invTimestamp >= lastWeekStart.getTime() && invTimestamp <= lastWeekEnd.getTime();
        } else if (timeFilter === 'this_month') {
          matchesDate = invTimestamp >= thisMonthStart.getTime() && invTimestamp <= todayEnd.getTime();
        } else if (timeFilter === 'last_month') {
          matchesDate = invTimestamp >= lastMonthStart.getTime() && invTimestamp <= lastMonthEnd.getTime();
        } else if (timeFilter === 'this_year') {
          matchesDate = invTimestamp >= thisYearStart.getTime() && invTimestamp <= todayEnd.getTime();
        } else if (timeFilter === 'last_year') {
          matchesDate = invTimestamp >= lastYearStart.getTime() && invTimestamp <= lastYearEnd.getTime();
        }
      }

      // Financial Amount Bounds
      let matchesAmount = true;
      const invGross = Number(inv.amountGross) || 0;
      if (amountMin !== undefined && invGross < amountMin) {
        matchesAmount = false;
      }
      if (amountMax !== undefined && invGross > amountMax) {
        matchesAmount = false;
      }

      return matchesSearch && matchesStatus && matchesType && matchesTax && matchesFolder && matchesDate && matchesAmount;
    }).sort((a, b) => {
      if (sortBy === 'date_asc') {
        return a.date.localeCompare(b.date);
      }
      if (sortBy === 'amount_desc') {
        return b.amountGross - a.amountGross;
      }
      if (sortBy === 'amount_asc') {
        return a.amountGross - b.amountGross;
      }
      if (sortBy === 'number') {
        return b.invoiceNumber.localeCompare(a.invoiceNumber);
      }
      return b.date.localeCompare(a.date) || b.invoiceNumber.localeCompare(a.invoiceNumber);
    });
  }, [liveInvoices, searchQuery, statusFilter, typeFilter, taxFilter, folderFilter, dateFrom, dateTo, amountMin, amountMax, timeFilter, sortBy]);

  const probefahrten = operations.filter(o => o.documentType === 'probefahrt');
  const filteredProbefahrten = probefahrten.filter((pf) => {
    const d = pf.probefahrtDetails;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      pf.documentNumber.toLowerCase().includes(searchLower) ||
      (d?.driverName && d.driverName.toLowerCase().includes(searchLower)) ||
      (d?.redLicensePlate && d.redLicensePlate.toLowerCase().includes(searchLower)) ||
      (d?.brand && d.brand.toLowerCase().includes(searchLower)) ||
      (d?.model && d.model.toLowerCase().includes(searchLower)) ||
      (d?.vin && d.vin.toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === 'all' || pf.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const uebergabeprotokolle = operations.filter(o => o.documentType === 'uebergabeprotokoll');
  const filteredUebergabeprotokolle = uebergabeprotokolle.filter((uep) => {
    const d = uep.uebergabeprotokollDetails;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      uep.documentNumber.toLowerCase().includes(searchLower) ||
      (d?.buyerName && d.buyerName.toLowerCase().includes(searchLower)) ||
      (d?.brand && d.brand.toLowerCase().includes(searchLower)) ||
      (d?.model && d.model.toLowerCase().includes(searchLower)) ||
      (d?.vin && d.vin.toLowerCase().includes(searchLower)) ||
      (d?.licensePlate && d.licensePlate.toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === 'all' || uep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBilled = liveInvoices.reduce((sum, i) => sum + i.amountGross, 0);
  const totalOpen = liveInvoices
    .filter(i => i.status === 'offen' || i.status === 'teilbezahlt')
    .reduce((sum, i) => {
      const paid = Number(i.amountPaid) || 0;
      return sum + Math.max(0, i.amountGross - paid);
    }, 0);

  // Status label for compact status bar
  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case 'bezahlt':
        return 'Nur Bezahlt (🟢)';
      case 'teilbezahlt':
        return 'Teilbezahlt (🟡)';
      case 'offen':
        return 'Nur Offen (🟠)';
      case 'storniert':
        return 'Storniert (🔴)';
      default:
        return 'Alle Statusse';
    }
  };

  // Time filter label for compact status bar
  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today':
        return 'Heute';
      case 'yesterday':
        return 'Gestern';
      case 'this_week':
        return 'Diese Woche';
      case 'last_week':
        return 'Letzte Woche';
      case 'this_month':
        return 'Diesen Monat';
      case 'last_month':
        return 'Letzten Monat';
      case 'this_year':
        return 'Dieses Jahr';
      case 'last_year':
        return 'Letztes Jahr';
      case 'custom':
        if (dateFrom && dateTo) return `${dateFrom} bis ${dateTo}`;
        if (dateFrom) return `Ab ${dateFrom}`;
        if (dateTo) return `Bis ${dateTo}`;
        return 'Individuell';
      default:
        return 'Gesamtzeitraum';
    }
  };

  const handleExportCsv = () => {
    exportInvoicesToCsv(filteredInvoices, 'Rechnungsarchiv_Export');
  };

  return (
    <div id="rechnungsliste-view-root" className="space-y-5 max-w-7xl mx-auto pb-16">
      
      {/* ========================================================================= */}
      {/* TOP COMMAND BAR: COMPACT STATUS ON LEFT + COMMAND HUB ICONS ON RIGHT      */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        
        {/* Left Side: Compact Filter Status Bar */}
        <div id="rechnungen-filter-status-bar" className="flex items-center gap-2 flex-wrap text-xs select-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full metallic-card-luminous border border-slate-300/70 shadow-sm text-slate-800">
            <span className="w-2 h-2 rounded-full jewel-emerald animate-pulse" />
            <span className="font-black text-[#0e264b]">
              {activeSection === 'invoices' ? `${filteredInvoices.length} ${filteredInvoices.length === 1 ? 'Beleg' : 'Belege'}` : activeSection === 'probefahrt' ? `${filteredProbefahrten.length} Probefahrten` : `${filteredUebergabeprotokolle.length} Übergabeprotokolle`}
            </span>
            <span className="text-slate-300 font-bold">|</span>
            <span className="text-emerald-700 font-bold">{getTimeFilterLabel()}</span>
            <span className="text-slate-300 font-bold">&bull;</span>
            <span className="text-slate-700 font-semibold">{getStatusFilterLabel()}</span>
            
            {activeSection === 'invoices' && (
              <>
                <span className="text-slate-300 font-bold">&bull;</span>
                <span className="text-emerald-700 font-bold">
                  Offen: {totalOpen.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                </span>
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
              id="btn-quick-reset-rechnungen-filters"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full metallic-card-luminous hover:bg-white/60 border border-slate-300/70 text-slate-700 hover:text-slate-950 text-[11px] font-bold transition cursor-pointer shadow-xs"
              title="Alle Filter & Suche zurücksetzen"
            >
              <RefreshCw className="w-3 h-3 text-slate-600" />
              <span>Zurücksetzen</span>
            </button>
          )}
        </div>

        {/* Right Side: Rechnungen Command Hub (Expandable Search Bar, Filter Icon, Add/New Operation, CSV Export, Auto-Archiv) */}
        <div className="shrink-0 flex justify-end">
          <RechnungenCommandHub
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            onOpenFilter={() => setIsFilterModalOpen(true)}
            onOpenNewOperation={() => setActiveTab('operationen')}
            onExportCsv={handleExportCsv}
            isFilterActive={isFilterActive}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearchExpanded={isSearchExpanded}
            setIsSearchExpanded={setIsSearchExpanded}
            autoSaveEnabled={autoSaveEnabled}
            onToggleAutoSave={handleToggleAutoSave}
          />
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DEDICATED ARCHIVE TABS                                                    */}
      {/* ========================================================================= */}
      <div className="metallic-card-luminous rounded-2xl p-1.5 shadow-xs border border-slate-300/70">
        <div className="flex flex-wrap items-center gap-1.5">
          
          <button
            type="button"
            onClick={() => {
              setActiveSection('invoices');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 ${
              activeSection === 'invoices'
                ? 'metallic-btn-primary text-slate-950 shadow-xs font-black'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
          >
            <Folder className="w-4 h-4 text-[#1e3a5f] metallic-debossed-icon" />
            <span>Rechnungsarchiv & Belege</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeSection === 'invoices' ? 'bg-slate-900 text-slate-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {liveInvoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('probefahrt');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 ${
              activeSection === 'probefahrt'
                ? 'metallic-btn-primary text-slate-950 shadow-xs font-black'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
          >
            <Compass className="w-4 h-4 text-[#1e3a5f] metallic-debossed-icon" />
            <span>Probefahrten-Archiv</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeSection === 'probefahrt' ? 'bg-slate-900 text-slate-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {probefahrten.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('uebergabeprotokoll');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 ${
              activeSection === 'uebergabeprotokoll'
                ? 'metallic-btn-primary text-slate-950 shadow-xs font-black'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-[#1e3a5f] metallic-debossed-icon" />
            <span>Übergabeprotokolle-Archiv</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeSection === 'uebergabeprotokoll' ? 'bg-slate-900 text-slate-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {uebergabeprotokolle.length}
            </span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: MODERN HORIZONTAL INVOICE CARDS LAYOUT                         */}
      {/* ========================================================================= */}
      {activeSection === 'invoices' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          
          {/* Sub-Header / Sort & Status Overview Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-emerald-700 metallic-debossed-icon" />
                <span>Rechnungsbelege ({filteredInvoices.length})</span>
              </span>
              
              <div className="hidden md:flex items-center gap-1.5 ml-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/30">
                  {liveInvoices.filter(i => i.status === 'bezahlt').length} Bezahlt
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/30">
                  {liveInvoices.filter(i => i.status === 'teilbezahlt').length} Teilbezahlt
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/90 text-rose-300 border border-rose-500/30">
                  {liveInvoices.filter(i => i.status === 'offen').length} Offen
                </span>
              </div>
            </div>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-slate-600 font-semibold text-xs flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 metallic-debossed-icon" />
                <span>Sortierung:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 metallic-card-luminous border border-slate-300/80 rounded-xl text-slate-900 font-bold text-xs cursor-pointer shadow-xs focus:outline-emerald-500"
              >
                <option value="date_desc">Neuestes Datum zuerst</option>
                <option value="date_asc">Ältestes Datum zuerst</option>
                <option value="amount_desc">Höchster Betrag zuerst</option>
                <option value="amount_asc">Niedrigster Betrag zuerst</option>
                <option value="number">Rechnungsnummer</option>
              </select>
            </div>
          </div>

          {/* Cards Stack */}
          {filteredInvoices.length === 0 ? (
            <div className="metallic-card-luminous rounded-3xl p-12 text-center shadow-lg border border-slate-300/80">
              <div className="w-12 h-12 rounded-2xl metallic-node text-slate-900 flex items-center justify-center mx-auto mb-3 shadow-md">
                <FileText className="w-6 h-6 text-slate-900 metallic-debossed-icon" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Keine Rechnungsbelege gefunden
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-4 font-medium">
                Es wurden keine Belege für die aktuellen Filterkriterien oder den Suchbegriff gefunden.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 metallic-btn-primary text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <HorizontalInvoiceCard
                  key={invoice.id || invoice.invoiceNumber}
                  invoice={invoice}
                  onPreview={(inv) => setPreviewInvoice(inv)}
                  onPayment={(inv) => setPaymentInvoice(inv)}
                  onStorno={(inv) => setStornoInvoice(inv)}
                  onGutschrift={(inv) => setGutschriftInvoice(inv)}
                  onMahnung={(inv) => setMahnungInvoice(inv)}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: PROBEFAHRTEN-ARCHIV                                            */}
      {/* ========================================================================= */}
      {activeSection === 'probefahrt' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-700 metallic-debossed-icon" />
              <span>Probefahrt-Vereinbarungen ({filteredProbefahrten.length})</span>
            </span>
          </div>

          {filteredProbefahrten.length === 0 ? (
            <div className="metallic-card-luminous rounded-3xl p-12 text-center shadow-lg border border-slate-300/80">
              <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3 metallic-debossed-icon" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">Keine Probefahrten gefunden</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-4 font-medium">
                Probefahrt-Vereinbarungen können im Bereich &bdquo;Operationen&ldquo; erstellt werden.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('operationen')}
                className="px-4 py-2 metallic-btn-primary text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Neue Probefahrt vereinbaren
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProbefahrten.map((op) => {
                const d = op.probefahrtDetails;
                return (
                  <div 
                    key={op.id}
                    className="metallic-card-luminous rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-300/80 shadow-sm hover:border-slate-400 transition"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl metallic-card-luminous border border-slate-300/80 text-emerald-700 flex items-center justify-center shrink-0">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-900 text-sm">
                            {op.documentNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Probefahrt
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            {op.date}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 font-medium mt-1 flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{d?.driverName || 'Fahrer'}</span>
                          {d?.brand && <span>&bull; {d.brand} {d.model}</span>}
                          {d?.redLicensePlate && <span className="font-semibold text-rose-700">&bull; Rotes Kennzeichen: {d.redLicensePlate}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewOperation(op)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl metallic-btn-primary text-slate-950 font-bold text-xs cursor-pointer shadow-xs transition active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Vorschau</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: ÜBERGABEPROTOKOLLE-ARCHIV                                      */}
      {/* ========================================================================= */}
      {activeSection === 'uebergabeprotokoll' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-700 metallic-debossed-icon" />
              <span>Übergabeprotokolle ({filteredUebergabeprotokolle.length})</span>
            </span>
          </div>

          {filteredUebergabeprotokolle.length === 0 ? (
            <div className="metallic-card-luminous rounded-3xl p-12 text-center shadow-lg border border-slate-300/80">
              <FileCheck2 className="w-12 h-12 text-slate-400 mx-auto mb-3 metallic-debossed-icon" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">Keine Übergabeprotokolle gefunden</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-4 font-medium">
                Übergabeprotokolle können im Bereich &bdquo;Operationen&ldquo; erstellt werden.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('operationen')}
                className="px-4 py-2 metallic-btn-primary text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Neues Übergabeprotokoll anlegen
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUebergabeprotokolle.map((op) => {
                const d = op.uebergabeprotokollDetails;
                return (
                  <div 
                    key={op.id}
                    className="metallic-card-luminous rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-300/80 shadow-sm hover:border-slate-400 transition"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl metallic-card-luminous border border-slate-300/80 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-900 text-sm">
                            {op.documentNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            Übergabeprotokoll
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            {op.date}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 font-medium mt-1 flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{d?.buyerName || 'Käufer'}</span>
                          {d?.brand && <span>&bull; {d.brand} {d.model}</span>}
                          {d?.licensePlate && <span className="font-semibold text-slate-800">&bull; Kennzeichen: {d.licensePlate}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewOperation(op)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl metallic-btn-primary text-slate-950 font-bold text-xs cursor-pointer shadow-xs transition active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Vorschau</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEARCH, PERIOD & FILTER MODAL (OPENS ON DEMAND VIA COMMAND HUB FILTER ICON) */}
      {/* ========================================================================= */}
      <RechnungenSearchFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        taxFilter={taxFilter}
        onTaxFilterChange={setTaxFilter}
        folderFilter={folderFilter}
        onFolderFilterChange={setFolderFilter}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        amountMin={amountMin}
        onAmountMinChange={setAmountMin}
        amountMax={amountMax}
        onAmountMaxChange={setAmountMax}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
        matchingCount={filteredInvoices.length}
        totalCount={liveInvoices.length}
        filteredInvoices={filteredInvoices}
      />

      {/* ========================================================================= */}
      {/* MODALS & PREVIEWS                                                         */}
      {/* ========================================================================= */}
      {previewInvoice && (
        <InvoiceFullPdfModal
          isOpen={true}
          onClose={() => setPreviewInvoice(null)}
          invoice={previewInvoice}
          merchantSettings={merchantSettings}
        />
      )}

      {paymentInvoice && (
        <PaymentModal
          isOpen={true}
          onClose={() => setPaymentInvoice(null)}
          invoice={paymentInvoice}
          onPaymentSuccess={() => {
            setPaymentInvoice(null);
            setLiveInvoices(firebaseService.getInvoices());
          }}
        />
      )}

      {stornoInvoice && (
        <StornoModal
          isOpen={true}
          onClose={() => setStornoInvoice(null)}
          invoice={stornoInvoice}
          onStornoSuccess={() => {
            setStornoInvoice(null);
            setLiveInvoices(firebaseService.getInvoices());
          }}
        />
      )}

      {gutschriftInvoice && (
        <GutschriftModal
          isOpen={true}
          onClose={() => setGutschriftInvoice(null)}
          invoice={gutschriftInvoice}
          onGutschriftSuccess={() => {
            setGutschriftInvoice(null);
            setLiveInvoices(firebaseService.getInvoices());
          }}
        />
      )}

      {mahnungInvoice && (
        <MahnungModal
          isOpen={true}
          onClose={() => setMahnungInvoice(null)}
          invoice={mahnungInvoice}
          onMahnungSuccess={() => {
            setMahnungInvoice(null);
            setLiveInvoices(firebaseService.getInvoices());
          }}
        />
      )}

      {previewOperation && (
        <DocumentPreviewModal
          isOpen={true}
          onClose={() => setPreviewOperation(null)}
          documentType={previewOperation.documentType}
          merchantSettings={merchantSettings}
          probefahrtDetails={previewOperation.probefahrtDetails}
          uebergabeprotokollDetails={previewOperation.uebergabeprotokollDetails}
        />
      )}

    </div>
  );
};
