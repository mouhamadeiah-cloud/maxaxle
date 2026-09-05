import React, { useState, useEffect, useId } from 'react';
import { 
  X, 
  Car, 
  Euro, 
  Calendar, 
  Gauge, 
  Fuel, 
  Tag, 
  Copy, 
  Check, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Save, 
  UploadCloud, 
  Plus, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Wrench, 
  Sliders, 
  Image as ImageIcon, 
  FileCheck, 
  Clock, 
  Building2, 
  CreditCard, 
  Wallet, 
  Receipt,
  Sparkles,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  Send,
  HelpCircle,
  Globe
} from 'lucide-react';
import { Vehicle, VehicleExpense, VehicleDamageEntry, VehicleStatus, NavTab } from '../types';

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  initialSubTab?: 'overview' | 'expenses' | 'condition' | 'media';
  onClose: () => void;
  onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  onDeleteVehicle: (id: string) => void;
  onAddExpense: (vehicleId: string, expense: Omit<VehicleExpense, 'id' | 'createdAt' | 'vehicleId'>, pushToKasse: boolean) => void;
  onDeleteExpense: (vehicleId: string, expenseId: string) => void;
  setActiveTab?: (tab: NavTab) => void;
  onEditVehicleMaster?: (vehicle: Vehicle, returnTab?: NavTab) => void;
}

