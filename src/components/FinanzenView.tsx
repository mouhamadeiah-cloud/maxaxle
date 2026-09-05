import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Wallet, 
  Landmark, 
  Plus, 
  Minus, 
  Search, 
  Download, 
  Check, 
  X, 
  SlidersHorizontal,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Lock,
  Unlock,
  ShieldCheck,
  Edit3,
  Trash2,
  AlertCircle,
  Clock,
  Info
} from 'lucide-react';
import { CashTransaction, MerchantSettings, FinancialAccount } from '../types';
import { firebaseService } from '../services/firebaseService';
import { exportFinancialTransactionsToCsv, exportFinancialTransactionsToPdf } from '../utils/exportUtils';

export const FinanzenView: React.FC = () => {
  const [settings, setSettings] = useState<MerchantSettings>(() => firebaseService.getMerchantSettings());
  const [transactions, setTransactions] = useState<CashTransaction[]>(() => firebaseService.getTransactions());
  const [cashBalance, setCashBalance] = useState<number>(() => firebaseService.getCashBalance());
  const [bankBalance, setBankBalance] = useState<number>(() => firebaseService.getBankBalance());
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'einnahme' | 'ausgabe' | 'transit'>('all');
  const [accountFilter, setAccountFilter] = useState<'all' | 'Kasse' | 'Bank'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [amountMin, setAmountMin] = useState<number | undefined>(undefined);
  const [amountMax, setAmountMax] = useState<number | undefined>(undefined);
  const [lockFilter, setLockFilter] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // New Booking Modal states
  const [modalType, setModalType] = useState<'income' | 'expense' | null>(null);
  const [targetAccount, setTargetAccount] = useState<FinancialAccount>('Kasse');
  const [bookingAmount, setBookingAmount] = useState<number>(250);
  const [bookingCategory, setBookingCategory] = useState('Fahrzeuganzahlung');
  const [bookingDescription, setBookingDescription] = useState('Baranzahlung Kaufvertrag');
  const [bookingTaxRate, setBookingTaxRate] = useState('0% (§ 25a)');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState(() => new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));

  // Transaction Edit / View modal states
  const [editingTx, setEditingTx] = useState<CashTransaction | null>(null);
  const [viewingTx, setViewingTx] = useState<CashTransaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit form fields
  const [editAccount, setEditAccount] = useState<FinancialAccount>('Kasse');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTaxRate, setEditTaxRate] = useState('0% (§ 25a)');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editReceiptNumber, setEditReceiptNumber] = useState('');
  const [editRecordedBy, setEditRecordedBy] = useState('');

  // Locking (Festschreibung) Modal states
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockCutoffDate, setLockCutoffDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lockFeedback, setLockFeedback] = useState<string | null>(null);

  // Export Dialog / Notice Modal state
  const [exportNoticeOpen, setExportNoticeOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto focus search when opened
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Auto scroll to top on modal open or filter change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [modalType, isFilterModalOpen, editingTx, viewingTx, isLockModalOpen]);

  const refreshBalances = () => {
    setCashBalance(firebaseService.getCashBalance());
    setBankBalance(firebaseService.getBankBalance());
  };

  useEffect(() => {
    const unsubscribeTxs = firebaseService.subscribeTransactions((txs) => {
      setTransactions(txs);
      refreshBalances();
    });
    const unsubscribeSettings = firebaseService.subscribeMerchantSettings((s) => {
      setSettings(s);
      refreshBalances();
    });
    return () => {
      unsubscribeTxs();
      unsubscribeSettings();
    };
  }, []);

  // Check for auto-open and pre-fill instructions from Max AI or external navigation
  useEffect(() => {
    try {
      const openModalType = localStorage.getItem('finanzen_open_modal');
      if (openModalType === 'income' || openModalType === 'expense') {
        const rawAccount = localStorage.getItem('finanzen_booking_account');
        const preAccount: FinancialAccount = (rawAccount === 'Bank' || rawAccount === 'BANK_UEBERWEISUNG') ? 'Bank' : 'Kasse';
        
        handleOpenModal(openModalType, preAccount);

        const preAmount = localStorage.getItem('finanzen_booking_amount');
        if (preAmount) {
          const parsed = parseFloat(preAmount);
          if (!isNaN(parsed) && parsed > 0) setBookingAmount(parsed);
        }
        const preDate = localStorage.getItem('finanzen_booking_date');
        if (preDate) {
          setBookingDate(preDate);
        }
        const preCat = localStorage.getItem('finanzen_booking_category');
        if (preCat) {
          setBookingCategory(preCat);
        }
        const preDesc = localStorage.getItem('finanzen_booking_description');
        if (preDesc) {
          setBookingDescription(preDesc);
        }

        localStorage.removeItem('finanzen_open_modal');
        localStorage.removeItem('finanzen_booking_account');
        localStorage.removeItem('finanzen_booking_amount');
        localStorage.removeItem('finanzen_booking_date');
        localStorage.removeItem('finanzen_booking_category');
        localStorage.removeItem('finanzen_booking_description');
      }

      const savedQuery = localStorage.getItem('finanzen_search_query');
      if (savedQuery) {
        setSearchQuery(savedQuery);
        setIsSearchExpanded(true);
        localStorage.removeItem('finanzen_search_query');
      }
      const savedAccount = localStorage.getItem('finanzen_account_filter');
      if (savedAccount === 'Kasse' || savedAccount === 'Bank' || savedAccount === 'all') {
        setAccountFilter(savedAccount as any);
        localStorage.removeItem('finanzen_account_filter');
      }
      const savedType = localStorage.getItem('finanzen_type_filter');
      if (savedType === 'einnahme' || savedType === 'ausgabe' || savedType === 'transit' || savedType === 'all') {
        setTypeFilter(savedType as any);
        localStorage.removeItem('finanzen_type_filter');
      }
      const savedTime = localStorage.getItem('finanzen_time_filter');
      if (savedTime) {
        setTimeFilter(savedTime as any);
        localStorage.removeItem('finanzen_time_filter');
      }
      const savedDateFrom = localStorage.getItem('finanzen_date_from');
      if (savedDateFrom) {
        setStartDate(savedDateFrom);
        setTimeFilter('custom');
        localStorage.removeItem('finanzen_date_from');
      }
      const savedDateTo = localStorage.getItem('finanzen_date_to');
      if (savedDateTo) {
        setEndDate(savedDateTo);
        setTimeFilter('custom');
        localStorage.removeItem('finanzen_date_to');
      }
      const savedAmountMin = localStorage.getItem('finanzen_amount_min');
      if (savedAmountMin) {
        const p = parseFloat(savedAmountMin);
        if (!isNaN(p)) setAmountMin(p);
        localStorage.removeItem('finanzen_amount_min');
      }
      const savedAmountMax = localStorage.getItem('finanzen_amount_max');
      if (savedAmountMax) {
        const p = parseFloat(savedAmountMax);
        if (!isNaN(p)) setAmountMax(p);
        localStorage.removeItem('finanzen_amount_max');
      }
    } catch {
      // ignore
    }
  }, []);

  // Helper to parse DD.MM.YYYY into Date object
  const parseTransactionDate = (timestampStr: string): Date | null => {
    if (!timestampStr) return null;
    const [datePart] = timestampStr.split(' ');
    if (datePart && datePart.includes('.')) {
      const [dd, mm, yyyy] = datePart.split('.');
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      if (!isNaN(d.getTime())) return d;
    }
    const fallback = new Date(timestampStr);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  // Filtered transactions calculation
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);

    // Week start (Monday)
    const dayOfWeek = now.getDay();
    const distToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMon);
    const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMon - 7);
    const lastWeekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMon - 1, 23, 59, 59);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    return transactions.filter(t => {
      if (t.type === 'sturz') return false;

      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        t.receiptNumber.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.recordedBy && t.recordedBy.toLowerCase().includes(q));

      // 2. Account & Type Filter
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesAccount = accountFilter === 'all' || (t.account || 'Kasse') === accountFilter;

      // 3. Lock Status Filter
      const matchesLock = lockFilter === 'all' || 
        (lockFilter === 'locked' && !!t.locked) || 
        (lockFilter === 'unlocked' && !t.locked);

      // 4. Time Filter
      let matchesTime = true;
      const txDate = parseTransactionDate(t.timestamp);
      if (txDate) {
        if (timeFilter === 'today') {
          matchesTime = txDate >= todayStart && txDate <= todayEnd;
        } else if (timeFilter === 'yesterday') {
          matchesTime = txDate >= yesterdayStart && txDate <= yesterdayEnd;
        } else if (timeFilter === 'this_week') {
          matchesTime = txDate >= weekStart;
        } else if (timeFilter === 'last_week') {
          matchesTime = txDate >= lastWeekStart && txDate <= lastWeekEnd;
        } else if (timeFilter === 'this_month') {
          matchesTime = txDate >= monthStart;
        } else if (timeFilter === 'last_month') {
          matchesTime = txDate >= lastMonthStart && txDate <= lastMonthEnd;
        } else if (timeFilter === 'this_year') {
          matchesTime = txDate >= yearStart;
        } else if (timeFilter === 'last_year') {
          matchesTime = txDate >= lastYearStart && txDate <= lastYearEnd;
        } else if (timeFilter === 'custom') {
          if (startDate) {
            const start = new Date(`${startDate}T00:00:00`);
            matchesTime = matchesTime && txDate >= start;
          }
          if (endDate) {
            const end = new Date(`${endDate}T23:59:59`);
            matchesTime = matchesTime && txDate <= end;
          }
        }
      }

      // 5. Amount bounds
      let matchesAmount = true;
      const txAmount = Math.abs(Number(t.amount) || 0);
      if (amountMin !== undefined && txAmount < amountMin) {
        matchesAmount = false;
      }
      if (amountMax !== undefined && txAmount > amountMax) {
        matchesAmount = false;
      }

      return matchesSearch && matchesType && matchesAccount && matchesLock && matchesTime && matchesAmount;
    });
  }, [transactions, searchQuery, typeFilter, accountFilter, lockFilter, timeFilter, startDate, endDate, amountMin, amountMax]);

  // Counts & Account-specific filters
  const totalCashTransactions = useMemo(() => transactions.filter(t => (t.account || 'Kasse') !== 'Bank' && t.type !== 'sturz'), [transactions]);
  const totalBankTransactions = useMemo(() => transactions.filter(t => t.account === 'Bank' && t.type !== 'sturz'), [transactions]);
  const lockedCount = useMemo(() => totalCashTransactions.filter(t => t.locked).length, [totalCashTransactions]);
  const unlockedCount = useMemo(() => totalCashTransactions.filter(t => !t.locked).length, [totalCashTransactions]);
  
  // Transactions by account in the CURRENT active filter
  const filteredCashTransactions = useMemo(() => 
    filteredTransactions.filter(t => (t.account || 'Kasse') !== 'Bank' && t.type !== 'sturz'),
    [filteredTransactions]
  );
  const filteredBankTransactions = useMemo(() => 
    filteredTransactions.filter(t => t.account === 'Bank' && t.type !== 'sturz'),
    [filteredTransactions]
  );

  // Unlocked cash transactions in current filter (These block export!)
  // Note: Bank accounts do NOT need locking as confirmed by GoBD & user requirements
  const unfinalizedCashTxsInFilter = useMemo(() => 
    filteredCashTransactions.filter(t => !t.locked),
    [filteredCashTransactions]
  );
  const hasUnfinalizedCashInFilter = unfinalizedCashTxsInFilter.length > 0;
  const filteredLockedCount = useMemo(() => filteredTransactions.filter(t => t.locked).length, [filteredTransactions]);

  // Export is enabled ONLY IF:
  // 1. There is at least 1 transaction in the filtered period
  // 2. All cash transactions (Kasse) in this period are locked (unfinalizedCashTxsInFilter.length === 0)
  // Bank transactions do NOT require lock, so they are accepted directly.
  const isFilterExportAllowed = filteredTransactions.length > 0 && !hasUnfinalizedCashInFilter;

  const handleOpenModal = (type: 'income' | 'expense', defaultAccount: FinancialAccount = 'Kasse') => {
    setModalType(type);
    setTargetAccount(defaultAccount);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setBookingTime(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));

    if (type === 'income') {
      setBookingCategory(defaultAccount === 'Bank' ? 'Fahrzeugverkauf Banküberweisung' : 'Fahrzeuganzahlung');
      setBookingDescription(defaultAccount === 'Bank' ? 'Überweisung Kaufpreis Kaufvertrag' : 'Baranzahlung Kaufvertrag');
      setBookingTaxRate('0% (§ 25a)');
    } else if (type === 'expense') {
      setBookingCategory(defaultAccount === 'Bank' ? 'Fahrzeugeinkauf / Bank' : 'Betriebsausgabe');
      setBookingDescription(defaultAccount === 'Bank' ? 'Überweisung Lieferantenrechnung' : 'Aufbereitung / Tankbeleg');
      setBookingTaxRate('19% Regelbesteuerung');
    }
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingAmount || bookingAmount <= 0) return;

    const isIncome = modalType === 'income';
    const txType: CashTransaction['type'] = isIncome ? 'einnahme' : 'ausgabe';

    const customDateTime = bookingDate ? `${bookingDate}T${bookingTime || '12:00'}` : undefined;

    firebaseService.addFinancialBooking({
      type: txType,
      account: targetAccount,
      amount: bookingAmount,
      category: bookingCategory,
      description: bookingDescription,
      taxRate: bookingTaxRate,
      recordedBy: firebaseService.getCurrentUser().name || 'M. Mustermann',
      customDate: customDateTime
    });

    refreshBalances();
    setModalType(null);
  };

  // Open Edit / View Modal on card click
  const handleSelectTransaction = (tx: CashTransaction) => {
    if (tx.locked) {
      setViewingTx(tx);
    } else {
      setEditingTx(tx);
      setEditAccount(tx.account || 'Kasse');
      setEditAmount(Math.abs(tx.amount));
      setEditCategory(tx.category || '');
      setEditDescription(tx.description || '');
      setEditTaxRate(tx.taxRate || '0% (§ 25a)');
      setEditReceiptNumber(tx.receiptNumber || '');
      setEditRecordedBy(tx.recordedBy || '');

      // Parse timestamp to date & time
      const [dPart, tPart] = (tx.timestamp || '').split(' ');
      if (dPart && dPart.includes('.')) {
        const [dd, mm, yyyy] = dPart.split('.');
        setEditDate(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`);
      } else {
        setEditDate(new Date().toISOString().split('T')[0]);
      }
      setEditTime(tPart || '12:00');
    }
  };

  const handleSaveTransactionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    let timestampStr = editingTx.timestamp;
    if (editDate) {
      const [yyyy, mm, dd] = editDate.split('-');
      timestampStr = `${dd}.${mm}.${yyyy} ${editTime || '12:00'}`;
    }

    const numAmount = editingTx.type === 'einnahme' ? Math.abs(editAmount) : -Math.abs(editAmount);

    firebaseService.updateTransaction(editingTx.id, {
      account: editAccount,
      amount: numAmount,
      category: editCategory,
      description: editDescription,
      taxRate: editTaxRate,
      timestamp: timestampStr,
      receiptNumber: editReceiptNumber,
      recordedBy: editRecordedBy
    });

    refreshBalances();
    setEditingTx(null);
  };

  const handleDeleteTransaction = (id: string) => {
    firebaseService.deleteTransaction(id);
    refreshBalances();
    setEditingTx(null);
    setDeleteConfirmId(null);
  };

  // Festschreibung (Locking) confirmation handler
  const handleConfirmLock = () => {
    const result = firebaseService.lockTransactions({
      upToDate: lockCutoffDate,
      lockedBy: firebaseService.getCurrentUser().name || 'Geschäftsleitung'
    });
    setLockFeedback(`Erfolgreich ${result.lockedCount} Bar-Buchungen bis zum ${new Date(lockCutoffDate).toLocaleDateString('de-DE')} GoBD-konform festgeschrieben.`);
    refreshBalances();
    setTimeout(() => {
      setLockFeedback(null);
      setIsLockModalOpen(false);
    }, 1800);
  };

  // Direct fast-lock for all unfinalized cash transactions in current active filter
  const handleLockFilterCashTransactions = () => {
    if (unfinalizedCashTxsInFilter.length === 0) return;
    const targetIds = unfinalizedCashTxsInFilter.map(t => t.id);
    const result = firebaseService.lockTransactions({
      txIds: targetIds,
      lockedBy: firebaseService.getCurrentUser().name || 'Geschäftsleitung'
    });
    setLockFeedback(`Erfolgreich ${result.lockedCount} Bar-Buchungen dieses Filter-Zeitraums GoBD-konform festgeschrieben.`);
    refreshBalances();
    setTimeout(() => {
      setLockFeedback(null);
      setExportNoticeOpen(false);
      setIsLockModalOpen(false);
    }, 1600);
  };

  const isFilterActive = typeFilter !== 'all' || accountFilter !== 'all' || timeFilter !== 'all' || lockFilter !== 'all';
  const hasActiveFilters = isFilterActive || !!searchQuery;

  const handleResetFilters = () => {
    setTypeFilter('all');
    setAccountFilter('all');
    setTimeFilter('all');
    setStartDate('');
    setEndDate('');
    setLockFilter('all');
    setSearchQuery('');
  };

  // Export handlers: Restricted and enabled ONLY IF all cash transactions in the filtered period are locked
  // (Bank account transactions do not require locking)
  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) {
      return;
    }
    if (!isFilterExportAllowed) {
      setExportNoticeOpen(true);
      return;
    }
    exportFinancialTransactionsToCsv(filteredTransactions, 'DATEV_Journal_GoBD');
  };

  const handleExportPdf = () => {
    if (filteredTransactions.length === 0) {
      return;
    }
    if (!isFilterExportAllowed) {
      setExportNoticeOpen(true);
      return;
    }
    const filterDesc = [
      accountFilter !== 'all' ? `Konto: ${accountFilter}` : null,
      typeFilter !== 'all' ? `Art: ${typeFilter}` : null,
      timeFilter !== 'all' ? `Zeitraum: ${getTimeFilterLabel() || timeFilter}` : null,
      `GoBD-Konform (${filteredTransactions.length} Belege)`
    ].filter(Boolean).join(' | ');

    exportFinancialTransactionsToPdf(filteredTransactions, filterDesc);
  };

  const handleForceExportDraftCsv = () => {
    setExportNoticeOpen(false);
    exportFinancialTransactionsToCsv(filteredTransactions, 'Finanzjournal_ENTWURF');
  };

  const handleForceExportDraftPdf = () => {
    setExportNoticeOpen(false);
    exportFinancialTransactionsToPdf(filteredTransactions, 'Entwurf / Inklusive offener Buchungen');
  };

  // Time filter label description
  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return 'Heute';
      case 'this_week': return 'Diese Woche';
      case 'this_month': return 'Dieser Monat';
      case 'last_month': return 'Letzter Monat';
      case 'this_year': return 'Dieses Jahr';
      case 'custom': return startDate || endDate ? `${startDate || '...'} bis ${endDate || '...'}` : 'Zeitraum';
      default: return null;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 text-[#0e264b] select-none">
      
      {/* ===================================================================== */}
      {/* 1. TOP BAR: COMPACT STATUS (LEFT) & COMMAND HUB (RIGHT)               */}
      {/* ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        
        {/* Left Side: Clean Compact Status Pill */}
        <div 
          id="finanzen-filter-status-bar"
          className="flex items-center gap-2 flex-wrap text-xs select-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full metallic-card-luminous border border-slate-300/70 shadow-sm text-[#0e264b]">
            <span className="w-2 h-2 rounded-full jewel-emerald animate-pulse" />
            <span className="font-black text-[#0e264b]">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'Beleg' : 'Belege'}
            </span>
            
            <span className="text-slate-300 font-bold">|</span>
            <span 
              onClick={() => setAccountFilter(accountFilter === 'Kasse' ? 'all' : 'Kasse')}
              className={`font-bold cursor-pointer hover:underline ${accountFilter === 'Kasse' ? 'text-emerald-900 underline' : 'text-emerald-700'}`}
              title="Klicken zum Filtern nach Kasse"
            >
              Kasse: {cashBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
            </span>

            <span className="text-slate-300 font-bold">&bull;</span>
            <span 
              onClick={() => setAccountFilter(accountFilter === 'Bank' ? 'all' : 'Bank')}
              className={`font-semibold cursor-pointer hover:underline ${accountFilter === 'Bank' ? 'text-sky-950 underline font-bold' : 'text-[#1e3a5f]'}`}
              title="Klicken zum Filtern nach Bank"
            >
              Bank: {bankBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
            </span>

            {/* GoBD Lock status summary */}
            <span className="text-slate-300 font-bold">&bull;</span>
            <span 
              onClick={() => setIsLockModalOpen(true)}
              className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition font-bold"
              title="Festschreibungs-Status / Sperren (Kasse)"
            >
              <Lock className="w-3 h-3 text-[#0e264b]" />
              <span className="text-[#0e264b]">{lockedCount} Kasse fest</span>
              {unlockedCount > 0 && (
                <span className="text-amber-700 font-semibold">({unlockedCount} offen)</span>
              )}
            </span>

            {/* GoBD Export readiness badge */}
            <span className="text-slate-300 font-bold">&bull;</span>
            {hasUnfinalizedCashInFilter ? (
              <span 
                onClick={() => setExportNoticeOpen(true)}
                className="inline-flex items-center gap-1 cursor-pointer hover:underline text-amber-700 font-bold"
                title="Export gesperrt: Es sind noch ungesicherte Bar-Buchungen im gewählten Zeitraum vorhanden. Klicken zum Festschreiben."
              >
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Export gesperrt ({unfinalizedCashTxsInFilter.length} Barbelege offen)</span>
              </span>
            ) : filteredTransactions.length > 0 ? (
              <span 
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1 cursor-pointer hover:underline text-emerald-800 font-black"
                title="Alle Bar-Buchungen im Zeitraum sind festgeschrieben (Bank ist freigegeben). DATEV-Export bereit."
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Export freigegeben (GoBD)</span>
              </span>
            ) : null}

            {/* Active filter badges */}
            {accountFilter !== 'all' && (
              <>
                <span className="text-slate-300 font-bold">&bull;</span>
                <span className="text-emerald-800 font-bold">
                  Konto: {accountFilter}
                </span>
              </>
            )}

            {typeFilter !== 'all' && (
              <>
                <span className="text-slate-300 font-bold">&bull;</span>
                <span className="text-emerald-800 font-semibold">
                  {typeFilter === 'einnahme' ? 'Einnahmen' : typeFilter === 'ausgabe' ? 'Ausgaben' : 'Geldtransit'}
                </span>
              </>
            )}

            {timeFilter !== 'all' && getTimeFilterLabel() && (
              <>
                <span className="text-slate-300 font-bold">&bull;</span>
                <span className="text-sky-800 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {getTimeFilterLabel()}
                </span>
              </>
            )}

            {lockFilter !== 'all' && (
              <>
                <span className="text-slate-300 font-bold">&bull;</span>
                <span className="text-indigo-800 font-bold">
                  {lockFilter === 'locked' ? 'Nur Festgeschriebene' : 'Nur Offene'}
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

          {hasActiveFilters && (
            <button
              type="button"
              id="btn-quick-reset-finanzen-filters"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full metallic-card-luminous hover:bg-white/60 border border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b] text-[11px] font-bold transition cursor-pointer shadow-xs active:scale-95"
              title="Alle Filter & Suche zurücksetzen"
            >
              <RefreshCw className="w-3 h-3 text-[#1e3a5f]" />
              <span>Zurücksetzen</span>
            </button>
          )}
        </div>

        {/* Right Side: Command Hub Icons */}
        <div className="shrink-0 flex items-center justify-end gap-2 w-full lg:w-auto">
          
          {/* 1. Dynamic Expandable Horizontal Search Bar */}
          <div className="relative flex items-center justify-end">
            {isSearchExpanded ? (
              <div className="flex items-center metallic-card-luminous border border-slate-300/80 rounded-full pl-3.5 pr-1.5 py-1 shadow-sm transition-all duration-300 w-64 sm:w-72 md:w-80 animate-in fade-in slide-in-from-right-4">
                <Search className="w-4 h-4 text-[#1e3a5f] shrink-0 pointer-events-none mr-2 metallic-debossed-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Belegnr., Text, Erfasser..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#0e264b] placeholder-[#1e3a5f]/50 focus:outline-none font-semibold"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
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
                id="hub-btn-finanzen-search-toggle"
                onClick={() => setIsSearchExpanded(true)}
                className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
                title="Buchungssuche öffnen"
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
                  <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
                </div>
                {searchQuery && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-[0_0_6px_#10b981] animate-pulse" />
                )}
              </button>
            )}
          </div>

          {/* 2. Command Hub Action Icons Group */}
          <div className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-full metallic-pill-light border border-slate-300/70 shadow-sm shrink-0">
            
            {/* Filter Button */}
            <button
              type="button"
              id="hub-btn-finanzen-filter"
              onClick={() => setIsFilterModalOpen(true)}
              className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
              title="Finanz- & Zeitfilter öffnen"
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
                <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
              </div>
              {isFilterActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-[0_0_6px_#10b981] animate-pulse" />
              )}
            </button>

            {/* Lock / Festschreiben Button */}
            <button
              type="button"
              id="hub-btn-finanzen-lock"
              onClick={() => setIsLockModalOpen(true)}
              className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
              title="Buchungen festschreiben & schreibschützen (GoBD)"
            >
              <div className={`relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                unlockedCount > 0 
                  ? 'border-amber-400/80 metallic-node text-[#0e264b]' 
                  : 'border-slate-300/80 metallic-node text-[#0e264b] hover:border-slate-400'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0e264b] stroke-[2.2] metallic-debossed-icon" />
                <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
              </div>
              {unlockedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full shadow-[0_0_6px_#f59e0b] animate-pulse" />
              )}
            </button>

            {/* DATEV Export CSV Icon */}
            <button
              type="button"
              id="hub-btn-finanzen-export"
              onClick={handleExportCsv}
              className={`relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                hasUnfinalizedCashInFilter ? 'opacity-80' : ''
              }`}
              title={
                hasUnfinalizedCashInFilter
                  ? `Export gesperrt: ${unfinalizedCashTxsInFilter.length} offene Barbelege im Zeitraum (Klicken zum Festschreiben)`
                  : filteredTransactions.length === 0
                  ? 'Keine Belege im ausgewählten Zeitraum vorhanden'
                  : `DATEV / CSV Export freigegeben (${filteredTransactions.length} Belege)`
              }
            >
              <div className={`relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                isFilterExportAllowed
                  ? 'metallic-node-active text-[#0e264b] border-emerald-400'
                  : hasUnfinalizedCashInFilter
                  ? 'metallic-node text-[#0e264b] border-amber-400/80 hover:border-amber-500'
                  : 'metallic-node text-[#0e264b] border-slate-300/80 hover:border-slate-400'
              }`}>
                <Download className={`w-3.5 h-3.5 sm:w-4 sm:h-4 metallic-debossed-icon ${
                  isFilterExportAllowed ? 'text-emerald-800 stroke-[2.5]' : 'text-[#0e264b] stroke-[2.2]'
                }`} />
                <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
              </div>
              {hasUnfinalizedCashInFilter && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full shadow-[0_0_6px_#f59e0b] animate-pulse flex items-center justify-center" />
              )}
              {isFilterExportAllowed && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-[0_0_6px_#10b981] animate-pulse" />
              )}
            </button>

            {/* Income Button (+) */}
            <button
              type="button"
              id="hub-btn-finanzen-add-income"
              onClick={() => handleOpenModal('income', 'Kasse')}
              className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
              title="Einnahme verbuchen (+)"
            >
              <div className="relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border border-slate-300/80 metallic-node text-emerald-700 hover:border-slate-400 flex items-center justify-center transition-all duration-200">
                <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-700 stroke-[2.5] metallic-debossed-icon" />
                <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
              </div>
            </button>

            {/* Expense Button (-) */}
            <button
              type="button"
              id="hub-btn-finanzen-add-expense"
              onClick={() => handleOpenModal('expense', 'Kasse')}
              className="relative flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
              title="Ausgabe verbuchen (-)"
            >
              <div className="relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border border-slate-300/80 metallic-node text-rose-700 hover:border-slate-400 flex items-center justify-center transition-all duration-200">
                <Minus className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-rose-700 stroke-[2.5] metallic-debossed-icon" />
                <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MAIN TRANSACTIONS TABLE (INSTANT ACCESS, NO BULKY BOXES)            */}
      {/* ===================================================================== */}
      <div className="metallic-card-luminous rounded-3xl border border-slate-300/80 shadow-sm text-[#0e264b] overflow-hidden">
        
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/90 border-b border-slate-200/90 text-[#1e3a5f] text-[10px] font-black uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-5 py-3.5">Beleg-Nr.</th>
                <th className="px-3 sm:px-4 py-3.5">Konto</th>
                <th className="px-3 sm:px-4 py-3.5">Datum / Zeit</th>
                <th className="px-4 sm:px-5 py-3.5">Kategorie & Buchungstext</th>
                <th className="px-3 sm:px-4 py-3.5">Steuersatz</th>
                <th className="px-4 sm:px-5 py-3.5 text-right">Betrag</th>
                <th className="px-4 sm:px-5 py-3.5 text-right">Saldo danach</th>
                <th className="px-3 sm:px-4 py-3.5 text-center">Status</th>
                <th className="px-3 sm:px-4 py-3.5">Erfasser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-xs font-medium text-[#0e264b]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[#1e3a5f]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-2xl metallic-node flex items-center justify-center text-[#0e264b] shadow-sm border border-slate-300/80">
                        <FileSpreadsheet className="w-7 h-7 text-[#0e264b] metallic-debossed-icon" />
                      </div>
                      <h3 className="text-base font-black text-[#0e264b]">Keine passenden Buchungen gefunden</h3>
                      <p className="text-xs text-[#1e3a5f]/80 max-w-md mx-auto">
                        Für Ihre aktuellen Filter- oder Suchkriterien wurden keine Belege gefunden.
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-2xl shadow-sm transition cursor-pointer active:scale-95"
                        >
                          Filter & Suche zurücksetzen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isBank = tx.account === 'Bank';
                  const isLocked = !!tx.locked;
                  return (
                    <tr 
                      key={tx.id} 
                      onClick={() => handleSelectTransaction(tx)}
                      className={`transition-colors cursor-pointer group select-none ${
                        isLocked ? 'hover:bg-slate-100/70' : 'hover:bg-amber-50/50'
                      }`}
                      title={isLocked ? 'Klicken für GoBD-Belegdetails (Schreibgeschützt)' : 'Klicken zum Bearbeiten oder Löschen dieser Buchung'}
                    >
                      
                      {/* Receipt Number */}
                      <td className="px-4 sm:px-5 py-3 font-mono text-xs font-bold text-[#0e264b] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{tx.receiptNumber}</span>
                          {!isLocked && (
                            <Edit3 className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </td>

                      {/* Target Account Badge */}
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#1e3a5f]/20 bg-[#0e264b]/10 text-[#0e264b]">
                          {isBank ? <Landmark className="w-3 h-3 text-sky-800" /> : <Wallet className="w-3 h-3 text-emerald-800" />}
                          <span>{isBank ? 'Bank' : 'Kasse'}</span>
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="px-3 sm:px-4 py-3 text-[#1e3a5f] font-semibold whitespace-nowrap text-[11px]">
                        {tx.timestamp}
                      </td>

                      {/* Description & Category */}
                      <td className="px-4 sm:px-5 py-3">
                        <div className="font-bold text-[#0e264b]">{tx.description}</div>
                        <div className="text-[10px] text-[#1e3a5f]/80 font-medium mt-0.5">{tx.category}</div>
                      </td>

                      {/* Tax Rate */}
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-200/80 text-[#0e264b] text-[10px] font-bold font-mono border border-slate-300/70">
                          {tx.taxRate}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 sm:px-5 py-3 text-right whitespace-nowrap font-black text-sm">
                        {tx.type === 'einnahme' && (
                          <span className="text-emerald-700 font-mono">
                            +{Math.abs(tx.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                          </span>
                        )}
                        {tx.type === 'ausgabe' && (
                          <span className="text-rose-700 font-mono">
                            -{Math.abs(tx.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                          </span>
                        )}
                        {tx.type === 'transit' && (
                          <span className="text-[#0e264b] font-mono">
                            {tx.amount < 0 ? '-' : '+'}{Math.abs(tx.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                          </span>
                        )}
                      </td>

                      {/* Balance After */}
                      <td className="px-4 sm:px-5 py-3 text-right font-mono font-black text-[#0e264b] whitespace-nowrap text-xs">
                        {tx.balanceAfter.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </td>

                      {/* Lock Status Column */}
                      <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/90 text-[#0e264b] border border-slate-300/80" title="GoBD-festgeschrieben (Schreibgeschützt)">
                            <Lock className="w-2.5 h-2.5 text-[#0e264b]" />
                            <span>Fest</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300/80" title="Offen / Bearbeitbar">
                            <Unlock className="w-2.5 h-2.5 text-amber-700" />
                            <span>Offen</span>
                          </span>
                        )}
                      </td>

                      {/* Recorded By */}
                      <td className="px-3 sm:px-4 py-3 text-[#1e3a5f] font-semibold text-[11px] whitespace-nowrap">
                        {tx.recordedBy}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-100/90 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#1e3a5f]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold">
              Gesamt <strong className="text-[#0e264b]">{filteredTransactions.length}</strong> Buchungen ({filteredLockedCount} festgeschrieben)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full jewel-emerald animate-pulse" />
            <span className="text-[#0e264b] font-bold text-[11px]">Kassenbuch & Bankjournal GoBD-konform</span>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 3. TIME-BASED & COMPREHENSIVE FILTER MODAL                             */}
      {/* ===================================================================== */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-start justify-center pt-2 sm:pt-4 px-2 sm:px-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="metallic-modal-container rounded-3xl max-w-xl w-full border border-slate-300/80 shadow-[0_0_50px_rgba(0,0,0,0.35)] overflow-hidden text-[#0e264b] animate-in slide-in-from-top-4 duration-200 my-0 sm:my-2">
            
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-100 to-slate-200/80 border-b border-slate-300/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-md">
                  <SlidersHorizontal className="w-5 h-5 text-[#0e264b] metallic-debossed-icon" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#0e264b]">Finanzen-Filter & Zeitspanne</h2>
                  <p className="text-xs text-[#1e3a5f]/80">
                    {filteredTransactions.length} von {transactions.length} Buchungen ausgewählt
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 text-[#1e3a5f] hover:text-[#0e264b] rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5 metallic-debossed-icon" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 text-xs text-[#0e264b]">
              
              {/* 1. Time-Based Filtering (Zeitfilter) */}
              <div>
                <label className="block text-xs font-black text-[#0e264b] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0e264b]" />
                  <span>Zeitraum & Datum</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-3">
                  {[
                    { id: 'all', label: 'Alle' },
                    { id: 'today', label: 'Heute' },
                    { id: 'this_week', label: 'Woche' },
                    { id: 'this_month', label: 'Monat' },
                    { id: 'last_month', label: 'Vormonat' },
                    { id: 'this_year', label: 'Jahr' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTimeFilter(p.id as any)}
                      className={`py-2 px-2 rounded-xl font-bold text-center transition cursor-pointer text-[11px] ${
                        timeFilter === p.id
                          ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                          : 'metallic-card-luminous border border-slate-300/80 text-[#1e3a5f] hover:text-[#0e264b]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Picker */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-[#1e3a5f] mb-1">Von Datum:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setTimeFilter('custom');
                      }}
                      className="w-full px-3 py-2 metallic-input rounded-xl text-xs font-bold text-[#0e264b] border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#1e3a5f] mb-1">Bis Datum:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setTimeFilter('custom');
                      }}
                      className="w-full px-3 py-2 metallic-input rounded-xl text-xs font-bold text-[#0e264b] border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Account Filter */}
              <div>
                <label className="block text-xs font-black text-[#0e264b] uppercase tracking-wider mb-2">
                  Kontoauswahl
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountFilter('all')}
                    className={`py-2.5 px-3 rounded-2xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      accountFilter === 'all'
                        ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-[#1e3a5f] hover:text-[#0e264b]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Alle Konten</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountFilter('Kasse')}
                    className={`py-2.5 px-3 rounded-2xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      accountFilter === 'Kasse'
                        ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-[#1e3a5f] hover:text-[#0e264b]'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Kasse (Bar)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountFilter('Bank')}
                    className={`py-2.5 px-3 rounded-2xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      accountFilter === 'Bank'
                        ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-[#1e3a5f] hover:text-[#0e264b]'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Bank</span>
                  </button>
                </div>
              </div>

              {/* 3. Type Filter */}
              <div>
                <label className="block text-xs font-black text-[#0e264b] uppercase tracking-wider mb-2">
                  Buchungsart
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setTypeFilter('all')}
                    className={`py-2.5 px-3 rounded-2xl font-bold transition text-center cursor-pointer ${
                      typeFilter === 'all'
                        ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-[#1e3a5f] hover:text-[#0e264b]'
                    }`}
                  >
                    Alle
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('einnahme')}
                    className={`py-2.5 px-3 rounded-2xl font-bold transition text-center cursor-pointer ${
                      typeFilter === 'einnahme'
                        ? 'metallic-btn-primary text-emerald-800 shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-emerald-700'
                    }`}
                  >
                    + Einnahmen
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('ausgabe')}
                    className={`py-2.5 px-3 rounded-2xl font-bold transition text-center cursor-pointer ${
                      typeFilter === 'ausgabe'
                        ? 'metallic-btn-primary text-rose-800 shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-rose-700'
                    }`}
                  >
                    - Ausgaben
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('transit')}
                    className={`py-2.5 px-3 rounded-2xl font-bold transition text-center cursor-pointer ${
                      typeFilter === 'transit'
                        ? 'metallic-btn-primary text-sky-800 shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-sky-700'
                    }`}
                  >
                    ⇄ Geldtransit
                  </button>
                </div>
              </div>

              {/* 4. Lock Status Filter */}
              <div>
                <label className="block text-xs font-black text-[#0e264b] uppercase tracking-wider mb-2">
                  Festschreibungs-Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLockFilter('all')}
                    className={`py-2.5 px-3 rounded-2xl font-bold transition text-center cursor-pointer ${
                      lockFilter === 'all'
                        ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-[#1e3a5f] hover:text-[#0e264b]'
                    }`}
                  >
                    Alle Belege
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockFilter('locked')}
                    className={`py-2.5 px-3 rounded-2xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      lockFilter === 'locked'
                        ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-[#1e3a5f] hover:text-[#0e264b]'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Festgeschrieben ({lockedCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockFilter('unlocked')}
                    className={`py-2.5 px-3 rounded-2xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      lockFilter === 'unlocked'
                        ? 'metallic-btn-primary text-amber-900 shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-amber-800'
                    }`}
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Offen ({unlockedCount})</span>
                  </button>
                </div>
              </div>

              {/* 5. Export Actions Box with GoBD Validation */}
              <div className="pt-2 border-t border-slate-300/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#0e264b] uppercase tracking-wider">
                    DATEV- & Journal-Export (GoBD)
                  </label>
                  {isFilterExportAllowed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Export freigegeben
                    </span>
                  ) : hasUnfinalizedCashInFilter ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
                      <Lock className="w-3 h-3" />
                      Export gesperrt
                    </span>
                  ) : null}
                </div>

                {/* Validation Notice Box */}
                {hasUnfinalizedCashInFilter ? (
                  <div className="p-3 bg-amber-50/90 border border-amber-300/80 rounded-2xl text-amber-900 space-y-2">
                    <div className="flex items-start gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-[11px] leading-snug">
                          Export für diesen Zeitraum blockiert: Es sind noch <strong>{unfinalizedCashTxsInFilter.length} ungesicherte Bar-Buchungen (Kasse)</strong> vorhanden.
                        </p>
                        <p className="text-[10px] text-amber-800/90 leading-relaxed">
                          Gemäß GoBD muss das Kassenbuch vor dem Export festgeschrieben sein. Bank-Buchungen ({filteredBankTransactions.length}) erfordern keine Festschreibung.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLockFilterCashTransactions}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Diese {unfinalizedCashTxsInFilter.length} Barbelege jetzt festschreiben</span>
                    </button>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-2.5 bg-slate-100/80 border border-slate-300/70 rounded-2xl text-[11px] text-[#1e3a5f] text-center font-medium">
                    Keine Buchungen im ausgewählten Filter-Zeitraum vorhanden.
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-300/70 rounded-2xl text-[11px] text-emerald-900 flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Alle {filteredCashTransactions.length} Kassenbelege im Zeitraum sind festgeschrieben {filteredBankTransactions.length > 0 ? `(+ ${filteredBankTransactions.length} Bankbelege)` : ''}. Der Export ist bereit.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-0.5">
                  <button
                    type="button"
                    disabled={!isFilterExportAllowed}
                    onClick={handleExportCsv}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-black text-xs transition ${
                      isFilterExportAllowed
                        ? 'metallic-card-luminous border-slate-300/80 hover:border-slate-400 text-[#0e264b] cursor-pointer shadow-xs active:scale-95'
                        : 'opacity-40 cursor-not-allowed bg-slate-100/60 border-slate-200 text-slate-400 pointer-events-none'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <span>DATEV / CSV Export</span>
                  </button>
                  <button
                    type="button"
                    disabled={!isFilterExportAllowed}
                    onClick={handleExportPdf}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-black text-xs transition ${
                      isFilterExportAllowed
                        ? 'metallic-card-luminous border-slate-300/80 hover:border-slate-400 text-[#0e264b] cursor-pointer shadow-xs active:scale-95'
                        : 'opacity-40 cursor-not-allowed bg-slate-100/60 border-slate-200 text-slate-400 pointer-events-none'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-[#0e264b]" />
                    <span>PDF Journal Export</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-100/90 border-t border-slate-300/70 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2.5 metallic-btn-secondary text-[#1e3a5f] hover:text-[#0e264b] rounded-2xl font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Zurücksetzen</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black rounded-2xl shadow-sm cursor-pointer"
              >
                Anwenden & Schließen
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. NEW BOOKING MODAL (WITH EDITABLE DATE & TIME)                       */}
      {/* ===================================================================== */}
      {(modalType === 'income' || modalType === 'expense') && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-4 sm:pt-6 overflow-y-auto animate-in fade-in">
          <div className="metallic-modal-container rounded-3xl max-w-lg w-full border border-slate-300/80 shadow-[0_0_50px_rgba(0,0,0,0.35)] overflow-hidden text-[#0e264b] p-5 sm:p-6 space-y-4 animate-in slide-in-from-top-4 my-0 sm:my-2">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-300/80 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-md ${
                  modalType === 'income' ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {modalType === 'income' && <Plus className="w-5 h-5 stroke-[3] metallic-debossed-icon" />}
                  {modalType === 'expense' && <Minus className="w-5 h-5 stroke-[3] metallic-debossed-icon" />}
                </div>
                <div>
                  <h3 className="font-black text-[#0e264b] text-base sm:text-lg">
                    {modalType === 'income' ? 'Einnahme erfassen' : 'Ausgabe erfassen'}
                  </h3>
                  <p className="text-[11px] text-[#1e3a5f]/80 font-semibold">
                    Buchung mit frei wählbarem Datum & Kontenauswahl
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setModalType(null)} 
                className="p-1.5 text-[#1e3a5f] hover:text-[#0e264b] rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5 metallic-debossed-icon" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3.5 text-xs text-[#0e264b]">

              {/* ACCOUNT SELECTION */}
              <div>
                <label className="block font-black text-[#0e264b] mb-1.5">
                  Zielkonto auswählen *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* Option 1: KASSE */}
                  <button
                    type="button"
                    onClick={() => setTargetAccount('Kasse')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer relative flex flex-col justify-between ${
                      targetAccount === 'Kasse'
                        ? 'border-emerald-500 bg-white ring-2 ring-emerald-400/40 shadow-md text-[#0e264b]'
                        : 'border-slate-300/80 metallic-card-luminous text-[#1e3a5f] hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg metallic-node flex items-center justify-center text-emerald-700">
                          <Wallet className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-black text-xs text-[#0e264b]">Kasse (Bargeld)</span>
                      </div>
                      {targetAccount === 'Kasse' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] text-[#1e3a5f]/80 font-bold">Bestand:</div>
                      <div className="font-mono font-black text-xs sm:text-sm text-emerald-700">
                        {cashBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </div>
                    </div>
                  </button>

                  {/* Option 2: BANK */}
                  <button
                    type="button"
                    onClick={() => setTargetAccount('Bank')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer relative flex flex-col justify-between ${
                      targetAccount === 'Bank'
                        ? 'border-sky-500 bg-white ring-2 ring-sky-400/40 shadow-md text-[#0e264b]'
                        : 'border-slate-300/80 metallic-card-luminous text-[#1e3a5f] hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg metallic-node flex items-center justify-center text-sky-700">
                          <Landmark className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-black text-xs text-[#0e264b]">Bank</span>
                      </div>
                      {targetAccount === 'Bank' && (
                        <div className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] text-[#1e3a5f]/80 font-bold">Bestand:</div>
                      <div className="font-mono font-black text-xs sm:text-sm text-sky-800">
                        {bankBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </div>
                    </div>
                  </button>

                </div>
              </div>

              {/* EDITABLE DATE & TIME ROW */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#0e264b] mb-1">Buchungsdatum *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2.5 metallic-input rounded-2xl text-[#0e264b] font-bold border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#0e264b] mb-1">Uhrzeit</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2.5 metallic-input rounded-2xl text-[#0e264b] font-bold border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                  />
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block font-black text-[#0e264b] mb-1">Betrag in Euro (€) *</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={bookingAmount}
                    onChange={(e) => setBookingAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 metallic-input rounded-2xl text-[#0e264b] font-black text-base font-mono border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-[#1e3a5f] text-xs">
                    EUR
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-black text-[#0e264b] mb-1">Kategorie *</label>
                <select
                  value={bookingCategory}
                  onChange={(e) => setBookingCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 metallic-input rounded-2xl text-[#0e264b] font-bold border border-slate-300/80 cursor-pointer focus:border-[#0e264b] focus:outline-none"
                >
                  {modalType === 'income' ? (
                    <>
                      <option value="Fahrzeuganzahlung">Fahrzeuganzahlung / Barverkauf</option>
                      <option value="Fahrzeugverkauf Banküberweisung">Fahrzeugverkauf per Banküberweisung</option>
                      <option value="Werkstattumsatz">Werkstatt & Serviceleistung</option>
                      <option value="Sonstige Einnahme">Sonstige Betriebseinnahme</option>
                    </>
                  ) : (
                    <>
                      <option value="Betriebsausgabe">Betriebsausgabe / Allgemein</option>
                      <option value="Fahrzeugeinkauf / Bank">Fahrzeugeinkauf (Banküberweisung)</option>
                      <option value="Fahrzeugaufbereitung">Aufbereitung & Reinigung</option>
                      <option value="Treibstoff / Tankquittung">Treibstoff / Tankquittung</option>
                      <option value="Zulassung & Schilder">Zulassung & Schilder</option>
                      <option value="Bürobedarf / Porto">Bürobedarf / Porto</option>
                    </>
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-black text-[#0e264b] mb-1">Verwendungszweck / Buchungstext *</label>
                <input
                  type="text"
                  required
                  value={bookingDescription}
                  onChange={(e) => setBookingDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 metallic-input rounded-2xl text-[#0e264b] placeholder-[#1e3a5f]/50 font-semibold border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                  placeholder="z.B. Baranzahlung Kaufvertrag RE-2026-0842"
                />
              </div>

              {/* Tax Rate */}
              <div>
                <label className="block font-black text-[#0e264b] mb-1">Umsatzsteuer-Satz</label>
                <select
                  value={bookingTaxRate}
                  onChange={(e) => setBookingTaxRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 metallic-input rounded-2xl text-[#0e264b] font-semibold border border-slate-300/80 cursor-pointer focus:border-[#0e264b] focus:outline-none"
                >
                  <option value="0% (§ 25a)">0% Differenzbesteuerung (§ 25a UStG)</option>
                  <option value="19% Regelbesteuerung">19% Regelbesteuerung (inkl. MwSt.)</option>
                  <option value="7% ermäßigt">7% ermäßigter Steuersatz</option>
                  <option value="0% (Transit)">0% Geldtransit (Nicht steuerbar)</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 metallic-btn-secondary text-[#1e3a5f] font-bold rounded-2xl cursor-pointer transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black rounded-2xl cursor-pointer shadow-md transition flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3] text-[#091a34] metallic-debossed-icon" />
                  <span>In {targetAccount} verbuchen</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. EDIT TRANSACTION MODAL (BEFORE LOCK / FESTSCHREIBUNG)              */}
      {/* ===================================================================== */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-4 sm:pt-6 overflow-y-auto animate-in fade-in">
          <div className="metallic-modal-container rounded-3xl max-w-lg w-full border border-slate-300/80 shadow-[0_0_50px_rgba(0,0,0,0.35)] overflow-hidden text-[#0e264b] p-5 sm:p-6 space-y-4 animate-in slide-in-from-top-4 my-0 sm:my-2">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-300/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-md text-amber-700">
                  <Edit3 className="w-5 h-5 metallic-debossed-icon" />
                </div>
                <div>
                  <h3 className="font-black text-[#0e264b] text-base sm:text-lg">
                    Buchung bearbeiten
                  </h3>
                  <p className="text-[11px] text-amber-800 font-semibold">
                    Beleg-Nr. {editingTx.receiptNumber} &bull; Noch nicht festgeschrieben
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingTx(null)} 
                className="p-1.5 text-[#1e3a5f] hover:text-[#0e264b] rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5 metallic-debossed-icon" />
              </button>
            </div>

            <form onSubmit={handleSaveTransactionEdit} className="space-y-3.5 text-xs text-[#0e264b]">
              
              {/* Account Selection */}
              <div>
                <label className="block font-black text-[#0e264b] mb-1">Konto *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditAccount('Kasse')}
                    className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      editAccount === 'Kasse'
                        ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-[#1e3a5f]'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Kasse (Bargeld)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAccount('Bank')}
                    className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      editAccount === 'Bank'
                        ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                        : 'metallic-card-luminous border border-slate-300/80 text-[#1e3a5f]'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Bank (Geschäftskonto)</span>
                  </button>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#0e264b] mb-1">Datum *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 metallic-input rounded-xl text-[#0e264b] font-bold border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#0e264b] mb-1">Uhrzeit</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 metallic-input rounded-xl text-[#0e264b] font-bold border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block font-black text-[#0e264b] mb-1">Betrag in Euro (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 metallic-input rounded-xl text-[#0e264b] font-black font-mono border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-black text-[#0e264b] mb-1">Kategorie *</label>
                <input
                  type="text"
                  required
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3.5 py-2 metallic-input rounded-xl text-[#0e264b] font-semibold border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-black text-[#0e264b] mb-1">Verwendungszweck / Buchungstext *</label>
                <input
                  type="text"
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 metallic-input rounded-xl text-[#0e264b] font-semibold border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                />
              </div>

              {/* Tax Rate & Receipt Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#0e264b] mb-1">Steuersatz</label>
                  <select
                    value={editTaxRate}
                    onChange={(e) => setEditTaxRate(e.target.value)}
                    className="w-full px-3 py-2 metallic-input rounded-xl text-[#0e264b] font-semibold border border-slate-300/80 cursor-pointer focus:border-[#0e264b] focus:outline-none"
                  >
                    <option value="0% (§ 25a)">0% Differenzbesteuerung (§ 25a)</option>
                    <option value="19% Regelbesteuerung">19% Regelbesteuerung</option>
                    <option value="7% ermäßigt">7% ermäßigt</option>
                    <option value="0% (Transit)">0% Geldtransit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-black text-[#0e264b] mb-1">Erfasser / Benutzer</label>
                  <input
                    type="text"
                    value={editRecordedBy}
                    onChange={(e) => setEditRecordedBy(e.target.value)}
                    className="w-full px-3 py-2 metallic-input rounded-xl text-[#0e264b] font-semibold border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-300/80 flex items-center justify-between">
                <div>
                  {deleteConfirmId === editingTx.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-rose-700 font-bold">Löschen bestätigen?</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTransaction(editingTx.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] cursor-pointer"
                      >
                        Ja, löschen
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-[10px]"
                      >
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(editingTx.id)}
                      className="px-3 py-2 text-rose-700 hover:bg-rose-100 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Buchung löschen</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTx(null)}
                    className="px-3.5 py-2 metallic-btn-secondary text-[#1e3a5f] font-bold rounded-xl cursor-pointer"
                  >
                    Schließen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 metallic-btn-primary text-[#091a34] font-black rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Änderungen speichern</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. GOBD READ-ONLY DETAILS MODAL (FOR LOCKED TRANSACTIONS)             */}
      {/* ===================================================================== */}
      {viewingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-4 sm:pt-6 overflow-y-auto animate-in fade-in">
          <div className="metallic-modal-container rounded-3xl max-w-lg w-full border border-slate-300/80 shadow-[0_0_50px_rgba(0,0,0,0.35)] overflow-hidden text-[#0e264b] p-5 sm:p-6 space-y-4 animate-in slide-in-from-top-4 my-0 sm:my-2">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-300/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-md text-[#0e264b]">
                  <ShieldCheck className="w-5 h-5 text-[#0e264b] metallic-debossed-icon" />
                </div>
                <div>
                  <h3 className="font-black text-[#0e264b] text-base sm:text-lg">
                    GoBD-Festgeschriebene Buchung
                  </h3>
                  <p className="text-[11px] text-[#1e3a5f]/80 font-semibold">
                    Schreibgeschützt & unveränderbar dokumentiert
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setViewingTx(null)} 
                className="p-1.5 text-[#1e3a5f] hover:text-[#0e264b] rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5 metallic-debossed-icon" />
              </button>
            </div>

            {/* GoBD Notice Banner */}
            <div className="p-3.5 bg-slate-100/90 rounded-2xl border border-slate-300/80 flex items-start gap-3 text-xs">
              <Lock className="w-4 h-4 text-[#0e264b] shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[#0e264b]">
                <div className="font-black">GoBD-Revisionssicherheit aktiv</div>
                <p className="text-[11px] text-[#1e3a5f]/80">
                  Dieser Beleg wurde verbindlich festgeschrieben und kann nach den Grundsätzen ordnungsmäßiger Buchführung weder modifiziert noch gelöscht werden.
                </p>
                {viewingTx.lockedAt && (
                  <div className="text-[10px] font-mono text-[#1e3a5f] font-bold pt-1">
                    Festgeschrieben am: {new Date(viewingTx.lockedAt).toLocaleString('de-DE')} durch {viewingTx.lockedBy || 'Geschäftsleitung'}
                  </div>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-xs divide-y divide-slate-200/80">
              <div className="flex justify-between py-2">
                <span className="text-[#1e3a5f] font-semibold">Belegnummer:</span>
                <span className="font-mono font-black text-[#0e264b]">{viewingTx.receiptNumber}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#1e3a5f] font-semibold">Zielkonto:</span>
                <span className="font-bold text-[#0e264b]">{viewingTx.account || 'Kasse'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#1e3a5f] font-semibold">Buchungsdatum & Zeit:</span>
                <span className="font-bold text-[#0e264b]">{viewingTx.timestamp}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#1e3a5f] font-semibold">Kategorie:</span>
                <span className="font-bold text-[#0e264b]">{viewingTx.category}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#1e3a5f] font-semibold">Buchungstext:</span>
                <span className="font-bold text-[#0e264b] text-right max-w-[260px]">{viewingTx.description}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#1e3a5f] font-semibold">Steuersatz:</span>
                <span className="font-bold text-[#0e264b]">{viewingTx.taxRate}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#1e3a5f] font-semibold">Betrag:</span>
                <span className="font-mono font-black text-sm text-[#0e264b]">
                  {viewingTx.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#1e3a5f] font-semibold">Erfasser:</span>
                <span className="font-bold text-[#0e264b]">{viewingTx.recordedBy}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingTx(null)}
                className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black rounded-2xl cursor-pointer shadow-sm"
              >
                Schließen
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. FESTSCHREIBUNG (LOCKING) CONFIRMATION MODAL                        */}
      {/* ===================================================================== */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-6 overflow-y-auto animate-in fade-in">
          <div className="metallic-modal-container rounded-3xl max-w-md w-full border border-slate-300/80 shadow-[0_0_50px_rgba(0,0,0,0.35)] overflow-hidden text-[#0e264b] p-5 sm:p-6 space-y-4 animate-in slide-in-from-top-4 my-0 sm:my-2">
            
            <div className="flex items-center justify-between border-b border-slate-300/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-md text-[#0e264b]">
                  <ShieldCheck className="w-6 h-6 text-[#0e264b] metallic-debossed-icon" />
                </div>
                <div>
                  <h3 className="font-black text-[#0e264b] text-base sm:text-lg">
                    Kassenbuch festschreiben (GoBD)
                  </h3>
                  <p className="text-[11px] text-[#1e3a5f]/80 font-semibold">
                    Revisionssichere Festschreibung für Steuerberater & DATEV
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsLockModalOpen(false)} 
                className="p-1.5 text-[#1e3a5f] hover:text-[#0e264b] rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5 metallic-debossed-icon" />
              </button>
            </div>

            {lockFeedback ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-3 text-xs font-bold animate-in fade-in">
                <Check className="w-5 h-5 text-emerald-700 shrink-0 stroke-[3]" />
                <span>{lockFeedback}</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-[#0e264b]">
                <div className="p-3.5 bg-amber-50/80 border border-amber-300/80 rounded-2xl text-amber-900 space-y-1">
                  <div className="font-black flex items-center gap-1.5 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>GoBD-Konformität & Festschreibung</span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    Durch die Festschreibung werden die Bar-Buchungen (Kasse) bis zum gewählten Stichtag <strong>dauerhaft schreibgeschützt</strong> und können danach nicht mehr verändert oder gelöscht werden. <em>(Bank-Konto Buchungen bedürfen externer Bankauszüge und sind von der Kassen-Festschreibung ausgenommen)</em>.
                  </p>
                </div>

                {hasUnfinalizedCashInFilter && (
                  <div className="p-3 bg-emerald-50/90 border border-emerald-300/80 rounded-2xl text-emerald-900 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Schnell-Festschreibung für aktiven Filter:</span>
                      <span className="bg-emerald-200/80 px-2 py-0.5 rounded-full text-[10px] font-black">{unfinalizedCashTxsInFilter.length} Belege</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleLockFilterCashTransactions}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nur die {unfinalizedCashTxsInFilter.length} offenen Filter-Belege festschreiben</span>
                    </button>
                  </div>
                )}

                <div>
                  <label className="block font-black text-[#0e264b] mb-1">
                    Oder alle Kassenbelege festschreiben bis Stichtag:
                  </label>
                  <input
                    type="date"
                    required
                    value={lockCutoffDate}
                    onChange={(e) => setLockCutoffDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 metallic-input rounded-2xl text-[#0e264b] font-bold border border-slate-300/80 focus:border-[#0e264b] focus:outline-none"
                  />
                  <p className="text-[10px] text-[#1e3a5f]/80 mt-1">
                    Aktuell sind insgesamt <strong>{unlockedCount}</strong> offene Barbelege im Journal vorhanden.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsLockModalOpen(false)}
                    className="px-4 py-2.5 metallic-btn-secondary text-[#1e3a5f] font-bold rounded-2xl cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLock}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Lock className="w-4 h-4 text-amber-400 stroke-[2.5]" />
                    <span>Festschreibung bestätigen</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. EXPORT NOTICE MODAL (WHEN UNFINALIZED TRANSACTIONS EXIST IN FILTER)*/}
      {/* ===================================================================== */}
      {exportNoticeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-6 overflow-y-auto animate-in fade-in">
          <div className="metallic-modal-container rounded-3xl max-w-md w-full border border-slate-300/80 shadow-[0_0_50px_rgba(0,0,0,0.35)] overflow-hidden text-[#0e264b] p-5 sm:p-6 space-y-4 animate-in slide-in-from-top-4 my-0 sm:my-2">
            
            <div className="flex items-center justify-between border-b border-slate-300/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-md text-amber-700">
                  <AlertCircle className="w-5 h-5 metallic-debossed-icon text-amber-600" />
                </div>
                <div>
                  <h3 className="font-black text-[#0e264b] text-base sm:text-lg">
                    Export-Sperre (GoBD)
                  </h3>
                  <p className="text-[11px] text-[#1e3a5f]/80 font-semibold">
                    Offene Kassenbuchungen im gewählten Zeitraum
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setExportNoticeOpen(false)} 
                className="p-1.5 text-[#1e3a5f] hover:text-[#0e264b] rounded-full hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5 metallic-debossed-icon" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[#0e264b]">
              <div className="p-3 bg-amber-50/90 border border-amber-300/80 rounded-2xl text-amber-900 space-y-1.5">
                <p className="font-bold leading-relaxed">
                  Der DATEV- und Journal-Export für den Zeitraum {getTimeFilterLabel() ? `(„${getTimeFilterLabel()}“)` : ''} ist gesperrt:
                </p>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  Es befinden sich noch <strong>{unfinalizedCashTxsInFilter.length} ungesicherte Bar-Buchungen (Kasse)</strong> im gefilterten Bereich. Nach GoBD-Grundsätzen muss das Kassenbuch vor dem Export festgeschrieben sein.
                </p>
                <p className="text-[10px] text-amber-800 font-medium">
                  <em>Hinweis: Bankkonto-Buchungen ({filteredBankTransactions.length}) benötigen keine Festschreibung.</em>
                </p>
              </div>

              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={handleLockFilterCashTransactions}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition active:scale-95"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Diese {unfinalizedCashTxsInFilter.length} offenen Barbelege jetzt festschreiben</span>
                </button>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setExportNoticeOpen(false);
                      setIsLockModalOpen(true);
                    }}
                    className="flex-1 py-2 px-3 metallic-btn-secondary text-[#1e3a5f] font-bold rounded-2xl text-[11px] cursor-pointer text-center"
                  >
                    Nach Stichtag festschreiben
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportNoticeOpen(false)}
                    className="flex-1 py-2 px-3 metallic-btn-secondary text-[#1e3a5f] font-bold rounded-2xl text-[11px] cursor-pointer text-center"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
