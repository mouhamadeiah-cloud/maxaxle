import { 
  Vehicle, 
  VehicleExpense, 
  CashTransaction, 
  VehicleStatus, 
  Customer, 
  MerchantSettings, 
  TextTemplate, 
  TextTemplateCategory,
  AdditionalLocation,
  RedLicensePlate,
  AppUser,
  Invoice,
  OperationDocument,
  ServiceBasisCategory,
  ServiceSubcategory,
  CompanyDocument,
  CompanyDocumentMainCategory
} from '../types';
import { 
  INITIAL_VEHICLES, 
  INITIAL_CASH_TRANSACTIONS, 
  INITIAL_CUSTOMERS,
  DEFAULT_MERCHANT_SETTINGS,
  DEFAULT_SERVICE_BASES,
  INITIAL_TEXT_TEMPLATES,
  INITIAL_INVOICES,
  INITIAL_OPERATIONS
} from '../mockData';
import { INITIAL_COMPANY_DOCUMENTS } from '../data/companyDocumentsData';
import { db, rtdb, firebaseConfig } from '../firebase';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { ref, set as setRtdb, remove as removeRtdb } from 'firebase/database';


const VEHICLES_STORAGE_KEY = 'maxfleet_firestore_fahrzeuge';
const TRANSACTIONS_STORAGE_KEY = 'maxfleet_firestore_kasse_transaktionen';
const CUSTOMERS_STORAGE_KEY = 'maxfleet_firestore_kunden';
const SETTINGS_STORAGE_KEY = 'maxfleet_firestore_settings_haendler';
const TEXT_TEMPLATES_STORAGE_KEY = 'maxfleet_firestore_textvorlagen';
const CURRENT_USER_STORAGE_KEY = 'maxfleet_firestore_current_user';
const INVOICES_STORAGE_KEY = 'maxfleet_firestore_rechnungen';
const OPERATIONS_STORAGE_KEY = 'maxfleet_firestore_operationen';
const COMPANY_DOCUMENTS_STORAGE_KEY = 'maxfleet_firestore_company_documents';
const CUSTOM_SUBCATEGORIES_STORAGE_KEY = 'maxfleet_firestore_custom_subcategories';

type Listener<T> = (data: T) => void;

