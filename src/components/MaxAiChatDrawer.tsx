import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  Car, 
  Calculator, 
  FileText, 
  Scale, 
  CheckCircle2, 
  Loader2,
  RefreshCw,
  Zap,
  ArrowRight,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Plus,
  History,
  RotateCcw,
  Clock,
  Trash2,
  Square,
  MessageSquare
} from 'lucide-react';
import { aiService, ChatMessage, ChatInteractiveAction } from '../services/aiService';
import { workflowService } from '../services/workflowService';
import { firebaseService } from '../services/firebaseService';
import { Vehicle, Customer, Invoice, NavTab, VehicleDocumentItem } from '../types';
import { DualLayerScanningRings } from './CoinOrbitalNode';

interface MaxAiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles?: Vehicle[];
  customers?: Customer[];
  invoices?: Invoice[];
  onRefreshData?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onTransferToVehicle?: (vehicleData: Partial<Vehicle>, originalDoc?: VehicleDocumentItem) => void;
  onTransferToOperations?: (
    vehicleData?: Partial<Vehicle>, 
    customerData?: Partial<Customer>, 
    invoiceData?: Partial<Invoice>, 
    originalDoc?: VehicleDocumentItem,
    docType?: any
  ) => void;
  onTransferToCustomer?: (customerData: Partial<Customer>) => void;
  onSaveToArchive?: (docItem: VehicleDocumentItem) => void;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: 'Hallo! Ich bin **Max**, dein persönlicher AI Operations Manager & Controller für Auto Management.\n\n🚗 **Fahrzeuge & Vorgänge:** Du kannst mich nach Fahrzeugen aus dem Lager fragen, Kaufverträge anfordern, Ausgaben buchen oder Finanzen abfragen.\n\nIch führe gewünschte Schritte direkt auf Knopfdruck für dich im System aus!',
  timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
};

function getCleanAiNotice(err?: string): string {
  if (!err) return '';
  const str = String(err);
  if (str.includes('429') || str.includes('RESOURCE_EXHAUSTED') || str.includes('Ratenlimit') || str.includes('quota') || str.includes('Quota exceeded')) {
    return 'Ratenlimit erreicht (zu viele Anfragen/Minute) – lokaler Assistent aktiv';
  }
  if (str.includes('API_KEY_INVALID') || str.includes('403') || str.includes('key not valid')) {
    return 'API-Schlüssel ungültig oder abgelaufen';
  }
  if (str.includes('503') || str.includes('high demand') || str.includes('UNAVAILABLE') || str.includes('overloaded')) {
    return 'Google Gemini vorübergehend ausgelastet – lokaler Assistent aktiv';
  }
  if (str.includes('{') || str.includes('http') || str.length > 70) {
    return 'Lokaler Autopilot aktiv (KI vorübergehend ausgelastet)';
  }
  return str;
}

