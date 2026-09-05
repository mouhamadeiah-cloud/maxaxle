import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { OperationenView } from './components/OperationenView';
import { NeuView } from './components/NeuView';
import { MeinLagerView } from './components/MeinLagerView';
import { KundenlisteView } from './components/KundenlisteView';
import { RechnungslisteView } from './components/RechnungslisteView';
import { FinanzenView } from './components/FinanzenView';
import { EinstellungenView } from './components/EinstellungenView';
import { WebShowroomView } from './components/showroom/WebShowroomView';
import { SlidePanel } from './components/SlidePanel';
import { NebulaBackground } from './components/NebulaBackground';
import { SteelPlateBackground } from './components/SteelPlateBackground';
import { MaxAiChatDrawer } from './components/MaxAiChatDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { 
  NavTab, 
  Vehicle, 
  Customer, 
  Invoice, 
  VehicleExpense, 
  AppUser, 
  OperationDocumentType,
  VehicleDocumentItem
} from './types';
import { INITIAL_CUSTOMERS, INITIAL_INVOICES } from './mockData';
import { firebaseService } from './services/firebaseService';
import { aiService } from './services/aiService';
import { ShieldAlert, Lock, ArrowRight, ArrowLeft, UserCheck, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => firebaseService.getVehicles());
  const [customers, setCustomers] = useState<Customer[]>(() => firebaseService.getCustomers());
  const [invoices, setInvoices] = useState<Invoice[]>(() => firebaseService.getInvoices());
  const [selectedCustomerForOperation, setSelectedCustomerForOperation] = useState<Customer | null>(null);
  const [selectedVehicleForOperation, setSelectedVehicleForOperation] = useState<Vehicle | null>(null);
  const [editingVehicleMaster, setEditingVehicleMaster] = useState<Vehicle | null>(null);
  const [vehicleEditReturnTab, setVehicleEditReturnTab] = useState<NavTab>('lager');
  const [operationInitialDocType, setOperationInitialDocType] = useState<OperationDocumentType | null>(null);
  const [operationInitialViewState, setOperationInitialViewState] = useState<'hub' | 'document_view'>('hub');
  const [currentUser, setCurrentUser] = useState<AppUser>(() => firebaseService.getCurrentUser());
  const [isGlobalMaxAiOpen, setIsGlobalMaxAiOpen] = useState(false);
  const [aiConnected, setAiConnected] = useState<boolean>(() => aiService.getConnectionStatus().isConnected);

  useEffect(() => {
    const unsub = aiService.subscribeConnectionStatus((s) => {
      setAiConnected(s.isConnected);
    });
    return unsub;
  }, []);

  // Global Scroll Reset to Top on any tab transition or active selection change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [activeTab, editingVehicleMaster, selectedVehicleForOperation, selectedCustomerForOperation]);

  // AI Assistant Prefill States for NeuView
  const [prefillVehicleForNeu, setPrefillVehicleForNeu] = useState<Partial<Vehicle> | null>(null);
  const [prefillCustomerForNeu, setPrefillCustomerForNeu] = useState<Partial<Customer> | null>(null);

  const handleTransferToVehicleFromAi = (vehData: Partial<Vehicle>) => {
    setPrefillVehicleForNeu(vehData);
    setPrefillCustomerForNeu(null);
    setEditingVehicleMaster(null);
    setActiveTab('neu');
  };

  const handleTransferToOperationsFromAi = (
    vehData?: Partial<Vehicle>, 
    custData?: Partial<Customer>, 
    invData?: Partial<Invoice>, 
    docItem?: VehicleDocumentItem,
    docType?: OperationDocumentType
  ) => {
    if (vehData && (vehData.id || vehData.brand)) {
      // Find real vehicle by id or matching data if available
      const realVeh = vehData.id ? vehicles.find(v => v.id === vehData.id) : undefined;
      if (realVeh) {
        setSelectedVehicleForOperation(realVeh);
      } else {
        const tempVeh: Vehicle = {
          id: `veh-ai-${Date.now()}`,
          brand: vehData.brand || 'Fahrzeug',
          model: vehData.model || 'Modell',
          variant: vehData.variant || '',
          vin: vehData.vin || '',
          firstRegistration: vehData.firstRegistration || '01/2023',
          mileage: vehData.mileage || 0,
          powerKw: vehData.powerKw || 110,
          powerPs: vehData.powerPs || 150,
          fuelType: vehData.fuelType || 'Benzin',
          transmission: vehData.transmission || 'Automatik',
          color: vehData.color || 'Schwarz',
          purchasePrice: vehData.purchasePrice || 25000,
          sellingPrice: vehData.sellingPrice || 29900,
          taxType: vehData.taxType || 'diff_25a',
          status: 'verfuegbar',
          daysInStock: 0,
          createdAt: new Date().toISOString(),
          location: 'Hauptstandort Mitte',
          imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
          features: ['Klimaautomatik', 'LED-Scheinwerfer', 'Navigationssystem'],
          expenses: [],
          documents: docItem ? [docItem] : []
        };
        setSelectedVehicleForOperation(tempVeh);
      }
    } else {
      setSelectedVehicleForOperation(null);
    }

    if (custData && (custData.id || custData.name || custData.companyName)) {
      const realCust = custData.id ? customers.find(c => c.id === custData.id) : undefined;
      if (realCust) {
        setSelectedCustomerForOperation(realCust);
      } else {
        const tempCust: Customer = {
          id: `cust-ai-${Date.now()}`,
          type: custData.type || 'B2C',
          salutation: custData.salutation || 'Herr',
          name: custData.name || (custData.companyName ? custData.companyName : 'Kunde'),
          companyName: custData.companyName,
          email: custData.email || 'kunde@beispiel.de',
          phone: custData.phone || '+49 30 123456',
          street: custData.street || 'Hauptstraße 1',
          postalCode: custData.postalCode || '10115',
          city: custData.city || 'Berlin',
          country: custData.country || 'Deutschland',
          vatId: custData.vatId,
          taxNumber: custData.taxNumber,
          purchasesCount: 0,
          totalSpent: 0,
          lastContact: 'Heute'
        };
        setSelectedCustomerForOperation(tempCust);
      }
    } else {
      setSelectedCustomerForOperation(null);
    }

    // Set the exact requested document type (rechnung, kaufvertrag, angebot, probefahrt, uebergabeprotokoll, etc.)
    const resolvedDocType = docType || 'rechnung';
    setOperationInitialDocType(resolvedDocType);

    // Only open directly to document view if vehicle is known, otherwise open hub to pick
    if (vehData && (vehData.id || vehData.brand)) {
      setOperationInitialViewState('document_view');
    } else {
      setOperationInitialViewState('hub');
    }
    setActiveTab('operationen');
  };

  const handleTransferToCustomerFromAi = (custData: Partial<Customer>) => {
    setPrefillCustomerForNeu(custData);
    setPrefillVehicleForNeu(null);
    setEditingVehicleMaster(null);
    setActiveTab('neu');
  };

  const handleSaveToArchiveFromAi = (docItem: VehicleDocumentItem) => {
    if (vehicles.length > 0) {
      const targetVehicle = vehicles[0];
      const updatedDocs = [...(targetVehicle.documents || []), docItem];
      firebaseService.updateVehicle(targetVehicle.id, { documents: updatedDocs });
    }
  };

  const handleStartEditVehicleMaster = (
    vehicle: Vehicle, 
    returnDestination: NavTab = 'lager',
    returnDocType: OperationDocumentType | null = null,
    returnCustomer: Customer | null = null
  ) => {
    setEditingVehicleMaster(vehicle);
    setVehicleEditReturnTab(returnDestination);
    if (returnDocType) {
      setOperationInitialDocType(returnDocType);
      setOperationInitialViewState('document_view');
    }
    if (returnCustomer) {
      setSelectedCustomerForOperation(returnCustomer);
    }
    setSelectedVehicleForOperation(vehicle);
    setActiveTab('neu');
  };

  const handleCancelEditVehicleMaster = () => {
    const target = vehicleEditReturnTab || 'lager';
    setEditingVehicleMaster(null);
    setActiveTab(target);
  };

  // Subscribe to real-time changes from firebaseService & clean up storage
  useEffect(() => {
    try {
      localStorage.removeItem('maxfleet_pending_scans');
      const historyRaw = localStorage.getItem('maxfleet_ai_chat_history');
      if (historyRaw && historyRaw.length > 200000) {
        localStorage.removeItem('maxfleet_ai_chat_history');
      }
    } catch {
      // safe ignore
    }

    const unsubscribeVehicles = firebaseService.subscribeVehicles((updatedList) => {
      setVehicles(updatedList);
    });
    const unsubscribeCustomers = firebaseService.subscribeCustomers((updatedCustList) => {
      setCustomers(updatedCustList);
    });
    const unsubscribeInvoices = firebaseService.subscribeInvoices((updatedInvList) => {
      setInvoices(updatedInvList);
    });
    const unsubscribeUser = firebaseService.subscribeCurrentUser((u) => {
      setCurrentUser(u);
    });
    return () => {
      unsubscribeVehicles();
      unsubscribeCustomers();
      unsubscribeInvoices();
      unsubscribeUser();
    };
  }, []);

  const isAdmin = currentUser.roleType === 'admin' || currentUser.role === 'Administrator' || (currentUser.permissions?.canAccessSettings ?? true);

  const handleAddVehicle = (newVehData: Partial<Vehicle>) => {
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      brand: newVehData.brand || 'Unbekannt',
      model: newVehData.model || 'Modell',
      variant: newVehData.variant || '',
      vin: newVehData.vin || 'WAUZZZ0000000000',
      firstRegistration: newVehData.firstRegistration || '01/2023',
      mileage: newVehData.mileage || 0,
      powerKw: newVehData.powerKw || 110,
      powerPs: newVehData.powerPs || 150,
      fuelType: newVehData.fuelType || 'Benzin',
      transmission: newVehData.transmission || 'Automatik',
      color: newVehData.color || 'Schwarz',
      purchasePrice: newVehData.purchasePrice || 25000,
      sellingPrice: newVehData.sellingPrice || 29900,
      taxType: newVehData.taxType || 'diff_25a',
      status: 'verfuegbar',
      daysInStock: 0,
      createdAt: newVehData.createdAt || new Date().toISOString(),
      location: newVehData.location || 'Hauptstandort Mitte',
      imageUrl: newVehData.imageUrl || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      features: newVehData.features || ['Klimaautomatik', 'LED-Scheinwerfer', 'Navigationssystem'],
      expenses: [],
      totalExpenses: 0
    };
    firebaseService.saveVehicle(newVehicle);
  };

  const handleUpdateVehicle = (id: string, updates: Partial<Vehicle>) => {
    firebaseService.updateVehicle(id, updates);
    setSelectedVehicleForOperation((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
  };

  const handleDeleteVehicle = (id: string) => {
    firebaseService.deleteVehicle(id);
  };

  const handleAddExpense = (vehicleId: string, expense: Omit<VehicleExpense, 'id' | 'createdAt' | 'vehicleId'>, pushToKasse: boolean) => {
    firebaseService.addVehicleExpense(vehicleId, expense, pushToKasse);
  };

  const handleDeleteExpense = (vehicleId: string, expenseId: string) => {
    firebaseService.deleteVehicleExpense(vehicleId, expenseId);
  };

  const handleAddCustomer = (newCustData: Partial<Customer>) => {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      type: newCustData.type || 'B2C',
      salutation: newCustData.salutation || 'Herr',
      name: newCustData.name || 'Max Kunde',
      companyName: newCustData.companyName,
      email: newCustData.email || 'kunde@beispiel.de',
      phone: newCustData.phone || '+49 30 123456',
      street: newCustData.street || 'Hauptstraße 1',
      postalCode: newCustData.postalCode || '10115',
      city: newCustData.city || 'Berlin',
      country: newCustData.country || 'Deutschland',
      vatId: newCustData.vatId,
      taxNumber: newCustData.taxNumber,
      purchasesCount: newCustData.purchasesCount || 0,
      totalSpent: newCustData.totalSpent || 0,
      lastContact: newCustData.lastContact || 'Heute'
    };
    firebaseService.saveCustomer(newCustomer);
  };

  const handleUpdateCustomer = (id: string, updates: Partial<Customer>) => {
    firebaseService.updateCustomer(id, updates);
  };

  const handleDeleteCustomer = (id: string) => {
    firebaseService.deleteCustomer(id);
  };

  const handleOpenVehicleDetail = (vehicle: Vehicle) => {
    setActiveTab('lager');
  };

  return (
    <div className="relative min-h-screen hub-steel-canvas text-slate-900 flex flex-col font-sans selection:bg-slate-300 selection:text-slate-950 overflow-x-hidden transition-colors duration-300">
      
      {/* Universal Brushed Stainless Steel Lathe Plate Background */}
      <SteelPlateBackground />

      {/* Fixed Top Navbar with Strict Order & Quick Action Buttons (Desktop md+) */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        stockCount={vehicles.length}
        customerCount={customers.length}
        openInvoicesCount={invoices.filter(i => i.status === 'offen').length}
        onOpenMaxAi={() => setIsGlobalMaxAiOpen(true)}
      />

      {/* Mobile-Only Floating Max AI & Settings Buttons in Top-Right Corner */}
      <div className="fixed top-3.5 right-3.5 z-40 md:hidden select-none flex items-center gap-2">
        {/* Max AI Button beside Settings on Mobile - Exact same size and style */}
        <button
          type="button"
          id="mobile-top-max-btn"
          onClick={() => setIsGlobalMaxAiOpen(true)}
          aria-label="Max AI Assistent"
          title={aiConnected ? "Max AI Assistent (Verbunden & Aktiv)" : "Max AI Assistent (Offline-Modus)"}
          className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md active:scale-90 metallic-node text-[#0e264b] border-slate-300/80 hover:border-slate-400 hover:scale-105"
        >
          {/* Circular Scanning Accent Arc */}
          <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
          
          <span className="relative z-10 font-black text-[11px] lowercase tracking-tight text-[#0e264b] select-none font-mono leading-none">
            max
          </span>

          {/* Connection Status Dot: Green when connected, Red when disconnected */}
          <span 
            className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white z-20 shadow-xs ${
              aiConnected 
                ? 'bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse' 
                : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
            }`} 
            title={aiConnected ? 'Max AI Verbunden' : 'Max AI Nicht Verbunden'}
          />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          id="mobile-top-settings-btn"
          onClick={() => setActiveTab(activeTab === 'einstellungen' ? 'home' : 'einstellungen')}
          aria-label="Systemeinstellungen"
          title="Systemeinstellungen"
          className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md active:scale-90 ${
            activeTab === 'einstellungen'
              ? 'metallic-node-active text-[#0e264b] border-emerald-400 scale-105 ring-2 ring-emerald-400/40'
              : 'metallic-node text-[#0e264b] border-slate-300/80 hover:border-slate-400 hover:scale-105'
          }`}
        >
          {/* Circular Scanning Accent Arc */}
          <div className="absolute inset-[-2.5px] rounded-full border border-white/40 border-t-white/80 pointer-events-none animate-[spin_8s_linear_infinite]" />
          
          <Settings className={`w-4 h-4 metallic-debossed-icon transition-transform duration-300 ${
            activeTab === 'einstellungen' ? 'rotate-90 text-emerald-700 stroke-[2.5]' : 'text-[#0e264b] stroke-[2.2]'
          }`} />

          {activeTab === 'einstellungen' && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full shadow-[0_0_6px_#10b981] animate-pulse" />
          )}
        </button>
      </div>

      {/* Main Content View Switcher */}
      <main className="flex-1 pt-4 md:pt-22 px-3 sm:px-6 max-w-7xl w-full mx-auto pb-24 md:pb-12">
        {activeTab === 'home' ? (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <HomeDashboard
              vehicles={vehicles}
              customers={customers}
              invoices={invoices}
              setActiveTab={setActiveTab}
              onOpenVehicle={handleOpenVehicleDetail}
              onOpenMaxAi={() => setIsGlobalMaxAiOpen(true)}
            />
          </div>
        ) : (
          <SlidePanel isOpen={activeTab !== 'home'} onClose={() => setActiveTab('home')}>
            {activeTab === 'operationen' && (
              <OperationenView
                vehicles={vehicles}
                customers={customers}
                invoices={invoices}
                initialCustomer={selectedCustomerForOperation}
                initialVehicle={selectedVehicleForOperation}
                initialDocType={operationInitialDocType || undefined}
                initialViewState={operationInitialViewState}
                setActiveTab={setActiveTab}
                onOpenMaxAi={() => setIsGlobalMaxAiOpen(true)}
                onEditVehicleMaster={handleStartEditVehicleMaster}
              />
            )}

            {activeTab === 'neu' && (
              <NeuView
                onAddVehicle={handleAddVehicle}
                onAddCustomer={handleAddCustomer}
                setActiveTab={setActiveTab}
                editingVehicle={editingVehicleMaster}
                onUpdateVehicle={handleUpdateVehicle}
                returnTab={vehicleEditReturnTab}
                onCancelEdit={handleCancelEditVehicleMaster}
                prefillVehicleData={prefillVehicleForNeu}
                prefillCustomerData={prefillCustomerForNeu}
                onClearPrefill={() => {
                  setPrefillVehicleForNeu(null);
                  setPrefillCustomerForNeu(null);
                }}
              />
            )}

            {activeTab === 'lager' && (
              <MeinLagerView
                vehicles={vehicles}
                setActiveTab={setActiveTab}
                onUpdateVehicle={handleUpdateVehicle}
                onDeleteVehicle={handleDeleteVehicle}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                onEditVehicleMaster={handleStartEditVehicleMaster}
                onSendToOperations={(veh) => {
                  setSelectedVehicleForOperation(veh);
                  setActiveTab('operationen');
                }}
              />
            )}

            {activeTab === 'kunden' && (
              <KundenlisteView
                customers={customers}
                setActiveTab={setActiveTab}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onSendToOperations={(cust) => {
                  setSelectedCustomerForOperation(cust);
                  setActiveTab('operationen');
                }}
              />
            )}

            {activeTab === 'rechnungen' && (
              <RechnungslisteView
                invoices={invoices}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'finanzen' && (
              <FinanzenView />
            )}

            {activeTab === 'showroom' && (
              <WebShowroomView onBackToApp={() => setActiveTab('home')} />
            )}

            {activeTab === 'einstellungen' && (
              isAdmin ? (
                <EinstellungenView />
              ) : (
                <div className="max-w-2xl mx-auto my-12 metallic-card rounded-3xl p-8 border border-slate-400/50 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 metallic-dial text-slate-900 border border-slate-400/60 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative">
                    <ShieldAlert className="w-8 h-8 text-emerald-500" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-slate-900 animate-pulse" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-white">Zugriff verweigert (RBAC-Schutz)</h2>
                    <p className="text-sm text-slate-300 max-w-md mx-auto">
                      Ihr aktueller Benutzer-Account (<strong className="text-emerald-300">{currentUser.name}</strong>, Rolle: <span className="font-semibold text-emerald-400">{currentUser.role}</span>) verfügt über keine Administrator-Rechte für die Systemeinstellungen.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/80 border border-slate-600/40 rounded-2xl text-xs text-slate-300 max-w-md mx-auto text-left space-y-2">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sicherheitsrichtlinie Autohaus:</span>
                    </div>
                    <p>
                      Mitarbeiter haben vollen Zugriff auf Fahrzeuge, Kunden, Lagerbestand und Operationen, sind jedoch von Stammdaten, Bankkonten, Anfangskapital und Benutzerverwaltung ausgeschlossen.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('home')}
                      className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-500/50 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Zurück zum Home Hub
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const settings = firebaseService.getMerchantSettings();
                        const admin = settings.users?.find(u => u.roleType === 'admin' || u.role === 'Administrator') || settings.users?.[0];
                        if (admin) {
                          firebaseService.setCurrentUser(admin);
                        }
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Als Administrator anmelden</span>
                    </button>
                  </div>
                </div>
              )
            )}
          </SlidePanel>
        )}
      </main>

      {/* Global Max AI Chat Drawer */}
      <MaxAiChatDrawer
        isOpen={isGlobalMaxAiOpen}
        onClose={() => setIsGlobalMaxAiOpen(false)}
        vehicles={vehicles}
        customers={customers}
        invoices={invoices}
        onRefreshData={() => {
          setVehicles(firebaseService.getVehicles());
          setCustomers(firebaseService.getCustomers());
          setInvoices(firebaseService.getInvoices());
        }}
        onNavigateTab={(tab) => {
          // Keep Max AI Chat open as persistent co-pilot across module navigation
          setActiveTab(tab);
        }}
        onTransferToVehicle={handleTransferToVehicleFromAi}
        onTransferToOperations={handleTransferToOperationsFromAi}
        onTransferToCustomer={handleTransferToCustomerFromAi}
        onSaveToArchive={handleSaveToArchiveFromAi}
      />

      {/* Footer Wireframe Harmonized with Top Navbar */}
      <footer className="mt-auto py-5 border-t border-slate-300/40 bg-gradient-to-r from-[#4d5966]/95 via-[#687685]/95 to-[#505d6a]/95 backdrop-blur-md text-xs text-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.35)] select-none hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">MaxFleet Autohaus-Management</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-300 font-medium">Intelligentes Cockpit & KI-Assistent</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 font-medium">
            <span>Version 2.5.0 (Build 2026.08)</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-emerald-300 font-bold">Rechtssicher & DSGVO-konform</span>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Bottom Navigation Bar (Visible only on Mobile, hidden on md+) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMaxAi={() => setIsGlobalMaxAiOpen(true)}
        stockCount={vehicles.length}
        customerCount={customers.length}
        openInvoicesCount={invoices.filter(i => i.status === 'offen').length}
      />

    </div>
  );
}