class FirebaseService {
  private vehicleListeners: Set<Listener<Vehicle[]>> = new Set();
  private transactionListeners: Set<Listener<CashTransaction[]>> = new Set();
  private customerListeners: Set<Listener<Customer[]>> = new Set();
  private settingsListeners: Set<Listener<MerchantSettings>> = new Set();
  private textTemplateListeners: Set<Listener<TextTemplate[]>> = new Set();
  private currentUserListeners: Set<Listener<AppUser>> = new Set();
  private invoiceListeners: Set<Listener<Invoice[]>> = new Set();
  private operationListeners: Set<Listener<OperationDocument[]>> = new Set();
  private companyDocumentListeners: Set<Listener<CompanyDocument[]>> = new Set();

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(COMPANY_DOCUMENTS_STORAGE_KEY)) {
      localStorage.setItem(COMPANY_DOCUMENTS_STORAGE_KEY, JSON.stringify(INITIAL_COMPANY_DOCUMENTS));
    }

    if (!localStorage.getItem(VEHICLES_STORAGE_KEY)) {
      // Seed sample expenses on some vehicles to showcase expense tracker
      const seededVehicles = INITIAL_VEHICLES.map((v, index) => {
        let sampleExpenses: VehicleExpense[] = [];
        if (index === 0) {
          sampleExpenses = [
            {
              id: 'exp-1',
              vehicleId: v.id,
              date: '2026-08-11',
              amount: 220,
              paymentType: 'Bar',
              category: 'Aufbereitung & Reinigung',
              reason: 'Keramikversiegelung & Lederpflege',
              vendor: 'GlanzWerk Berlin GbR',
              receiptNumber: 'GW-8921',
              invoiceFile: { name: 'Rechnung_GlanzWerk_8921.pdf', size: '1.2 MB', type: 'PDF' },
              pushedToCashbook: true,
              cashbookTransactionId: 'cash-seeded-1',
              createdAt: '2026-08-11T14:30:00.000Z'
            },
            {
              id: 'exp-2',
              vehicleId: v.id,
              date: '2026-08-13',
              amount: 140,
              paymentType: 'Banküberweisung',
              category: 'TÜV / HU & Gutachten',
              reason: 'Hauptuntersuchung & DEKRA Gebrauchtwagencheck',
              vendor: 'DEKRA Automobil GmbH',
              receiptNumber: 'DEK-2026-44',
              invoiceFile: { name: 'DEKRA_Gutachten_Bericht.pdf', size: '2.4 MB', type: 'PDF' },
              pushedToCashbook: true,
              cashbookTransactionId: 'cash-seeded-2',
              createdAt: '2026-08-13T10:15:00.000Z'
            }
          ];
        } else if (index === 1) {
          sampleExpenses = [
            {
              id: 'exp-3',
              vehicleId: v.id,
              date: '2026-08-12',
              amount: 450,
              paymentType: 'Banküberweisung',
              category: 'Ersatzteile & Reifen',
              reason: 'Neuer Satz Premium-Sommerreifen 19 Zoll',
              vendor: 'ReifenDirekt Profi GmbH',
              receiptNumber: 'RD-7712',
              invoiceFile: { name: 'Rechnung_ReifenDirekt_7712.pdf', size: '890 KB', type: 'PDF' },
              pushedToCashbook: true,
              cashbookTransactionId: 'cash-seeded-3',
              createdAt: '2026-08-12T16:00:00.000Z'
            }
          ];
        }

        const totalExpenses = sampleExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        return {
          ...v,
          expenses: sampleExpenses,
          totalExpenses
        };
      });

      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(seededVehicles));
    }

    if (!localStorage.getItem(TRANSACTIONS_STORAGE_KEY)) {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_CASH_TRANSACTIONS));
    }

    if (!localStorage.getItem(CUSTOMERS_STORAGE_KEY)) {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    }

    if (!localStorage.getItem(SETTINGS_STORAGE_KEY)) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_MERCHANT_SETTINGS));
    }

    if (!localStorage.getItem(TEXT_TEMPLATES_STORAGE_KEY)) {
      localStorage.setItem(TEXT_TEMPLATES_STORAGE_KEY, JSON.stringify(INITIAL_TEXT_TEMPLATES));
    }

    if (!localStorage.getItem(INVOICES_STORAGE_KEY)) {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(INITIAL_INVOICES));
    }

    if (!localStorage.getItem(OPERATIONS_STORAGE_KEY)) {
      localStorage.setItem(OPERATIONS_STORAGE_KEY, JSON.stringify(INITIAL_OPERATIONS));
    }
  }

  // -------------------------------------------------------------
  // FAHRZEUGE (fahrzeuge/) CRUD OPERATIONS
  // -------------------------------------------------------------

  public getVehicles(): Vehicle[] {
    try {
      const data = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (!data) return INITIAL_VEHICLES;
      return JSON.parse(data);
    } catch {
      return INITIAL_VEHICLES;
    }
  }

  public getVehicleById(id: string): Vehicle | undefined {
    const list = this.getVehicles();
    return list.find(v => v.id === id);
  }

  public saveVehicle(vehicle: Vehicle): Vehicle {
    const list = this.getVehicles();
    const existingIndex = list.findIndex(v => v.id === vehicle.id);
    let updatedList: Vehicle[];

    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = { ...list[existingIndex], ...vehicle };
    } else {
      updatedList = [vehicle, ...list];
    }

    this.persistVehicles(updatedList);
    return vehicle;
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | null {
    const list = this.getVehicles();
    const index = list.findIndex(v => v.id === id);
    if (index === -1) return null;

    const existing = list[index];
    const totalExp = (updates.expenses || existing.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const updated: Vehicle = {
      ...existing,
      ...updates,
      totalExpenses: totalExp
    };

    const updatedList = [...list];
    updatedList[index] = updated;
    this.persistVehicles(updatedList);
    return updated;
  }

  public updateVehicleStatus(id: string, status: VehicleStatus): Vehicle | null {
    return this.updateVehicle(id, { status });
  }

  public deleteVehicle(id: string): boolean {
    const list = this.getVehicles();
    const filtered = list.filter(v => v.id !== id);
    if (filtered.length === list.length) return false;
    this.persistVehicles(filtered);
    return true;
  }

  // -------------------------------------------------------------
  // VEHICLE EXPENSE TRACKER (Kosten-Modul)
  // -------------------------------------------------------------

  public addVehicleExpense(
    vehicleId: string, 
    expenseData: Omit<VehicleExpense, 'id' | 'createdAt' | 'vehicleId'>, 
    pushToKasse: boolean = true
  ): { vehicle: Vehicle; expense: VehicleExpense; cashTx?: CashTransaction } | null {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle) return null;

    const newExpenseId = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    let cashTx: CashTransaction | undefined = undefined;

    if (pushToKasse) {
      const currentTransactions = this.getTransactions();
      const lastBalance = currentTransactions[0]?.balanceAfter || 4850;
      const newBalance = expenseData.paymentType === 'Bar' 
        ? lastBalance - Math.abs(expenseData.amount)
        : lastBalance;

      cashTx = {
        id: `cash-${Date.now()}`,
        receiptNumber: expenseData.receiptNumber || `KB-${new Date().getFullYear()}-${currentTransactions.length + 145}`,
        timestamp: `${expenseData.date || new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`,
        type: 'ausgabe',
        category: expenseData.category || 'Fahrzeugaufbereitung / Nebenkosten',
        description: `Fahrzeug-Ausgabe [${vehicle.brand} ${vehicle.model} - FIN ${vehicle.vin.slice(0, 8)}... (${expenseData.paymentType})]: ${expenseData.reason}`,
        amount: -Math.abs(expenseData.amount),
        taxRate: '19%',
        balanceAfter: newBalance,
        recordedBy: 'M. Mustermann'
      };

      this.addTransaction(cashTx);
    }

    const newExpense: VehicleExpense = {
      ...expenseData,
      id: newExpenseId,
      vehicleId,
      pushedToCashbook: pushToKasse,
      cashbookTransactionId: cashTx?.id,
      createdAt: new Date().toISOString()
    };

    const currentExpenses = vehicle.expenses || [];
    const updatedExpenses = [newExpense, ...currentExpenses];
    const totalExpenses = updatedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const updatedVehicle = this.updateVehicle(vehicleId, {
      expenses: updatedExpenses,
      totalExpenses
    });

    if (!updatedVehicle) return null;
    return { vehicle: updatedVehicle, expense: newExpense, cashTx };
  }

  public deleteVehicleExpense(vehicleId: string, expenseId: string): Vehicle | null {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle) return null;

    const currentExpenses = vehicle.expenses || [];
    const filteredExpenses = currentExpenses.filter(e => e.id !== expenseId);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return this.updateVehicle(vehicleId, {
      expenses: filteredExpenses,
      totalExpenses
    });
  }

  // -------------------------------------------------------------
  // KUNDEN (kunden/) CRUD OPERATIONS & SYNC
  // -------------------------------------------------------------

  public getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (!data) return INITIAL_CUSTOMERS;
      return JSON.parse(data);
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  public getCustomerById(id: string): Customer | undefined {
    const list = this.getCustomers();
    return list.find(c => c.id === id);
  }

  public saveCustomer(customer: Customer): Customer {
    const list = this.getCustomers();
    const existingIndex = list.findIndex(c => c.id === customer.id);
    let updatedList: Customer[];

    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = { ...list[existingIndex], ...customer };
    } else {
      updatedList = [customer, ...list];
    }

    this.persistCustomers(updatedList);
    return customer;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const list = this.getCustomers();
    const index = list.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated: Customer = {
      ...list[index],
      ...updates
    };

    const updatedList = [...list];
    updatedList[index] = updated;
    this.persistCustomers(updatedList);
    return updated;
  }

  public deleteCustomer(id: string): boolean {
    const list = this.getCustomers();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length === list.length) return false;
    this.persistCustomers(filtered);
    return true;
  }

  // -------------------------------------------------------------
  // KASSE & BANK / TRANSAKTIONEN (kasse/transaktionen/)
  // -------------------------------------------------------------

  public getTransactions(): CashTransaction[] {
    try {
      const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (!data) return INITIAL_CASH_TRANSACTIONS;
      const parsed: CashTransaction[] = JSON.parse(data);
      // Ensure account defaults to 'Kasse' if missing for legacy entries
      return parsed.map(t => ({
        ...t,
        account: t.account || (t.type === 'transit' ? 'Kasse' : (t.description.toLowerCase().includes('überweisung') ? 'Bank' : 'Kasse'))
      }));
    } catch {
      return INITIAL_CASH_TRANSACTIONS;
    }
  }

  public getCashBalance(): number {
    const txs = this.getTransactions();
    const settings = this.getMerchantSettings();
    const initial = settings.initialCashBalance || 5000.00;
    
    // Find latest transaction affecting Kasse
    const latestKasseTx = txs.find(t => (!t.account || t.account === 'Kasse'));
    if (latestKasseTx?.balanceAfter !== undefined && (latestKasseTx.account === 'Kasse' || !latestKasseTx.account)) {
      return latestKasseTx.balanceAfter;
    }

    // Otherwise calculate dynamically
    let balance = initial;
    // Walk from oldest to newest
    const chronological = [...txs].reverse();
    for (const tx of chronological) {
      if (!tx.account || tx.account === 'Kasse') {
        balance += (Number(tx.amount) || 0);
      }
    }
    return balance;
  }

  public getBankBalance(): number {
    const txs = this.getTransactions();
    const settings = this.getMerchantSettings();
    const initial = settings.initialBankBalance || 145000.00;

    let balance = initial;
    // Walk from oldest to newest
    const chronological = [...txs].reverse();
    for (const tx of chronological) {
      if (tx.account === 'Bank') {
        balance += (Number(tx.amount) || 0);
      } else if (tx.type === 'transit' && tx.category.toLowerCase().includes('bank')) {
        // Cash transit deposited into bank account
        balance += Math.abs(Number(tx.amount) || 0);
      }
    }
    return balance;
  }

  public addTransaction(tx: CashTransaction): CashTransaction {
    const list = this.getTransactions();
    const enrichedTx: CashTransaction = {
      ...tx,
      account: tx.account || 'Kasse'
    };
    const updated = [enrichedTx, ...list];
    this.persistTransactions(updated);
    return enrichedTx;
  }

  public addFinancialBooking(params: {
    type: 'einnahme' | 'ausgabe' | 'transit' | 'sturz';
    account: 'Kasse' | 'Bank';
    amount: number;
    category: string;
    description: string;
    taxRate: string;
    recordedBy?: string;
    receiptNumber?: string;
    customDate?: string;
  }): CashTransaction {
    const { type, account, amount, category, description, taxRate, recordedBy, receiptNumber, customDate } = params;
    const isIncome = type === 'einnahme';
    const isTransfer = type === 'transit';
    const numAmount = isIncome ? Math.abs(amount) : (isTransfer ? -Math.abs(amount) : -Math.abs(amount));

    let balanceAfter = 0;
    if (account === 'Kasse') {
      const currentCash = this.getCashBalance();
      balanceAfter = currentCash + (type === 'sturz' ? 0 : numAmount);
    } else {
      const currentBank = this.getBankBalance();
      balanceAfter = currentBank + (type === 'sturz' ? 0 : numAmount);
    }

    const txs = this.getTransactions();
    const prefix = account === 'Bank' ? 'BK' : 'KB';
    const defaultReceipt = receiptNumber || `${prefix}-${new Date().getFullYear()}-${txs.length + 144}`;

    let timestampStr = `${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
    if (customDate) {
      if (customDate.includes('T')) {
        const [dPart, tPart] = customDate.split('T');
        const [yyyy, mm, dd] = dPart.split('-');
        timestampStr = `${dd}.${mm}.${yyyy} ${tPart ? tPart.slice(0, 5) : '12:00'}`;
      } else if (customDate.includes('-')) {
        const [yyyy, mm, dd] = customDate.split('-');
        timestampStr = `${dd}.${mm}.${yyyy} ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        timestampStr = customDate;
      }
    }

    const newTx: CashTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      receiptNumber: defaultReceipt,
      timestamp: timestampStr,
      type,
      account,
      category,
      description,
      amount: type === 'sturz' ? 0 : numAmount,
      taxRate,
      balanceAfter,
      recordedBy: recordedBy || this.getCurrentUser().name || 'M. Mustermann',
      locked: false
    };

    return this.addTransaction(newTx);
  }

  public updateTransaction(id: string, updates: Partial<CashTransaction>): CashTransaction | null {
    const list = this.getTransactions();
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return null;

    const existing = list[index];
    if (existing.locked && updates.locked !== false) {
      console.warn('Cannot modify locked transaction:', id);
      return null;
    }

    const updated: CashTransaction = {
      ...existing,
      ...updates
    };

    const updatedList = [...list];
    updatedList[index] = updated;
    this.persistTransactions(updatedList);
    return updated;
  }

  public deleteTransaction(id: string): boolean {
    const list = this.getTransactions();
    const target = list.find(t => t.id === id);
    if (!target || target.locked) {
      return false;
    }
    const filtered = list.filter(t => t.id !== id);
    if (filtered.length === list.length) return false;
    this.persistTransactions(filtered);
    return true;
  }

  public lockTransactions(params?: { upToDate?: string; txIds?: string[]; lockedBy?: string }): { lockedCount: number } {
    const list = this.getTransactions();
    const nowIso = new Date().toISOString();
    const user = params?.lockedBy || this.getCurrentUser().name || 'Geschäftsleitung';
    let count = 0;

    const updatedList = list.map(t => {
      if (t.locked) return t;

      let shouldLock = true;
      if (params?.txIds && params.txIds.length > 0) {
        shouldLock = params.txIds.includes(t.id);
      } else if (params?.upToDate) {
        const [dPart] = t.timestamp.split(' ');
        if (dPart && dPart.includes('.')) {
          const [dd, mm, yyyy] = dPart.split('.');
          const txDateIso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
          shouldLock = txDateIso <= params.upToDate;
        }
      }

      if (shouldLock) {
        count++;
        return {
          ...t,
          locked: true,
          lockedAt: nowIso,
          lockedBy: user
        };
      }
      return t;
    });

    this.persistTransactions(updatedList);
    return { lockedCount: count };
  }

  // -------------------------------------------------------------
  // EINSTELLUNGEN HÄNDLER (settings/haendler/)
  // -------------------------------------------------------------

  public getMerchantSettings(): MerchantSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_MERCHANT_SETTINGS;
      return JSON.parse(data);
    } catch {
      return DEFAULT_MERCHANT_SETTINGS;
    }
  }

  public saveMerchantSettings(settings: MerchantSettings): MerchantSettings {
    const updated: MerchantSettings = {
      ...settings,
      updatedAt: new Date().toISOString()
    };
    this.persistSettings(updated);
    return updated;
  }

  public updateMerchantSettings(updates: Partial<MerchantSettings>): MerchantSettings {
    const current = this.getMerchantSettings();
    const updated: MerchantSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persistSettings(updated);
    return updated;
  }

  public registerInitialCashInKasse(amount: number, date?: string): { tx: CashTransaction; settings: MerchantSettings } {
    const txDate = date || new Date().toISOString().split('T')[0];
    const currentTxs = this.getTransactions();
    const lastBalance = currentTxs[0]?.balanceAfter || 0;
    const newBalance = lastBalance + Math.abs(amount);

    const initialTx: CashTransaction = {
      id: `cash-start-${Date.now()}`,
      receiptNumber: `KB-START-${new Date().getFullYear()}-001`,
      timestamp: `${new Date(txDate).toLocaleDateString('de-DE')} 08:00`,
      type: 'einnahme',
      category: 'Startkapital / Anfangsbestand',
      description: `Einbuchung Kassen-Anfangsbestand / Startkapital Kasse (${amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €)`,
      amount: Math.abs(amount),
      taxRate: '0%',
      balanceAfter: newBalance,
      recordedBy: this.getMerchantSettings().responsiblePerson || 'Geschäftsleitung'
    };

    this.addTransaction(initialTx);

    const updatedSettings = this.updateMerchantSettings({
      initialCashBalance: Math.abs(amount),
      initialCashDate: txDate,
      initialCashRegistered: true
    });

    return { tx: initialTx, settings: updatedSettings };
  }

  public registerInitialBankBalance(amount: number, date?: string): MerchantSettings {
    const txDate = date || new Date().toISOString().split('T')[0];
    const updatedSettings = this.updateMerchantSettings({
      initialBankBalance: Math.abs(amount),
      initialBankDate: txDate,
      initialBankRegistered: true
    });
    return updatedSettings;
  }

  public updateMasterSecurity(masterPassword?: string, masterPin?: string, adminUsername?: string): MerchantSettings {
    const updates: Partial<MerchantSettings> = {
      securityUpdatedAt: new Date().toISOString()
    };
    if (masterPassword !== undefined) updates.masterPassword = masterPassword;
    if (masterPin !== undefined) updates.masterPin = masterPin;
    if (adminUsername !== undefined) updates.adminUsername = adminUsername;

    return this.updateMerchantSettings(updates);
  }

  // -------------------------------------------------------------
  // SERVICE-BASIS & UNTERKATEGORIEN (Selber gestalten)
  // -------------------------------------------------------------

  public getServiceBases(): ServiceBasisCategory[] {
    const settings = this.getMerchantSettings();
    if (settings.serviceBases && Array.isArray(settings.serviceBases) && settings.serviceBases.length > 0) {
      return [...settings.serviceBases].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    }
    return DEFAULT_SERVICE_BASES;
  }

  public saveServiceBases(bases: ServiceBasisCategory[]): ServiceBasisCategory[] {
    const sorted = [...bases].map((b, idx) => ({
      ...b,
      orderIndex: idx,
      updatedAt: new Date().toISOString()
    }));
    this.updateMerchantSettings({ serviceBases: sorted });
    return sorted;
  }

  public addServiceBasis(basis: Omit<ServiceBasisCategory, 'id' | 'createdAt'>): ServiceBasisCategory {
    const list = this.getServiceBases();
    const newBasis: ServiceBasisCategory = {
      ...basis,
      id: `srv-basis-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      orderIndex: list.length,
      active: basis.active ?? true,
      subcategories: basis.subcategories || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...list, newBasis];
    this.saveServiceBases(updated);
    return newBasis;
  }

  public updateServiceBasis(id: string, updates: Partial<ServiceBasisCategory>): ServiceBasisCategory | null {
    const list = this.getServiceBases();
    const index = list.findIndex(b => b.id === id);
    if (index === -1) return null;

    const updatedItem: ServiceBasisCategory = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    list[index] = updatedItem;
    this.saveServiceBases(list);
    return updatedItem;
  }

  public deleteServiceBasis(id: string): boolean {
    const list = this.getServiceBases();
    const filtered = list.filter(b => b.id !== id);
    if (filtered.length === list.length) return false;
    this.saveServiceBases(filtered);
    return true;
  }

  public addServiceSubcategory(basisId: string, sub: Omit<ServiceSubcategory, 'id' | 'createdAt'>): ServiceSubcategory | null {
    const list = this.getServiceBases();
    const basisIndex = list.findIndex(b => b.id === basisId);
    if (basisIndex === -1) return null;

    const basis = list[basisIndex];
    const subcategories = basis.subcategories || [];
    const newSub: ServiceSubcategory = {
      ...sub,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      orderIndex: subcategories.length,
      active: sub.active ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedSubcategories = [...subcategories, newSub];
    list[basisIndex] = {
      ...basis,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString()
    };

    this.saveServiceBases(list);
    return newSub;
  }

  public updateServiceSubcategory(basisId: string, subId: string, updates: Partial<ServiceSubcategory>): ServiceSubcategory | null {
    const list = this.getServiceBases();
    const basisIndex = list.findIndex(b => b.id === basisId);
    if (basisIndex === -1) return null;

    const basis = list[basisIndex];
    const subcategories = [...(basis.subcategories || [])];
    const subIndex = subcategories.findIndex(s => s.id === subId);
    if (subIndex === -1) return null;

    const updatedSub: ServiceSubcategory = {
      ...subcategories[subIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    subcategories[subIndex] = updatedSub;

    list[basisIndex] = {
      ...basis,
      subcategories,
      updatedAt: new Date().toISOString()
    };

    this.saveServiceBases(list);
    return updatedSub;
  }

  public deleteServiceSubcategory(basisId: string, subId: string): boolean {
    const list = this.getServiceBases();
    const basisIndex = list.findIndex(b => b.id === basisId);
    if (basisIndex === -1) return null;

    const basis = list[basisIndex];
    const subcategories = (basis.subcategories || []).filter(s => s.id !== subId);
    if (subcategories.length === (basis.subcategories || []).length) return false;

    list[basisIndex] = {
      ...basis,
      subcategories,
      updatedAt: new Date().toISOString()
    };

    this.saveServiceBases(list);
    return true;
  }

  public reorderServiceBases(orderedIds: string[]): ServiceBasisCategory[] {
    const list = this.getServiceBases();
    const map = new Map(list.map(b => [b.id, b]));
    const reordered: ServiceBasisCategory[] = [];

    orderedIds.forEach((id, idx) => {
      const item = map.get(id);
      if (item) {
        reordered.push({ ...item, orderIndex: idx, updatedAt: new Date().toISOString() });
        map.delete(id);
      }
    });

    map.forEach((item) => {
      reordered.push({ ...item, orderIndex: reordered.length });
    });

    this.saveServiceBases(reordered);
    return reordered;
  }

  public reorderServiceSubcategories(basisId: string, orderedSubIds: string[]): ServiceSubcategory[] {
    const list = this.getServiceBases();
    const basisIndex = list.findIndex(b => b.id === basisId);
    if (basisIndex === -1) return [];

    const basis = list[basisIndex];
    const map = new Map((basis.subcategories || []).map(s => [s.id, s]));
    const reordered: ServiceSubcategory[] = [];

    orderedSubIds.forEach((id, idx) => {
      const item = map.get(id);
      if (item) {
        reordered.push({ ...item, orderIndex: idx, updatedAt: new Date().toISOString() });
        map.delete(id);
      }
    });

    map.forEach((item) => {
      reordered.push({ ...item, orderIndex: reordered.length });
    });

    list[basisIndex] = {
      ...basis,
      subcategories: reordered,
      updatedAt: new Date().toISOString()
    };

    this.saveServiceBases(list);
    return reordered;
  }

  // -------------------------------------------------------------
  // CURRENT USER & RBAC SESSION MANAGEMENT
  // -------------------------------------------------------------

  public getCurrentUser(): AppUser {
    try {
      const data = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const settings = this.getMerchantSettings();
    const adminUser = (settings.users || []).find(u => u.role === 'Administrator' || u.roleType === 'admin') || settings.users?.[0] || {
      id: 'usr-admin-default',
      username: 'admin',
      name: 'Max Mustermann',
      email: 'm.mustermann@maxfleet-gruppe.de',
      role: 'Administrator',
      roleType: 'admin',
      status: 'Aktiv',
      permissions: {
        canAccessSettings: true,
        canManageVehicles: true,
        canManageCustomers: true,
        canManageInvoices: true,
        canManageFinances: true
      }
    };
    return adminUser;
  }

  public setCurrentUser(user: AppUser): void {
    try {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      this.notifyCurrentUserListeners(user);
    } catch (e) {
      console.error('Failed to set current user', e);
    }
  }

  public subscribeCurrentUser(listener: Listener<AppUser>): () => void {
    this.currentUserListeners.add(listener);
    listener(this.getCurrentUser());
    return () => this.currentUserListeners.delete(listener);
  }

  private notifyCurrentUserListeners(data: AppUser) {
    this.currentUserListeners.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error in current user subscriber', err);
      }
    });
  }

  // -------------------------------------------------------------
  // TEXTVORLAGEN (textvorlagen/)
  // -------------------------------------------------------------

  public getTextTemplates(): TextTemplate[] {
    try {
      const data = localStorage.getItem(TEXT_TEMPLATES_STORAGE_KEY);
      if (!data) return INITIAL_TEXT_TEMPLATES;
      return JSON.parse(data);
    } catch {
      return INITIAL_TEXT_TEMPLATES;
    }
  }

  public saveTextTemplate(template: TextTemplate): TextTemplate {
    const list = this.getTextTemplates();
    const existingIndex = list.findIndex(t => t.id === template.id);
    let updatedList: TextTemplate[];

    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = { ...list[existingIndex], ...template, updatedAt: new Date().toISOString() };
    } else {
      updatedList = [...list, { ...template, createdAt: new Date().toISOString() }];
    }

    if (template.isDefault) {
      updatedList = updatedList.map(t => {
        if (t.category === template.category && t.id !== template.id) {
          return { ...t, isDefault: false };
        }
        return t;
      });
    }

    this.persistTextTemplates(updatedList);
    return template;
  }

  public updateTextTemplate(id: string, updates: Partial<TextTemplate>): TextTemplate | null {
    const list = this.getTextTemplates();
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return null;

    let updatedList = [...list];
    const current = list[index];
    const updated: TextTemplate = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    updatedList[index] = updated;

    if (updates.isDefault) {
      updatedList = updatedList.map(t => {
        if (t.category === updated.category && t.id !== id) {
          return { ...t, isDefault: false };
        }
        return t;
      });
    }

    this.persistTextTemplates(updatedList);
    return updated;
  }

  public setDefaultTextTemplate(id: string, category: TextTemplateCategory): TextTemplate[] {
    const list = this.getTextTemplates();
    const updatedList = list.map(t => {
      if (t.category === category) {
        return { ...t, isDefault: t.id === id, updatedAt: new Date().toISOString() };
      }
      return t;
    });

    this.persistTextTemplates(updatedList);
    return updatedList;
  }

  public deleteTextTemplate(id: string): boolean {
    const list = this.getTextTemplates();
    const target = list.find(t => t.id === id);
    if (!target) return false;

    let filtered = list.filter(t => t.id !== id);

    // If we deleted the default template, make the first one in the category default if available
    if (target.isDefault) {
      const remainingInCategory = filtered.filter(t => t.category === target.category);
      if (remainingInCategory.length > 0) {
        filtered = filtered.map(t => t.id === remainingInCategory[0].id ? { ...t, isDefault: true } : t);
      }
    }

    this.persistTextTemplates(filtered);
    return true;
  }

  public getTemplatesByCategory(category: TextTemplateCategory): TextTemplate[] {
    const list = this.getTextTemplates();
    return list
      .filter(t => {
        if (category === 'welcome') return t.category === 'welcome' || (t as any).category === 'begruessung';
        if (category === 'warranty') return t.category === 'warranty' || (t as any).category === 'gewaehrleistung';
        if (category === 'export') return t.category === 'export' || (t as any).category === 'zoll';
        return t.category === category;
      })
      .sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
      });
  }

  public getWelcomeTemplates(): TextTemplate[] {
    return this.getTemplatesByCategory('welcome');
  }

  public getWarrantyTemplates(): TextTemplate[] {
    return this.getTemplatesByCategory('warranty');
  }

  public getExportTemplates(): TextTemplate[] {
    return this.getTemplatesByCategory('export');
  }

  public getDefaultWelcomeTemplate(): string {
    const welcomes = this.getWelcomeTemplates();
    if (welcomes.length === 0) return '';
    const defaultTpl = welcomes.find(t => t.isDefault) || welcomes[0];
    return defaultTpl?.content || '';
  }

  public getDefaultWarrantyTemplate(): string {
    const warranties = this.getWarrantyTemplates();
    if (warranties.length === 0) return '';
    const defaultTpl = warranties.find(t => t.isDefault) || warranties[0];
    return defaultTpl?.content || '';
  }

  public getDefaultExportTemplate(): string {
    const exportsList = this.getExportTemplates();
    if (exportsList.length === 0) return '';
    const defaultTpl = exportsList.find(t => t.isDefault) || exportsList[0];
    return defaultTpl?.content || '';
  }

  public reorderTextTemplates(category: TextTemplateCategory, orderedIds: string[]): TextTemplate[] {
    const list = this.getTextTemplates();
    const otherCategoryTemplates = list.filter(t => t.category !== category);
    const categoryTemplates = list.filter(t => t.category === category);

    const reorderedCategoryTemplates = orderedIds
      .map((id, index) => {
        const found = categoryTemplates.find(t => t.id === id);
        return found ? { ...found, orderIndex: index } : null;
      })
      .filter((t): t is TextTemplate => t !== null);

    const completeList = [...otherCategoryTemplates, ...reorderedCategoryTemplates];
    this.persistTextTemplates(completeList);
    return completeList;
  }

  // -------------------------------------------------------------
  // RECHNUNGEN & BELEGE (rechnungen/)
  // -------------------------------------------------------------

  public getInvoices(): Invoice[] {
    try {
      const data = localStorage.getItem(INVOICES_STORAGE_KEY);
      if (!data) return INITIAL_INVOICES;
      return JSON.parse(data);
    } catch {
      return INITIAL_INVOICES;
    }
  }

  public getInvoiceById(id: string): Invoice | undefined {
    const list = this.getInvoices();
    return list.find(i => i.id === id);
  }

  public saveInvoice(invoice: Invoice): Invoice {
    const list = this.getInvoices();
    const existingIndex = list.findIndex(i => i.id === invoice.id);
    let updatedList: Invoice[];

    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = { ...list[existingIndex], ...invoice };
    } else {
      updatedList = [invoice, ...list];
    }

    this.persistInvoices(updatedList);
    return invoice;
  }

  public updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const list = this.getInvoices();
    const index = list.findIndex(i => i.id === id);
    if (index === -1) return null;

    const updated: Invoice = {
      ...list[index],
      ...updates
    };

    const updatedList = [...list];
    updatedList[index] = updated;
    this.persistInvoices(updatedList);
    return updated;
  }

  public deleteInvoice(id: string): boolean {
    const list = this.getInvoices();
    const filtered = list.filter(i => i.id !== id);
    if (filtered.length === list.length) return false;
    this.persistInvoices(filtered);
    return true;
  }

  // -------------------------------------------------------------
  // INVOICE PAYMENT & FINANCIAL INTEGRATION
  // -------------------------------------------------------------

  public recordInvoicePayment(
    invoiceId: string, 
    paymentData: { 
      amount: number; 
      paymentMethod: 'Barzahlung' | 'Banküberweisung' | 'Kartenzahlung' | 'Finanzierung' | 'Treuhand'; 
      date: string; 
      receiptNumber?: string; 
      notes?: string;
      recordedBy?: string;
    },
    registerInFinances: boolean = true
  ): { updatedInvoice: Invoice; cashTransaction?: CashTransaction } | null {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) return null;

    const paidAmount = Number(paymentData.amount) || 0;
    const previousPaid = Number(invoice.amountPaid) || 0;
    const newTotalPaid = previousPaid + paidAmount;
    
    // Status calculation
    let newStatus: Invoice['status'] = invoice.status;
    if (newTotalPaid >= invoice.amountGross) {
      newStatus = 'bezahlt';
    } else if (newTotalPaid > 0) {
      newStatus = 'teilbezahlt';
    }

    const paymentId = `pmt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const receiptNum = paymentData.receiptNumber || (paymentData.paymentMethod === 'Barzahlung' 
      ? `KB-2026-${Math.floor(140 + Math.random() * 80)}`
      : `BK-2026-${Math.floor(80 + Math.random() * 80)}`);

    const newPaymentEntry = {
      id: paymentId,
      amount: paidAmount,
      paymentMethod: paymentData.paymentMethod,
      date: paymentData.date,
      receiptNumber: receiptNum,
      recordedBy: paymentData.recordedBy || 'M. Mustermann',
      notes: paymentData.notes
    };

    const updatedPayments = [...(invoice.payments || []), newPaymentEntry];

    let cashTx: CashTransaction | undefined = undefined;

    if (registerInFinances && paidAmount > 0) {
      const currentTransactions = this.getTransactions();
      const isCash = paymentData.paymentMethod === 'Barzahlung';
      const account: 'Kasse' | 'Bank' = isCash ? 'Kasse' : 'Bank';
      const lastBalance = currentTransactions[0]?.balanceAfter || 4850;
      const newBalance = lastBalance + paidAmount;

      cashTx = {
        id: `cash-${Date.now()}`,
        receiptNumber: receiptNum,
        timestamp: `${paymentData.date} ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`,
        type: 'einnahme',
        account: account,
        category: `Zahlungseingang Rechnung (${paymentData.paymentMethod})`,
        description: `Zahlungseingang zu Beleg ${invoice.invoiceNumber} [${invoice.customerName} - ${invoice.vehicleTitle}]`,
        amount: paidAmount,
        taxRate: invoice.taxType === 'standard_19' ? '19%' : '0% (§ 25a)',
        balanceAfter: newBalance,
        recordedBy: paymentData.recordedBy || 'M. Mustermann'
      };

      this.addTransaction(cashTx);
    }

    const updatedInvoice: Invoice = {
      ...invoice,
      status: newStatus,
      amountPaid: newTotalPaid,
      payments: updatedPayments
    };

    this.saveInvoice(updatedInvoice);
    return { updatedInvoice, cashTransaction: cashTx };
  }

  // -------------------------------------------------------------
  // INVOICE STORNO (CANCELLATION & FINANCIAL LOGGING)
  // -------------------------------------------------------------

  public cancelInvoiceWithStorno(
    invoiceId: string, 
    stornoData: { 
      reason: string; 
      stornoDate: string; 
      refundMethod: 'Bank' | 'Bar' | 'Verrechnung' | 'Keine'; 
      refundAmount: number; 
      notes?: string;
      recordedBy?: string;
    }
  ): { originalInvoice: Invoice; stornoInvoice: Invoice; refundTransaction?: CashTransaction } | null {
    const original = this.getInvoiceById(invoiceId);
    if (!original) return null;

    const stornoNumber = `STORNO-${original.invoiceNumber}`;
    const stornoId = `inv-storno-${Date.now()}`;

    let refundTx: CashTransaction | undefined = undefined;

    if ((stornoData.refundMethod === 'Bar' || stornoData.refundMethod === 'Bank') && stornoData.refundAmount > 0) {
      const currentTransactions = this.getTransactions();
      const isCash = stornoData.refundMethod === 'Bar';
      const account: 'Kasse' | 'Bank' = isCash ? 'Kasse' : 'Bank';
      const lastBalance = currentTransactions[0]?.balanceAfter || 4850;
      const newBalance = lastBalance - Math.abs(stornoData.refundAmount);

      refundTx = {
        id: `cash-storno-${Date.now()}`,
        receiptNumber: isCash ? `KB-2026-${Math.floor(150 + Math.random() * 50)}` : `BK-2026-${Math.floor(90 + Math.random() * 50)}`,
        timestamp: `${stornoData.stornoDate} ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`,
        type: 'ausgabe',
        account: account,
        category: 'Rückzahlung Stornorechnung',
        description: `Storno & Kaufpreisrückzahlung zu ${original.invoiceNumber} (${original.customerName}): ${stornoData.reason}`,
        amount: -Math.abs(stornoData.refundAmount),
        taxRate: original.taxType === 'standard_19' ? '19%' : '0%',
        balanceAfter: newBalance,
        recordedBy: stornoData.recordedBy || 'M. Mustermann'
      };

      this.addTransaction(refundTx);
    }

    // 1. Update original invoice
    const updatedOriginal: Invoice = {
      ...original,
      status: 'storniert',
      stornoDetails: {
        stornoNumber,
        stornoDate: stornoData.stornoDate,
        reason: stornoData.reason,
        refundMethod: stornoData.refundMethod,
        refundAmount: stornoData.refundAmount,
        originalInvoiceNumber: original.invoiceNumber,
        originalInvoiceId: original.id,
        notes: stornoData.notes
      }
    };
    this.saveInvoice(updatedOriginal);

    // 2. Create official Stornorechnung / Korrekturbeleg
    const stornoInvoice: Invoice = {
      id: stornoId,
      invoiceNumber: stornoNumber,
      invoiceCategory: 'storno',
      documentType: 'rechnung',
      date: stornoData.stornoDate,
      dueDate: stornoData.stornoDate,
      kundeId: original.kundeId,
      autoId: original.autoId,
      customerName: original.customerName,
      customerType: original.customerType,
      customerStreet: original.customerStreet,
      customerPostalCode: original.customerPostalCode,
      customerCity: original.customerCity,
      customerPhone: original.customerPhone,
      customerEmail: original.customerEmail,
      vehicleTitle: `Stornorechnung zu ${original.invoiceNumber} (${original.vehicleTitle})`,
      vin: original.vin,
      amountNet: -Math.abs(original.amountNet),
      taxAmount: -Math.abs(original.taxAmount),
      amountGross: -Math.abs(original.amountGross),
      amountPaid: -Math.abs(stornoData.refundAmount || original.amountGross),
      taxType: original.taxType,
      status: 'storniert',
      paymentMethod: original.paymentMethod,
      originalInvoiceId: original.id,
      originalInvoiceNumber: original.invoiceNumber,
      notes: `Offizielle Stornorechnung gem. § 14 UStG zu Beleg ${original.invoiceNumber}. Grund: ${stornoData.reason}`,
      stornoDetails: {
        stornoNumber,
        stornoDate: stornoData.stornoDate,
        reason: stornoData.reason,
        refundMethod: stornoData.refundMethod,
        refundAmount: stornoData.refundAmount,
        originalInvoiceNumber: original.invoiceNumber,
        originalInvoiceId: original.id,
        notes: stornoData.notes
      }
    };
    this.saveInvoice(stornoInvoice);

    return { originalInvoice: updatedOriginal, stornoInvoice, refundTransaction: refundTx };
  }

  // -------------------------------------------------------------
  // INVOICE GUTSCHRIFT (CREDIT NOTE & REVENUE REDUCTION)
  // -------------------------------------------------------------

  public createCreditNoteGutschrift(
    originalInvoiceId: string,
    gutschriftData: {
      amountGross: number;
      reasonCategory: string;
      reasonText: string;
      refundMethod: 'Bank' | 'Bar' | 'Verrechnung';
      date: string;
      recordedBy?: string;
    }
  ): { originalInvoice: Invoice; gutschriftInvoice: Invoice; refundTransaction?: CashTransaction } | null {
    const original = this.getInvoiceById(originalInvoiceId);
    if (!original) return null;

    const gsNumber = `GS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const gsId = `inv-gs-${Date.now()}`;
    const grossAmount = Math.abs(gutschriftData.amountGross);

    let netAmount = grossAmount;
    let taxAmt = 0;
    if (original.taxType === 'standard_19') {
      netAmount = Math.round((grossAmount / 1.19) * 100) / 100;
      taxAmt = Math.round((grossAmount - netAmount) * 100) / 100;
    }

    let refundTx: CashTransaction | undefined = undefined;

    if (gutschriftData.refundMethod === 'Bar' || gutschriftData.refundMethod === 'Bank') {
      const currentTransactions = this.getTransactions();
      const isCash = gutschriftData.refundMethod === 'Bar';
      const account: 'Kasse' | 'Bank' = isCash ? 'Kasse' : 'Bank';
      const lastBalance = currentTransactions[0]?.balanceAfter || 4850;
      const newBalance = lastBalance - grossAmount;

      refundTx = {
        id: `cash-gs-${Date.now()}`,
        receiptNumber: isCash ? `KB-2026-${Math.floor(160 + Math.random() * 40)}` : `BK-2026-${Math.floor(95 + Math.random() * 40)}`,
        timestamp: `${gutschriftData.date} ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`,
        type: 'ausgabe',
        account: account,
        category: 'Gutschrift / Erlösschmälerung',
        description: `Gutschrift ${gsNumber} zu ${original.invoiceNumber} (${original.customerName}): ${gutschriftData.reasonCategory}`,
        amount: -grossAmount,
        taxRate: original.taxType === 'standard_19' ? '19%' : '0%',
        balanceAfter: newBalance,
        recordedBy: gutschriftData.recordedBy || 'M. Mustermann'
      };

      this.addTransaction(refundTx);
    }

    const gutschriftInvoice: Invoice = {
      id: gsId,
      invoiceNumber: gsNumber,
      invoiceCategory: 'gutschrift',
      documentType: 'rechnung',
      date: gutschriftData.date,
      dueDate: gutschriftData.date,
      kundeId: original.kundeId,
      autoId: original.autoId,
      customerName: original.customerName,
      customerType: original.customerType,
      customerStreet: original.customerStreet,
      customerPostalCode: original.customerPostalCode,
      customerCity: original.customerCity,
      customerPhone: original.customerPhone,
      customerEmail: original.customerEmail,
      vehicleTitle: `Gutschrift zu ${original.invoiceNumber} (${original.vehicleTitle})`,
      vin: original.vin,
      amountNet: -netAmount,
      taxAmount: -taxAmt,
      amountGross: -grossAmount,
      amountPaid: -grossAmount,
      taxType: original.taxType,
      status: 'bezahlt',
      paymentMethod: gutschriftData.refundMethod === 'Bar' ? 'Bar' : 'Überweisung',
      originalInvoiceId: original.id,
      originalInvoiceNumber: original.invoiceNumber,
      notes: `Gutschrift / Rechnungskorrektur gem. § 14 Abs. 4 UStG zu ${original.invoiceNumber}. Grund: ${gutschriftData.reasonCategory} - ${gutschriftData.reasonText}`,
      gutschriftDetails: {
        gutschriftNumber: gsNumber,
        gutschriftDate: gutschriftData.date,
        reasonCategory: gutschriftData.reasonCategory,
        reasonText: gutschriftData.reasonText,
        refundMethod: gutschriftData.refundMethod,
        amountNet: -netAmount,
        taxAmount: -taxAmt,
        amountGross: -grossAmount,
        originalInvoiceNumber: original.invoiceNumber,
        originalInvoiceId: original.id
      }
    };

    this.saveInvoice(gutschriftInvoice);
    return { originalInvoice: original, gutschriftInvoice, refundTransaction: refundTx };
  }

  // -------------------------------------------------------------
  // INVOICE MAHNUNG (DUNNING & REMINDERS)
  // -------------------------------------------------------------

  public addInvoiceDunning(
    invoiceId: string,
    dunningData: {
      level: 1 | 2;
      date: string;
      dueDate: string;
      fee: number;
      interest: number;
      totalClaim: number;
      notes?: string;
    }
  ): Invoice | null {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) return null;

    const newDunningEntry = {
      id: `dunn-${Date.now()}`,
      level: dunningData.level,
      date: dunningData.date,
      dueDate: dunningData.dueDate,
      fee: dunningData.fee,
      interest: dunningData.interest,
      totalClaim: dunningData.totalClaim,
      notes: dunningData.notes,
      generatedAt: new Date().toISOString()
    };

    const updatedDunnings = [...(invoice.dunnings || []), newDunningEntry];

    const updatedInvoice: Invoice = {
      ...invoice,
      mahnstufe: dunningData.level,
      lastMahnungDate: dunningData.date,
      dunnings: updatedDunnings
    };

    this.saveInvoice(updatedInvoice);
    return updatedInvoice;
  }

  // -------------------------------------------------------------
  // OPERATIONEN & DOKUMENTE (operationen/)
  // -------------------------------------------------------------

  public getOperations(): OperationDocument[] {
    try {
      const data = localStorage.getItem(OPERATIONS_STORAGE_KEY);
      if (!data) return INITIAL_OPERATIONS;
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length === 0) return INITIAL_OPERATIONS;
      return parsed;
    } catch {
      return INITIAL_OPERATIONS;
    }
  }

  public getOperationById(id: string): OperationDocument | undefined {
    const list = this.getOperations();
    return list.find(o => o.id === id);
  }

  public saveOperation(operation: OperationDocument, autoCreateInvoice: boolean = true): OperationDocument {
    const list = this.getOperations();
    const existingIndex = list.findIndex(o => o.id === operation.id);
    let updatedList: OperationDocument[];

    const enrichedOperation: OperationDocument = {
      ...operation,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = enrichedOperation;
    } else {
      updatedList = [enrichedOperation, ...list];
    }

    this.persistOperations(updatedList);

    // If this is a commercial document (rechnung, e_rechnung, kaufvertrag, eu_export, export_drittland, angebot),
    // sync it into rechnungen/ so it appears in the Rechnungsliste
    if (autoCreateInvoice && ['rechnung', 'e_rechnung', 'kaufvertrag', 'eu_export', 'export_drittland', 'angebot'].includes(operation.documentType)) {
      const customerName = operation.customer?.name || 
        (operation.manualCustomer?.companyName || `${operation.manualCustomer?.firstName || ''} ${operation.manualCustomer?.lastName || ''}`.trim()) || 
        'Kunde';
      const customerType = operation.customer?.type || operation.manualCustomer?.type || 'B2C';
      
      const primaryVeh = operation.vehicles[0];
      const vehicleTitle = primaryVeh 
        ? `${primaryVeh.brand} ${primaryVeh.model}${operation.vehicles.length > 1 ? ` (+${operation.vehicles.length - 1} weitere)` : ''}`
        : 'Fahrzeugpositionen';
      const vin = primaryVeh ? primaryVeh.vin : '-';

      const invoiceTaxType = primaryVeh?.taxType === 'diff_25a' 
        ? 'diff_25a' 
        : primaryVeh?.taxType === 'standard_19' 
        ? 'standard_19' 
        : operation.documentType === 'kaufvertrag' 
        ? 'kaufvertrag' 
        : 'standard_19';

      const invoiceStatus: Invoice['status'] = operation.status === 'abgeschlossen' ? 'bezahlt' : operation.status === 'entwurf' ? 'entwurf' : 'offen';

      const syncedInvoice: Invoice = {
        id: `inv-${operation.id}`,
        invoiceNumber: operation.documentNumber,
        date: operation.date,
        dueDate: operation.dueDate || operation.date,
        kundeId: operation.kundeId,
        autoId: operation.autoId || primaryVeh?.vehicleId,
        documentType: operation.documentType,
        customerName,
        customerType,
        vehicleTitle,
        vin,
        amountNet: operation.totalNet,
        taxAmount: operation.totalTax,
        amountGross: operation.totalGross,
        taxType: invoiceTaxType,
        status: invoiceStatus,
        paymentMethod: operation.paymentMethod,
        vehiclesCount: operation.vehicles.length
      };

      this.saveInvoice(syncedInvoice);
    }

    return enrichedOperation;
  }

  public deleteOperation(id: string): boolean {
    const list = this.getOperations();
    const filtered = list.filter(o => o.id !== id);
    if (filtered.length === list.length) return false;
    this.persistOperations(filtered);
    return true;
  }

  // -------------------------------------------------------------
  // MEINE DOKUMENTE (FIRMEN-DOKUMENTENARCHIV) CRUD
  // -------------------------------------------------------------

  public getCompanyDocuments(): CompanyDocument[] {
    try {
      const data = localStorage.getItem(COMPANY_DOCUMENTS_STORAGE_KEY);
      if (!data) return INITIAL_COMPANY_DOCUMENTS;
      return JSON.parse(data);
    } catch {
      return INITIAL_COMPANY_DOCUMENTS;
    }
  }

  public getCompanyDocumentById(id: string): CompanyDocument | undefined {
    return this.getCompanyDocuments().find(d => d.id === id);
  }

  public saveCompanyDocument(docItem: CompanyDocument): CompanyDocument {
    const list = this.getCompanyDocuments();
    const existingIndex = list.findIndex(d => d.id === docItem.id);
    let updatedList: CompanyDocument[];
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = { ...docItem, updatedAt: new Date().toISOString() };
    } else {
      updatedList = [docItem, ...list];
    }
    this.persistCompanyDocuments(updatedList);
    return docItem;
  }

  public updateCompanyDocument(docItem: CompanyDocument): CompanyDocument {
    return this.saveCompanyDocument(docItem);
  }

  public deleteCompanyDocument(id: string): boolean {
    const list = this.getCompanyDocuments();
    const filtered = list.filter(d => d.id !== id);
    if (filtered.length === list.length) return false;
    this.persistCompanyDocuments(filtered);
    return true;
  }

  public toggleCompanyDocumentPinned(id: string): boolean {
    const list = this.getCompanyDocuments();
    const docItem = list.find(d => d.id === id);
    if (!docItem) return false;
    docItem.isPinned = !docItem.isPinned;
    this.persistCompanyDocuments(list);
    return true;
  }

  public getCustomDocumentSubcategories(): Record<string, string[]> {
    try {
      const data = localStorage.getItem(CUSTOM_SUBCATEGORIES_STORAGE_KEY);
      if (!data) return {};
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  public saveCustomDocumentSubcategory(category: CompanyDocumentMainCategory, subcategoryName: string): Record<string, string[]> {
    const current = this.getCustomDocumentSubcategories();
    const list = current[category] || [];
    const trimmed = subcategoryName.trim();
    if (trimmed && !list.includes(trimmed)) {
      current[category] = [...list, trimmed];
      try {
        localStorage.setItem(CUSTOM_SUBCATEGORIES_STORAGE_KEY, JSON.stringify(current));
      } catch (e) {
        console.error('Failed to persist custom subcategories', e);
      }
    }
    return current;
  }

  public deleteCustomDocumentSubcategory(category: CompanyDocumentMainCategory, subcategoryName: string): Record<string, string[]> {
    const current = this.getCustomDocumentSubcategories();
    const list = current[category] || [];
    current[category] = list.filter(s => s !== subcategoryName);
    try {
      localStorage.setItem(CUSTOM_SUBCATEGORIES_STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to delete custom subcategory', e);
    }
    return current;
  }

  // -------------------------------------------------------------
  // PERSISTENCE & SUBSCRIBERS
  // -------------------------------------------------------------

  private persistVehicles(list: Vehicle[]) {
    try {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(list));
      this.notifyVehicleListeners(list);
      // Cloud synchronization to Firestore & Realtime DB
      if (typeof window !== 'undefined') {
        const vehiclesRtdbRef = ref(rtdb, 'vehicles/list');
        setRtdb(vehiclesRtdbRef, list).catch(err => console.debug('RTDB vehicle sync:', err?.message));
        const vehiclesDocRef = doc(db, 'haendler_data', 'fahrzeuge');
        setDoc(vehiclesDocRef, { items: list, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => console.debug('Firestore vehicle sync:', err?.message));
      }
    } catch (e) {
      console.error('Failed to persist vehicles to storage', e);
    }
  }

  private persistCustomers(list: Customer[]) {
    try {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(list));
      this.notifyCustomerListeners(list);
      // Cloud synchronization to Firestore & Realtime DB
      if (typeof window !== 'undefined') {
        const custRtdbRef = ref(rtdb, 'customers/list');
        setRtdb(custRtdbRef, list).catch(err => console.debug('RTDB customer sync:', err?.message));
        const custDocRef = doc(db, 'haendler_data', 'kunden');
        setDoc(custDocRef, { items: list, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => console.debug('Firestore customer sync:', err?.message));
      }
    } catch (e) {
      console.error('Failed to persist customers to storage', e);
    }
  }

  private persistInvoices(list: Invoice[]) {
    try {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(list));
      this.notifyInvoiceListeners(list);
      // Cloud synchronization to Firestore & Realtime DB
      if (typeof window !== 'undefined') {
        const invRtdbRef = ref(rtdb, 'invoices/list');
        setRtdb(invRtdbRef, list).catch(err => console.debug('RTDB invoice sync:', err?.message));
        const invDocRef = doc(db, 'haendler_data', 'rechnungen');
        setDoc(invDocRef, { items: list, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => console.debug('Firestore invoice sync:', err?.message));
      }
    } catch (e) {
      console.error('Failed to persist invoices to storage', e);
    }
  }

  private persistOperations(list: OperationDocument[]) {
    try {
      localStorage.setItem(OPERATIONS_STORAGE_KEY, JSON.stringify(list));
      this.notifyOperationListeners(list);
      // Cloud synchronization to Firestore & Realtime DB
      if (typeof window !== 'undefined') {
        const opsRtdbRef = ref(rtdb, 'operations/list');
        setRtdb(opsRtdbRef, list).catch(err => console.debug('RTDB operations sync:', err?.message));
        const opsDocRef = doc(db, 'haendler_data', 'operationen');
        setDoc(opsDocRef, { items: list, updatedAt: new Date().toISOString(), projectId: firebaseConfig.projectId }, { merge: true }).catch(err => console.debug('Firestore operations sync:', err?.message));
      }
    } catch (e) {
      console.error('Failed to persist operations to storage', e);
    }
  }

  private persistTransactions(list: CashTransaction[]) {
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(list));
      this.notifyTransactionListeners(list);
      // Cloud synchronization to Firestore & Realtime DB
      if (typeof window !== 'undefined') {
        const txRtdbRef = ref(rtdb, 'transactions/list');
        setRtdb(txRtdbRef, list).catch(err => console.debug('RTDB transaction sync:', err?.message));
        const txDocRef = doc(db, 'haendler_data', 'kasse_transaktionen');
        setDoc(txDocRef, { items: list, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => console.debug('Firestore transaction sync:', err?.message));
      }
    } catch (e) {
      console.error('Failed to persist transactions to storage', e);
    }
  }

  private persistSettings(settings: MerchantSettings) {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      this.notifySettingsListeners(settings);
      // Cloud synchronization to Firestore & Realtime DB
      if (typeof window !== 'undefined') {
        const settingsRtdbRef = ref(rtdb, 'settings/merchant');
        setRtdb(settingsRtdbRef, settings).catch(err => console.debug('RTDB settings sync:', err?.message));
        const settingsDocRef = doc(db, 'haendler_data', 'settings');
        setDoc(settingsDocRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => console.debug('Firestore settings sync:', err?.message));
      }
    } catch (e) {
      console.error('Failed to persist settings to storage', e);
    }
  }

  private persistTextTemplates(templates: TextTemplate[]) {
    try {
      localStorage.setItem(TEXT_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
      this.notifyTextTemplateListeners(templates);
      // Cloud synchronization to Firestore & Realtime DB
      if (typeof window !== 'undefined') {
        const tplRtdbRef = ref(rtdb, 'templates/text');
        setRtdb(tplRtdbRef, templates).catch(err => console.debug('RTDB template sync:', err?.message));
        const tplDocRef = doc(db, 'haendler_data', 'textvorlagen');
        setDoc(tplDocRef, { items: templates, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => console.debug('Firestore template sync:', err?.message));
      }
    } catch (e) {
      console.error('Failed to persist text templates to storage', e);
    }
  }

  public subscribeVehicles(listener: Listener<Vehicle[]>): () => void {
    this.vehicleListeners.add(listener);
    listener(this.getVehicles());
    return () => this.vehicleListeners.delete(listener);
  }

  public subscribeCustomers(listener: Listener<Customer[]>): () => void {
    this.customerListeners.add(listener);
    listener(this.getCustomers());
    return () => this.customerListeners.delete(listener);
  }

  public subscribeInvoices(listener: Listener<Invoice[]>): () => void {
    this.invoiceListeners.add(listener);
    listener(this.getInvoices());
    return () => this.invoiceListeners.delete(listener);
  }

  public subscribeOperations(listener: Listener<OperationDocument[]>): () => void {
    this.operationListeners.add(listener);
    listener(this.getOperations());
    return () => this.operationListeners.delete(listener);
  }

  public subscribeTransactions(listener: Listener<CashTransaction[]>): () => void {
    this.transactionListeners.add(listener);
    listener(this.getTransactions());
    return () => this.transactionListeners.delete(listener);
  }

  public subscribeMerchantSettings(listener: Listener<MerchantSettings>): () => void {
    this.settingsListeners.add(listener);
    listener(this.getMerchantSettings());
    return () => this.settingsListeners.delete(listener);
  }

  public subscribeTextTemplates(listener: Listener<TextTemplate[]>): () => void {
    this.textTemplateListeners.add(listener);
    listener(this.getTextTemplates());
    return () => this.textTemplateListeners.delete(listener);
  }

  private notifyVehicleListeners(data: Vehicle[]) {
    this.vehicleListeners.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error in vehicle subscriber', err);
      }
    });
  }

  private notifyCustomerListeners(data: Customer[]) {
    this.customerListeners.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error in customer subscriber', err);
      }
    });
  }

  private notifyInvoiceListeners(data: Invoice[]) {
    this.invoiceListeners.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error in invoice subscriber', err);
      }
    });
  }

  private notifyOperationListeners(data: OperationDocument[]) {
    this.operationListeners.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error in operation subscriber', err);
      }
    });
  }

  private notifyTransactionListeners(data: CashTransaction[]) {
    this.transactionListeners.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error in transaction subscriber', err);
      }
    });
  }

  private notifySettingsListeners(data: MerchantSettings) {
    this.settingsListeners.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error in settings subscriber', err);
      }
    });
  }

  private notifyTextTemplateListeners(data: TextTemplate[]) {
    this.textTemplateListeners.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error in text template subscriber', err);
      }
    });
  }

  private persistCompanyDocuments(list: CompanyDocument[]) {
    try {
      localStorage.setItem(COMPANY_DOCUMENTS_STORAGE_KEY, JSON.stringify(list));
      this.notifyCompanyDocumentListeners(list);
      // Cloud synchronization to Firestore & Realtime DB
      if (typeof window !== 'undefined') {
        const docsRtdbRef = ref(rtdb, 'company_documents/list');
        setRtdb(docsRtdbRef, list).catch(err => console.debug('RTDB company docs sync:', err?.message));
        const docsDocRef = doc(db, 'haendler_data', 'company_documents');
        setDoc(docsDocRef, { items: list, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => console.debug('Firestore company docs sync:', err?.message));
      }
    } catch (e) {
      console.error('Failed to persist company documents to storage', e);
    }
  }

  private notifyCompanyDocumentListeners(data: CompanyDocument[]) {
    this.companyDocumentListeners.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error in company document subscriber', err);
      }
    });
  }

  public subscribeCompanyDocuments(listener: Listener<CompanyDocument[]>): () => void {
    this.companyDocumentListeners.add(listener);
    listener(this.getCompanyDocuments());
    return () => this.companyDocumentListeners.delete(listener);
  }
}

export const firebaseService = new FirebaseService();