const PRESET_EXPENSE_REASONS = [
  'Reinigung & Aufbereitung',
  'Reparatur & Instandsetzung',
  'Transport & Überführung',
  'TÜV / HU & Gutachten',
  'Lackierung & Karosserie',
  'Zulassung & Abmeldung',
  'Ersatzteile & Reifen',
  'Sonstige Nebenkosten',
  'Manuelle Eingabe / Eigener Grund'
];

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  initialSubTab = 'overview',
  onClose,
  onUpdateVehicle,
  onDeleteVehicle,
  onAddExpense,
  onDeleteExpense,
  setActiveTab,
  onEditVehicleMaster
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'expenses' | 'condition' | 'media'>(initialSubTab);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedVin, setCopiedVin] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Floating Sub-Modal for 'Ausgabe hinzufügen'
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  // Sub-Modal Expense Form State
  const [subExpenseDate, setSubExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [subExpenseAmount, setSubExpenseAmount] = useState<string>('');
  const [subExpenseCategoryDropdown, setSubExpenseCategoryDropdown] = useState<string>('Reinigung & Aufbereitung');
  const [subExpenseCustomReason, setSubExpenseCustomReason] = useState<string>('');
  const [subExpensePaymentMethod, setSubExpensePaymentMethod] = useState<'Bar' | 'Banküberweisung'>('Bar');
  const [subExpenseVendor, setSubExpenseVendor] = useState<string>('');
  const [subExpenseReceiptNo, setSubExpenseReceiptNo] = useState<string>('');
  const [subExpenseFormError, setSubExpenseFormError] = useState<string | null>(null);

  // Edit form state
  const [editSellingPrice, setEditSellingPrice] = useState<number>(vehicle.sellingPrice);
  const [editPurchasePrice, setEditPurchasePrice] = useState<number>(vehicle.purchasePrice);
  const [editMileage, setEditMileage] = useState<number>(vehicle.mileage);
  const [editLocation, setEditLocation] = useState<string>(vehicle.location);
  const [editColor, setEditColor] = useState<string>(vehicle.color);
  const [editVariant, setEditVariant] = useState<string>(vehicle.variant || '');
  const [editStatus, setEditStatus] = useState<VehicleStatus>(vehicle.status);

  // =========================================================================
  // CONDITION & INSPECTION EDIT STATE (Step 26)
  // =========================================================================
  const [mechEngine, setMechEngine] = useState<string>(
    vehicle.conditionMechanical?.engine || vehicle.conditionMechanical?.engineCondition || 'Einwandfrei & Trocken'
  );
  const [mechTransmission, setMechTransmission] = useState<string>(
    vehicle.conditionMechanical?.transmission || 'Schaltet präzise & sauber'
  );
  const [mechBrakes, setMechBrakes] = useState<string>(
    vehicle.conditionMechanical?.brakesTires || vehicle.conditionMechanical?.brakePads || '80% Belagstärke (Sehr gut)'
  );
  const [mechTireDepth, setMechTireDepth] = useState<string>(
    vehicle.conditionMechanical?.tireDepthMm ? String(vehicle.conditionMechanical.tireDepthMm) : '6.5'
  );
  const [mechNextService, setMechNextService] = useState<string>(
    vehicle.conditionMechanical?.nextServiceDue || vehicle.conditionMechanical?.lastService || 'In 18.500 km oder 08/2027'
  );
  const [mechTuvDate, setMechTuvDate] = useState<string>(
    vehicle.conditionMechanical?.tuvDate || '08/2027'
  );

  // Body & Chassis Condition State
  const [chassisCondition, setChassisCondition] = useState<string>(
    vehicle.conditionVisual?.damagesNotes || 'Chassis & Unterboden ohne Rost oder Verformungen'
  );
  const [visualInterior, setVisualInterior] = useState<string>(
    vehicle.conditionVisual?.interiorCondition || 'Neuwertig (Nichtraucher)'
  );
  const [visualAccidentFree, setVisualAccidentFree] = useState<boolean>(
    vehicle.conditionVisual?.accidentFree !== false
  );

  // Paintwork / Spray status State
  const [visualPaint, setVisualPaint] = useState<string>(
    vehicle.conditionVisual?.paintCondition || 'Sehr gepflegt / Aufbereitet'
  );
  const [paintSprayStatus, setPaintSprayStatus] = useState<string>('Original Werkslackierung');
  const [visualPaintThickness, setVisualPaintThickness] = useState<number>(
    vehicle.conditionVisual?.paintThicknessUm || 115
  );

  // Specific Defects & Damage Entries State
  const [damageEntriesList, setDamageEntriesList] = useState<VehicleDamageEntry[]>(
    vehicle.damageEntries || []
  );

  // New Damage Entry Form State
  const [isAddDamageOpen, setIsAddDamageOpen] = useState(false);
  const [newDamagePart, setNewDamagePart] = useState('Stoßstange vorne');
  const [newDamageType, setNewDamageType] = useState('Kratzer / Lackbeschädigung');
  const [newDamageSeverity, setNewDamageSeverity] = useState('D1');
  const [newDamageDescription, setNewDamageDescription] = useState('');
  const [newDamageCost, setNewDamageCost] = useState('');
  const [newDamageRepaired, setNewDamageRepaired] = useState(false);

  const handleCopyVin = () => {
    navigator.clipboard?.writeText?.(vehicle.vin);
    setCopiedVin(true);
    setTimeout(() => setCopiedVin(false), 2000);
  };

  // Check for auto-open and prefill instructions from Max AI or compound workflows
  useEffect(() => {
    try {
      const openExpModal = localStorage.getItem('lager_open_expense_modal');
      const selectedSubTab = localStorage.getItem('lager_selected_subtab');
      if (selectedSubTab === 'expenses' || openExpModal === 'true') {
        setActiveSubTab('expenses');
      }

      if (openExpModal === 'true') {
        setIsAddExpenseModalOpen(true);
        const preAmount = localStorage.getItem('lager_expense_amount');
        if (preAmount) setSubExpenseAmount(preAmount);
        
        const preDate = localStorage.getItem('lager_expense_date');
        if (preDate) setSubExpenseDate(preDate);

        const preReason = localStorage.getItem('lager_expense_reason');
        if (preReason) {
          if (PRESET_EXPENSE_REASONS.includes(preReason)) {
            setSubExpenseCategoryDropdown(preReason);
          } else {
            setSubExpenseCategoryDropdown('Manuelle Eingabe / Eigener Grund');
            setSubExpenseCustomReason(preReason);
          }
        }

        const preMethod = localStorage.getItem('lager_expense_payment_type');
        if (preMethod === 'Banküberweisung' || preMethod === 'Bar') {
          setSubExpensePaymentMethod(preMethod);
        }

        localStorage.removeItem('lager_open_expense_modal');
        localStorage.removeItem('lager_selected_subtab');
        localStorage.removeItem('lager_expense_amount');
        localStorage.removeItem('lager_expense_date');
        localStorage.removeItem('lager_expense_reason');
        localStorage.removeItem('lager_expense_payment_type');
      }
    } catch {
      // ignore
    }
  }, []);

  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  const handleSaveVehicleEdits = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVehicle(vehicle.id, {
      sellingPrice: Number(editSellingPrice),
      purchasePrice: Number(editPurchasePrice),
      mileage: Number(editMileage),
      location: editLocation,
      color: editColor,
      variant: editVariant,
      status: editStatus
    });
    setIsEditing(false);
    showToast('Fahrzeugstammdaten erfolgreich aktualisiert!');
  };

  const handleQuickStatusChange = (newStatus: VehicleStatus) => {
    onUpdateVehicle(vehicle.id, { status: newStatus });
    setEditStatus(newStatus);
    showToast(`Fahrzeugstatus auf "${getStatusLabel(newStatus)}" geändert.`);
  };

  // Open the Floating 'Ausgabe hinzufügen' Sub-Modal
  const handleOpenAddExpenseModal = () => {
    setSubExpenseDate(new Date().toISOString().split('T')[0]);
    setSubExpenseAmount('');
    setSubExpenseCategoryDropdown('Reinigung & Aufbereitung');
    setSubExpenseCustomReason('');
    setSubExpensePaymentMethod('Bar');
    setSubExpenseVendor('');
    setSubExpenseReceiptNo('');
    setSubExpenseFormError(null);
    setIsAddExpenseModalOpen(true);
  };

  // Save the Expense from Floating Sub-Modal
  const handleSaveSubExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(subExpenseAmount.replace(',', '.'));

    if (isNaN(amountNum) || amountNum <= 0) {
      setSubExpenseFormError('Bitte geben Sie einen gültigen Betrag größer als 0 € ein.');
      return;
    }

    const finalReason = subExpenseCategoryDropdown === 'Manuelle Eingabe / Eigener Grund'
      ? (subExpenseCustomReason.trim() || 'Sonstige Nebenkosten')
      : (subExpenseCustomReason.trim() ? `${subExpenseCategoryDropdown}: ${subExpenseCustomReason.trim()}` : subExpenseCategoryDropdown);

    // Add expense: saved to fahrzeuge/{id}/ausgaben AND pushed to kasse/transaktionen
    onAddExpense(
      vehicle.id,
      {
        date: subExpenseDate,
        amount: amountNum,
        paymentType: subExpensePaymentMethod,
        category: subExpenseCategoryDropdown === 'Manuelle Eingabe / Eigener Grund' ? 'Sonstige Nebenkosten' : subExpenseCategoryDropdown,
        reason: finalReason,
        vendor: subExpenseVendor.trim() || undefined,
        receiptNumber: subExpenseReceiptNo.trim() || undefined
      },
      true // ALWAYS push to central cashbook / kasse/transaktionen automatically
    );

    setIsAddExpenseModalOpen(false);
    showToast(`Ausgabe über ${amountNum.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € in Fahrzeugakte gespeichert & an Kassenbuch (kasse/transaktionen) übertragen!`);
  };

  // =========================================================================
  // CONDITION & DAMAGE HANDLERS (Step 26)
  // =========================================================================
  const handleAddDamageEntry = () => {
    if (!newDamagePart.trim()) return;
    const newEntry: VehicleDamageEntry = {
      id: `dmg-${Date.now()}`,
      part: newDamagePart.trim(),
      damageType: newDamageType.trim(),
      severity: newDamageSeverity,
      description: newDamageDescription.trim() || undefined,
      estimatedCost: newDamageCost ? parseFloat(newDamageCost.replace(',', '.')) : undefined,
      repaired: newDamageRepaired
    };
    setDamageEntriesList(prev => [...prev, newEntry]);
    setNewDamageDescription('');
    setNewDamageCost('');
    setNewDamageRepaired(false);
    setIsAddDamageOpen(false);
    showToast(`Mangel "${newEntry.part}" hinzugefügt.`);
  };

  const handleDeleteDamageEntry = (dmgId: string) => {
    setDamageEntriesList(prev => prev.filter(d => d.id !== dmgId));
    showToast('Mangel aus der Liste entfernt.');
  };

  const handleToggleDamageRepaired = (dmgId: string) => {
    setDamageEntriesList(prev => prev.map(d => {
      if (d.id === dmgId) return { ...d, repaired: !d.repaired };
      return d;
    }));
  };

  const handleSaveConditionChanges = () => {
    const updatedMechanical = {
      ...vehicle.conditionMechanical,
      engine: mechEngine,
      engineCondition: mechEngine,
      transmission: mechTransmission,
      brakesTires: mechBrakes,
      brakePads: mechBrakes,
      tireDepthMm: parseFloat(mechTireDepth.replace(',', '.')) || 6.5,
      nextServiceDue: mechNextService,
      tuvDate: mechTuvDate
    };

    const updatedVisual = {
      ...vehicle.conditionVisual,
      paintCondition: visualPaint,
      interiorCondition: visualInterior,
      accidentFree: visualAccidentFree,
      paintThicknessUm: Number(visualPaintThickness) || 115,
      damagesNotes: chassisCondition
    };

    onUpdateVehicle(vehicle.id, {
      conditionMechanical: updatedMechanical,
      conditionVisual: updatedVisual,
      damageEntries: damageEntriesList
    });

    showToast('Zustandsbericht & Mängel erfolgreich gespeichert!');

    // Automatically return back to the active document / Übergabeprotokoll
    setTimeout(() => {
      onClose();
    }, 250);
  };

  // Financial calculations
  const totalExpenses = (vehicle.expenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const costOfGoodsSold = vehicle.purchasePrice + totalExpenses;
  const netMarginEuro = vehicle.sellingPrice - costOfGoodsSold;
  const netMarginPercent = costOfGoodsSold > 0 ? ((netMarginEuro / costOfGoodsSold) * 100).toFixed(1) : '0.0';

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'verfuegbar':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'reserviert':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'aufbereitung':
        return 'bg-teal-950/80 text-teal-300 border-teal-500/40';
      case 'verkauft':
        return 'bg-slate-900/80 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-900/80 text-slate-400 border-slate-700';
    }
  };

  const getStatusDot = (status: VehicleStatus) => {
    switch (status) {
      case 'verfuegbar': return 'bg-emerald-400';
      case 'reserviert': return 'bg-emerald-400';
      case 'aufbereitung': return 'bg-teal-400';
      case 'verkauft': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: VehicleStatus) => {
    switch (status) {
      case 'verfuegbar': return 'Verfügbar';
      case 'reserviert': return 'Reserviert';
      case 'aufbereitung': return 'In Aufbereitung';
      case 'verkauft': return 'Verkauft';
      default: return status;
    }
  };

  return (
    <>
      {/* ===================================================================== */}
      {/* MAIN VEHICLE DETAIL MODAL                                             */}
      {/* ===================================================================== */}
      <div 
        id="vehicle-detail-modal-overlay" 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 md:p-6 pt-3 sm:pt-6 md:pt-8 overflow-y-auto animate-fadeIn"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isAddExpenseModalOpen) onClose();
        }}
      >
        <div 
          id="vehicle-detail-modal-container"
          className="metallic-modal-container rounded-3xl max-w-4xl w-full max-h-[96vh] sm:max-h-[94vh] flex flex-col shadow-[0_0_70px_rgba(40,60,80,0.5)] overflow-hidden my-0 sm:my-2 text-[#0e264b]"
        >
          
          {/* Toast Alert Banner */}
          {actionSuccessToast && (
            <div className="bg-emerald-600/90 text-white px-6 py-2.5 flex items-center justify-between text-xs font-semibold animate-fadeIn shrink-0 border-b border-emerald-400/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{actionSuccessToast}</span>
              </div>
              <button 
                onClick={() => setActionSuccessToast(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-white/80 bg-gradient-to-r from-white/70 via-slate-100/60 to-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl metallic-node overflow-hidden shrink-0 shadow-inner">
                <img 
                  src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'} 
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">{vehicle.brand}</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(vehicle.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(vehicle.status)}`}></span>
                    <span>{getStatusLabel(vehicle.status)}</span>
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-[11px] font-semibold text-[#0e264b] metallic-pill px-2.5 py-0.5 rounded-md">
                    {vehicle.taxType === 'diff_25a' ? '§ 25a Differenzbesteuerung' : '19% Regelbesteuerung'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-[#0e264b] tracking-tight mt-0.5 hub-engraved-text">
                  {vehicle.brand} {vehicle.model}
                </h2>
                
                <div className="flex items-center gap-3 mt-1 text-xs text-[#1e3a5f] font-mono">
                  <span>FIN: {vehicle.vin}</span>
                  <button
                    onClick={handleCopyVin}
                    className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer font-sans"
                    title="FIN in die Zwischenablage kopieren"
                  >
                    {copiedVin ? <Check className="w-3.5 h-3.5 text-emerald-600 metallic-debossed-icon" /> : <Copy className="w-3.5 h-3.5 metallic-debossed-icon" />}
                    <span className="text-[11px] font-medium">{copiedVin ? 'Kopiert' : 'Kopieren'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Status Control & Close Button */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              
              {/* Status ändern Action Control */}
              <div className="flex items-center gap-1.5 metallic-card px-2.5 py-1.5 rounded-xl shadow-xs">
                <span className="text-[11px] font-bold text-[#1e3a5f] uppercase tracking-wider hidden sm:inline">Status:</span>
                <div className="relative">
                  <select
                    id="modal-quick-status-select"
                    value={vehicle.status}
                    onChange={(e) => handleQuickStatusChange(e.target.value as VehicleStatus)}
                    className="pl-2 pr-7 py-1 bg-transparent text-xs font-bold text-[#0e264b] focus:outline-none cursor-pointer appearance-none"
                    title="Status ändern"
                  >
                    <option value="verfuegbar" className="bg-slate-100 text-[#0e264b]">🟢 Verfügbar</option>
                    <option value="reserviert" className="bg-slate-100 text-[#0e264b]">🟡 Reserviert</option>
                    <option value="aufbereitung" className="bg-slate-100 text-[#0e264b]">🔵 In Aufbereitung</option>
                    <option value="verkauft" className="bg-slate-100 text-[#0e264b]">⚫ Verkauft</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#1e3a5f] absolute right-1 top-2 pointer-events-none" />
                </div>
              </div>

              {/* Close Button */}
              <button
                id="btn-close-vehicle-modal-top"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3.5 py-2 metallic-btn-secondary rounded-xl text-xs font-bold transition cursor-pointer text-[#0e264b]"
                title="Modal schließen"
              >
                <X className="w-4 h-4 text-[#0e264b] metallic-debossed-icon" />
                <span>Schließen</span>
              </button>
            </div>
          </div>

          {/* Modal Navigation Tabs & Action Bar */}
          <div className="px-6 border-b border-white/60 bg-white/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex gap-1 py-2 overflow-x-auto">
              <button
                onClick={() => setActiveSubTab('overview')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'overview'
                    ? 'metallic-btn-primary text-[#091a34] font-black shadow-md'
                    : 'text-[#1e3a5f] hover:text-[#0e264b] hover:bg-white/50'
                }`}
              >
                <Car className="w-4 h-4 metallic-debossed-icon" />
                <span>Übersicht & Stammdaten</span>
              </button>

              <button
                onClick={() => setActiveSubTab('expenses')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'expenses'
                    ? 'metallic-btn-primary text-[#091a34] font-black shadow-md'
                    : 'text-[#1e3a5f] hover:text-[#0e264b] hover:bg-white/50'
                }`}
              >
                <Euro className="w-4 h-4 metallic-debossed-icon" />
                <span>Kosten & Kassenbuch</span>
                {totalExpenses > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] metallic-pill font-black text-[#0e264b]">
                    {totalExpenses.toLocaleString('de-DE')} €
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('condition')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'condition'
                    ? 'metallic-btn-primary text-[#091a34] font-black shadow-md'
                    : 'text-[#1e3a5f] hover:text-[#0e264b] hover:bg-white/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 metallic-debossed-icon" />
                <span>Zustand & Schäden</span>
              </button>

              <button
                onClick={() => setActiveSubTab('media')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'media'
                    ? 'metallic-btn-primary text-[#091a34] font-black shadow-md'
                    : 'text-[#1e3a5f] hover:text-[#0e264b] hover:bg-white/50'
                }`}
              >
                <ImageIcon className="w-4 h-4 metallic-debossed-icon" />
                <span>Fotos & Dokumente</span>
              </button>
            </div>

            {/* Quick Action Triggers in Tab Bar */}
            <div className="py-2 flex items-center gap-2">
              {onEditVehicleMaster && (
                <button
                  type="button"
                  id="btn-open-master-edit-from-modal"
                  onClick={() => {
                    onClose();
                    onEditVehicleMaster(vehicle, 'lager');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl metallic-btn-secondary text-xs font-bold transition cursor-pointer text-[#0e264b]"
                  title="Fahrzeug im vollständigen Master-Erfassungsformular öffnen"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#0e264b] metallic-debossed-icon" />
                  <span>Vollformular öffnen</span>
                </button>
              )}

              <button
                id="btn-add-expense-modal-trigger"
                onClick={handleOpenAddExpenseModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl metallic-btn-primary text-xs font-black transition cursor-pointer text-[#091a34]"
              >
                <Plus className="w-3.5 h-3.5 metallic-debossed-icon" />
                <span>Ausgabe hinzufügen</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* =============================================================== */}
            {/* TAB 1: ÜBERSICHT & STAMMDATEN                                   */}
            {/* =============================================================== */}
            {activeSubTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Financial KPI Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 metallic-card rounded-2xl">
                    <span className="text-[11px] font-bold text-slate-700 block uppercase">Verkaufspreis</span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 mt-1 block">
                      {vehicle.sellingPrice.toLocaleString('de-DE')} €
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">
                      {vehicle.taxType === 'diff_25a' ? 'Endpreis (§ 25a)' : 'inkl. 19% MwSt.'}
                    </span>
                  </div>

                  <div className="p-4 metallic-card rounded-2xl">
                    <span className="text-[11px] font-bold text-slate-700 block uppercase">Einkaufspreis</span>
                    <span className="text-lg sm:text-xl font-bold text-slate-800 mt-1 block">
                      {vehicle.purchasePrice.toLocaleString('de-DE')} €
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">Gestehung netto/brutto</span>
                  </div>

                  <div className="p-4 metallic-card rounded-2xl">
                    <span className="text-[11px] font-bold text-slate-700 block uppercase">Nebenkosten</span>
                    <span className="text-lg sm:text-xl font-bold text-emerald-700 mt-1 block">
                      {totalExpenses > 0 ? `+${totalExpenses.toLocaleString('de-DE')} €` : '0,00 €'}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">
                      {(vehicle.expenses || []).length} gebuchte Positionen
                    </span>
                  </div>

                  <div className="p-4 metallic-card rounded-2xl bg-emerald-50/80">
                    <span className="text-[11px] font-bold text-emerald-800 block uppercase">Reingewinn (Marge)</span>
                    <span className="text-lg sm:text-xl font-black text-emerald-700 mt-1 block">
                      +{netMarginEuro.toLocaleString('de-DE')} €
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {netMarginPercent}% Rendite
                    </span>
                  </div>
                </div>

                {/* Inline Editing Form when isEditing === true */}
                {isEditing && (
                  <form onSubmit={handleSaveVehicleEdits} className="p-5 metallic-panel rounded-2xl space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-white/60">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 hub-engraved-text">
                        <Edit3 className="w-4 h-4 text-slate-800" />
                        Fahrzeugstammdaten bearbeiten
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium">Änderungen werden direkt synchronisiert</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Verkaufspreis (€)</label>
                        <input
                          type="number"
                          value={editSellingPrice}
                          onChange={(e) => setEditSellingPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 metallic-input rounded-xl font-semibold text-slate-900 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Einkaufspreis (€)</label>
                        <input
                          type="number"
                          value={editPurchasePrice}
                          onChange={(e) => setEditPurchasePrice(Number(e.target.value))}
                          className="w-full px-3 py-2 metallic-input rounded-xl font-semibold text-slate-900 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Kilometerstand (km)</label>
                        <input
                          type="number"
                          value={editMileage}
                          onChange={(e) => setEditMileage(Number(e.target.value))}
                          className="w-full px-3 py-2 metallic-input rounded-xl font-semibold text-slate-900 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Standort / Filiale</label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full px-3 py-2 metallic-input rounded-xl font-medium text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Farbe / Lackierung</label>
                        <input
                          type="text"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-full px-3 py-2 metallic-input rounded-xl font-medium text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Ausführung / Variante</label>
                        <input
                          type="text"
                          value={editVariant}
                          onChange={(e) => setEditVariant(e.target.value)}
                          className="w-full px-3 py-2 metallic-input rounded-xl font-medium text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 metallic-btn-secondary text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 metallic-btn-primary text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Änderungen speichern</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="metallic-card p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 hub-engraved-text">
                      <Gauge className="w-4 h-4 text-slate-700 metallic-debossed-icon" />
                      <span>Antrieb & Technische Daten</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Motorleistung</span>
                        <span className="font-semibold text-slate-900">{vehicle.powerPs} PS ({vehicle.powerKw} kW)</span>
                      </div>
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Kraftstoff</span>
                        <span className="font-semibold text-slate-900">{vehicle.fuelType}</span>
                      </div>
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Getriebe</span>
                        <span className="font-semibold text-slate-900">{vehicle.transmission}</span>
                      </div>
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Kilometerstand</span>
                        <span className="font-semibold text-slate-900">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Erstzulassung</span>
                        <span className="font-semibold text-slate-900">{vehicle.firstRegistration}</span>
                      </div>
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Karosserie & Türen</span>
                        <span className="font-semibold text-slate-900">{vehicle.bodyType || 'Kombi / Limousine'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="metallic-card p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 hub-engraved-text">
                      <Building2 className="w-4 h-4 text-slate-700 metallic-debossed-icon" />
                      <span>Lagerort & Bestandsstatus</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Standort</span>
                        <span className="font-semibold text-slate-900">{vehicle.location}</span>
                      </div>
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Standtage</span>
                        <span className="font-semibold text-slate-900">{vehicle.daysInStock} Tage im Lager</span>
                      </div>
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Farbe / Lack</span>
                        <span className="font-semibold text-slate-900">{vehicle.color}</span>
                      </div>
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Vorbesitzer</span>
                        <span className="font-semibold text-slate-900">{vehicle.ownersCount || '1. Hand'}</span>
                      </div>
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">TÜV / HU gültig bis</span>
                        <span className="font-semibold text-slate-900">{vehicle.conditionMechanical?.tuvDate || '04/2027'}</span>
                      </div>
                      <div className="p-2.5 metallic-inner-subbox rounded-xl">
                        <span className="text-slate-600 block text-[11px]">Scheckheftgepflegt</span>
                        <span className="font-semibold text-emerald-700">Ja (Vollständig)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Tags */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider hub-engraved-text">
                    Ausstattung & Sonderausstattung ({vehicle.features.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {vehicle.features.map((feat, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1.5 metallic-pill text-slate-900 text-xs font-medium rounded-xl transition"
                      >
                        &bull; {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Web-Showroom Publication Card */}
                <div className="p-4 rounded-2xl metallic-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      vehicle.showInShowroom !== false ? 'metallic-node text-emerald-700' : 'metallic-card text-slate-400'
                    }`}>
                      <Globe className="w-5 h-5 metallic-debossed-icon" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 hub-engraved-text">Öffentlicher Web-Showroom</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          vehicle.showInShowroom !== false ? 'metallic-pill bg-emerald-100 text-emerald-800' : 'metallic-pill text-slate-600'
                        }`}>
                          {vehicle.showInShowroom !== false ? 'Online Sichtbar' : 'Ausgeblendet'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {vehicle.showInShowroom !== false 
                          ? 'Dieses Fahrzeug wird im digitalen Kunden-Showroom mit Preis, Steuerart und Zustandsdaten präsentiert.' 
                          : 'Dieses Fahrzeug ist im öffentlichen Web-Showroom für Besucher ausgeblendet.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newStatus = vehicle.showInShowroom === false ? true : false;
                      onUpdateVehicle(vehicle.id, { showInShowroom: newStatus });
                      showToast(newStatus ? 'Fahrzeug im Web-Showroom veröffentlicht' : 'Fahrzeug aus Web-Showroom entfernt');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                      vehicle.showInShowroom !== false
                        ? 'metallic-btn-secondary text-slate-800'
                        : 'metallic-btn-primary text-slate-950'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 metallic-debossed-icon" />
                    <span>{vehicle.showInShowroom !== false ? 'Im Showroom verbergen' : 'Im Showroom anzeigen'}</span>
                  </button>
                </div>

              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 2: KOSTEN & KASSENBUCH                                      */}
            {/* =============================================================== */}
            {activeSubTab === 'expenses' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Expense Tracker Header & Margin Summary */}
                <div className="p-5 metallic-panel text-slate-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                      <Euro className="w-4 h-4 text-emerald-700" />
                      <span>Fahrzeugspezifische Nebenkosten & Reingewinn</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 hub-engraved-text">
                      Gestehungskosten & Ausgabenverwaltung
                    </h3>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Erfassen Sie alle Reparaturen, TÜV-Gebühren, Transporte & Aufbereitungen. Jede Buchung wird unter <code className="text-slate-900 font-mono font-bold bg-white/70 px-1 py-0.5 rounded">fahrzeuge/{vehicle.id}/ausgaben</code> erfasst und direkt mit dem zentralen Kassenbuch synchronisiert.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={handleOpenAddExpenseModal}
                      className="px-4 py-2.5 metallic-btn-primary text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ausgabe hinzufügen</span>
                    </button>
                  </div>
                </div>

                {/* Calculation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 metallic-card rounded-2xl">
                    <span className="text-slate-600 font-medium block">Einkaufspreis (Basis)</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">
                      {vehicle.purchasePrice.toLocaleString('de-DE')} €
                    </span>
                  </div>
                  <div className="p-4 metallic-card rounded-2xl">
                    <span className="text-slate-600 font-medium block">Gebuchte Nebenkosten ({vehicle.expenses?.length || 0})</span>
                    <span className="text-base font-extrabold text-emerald-800 mt-0.5 block">
                      +{totalExpenses.toLocaleString('de-DE')} €
                    </span>
                  </div>
                  <div className="p-4 metallic-card rounded-2xl bg-emerald-50/70">
                    <span className="text-emerald-800 font-medium block">Bereinigter Reingewinn</span>
                    <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">
                      +{netMarginEuro.toLocaleString('de-DE')} € ({netMarginPercent}%)
                    </span>
                  </div>
                </div>

                {/* Expense History Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 hub-engraved-text">
                      <Receipt className="w-4 h-4 text-slate-700 metallic-debossed-icon" />
                      <span>Historie der Fahrzeug-Nebenkosten ({(vehicle.expenses || []).length})</span>
                    </h4>
                    <button
                      onClick={handleOpenAddExpenseModal}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Neue Position erfassen</span>
                    </button>
                  </div>

                  {(!vehicle.expenses || vehicle.expenses.length === 0) ? (
                    <div className="p-8 metallic-card rounded-2xl text-center space-y-2">
                      <Euro className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">
                        Bisher keine fahrzeugspezifischen Nebenkosten erfasst.
                      </p>
                      <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
                        Klicken Sie auf &bdquo;Ausgabe hinzufügen&ldquo;, um Reparaturen, Aufbereitung oder Überführungskosten zu buchen.
                      </p>
                      <button
                        onClick={handleOpenAddExpenseModal}
                        className="mt-2 px-4 py-2 metallic-btn-primary text-slate-950 rounded-xl text-xs font-black transition cursor-pointer"
                      >
                        Erste Ausgabe hinzufügen
                      </button>
                    </div>
                  ) : (
                    <div className="metallic-card rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-white/70 border-b border-white/80 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                              <th className="p-3">Datum</th>
                              <th className="p-3">Kategorie / Grund</th>
                              <th className="p-3">Zahlungsmethode</th>
                              <th className="p-3">Kassenbuch</th>
                              <th className="p-3 text-right">Betrag (€)</th>
                              <th className="p-3 text-right">Aktion</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/60 font-medium">
                            {vehicle.expenses.map((exp) => (
                              <tr key={exp.id} className="hover:bg-white/40 transition">
                                <td className="p-3 text-slate-700 whitespace-nowrap">
                                  {exp.date}
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-slate-900">{exp.category}</div>
                                  <div className="text-[11px] text-slate-600">{exp.reason}</div>
                                  {exp.vendor && (
                                    <span className="text-[10px] text-emerald-800 font-semibold">Dienstleister: {exp.vendor}</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold metallic-pill text-slate-900">
                                    {exp.paymentType === 'Bar' ? <Wallet className="w-3 h-3 text-emerald-700" /> : <CreditCard className="w-3 h-3 text-emerald-700" />}
                                    <span>{exp.paymentType}</span>
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>kasse/transaktionen</span>
                                  </span>
                                </td>
                                <td className="p-3 text-right font-extrabold text-slate-900 whitespace-nowrap font-mono">
                                  {Number(exp.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => onDeleteExpense(vehicle.id, exp.id)}
                                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                    title="Ausgabe löschen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 3: ZUSTAND & SCHÄDEN (INSPEKTION & DEFEKTE)                */}
            {/* =============================================================== */}
            {activeSubTab === 'condition' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Header Banner */}
                <div className="p-4 metallic-panel rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Detaillierte Fahrzeugbegutachtung & Mängelerfassung</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 hub-engraved-text">
                      Zustandsbericht & Begutachtungsdaten
                    </h3>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Tragen Sie alle mechanischen, optischen und Karosserie-Daten sowie Mängel ein. Alle Angaben werden sofort in das Übergabeprotokoll synchronisiert.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveConditionChanges}
                    className="px-4 py-2.5 metallic-btn-primary text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>Änderungen speichern</span>
                  </button>
                </div>

                {/* 1. MECHANISCHER ZUSTAND */}
                <div className="metallic-card p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/80 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 hub-engraved-text">
                      <Wrench className="w-4 h-4 text-slate-700 metallic-debossed-icon" />
                      <span>1. Mechanischer Zustand & Antrieb</span>
                    </h4>
                    <span className="text-[11px] text-slate-600">Motor, Getriebe, Bremsen & Service</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Motor & Triebwerk */}
                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        Motor / Triebwerk:
                      </label>
                      <input
                        type="text"
                        value={mechEngine}
                        onChange={(e) => setMechEngine(e.target.value)}
                        placeholder="z.B. Einwandfrei & Trocken"
                        className="w-full px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 pt-1">
                        {['Einwandfrei & Trocken', 'Leicht ölfeucht', 'Ruhiger Lauf', 'Neu gewartet'].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setMechEngine(preset)}
                            className="px-2 py-0.5 metallic-pill text-[10px] text-slate-900 rounded-md cursor-pointer transition hover:bg-white/90"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Getriebe & Kupplung */}
                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        Getriebe & Kupplung:
                      </label>
                      <input
                        type="text"
                        value={mechTransmission}
                        onChange={(e) => setMechTransmission(e.target.value)}
                        placeholder="z.B. Schaltet präzise & sauber"
                        className="w-full px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 pt-1">
                        {['Schaltet präzise & sauber', 'Automatik ruckelfrei', 'Kupplung neuwertig', 'Geprüft'].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setMechTransmission(preset)}
                            className="px-2 py-0.5 metallic-pill text-[10px] text-slate-900 rounded-md cursor-pointer transition hover:bg-white/90"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bremsanlage */}
                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        Bremsanlage (Vorder- & Hinterachse):
                      </label>
                      <input
                        type="text"
                        value={mechBrakes}
                        onChange={(e) => setMechBrakes(e.target.value)}
                        placeholder="z.B. 80% Belagstärke (Sehr gut)"
                        className="w-full px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 pt-1">
                        {['80% Belagstärke (Sehr gut)', 'Bremsen neuwertig', 'Beläge ca. 60%', 'Scheiben gut'].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setMechBrakes(preset)}
                            className="px-2 py-0.5 metallic-pill text-[10px] text-slate-900 rounded-md cursor-pointer transition hover:bg-white/90"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reifenprofiltiefe & Zustand */}
                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        Reifenprofiltiefe (in mm):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={mechTireDepth}
                          onChange={(e) => setMechTireDepth(e.target.value)}
                          placeholder="6.5"
                          className="w-24 px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-bold focus:outline-none"
                        />
                        <span className="text-emerald-800 font-bold text-xs">mm</span>
                        <div className="flex gap-1">
                          {['5.0', '6.5', '7.5', '8.0 (Neu)'].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setMechTireDepth(val.split(' ')[0])}
                              className="px-2 py-1 metallic-pill text-[10px] text-slate-900 rounded-md cursor-pointer transition hover:bg-white/90"
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Nächster Service & TÜV */}
                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        Nächster Service / Inspektion:
                      </label>
                      <input
                        type="text"
                        value={mechNextService}
                        onChange={(e) => setMechNextService(e.target.value)}
                        placeholder="In 15.000 km oder 08/2027"
                        className="w-full px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        TÜV / HU & AU Gültigkeit:
                      </label>
                      <input
                        type="text"
                        value={mechTuvDate}
                        onChange={(e) => setMechTuvDate(e.target.value)}
                        placeholder="08/2027"
                        className="w-full px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. KAROSSERIE, CHASSIS & INNENRAUM */}
                <div className="metallic-card p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/80 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 hub-engraved-text">
                      <Layers className="w-4 h-4 text-slate-700 metallic-debossed-icon" />
                      <span>2. Karosserie & Zustand des Chassis</span>
                    </h4>
                    <span className="text-[11px] text-slate-600">Unterboden, Spaltmaße & Unfallfreiheit</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Chassis & Unterboden */}
                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        Karosseriezustand & Chassis:
                      </label>
                      <input
                        type="text"
                        value={chassisCondition}
                        onChange={(e) => setChassisCondition(e.target.value)}
                        placeholder="z.B. Chassis & Unterboden ohne Rost oder Verformungen"
                        className="w-full px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
                      />
                    </div>

                    {/* Innenraum & Polster */}
                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        Innenraum & Polsterung:
                      </label>
                      <input
                        type="text"
                        value={visualInterior}
                        onChange={(e) => setVisualInterior(e.target.value)}
                        placeholder="z.B. Neuwertig (Nichtraucher)"
                        className="w-full px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
                      />
                    </div>

                    {/* Unfallfreiheit Toggle */}
                    <div className="md:col-span-2 space-y-1.5 p-3.5 metallic-inner-subbox rounded-xl">
                      <label className="text-slate-800 font-bold block text-xs uppercase tracking-wider">
                        Rechtliche Einstufung Unfallfreiheit:
                      </label>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                          visualAccidentFree
                            ? 'metallic-card-luminous text-slate-900 border-emerald-500/50 shadow-xs'
                            : 'metallic-card text-slate-700 border-transparent hover:text-slate-900'
                        }`}>
                          <input
                            type="radio"
                            name="modalAccidentFree"
                            checked={visualAccidentFree}
                            onChange={() => setVisualAccidentFree(true)}
                            className="hidden"
                          />
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Unfallfrei laut Vorbesitzer (Keine bekannten Rahmenschäden)</span>
                        </label>

                        <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                          !visualAccidentFree
                            ? 'metallic-card-luminous text-slate-900 border-emerald-500/50 shadow-xs'
                            : 'metallic-card text-slate-700 border-transparent hover:text-slate-900'
                        }`}>
                          <input
                            type="radio"
                            name="modalAccidentFree"
                            checked={!visualAccidentFree}
                            onChange={() => setVisualAccidentFree(false)}
                            className="hidden"
                          />
                          <AlertTriangle className="w-4 h-4 metallic-debossed-icon" />
                          <span>Vorschaden / Unfallschaden bekannt (Details unter Mängel)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. LACKIERUNG & LACKIERZUSTAND */}
                <div className="metallic-card p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/80 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 hub-engraved-text">
                      <Sparkles className="w-4 h-4 text-slate-700 metallic-debossed-icon" />
                      <span>3. Lackierung & Lackierzustand</span>
                    </h4>
                    <span className="text-[11px] text-slate-600">Lackschichtdicke & Nachlackierungen</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Lackzustand */}
                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        Optischer Lackzustand:
                      </label>
                      <input
                        type="text"
                        value={visualPaint}
                        onChange={(e) => setVisualPaint(e.target.value)}
                        placeholder="z.B. Sehr gepflegt / Aufbereitet"
                        className="w-full px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
                      />
                    </div>

                    {/* Lackierungsstatus */}
                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        Lackierstatus / Nachlackierung:
                      </label>
                      <select
                        value={paintSprayStatus}
                        onChange={(e) => setPaintSprayStatus(e.target.value)}
                        className="w-full px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-medium cursor-pointer focus:outline-none"
                      >
                        <option value="Original Werkslackierung">Original Werkslackierung (Keine Nachlackierung)</option>
                        <option value="Teillackiert (z.B. Kotflügel/Stoßstange)">Teillackiert (z.B. Kotflügel/Stoßstange)</option>
                        <option value="Komplett nachlackiert">Komplett nachlackiert</option>
                        <option value="Aufbereitet & Keramikversiegelt">Aufbereitet & Keramikversiegelt</option>
                      </select>
                    </div>

                    {/* Lackschichtdicke µm */}
                    <div className="space-y-1.5">
                      <label className="text-slate-800 font-bold block">
                        Lackschichtdicke (Ø in µm):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={visualPaintThickness}
                          onChange={(e) => setVisualPaintThickness(Number(e.target.value))}
                          placeholder="115"
                          className="w-24 px-3 py-2 metallic-input rounded-xl text-slate-900 text-xs font-bold focus:outline-none"
                        />
                        <span className="text-emerald-800 font-bold text-xs">µm</span>
                        <div className="flex gap-1">
                          {[105, 115, 125, 140].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setVisualPaintThickness(val)}
                              className="px-2 py-1 metallic-pill text-[10px] text-slate-900 rounded-md cursor-pointer transition hover:bg-white/90"
                            >
                              {val} µm
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. MÄNGEL & BESCHÄDIGUNGEN HINZUFÜGEN (D1–D4 LISTE) */}
                <div className="metallic-card p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/80 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 hub-engraved-text">
                        <AlertTriangle className="w-4 h-4 text-slate-700 metallic-debossed-icon" />
                        <span>4. Spezifische Mängel & Vorschäden ({damageEntriesList.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Klassifizierung: D1 (Lack/Steinschlag), D2 (&lt;1cm), D3 (Mittel), D4 (Karosserie/Unfall)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddDamageOpen(!isAddDamageOpen)}
                      className="px-3.5 py-1.5 metallic-btn-primary text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddDamageOpen ? 'Schließen' : 'Mangel hinzufügen'}</span>
                    </button>
                  </div>

                  {/* Form to add a new damage entry */}
                  {isAddDamageOpen && (
                    <div className="p-4 metallic-panel rounded-xl space-y-3 animate-fadeIn">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 hub-engraved-text">
                        <Plus className="w-3.5 h-3.5 text-slate-800" />
                        <span>Neuen Mangel / Vorschaden erfassen:</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-800 block mb-1 font-bold">Bauteil / Bereich:</label>
                          <input
                            type="text"
                            value={newDamagePart}
                            onChange={(e) => setNewDamagePart(e.target.value)}
                            placeholder="z.B. Stoßstange vorne, Fahrertür"
                            className="w-full px-3 py-1.5 metallic-input rounded-lg text-xs font-medium focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-slate-800 block mb-1 font-bold">Schadensart:</label>
                          <select
                            value={newDamageType}
                            onChange={(e) => setNewDamageType(e.target.value)}
                            className="w-full px-3 py-1.5 metallic-input rounded-lg text-xs font-medium cursor-pointer focus:outline-none"
                          >
                            <option value="Kratzer / Lackbeschädigung">Kratzer / Lackbeschädigung</option>
                            <option value="Delle / Beule">Delle / Beule</option>
                            <option value="Steinschlag">Steinschlag</option>
                            <option value="Riss / Bruch">Riss / Bruch</option>
                            <option value="Bordsteinkratzer Felge">Bordsteinkratzer Felge</option>
                            <option value="Abnutzung / Gebrauchsspur">Abnutzung / Gebrauchsspur</option>
                            <option value="Mechanischer Mangel">Mechanischer Mangel</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-800 block mb-1 font-bold">Kategorie (D1–D4):</label>
                          <select
                            value={newDamageSeverity}
                            onChange={(e) => setNewDamageSeverity(e.target.value)}
                            className="w-full px-3 py-1.5 metallic-input rounded-lg text-xs font-bold text-slate-900 cursor-pointer focus:outline-none"
                          >
                            <option value="D1">D1 - Lackkratzer / Steinschlag (Oberflächlich)</option>
                            <option value="D2">D2 - Kleinschaden &lt;1cm / Kleine Delle</option>
                            <option value="D3">D3 - Mittlerer Schaden / Tiefe Schramme</option>
                            <option value="D4">D4 - Größerer Schaden / Karosserie / Unfall</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-slate-800 block mb-1 font-bold">Beschreibung & Notizen:</label>
                          <input
                            type="text"
                            value={newDamageDescription}
                            onChange={(e) => setNewDamageDescription(e.target.value)}
                            placeholder="z.B. ca. 3cm Lackkratzer unten rechts, nicht rostend"
                            className="w-full px-3 py-1.5 metallic-input rounded-lg text-xs font-medium focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-slate-800 block mb-1 font-bold">Geschätzte Kosten (€):</label>
                          <input
                            type="text"
                            value={newDamageCost}
                            onChange={(e) => setNewDamageCost(e.target.value)}
                            placeholder="z.B. 150"
                            className="w-full px-3 py-1.5 metallic-input rounded-lg text-xs font-mono font-bold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/60">
                        <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={newDamageRepaired}
                            onChange={(e) => setNewDamageRepaired(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Bereits fachgerecht instandgesetzt / repariert</span>
                        </label>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddDamageOpen(false)}
                            className="px-3 py-1.5 metallic-btn-secondary text-slate-800 rounded-lg text-xs font-semibold"
                          >
                            Abbrechen
                          </button>
                          <button
                            type="button"
                            onClick={handleAddDamageEntry}
                            className="px-4 py-1.5 metallic-btn-primary text-slate-950 rounded-lg text-xs font-black shadow-xs cursor-pointer"
                          >
                            Mangel speichern
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing Damages List */}
                  {damageEntriesList.length === 0 ? (
                    <div className="p-6 metallic-card rounded-xl text-center text-slate-700 text-xs space-y-1">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-700" />
                      <p className="font-bold text-slate-900">Keine unreparierten Mängel erfasst.</p>
                      <p className="text-[11px] text-slate-600">
                        Klicken Sie auf &bdquo;Mangel hinzufügen&ldquo;, um optische oder technische Beschädigungen für das Protokoll einzutragen.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {damageEntriesList.map((dmg) => (
                        <div key={dmg.id} className="p-3.5 metallic-card rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-start sm:items-center gap-3">
                            <span className="px-2 py-0.5 metallic-pill text-slate-900 rounded-md font-mono font-black text-[10px] shrink-0">
                              {dmg.severity || 'D1'}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {dmg.part} &bull; {dmg.damageType}
                              </span>
                              <span className="text-slate-600 text-[11px]">
                                {dmg.description || 'Keine Zusatzbeschreibung'}
                                {dmg.estimatedCost ? ` • Ca. ${Number(dmg.estimatedCost).toLocaleString('de-DE')} €` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleToggleDamageRepaired(dmg.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                dmg.repaired
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : 'metallic-pill text-slate-800'
                              }`}
                            >
                              {dmg.repaired ? '✓ Repariert' : '! Offener Mangel'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDamageEntry(dmg.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Mangel löschen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Save & Return Banner in Condition Tab */}
                <div className="p-4 metallic-panel rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl metallic-node text-emerald-800 flex items-center justify-center font-bold shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 hub-engraved-text">
                        Bereit zur Übernahme ins Übergabeprotokoll?
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Speichern aktualisiert die Fahrzeugdaten und bringt Sie direkt zum Dokument zurück.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveConditionChanges}
                    className="w-full sm:w-auto px-6 py-2.5 metallic-btn-primary text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Änderungen speichern & Zurück zum Protokoll</span>
                  </button>
                </div>

              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 4: FOTOS & DOKUMENTE                                        */}
            {/* =============================================================== */}
            {activeSubTab === 'media' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider hub-engraved-text">
                    Fahrzeugfotos & Galerie ({(vehicle.images || [vehicle.imageUrl]).length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(vehicle.images || [vehicle.imageUrl]).map((img, idx) => (
                      <div key={idx} className="relative h-36 metallic-node rounded-2xl overflow-hidden group">
                        <img src={img} alt={`Bild ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 metallic-pill bg-emerald-100 text-emerald-950 font-black text-[10px] rounded-md shadow-xs">
                            Hauptbild
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/60">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider hub-engraved-text">
                    Archivierte Dokumente & Verträge
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(vehicle.documents || [
                      { id: 'd1', name: 'Zulassungsbescheinigung_Teil_I_und_II.pdf', type: 'PDF', size: '2.4 MB' },
                      { id: 'd2', name: 'DEKRA_Zustandsbericht_Hauptuntersuchung.pdf', type: 'PDF', size: '1.8 MB' }
                    ]).map((doc) => (
                      <div key={doc.id} className="p-3.5 metallic-card rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg metallic-node text-emerald-800 flex items-center justify-center font-bold shrink-0">
                            <FileText className="w-4.5 h-4.5 text-slate-700 metallic-debossed-icon" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]">{doc.name}</span>
                            <span className="text-slate-600 text-[10px]">{doc.size} &bull; GoBD-konform archiviert</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => showToast(`Dokument "${doc.name}" heruntergeladen.`)}
                          className="px-3 py-1.5 metallic-btn-secondary text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Öffnen
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ================================================================= */}
          {/* MODAL FOOTER - STRICT ACTION CONTROLS                             */}
          {/* Strictly includes: 'Bearbeiten', 'Löschen', 'Status ändern',      */}
          {/* 'An Operationen senden', plus Close button.                        */}
          {/* ================================================================= */}
          <div className="px-6 py-4 bg-gradient-to-r from-white/80 via-slate-100/70 to-white/80 border-t border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            
            {/* Left Action: Löschen with Safety Prompt */}
            <div className="flex items-center gap-2">
              {!showDeleteConfirm ? (
                <button
                  id="btn-delete-vehicle-modal"
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-rose-300"
                  title="Fahrzeug aus dem Lagerbestand löschen"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Löschen</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-1.5 bg-rose-50 border border-rose-300 rounded-xl animate-fadeIn">
                  <span className="text-xs text-rose-800 font-bold px-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    Fahrzeug unwiderruflich löschen?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteVehicle(vehicle.id);
                      onClose();
                    }}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
                  >
                    Ja, löschen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 text-slate-700 text-xs font-semibold hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Abbrechen
                  </button>
                </div>
              )}
            </div>

            {/* Right Action Controls: Bearbeiten, An Operationen senden, Schließen */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* If on Condition tab, show Save Changes button prominently */}
              {activeSubTab === 'condition' && (
                <button
                  id="btn-save-condition-modal-footer"
                  type="button"
                  onClick={handleSaveConditionChanges}
                  className="px-5 py-2 metallic-btn-primary text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                  title="Begutachtung & Mängel speichern und zum Übergabeprotokoll zurückkehren"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Änderungen speichern</span>
                </button>
              )}

              {/* 1. Bearbeiten */}
              <button
                id="btn-edit-vehicle-modal"
                type="button"
                onClick={() => {
                  setActiveSubTab('overview');
                  setIsEditing(true);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isEditing 
                    ? 'metallic-btn-primary text-slate-950' 
                    : 'metallic-btn-secondary text-slate-800'
                }`}
                title="Stammdaten & Preise bearbeiten"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-700 metallic-debossed-icon" />
                <span>Bearbeiten</span>
              </button>

              {/* 2. An Operationen senden */}
              <button
                id="btn-send-to-operations"
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab?.('operationen');
                }}
                className="px-4 py-2 metallic-btn-secondary text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Fahrzeug an Werkstatt / Werkstattübergabe übermitteln"
              >
                <Wrench className="w-3.5 h-3.5 text-slate-700 metallic-debossed-icon" />
                <span>An Operationen senden</span>
              </button>

              {/* 3. Schließen */}
              <button
                id="btn-close-vehicle-modal-footer"
                type="button"
                onClick={onClose}
                className="px-5 py-2 metallic-btn-secondary text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Schließen
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ===================================================================== */}
      {/* FLOATING SUB-MODAL: 'AUSGABE HINZUFÜGEN' (EXPENSE TRACKING)           */}
      {/* Fields: Datum, Betrag (€), Grund, Zahlungsmethode                     */}
      {/* Action Buttons: Speichern, Abbrechen                                  */}
      {/* Saved to: fahrzeuge/{id}/ausgaben & pushed to kasse/transaktionen     */}
      {/* ===================================================================== */}
      {isAddExpenseModalOpen && (
        <div 
          id="add-expense-submodal-overlay" 
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 pt-2 sm:pt-4 md:pt-6 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddExpenseModalOpen(false);
          }}
        >
          <div 
            id="add-expense-submodal-container"
            className="metallic-modal-container rounded-3xl max-w-lg w-full shadow-[0_0_60px_rgba(40,60,80,0.5)] overflow-hidden my-0 sm:my-1 animate-scaleUp text-slate-900"
          >
            {/* Sub-Modal Header */}
            <div className="px-6 py-4 border-b border-white/80 bg-gradient-to-r from-white/70 via-slate-100/60 to-white/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl metallic-node flex items-center justify-center text-slate-700">
                  <Euro className="w-5 h-5 metallic-debossed-icon" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 hub-engraved-text">Ausgabe hinzufügen</h3>
                  <p className="text-[11px] text-slate-600">
                    Fahrzeug: {vehicle.brand} {vehicle.model}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Modal Form organized in uniform rows */}
            <form onSubmit={handleSaveSubExpense} className="p-6 space-y-4 text-xs">
              
              {subExpenseFormError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{subExpenseFormError}</span>
                </div>
              )}

              {/* Row 1: Datum */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Datum <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="sub-expense-date"
                    type="date"
                    value={subExpenseDate}
                    onChange={(e) => setSubExpenseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Betrag (€) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Betrag (€) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="sub-expense-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="z. B. 250.00"
                    value={subExpenseAmount}
                    onChange={(e) => {
                      setSubExpenseAmount(e.target.value);
                      if (subExpenseFormError) setSubExpenseFormError(null);
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 metallic-input rounded-xl text-slate-900 font-bold text-sm focus:outline-none transition font-mono"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 font-bold text-slate-700 text-sm">€</span>
                </div>
              </div>

              {/* Row 3: Grund (Dropdown with presets + manual entry support) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Grund / Kategorie <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <select
                    id="sub-expense-category-select"
                    value={subExpenseCategoryDropdown}
                    onChange={(e) => setSubExpenseCategoryDropdown(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 metallic-input rounded-xl text-slate-900 font-medium focus:outline-none cursor-pointer appearance-none transition"
                  >
                    {PRESET_EXPENSE_REASONS.map((reason, idx) => (
                      <option key={idx} value={reason} className="bg-white text-slate-900">{reason}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-700 absolute right-3 top-3 pointer-events-none" />
                </div>

                {/* Free text / specific note field for manual entry */}
                <div className="mt-1.5">
                  <input
                    id="sub-expense-custom-reason"
                    type="text"
                    placeholder={
                      subExpenseCategoryDropdown === 'Manuelle Eingabe / Eigener Grund'
                        ? 'Geben Sie den individuellen Ausgabengrund ein (z. B. Smart-Repair Delle Kotflügel)...'
                        : 'Spezifizierung / Bemerkung (optional, z. B. Innen- & Außenaufbereitung)...'
                    }
                    value={subExpenseCustomReason}
                    onChange={(e) => setSubExpenseCustomReason(e.target.value)}
                    className="w-full px-3.5 py-2 metallic-input rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition text-xs"
                    required={subExpenseCategoryDropdown === 'Manuelle Eingabe / Eigener Grund'}
                  />
                </div>
              </div>

              {/* Row 4: Zahlungsmethode (Bar / Banküberweisung) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Zahlungsmethode <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSubExpensePaymentMethod('Bar')}
                    className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 font-bold transition cursor-pointer ${
                      subExpensePaymentMethod === 'Bar'
                        ? 'metallic-btn-primary text-slate-950 font-black'
                        : 'metallic-btn-secondary text-slate-800'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-emerald-800" />
                    <span>Bar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubExpensePaymentMethod('Banküberweisung')}
                    className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 font-bold transition cursor-pointer ${
                      subExpensePaymentMethod === 'Banküberweisung'
                        ? 'metallic-btn-primary text-slate-950 font-black'
                        : 'metallic-btn-secondary text-slate-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-800" />
                    <span>Banküberweisung</span>
                  </button>
                </div>
              </div>

              {/* Row 5: Optional Belegnummer & Dienstleister */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-600 text-[11px] mb-1">Dienstleister / Partner</label>
                  <input
                    type="text"
                    placeholder="z. B. GlanzWerk Berlin"
                    value={subExpenseVendor}
                    onChange={(e) => setSubExpenseVendor(e.target.value)}
                    className="w-full px-3 py-1.5 metallic-input rounded-xl text-slate-900 focus:outline-none text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 text-[11px] mb-1">Rechnungs- / Belegnummer</label>
                  <input
                    type="text"
                    placeholder="z. B. RE-2026-904"
                    value={subExpenseReceiptNo}
                    onChange={(e) => setSubExpenseReceiptNo(e.target.value)}
                    className="w-full px-3 py-1.5 metallic-input rounded-xl text-slate-900 focus:outline-none text-xs font-medium font-mono"
                  />
                </div>
              </div>

              {/* Firebase / Kassenbuch Synchronization Notice */}
              <div className="p-3 metallic-inner-subbox rounded-xl text-[11px] text-slate-700 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Automatische Buchung:</strong> Beim Speichern wird diese Ausgabe direkt in der Fahrzeugakte unter <code className="font-mono text-[10px] text-slate-900 font-bold bg-white/70 px-1 py-0.5 rounded">fahrzeuge/{vehicle.id}/ausgaben</code> hinterlegt und simultan im Kassenbuch (<code className="font-mono text-[10px] text-slate-900 font-bold bg-white/70 px-1 py-0.5 rounded">kasse/transaktionen</code>) verbucht.
                </span>
              </div>

              {/* Action Buttons: Speichern & Abbrechen */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/80">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="px-4 py-2.5 metallic-btn-secondary text-slate-800 rounded-xl font-bold transition cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  id="btn-save-sub-expense"
                  type="submit"
                  className="px-5 py-2.5 metallic-btn-primary text-slate-950 rounded-xl font-black flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Speichern</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
};