export const MaxAiChatDrawer: React.FC<MaxAiChatDrawerProps> = ({
  isOpen,
  onClose,
  vehicles = [],
  customers = [],
  invoices = [],
  onNavigateTab,
  onTransferToVehicle,
  onTransferToOperations,
  onTransferToCustomer,
  onSaveToArchive,
  onRefreshData
}) => {
  // Helper to sanitize chat history and ensure unique IDs
  const sanitizeChatHistory = (rawList: any[]): { id: string; timestamp: string; preview: string; messages: ChatMessage[] }[] => {
    if (!Array.isArray(rawList)) return [];
    const seenIds = new Set<string>();
    const sanitized: { id: string; timestamp: string; preview: string; messages: ChatMessage[] }[] = [];

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      if (!item || !Array.isArray(item.messages)) continue;
      let itemId = typeof item.id === 'string' && item.id.trim() ? item.id : `session-${Date.now()}-${i}`;
      if (seenIds.has(itemId)) {
        itemId = `${itemId}-${i}-${Math.random().toString(36).slice(2, 7)}`;
      }
      seenIds.add(itemId);
      sanitized.push({
        id: itemId,
        timestamp: typeof item.timestamp === 'string' ? item.timestamp : new Date().toLocaleDateString('de-DE'),
        preview: typeof item.preview === 'string' ? item.preview : 'Unterhaltung',
        messages: item.messages
      });
    }
    return sanitized.slice(0, 10);
  };

  // State for active chat history sessions
  const [chatHistory, setChatHistory] = useState<{ id: string; timestamp: string; preview: string; messages: ChatMessage[] }[]>(() => {
    try {
      const saved = localStorage.getItem('maxfleet_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = sanitizeChatHistory(parsed);
          localStorage.setItem('maxfleet_ai_chat_history', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Active chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('maxfleet_ai_active_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiConnected, setAiConnected] = useState<boolean>(() => aiService.getConnectionStatus().isConnected);
  const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false);
  const [archiveSuccessToast, setArchiveSuccessToast] = useState<string | null>(null);
  // Auto-executed workflow banner state
  const [autoExecutedStatus, setAutoExecutedStatus] = useState<{ active: boolean; title: string; docType?: string }>({
    active: false,
    title: ''
  });
  // Minimized state to allow unobstructed full-screen manual input
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Subscribe to live AI connection state (auto-polling in background)
  useEffect(() => {
    const unsub = aiService.subscribeConnectionStatus((status) => {
      setAiConnected(status.isConnected);
    });
    return unsub;
  }, []);

  // Save active messages to sessionStorage and auto-scroll on change
  useEffect(() => {
    try {
      sessionStorage.setItem('maxfleet_ai_active_chat', JSON.stringify(messages));
      sessionStorage.setItem('maxfleet_ai_last_active', Date.now().toString());
    } catch {
      // safely ignore if private browsing or quota limits
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle drawer open/close
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      sessionStorage.setItem('maxfleet_ai_last_active', Date.now().toString());
    } else {
      setIsHistoryDropdownOpen(false);
    }
  }, [isOpen]);

  // Handle ESC key to close drawer or history menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isMinimized) {
        if (isHistoryDropdownOpen) {
          setIsHistoryDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, isHistoryDropdownOpen, onClose]);

  // Stop / Abort generation when Max gets stuck or user clicks stop
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: '🛑 *Die Generierung wurde angehalten.* Wie kann ich dir weiterhelfen?',
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to archive session to history
  const archiveSession = (msgsToArchive: ChatMessage[]) => {
    const userQuery = msgsToArchive.find(m => m.role === 'user')?.content;
    if (!userQuery) return;

    const uniqueId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newSession = {
      id: uniqueId,
      timestamp: new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      preview: userQuery.length > 70 ? `${userQuery.slice(0, 70)}...` : userQuery,
      messages: msgsToArchive
    };

    setChatHistory(prev => {
      const filtered = prev.filter(s => s.id !== newSession.id && s.preview !== newSession.preview);
      const updated = sanitizeChatHistory([newSession, ...filtered]);
      try {
        localStorage.setItem('maxfleet_ai_chat_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Start fresh chat & save previous session to history (keeping max 10)
  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);

    if (messages.some(m => m.role === 'user')) {
      archiveSession(messages);
    }

    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setInputText('');
    setIsHistoryDropdownOpen(false);
    try {
      sessionStorage.setItem('maxfleet_ai_active_chat', JSON.stringify([DEFAULT_WELCOME_MESSAGE]));
      sessionStorage.setItem('maxfleet_ai_last_active', Date.now().toString());
    } catch {
      // ignore
    }
  };

  const handleRestoreSession = (session: { id: string; timestamp: string; preview: string; messages: ChatMessage[] }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);

    if (messages.some(m => m.role === 'user')) {
      const currentFirst = messages.find(m => m.role === 'user')?.content;
      const targetFirst = session.messages.find(m => m.role === 'user')?.content;
      if (currentFirst && currentFirst !== targetFirst) {
        archiveSession(messages);
      }
    }

    setMessages(session.messages);
    setIsHistoryDropdownOpen(false);
    try {
      sessionStorage.setItem('maxfleet_ai_active_chat', JSON.stringify(session.messages));
      sessionStorage.setItem('maxfleet_ai_last_active', Date.now().toString());
    } catch {
      // ignore
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      try {
        localStorage.setItem('maxfleet_ai_chat_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    try {
      localStorage.removeItem('maxfleet_ai_chat_history');
    } catch {
      // ignore
    }
  };

  // Interactive 1-Click Action Handler - Keeps chat open as active co-pilot
  const handleInteractiveAction = (action: ChatInteractiveAction, keepOpen: boolean = true) => {
    if (action.type === 'open_lager') {
      if (action.vehicleId) {
        localStorage.setItem('lager_selected_vehicle_id', action.vehicleId);
      }
      if (action.expenseCategory || (action.amount && !action.invoiceId) || action.expenseTitle) {
        localStorage.setItem('lager_selected_subtab', 'expenses');
        localStorage.setItem('lager_open_expense_modal', 'true');
        if (action.amount) localStorage.setItem('lager_expense_amount', String(action.amount));
        if (action.expenseAmount) localStorage.setItem('lager_expense_amount', String(action.expenseAmount));
        if (action.date) localStorage.setItem('lager_expense_date', action.date);
        if (action.expenseCategory) localStorage.setItem('lager_expense_reason', action.expenseCategory);
        else if (action.expenseTitle) localStorage.setItem('lager_expense_reason', action.expenseTitle);
        if (action.paymentMethod) {
          localStorage.setItem('lager_expense_payment_type', action.paymentMethod.includes('Bank') || action.paymentMethod.includes('UEBERWEISUNG') ? 'Banküberweisung' : 'Bar');
        }
      }
      if (action.searchQuery) {
        localStorage.setItem('lager_search_query', action.searchQuery);
      } else if (action.vehicleBrand && !action.vehicleId) {
        localStorage.setItem('lager_search_query', `${action.vehicleBrand} ${action.vehicleModel || ''}`.trim());
      } else {
        localStorage.removeItem('lager_search_query');
      }
      if (action.filterStatus) {
        localStorage.setItem('lager_filter_status', action.filterStatus);
      } else {
        localStorage.removeItem('lager_filter_status');
      }
      if (onNavigateTab) {
        onNavigateTab('lager');
      }
      setAutoExecutedStatus({
        active: true,
        title: action.vehicleBrand ? `تم فتح مخزن السيارات والفلترة على: ${action.vehicleBrand}` : 'تم فتح مخزن السيارات وتطبيق الفلاتر المطلوبة'
      });
      if (!keepOpen) onClose();
    } else if (action.type === 'open_operations') {
      let targetVehicle: Partial<Vehicle> | undefined;
      let targetCustomer: Partial<Customer> | undefined;

      if (action.vehicleId) {
        targetVehicle = vehicles.find(v => v.id === action.vehicleId);
      } else if (action.vehicleBrand) {
        targetVehicle = vehicles.find(v => 
          v.brand.toLowerCase().includes(action.vehicleBrand!.toLowerCase()) ||
          (action.vehicleModel && v.model.toLowerCase().includes(action.vehicleModel!.toLowerCase()))
        );
        if (!targetVehicle) {
          targetVehicle = {
            brand: action.vehicleBrand,
            model: action.vehicleModel || '',
            sellingPrice: action.sellingPrice || 25000
          };
        }
      } else if (vehicles.length > 0) {
        targetVehicle = vehicles[0];
      }

      if (action.customerId) {
        targetCustomer = customers.find(c => c.id === action.customerId);
      } else if (action.customerName) {
        targetCustomer = customers.find(c => 
          c.name.toLowerCase().includes(action.customerName!.toLowerCase())
        );
      } else if (customers.length > 0) {
        targetCustomer = customers[0];
      }

      if (onTransferToOperations) {
        onTransferToOperations(targetVehicle, targetCustomer, undefined, undefined, action.docType);
      } else if (onNavigateTab) {
        onNavigateTab('operationen');
      }
      setAutoExecutedStatus({
        active: true,
        title: `تم فتح استوديو العمليات وتجهيز مستند (${action.docType || 'Handelsrechnung'}) بالبيانات المتاحة`,
        docType: action.docType
      });
      if (!keepOpen) onClose();
    } else if (action.type === 'add_expense') {
      if (action.vehicleId) {
        localStorage.setItem('lager_selected_vehicle_id', action.vehicleId);
        localStorage.setItem('lager_selected_subtab', 'expenses');
        localStorage.setItem('lager_open_expense_modal', 'true');
        if (action.amount) localStorage.setItem('lager_expense_amount', String(action.amount));
        if (action.expenseAmount) localStorage.setItem('lager_expense_amount', String(action.expenseAmount));
        if (action.date) localStorage.setItem('lager_expense_date', action.date);
        if (action.expenseCategory) localStorage.setItem('lager_expense_reason', action.expenseCategory);
        else if (action.expenseTitle) localStorage.setItem('lager_expense_reason', action.expenseTitle);
        if (action.paymentMethod) {
          localStorage.setItem('lager_expense_payment_type', action.paymentMethod.includes('Bank') || action.paymentMethod.includes('UEBERWEISUNG') ? 'Banküberweisung' : 'Bar');
        }
        if (onNavigateTab) onNavigateTab('lager');
      } else {
        localStorage.setItem('finanzen_open_modal', 'expense');
        if (action.amount) localStorage.setItem('finanzen_booking_amount', String(action.amount));
        if (action.expenseAmount) localStorage.setItem('finanzen_booking_amount', String(action.expenseAmount));
        if (action.account) localStorage.setItem('finanzen_booking_account', action.account);
        if (action.date) localStorage.setItem('finanzen_booking_date', action.date);
        if (action.category || action.expenseCategory) localStorage.setItem('finanzen_booking_category', action.category || action.expenseCategory || 'Betriebsausgabe');
        if (action.description || action.expenseTitle) localStorage.setItem('finanzen_booking_description', action.description || action.expenseTitle || 'Ausgabe');
        if (onNavigateTab) onNavigateTab('finanzen');
      }
      setAutoExecutedStatus({
        active: true,
        title: 'تم فتح قسم المالية وتجهيز قيد المصروف بالمبلغ المتاح',
        docType: 'finanzen'
      });
      if (!keepOpen) onClose();
    } else if (action.type === 'edit_vehicle' || (action.type as string) === 'open_neu') {
      let targetVehicle = action.vehicleId ? vehicles.find(v => v.id === action.vehicleId) : undefined;
      const initialVehicleData: Partial<Vehicle> = targetVehicle || {
        brand: action.vehicleBrand,
        model: action.vehicleModel,
        sellingPrice: action.sellingPrice,
        firstRegistration: action.firstRegistration
      };
      if (onTransferToVehicle) {
        onTransferToVehicle(initialVehicleData);
      } else if (onNavigateTab) {
        onNavigateTab('neu');
      }
      setAutoExecutedStatus({
        active: true,
        title: action.vehicleBrand ? `تم فتح واجهة إضافة السيارة (${action.vehicleBrand} ${action.vehicleModel || ''}) وتعبئة البيانات المتاحة` : 'تم فتح واجهة إضافة السيارة وتعبئة البيانات المتاحة',
        docType: 'neu_fahrzeug'
      });
      if (!keepOpen) onClose();
    } else if (action.type === 'open_customer') {
      let targetCust = action.customerId ? customers.find(c => c.id === action.customerId) : undefined;
      if (!targetCust && (action.customerName || action.customerPhone)) {
        if (onTransferToCustomer) {
          onTransferToCustomer({
            name: action.customerName,
            phone: action.customerPhone
          });
        }
      } else {
        if (action.customerId) {
          localStorage.setItem('kunden_selected_customer_id', action.customerId);
        }
        if (action.searchQuery) {
          localStorage.setItem('kunden_search_query', action.searchQuery);
        } else if (action.customerName) {
          localStorage.setItem('kunden_search_query', action.customerName);
        } else {
          localStorage.removeItem('kunden_search_query');
        }
        if (action.filterType) {
          localStorage.setItem('kunden_filter_type', action.filterType);
        } else {
          localStorage.removeItem('kunden_filter_type');
        }
        if (onNavigateTab) onNavigateTab('kunden');
      }
      setAutoExecutedStatus({
        active: true,
        title: action.customerName ? `تم فتح واجهة إضافة العميل (${action.customerName}) وتعبئة البيانات المتاحة` : 'تم فتح واجهة العملاء وتعبئة البيانات المتاحة',
        docType: 'neu_kunde'
      });
      if (!keepOpen) onClose();
    } else if (action.type === 'open_finanzen') {
      if (action.financeType || action.amount !== undefined) {
        localStorage.setItem('finanzen_open_modal', action.financeType === 'expense' || action.financeType === 'AUSGABE' ? 'expense' : 'income');
        if (action.amount !== undefined) localStorage.setItem('finanzen_booking_amount', String(action.amount));
        if (action.account) localStorage.setItem('finanzen_booking_account', action.account);
        if (action.date) localStorage.setItem('finanzen_booking_date', action.date);
        if (action.category) localStorage.setItem('finanzen_booking_category', action.category);
        if (action.description) localStorage.setItem('finanzen_booking_description', action.description);
      }
      if (action.searchQuery) {
        localStorage.setItem('finanzen_search_query', action.searchQuery);
      } else {
        localStorage.removeItem('finanzen_search_query');
      }
      if (action.filterAccount) {
        localStorage.setItem('finanzen_account_filter', action.filterAccount);
      } else {
        localStorage.removeItem('finanzen_account_filter');
      }
      if (action.filterType) {
        localStorage.setItem('finanzen_type_filter', action.filterType);
      } else {
        localStorage.removeItem('finanzen_type_filter');
      }
      if (action.filterTime) {
        localStorage.setItem('finanzen_time_filter', action.filterTime);
      } else {
        localStorage.removeItem('finanzen_time_filter');
      }
      if (action.dateFrom) {
        localStorage.setItem('finanzen_date_from', action.dateFrom);
      } else {
        localStorage.removeItem('finanzen_date_from');
      }
      if (action.dateTo) {
        localStorage.setItem('finanzen_date_to', action.dateTo);
      } else {
        localStorage.removeItem('finanzen_date_to');
      }
      if (action.amountMin !== undefined) {
        localStorage.setItem('finanzen_amount_min', String(action.amountMin));
      } else {
        localStorage.removeItem('finanzen_amount_min');
      }
      if (action.amountMax !== undefined) {
        localStorage.setItem('finanzen_amount_max', String(action.amountMax));
      } else {
        localStorage.removeItem('finanzen_amount_max');
      }
      if (onNavigateTab) onNavigateTab('finanzen');
      setAutoExecutedStatus({
        active: true,
        title: 'تم فتح قسم المالية ودفتر الكاسة بالبيانات المحددة',
        docType: 'finanzen'
      });
      if (!keepOpen) onClose();
    } else if (action.type === 'open_rechnungen') {
      if (action.invoiceId) {
        localStorage.setItem('rechnungen_selected_invoice_id', action.invoiceId);
        if (action.amount !== undefined || action.paymentMethod || action.date) {
          localStorage.setItem('rechnungen_payment_invoice_id', action.invoiceId);
          if (action.amount !== undefined) localStorage.setItem('rechnungen_payment_amount', String(action.amount));
          if (action.paymentMethod) localStorage.setItem('rechnungen_payment_method', action.paymentMethod);
          if (action.date) localStorage.setItem('rechnungen_payment_date', action.date);
        }
      }
      if (action.searchQuery) {
        localStorage.setItem('rechnungen_search_query', action.searchQuery);
      } else {
        localStorage.removeItem('rechnungen_search_query');
      }
      if (action.filterStatus) {
        localStorage.setItem('rechnungen_status_filter', action.filterStatus);
      } else {
        localStorage.removeItem('rechnungen_status_filter');
      }
      if (action.filterType) {
        localStorage.setItem('rechnungen_type_filter', action.filterType);
      } else {
        localStorage.removeItem('rechnungen_type_filter');
      }
      if (action.dateFrom) {
        localStorage.setItem('rechnungen_date_from', action.dateFrom);
      } else {
        localStorage.removeItem('rechnungen_date_from');
      }
      if (action.dateTo) {
        localStorage.setItem('rechnungen_date_to', action.dateTo);
      } else {
        localStorage.removeItem('rechnungen_date_to');
      }
      if (action.amountMin !== undefined) {
        localStorage.setItem('rechnungen_amount_min', String(action.amountMin));
      } else {
        localStorage.removeItem('rechnungen_amount_min');
      }
      if (action.amountMax !== undefined) {
        localStorage.setItem('rechnungen_amount_max', String(action.amountMax));
      } else {
        localStorage.removeItem('rechnungen_amount_max');
      }
      if (action.filterTime) {
        localStorage.setItem('rechnungen_time_filter', action.filterTime);
      } else if (action.dateFrom || action.dateTo) {
        localStorage.setItem('rechnungen_time_filter', 'custom');
      } else {
        localStorage.removeItem('rechnungen_time_filter');
      }

      window.dispatchEvent(new CustomEvent('maxai_rechnungen_sync'));

      if (onNavigateTab) onNavigateTab('rechnungen');
      setAutoExecutedStatus({
        active: true,
        title: 'تم فتح أرشيف الفواتير وتطبيق فلاتر البحث المحددة',
        docType: 'rechnungen'
      });
      if (!keepOpen) onClose();
    } else if (action.type === 'open_showroom') {
      if (onNavigateTab) onNavigateTab('showroom');
      if (!keepOpen) onClose();
    }
  };

  // Instant Intent Detection & Auto-Execution on UI
  const autoTriggerRequestedAction = (text: string): boolean => {
    const lower = text.toLowerCase();

    // 1. Vehicle Intake Intent
    const isVehicleIntake = (
      lower.includes('أضف سيارة') || lower.includes('اضف سيارة') || lower.includes('سيارة جديدة') ||
      lower.includes('إضافة سيارة') || lower.includes('اضافة سيارة') || lower.includes('تسجيل سيارة') ||
      lower.includes('ادخال سيارة') || lower.includes('شراء سيارة') ||
      lower.includes('neues fahrzeug') || lower.includes('fahrzeug anlegen') || lower.includes('auto anlegen') ||
      lower.includes('auto erfassen') || lower.includes('fahrzeug erfassen') || lower.includes('add vehicle') ||
      lower.includes('new car') || lower.includes('add car')
    );

    if (isVehicleIntake) {
      let brand = '';
      if (lower.includes('bmw') || lower.includes('بي ام')) brand = 'BMW';
      else if (lower.includes('audi') || lower.includes('اودي')) brand = 'Audi';
      else if (lower.includes('mercedes') || lower.includes('مرسيدس')) brand = 'Mercedes-Benz';
      else if (lower.includes('golf') || lower.includes('vw') || lower.includes('فولكس')) brand = 'Volkswagen';
      else if (lower.includes('porsche') || lower.includes('بورش')) brand = 'Porsche';
      else if (lower.includes('ford') || lower.includes('فورد')) brand = 'Ford';
      else if (lower.includes('opel') || lower.includes('اوبل')) brand = 'Opel';
      else if (lower.includes('toyota') || lower.includes('تويوتا')) brand = 'Toyota';
      else if (lower.includes('skoda') || lower.includes('سكودا')) brand = 'Skoda';
      else if (lower.includes('seat') || lower.includes('سيات')) brand = 'Seat';
      else if (lower.includes('hyundai') || lower.includes('هيونداي')) brand = 'Hyundai';

      let model = '';
      const modelMatch = lower.match(/\b(c\s?200|c\s?220|c\s?300|e\s?220|e\s?300|s\s?350|s\s?500|a4|a6|a3|q5|q7|320d|330i|520d|530d|golf|passat|tiguan|macan|cayenne|911|focus|fiesta|yaris|corolla)\b/i);
      if (modelMatch) model = modelMatch[0].toUpperCase();

      let sellingPrice: number | undefined;
      const priceMatch = lower.match(/\b(\d{1,3}(?:[.,]\d{3})*|\d{4,6})\s*(?:€|euro|eur|يورو)?\b/i);
      if (priceMatch) {
        const cleanNum = priceMatch[1].replace(/[.,]/g, '');
        const parsed = parseInt(cleanNum, 10);
        if (parsed >= 1000 && parsed <= 500000) sellingPrice = parsed;
      }

      let firstRegistration: string | undefined;
      const yearMatch = lower.match(/\b(201\d|202\d)\b/);
      if (yearMatch) firstRegistration = `${yearMatch[1]}-01`;

      if (onTransferToVehicle) {
        onTransferToVehicle({
          brand: brand || undefined,
          model: model || undefined,
          sellingPrice,
          firstRegistration
        });
      } else if (onNavigateTab) {
        onNavigateTab('neu');
      }

      setAutoExecutedStatus({
        active: true,
        title: brand ? `تم فتح واجهة إضافة السيارة (${brand} ${model || ''}) وتعبئة البيانات المتاحة` : 'تم فتح واجهة إضافة سيارة جديدة وتعبئة البيانات المتاحة',
        docType: 'neu_fahrzeug'
      });
      return true;
    }

    // 2. Customer Intake Intent
    const isCustomerIntake = (
      lower.includes('أضف عميل') || lower.includes('اضف عميل') || lower.includes('عميل جديد') ||
      lower.includes('زبون جديد') || lower.includes('إضافة زبون') || lower.includes('اضافة زبون') ||
      lower.includes('تسجيل عميل') || lower.includes('إضافة عميل') ||
      lower.includes('neuer kunde') || lower.includes('kunde anlegen') || lower.includes('kunde erfassen') ||
      lower.includes('kunden anlegen') || lower.includes('add customer') || lower.includes('new customer')
    );

    if (isCustomerIntake) {
      let name = '';
      const nameMatch = text.match(/(?:name|kunde|باسم|عميل|زبون|herr|frau)\s*[:\-]?\s*([A-Za-zÄÖÜäöüß\u0600-\u06FF\s]{2,30})/i);
      if (nameMatch) name = nameMatch[1].trim();

      let phone = '';
      const phoneMatch = text.match(/(?:\+?\d{1,4}[\s\-/]?)?\(?\d{2,5}\)?[\s\-/]?\d{3,10}/);
      if (phoneMatch) phone = phoneMatch[0].trim();

      if (onTransferToCustomer) {
        onTransferToCustomer({
          name: name || undefined,
          phone: phone || undefined
        });
      } else if (onNavigateTab) {
        onNavigateTab('neu');
      }

      setAutoExecutedStatus({
        active: true,
        title: name ? `تم فتح واجهة إضافة العميل (${name}) وتعبئة البيانات المتاحة` : 'تم فتح واجهة إضافة عميل جديد وتعبئة البيانات المتاحة',
        docType: 'neu_kunde'
      });
      return true;
    }

    // 3. Document / Contract / Invoice / Test Drive Intent
    const isDocIntent = (
      lower.includes('فاتورة') || lower.includes('عقد بيع') || lower.includes('عقد شراء') ||
      lower.includes('بروبفارت') || lower.includes('تجربة قيادة') || lower.includes('عرض سعر') ||
      lower.includes('محضر تسليم') || lower.includes('kaufvertrag') || lower.includes('vertrag') ||
      lower.includes('rechnung erstellen') || lower.includes('angebot') || lower.includes('probefahrt') ||
      lower.includes('übergabeprotokoll') || lower.includes('create contract') || lower.includes('create invoice')
    );

    if (isDocIntent) {
      let docType: 'rechnung' | 'kaufvertrag' | 'angebot' | 'probefahrt' | 'uebergabeprotokoll' = 'rechnung';
      if (lower.includes('kaufvertrag') || lower.includes('عقد')) docType = 'kaufvertrag';
      else if (lower.includes('angebot') || lower.includes('عرض')) docType = 'angebot';
      else if (lower.includes('probefahrt') || lower.includes('تجربة') || lower.includes('بروبفارت')) docType = 'probefahrt';
      else if (lower.includes('übergabe') || lower.includes('تسليم')) docType = 'uebergabeprotokoll';

      let targetVeh = vehicles.find(v => 
        lower.includes(v.brand.toLowerCase()) || 
        (v.model && lower.includes(v.model.toLowerCase()))
      ) || (vehicles.length > 0 ? vehicles[0] : undefined);

      let targetCust = customers.find(c => 
        lower.includes(c.name.toLowerCase())
      ) || (customers.length > 0 ? customers[0] : undefined);

      if (onTransferToOperations) {
        onTransferToOperations(targetVeh, targetCust, undefined, undefined, docType);
      } else if (onNavigateTab) {
        onNavigateTab('operationen');
      }

      setAutoExecutedStatus({
        active: true,
        title: `تم فتح استوديو العمليات وتجهيز مستند (${docType}) تلقائياً بالبيانات المتاحة`,
        docType
      });
      return true;
    }

    // 4. Expenses / Cashbook Intent
    const isExpense = lower.includes('مصروف') || lower.includes('دفعة') || lower.includes('ausgabe') || lower.includes('kosten') || lower.includes('kassenbuch');
    if (isExpense) {
      localStorage.setItem('finanzen_open_modal', 'expense');
      const amountMatch = lower.match(/\b(\d{1,5}(?:[.,]\d{2})?)\s*(?:€|euro|eur|يورو)?\b/);
      if (amountMatch) {
        localStorage.setItem('finanzen_booking_amount', amountMatch[1].replace(',', '.'));
      }
      if (onNavigateTab) onNavigateTab('finanzen');
      setAutoExecutedStatus({
        active: true,
        title: 'تم فتح نافذة تسجيل المصروفات في المالية وتعبئة المبلغ المتاح',
        docType: 'finanzen'
      });
      return true;
    }

    return false;
  };

  const quickPrompts = [
    {
      label: 'Bestand prüfen',
      icon: Car,
      prompt: 'Gib mir eine kurze Zusammenfassung unseres aktuellen Fahrzeugbestands und der durchschnittlichen Standtage.'
    },
    {
      label: 'Margen analysieren',
      icon: Calculator,
      prompt: 'Welche Fahrzeuge haben die höchste Marge und wo fallen die meisten Aufbereitungskosten an?'
    },
    {
      label: 'Offene Rechnungen',
      icon: FileText,
      prompt: 'Welche Rechnungen sind aktuell offen oder überfällig?'
    },
    {
      label: 'Kaufvertrag-Recht',
      icon: Scale,
      prompt: 'Was muss ich bei einem B2C-Kaufvertrag bezüglich der 12 Monate Sachmängelhaftung beachten?'
    }
  ];

  // Workflow-first chat message send with UI Auto-Triggering & Persistent Co-Pilot
  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    // 1. Immediately detect intent and auto-open requested task in UI with available info
    const triggered = autoTriggerRequestedAction(text.trim());

    const userMsg: ChatMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');

    // Route conversation directly to Gemini AI (Ground Truth & Real Database Context)
    setIsLoading(true);
    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    try {
      // Build structured real-world context for Gemini AI
      const liveVehiclesSummary = vehicles.slice(0, 15).map(v => 
        `• [ID: ${v.id}] ${v.brand} ${v.model} (EZ: ${v.firstRegistration || 'k.A.'}, FIN: ${v.vin || 'k.A.'}, Preis: ${v.sellingPrice ? v.sellingPrice.toLocaleString('de-DE') + ' €' : 'k.A.'}, Status: ${v.status || 'verfügbar'})`
      ).join('\n');

      const liveCustomersSummary = customers.slice(0, 15).map(c => 
        `• [ID: ${c.id}] ${c.name} (${c.companyName || c.type || 'Privat'}, Ort: ${c.city || 'k.A.'})`
      ).join('\n');

      const liveInvoicesSummary = invoices.slice(0, 20).map(i => 
        `• [ID: ${i.id || i.invoiceNumber}] Nr: ${i.invoiceNumber || 'Entwurf'}, Datum: ${i.date || 'k.A.'}, Kunde: ${i.customerName}, Betrag: ${i.amountGross ? i.amountGross.toLocaleString('de-DE') + ' €' : '0 €'}, Status: ${i.status}, Typ: ${i.documentType || i.invoiceCategory || 'Handelsrechnung'}`
      ).join('\n');

      const context = 
        `ECHTE DATENBANK-DATEN DIESES AUTOHAUS-SYSTEMS:\n\n` +
        `FAHRZEUGE IM BESTAND (${vehicles.length} gesamt):\n${liveVehiclesSummary || 'Keine Fahrzeuge im Bestand'}\n\n` +
        `KUNDENKARTEI (${customers.length} gesamt):\n${liveCustomersSummary || 'Keine Kunden erfasst'}\n\n` +
        `RECHNUNGEN & BELEGE (${invoices.length} gesamt):\n${liveInvoicesSummary || 'Keine Rechnungen erfasst'}\n\n` +
        `STRIKTE SICHERHEITSREGEL: Nenne und verwende NUR die oben aufgelisteten realen Fahrzeuge, Kunden und Rechnungen. Erfinde KEINE Fantasienamen, Rechnungsnummern oder Preise!`;

      const result = await aiService.sendMessage(newMessages, context, abortCtrl.signal);
      
      // Auto-trigger interactive actions from AI if not already triggered
      if (!triggered && result.interactiveActions && result.interactiveActions.length > 0) {
        handleInteractiveAction(result.interactiveActions[0], true /* keepOpen */);
      }

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: result.reply,
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          isLiveAI: result.isLiveAI,
          aiError: result.aiError,
          interactiveActions: result.interactiveActions
        }
      ]);
    } catch (err: any) {
      if (err?.name === 'AbortError' || abortCtrl.signal.aborted) {
        // Handled by stop generation
        return;
      }
      const cleanErr = getCleanAiNotice(err?.message) || 'Temporäre Verzögerung der KI-Schnittstelle.';
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: '⚠️ **Hinweis:** ' + cleanErr + '\n\n*Max AI Autopilot führt Ihre Anfragen übergangsweise im lokalen Modus aus.*',
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          isLiveAI: false,
          aiError: cleanErr
        }
      ]);
    } finally {
      if (abortControllerRef.current === abortCtrl) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Minimized Floating Widget - Keep Max easily accessible while interacting with the full screen */}
      {isOpen && isMinimized && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 pointer-events-auto animate-fadeIn">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white shadow-[0_10px_35px_rgba(0,0,0,0.35)] border border-slate-700/80 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <div className="relative w-8 h-8 rounded-full flex items-center justify-center hub-coin-node shrink-0 shadow-md">
              <DualLayerScanningRings
                outerInsetClass="-inset-[4px]"
                innerInsetClass="-inset-[1.5px]"
              />
              <span className="text-[9.5px] font-black text-slate-900 font-mono select-none">max</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-white shadow-[0_0_6px_#10b981]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                مساعد ماكس نشط
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </span>
              <span className="text-[10px] text-slate-300 font-medium">انقر لاستعادة الدردشة</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform ml-1" />
          </button>
        </div>
      )}

      <div 
        className={`fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center sm:justify-end transition-all p-0 sm:p-0 pointer-events-none ${
          isOpen && !isMinimized ? 'opacity-100' : 'opacity-0'
        }`}
      >
        

        {/* Full Backdrop (Desktop & Mobile): Clicking outside the chat box hides it */}
        <div 
          className={`fixed inset-0 bg-slate-950/40 backdrop-blur-[1.5px] transition-opacity duration-300 pointer-events-auto cursor-pointer ${
            isOpen && !isMinimized ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
          title="إغلاق المحادثة بالنقر بالخارج"
        />

        {/* Drawer Panel - Responsive & Positioned on the right, clicks inside do not close */}
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: isOpen && !isMinimized ? 'translate3d(0, 0, 0)' : 'translate3d(0, 30px, 0) sm:translate3d(105%, 0, 0)',
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
            opacity: isOpen && !isMinimized ? 1 : 0
          }}
          className={`relative w-full sm:max-w-xl h-[94vh] sm:h-full m-2 sm:m-0 rounded-3xl sm:rounded-none sm:rounded-l-3xl metallic-modal-container border-2 sm:border-l-2 sm:border-y-0 sm:border-r-0 border-white/70 text-slate-900 shadow-[0_0_60px_rgba(40,60,80,0.45)] flex flex-col z-50 will-change-transform overflow-hidden pointer-events-auto ${
            isOpen && !isMinimized ? '' : 'pointer-events-none'
          }`}
        >
          
          {/* Minimalist Top Bar: Max Icon (Home Coin Style with History Menu) */}
          <div className="px-4 py-3 bg-gradient-to-r from-white/90 via-slate-100/80 to-white/90 border-b border-white/80 flex items-center justify-between shadow-2xs shrink-0">
            
            {/* Max Home-style Coin Icon with Status Ring & Click to open Chat Sessions / New Chat */}
            <button
              type="button"
              onClick={() => setIsHistoryDropdownOpen(prev => !prev)}
              className="group flex items-center gap-2.5 text-left p-1 -ml-1 rounded-2xl hover:bg-slate-200/60 transition cursor-pointer"
              title="قائمة المحادثات السابقة وبدء محادثة جديدة"
            >
              {/* Machined Metallic Max Coin Node matching Navbar Max AI icon */}
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hub-coin-node group-hover:scale-110 active:scale-95 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.95)] shrink-0">
                {/* Dual Layer Rotating Circular Rings matching Navbar */}
                <DualLayerScanningRings
                  outerInsetClass="-inset-[6px] sm:-inset-[8px]"
                  innerInsetClass="-inset-[2.5px] sm:-inset-[3.5px]"
                />

                {/* Recessed Concentric Inner Groove Ring */}
                <div className="absolute inset-1 rounded-full hub-knopf-groove pointer-events-none" />

                {/* Flash Action Hover Glow */}
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-radial from-white/50 to-transparent blur-2xs" />

                <span className="relative z-10 font-black text-[11px] sm:text-xs lowercase tracking-tight text-slate-900 hub-engraved-text select-none font-mono leading-none">
                  max
                </span>

                {/* Luminous Connected Indicator Dot (Maintained & Always Active) */}
                <span 
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white z-20 shadow-xs bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" 
                  title="Max AI Verbunden"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight hub-engraved-text">max</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/90 px-1.5 py-0.2 rounded-md border border-emerald-300/80 shadow-2xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <span className="text-[10.5px] text-slate-500 font-medium flex items-center gap-1">
                  <span>المحادثات السابقة</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isHistoryDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </span>
              </div>
            </button>

            {/* Right Header Controls: Quick New Chat + Minimize + Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Quick Action: Start New Chat */}
              <button
                type="button"
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                title="بدء محادثة جديدة (+ Neuer Chat)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">محادثة جديدة</span>
              </button>

              {/* Minimize / Fold to side */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/80 text-slate-600 flex items-center justify-center transition cursor-pointer"
                title="تصغير شات ماكس جانباً للعمل على الشاشة الكاملة"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-200/80 text-slate-600 flex items-center justify-center transition cursor-pointer"
                title="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive In-Drawer Slide-Down Dropdown: Chat History & New Chat */}
          {isHistoryDropdownOpen && (
            <div className="absolute inset-x-0 top-[59px] bottom-0 z-40 flex flex-col pointer-events-auto animate-fadeIn">
              {/* Internal Backdrop within chat drawer only */}
              <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
                onClick={() => setIsHistoryDropdownOpen(false)}
              />

              {/* Slide-down Card inside Chat Drawer */}
              <div 
                className="relative z-10 mx-2 sm:mx-3 mt-1.5 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[82%] overflow-hidden animate-slideDown"
                onClick={e => e.stopPropagation()}
              >
                {/* Header of Dropdown */}
                <div className="px-4 py-3 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <History className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">المحادثات السابقة والجلسات</h4>
                      <p className="text-[10.5px] text-slate-500 font-medium">سجل آخر 10 محادثات محفوظة مع ماكس</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHistoryDropdownOpen(false)}
                    className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    title="إغلاق القائمة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Action: Start Brand New Chat */}
                <div className="p-3 bg-slate-50/90 border-b border-slate-200/70">
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer group"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                    <span>بدء محادثة جديدة (+ Neuer Chat)</span>
                  </button>
                </div>

                {/* List of Previous Sessions */}
                <div className="p-3 overflow-y-auto space-y-2 flex-1">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      المحادثات المحفوظة ({chatHistory.length})
                    </span>
                    {chatHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearHistory}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition cursor-pointer"
                        title="مسح كافة المحادثات"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>مسح السجل</span>
                      </button>
                    )}
                  </div>

                  {chatHistory.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                      <Clock className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                      <p className="font-semibold text-slate-600">لا توجد محادثات سابقة محفوظة</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">يتم حفظ محادثاتك تلقائياً هنا للرجوع إليها في أي وقت</p>
                    </div>
                  ) : (
                    chatHistory.map((session, sIdx) => (
                      <div
                        key={`${session.id}-${sIdx}`}
                        onClick={() => handleRestoreSession(session)}
                        className="p-2.5 rounded-xl bg-slate-50/90 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300/80 transition-all flex items-center justify-between gap-2.5 group cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-950 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                            <span className="truncate">{session.preview || 'محادثة سابقة'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 pl-5 font-medium">
                            <span>{session.timestamp}</span>
                            <span>•</span>
                            <span>{session.messages.length} رسائل</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreSession(session);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                            title="استعادة هذه المحادثة"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>فتح</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="حذف هذه المحادثة من السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-slate-200/70 bg-slate-50/90 flex items-center justify-between shrink-0">
                  <span className="text-[10.5px] text-slate-500 font-medium">انقر على أي محادثة لمتابعتها فوراً</span>
                  <button
                    type="button"
                    onClick={() => setIsHistoryDropdownOpen(false)}
                    className="px-3 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Task Auto-Executed Live Status Bar */}
          {autoExecutedStatus.active && (
            <div className="mx-4 mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-800 shadow-2xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 shadow-[0_0_6px_#10b981]" />
                <span className="font-semibold text-[11px] leading-tight">{autoExecutedStatus.title}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setAutoExecutedStatus({ active: false, title: '' })} 
                className="text-slate-400 hover:text-slate-600 p-1 text-xs"
                title="إخفاء التنبيه"
              >
                ✕
              </button>
            </div>
          )}

        {/* Success Toast */}
        {archiveSuccessToast && (
          <div className="px-4 py-2.5 bg-emerald-500 text-white text-xs font-bold flex items-center justify-between animate-fadeIn shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{archiveSuccessToast}</span>
            </div>
            <button onClick={() => setArchiveSuccessToast(null)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Actions Bar */}
        <div className="p-3 bg-white/40 border-b border-white/60 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, idx) => {
            const Icon = qp.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp.prompt)}
                disabled={isLoading}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer disabled:opacity-50 hover:scale-[1.02] metallic-card text-slate-800"
              >
                <Icon className="w-3.5 h-3.5 text-emerald-600" />
                <span>{qp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-200/50">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={i} 
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hub-coin-node shrink-0 mt-0.5 shadow-sm">
                    {/* Dual Layer Rotating Circular Rings matching Navbar */}
                    <DualLayerScanningRings
                      outerInsetClass="-inset-[4.5px]"
                      innerInsetClass="-inset-[2px]"
                      outerStrokeWidth={0.8}
                      innerStrokeWidth={0.5}
                    />

                    {/* Recessed Concentric Inner Groove Ring */}
                    <div className="absolute inset-0.5 rounded-full hub-knopf-groove pointer-events-none" />

                    <span className="relative z-10 font-black text-[9.5px] lowercase tracking-tight text-slate-900 hub-engraved-text select-none font-mono leading-none">
                      max
                    </span>

                    {/* Luminous Connected Indicator Dot */}
                    <span 
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white z-20 shadow-xs bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" 
                      title="Max AI Verbunden"
                    />
                  </div>
                )}

                <div className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser 
                    ? 'metallic-btn-primary text-slate-900 font-bold shadow-md' 
                    : 'metallic-card text-slate-900 shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Interactive 1-Click Action Buttons from Max AI */}
                  {msg.interactiveActions && msg.interactiveActions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-300/80 space-y-2">
                      <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Nächster Schritt (1-Klick-Ausführung):</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {msg.interactiveActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={() => handleInteractiveAction(action)}
                            className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer border border-slate-700 hover:border-emerald-400 group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-md bg-white/10 text-emerald-300 group-hover:bg-white/20">
                                {action.type === 'open_lager' && <Car className="w-3.5 h-3.5 text-emerald-400" />}
                                {action.type === 'open_operations' && <FileText className="w-3.5 h-3.5 text-amber-400" />}
                                {action.type === 'add_expense' && <Calculator className="w-3.5 h-3.5 text-blue-400" />}
                                {action.type === 'edit_vehicle' && <RefreshCw className="w-3.5 h-3.5 text-purple-400" />}
                                {action.type === 'open_customer' && <User className="w-3.5 h-3.5 text-emerald-400" />}
                                {action.type === 'open_finanzen' && <Scale className="w-3.5 h-3.5 text-teal-400" />}
                                {action.type === 'open_showroom' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                              </div>
                              <div className="text-left">
                                <div className="font-extrabold text-slate-100 group-hover:text-white">{action.label}</div>
                                {action.sublabel && (
                                  <div className="text-[10px] text-slate-300 font-normal">{action.sublabel}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {action.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/15 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white transition">
                                  {action.badge}
                                </span>
                              )}
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.timestamp && !msg.isLiveAI && !msg.aiError && (
                    <div className={`text-[10px] mt-1.5 text-right font-mono ${
                      isUser ? 'text-slate-700' : 'text-slate-500'
                    }`}>
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full metallic-node flex items-center justify-center font-bold text-xs shrink-0 mt-1 text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-800" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-800 text-xs p-2.5 metallic-card rounded-xl max-w-xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span className="font-semibold">Max analysiert Daten...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3.5 bg-gradient-to-r from-white/90 via-slate-100/90 to-white/90 border-t border-white/80">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Frage an Max stellen..."
              className="flex-1 metallic-input rounded-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-500 focus:outline-none transition"
              disabled={isLoading}
            />

            {/* Stop Button when Max is running/hanging, or Send Button */}
            {isLoading ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                title="Max stoppen"
                className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center shadow-md transition cursor-pointer shrink-0 active:scale-95 animate-pulse"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-full metallic-btn-primary disabled:opacity-40 text-slate-900 font-bold flex items-center justify-center shadow-md transition cursor-pointer shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

      </div>
    </div>
  </>
);
};