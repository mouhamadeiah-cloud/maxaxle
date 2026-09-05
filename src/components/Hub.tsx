/**
 * ============================================================================
 * PERMANENT HUB FREEZE & PROTECTED BACKUP (DO NOT MODIFY)
 * ----------------------------------------------------------------------------
 * This file is permanently locked as an untouchable reference and backup.
 * Active development, UI adjustments, and refactorings MUST be performed
 * exclusively in `src/components/OperationenView.tsx`.
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Receipt, 
  Zap, 
  Globe, 
  ShieldAlert, 
  FileCheck, 
  ClipboardCheck, 
  Key, 
  FileText, 
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { 
  Vehicle, 
  Customer, 
  Invoice, 
  NavTab, 
  OperationDocumentType, 
  OperationVehicleItem,
  MerchantSettings,
  OperationDocument
} from '../types';
import { firebaseService } from '../services/firebaseService';
import { generateDocumentSerial, getDocumentTypeLabel } from '../utils/documentNumberGenerator';
import { calculateDocumentTaxes } from '../utils/taxCalculationEngine';
import { DocumentPreviewModal } from './operationen/DocumentPreviewModal';
import { KundenSelectionDrawer } from './operationen/KundenSelectionDrawer';
import { LagerSelectionDrawer } from './operationen/LagerSelectionDrawer';
import { ProbefahrtCardStack } from './hub/ProbefahrtCardStack';
import { InvoiceCardStack, GREETING_TEMPLATES, WARRANTY_TEMPLATES } from './hub/InvoiceCardStack';
import { UebergabeprotokollCardStack } from './hub/UebergabeprotokollCardStack';
import { KaufvertragCardStack, KaufvertragPartyState } from './hub/KaufvertragCardStack';

export interface HubProps {
  setActiveTab?: (tab: NavTab) => void;
  onOpenMaxAi?: () => void;
  vehicles?: Vehicle[];
  customers?: Customer[];
  invoices?: Invoice[];
  initialCustomer?: Customer | null;
  initialVehicle?: Vehicle | null;
}

interface DocumentCircleItem {
  id: OperationDocumentType;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  angleDeg: number;
  nebulaGradient: string;
  glowColor: string;
  badge: string;
}

const DOCUMENT_HUB_ITEMS: DocumentCircleItem[] = [
  {
    id: 'rechnung',
    label: 'Handelsrechnung',
    shortLabel: 'Rechnung',
    icon: Receipt,
    description: 'Rechtssichere Kfz-Rechnung (§ 25a Differenzbesteuerung oder 19% Regelbesteuerung)',
    angleDeg: 270, // Top
    badge: '§ 25a / 19%',
    nebulaGradient: 'radial-gradient(circle at 30% 30%, rgba(245, 197, 24, 0.45) 0%, rgba(6, 78, 59, 0.95) 50%, #021811 92%)',
    glowColor: 'rgba(245,197,24,0.6)'
  },
  {
    id: 'e_rechnung',
    label: 'E-Rechnung (XML)',
    shortLabel: 'E-Rechnung',
    icon: Zap,
    description: 'Strukturierte elektronische Rechnung (XRechnung 3.0 & ZUGFeRD 2.2 nach EN 16931)',
    angleDeg: 315, // Top-Right
    badge: 'EN 16931',
    nebulaGradient: 'radial-gradient(circle at 30% 30%, rgba(52, 211, 153, 0.45) 0%, rgba(4, 60, 42, 0.92) 50%, #01160f 92%)',
    glowColor: 'rgba(52,211,153,0.6)'
  },
  {
    id: 'eu_export',
    label: 'EU Innergemeinschaftlich',
    shortLabel: 'EU-Export',
    icon: Globe,
    description: 'Steuerfreie innergemeinschaftliche Lieferung (§ 4 Nr. 1b UStG / B2B Reverse Charge)',
    angleDeg: 0, // Right
    badge: 'EU § 4 Nr. 1b',
    nebulaGradient: 'radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.45) 0%, rgba(4, 70, 60, 0.92) 50%, #01160f 92%)',
    glowColor: 'rgba(45,212,191,0.6)'
  },
  {
    id: 'export_drittland',
    label: 'Drittland Export (Netto)',
    shortLabel: 'Drittland',
    icon: ShieldAlert,
    description: 'Steuerfreie Ausfuhrlieferung in Drittländer (§ 4 Nr. 1a UStG / Zoll- & Ausfuhrvermerk)',
    angleDeg: 45, // Bottom-Right
    badge: 'Export § 4 Nr. 1a',
    nebulaGradient: 'radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.45) 0%, rgba(5, 75, 55, 0.92) 50%, #02140d 92%)',
    glowColor: 'rgba(245,158,11,0.6)'
  },
  {
    id: 'kaufvertrag',
    label: 'Verbindlicher Kaufvertrag',
    shortLabel: 'Kaufvertrag',
    icon: FileCheck,
    description: 'BGB-konformer Gebrauchtwagen-Kaufvertrag (§ 433) mit Anzahlung & Klauseln',
    angleDeg: 90, // Bottom
    badge: 'BGB § 433',
    nebulaGradient: 'radial-gradient(circle at 30% 30%, rgba(245, 197, 24, 0.48) 0%, rgba(4, 64, 46, 0.92) 52%, #021811 92%)',
    glowColor: 'rgba(16,185,129,0.6)'
  },
  {
    id: 'angebot',
    label: 'Fahrzeug-Angebot',
    shortLabel: 'Angebot',
    icon: ClipboardCheck,
    description: 'Freibleibendes Verkaufsangebot mit garantierter Preisbindung & Konditionen',
    angleDeg: 135, // Bottom-Left
    badge: 'Preisbindung',
    nebulaGradient: 'radial-gradient(circle at 30% 30%, rgba(250, 204, 21, 0.45) 0%, rgba(5, 80, 55, 0.92) 50%, #021a12 92%)',
    glowColor: 'rgba(20,184,166,0.6)'
  },
  {
    id: 'probefahrt',
    label: 'Probefahrt-Vereinbarung',
    shortLabel: 'Probefahrt',
    icon: Key,
    description: 'Probefahrtüberlassung mit Rotem Kennzeichen (§ 16 FZV) & Kasko-Selbstbeteiligung',
    angleDeg: 180, // Left
    badge: 'Rote Nummern',
    nebulaGradient: 'radial-gradient(circle at 30% 30%, rgba(232, 121, 249, 0.40) 0%, rgba(4, 70, 50, 0.92) 48%, #02140d 92%)',
    glowColor: 'rgba(52,211,153,0.6)'
  },
  {
    id: 'uebergabeprotokoll',
    label: 'Übergabeprotokoll',
    shortLabel: 'Übergabe',
    icon: FileText,
    description: 'Dokumentation bei Fahrzeugauslieferung inkl. optischer Mängelkarte & Zubehör',
    angleDeg: 225, // Top-Left
    badge: 'Protokoll',
    nebulaGradient: 'radial-gradient(circle at 30% 30%, rgba(167, 243, 208, 0.40) 0%, rgba(6, 78, 59, 0.90) 46%, #031c13 92%)',
    glowColor: 'rgba(245,197,24,0.6)'
  }
];

export const Hub: React.FC<HubProps> = ({
  vehicles: initialVehicles = [],
  customers: initialCustomers = [],
  initialCustomer = null,
  initialVehicle = null
}) => {
  // Navigation & View Mode: 'hub' (overview) | 'mindmap' (docked branching editor)
  const [viewMode, setViewMode] = useState<'hub' | 'mindmap'>('hub');
  const [selectedDocId, setSelectedDocId] = useState<OperationDocumentType>('rechnung');
  const [hoveredItem, setHoveredItem] = useState<DocumentCircleItem | null>(null);

  // Persistence & Data sources
  const [customers] = useState<Customer[]>(() => {
    return initialCustomers.length > 0 ? initialCustomers : firebaseService.getCustomers();
  });
  const [vehicles] = useState<Vehicle[]>(() => {
    return initialVehicles.length > 0 ? initialVehicles : firebaseService.getVehicles();
  });
  const [merchantSettings] = useState<MerchantSettings>(() => firebaseService.getMerchantSettings());

  // Form State: Common Vehicle & Customer
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer);
  const [vehicleItems, setVehicleItems] = useState<OperationVehicleItem[]>(() => {
    if (initialVehicle) {
      const price = initialVehicle.sellingPrice || 0;
      return [{
        id: 'pos-1',
        vin: initialVehicle.vin || '',
        brand: initialVehicle.brand || '',
        model: initialVehicle.model || '',
        variant: initialVehicle.variant || '',
        mileage: initialVehicle.mileage || 0,
        listPrice: price,
        sellingPrice: price,
        discountAmount: 0,
        taxType: initialVehicle.taxType || 'diff_25a',
        color: initialVehicle.color,
        firstRegistration: initialVehicle.firstRegistration,
        powerKw: initialVehicle.powerKw,
        powerPs: initialVehicle.powerPs,
        fuelType: initialVehicle.fuelType
      }];
    }
    return [{
      id: 'pos-1',
      vin: '',
      brand: '',
      model: '',
      mileage: 0,
      listPrice: 0,
      sellingPrice: 0,
      discountAmount: 0,
      taxType: 'diff_25a'
    }];
  });

  // Commercial Invoices Form States
  const todayStr = new Date().toLocaleDateString('de-DE');
  const [datum] = useState(todayStr); // Fixed non-editable
  const [lieferdatum, setLieferdatum] = useState(todayStr);
  const [zahlungsziel, setZahlungsziel] = useState('Sofort');
  const [begruessungstext, setBegruessungstext] = useState(GREETING_TEMPLATES[0].text);
  const [gewaehrleistung, setGewaehrleistung] = useState(WARRANTY_TEMPLATES[0].text);
  const [sondervereinbarung, setSondervereinbarung] = useState('');

  // Probefahrt Specific States
  const [probefahrtPlate, setProbefahrtPlate] = useState<string>(() => {
    return merchantSettings.redLicensePlates?.[0]?.plateNumber || 'B-06124';
  });
  const [probefahrtDuration, setProbefahrtDuration] = useState<number>(45);
  const [probefahrtRouteLimit, setProbefahrtRouteLimit] = useState<number>(35);
  const [probefahrtDeductible, setProbefahrtDeductible] = useState<number>(1000);
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState<string>('');
  const [drivingLicenseClasses, setDrivingLicenseClasses] = useState<string>('B, BE');
  const [drivingLicensePhoto, setDrivingLicensePhoto] = useState<{
    name: string;
    size?: string;
    type?: string;
    dataUrl?: string;
  } | null>(null);

  // Kaufvertrag Specific States (Käufer, Verkäufer, Preis)
  const [kvBuyer, setKvBuyer] = useState<KaufvertragPartyState>({
    isDealer: false,
    customer: null
  });
  const [kvSeller, setKvSeller] = useState<KaufvertragPartyState>({
    isDealer: true,
    customer: null
  });
  const [kvPrice, setKvPrice] = useState<number>(() => initialVehicle?.sellingPrice || 0);
  const [customerDrawerTarget, setCustomerDrawerTarget] = useState<'general' | 'kv_buyer' | 'kv_seller'>('general');

  // Modals & Drawers
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isLagerDrawerOpen, setIsLagerDrawerOpen] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Active Document Item
  const activeDocItem = DOCUMENT_HUB_ITEMS.find(d => d.id === selectedDocId) || DOCUMENT_HUB_ITEMS[0];
  const ActiveIcon = activeDocItem.icon;
  const docNumber = generateDocumentSerial(selectedDocId, datum);

  // Live tax and gross calculation
  const calc = calculateDocumentTaxes(selectedDocId, vehicleItems, 0);

  // Handle Document Selection from Hub
  const handleSelectDoc = (item: DocumentCircleItem) => {
    setSelectedDocId(item.id);
    setViewMode('mindmap');
  };

  // Handle Save Document
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedDocId === 'probefahrt') {
        const now = new Date();
        const startH = String(now.getHours()).padStart(2, '0');
        const startM = String(now.getMinutes()).padStart(2, '0');
        const returnDate = new Date(now.getTime() + probefahrtDuration * 60000);
        const returnH = String(returnDate.getHours()).padStart(2, '0');
        const returnM = String(returnDate.getMinutes()).padStart(2, '0');

        const probefahrtDoc: OperationDocument = {
          id: `op-pf-${Date.now()}`,
          documentType: 'probefahrt',
          documentNumber: docNumber,
          date: datum,
          dueDate: datum,
          customer: selectedCustomer || undefined,
          isManualCustomer: !selectedCustomer,
          vehicles: vehicleItems,
          totalNet: 0,
          totalTax: 0,
          totalGross: 0,
          paymentMethod: 'Bar',
          probefahrtDetails: {
            driverName: selectedCustomer ? (selectedCustomer.name || selectedCustomer.companyName || 'Interessent') : 'Probefahrer',
            driverStreet: selectedCustomer?.street || '',
            driverPostalCode: selectedCustomer?.postalCode || selectedCustomer?.zip || '',
            driverCity: selectedCustomer?.city || '',
            driverPhone: selectedCustomer?.phone || selectedCustomer?.mobile || '',
            driverEmail: selectedCustomer?.email || '',
            drivingLicenseNumber: drivingLicenseNumber || 'Geprüft',
            drivingLicenseClasses: drivingLicenseClasses || 'B',
            driverLicenseFile: drivingLicensePhoto || undefined,
            vin: vehicleItems[0]?.vin || '',
            brand: vehicleItems[0]?.brand || '',
            model: vehicleItems[0]?.model || '',
            variant: vehicleItems[0]?.variant || '',
            color: vehicleItems[0]?.color || 'Schwarz',
            firstRegistration: vehicleItems[0]?.firstRegistration || '',
            mileageStart: vehicleItems[0]?.mileage || 0,
            redLicensePlate: probefahrtPlate,
            durationMinutes: probefahrtDuration,
            startTime: `${startH}:${startM}`,
            expectedReturnTime: `${returnH}:${returnM}`,
            routeLimitKm: probefahrtRouteLimit,
            depositAmount: 0,
            liabilityDeductible: probefahrtDeductible,
            disclaimersAccepted: {
              stvoRules: true,
              noThirdParty: true,
              zeroAlcohol: true,
              deductibleAgreed: true,
              returnOnTime: true,
              trafficFineLiability: true,
              mileageChecked: true
            },
            place: merchantSettings.city || 'Berlin',
            date: datum
          },
          status: 'offen',
          createdAt: new Date().toISOString()
        };

        await firebaseService.saveOperation(probefahrtDoc, false);
        setSaveToast(`Probefahrtvereinbarung ${docNumber} erfolgreich erstellt!`);
        setTimeout(() => setSaveToast(null), 4000);
      } else if (selectedDocId === 'uebergabeprotokoll') {
        const uebergabeDoc: OperationDocument = {
          id: `op-ueb-${Date.now()}`,
          documentType: 'uebergabeprotokoll',
          documentNumber: docNumber,
          date: datum,
          dueDate: datum,
          customer: selectedCustomer || undefined,
          isManualCustomer: !selectedCustomer,
          vehicles: vehicleItems,
          totalNet: 0,
          totalTax: 0,
          totalGross: 0,
          paymentMethod: 'Bar',
          status: 'abgeschlossen',
          createdAt: new Date().toISOString()
        };

        await firebaseService.saveOperation(uebergabeDoc, false);
        setSaveToast(`Übergabeprotokoll ${docNumber} erfolgreich erstellt!`);
        setTimeout(() => setSaveToast(null), 4000);
      } else if (selectedDocId === 'kaufvertrag') {
        const buyerName = kvBuyer.isDealer
          ? (merchantSettings.companyName || 'Händler (Eigenbestand)')
          : (kvBuyer.customer?.name || kvBuyer.customer?.companyName || 'Käufer');
        const sellerName = kvSeller.isDealer
          ? (merchantSettings.companyName || 'Händler (Verkäufer)')
          : (kvSeller.customer?.name || kvSeller.customer?.companyName || 'Verkäufer');

        const kaufvertragDoc: OperationDocument = {
          id: `op-kv-${Date.now()}`,
          documentType: 'kaufvertrag',
          documentNumber: docNumber,
          date: datum,
          dueDate: datum,
          customer: (!kvBuyer.isDealer ? kvBuyer.customer : !kvSeller.isDealer ? kvSeller.customer : selectedCustomer) || undefined,
          isManualCustomer: false,
          vehicles: vehicleItems.length > 0 ? [{
            ...vehicleItems[0],
            sellingPrice: kvPrice,
            listPrice: kvPrice
          }] : [],
          totalNet: kvPrice,
          totalTax: 0,
          totalGross: kvPrice,
          paymentMethod: 'Überweisung',
          status: 'abgeschlossen',
          notes: `Käufer: ${buyerName} | Verkäufer: ${sellerName} | Vereinbarter Kaufpreis: ${kvPrice.toLocaleString('de-DE')} €`,
          createdAt: new Date().toISOString()
        };

        await firebaseService.saveOperation(kaufvertragDoc, false);
        setSaveToast(`Kaufvertrag ${docNumber} erfolgreich erstellt!`);
        setTimeout(() => setSaveToast(null), 4000);
      } else {
        const newInvoice: Invoice = {
          id: `inv-${Date.now()}`,
          invoiceNumber: docNumber,
          date: datum,
          dueDate: zahlungsziel,
          documentType: selectedDocId,
          invoiceCategory: selectedDocId === 'eu_export' ? 'eu_export' : selectedDocId === 'export_drittland' ? 'export_drittland' : selectedDocId === 'e_rechnung' ? 'e_rechnung' : 'rechnung',
          customerName: selectedCustomer ? (selectedCustomer.name || selectedCustomer.companyName || 'Kunde') : 'Barverkauf',
          customerType: selectedCustomer?.type || 'B2C',
          vehicleTitle: vehicleItems[0]?.brand ? `${vehicleItems[0]?.brand} ${vehicleItems[0]?.model || ''}`.trim() : 'Fahrzeug',
          vin: vehicleItems[0]?.vin || '',
          amountNet: calc.totalNet,
          taxAmount: calc.totalTax,
          amountGross: calc.totalGross,
          taxType: 'diff_25a',
          status: 'offen',
          paymentMethod: 'Überweisung',
          notes: `${begruessungstext}\n\nGewährleistung: ${gewaehrleistung}\n\nSondervereinbarung: ${sondervereinbarung}`.trim()
        };

        await firebaseService.saveInvoice(newInvoice);
        setSaveToast(`${getDocumentTypeLabel(selectedDocId)} ${docNumber} erfolgreich erstellt!`);
        setTimeout(() => setSaveToast(null), 4000);
      }
    } catch (err) {
      console.error('Error saving document', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle vehicle selection from warehouse
  const handleSelectVehicleFromLager = (v: Vehicle) => {
    const price = v.sellingPrice || 0;
    setVehicleItems([{
      id: 'pos-1',
      vin: v.vin || '',
      brand: v.brand || '',
      model: v.model || '',
      variant: v.variant || '',
      mileage: v.mileage || 0,
      listPrice: price,
      sellingPrice: price,
      discountAmount: 0,
      taxType: v.taxType || 'diff_25a',
      color: v.color,
      firstRegistration: v.firstRegistration,
      powerKw: v.powerKw,
      powerPs: v.powerPs,
      fuelType: v.fuelType
    }]);
    setKvPrice(price);
    setIsLagerDrawerOpen(false);
  };

  // Handle direct vehicle price change across all documents
  const handleUpdateVehiclePrice = (newPrice: number) => {
    setVehicleItems(prev => {
      if (!prev || prev.length === 0) {
        return [{
          id: 'pos-1',
          vin: '',
          brand: 'Fahrzeug',
          model: '',
          variant: '',
          mileage: 0,
          listPrice: newPrice,
          sellingPrice: newPrice,
          discountAmount: 0,
          taxType: 'diff_25a'
        }];
      }
      return prev.map((item, idx) => idx === 0 ? {
        ...item,
        sellingPrice: newPrice,
        listPrice: newPrice
      } : item);
    });
    setKvPrice(newPrice);
  };

  // Handle customer selection from drawer
  const handleSelectCustomerFromDrawer = (c: Customer) => {
    if (customerDrawerTarget === 'kv_buyer') {
      setKvBuyer({ isDealer: false, customer: c });
    } else if (customerDrawerTarget === 'kv_seller') {
      setKvSeller({ isDealer: false, customer: c });
    } else {
      setSelectedCustomer(c);
    }
    setIsCustomerDrawerOpen(false);
  };

  return (
    <div id="hub-page-root" className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center text-white animate-in fade-in duration-300 select-none pb-12">
      
      {/* ========================================================================= */}
      {/* EXACT AMBIENT GLOWING BACKGROUND (MATCHING HOME PAGE)                     */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 flex items-center justify-center" aria-hidden="true">
        <motion.div
          className="absolute w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] rounded-full blur-[100px] opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.35) 0%, rgba(16,185,129,0.15) 60%, transparent 80%)' }}
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <div
          className="absolute w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full blur-[130px] opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(5,150,105,0.1) 50%, transparent 75%)' }}
        />
      </div>

      {/* Save Success Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 z-[9999] px-5 py-3 rounded-2xl bg-[#021d15]/95 border border-emerald-400 text-white shadow-[0_0_30px_rgba(52,211,153,0.4)] flex items-center gap-3 backdrop-blur-xl"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold">{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: CIRCULAR OVERVIEW ARENA (HUB VIEW)                           */}
      {/* ========================================================================= */}
      {viewMode === 'hub' && (
        <div className="relative w-full max-w-5xl px-4 py-4 sm:py-8 flex flex-col items-center justify-center my-auto">
          
          {/* Central Radial Document Arena */}
          <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] md:w-[540px] md:h-[540px] flex items-center justify-center">
            
            {/* SVG Background Orbits & Radar Rings */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none select-none z-0" 
              viewBox="0 0 540 540"
            >
              <defs>
                <linearGradient id="hub-gold-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f5c518" stopOpacity="0.75" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.75" />
                </linearGradient>
                <radialGradient id="hub-radar-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="60%" stopColor="#047857" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#021811" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ambient Radar fill */}
              <circle cx="270" cy="270" r="215" fill="url(#hub-radar-glow)" />

              {/* Outer Orbit Path */}
              <circle
                cx="270"
                cy="270"
                r="215"
                fill="none"
                stroke="url(#hub-gold-orbit)"
                strokeWidth="1.2"
                strokeDasharray="6 12 18 12"
                className="animate-[spin_60s_linear_infinite]"
              />

              {/* Middle Thin Ring */}
              <circle
                cx="270"
                cy="270"
                r="150"
                fill="none"
                stroke="#10b981"
                strokeWidth="0.8"
                strokeOpacity="0.2"
              />

              {/* Inner Reverse Spinning Arc */}
              <circle
                cx="270"
                cy="270"
                r="95"
                fill="none"
                stroke="url(#hub-gold-orbit)"
                strokeWidth="1.2"
                strokeDasharray="30 45 60 30"
                opacity="0.3"
                className="animate-[spin_40s_linear_infinite_reverse]"
              />
            </svg>

            {/* Central Heartbeat / Master Core Centerpiece */}
            <div 
              id="centerpiece-hub-core"
              className="group relative z-20 w-28 sm:w-34 h-28 sm:h-34 rounded-full flex flex-col items-center justify-center p-2.5 text-center transition-all duration-300 hover:scale-105"
            >
              {/* Solid Circular Golden Frame with Nebula gradient */}
              <div 
                className="absolute inset-0 rounded-full border border-amber-400/75 shadow-[0_0_20px_rgba(212,175,55,0.35)] group-hover:border-amber-300 group-hover:shadow-[0_0_30px_rgba(245,197,24,0.6)] animate-subtle-pulse transition-all duration-300" 
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(245, 197, 24, 0.42) 0%, rgba(4, 64, 46, 0.92) 52%, #021811 92%)'
                }}
              />

              {/* Solid Auxiliary Gold Glow Arc */}
              <div className="absolute inset-[-5px] sm:inset-[-6px] rounded-full border border-amber-400/20 border-t-amber-400/70 pointer-events-none animate-[spin_10s_linear_infinite]" />
              
              {/* Floating Nebula Mist effect */}
              <div className="absolute inset-1 rounded-full bg-nebula-cloud opacity-60 animate-cloud-drift blur-xs pointer-events-none" />

              {/* Content inside Centerpiece */}
              <div className="relative z-10 flex flex-col items-center justify-center space-y-0.5 pointer-events-none">
                {hoveredItem ? (
                  <div className="animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center max-w-[105px] sm:max-w-[125px]">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 block truncate">
                      {hoveredItem.shortLabel}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white line-clamp-1">
                      {hoveredItem.label}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-amber-200/80 line-clamp-2 leading-tight mt-0.5">
                      {hoveredItem.description}
                    </span>
                    <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-amber-300 font-extrabold mt-0.5">
                      <span>Konfigurieren</span>
                      <ArrowRight className="w-2 h-2" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-1.5 pt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 border border-[#021811] shadow-[0_0_8px_#34d399] animate-pulse" />
                      <span className="text-xs sm:text-sm font-black tracking-wider text-white block group-hover:text-amber-200 transition-colors uppercase">
                        HUB CORE
                      </span>
                    </div>

                    <span className="text-[8.5px] sm:text-[9.5px] font-medium text-amber-300/90 block">
                      Dokumenten-Engine
                    </span>

                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1 text-[7.5px] sm:text-[8px] uppercase tracking-wider font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        <Sparkles className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-amber-300" />
                        <span>8 Vorlagen</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Orbiting Circular Document Nodes */}
            {DOCUMENT_HUB_ITEMS.map((item) => {
              const Icon = item.icon;
              const isHovered = hoveredItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  id={`hub-document-item-${item.id}`}
                  style={{
                    position: 'absolute',
                    transform: `translate(calc(cos(${item.angleDeg}deg) * var(--hub-radius)), calc(sin(${item.angleDeg}deg) * var(--hub-radius)))`,
                  }}
                  className="[--hub-radius:120px] sm:[--hub-radius:170px] md:[--hub-radius:200px] z-30 transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectDoc(item)}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`group relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                      isHovered ? 'scale-125 z-40' : 'scale-100 hover:scale-115'
                    }`}
                    title={`${item.label} - ${item.description}`}
                  >
                    {/* Circular Golden Frame with Nebula interior */}
                    <div 
                      style={{
                        background: isHovered 
                          ? 'linear-gradient(135deg, #f5c518 0%, #d4af37 100%)' 
                          : item.nebulaGradient
                      }}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.25)] ${
                        isHovered
                          ? 'border-amber-200 text-slate-950 shadow-[0_0_25px_rgba(245,197,24,0.7)]'
                          : 'border-amber-400/70 text-amber-300 hover:border-amber-300 animate-subtle-pulse'
                      }`}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${
                        isHovered ? 'text-slate-950 stroke-[2.5]' : 'text-amber-300'
                      }`} />

                      {/* Incomplete auxiliary glowing arc */}
                      <div className="absolute inset-[-4px] rounded-full border border-amber-400/20 border-t-amber-400/60 pointer-events-none animate-[spin_8s_linear_infinite]" />
                    </div>

                    {/* Subtitle Pill underneath icon */}
                    <span className={`mt-1 text-[9.5px] sm:text-[10.5px] font-extrabold px-2 py-0.5 rounded-full transition-all whitespace-nowrap border ${
                      isHovered
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                        : 'bg-[#021811]/90 text-amber-200/90 border-amber-400/40 group-hover:text-amber-100 group-hover:border-amber-300'
                    }`}>
                      {item.shortLabel}
                    </span>
                  </button>
                </div>
              );
            })}

          </div>

          {/* Interactive Helper Text */}
          <div className="mt-6 text-center text-xs text-amber-200/60 flex items-center gap-1.5">
            <span>Tippen Sie auf eine Dokumentvorlage, um die Konfiguration zu starten</span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: DOCKED CINEMATIC MINDMAP & ARTERIAL WORKSPACE                 */}
      {/* ========================================================================= */}
      {viewMode === 'mindmap' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="relative w-full max-w-7xl px-3 sm:px-6 py-6"
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-emerald-500/20">
            <button
              type="button"
              onClick={() => setViewMode('hub')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#021d15] hover:bg-[#032318] text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zurück zur Übersicht</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#032318] hover:bg-[#043323] text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>A4 Live-Druckansicht</span>
              </button>
            </div>
          </div>

          {/* MAIN MIND-MAP STAGE (LEFT: DOCKED NODE | CENTER: ARTERIAL LINES | RIGHT: STACKED CARDS) */}
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[620px]">
            
            {/* ======================================================================= */}
            {/* DESKTOP (lg+) ARTERIAL NETWORK: DIRECT PERIMETER ROOT OSTIA             */}
            {/* ======================================================================= */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="none">
                <defs>
                  {/* Outer Arterial Wall / Luminous Teal-Emerald Gradient */}
                  <linearGradient id="artery-wall-cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.95" />
                    <stop offset="25%" stopColor="#34D399" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#10B981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.95" />
                  </linearGradient>

                  {/* Secondary Vascular Thread Gradient */}
                  <linearGradient id="artery-thread-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                    <stop offset="40%" stopColor="#34D399" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
                  </linearGradient>

                  {/* Inner Luminal Core (High-Intensity Light Pulse) */}
                  <linearGradient id="artery-luminal-core" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F0FDFA" stopOpacity="1" />
                    <stop offset="20%" stopColor="#A7F3D0" stopOpacity="0.95" />
                    <stop offset="75%" stopColor="#34D399" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#ECFDF5" stopOpacity="0.95" />
                  </linearGradient>

                  {/* Root Ostium Radial Glow */}
                  <radialGradient id="ostium-glow-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#A7F3D0" stopOpacity="1" />
                    <stop offset="45%" stopColor="#2DD4BF" stopOpacity="0.85" />
                    <stop offset="75%" stopColor="#059669" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#021d15" stopOpacity="0" />
                  </radialGradient>

                  {/* Vessel Terminal Node / Flow Arrow */}
                  <marker
                    id="artery-arrow"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 2 L 6 5 L 0 8 z" fill="#6EE7B7" opacity="0.9" />
                  </marker>

                  {/* Arterial Glow Filters (Tight, Crisp Glow) */}
                  <filter id="glow-artery-strong" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.8" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  <filter id="glow-ostium" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2.0" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* ================================================================= */}
                {/* DYNAMIC ARTERIAL BRANCHES: 2 FOR UEBERGABE, 3 FOR KAUFVERTRAG, 5 FOR PROBEFAHRT */}
                {/* ================================================================= */}
                {selectedDocId === 'uebergabeprotokoll' ? (
                  <>
                    {/* Line 1: Ostium 1 (228, 316) -> Card 1: Fahrzeug (440, 110) */}
                    <path d="M 228 316 C 280 270, 330 110, 440 110" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 228 316 C 280 270, 330 110, 440 110" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Line 2: Ostium 2 (228, 384) -> Card 2: Kunde (440, 260) */}
                    <path d="M 228 384 C 280 410, 330 260, 440 260" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 228 384 C 280 410, 330 260, 440 260" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Ostia Glowing Nodes (2 Points for 2 Cards) */}
                    <g transform="translate(228, 316)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.4" fill="#021d15" stroke="#34D399" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#FDE68A" />
                    </g>
                    <g transform="translate(228, 384)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.4" fill="#021d15" stroke="#34D399" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#FDE68A" />
                    </g>
                  </>
                ) : selectedDocId === 'kaufvertrag' ? (
                  <>
                    {/* Line 1: Ostium 1 (228, 300) -> Card 1: Fahrzeug & Preis (440, 90) */}
                    <path d="M 228 300 C 280 250, 330 90, 440 90" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 228 300 C 280 250, 330 90, 440 90" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Line 2: Ostium 2 (250, 350) -> Card 2: Käufer (440, 240) */}
                    <path d="M 250 350 C 295 350, 340 240, 440 240" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 250 350 C 295 350, 340 240, 440 240" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Line 3: Ostium 3 (228, 400) -> Card 3: Verkäufer (440, 390) */}
                    <path d="M 228 400 C 280 430, 330 390, 440 390" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 228 400 C 280 430, 330 390, 440 390" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Ostia Glowing Nodes (3 Points for 3 Cards) */}
                    <g transform="translate(228, 300)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.4" fill="#021d15" stroke="#34D399" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#FDE68A" />
                    </g>
                    <g transform="translate(250, 350)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.4" fill="#021d15" stroke="#2DD4BF" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#FDE68A" />
                    </g>
                    <g transform="translate(228, 400)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.4" fill="#021d15" stroke="#34D399" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#FDE68A" />
                    </g>
                  </>
                ) : selectedDocId === 'probefahrt' ? (
                  <>
                    {/* Line 1: Ostium 1 (228, 286) -> Card 1: Fahrzeug (440, 60) */}
                    <path d="M 228 286 C 270 230, 310 70, 440 60" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 228 286 C 270 230, 310 70, 440 60" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Line 2: Ostium 2 (248, 316) -> Card 2: Kunde (440, 185) */}
                    <path d="M 248 316 C 290 270, 340 190, 440 185" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 248 316 C 290 270, 340 190, 440 185" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Line 3: Ostium 3 (255, 350) -> Card 3: Rote Kennzeichen (440, 310) */}
                    <path d="M 255 350 C 300 350, 350 310, 440 310" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 255 350 C 300 350, 350 310, 440 310" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Line 4: Ostium 4 (248, 384) -> Card 4: Probefahrtdetails (440, 440) */}
                    <path d="M 248 384 C 290 420, 340 440, 440 440" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 248 384 C 290 420, 340 440, 440 440" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Line 5: Ostium 5 (228, 414) -> Card 5: Führerschein (440, 575) */}
                    <path d="M 228 414 C 270 470, 310 570, 440 575" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 228 414 C 270 470, 310 570, 440 575" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Ostia Glowing Nodes (5 Points for 5 Cards) */}
                    <g transform="translate(228, 286)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.4" fill="#021d15" stroke="#34D399" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#FDE68A" />
                    </g>
                    <g transform="translate(248, 316)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.2" fill="#021d15" stroke="#2DD4BF" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#F0FDFA" />
                    </g>
                    <g transform="translate(255, 350)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.5" fill="#021d15" stroke="#2DD4BF" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.6" fill="#6EE7B7" />
                    </g>
                    <g transform="translate(248, 384)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.2" fill="#021d15" stroke="#2DD4BF" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#F0FDFA" />
                    </g>
                    <g transform="translate(228, 414)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.4" fill="#021d15" stroke="#34D399" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#FDE68A" />
                    </g>
                  </>
                ) : (
                  <>
                    {/* Line 1: Ostium 1 (211, 272) -> Card 1 (440, 55) */}
                    <path d="M 211 272 C 255 240, 310 75, 440 55" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 211 272 C 255 240, 310 75, 440 55" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Line 2: Ostium 2 (239, 297) -> Card 2 (440, 170) */}
                    <path d="M 239 297 C 285 270, 340 175, 440 170" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 239 297 C 285 270, 340 175, 440 170" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Upper cross-thread */}
                    <path d="M 265 245 C 290 235, 305 210, 330 185" fill="none" stroke="url(#artery-thread-grad)" strokeWidth="1.1" opacity="0.6" className="animate-artery-wall" />
                    <circle cx="330" cy="185" r="2" fill="#6EE7B7" opacity="0.85" className="animate-ostium-pulse" />

                    {/* Line 3: Ostium 3 (254, 331) -> Card 3 (440, 280) */}
                    <path d="M 254 331 C 295 320, 350 280, 440 280" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 254 331 C 295 320, 350 280, 440 280" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Line 4: Ostium 4 (254, 369) -> Card 4 (440, 395) */}
                    <path d="M 254 369 C 295 380, 350 395, 440 395" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 254 369 C 295 380, 350 395, 440 395" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Line 5: Ostium 5 (239, 403) -> Card 5 (440, 505) */}
                    <path d="M 239 403 C 285 430, 340 500, 440 505" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 239 403 C 285 430, 340 500, 440 505" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Lower cross-thread */}
                    <path d="M 265 455 C 290 465, 305 490, 330 515" fill="none" stroke="url(#artery-thread-grad)" strokeWidth="1.1" opacity="0.6" className="animate-artery-wall" />
                    <circle cx="330" cy="515" r="2" fill="#6EE7B7" opacity="0.85" className="animate-ostium-pulse" />

                    {/* Line 6: Ostium 6 (211, 428) -> Card 6 (440, 620) */}
                    <path d="M 211 428 C 255 460, 310 615, 440 620" fill="none" stroke="url(#artery-wall-cyan-grad)" strokeWidth="2.2" filter="url(#glow-artery-strong)" className="animate-artery-wall" markerEnd="url(#artery-arrow)" />
                    <path d="M 211 428 C 255 460, 310 615, 440 620" fill="none" stroke="url(#artery-luminal-core)" strokeWidth="1.1" strokeDasharray="160 40" className="animate-artery-flow" />

                    {/* Ostia Glowing Nodes (6 Points for 6 Cards) */}
                    <g transform="translate(211, 272)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.4" fill="#021d15" stroke="#34D399" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#FDE68A" />
                    </g>
                    <g transform="translate(239, 297)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.2" fill="#021d15" stroke="#2DD4BF" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#F0FDFA" />
                    </g>
                    <g transform="translate(254, 331)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.5" fill="#021d15" stroke="#2DD4BF" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.6" fill="#6EE7B7" />
                    </g>
                    <g transform="translate(254, 369)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.5" fill="#021d15" stroke="#2DD4BF" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.6" fill="#6EE7B7" />
                    </g>
                    <g transform="translate(239, 403)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.2" fill="#021d15" stroke="#2DD4BF" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#F0FDFA" />
                    </g>
                    <g transform="translate(211, 428)" className="animate-ostium-pulse">
                      <circle cx="0" cy="0" r="6.5" fill="url(#ostium-glow-grad)" filter="url(#glow-ostium)" />
                      <circle cx="0" cy="0" r="3.4" fill="#021d15" stroke="#34D399" strokeWidth="1.4" />
                      <circle cx="0" cy="0" r="1.5" fill="#FDE68A" />
                    </g>
                  </>
                )}
              </svg>
            </div>

            {/* ======================================================================= */}
            {/* LEFT / TOP COLUMN: DOCKED GLOWING CIRCULAR NODE (HEARTBEAT PULSE)       */}
            {/* ======================================================================= */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center z-10 py-4 lg:py-6 lg:self-center">
              
              <div className="relative flex flex-col items-center justify-center">
                
                {/* Outer Circular Rim (Ultra-Subtle Pulse, Tight Border Glow) */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-[3px] bg-gradient-to-tr from-emerald-500/70 via-emerald-400/90 to-teal-300/70 shadow-[0_0_15px_rgba(52,211,153,0.35),0_0_2px_rgba(52,211,153,0.6)] flex items-center justify-center animate-heartbeat">
                  
                  {/* Rotating Orbit Accent Arc - strictly tight to perimeter */}
                  <div className="absolute inset-0 rounded-full border border-emerald-400/30 border-t-amber-300/80 animate-[spin_14s_linear_infinite] pointer-events-none" />

                  {/* Inner Dark Glass Circle Core */}
                  <div className="w-full h-full rounded-full bg-[#021d15] border border-emerald-400/50 shadow-inner flex flex-col items-center justify-center text-center p-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial from-emerald-400/10 via-transparent to-transparent pointer-events-none" />
                    
                    <ActiveIcon className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-300 stroke-[2] drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  </div>
                </div>

                {/* Node Subtitle & Description */}
                <div className="mt-3 sm:mt-4 text-center space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-block shadow-xs">
                    {activeDocItem.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">{activeDocItem.label}</h3>
                  <p className="text-xs text-emerald-200/70 max-w-[240px]">
                    {activeDocItem.description}
                  </p>
                </div>
              </div>

              {/* Mobile / Tablet Vertical Arterial Flow (< lg) */}
              <div className="lg:hidden w-full flex flex-col items-center justify-center my-3 pointer-events-none">
                <svg className="w-56 sm:w-72 h-16" viewBox="0 0 220 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mobile-artery-wall" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
                      <stop offset="20%" stopColor="#34D399" stopOpacity="1" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="mobile-artery-core" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FDE68A" stopOpacity="1" />
                      <stop offset="30%" stopColor="#A7F3D0" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.95" />
                    </linearGradient>
                    <filter id="glow-vert-deep" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.8" result="blur"/>
                      <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  <path d="M 110 0 C 110 20, 35 25, 20 60" fill="none" stroke="url(#mobile-artery-wall)" strokeWidth="2.0" filter="url(#glow-vert-deep)" className="animate-artery-wall" />
                  <path d="M 110 0 C 110 20, 35 25, 20 60" fill="none" stroke="url(#mobile-artery-core)" strokeWidth="1.0" opacity="0.85" className="animate-artery-flow" />

                  <path d="M 110 0 C 110 25, 75 35, 65 60" fill="none" stroke="url(#mobile-artery-wall)" strokeWidth="2.2" filter="url(#glow-vert-deep)" className="animate-artery-wall" />
                  <path d="M 110 0 C 110 25, 75 35, 65 60" fill="none" stroke="url(#mobile-artery-core)" strokeWidth="1.0" opacity="0.85" className="animate-artery-flow" />

                  <path d="M 110 0 L 110 60" fill="none" stroke="url(#mobile-artery-wall)" strokeWidth="2.4" filter="url(#glow-vert-deep)" className="animate-artery-wall" />
                  <path d="M 110 0 L 110 60" fill="none" stroke="url(#mobile-artery-core)" strokeWidth="1.1" opacity="0.9" className="animate-artery-flow" />

                  <path d="M 110 0 C 110 25, 145 35, 155 60" fill="none" stroke="url(#mobile-artery-wall)" strokeWidth="2.2" filter="url(#glow-vert-deep)" className="animate-artery-wall" />
                  <path d="M 110 0 C 110 25, 145 35, 155 60" fill="none" stroke="url(#mobile-artery-core)" strokeWidth="1.0" opacity="0.85" className="animate-artery-flow" />

                  <path d="M 110 0 C 110 20, 185 25, 200 60" fill="none" stroke="url(#mobile-artery-wall)" strokeWidth="2.0" filter="url(#glow-vert-deep)" className="animate-artery-wall" />
                  <path d="M 110 0 C 110 20, 185 25, 200 60" fill="none" stroke="url(#mobile-artery-core)" strokeWidth="1.0" opacity="0.85" className="animate-artery-flow" />

                  <g transform="translate(110, 2)" className="animate-ostium-pulse">
                    <circle cx="0" cy="0" r="4.5" fill="#34D399" opacity="0.5" />
                    <circle cx="0" cy="0" r="2.8" fill="#021d15" stroke="#34D399" strokeWidth="1.3" />
                    <circle cx="0" cy="0" r="1.3" fill="#FDE68A" />
                  </g>
                </svg>
              </div>

            </div>

            {/* ======================================================================= */}
            {/* RIGHT COLUMN: STACKED INPUT CARDS                                       */}
            {/* ======================================================================= */}
            <div className="lg:col-span-8 flex flex-col space-y-4 z-10 w-full">
              {selectedDocId === 'probefahrt' ? (
                <ProbefahrtCardStack
                  vehicle={vehicleItems[0]}
                  customer={selectedCustomer}
                  onOpenVehicleDrawer={() => setIsLagerDrawerOpen(true)}
                  onOpenCustomerDrawer={() => setIsCustomerDrawerOpen(true)}
                  onRemoveCustomer={() => setSelectedCustomer(null)}
                  merchantSettings={merchantSettings}
                  docNumber={docNumber}
                  datum={datum}
                  probefahrtPlate={probefahrtPlate}
                  setProbefahrtPlate={setProbefahrtPlate}
                  probefahrtDuration={probefahrtDuration}
                  setProbefahrtDuration={setProbefahrtDuration}
                  probefahrtRouteLimit={probefahrtRouteLimit}
                  setProbefahrtRouteLimit={setProbefahrtRouteLimit}
                  probefahrtDeductible={probefahrtDeductible}
                  setProbefahrtDeductible={setProbefahrtDeductible}
                  drivingLicenseNumber={drivingLicenseNumber}
                  setDrivingLicenseNumber={setDrivingLicenseNumber}
                  drivingLicenseClasses={drivingLicenseClasses}
                  setDrivingLicenseClasses={setDrivingLicenseClasses}
                  drivingLicensePhoto={drivingLicensePhoto}
                  setDrivingLicensePhoto={setDrivingLicensePhoto}
                  onOpenPreview={() => setShowPreviewModal(true)}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              ) : selectedDocId === 'uebergabeprotokoll' ? (
                <UebergabeprotokollCardStack
                  vehicle={vehicleItems[0]}
                  customer={selectedCustomer}
                  onOpenVehicleDrawer={() => setIsLagerDrawerOpen(true)}
                  onOpenCustomerDrawer={() => {
                    setCustomerDrawerTarget('general');
                    setIsCustomerDrawerOpen(true);
                  }}
                  onRemoveCustomer={() => setSelectedCustomer(null)}
                  onOpenPreview={() => setShowPreviewModal(true)}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              ) : selectedDocId === 'kaufvertrag' ? (
                <KaufvertragCardStack
                  vehicle={vehicleItems[0]}
                  price={kvPrice || vehicleItems[0]?.sellingPrice || 0}
                  buyerState={kvBuyer}
                  sellerState={kvSeller}
                  merchantSettings={merchantSettings}
                  onOpenVehicleDrawer={() => setIsLagerDrawerOpen(true)}
                  onChangePrice={handleUpdateVehiclePrice}
                  onSelectBuyerDealer={() => setKvBuyer({ isDealer: true, customer: null })}
                  onOpenBuyerCustomerDrawer={() => {
                    setCustomerDrawerTarget('kv_buyer');
                    setIsCustomerDrawerOpen(true);
                  }}
                  onRemoveBuyerCustomer={() => setKvBuyer({ isDealer: false, customer: null })}
                  onSelectSellerDealer={() => setKvSeller({ isDealer: true, customer: null })}
                  onOpenSellerCustomerDrawer={() => {
                    setCustomerDrawerTarget('kv_seller');
                    setIsCustomerDrawerOpen(true);
                  }}
                  onRemoveSellerCustomer={() => setKvSeller({ isDealer: false, customer: null })}
                  onOpenPreview={() => setShowPreviewModal(true)}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              ) : (
                <InvoiceCardStack
                  selectedDocId={selectedDocId}
                  vehicle={vehicleItems[0]}
                  customer={selectedCustomer}
                  onOpenVehicleDrawer={() => setIsLagerDrawerOpen(true)}
                  onChangeVehiclePrice={handleUpdateVehiclePrice}
                  onOpenCustomerDrawer={() => setIsCustomerDrawerOpen(true)}
                  onRemoveCustomer={() => setSelectedCustomer(null)}
                  docNumber={docNumber}
                  datum={datum}
                  lieferdatum={lieferdatum}
                  setLieferdatum={setLieferdatum}
                  zahlungsziel={zahlungsziel}
                  setZahlungsziel={setZahlungsziel}
                  begruessungstext={begruessungstext}
                  setBegruessungstext={setBegruessungstext}
                  gewaehrleistung={gewaehrleistung}
                  setGewaehrleistung={setGewaehrleistung}
                  sondervereinbarung={sondervereinbarung}
                  setSondervereinbarung={setSondervereinbarung}
                  calc={calc}
                  onOpenPreview={() => setShowPreviewModal(true)}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              )}
            </div>

          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* DRAWERS & PREVIEW MODALS                                                  */}
      {/* ========================================================================= */}
      {/* Customer Selection Drawer */}
      <KundenSelectionDrawer
        isOpen={isCustomerDrawerOpen}
        onClose={() => setIsCustomerDrawerOpen(false)}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={handleSelectCustomerFromDrawer}
      />

      {/* Vehicle Warehouse Selection Drawer */}
      <LagerSelectionDrawer
        isOpen={isLagerDrawerOpen}
        onClose={() => setIsLagerDrawerOpen(false)}
        vehicles={vehicles}
        selectedVehicleId={vehicleItems[0]?.id}
        onSelectVehicle={handleSelectVehicleFromLager}
      />

      {/* A4 Live Print Preview Modal */}
      <DocumentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        documentType={selectedDocId}
        onChangeDocumentType={(newType) => setSelectedDocId(newType)}
        documentNumber={docNumber}
        date={datum}
        setDate={() => {}}
        dueDate={zahlungsziel}
        setDueDate={setZahlungsziel}
        validUntil={zahlungsziel}
        setValidUntil={setZahlungsziel}
        customer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        manualCustomer={null}
        vehicles={vehicleItems}
        onChangeVehicles={setVehicleItems}
        paymentMethod="Überweisung"
        depositAmount={0}
        introText={begruessungstext}
        notes={`${gewaehrleistung}\n\n${sondervereinbarung}`.trim()}
        probefahrtLicensePlate={probefahrtPlate}
        setProbefahrtLicensePlate={setProbefahrtPlate}
        probefahrtDrivingLicense={drivingLicenseNumber}
        setProbefahrtDrivingLicense={setDrivingLicenseNumber}
        probefahrtDurationHours={Math.round((probefahrtDuration / 60) * 10) / 10}
        probefahrtDeposit={0}
        probefahrtDeductible={probefahrtDeductible}
        probefahrtDetails={
          selectedDocId === 'probefahrt'
            ? {
                driverName: selectedCustomer ? (selectedCustomer.name || selectedCustomer.companyName || 'Interessent') : 'Probefahrer',
                driverStreet: selectedCustomer?.street || '',
                driverPostalCode: selectedCustomer?.postalCode || selectedCustomer?.zip || '',
                driverCity: selectedCustomer?.city || '',
                driverPhone: selectedCustomer?.phone || selectedCustomer?.mobile || '',
                driverEmail: selectedCustomer?.email || '',
                drivingLicenseNumber: drivingLicenseNumber || 'Geprüft',
                drivingLicenseClasses: drivingLicenseClasses || 'B',
                driverLicenseFile: drivingLicensePhoto || undefined,
                vin: vehicleItems[0]?.vin || '',
                brand: vehicleItems[0]?.brand || '',
                model: vehicleItems[0]?.model || '',
                variant: vehicleItems[0]?.variant || '',
                color: vehicleItems[0]?.color || 'Schwarz',
                firstRegistration: vehicleItems[0]?.firstRegistration || '',
                mileageStart: vehicleItems[0]?.mileage || 0,
                redLicensePlate: probefahrtPlate,
                durationMinutes: probefahrtDuration,
                startTime: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
                expectedReturnTime: `${String((new Date().getHours() + Math.floor((new Date().getMinutes() + probefahrtDuration) / 60)) % 24).padStart(2, '0')}:${String((new Date().getMinutes() + probefahrtDuration) % 60).padStart(2, '0')}`,
                routeLimitKm: probefahrtRouteLimit,
                depositAmount: 0,
                liabilityDeductible: probefahrtDeductible,
                disclaimersAccepted: {
                  stvoRules: true,
                  noThirdParty: true,
                  zeroAlcohol: true,
                  deductibleAgreed: true,
                  returnOnTime: true,
                  trafficFineLiability: true,
                  mileageChecked: true
                },
                place: merchantSettings.city || 'Berlin',
                date: datum
              }
            : undefined
        }
        kaufvertragDetails={
          selectedDocId === 'kaufvertrag'
            ? {
                contractMode: kvBuyer.isDealer ? 'ankauf' : 'verkauf',
                seller: {
                  type: kvSeller.isDealer ? 'dealer' : 'customer',
                  companyName: kvSeller.isDealer ? merchantSettings.companyName : (kvSeller.customer?.companyName || ''),
                  name: kvSeller.isDealer ? (merchantSettings.companyName || 'Händler') : (kvSeller.customer?.name || ''),
                  street: kvSeller.isDealer ? merchantSettings.street : (kvSeller.customer?.street || ''),
                  postalCode: kvSeller.isDealer ? merchantSettings.postalCode : (kvSeller.customer?.postalCode || kvSeller.customer?.zip || ''),
                  city: kvSeller.isDealer ? merchantSettings.city : (kvSeller.customer?.city || ''),
                  country: kvSeller.isDealer ? (merchantSettings.country || 'Deutschland') : (kvSeller.customer?.country || 'Deutschland'),
                  phone: kvSeller.isDealer ? merchantSettings.phone : (kvSeller.customer?.phone || kvSeller.customer?.mobile || ''),
                  email: kvSeller.isDealer ? merchantSettings.email : (kvSeller.customer?.email || '')
                },
                buyer: {
                  type: kvBuyer.isDealer ? 'dealer' : 'customer',
                  companyName: kvBuyer.isDealer ? merchantSettings.companyName : (kvBuyer.customer?.companyName || ''),
                  name: kvBuyer.isDealer ? (merchantSettings.companyName || 'Händler') : (kvBuyer.customer?.name || ''),
                  street: kvBuyer.isDealer ? merchantSettings.street : (kvBuyer.customer?.street || ''),
                  postalCode: kvBuyer.isDealer ? merchantSettings.postalCode : (kvBuyer.customer?.postalCode || kvBuyer.customer?.zip || ''),
                  city: kvBuyer.isDealer ? merchantSettings.city : (kvBuyer.customer?.city || ''),
                  country: kvBuyer.isDealer ? (merchantSettings.country || 'Deutschland') : (kvBuyer.customer?.country || 'Deutschland'),
                  phone: kvBuyer.isDealer ? merchantSettings.phone : (kvBuyer.customer?.phone || kvBuyer.customer?.mobile || ''),
                  email: kvBuyer.isDealer ? merchantSettings.email : (kvBuyer.customer?.email || '')
                },
                vin: vehicleItems[0]?.vin || '',
                brand: vehicleItems[0]?.brand || '',
                model: vehicleItems[0]?.model || '',
                variant: vehicleItems[0]?.variant || '',
                firstRegistration: vehicleItems[0]?.firstRegistration || '',
                mileage: vehicleItems[0]?.mileage || 0,
                nextHuDate: '',
                nextAuDate: '',
                handoverDate: datum,
                purchasePrice: kvPrice,
                paymentMethod: 'Überweisung',
                hasKfzBrief: true,
                hasKfzSchein: true,
                hasHuAuBericht: true,
                keysCount: 2,
                hasLicensePlates: false,
                hasDeregistrationDoc: false,
                ownershipConfirmed: true,
                isAccidentFree: true,
                knownDamages: '',
                isReImport: false,
                usageType: 'privat',
                isOriginalEngine: true,
                previousOwnersCount: 1,
                reRegistrationDeadlineDays: 7,
                retentionOfTitleAccepted: true,
                warrantyType: 'b2c_haendler_12m',
                specialAgreements: '',
                place: merchantSettings.city || 'Berlin',
                contractDate: datum
              }
            : undefined
        }
        exportCountry="Schweiz"
        exportVatId="CHE-123.456.789 MWST"
        exportCustomsOffice="Hauptzollamt Berlin"
        eRechnungBuyerRef="04011000-12345-67"
        eRechnungFormat="XRechnung"
        merchantSettings={merchantSettings}
        onSaveDocument={() => {
          handleSave();
          setShowPreviewModal(false);
        }}
      />

    </div>
  );
};

export default Hub;
