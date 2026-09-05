import React, { useState, useEffect } from 'react';
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
  Car,
  User,
  Plus,
  Trash2,
  Euro,
  Building2,
  Phone,
  Mail,
  MapPin,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Printer,
  Eye,
  Search,
  Calendar,
  CreditCard,
  Scale,
  ShieldCheck,
  X,
  FileCode,
  Check,
  Clock,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { 
  Vehicle, 
  Customer, 
  Invoice, 
  InvoicePayment,
  NavTab, 
  OperationDocumentType,
  OperationVehicleItem,
  MerchantSettings,
  OperationDocument,
  KaufvertragDetails,
  KaufvertragParty,
  ProbefahrtDetails,
  UebergabeprotokollDetails,
  GelangensbestaetigungDetails,
  TextTemplate,
  DamageCategoryCode,
  DamageMapPoint
} from '../types';
import { firebaseService } from '../services/firebaseService';
import { generateDocumentSerial, getDocumentTypeLabel } from '../utils/documentNumberGenerator';
import { calculateDocumentTaxes } from '../utils/taxCalculationEngine';
import { DocumentTextController } from '../controllers/DocumentTextController';
import { ERechnungXmlViewerModal } from './operationen/ERechnungXmlViewerModal';
import { KaufvertragA4Layout } from './operationen/KaufvertragA4Layout';
import { ProbefahrtA4Layout, ProbefahrtEditField } from './operationen/ProbefahrtA4Layout';
import { UebergabeProtocolA4Layout } from './operationen/UebergabeProtocolA4Layout';
import { GelangensbestaetigungA4Layout } from './operationen/GelangensbestaetigungA4Layout';
import { LagerSelectionDrawer } from './operationen/LagerSelectionDrawer';
import { KundenSelectionDrawer } from './operationen/KundenSelectionDrawer';
import { ProbefahrtQuickEditModal, ProbefahrtEditFieldType } from './operationen/ProbefahrtQuickEditModal';
import { SignaturePadModal } from './operationen/SignaturePadModal';
import { VehicleDetailModal } from './VehicleDetailModal';
import { DruckvorschauModal } from './operationen/DruckvorschauModal';
import { OperationsPerformanceDashboard } from './operationen/OperationsPerformanceDashboard';
import { DualLayerScanningRings } from './CoinOrbitalNode';

export interface OperationenViewProps {
  setActiveTab?: (tab: NavTab) => void;
  onOpenMaxAi?: () => void;
  vehicles?: Vehicle[];
  customers?: Customer[];
  invoices?: Invoice[];
  initialCustomer?: Customer | null;
  initialVehicle?: Vehicle | null;
  initialDocType?: OperationDocumentType;
  initialViewState?: 'hub' | 'document_view';
  selectedCustomer?: Customer | null;
  onClearSelectedCustomer?: () => void;
  selectedVehicle?: Vehicle | null;
  onClearSelectedVehicle?: () => void;
  onEditVehicleMaster?: (
    vehicle: Vehicle, 
    returnTab?: NavTab, 
    returnDocType?: OperationDocumentType, 
    returnCustomer?: Customer | null
  ) => void;
}

interface DocumentCircleItem {
  id: OperationDocumentType;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  angleDeg: number;
  badge: string;
  nebulaGradient: string;
  metallicSheen: string;
  glowColor: string;
  jewelColor: string;
}

// =========================================================================
// CUSTOM OPERATIONEN ICONS BASED ON REFERENCE CONCEPTS
// =========================================================================

// 1. Handelsrechnung: Automotive Sales Invoice with € and Verified Seal (Thin Line, Max Area, No Lock)
const HandelsrechnungOpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Full-height document sheet with folded corner */}
    <path d="M15 1.5H4.5A2 2 0 0 0 2.5 3.5v17a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2V7.5L15 1.5z" />
    <polyline points="15 1.5 15 7.5 21.5 7.5" />
    
    {/* Large elegant Euro currency sign */}
    <path d="M10.5 10.5A3.2 3.2 0 0 0 6 13.5a3.2 3.2 0 0 0 4.5 3" strokeWidth="1.4" />
    <line x1="4.5" y1="12.5" x2="9" y2="12.5" strokeWidth="1.3" />
    <line x1="4.5" y1="14.5" x2="9" y2="14.5" strokeWidth="1.3" />
    
    {/* Clean itemized invoice data lines */}
    <line x1="12" y1="11.5" x2="18.5" y2="11.5" />
    <line x1="12" y1="14.5" x2="18.5" y2="14.5" />
    <line x1="6" y1="18.5" x2="12" y2="18.5" />
    
    {/* Verification Badge with Star Checkmark */}
    <circle cx="16.5" cy="18" r="2.8" strokeWidth="1.3" />
    <polyline points="15.2 18 16.2 19 18 17" strokeWidth="1.3" />
  </svg>
);

// 2. E-Rechnung: Clear Solid-line Cloud Backdrop + XML Sheet + Sync Arrow + Padlock (Thin Line, Sole Lock as Requested)
const ERechnungOpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Prominent, clean continuous cloud outline */}
    <path d="M6.5 14H5a3.5 3.5 0 0 1-.5-6.96A5 5 0 0 1 14 4.5a4.5 4.5 0 0 1 4.3 3.2A3.5 3.5 0 0 1 19 14.5" strokeWidth="1.4" />
    
    {/* Central E-Document sheet */}
    <path d="M7 6.5h4.5L14 9.5v4.5A1.2 1.2 0 0 1 12.8 15.2H7A1.2 1.2 0 0 1 5.8 14V7.7A1.2 1.2 0 0 1 7 6.5z" strokeWidth="1.3" />
    <polyline points="11.5 6.5 11.5 9.5 14 9.5" />
    <line x1="7.8" y1="11.5" x2="11.5" y2="11.5" />
    <line x1="7.8" y1="13.5" x2="10" y2="13.5" />
    
    {/* Transfer / Sync return loop arrow */}
    <path d="M9 19.5H3.5A1.5 1.5 0 0 1 2 18v-2" />
    <polyline points="7 17.5 9 19.5 7 21.5" />
    
    {/* Electronic Security Padlock with Keyhole */}
    <rect x="13.5" y="13" width="8.5" height="8" rx="1.5" strokeWidth="1.4" />
    <path d="M15.5 13V10a2.25 2.25 0 0 1 4.5 0v3" strokeWidth="1.3" />
    <circle cx="17.75" cy="17" r="0.8" fill="currentColor" />
  </svg>
);

// 3. EU-Rechnung: Wide Europe Map Silhouette + Large Center € Symbol (Thin Line, Max Area, No Lock)
const EuRechnungOpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Expanded Europe Continent Map Contours */}
    <path d="M2.5 6.5c1.5-2.5 4.5-4 7.5-4 2 0 3 1 4 2.2 1 .3 2.5 0 3.5-.7M18.5 2l1.8 3.5-1.5 2.8 2.8 2M2.5 11.5c1.5.8 2.8 0 3.5-1.2s2-1.2 3.2-.6 1.5 2.5 0 3.8-2 2.5-.6 3.8M12.5 15.5c1.5 2 3 2 4.5.6M18 19c1.5 1 3 0 3.5-1.5" opacity="0.6" strokeDasharray="2.5 1.5" />
    
    {/* Grand Central Euro Currency (€) Sign filling the frame */}
    <path d="M16 5.5A6.5 6.5 0 0 0 8.5 12a6.5 6.5 0 0 0 7.5 6.5" strokeWidth="1.8" />
    <line x1="4.5" y1="10.5" x2="14.5" y2="10.5" strokeWidth="1.6" />
    <line x1="4.5" y1="13.5" x2="14.5" y2="13.5" strokeWidth="1.6" />
    
    {/* European Stars surrounding motif */}
    <circle cx="12" cy="1.8" r="0.6" fill="currentColor" />
    <circle cx="21" cy="7" r="0.6" fill="currentColor" />
    <circle cx="22.2" cy="12" r="0.6" fill="currentColor" />
    <circle cx="20.5" cy="17" r="0.6" fill="currentColor" />
    <circle cx="12" cy="22.2" r="0.6" fill="currentColor" />
  </svg>
);

// 4. Weltweit-Rechnung: Large Globe with Continents + Dual Trade Loop Arrows (Thin Line, Max Area, No Lock)
const DrittlandExportOpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Large World Globe Frame spanning almost full circle */}
    <circle cx="12" cy="12" r="9.5" />
    <line x1="2.5" y1="12" x2="21.5" y2="12" opacity="0.65" />
    <path d="M12 2.5a13 13 0 0 1 4.5 9.5 13 13 0 0 1-4.5 9.5" opacity="0.6" />
    <path d="M12 2.5a13 13 0 0 0-4.5 9.5 13 13 0 0 0 4.5 9.5" opacity="0.6" />
    <path d="M4.5 7.5h15" opacity="0.45" strokeDasharray="1.5 1.5" />
    <path d="M4.5 16.5h15" opacity="0.45" strokeDasharray="1.5 1.5" />
    
    {/* Dynamic Clockwise International Trade Flow Arrows */}
    <path d="M8 5a6.5 6.5 0 0 1 9.5 1.5" strokeWidth="1.7" />
    <polyline points="18 3.5 18 6.8 14.8 7" strokeWidth="1.5" />
    
    <path d="M16 19a6.5 6.5 0 0 1-9.5-1.5" strokeWidth="1.7" />
    <polyline points="6 20.5 6 17.2 9.2 17" strokeWidth="1.5" />
  </svg>
);

// 5. Kaufvertrag: Prominent, Crystal Clear Full-Frame Handshake (Key removed as requested, maximum clarity)
const KaufvertragOpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Left Cuff / Sleeve */}
    <path d="M1.5 13.5l4.5-4.5 3 3-4.5 4.5z" />
    <line x1="1.5" y1="13.5" x2="4.5" y2="16.5" />
    
    {/* Right Cuff / Sleeve */}
    <path d="M22.5 10.5l-4.5-4.5-3 3 4.5 4.5z" />
    <line x1="22.5" y1="10.5" x2="19.5" y2="13.5" />
    
    {/* Firm Clasping Fingers & Palm (Center Stage, Big & Clean) */}
    {/* Left Hand Palm & Thumb */}
    <path d="M6 12l4-2.5 3 2.5-3 3.5-4-3.5z" />
    <path d="M10 9.5l2.5-2a1.8 1.8 0 0 1 2.5.4l.6.8" />
    
    {/* Interlocking Fingers */}
    <path d="M7.5 13.5l3.5 3.5a2 2 0 0 0 2.8 0l1.2-1.2" strokeWidth="1.4" />
    <path d="M10.5 15.5l3 3a2 2 0 0 0 2.8 0l1.2-1.2" strokeWidth="1.4" />
    <path d="M13 17.5l2.2 2.2a2 2 0 0 0 2.8 0l1.2-1.2" strokeWidth="1.4" />
    <path d="M14.5 13.5l3.5-3.5a1.8 1.8 0 0 0 0-2.5l-1-1" strokeWidth="1.4" />
  </svg>
);

// 6. Angebot: Bold, Elegant Percentage Symbol (%) with Subtle Deal Accents (Hand removed as requested)
const AngebotOpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Prominent, Centered & High-Clarity Percentage Symbol (%) */}
    {/* Upper Circle */}
    <circle cx="7.5" cy="7.5" r="3.8" strokeWidth="1.5" />
    <circle cx="7.5" cy="7.5" r="1.5" opacity="0.6" />
    
    {/* Main Diagonal Slash */}
    <line x1="4.5" y1="19.5" x2="19.5" y2="4.5" strokeWidth="2.2" strokeLinecap="round" />
    
    {/* Lower Circle */}
    <circle cx="16.5" cy="16.5" r="3.8" strokeWidth="1.5" />
    <circle cx="16.5" cy="16.5" r="1.5" opacity="0.6" />
    
    {/* Refined Deal Accent Sparks */}
    <circle cx="18" cy="7" r="0.8" fill="currentColor" />
    <circle cx="6" cy="17" r="0.8" fill="currentColor" />
  </svg>
);

// 7. Probefahrt: Full-Diameter Sports Steering Wheel (Thin Line, Max Area, No Lock)
const ProbefahrtOpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Full-width Steering Wheel Outer Rim */}
    <circle cx="12" cy="12" r="9.8" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="8.2" opacity="0.5" strokeDasharray="3 1.5" />
    
    {/* Ergonomic 9 and 3 o'clock Grip Contours */}
    <path d="M2.5 9.5c1 1 2 0 2-.8M21.5 9.5c-1 1-2 0-2-.8" />
    <path d="M2.5 14.5c1-1 2 0 2 .8M21.5 14.5c-1-1-2 0-2 .8" />
    
    {/* Center Airbag Hub */}
    <circle cx="12" cy="12" r="3.8" strokeWidth="1.4" />
    <circle cx="12" cy="12" r="1.5" opacity="0.7" />
    
    {/* Horizontal & Multi-Function Control Spokes */}
    <line x1="2.2" y1="12" x2="8.2" y2="12" strokeWidth="1.5" />
    <line x1="15.8" y1="12" x2="21.8" y2="12" strokeWidth="1.5" />
    <circle cx="5.5" cy="10.8" r="0.5" fill="currentColor" />
    <circle cx="18.5" cy="10.8" r="0.5" fill="currentColor" />
    
    {/* Lower Twin Metal Spokes */}
    <line x1="10.2" y1="15.5" x2="9" y2="21.5" strokeWidth="1.5" />
    <line x1="13.8" y1="15.5" x2="15" y2="21.5" strokeWidth="1.5" />
  </svg>
);

// 8. Übergabeprotokoll: Protocol Sheet + Dual Checks + Pen + Key (Thin Line, Max Area, No Lock)
const UebergabeProtokollOpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Tall Protocol Document Sheet with Corner Fold */}
    <path d="M14 1.5H4A1.8 1.8 0 0 0 2.2 3.3v17.4A1.8 1.8 0 0 0 4 22.5h10a1.8 1.8 0 0 0 1.8-1.8V7.5L14 1.5z" />
    <polyline points="14 1.5 14 7.5 19.5 7.5" />
    
    {/* Bold Inspection Checkmarks */}
    <polyline points="5.5 8 7.5 10 12 5.5" strokeWidth="1.7" />
    <polyline points="5.5 14 7.5 16 12 11.5" strokeWidth="1.7" />
    
    {/* Fountain Pen Nib Signing */}
    <path d="M9.5 19.5l2-2 1.2 1.2-2 2-1.5.3.3-1.5z" strokeWidth="1.2" />
    
    {/* Handover Vehicle Key with Chain */}
    <circle cx="18.5" cy="16.5" r="2.8" strokeWidth="1.4" />
    <path d="M16.5 18.5l-3.5 3.5M14.2 20.8l1.2 1.2M13 22l1 1" strokeWidth="1.5" />
    <path d="M18.5 13.5a1.8 1.8 0 0 1 2-1" strokeDasharray="1.2 1.2" opacity="0.8" />
  </svg>
);

const DOCUMENT_HUB_ITEMS: DocumentCircleItem[] = [
  {
    id: 'rechnung',
    label: 'Handelsrechnung',
    shortLabel: 'Rechnung',
    icon: HandelsrechnungOpIcon,
    description: 'Rechtssichere Kfz-Rechnung (§ 25a Differenzbesteuerung oder 19% Regelbesteuerung)',
    angleDeg: 270, // Top
    badge: '§ 25a / 19%',
    nebulaGradient: 'linear-gradient(135deg, #3b4252 0%, #2e3440 45%, #1e222a 100%)',
    metallicSheen: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 30%, #94a3b8 60%, #e2e8f0 85%, #64748b 100%)',
    glowColor: 'rgba(226,232,240,0.7)',
    jewelColor: '#10b981'
  },
  {
    id: 'e_rechnung',
    label: 'E-Rechnung (XML)',
    shortLabel: 'E-Rechnung',
    icon: ERechnungOpIcon,
    description: 'Strukturierte elektronische Rechnung (XRechnung 3.0 & ZUGFeRD 2.2 nach EN 16931)',
    angleDeg: 315, // Top-Right
    badge: 'EN 16931',
    nebulaGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 45%, #0f172a 100%)',
    metallicSheen: 'linear-gradient(135deg, #f0fdf4 0%, #86efac 30%, #34d399 60%, #cbd5e1 85%, #475569 100%)',
    glowColor: 'rgba(52,211,153,0.7)',
    jewelColor: '#34d399'
  },
  {
    id: 'eu_export',
    label: 'EU Innergemeinschaftlich',
    shortLabel: 'EU-Export',
    icon: EuRechnungOpIcon,
    description: 'Steuerfreie innergemeinschaftliche Lieferung (§ 4 Nr. 1b UStG / B2B Reverse Charge)',
    angleDeg: 0, // Right
    badge: 'EU § 4 Nr. 1b',
    nebulaGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 45%, #111827 100%)',
    metallicSheen: 'linear-gradient(135deg, #f0f9ff 0%, #7dd3fc 30%, #38bdf8 60%, #cbd5e1 85%, #475569 100%)',
    glowColor: 'rgba(56,189,248,0.7)',
    jewelColor: '#38bdf8'
  },
  {
    id: 'export_drittland',
    label: 'Drittland Export (Netto)',
    shortLabel: 'Drittland',
    icon: DrittlandExportOpIcon,
    description: 'Steuerfreie Ausfuhrlieferung in Drittländer (§ 4 Nr. 1a UStG / Zoll- & Ausfuhrvermerk)',
    angleDeg: 45, // Bottom-Right
    badge: 'Export § 4 Nr. 1a',
    nebulaGradient: 'linear-gradient(135deg, #374151 0%, #1f2937 45%, #111827 100%)',
    metallicSheen: 'linear-gradient(135deg, #f0fdf4 0%, #86efac 30%, #10b981 60%, #cbd5e1 85%, #475569 100%)',
    glowColor: 'rgba(16,185,129,0.7)',
    jewelColor: '#10b981'
  },
  {
    id: 'kaufvertrag',
    label: 'Verbindlicher Kaufvertrag',
    shortLabel: 'Kaufvertrag',
    icon: KaufvertragOpIcon,
    description: 'BGB-konformer Gebrauchtwagen-Kaufvertrag (§ 433) mit Anzahlung & Klauseln',
    angleDeg: 90, // Bottom
    badge: 'BGB § 433',
    nebulaGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 45%, #0f172a 100%)',
    metallicSheen: 'linear-gradient(135deg, #f0fdf4 0%, #a7f3d0 30%, #34d399 60%, #cbd5e1 85%, #475569 100%)',
    glowColor: 'rgba(16,185,129,0.7)',
    jewelColor: '#10b981'
  },
  {
    id: 'angebot',
    label: 'Fahrzeug-Angebot',
    shortLabel: 'Angebot',
    icon: AngebotOpIcon,
    description: 'Freibleibendes Verkaufsangebot mit garantierter Preisbindung & Konditionen',
    angleDeg: 135, // Bottom-Left
    badge: 'Preisbindung',
    nebulaGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 45%, #0f172a 100%)',
    metallicSheen: 'linear-gradient(135deg, #f0fdfa 0%, #5eead4 30%, #14b8a6 60%, #cbd5e1 85%, #475569 100%)',
    glowColor: 'rgba(20,184,166,0.7)',
    jewelColor: '#14b8a6'
  },
  {
    id: 'probefahrt',
    label: 'Probefahrt-Vereinbarung',
    shortLabel: 'Probefahrt',
    icon: ProbefahrtOpIcon,
    description: 'Probefahrtüberlassung mit Rotem Kennzeichen (§ 16 FZV) & Kasko-Selbstbeteiligung',
    angleDeg: 180, // Left
    badge: 'Rote Nummern',
    nebulaGradient: 'linear-gradient(135deg, #374151 0%, #1f2937 45%, #111827 100%)',
    metallicSheen: 'linear-gradient(135deg, #fdf4ff 0%, #f0abfc 30%, #c084fc 60%, #cbd5e1 85%, #475569 100%)',
    glowColor: 'rgba(192,132,252,0.7)',
    jewelColor: '#c084fc'
  },
  {
    id: 'uebergabeprotokoll',
    label: 'Übergabeprotokoll',
    shortLabel: 'Übergabe',
    icon: UebergabeProtokollOpIcon,
    description: 'Dokumentation bei Fahrzeugauslieferung inkl. optischer Mängelkarte & Zubehör',
    angleDeg: 225, // Top-Left
    badge: 'Protokoll',
    nebulaGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 45%, #0f172a 100%)',
    metallicSheen: 'linear-gradient(135deg, #f0fdf4 0%, #a7f3d0 30%, #34d399 60%, #cbd5e1 85%, #475569 100%)',
    glowColor: 'rgba(52,211,153,0.7)',
    jewelColor: '#34d399'
  }
];

export const OperationenView: React.FC<OperationenViewProps> = ({
  setActiveTab,
  vehicles: initialVehicles = [],
  customers: initialCustomers = [],
  invoices: initialInvoices = [],
  initialCustomer = null,
  initialVehicle = null,
  initialDocType,
  initialViewState,
  selectedCustomer: propCustomer = null,
  selectedVehicle: propVehicle = null,
  onEditVehicleMaster
}) => {
  // Page View State: 'hub' -> 'document_view'
  const [viewState, setViewState] = useState<'hub' | 'document_view'>(initialViewState || 'hub');
  const [selectedDocId, setSelectedDocId] = useState<OperationDocumentType>(initialDocType || 'rechnung');
  const [hoveredItem, setHoveredItem] = useState<DocumentCircleItem | null>(null);

  // Sliding Drawers (Matching Hub Layout)
  const [isLagerDrawerOpen, setIsLagerDrawerOpen] = useState(false);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);

  // Data & Settings
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    return initialVehicles.length > 0 ? initialVehicles : firebaseService.getVehicles();
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    return initialCustomers.length > 0 ? initialCustomers : firebaseService.getCustomers();
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    return initialInvoices.length > 0 ? initialInvoices : firebaseService.getInvoices();
  });
  const [merchantSettings] = useState<MerchantSettings>(() => firebaseService.getMerchantSettings());

  // Selected State with Smart Session Memory
  const [chosenVehicle, setChosenVehicle] = useState<Vehicle | null>(initialVehicle || propVehicle || null);
  const [chosenCustomer, setChosenCustomer] = useState<Customer | null>(initialCustomer || propCustomer || null);

  // Sync props when new external vehicle/customer passed in or updated
  useEffect(() => {
    if (initialDocType) {
      setSelectedDocId(initialDocType);
    }
  }, [initialDocType]);

  useEffect(() => {
    if (initialViewState) {
      setViewState(initialViewState);
    }
  }, [initialViewState]);

  useEffect(() => {
    if (initialVehicles && initialVehicles.length > 0) {
      setVehicles(initialVehicles);
      if (chosenVehicle) {
        const updated = initialVehicles.find(v => v.id === chosenVehicle.id);
        if (updated) {
          setChosenVehicle(updated);
        }
      }
    }
  }, [initialVehicles]);

  useEffect(() => {
    if (initialInvoices && initialInvoices.length > 0) {
      setInvoices(initialInvoices);
    }
  }, [initialInvoices]);

  useEffect(() => {
    if (initialVehicle) setChosenVehicle(initialVehicle);
    else if (propVehicle) setChosenVehicle(propVehicle);
  }, [initialVehicle, propVehicle]);

  useEffect(() => {
    if (initialCustomer) setChosenCustomer(initialCustomer);
    else if (propCustomer) setChosenCustomer(propCustomer);
  }, [initialCustomer, propCustomer]);

  // Live Editable Document Fields
  const todayStr = new Date().toLocaleDateString('de-DE');
  const [docDate, setDocDate] = useState(todayStr);
  const [deliveryDate, setDeliveryDate] = useState(todayStr);
  const [paymentTerms, setPaymentTerms] = useState('Sofort fällig');
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [greetingText, setGreetingText] = useState<string>('');
  const [warrantyText, setWarrantyText] = useState<string>('');
  const [exportText, setExportText] = useState<string>('');
  const [sondervereinbarung, setSondervereinbarung] = useState<string>('');

  // Specialized document configurations (Probefahrt)
  const [probefahrtPlate, setProbefahrtPlate] = useState(() => merchantSettings.redLicensePlates?.[0]?.plateNumber || 'B-06124');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('B072X99482');
  const [probefahrtDuration, setProbefahrtDuration] = useState(30);
  const [probefahrtStartTime, setProbefahrtStartTime] = useState('10:00');
  const [probefahrtRouteLimit, setProbefahrtRouteLimit] = useState(50);
  const [probefahrtMileage, setProbefahrtMileage] = useState<number>(0);
  const [probefahrtFuelLevel, setProbefahrtFuelLevel] = useState('75% (3/4 Voll)');
  const [probefahrtDeposit, setProbefahrtDeposit] = useState(0);
  const [probefahrtDeductible, setProbefahrtDeductible] = useState(1000);
  const [probefahrtCustomLiability, setProbefahrtCustomLiability] = useState('');
  const [probefahrtDriverSignature, setProbefahrtDriverSignature] = useState('');
  const [probefahrtDealerSignature, setProbefahrtDealerSignature] = useState(() => merchantSettings.signatureUrl || '');

  // Probefahrt Quick Edit & Signature Pad Modal controls
  const [activeProbefahrtEditField, setActiveProbefahrtEditField] = useState<ProbefahrtEditFieldType | null>(null);
  const [activeProbefahrtSignTarget, setActiveProbefahrtSignTarget] = useState<'driver' | 'dealer' | null>(null);

  // Kaufvertrag Specialized State & Interactive Blocks (Step 24)
  const [kvContractMode, setKvContractMode] = useState<'verkauf' | 'ankauf'>('verkauf');
  const [kvSellerOverride, setKvSellerOverride] = useState<Partial<KaufvertragParty>>({});
  const [kvBuyerOverride, setKvBuyerOverride] = useState<Partial<KaufvertragParty>>({});
  const [kvBrand, setKvBrand] = useState('');
  const [kvModel, setKvModel] = useState('');
  const [kvVariant, setKvVariant] = useState('');
  const [kvVin, setKvVin] = useState('');
  const [kvFirstRegistration, setKvFirstRegistration] = useState('');
  const [kvMileage, setKvMileage] = useState<number>(0);
  const [kvNextHuDate, setKvNextHuDate] = useState('Neu vor Übergabe');
  const [kvNextAuDate, setKvNextAuDate] = useState('Neu vor Übergabe');
  const [kvLicensePlate, setKvLicensePlate] = useState('Abgemeldet');
  const [kvPowerKw, setKvPowerKw] = useState<number>(110);
  const [kvPowerPs, setKvPowerPs] = useState<number>(150);
  const [kvDisplacementCc, setKvDisplacementCc] = useState<number | undefined>(undefined);
  const [kvColor, setKvColor] = useState('Schwarz');
  const [kvPreviousOwnersCount, setKvPreviousOwnersCount] = useState<number>(1);
  const [kvPurchasePrice, setKvPurchasePrice] = useState<number>(0);
  const [kvPaymentMethod, setKvPaymentMethod] = useState<'Überweisung' | 'Bar' | 'Finanzierung' | 'Kartenzahlung' | 'Treuhand'>('Überweisung');
  const [kvDepositAmount, setKvDepositAmount] = useState<number>(0);
  const [kvOwnershipConfirmed, setKvOwnershipConfirmed] = useState<boolean>(false);
  const [kvIsAccidentFree, setKvIsAccidentFree] = useState<boolean>(false);
  const [kvKnownDamages, setKvKnownDamages] = useState<string>('');
  const [kvIsReImport, setKvIsReImport] = useState<boolean>(false);
  const [kvReImportCountry, setKvReImportCountry] = useState<string>('');
  const [kvUsageType, setKvUsageType] = useState<'privat' | 'gewerblich'>('privat');
  const [kvCommercialUsageNotes, setKvCommercialUsageNotes] = useState<string>('');
  const [kvIsOriginalEngine, setKvIsOriginalEngine] = useState<boolean>(false);
  const [kvEngineMileageKm, setKvEngineMileageKm] = useState<number | undefined>(undefined);
  const [kvWarrantyType, setKvWarrantyType] = useState<'b2c_haendler_12m' | 'gewerblich_ausschluss' | 'privat_ausschluss' | 'herstellergarantie'>('b2c_haendler_12m');
  const [kvWarrantyCustomNotes, setKvWarrantyCustomNotes] = useState<string>('');
  const [kvReRegistrationDeadlineDays, setKvReRegistrationDeadlineDays] = useState<number>(7);
  const [kvReRegistrationDeadlineDate, setKvReRegistrationDeadlineDate] = useState<string>('');
  const [kvKeysCount, setKvKeysCount] = useState<number>(2);
  const [kvHasKfzBrief, setKvHasKfzBrief] = useState<boolean>(false);
  const [kvKfzBriefNumber, setKvKfzBriefNumber] = useState<string>('');
  const [kvHasKfzSchein, setKvHasKfzSchein] = useState<boolean>(false);
  const [kvHasHuAuBericht, setKvHasHuAuBericht] = useState<boolean>(false);
  const [kvHasLicensePlates, setKvHasLicensePlates] = useState<boolean>(false);
  const [kvHasDeregistrationDoc, setKvHasDeregistrationDoc] = useState<boolean>(false);
  const [kvSpecialAgreements, setKvSpecialAgreements] = useState<string>('');
  const [kvPlace, setKvPlace] = useState(() => merchantSettings.city || 'Bonn');
  const [kvContractDate, setKvContractDate] = useState(() => todayStr);
  const [kvSellerSignature, setKvSellerSignature] = useState<string>(() => merchantSettings.signatureUrl || '');
  const [kvBuyerSignature, setKvBuyerSignature] = useState<string>('');
  const [activeKaufvertragSignTarget, setActiveKaufvertragSignTarget] = useState<'seller' | 'buyer' | null>(null);

  // Übergabeprotokoll Interactive State & Signatures (Step 25)
  const [showUebergabeGuideNotice, setShowUebergabeGuideNotice] = useState(true);
  const [isVehicleDetailModalOpen, setIsVehicleDetailModalOpen] = useState(false);
  const [activeUebergabeSignTarget, setActiveUebergabeSignTarget] = useState<'buyer' | 'seller' | null>(null);
  const [uebergabeBuyerSignature, setUebergabeBuyerSignature] = useState<string>('');
  const [uebergabeSellerSignature, setUebergabeSellerSignature] = useState<string>(() => merchantSettings.signatureUrl || '');
  const [uebergabeFuelLevel, setUebergabeFuelLevel] = useState<string>('75% (3/4)');
  const [uebergabeKeysCount, setUebergabeKeysCount] = useState<number>(2);
  const [uebergabeExternalOverrides, setUebergabeExternalOverrides] = useState<Record<string, { status: 'ok' | 'mangel'; note?: string }>>({});
  const [uebergabeInteriorOverrides, setUebergabeInteriorOverrides] = useState<Record<string, { status: 'ok' | 'mangel'; note?: string }>>({});
  const [uebergabeMechanicalOverrides, setUebergabeMechanicalOverrides] = useState<Record<string, { status: 'ok' | 'mangel'; note?: string }>>({});
  const [uebergabeEquipmentOverrides, setUebergabeEquipmentOverrides] = useState<Record<string, { present: boolean }>>({});
  const [uebergabeDocumentsOverrides, setUebergabeDocumentsOverrides] = useState<Record<string, boolean>>({});

  // EU-Export 3-Page Workflow & Gelangensbestätigung Interactive State
  const [euExportActivePage, setEuExportActivePage] = useState<1 | 2 | 3>(1);
  const [gelangensbestaetigungDetails, setGelangensbestaetigungDetails] = useState<GelangensbestaetigungDetails>({
    destinationMemberState: 'Polen',
    destinationCity: 'Warszawa',
    leaveDateBlankForManualEntry: false,
    leaveIssueDateBlank: false
  });
  const [isGelangensSignModalOpen, setIsGelangensSignModalOpen] = useState(false);

  // Popups / Modals State triggered by Minimalist Glowing Dots
  // 'delivery_date' -> small floating delivery popup (7/14 days or calendar)
  // 'price_payment' -> specialized floating popup for price & payment terms (7/14 days / calendar)
  // 'greeting_select' -> popup with pre-saved greetings from Settings
  // 'warranty_select' -> popup with pre-saved warranties from Settings
  // 'export_select' -> popup with pre-saved export texts from Settings
  // 'sondervereinbarung' -> custom agreement notes
  const [activeModalDot, setActiveModalDot] = useState<null | 'delivery_date' | 'price_payment' | 'greeting_select' | 'warranty_select' | 'export_select' | 'sondervereinbarung'>(null);
  
  // Payment Module & Quittung (Provisional Payment State)
  const [provisionalPayment, setProvisionalPayment] = useState<InvoicePayment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);
  const [paymentDateInput, setPaymentDateInput] = useState<string>(todayStr);
  const [paymentMethodInput, setPaymentMethodInput] = useState<'Barzahlung' | 'Banküberweisung' | 'Kartenzahlung'>('Barzahlung');
  const [paymentNotesInput, setPaymentNotesInput] = useState<string>('');

  const [showXmlModal, setShowXmlModal] = useState(false);
  const [isDruckvorschauOpen, setIsDruckvorschauOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Helper date adder
  const addDaysToToday = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('de-DE');
  };

  const parseInputDateToDe = (isoDate: string): string => {
    if (!isoDate) return todayStr;
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return isoDate;
  };

  // German formatters
  const formatEur = (val: number): string =>
    `${(Number(val) || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

  const numberToWordsGerman = (num: number): string => {
    const units = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
    const teens = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
    const tens = ['', 'zehn', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
    
    if (num === 0) return 'Null Euro';
    const integerPart = Math.floor(Math.abs(num));
    const cents = Math.round((Math.abs(num) - integerPart) * 100);

    const convertThreeDigits = (n: number): string => {
      let str = '';
      const h = Math.floor(n / 100);
      const rest = n % 100;
      if (h > 0) {
        str += (h === 1 ? 'ein' : units[h]) + 'hundert';
      }
      if (rest > 0) {
        if (rest < 10) {
          str += rest === 1 && h > 0 ? 'eins' : units[rest];
        } else if (rest >= 10 && rest < 20) {
          str += teens[rest - 10];
        } else {
          const u = rest % 10;
          const t = Math.floor(rest / 10);
          if (u > 0) {
            str += (u === 1 ? 'ein' : units[u]) + 'und' + tens[t];
          } else {
            str += tens[t];
          }
        }
      }
      return str;
    };

    let result = '';
    const thousands = Math.floor(integerPart / 1000);
    const remainder = integerPart % 1000;

    if (thousands > 0) {
      result += (thousands === 1 ? 'ein' : convertThreeDigits(thousands)) + 'tausend';
    }
    if (remainder > 0) {
      result += convertThreeDigits(remainder);
    }

    if (!result) result = 'null';
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return `${result} Euro${cents > 0 ? ` und ${cents}/100` : ''}`;
  };

  // Auto-sync price and mileage when chosen vehicle updates
  useEffect(() => {
    if (chosenVehicle) {
      setCustomPrice(chosenVehicle.sellingPrice || 0);
      setProbefahrtMileage(chosenVehicle.mileage || 0);
      
      // Sync Kaufvertrag vehicle defaults
      setKvBrand(chosenVehicle.brand || '');
      setKvModel(chosenVehicle.model || '');
      setKvVariant(chosenVehicle.variant || '');
      setKvVin(chosenVehicle.vin || '');
      setKvFirstRegistration(chosenVehicle.firstRegistration || '');
      setKvMileage(chosenVehicle.mileage || 0);
      setKvPowerKw(chosenVehicle.powerKw || Math.round((chosenVehicle.powerPs || 150) * 0.735));
      setKvPowerPs(chosenVehicle.powerPs || Math.round((chosenVehicle.powerKw || 110) * 1.36));
      setKvDisplacementCc(chosenVehicle.displacementCc);
      setKvColor(chosenVehicle.color || 'Schwarz');
      setKvPurchasePrice(chosenVehicle.sellingPrice || 0);
    }
  }, [chosenVehicle]);

  // Sync merchant default signature and city when settings load
  useEffect(() => {
    if (merchantSettings.signatureUrl) {
      setProbefahrtDealerSignature(merchantSettings.signatureUrl);
      setKvSellerSignature(merchantSettings.signatureUrl);
    }
    if (merchantSettings.city) {
      setKvPlace(merchantSettings.city);
    }
  }, [merchantSettings.signatureUrl, merchantSettings.city]);

  // Synchronize Gelangensbestätigung customer & destination details when chosen customer changes
  useEffect(() => {
    if (chosenCustomer) {
      setGelangensbestaetigungDetails(prev => ({
        ...prev,
        consigneeName: chosenCustomer.name || chosenCustomer.companyName || `${chosenCustomer.firstName || ''} ${chosenCustomer.lastName || ''}`.trim(),
        consigneeAddress: `${chosenCustomer.street || ''}, ${chosenCustomer.postalCode || ''} ${chosenCustomer.city || ''}, ${chosenCustomer.country || 'Polen'}`.trim(),
        consigneeVatId: chosenCustomer.vatId || prev.consigneeVatId || '',
        destinationMemberState: chosenCustomer.country || prev.destinationMemberState || 'Polen',
        destinationCity: chosenCustomer.city || prev.destinationCity || 'Warszawa',
        signatoryName: chosenCustomer.name || chosenCustomer.companyName || `${chosenCustomer.firstName || ''} ${chosenCustomer.lastName || ''}`.trim() || prev.signatoryName,
        placeOfIssue: chosenCustomer.city || prev.placeOfIssue || 'Warszawa'
      }));
    }
  }, [chosenCustomer]);

  // Synchronize default texts based on selected document
  useEffect(() => {
    setGreetingText(DocumentTextController.getDefaultText('welcome', selectedDocId));
    setWarrantyText(DocumentTextController.getDefaultText('warranty', selectedDocId));
    setExportText(DocumentTextController.getDefaultText('export', selectedDocId));
  }, [selectedDocId]);

  // Guarantee view scrolls to the very top immediately upon mounting, view state change, or modal opening
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [viewState, isDruckvorschauOpen, showXmlModal, isLagerDrawerOpen, isCustomerDrawerOpen, activeModalDot, showPaymentModal, isVehicleDetailModalOpen, activeKaufvertragSignTarget, activeUebergabeSignTarget]);

  // Handle Hub Document Click with Smart Session Memory & Flexible Bypass
  const handleSelectHubItem = (item: DocumentCircleItem) => {
    setSelectedDocId(item.id);

    // If both vehicle and customer are already present in session context -> Bypass wizard completely!
    if (chosenVehicle && chosenCustomer) {
      setViewState('document_view');
    } else if (chosenVehicle && !chosenCustomer) {
      // Vehicle is already known -> Prompt only for customer (Step 2 directly)
      setIsCustomerDrawerOpen(true);
    } else if (!chosenVehicle && chosenCustomer) {
      // Customer is already known -> Prompt only for vehicle (Step 1)
      setIsLagerDrawerOpen(true);
    } else {
      // Neither known -> Start regular 2-step wizard with vehicle first
      setIsLagerDrawerOpen(true);
    }
  };

  // Step 1: Vehicle chosen -> Context updated
  const handleSelectVehicleFromLager = (veh: Vehicle) => {
    setChosenVehicle(veh);
    setCustomPrice(veh.sellingPrice || 0);
    setIsLagerDrawerOpen(false);

    // If already in document view (e.g. glowing edit dot swap), stay in document view!
    if (viewState === 'document_view') {
      return;
    }

    // In Hub / Wizard mode:
    if (chosenCustomer) {
      // Customer is already stored -> Open pre-filled document immediately!
      setTimeout(() => {
        setViewState('document_view');
      }, 250);
    } else {
      // Customer still required -> Advance to Customer Drawer (Step 2)
      setTimeout(() => {
        setIsCustomerDrawerOpen(true);
      }, 250);
    }
  };

  // Step 2: Customer chosen -> Context updated
  const handleSelectCustomerFromDrawer = (cust: Customer) => {
    setChosenCustomer(cust);
    setIsCustomerDrawerOpen(false);

    // If already in document view (e.g. glowing edit dot swap), stay in document view!
    if (viewState === 'document_view') {
      return;
    }

    // In Hub / Wizard mode:
    if (chosenVehicle) {
      // Both ready -> Open pre-filled document view immediately
      setTimeout(() => {
        setViewState('document_view');
      }, 250);
    } else {
      // Vehicle still required (rare case where customer drawer was opened first) -> Open vehicle drawer
      setTimeout(() => {
        setIsLagerDrawerOpen(true);
      }, 250);
    }
  };

  // Document Serial Number
  const docNumber = generateDocumentSerial(selectedDocId, docDate);
  const activeDocItem = DOCUMENT_HUB_ITEMS.find(d => d.id === selectedDocId) || DOCUMENT_HUB_ITEMS[0];

  // Vehicles items structure for calculations
  const vehicleItems: OperationVehicleItem[] = chosenVehicle ? [{
    id: chosenVehicle.id || 'pos-1',
    vin: chosenVehicle.vin || '',
    brand: chosenVehicle.brand || '',
    model: chosenVehicle.model || '',
    variant: chosenVehicle.variant || '',
    mileage: chosenVehicle.mileage || 0,
    listPrice: customPrice,
    sellingPrice: customPrice,
    discountAmount: 0,
    taxType: chosenVehicle.taxType || 'diff_25a',
    color: chosenVehicle.color,
    firstRegistration: chosenVehicle.firstRegistration,
    powerKw: chosenVehicle.powerKw,
    powerPs: chosenVehicle.powerPs,
    fuelType: chosenVehicle.fuelType
  }] : [{
    id: 'pos-1',
    vin: '',
    brand: 'Fahrzeug',
    model: '',
    mileage: 0,
    listPrice: customPrice,
    sellingPrice: customPrice,
    discountAmount: 0,
    taxType: 'diff_25a'
  }];

  // Accurate tax calculations
  const calc = calculateDocumentTaxes(selectedDocId, vehicleItems, depositAmount, sondervereinbarung, merchantSettings?.vatRate);
  const isMarginScheme = chosenVehicle ? chosenVehicle.taxType === 'diff_25a' : (merchantSettings.defaultTaxation === 'diff_25a');

  // Specialized details for Kaufvertrag (Step 24)
  const defaultDealerParty: KaufvertragParty = {
    type: 'dealer',
    companyName: merchantSettings.companyName || 'MaxFleet Autohandelsgruppe',
    name: merchantSettings.responsiblePerson || merchantSettings.companyName || 'Inhaber / Geschäftsleitung',
    street: merchantSettings.street || 'Bonner Straße 12',
    postalCode: merchantSettings.postalCode || '53111',
    city: merchantSettings.city || 'Bonn',
    country: merchantSettings.country || 'Deutschland',
    phone: merchantSettings.phone || '+49 228 98765-0',
    email: merchantSettings.email || 'info@maxfleet.de'
  };

  const defaultCustomerParty: KaufvertragParty = {
    type: chosenCustomer?.type === 'B2B' ? 'customer' : 'customer',
    companyName: chosenCustomer?.companyName || '',
    name: chosenCustomer ? (chosenCustomer.name || chosenCustomer.companyName || 'Käufer') : 'Kunde / Erwerber',
    street: chosenCustomer?.street || '',
    postalCode: chosenCustomer?.postalCode || chosenCustomer?.zip || '',
    city: chosenCustomer?.city || '',
    country: chosenCustomer?.country || 'Deutschland',
    phone: chosenCustomer?.phone || chosenCustomer?.mobile || '',
    email: chosenCustomer?.email || ''
  };

  const actualKvSeller: KaufvertragParty = {
    ...(kvContractMode === 'verkauf' ? defaultDealerParty : defaultCustomerParty),
    ...kvSellerOverride
  };

  const actualKvBuyer: KaufvertragParty = {
    ...(kvContractMode === 'verkauf' ? defaultCustomerParty : defaultDealerParty),
    ...kvBuyerOverride
  };

  const kaufvertragDetails: KaufvertragDetails = {
    contractMode: kvContractMode,
    seller: actualKvSeller,
    buyer: actualKvBuyer,
    vin: kvVin || chosenVehicle?.vin || '',
    brand: kvBrand || chosenVehicle?.brand || '',
    model: kvModel || chosenVehicle?.model || '',
    variant: kvVariant || chosenVehicle?.variant || '',
    firstRegistration: kvFirstRegistration || chosenVehicle?.firstRegistration || '',
    mileage: kvMileage !== undefined ? kvMileage : (chosenVehicle?.mileage || 0),
    nextHuDate: kvNextHuDate,
    nextAuDate: kvNextAuDate,
    licensePlate: kvLicensePlate,
    powerKw: kvPowerKw,
    powerPs: kvPowerPs,
    displacementCc: kvDisplacementCc,
    color: kvColor,
    previousOwnersCount: kvPreviousOwnersCount,
    handoverDate: deliveryDate,
    purchasePrice: kvPurchasePrice || customPrice,
    paymentMethod: kvPaymentMethod,
    depositAmount: kvDepositAmount,
    hasKfzBrief: kvHasKfzBrief,
    kfzBriefNumber: kvKfzBriefNumber,
    hasKfzSchein: kvHasKfzSchein,
    hasHuAuBericht: kvHasHuAuBericht,
    keysCount: kvKeysCount,
    hasLicensePlates: kvHasLicensePlates,
    hasDeregistrationDoc: kvHasDeregistrationDoc,
    ownershipConfirmed: kvOwnershipConfirmed,
    isAccidentFree: kvIsAccidentFree,
    knownDamages: kvKnownDamages,
    isReImport: kvIsReImport,
    reImportCountry: kvReImportCountry,
    usageType: kvUsageType,
    commercialUsageNotes: kvCommercialUsageNotes,
    isOriginalEngine: kvIsOriginalEngine,
    engineMileageKm: kvEngineMileageKm,
    warrantyType: kvWarrantyType,
    warrantyCustomNotes: kvWarrantyCustomNotes,
    reRegistrationDeadlineDays: kvReRegistrationDeadlineDays,
    reRegistrationDeadlineDate: kvReRegistrationDeadlineDate,
    retentionOfTitleAccepted: true,
    specialAgreements: kvSpecialAgreements || sondervereinbarung,
    place: kvPlace,
    contractDate: kvContractDate || docDate,
    sellerSignature: kvSellerSignature,
    buyerSignature: kvBuyerSignature
  };

  const handleUpdateKaufvertragField = (field: keyof KaufvertragDetails, value: any) => {
    switch (field) {
      case 'brand': setKvBrand(value); break;
      case 'model': setKvModel(value); break;
      case 'variant': setKvVariant(value); break;
      case 'vin': setKvVin(value); break;
      case 'firstRegistration': setKvFirstRegistration(value); break;
      case 'mileage': setKvMileage(value); break;
      case 'nextHuDate': setKvNextHuDate(value); break;
      case 'nextAuDate': setKvNextAuDate(value); break;
      case 'licensePlate': setKvLicensePlate(value); break;
      case 'powerKw': setKvPowerKw(value); break;
      case 'powerPs': setKvPowerPs(value); break;
      case 'displacementCc': setKvDisplacementCc(value); break;
      case 'color': setKvColor(value); break;
      case 'previousOwnersCount': setKvPreviousOwnersCount(value); break;
      case 'purchasePrice': 
        setKvPurchasePrice(value);
        setCustomPrice(value);
        break;
      case 'paymentMethod': setKvPaymentMethod(value); break;
      case 'depositAmount': setKvDepositAmount(value); break;
      case 'hasKfzBrief': setKvHasKfzBrief(value); break;
      case 'kfzBriefNumber': setKvKfzBriefNumber(value); break;
      case 'hasKfzSchein': setKvHasKfzSchein(value); break;
      case 'hasHuAuBericht': setKvHasHuAuBericht(value); break;
      case 'keysCount': setKvKeysCount(value); break;
      case 'hasLicensePlates': setKvHasLicensePlates(value); break;
      case 'hasDeregistrationDoc': setKvHasDeregistrationDoc(value); break;
      case 'ownershipConfirmed': setKvOwnershipConfirmed(value); break;
      case 'isAccidentFree': setKvIsAccidentFree(value); break;
      case 'knownDamages': setKvKnownDamages(value); break;
      case 'isReImport': setKvIsReImport(value); break;
      case 'reImportCountry': setKvReImportCountry(value); break;
      case 'usageType': setKvUsageType(value); break;
      case 'commercialUsageNotes': setKvCommercialUsageNotes(value); break;
      case 'isOriginalEngine': setKvIsOriginalEngine(value); break;
      case 'engineMileageKm': setKvEngineMileageKm(value); break;
      case 'warrantyType': setKvWarrantyType(value); break;
      case 'warrantyCustomNotes': setKvWarrantyCustomNotes(value); break;
      case 'reRegistrationDeadlineDays': setKvReRegistrationDeadlineDays(value); break;
      case 'reRegistrationDeadlineDate': setKvReRegistrationDeadlineDate(value); break;
      case 'specialAgreements': 
        setKvSpecialAgreements(value);
        setSondervereinbarung(value);
        break;
      case 'place': setKvPlace(value); break;
      case 'contractDate': setKvContractDate(value); break;
      case 'sellerSignature': setKvSellerSignature(value); break;
      case 'buyerSignature': setKvBuyerSignature(value); break;
      default:
        break;
    }
  };

  const handleUpdateKaufvertragSeller = (field: keyof KaufvertragParty, value: any) => {
    setKvSellerOverride((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateKaufvertragBuyer = (field: keyof KaufvertragParty, value: any) => {
    setKvBuyerOverride((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwapKaufvertragParties = () => {
    setKvContractMode((prev) => (prev === 'verkauf' ? 'ankauf' : 'verkauf'));
    // Reset overrides to cleanly let default swapped data take place
    setKvSellerOverride({});
    setKvBuyerOverride({});
  };

  const handleSelectWarrantyTemplate = (type: 'b2c_haendler_12m' | 'gewerblich_ausschluss' | 'privat_ausschluss' | 'herstellergarantie') => {
    setKvWarrantyType(type);
    if (type === 'b2c_haendler_12m') {
      setKvWarrantyCustomNotes('Für dieses gebrauchte Fahrzeug gilt die gesetzliche Sachmängelhaftung von 12 Monaten ab Übergabe gem. § 476 BGB. Verschleißteile und natürliche Abnutzung sind ausgeschlossen.');
    } else if (type === 'gewerblich_ausschluss') {
      setKvWarrantyCustomNotes('Der Verkauf erfolgt unter vollständigem Ausschluss jeglicher Sachmängelhaftung, soweit gesetzlich zulässig (B2B / Export / Händler- oder Gewerbegeschäft).');
    } else if (type === 'privat_ausschluss') {
      setKvWarrantyCustomNotes('Der Verkauf erfolgt unter Ausschluss jeglicher Sachmängelhaftung von Privatperson an Privatperson gem. § 444 BGB.');
    } else if (type === 'herstellergarantie') {
      setKvWarrantyCustomNotes('Herstellergarantie vorhanden und auf den Erwerber übertragbar.');
    }
  };

  const calculateProbefahrtReturnTime = (start: string, durationMin: number): string => {
    try {
      const [h, m] = (start || '10:00').split(':').map(Number);
      const totalMin = (h || 0) * 60 + (m || 0) + (durationMin || 30);
      const returnH = Math.floor(totalMin / 60) % 24;
      const returnM = totalMin % 60;
      return `${String(returnH).padStart(2, '0')}:${String(returnM).padStart(2, '0')}`;
    } catch {
      return '10:30';
    }
  };

  const probefahrtDetails: ProbefahrtDetails = {
    driverName: chosenCustomer ? (chosenCustomer.name || chosenCustomer.companyName || 'Probefahrer') : 'Interessent',
    driverStreet: chosenCustomer?.street || '',
    driverPostalCode: chosenCustomer?.postalCode || chosenCustomer?.zip || '',
    driverCity: chosenCustomer?.city || '',
    driverPhone: chosenCustomer?.phone || chosenCustomer?.mobile || '',
    driverEmail: chosenCustomer?.email || '',
    drivingLicenseNumber: drivingLicenseNumber,
    drivingLicenseClasses: 'B',
    vin: chosenVehicle?.vin || '',
    brand: chosenVehicle?.brand || '',
    model: chosenVehicle?.model || '',
    variant: chosenVehicle?.variant || '',
    color: chosenVehicle?.color || 'Schwarz',
    firstRegistration: chosenVehicle?.firstRegistration || '',
    mileageStart: probefahrtMileage || chosenVehicle?.mileage || 0,
    fuelLevelStart: probefahrtFuelLevel,
    redLicensePlate: probefahrtPlate,
    durationMinutes: probefahrtDuration,
    startTime: probefahrtStartTime,
    expectedReturnTime: calculateProbefahrtReturnTime(probefahrtStartTime, probefahrtDuration),
    routeLimitKm: probefahrtRouteLimit,
    depositAmount: probefahrtDeposit,
    liabilityDeductible: probefahrtDeductible,
    notes: probefahrtCustomLiability,
    driverSignature: probefahrtDriverSignature,
    dealerSignature: probefahrtDealerSignature,
    disclaimersAccepted: {
      stvoRules: true,
      noThirdParty: true,
      zeroAlcohol: true,
      deductibleAgreed: true,
      returnOnTime: true,
      trafficFineLiability: true,
      mileageChecked: true
    },
    place: merchantSettings.city || 'Bonn',
    date: docDate
  };

  // Synchronize damage points directly from Lager / chosenVehicle.damageEntries (Step 25 & 26)
  const syncedUebergabeDamagePoints: DamageMapPoint[] = (chosenVehicle?.damageEntries || []).map((dmg, idx) => {
    let cat: DamageCategoryCode = 'D1';
    const sev = (dmg.severity || '').toLowerCase().trim();
    if (sev === 'd4' || sev.includes('schwer') || sev.includes('unfall') || sev.includes('groß') || sev.includes('karosserie')) cat = 'D4';
    else if (sev === 'd3' || sev.includes('mittel')) cat = 'D3';
    else if (sev === 'd2' || sev.includes('leicht') || sev.includes('klein') || sev.includes('<1cm')) cat = 'D2';
    else cat = 'D1';

    return {
      id: dmg.id || `dmg-${idx + 1}`,
      x: 50,
      y: 50,
      view: 'front',
      category: cat,
      title: dmg.part || 'Vorschaden',
      description: `${dmg.damageType || 'Beschädigung'}${dmg.description ? ': ' + dmg.description : ''}${dmg.repaired ? ' (Fachgerecht instandgesetzt)' : ' (Offen / Unrepariert)'}`
    };
  });

  // Synchronize vehicle equipment & features
  const vehicleFeatures = chosenVehicle?.features || [];
  const hasCentralLocking = vehicleFeatures.some(f => /zentralverriegelung|keyless|funk/i.test(f)) || true;
  const hasPowerWindows = vehicleFeatures.some(f => /fensterheber|elektr/i.test(f)) || true;
  const hasSunroof = vehicleFeatures.some(f => /schiebedach|panoramadach|glasdach/i.test(f));
  const hasPdc = vehicleFeatures.some(f => /pdc|parksensor|park-distanz|einparkhilfe/i.test(f)) || true;
  const hasCamera = vehicleFeatures.some(f => /kamera|surround|rückfahr/i.test(f));
  const hasSecondTireSet = vehicleFeatures.some(f => /winterräder|8-fach|satz räder/i.test(f));

  // Check visual / mechanical condition from vehicle
  const mechCond = chosenVehicle?.conditionMechanical;
  const visualCond = chosenVehicle?.conditionVisual;

  const uebergabeprotokollDetails: UebergabeprotokollDetails = {
    protocolDate: docDate,
    protocolTime: '10:00',
    sellerName: merchantSettings.responsiblePerson || 'Geschäftsleitung',
    sellerCompany: merchantSettings.companyName || 'MaxFleet Autohandel',
    sellerPhone: merchantSettings.phone || '+49 228 98765-0',
    buyerName: chosenCustomer ? (chosenCustomer.name || chosenCustomer.companyName || 'Kunde') : 'Kunde',
    buyerCompany: chosenCustomer?.companyName,
    buyerPhone: chosenCustomer?.phone || chosenCustomer?.mobile || '-',
    buyerStreet: chosenCustomer?.street || 'Musterstraße 1',
    buyerPostalCode: chosenCustomer?.postalCode || chosenCustomer?.zip || '10115',
    buyerCity: chosenCustomer?.city || 'Berlin',
    vin: chosenVehicle?.vin || '',
    brand: chosenVehicle?.brand || '',
    model: chosenVehicle?.model || '',
    variant: chosenVehicle?.variant || '',
    licensePlate: chosenVehicle ? 'B-MF 2026' : 'Abgemeldet',
    color: chosenVehicle?.color || 'Schwarz',
    firstRegistration: chosenVehicle?.firstRegistration || '',
    powerPs: chosenVehicle?.powerPs,
    powerKw: chosenVehicle?.powerKw,
    fuelType: chosenVehicle?.fuelType || 'Benzin',
    mileage: chosenVehicle?.mileage || 0,
    fuelLevel: uebergabeFuelLevel,
    keysCount: uebergabeKeysCount,
    externalInspection: {
      bumperFront: uebergabeExternalOverrides.bumperFront || { status: 'ok', note: visualCond?.paintCondition || 'Ohne Befund' },
      bumperRear: uebergabeExternalOverrides.bumperRear || { status: 'ok', note: 'Ohne Befund' },
      grille: uebergabeExternalOverrides.grille || { status: 'ok', note: 'Einwandfrei' },
      hood: uebergabeExternalOverrides.hood || { status: 'ok', note: 'Gepflegt' },
      fendersFront: uebergabeExternalOverrides.fendersFront || { status: 'ok', note: 'Ohne Befund' },
      fendersRear: uebergabeExternalOverrides.fendersRear || { status: 'ok', note: 'Ohne Befund' },
      doorsLeft: uebergabeExternalOverrides.doorsLeft || { status: 'ok', note: 'Einwandfrei' },
      doorsRight: uebergabeExternalOverrides.doorsRight || { status: 'ok', note: 'Einwandfrei' },
      pillars: uebergabeExternalOverrides.pillars || { status: 'ok', note: 'Ohne Befund' },
      roof: uebergabeExternalOverrides.roof || { status: 'ok', note: 'Einwandfrei' },
      trunkLid: uebergabeExternalOverrides.trunkLid || { status: 'ok', note: 'Ohne Befund' },
      windshield: uebergabeExternalOverrides.windshield || { status: 'ok', note: 'Kein Steinschlag' },
      sideRearWindows: uebergabeExternalOverrides.sideRearWindows || { status: 'ok', note: 'Einwandfrei' },
      headlights: uebergabeExternalOverrides.headlights || { status: 'ok', note: 'Funktionsfähig' },
      taillightsTurnSignals: uebergabeExternalOverrides.taillightsTurnSignals || { status: 'ok', note: 'Funktionsfähig' }
    },
    tires: {
      tireType: 'Sommer',
      frontLeftMm: mechCond?.tireDepthMm || 6.5,
      frontRightMm: mechCond?.tireDepthMm || 6.5,
      rearLeftMm: mechCond?.tireDepthMm ? Math.max(2.0, Number((mechCond.tireDepthMm - 0.5).toFixed(1))) : 6.0,
      rearRightMm: mechCond?.tireDepthMm ? Math.max(2.0, Number((mechCond.tireDepthMm - 0.5).toFixed(1))) : 6.0,
      spareWheel: 'Pannenset',
      rimsCondition: 'ok',
      rimType: 'Alufelgen'
    },
    interiorInspection: {
      seatsUpholstery: uebergabeInteriorOverrides.seatsUpholstery || { status: 'ok', note: visualCond?.interiorCondition || 'Sehr gepflegt' },
      steeringWheel: uebergabeInteriorOverrides.steeringWheel || { status: 'ok', note: 'Gepflegt' },
      dashboardCockpit: uebergabeInteriorOverrides.dashboardCockpit || { status: 'ok', note: 'Ohne Kratzer' },
      infotainmentNavi: uebergabeInteriorOverrides.infotainmentNavi || { status: 'ok', note: 'Funktionsfähig' },
      airConditioning: uebergabeInteriorOverrides.airConditioning || { status: 'ok', note: 'Kühlt einwandfrei' },
      heatingVentilation: uebergabeInteriorOverrides.heatingVentilation || { status: 'ok', note: 'Funktionsfähig' },
      seatbelts: uebergabeInteriorOverrides.seatbelts || { status: 'ok', note: 'Alle Plätze geprüft' },
      floorMats: uebergabeInteriorOverrides.floorMats || { status: 'ok', note: 'Vorhanden' },
      headliner: uebergabeInteriorOverrides.headliner || { status: 'ok', note: 'Sauber' },
      mirrors: uebergabeInteriorOverrides.mirrors || { status: 'ok', note: 'Elektr. verstellbar' }
    },
    additionalEquipment: {
      keysCountCheck: { present: true, count: uebergabeKeysCount, status: 'ok' },
      centralLocking: uebergabeEquipmentOverrides.centralLocking || { present: hasCentralLocking, status: 'ok' },
      powerWindows: uebergabeEquipmentOverrides.powerWindows || { present: hasPowerWindows, status: 'ok' },
      sunroof: uebergabeEquipmentOverrides.sunroof || { present: hasSunroof, status: 'ok' },
      parkingSensorsPdc: uebergabeEquipmentOverrides.parkingSensorsPdc || { present: hasPdc, status: 'ok' },
      backupCamera: uebergabeEquipmentOverrides.backupCamera || { present: hasCamera, status: 'ok' },
      secondTireSet: uebergabeEquipmentOverrides.secondTireSet || { present: hasSecondTireSet, status: 'ok' },
      firstAidWarningTriangle: uebergabeEquipmentOverrides.firstAidWarningTriangle || { present: true, status: 'ok' },
      onboardTools: uebergabeEquipmentOverrides.onboardTools || { present: true, status: 'ok' }
    },
    mechanicalInspection: {
      engineStartIdle: uebergabeMechanicalOverrides.engineStartIdle || { status: 'ok', note: mechCond?.engine || 'Ruhiger Lauf & trocken' },
      transmissionGearbox: uebergabeMechanicalOverrides.transmissionGearbox || { status: 'ok', note: mechCond?.transmission || 'Schaltet präzise' },
      clutch: uebergabeMechanicalOverrides.clutch || { status: 'ok', note: 'Kraftschluss einwandfrei' },
      brakesHandbrake: uebergabeMechanicalOverrides.brakesHandbrake || { status: 'ok', note: mechCond?.brakesTires || 'Beläge & Scheiben gut' },
      steeringHandling: uebergabeMechanicalOverrides.steeringHandling || { status: 'ok', note: 'Präzise Spurtreue' },
      suspensionShockAbsorbers: uebergabeMechanicalOverrides.suspensionShockAbsorbers || { status: 'ok', note: 'Dicht & straff' },
      exhaustSystem: uebergabeMechanicalOverrides.exhaustSystem || { status: 'ok', note: 'Dicht' },
      oilCoolantLevels: uebergabeMechanicalOverrides.oilCoolantLevels || { status: 'ok', note: 'Auf Sollstand' },
      starterBattery: uebergabeMechanicalOverrides.starterBattery || { status: 'ok', note: 'Geprüft & voll' },
      cockpitWarningLights: uebergabeMechanicalOverrides.cockpitWarningLights || { status: 'ok', note: 'Alle Kontrollleuchten erloschen' }
    },
    damagePoints: syncedUebergabeDamagePoints,
    associatedDocuments: {
      huValidityDate: mechCond?.tuvDate || docDate,
      hasKfzBrief: uebergabeDocumentsOverrides.hasKfzBrief !== false,
      hasKfzSchein: uebergabeDocumentsOverrides.hasKfzSchein !== false,
      hasServiceBook: uebergabeDocumentsOverrides.hasServiceBook !== false,
      hasCoCDocument: uebergabeDocumentsOverrides.hasCoCDocument !== false,
      hasPreviousInvoice: uebergabeDocumentsOverrides.hasPreviousInvoice !== false,
      hasDeregistrationDoc: uebergabeDocumentsOverrides.hasDeregistrationDoc ?? false,
      hasManuals: uebergabeDocumentsOverrides.hasManuals !== false
    },
    photoAttachments: [],
    generalNotes: sondervereinbarung,
    receiptDeclarationConfirmed: true,
    place: merchantSettings.city || 'Bonn',
    handoverDate: docDate,
    buyerSignature: uebergabeBuyerSignature,
    sellerSignature: uebergabeSellerSignature
  };

  // Übergabeprotokoll Interactive Handlers (Step 25)
  const handleToggleUebergabeCheckItem = (
    section: 'external' | 'interior' | 'mechanical' | 'equipment' | 'documents',
    key: string,
    status?: any,
    note?: string
  ) => {
    if (section === 'external') {
      setUebergabeExternalOverrides(prev => ({
        ...prev,
        [key]: { status: status || 'ok', note }
      }));
    } else if (section === 'interior') {
      setUebergabeInteriorOverrides(prev => ({
        ...prev,
        [key]: { status: status || 'ok', note }
      }));
    } else if (section === 'mechanical') {
      setUebergabeMechanicalOverrides(prev => ({
        ...prev,
        [key]: { status: status || 'ok', note }
      }));
    } else if (section === 'equipment') {
      setUebergabeEquipmentOverrides(prev => ({
        ...prev,
        [key]: { present: status !== false }
      }));
    } else if (section === 'documents') {
      setUebergabeDocumentsOverrides(prev => ({
        ...prev,
        [key]: status !== false
      }));
    }
  };

  const handleUpdateUebergabeField = (field: string, value: any) => {
    if (field === 'fuelLevel') setUebergabeFuelLevel(value);
    else if (field === 'keysCount') setUebergabeKeysCount(value);
    else if (field === 'handoverDate') setDeliveryDate(value);
  };

  const handleClearUebergabeSignature = (type: 'buyer' | 'seller') => {
    if (type === 'buyer') setUebergabeBuyerSignature('');
    else setUebergabeSellerSignature('');
  };

  // Payment Modal Handlers
  const handleOpenPaymentModal = () => {
    if (provisionalPayment) {
      setPaymentAmountInput(provisionalPayment.amount);
      setPaymentDateInput(provisionalPayment.date);
      setPaymentMethodInput((provisionalPayment.paymentMethod as any) || 'Barzahlung');
      setPaymentNotesInput(provisionalPayment.notes || '');
    } else {
      setPaymentAmountInput(calc.totalGross);
      setPaymentDateInput(todayStr);
      setPaymentMethodInput('Barzahlung');
      setPaymentNotesInput(`Zahlungseingang zu Rechnung ${docNumber}`);
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    const amount = Number(paymentAmountInput) || 0;
    if (amount <= 0) return;

    const payment: InvoicePayment = {
      id: `pay-${Date.now()}`,
      amount: amount,
      paymentMethod: paymentMethodInput,
      date: paymentDateInput,
      receiptNumber: `QUT-${docNumber.replace(/[^0-9]/g, '') || String(Date.now()).slice(-6)}`,
      recordedBy: merchantSettings.responsiblePerson || 'Geschäftsleitung',
      notes: paymentNotesInput
    };

    setProvisionalPayment(payment);
    setShowPaymentModal(false);
  };

  // Handle Save Document
  const handleSaveDocument = async () => {
    setIsSaving(true);
    try {
      if (selectedDocId === 'kaufvertrag' || selectedDocId === 'probefahrt' || selectedDocId === 'uebergabeprotokoll') {
        const opDoc: OperationDocument = {
          id: `op-${selectedDocId}-${Date.now()}`,
          documentType: selectedDocId,
          documentNumber: docNumber,
          date: docDate,
          dueDate: paymentTerms,
          customer: chosenCustomer || undefined,
          isManualCustomer: !chosenCustomer,
          vehicles: vehicleItems,
          totalNet: calc.totalNet,
          totalTax: calc.totalTax,
          totalGross: calc.totalGross,
          paymentMethod: 'Überweisung',
          status: 'abgeschlossen',
          notes: sondervereinbarung,
          createdAt: new Date().toISOString()
        };
        await firebaseService.saveOperation(opDoc, false);
      } else {
        const paidAmount = provisionalPayment ? provisionalPayment.amount : 0;
        const invStatus: 'bezahlt' | 'offen' | 'teilbezahlt' = paidAmount >= calc.totalGross ? 'bezahlt' : (paidAmount > 0 ? 'teilbezahlt' : 'offen');

        const newInvoice: Invoice = {
          id: `inv-${Date.now()}`,
          invoiceNumber: docNumber,
          date: docDate,
          dueDate: paymentTerms,
          documentType: selectedDocId,
          invoiceCategory: selectedDocId === 'eu_export' ? 'eu_export' : selectedDocId === 'export_drittland' ? 'export_drittland' : selectedDocId === 'e_rechnung' ? 'e_rechnung' : 'rechnung',
          customerName: chosenCustomer ? (chosenCustomer.name || chosenCustomer.companyName || 'Kunde') : 'Barverkauf',
          customerType: chosenCustomer?.type || 'B2C',
          customerStreet: chosenCustomer?.street,
          customerPostalCode: chosenCustomer?.postalCode,
          customerCity: chosenCustomer?.city,
          customerPhone: chosenCustomer?.phone,
          customerEmail: chosenCustomer?.email,
          vehicleTitle: chosenVehicle ? `${chosenVehicle.brand} ${chosenVehicle.model || ''}`.trim() : 'Fahrzeug',
          vin: chosenVehicle?.vin || '',
          amountNet: calc.totalNet,
          taxAmount: calc.totalTax,
          amountGross: calc.totalGross,
          amountPaid: paidAmount,
          taxType: isMarginScheme ? 'diff_25a' : 'standard_19',
          status: invStatus,
          paymentMethod: provisionalPayment ? (provisionalPayment.paymentMethod === 'Barzahlung' ? 'Bar' : provisionalPayment.paymentMethod === 'Kartenzahlung' ? 'Kartenzahlung' : 'Überweisung') : 'Überweisung',
          payments: provisionalPayment ? [provisionalPayment] : [],
          notes: `${greetingText}\n\nGewährleistung: ${warrantyText}\n\nSondervereinbarung: ${sondervereinbarung}`.trim()
        };
        await firebaseService.saveInvoice(newInvoice);

        // Book to cash register / Kasse or Bank if provisional payment was confirmed
        if (provisionalPayment && provisionalPayment.amount > 0) {
          const isCash = provisionalPayment.paymentMethod === 'Barzahlung';
          firebaseService.addFinancialBooking({
            type: 'einnahme',
            account: isCash ? 'Kasse' : 'Bank',
            amount: provisionalPayment.amount,
            category: 'Fahrzeugverkauf / Erlöse',
            description: `Zahlungseingang (${provisionalPayment.paymentMethod}) zu Rechnung ${docNumber} - ${chosenVehicle ? chosenVehicle.brand + ' ' + chosenVehicle.model : 'Fahrzeug'}`,
            taxRate: isMarginScheme ? '0%' : '19%',
            recordedBy: merchantSettings.responsiblePerson || 'Geschäftsleitung',
            receiptNumber: provisionalPayment.receiptNumber || `QUT-${docNumber}`
          });
        }
      }

      setSaveToast(`${getDocumentTypeLabel(selectedDocId)} ${docNumber} ${provisionalPayment ? 'inkl. Quittung & Kassenbuchung ' : ''}erfolgreich gespeichert!`);
      setTimeout(() => setSaveToast(null), 4500);
    } catch (err) {
      console.error('Error saving operation document', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if current document is an invoice type that supports payments & Quittung
  const isInvoiceDoc = selectedDocId === 'rechnung' || selectedDocId === 'e_rechnung' || selectedDocId === 'eu_export' || selectedDocId === 'export_drittland';

  // Get formal heading for clean PDF
  const getDocHeading = () => {
    if (isMarginScheme && (selectedDocId === 'eu_export' || selectedDocId === 'export_drittland')) {
      return 'RECHNUNG (§ 25a UStG)';
    }
    switch (selectedDocId) {
      case 'angebot': return 'ANGEBOT';
      case 'rechnung': return 'HANDELSRECHNUNG';
      case 'e_rechnung': return 'E-RECHNUNG (EN 16931)';
      case 'eu_export': return 'EU-EXPORTRECHNUNG (STEUERFREI)';
      case 'export_drittland': return 'DRITTLANDRECHNUNG (AUSFUHR)';
      case 'kaufvertrag': return 'VERBINDLICHER KAUFVERTRAG';
      case 'probefahrt': return 'PROBEFAHRT-VEREINBARUNG';
      case 'uebergabeprotokoll': return 'ÜBERGABEPROTOKOLL';
      default: return 'RECHNUNG';
    }
  };

  // Tax paragraph text
  const getTaxLegalParagraph = () => {
    if (isMarginScheme) {
      return {
        title: 'Sonderregelung Differenzbesteuerung gem. § 25a UStG',
        text: 'Gebrauchtgegenstände / Sonderregelung: Die Besteuerung erfolgt nach § 25a UStG (Differenzbesteuerung). Ein gesonderter Ausweis der Umsatzsteuer auf der Rechnung ist gesetzlich ausgeschlossen. Ein Vorsteuerabzug ist für den Erwerber nicht möglich.'
      };
    }
    if (selectedDocId === 'eu_export') {
      return {
        title: 'Steuerfreie innergemeinschaftliche Lieferung gem. § 4 Nr. 1b i.V.m. § 6a UStG',
        text: `Steuerfreie innergemeinschaftliche Fahrzeuglieferung. Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge). Bestimmungsland: ${chosenCustomer?.country || 'EU-Mitgliedstaat'}. USt-IdNr. des Erwerbers: ${chosenCustomer?.vatId || 'Geprüft & Gültig'}. Verbringungsnachweis / Gelangensbestätigung wird archiviert.`
      };
    }
    if (selectedDocId === 'export_drittland') {
      return {
        title: 'Steuerfreie Ausfuhrlieferung in das Drittland gem. § 4 Nr. 1a i.V.m. § 6 UStG',
        text: `Steuerfreie Ausfuhrlieferung in das Drittland (${chosenCustomer?.country || 'Drittland'}). Der Nachweis der Ausfuhr aus dem Zollgebiet der Europäischen Union erfolgt über das elektronische Ausfuhrverfahren ATLAS (Ausgangsvermerk).`
      };
    }
    if (selectedDocId === 'e_rechnung') {
      return {
        title: 'Elektronische Rechnung gem. EN 16931 & E-Rechnungsverordnung',
        text: 'Die Rechnung wurde digital strukturiert nach europäischen Standards erstellt und archiviert.'
      };
    }
    if (selectedDocId === 'angebot') {
      return {
        title: 'Freibleibendes Angebot',
        text: `Dieses Angebot ist freibleibend und unverbindlich. Preisbindung bis einschließlich ${docDate}. Zwischenverkauf, technische Änderungen und Irrtümer vorbehalten.`
      };
    }
    return {
      title: 'Regelbesteuerung (19% Umsatzsteuer)',
      text: 'Die ausgewiesenen Leistungen unterliegen der regulären gesetzlichen Umsatzsteuer von 19%. Steuerschuldner ist der leistende Unternehmer.'
    };
  };

  const taxParagraph = getTaxLegalParagraph();
  const windowEnvelopeReturnLine = `${merchantSettings.companyName || 'MaxFleet Autohandel'} · ${merchantSettings.street || 'Bonner Straße 12'} · ${merchantSettings.postalCode || '53111'} ${merchantSettings.city || 'Bonn'}`;

  // Minimalist Glowing Yellow Dot Component (Strictly ZERO text, pure visual marker)
  const GlowingEditDot: React.FC<{
    onClick: () => void;
    title: string;
    className?: string;
  }> = ({ onClick, title, className = '' }) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={`group relative flex items-center justify-center p-1 rounded-full cursor-pointer print:hidden select-none outline-none focus:outline-none transition-transform hover:scale-135 ${className}`}
    >
      {/* Outer Pulse Arc */}
      <span className="absolute w-4 h-4 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
      {/* Inner Glowing Green Dot */}
      <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-200 shadow-[0_0_8px_#10b981] group-hover:bg-emerald-300 group-hover:shadow-[0_0_14px_#34d399] transition-all" />
    </button>
  );

  // Fetch pre-saved templates from global Settings
  const welcomeTemplates: TextTemplate[] = DocumentTextController.getTemplatesByCategory('welcome');
  const warrantyTemplates: TextTemplate[] = DocumentTextController.getTemplatesByCategory('warranty');
  const exportTemplates: TextTemplate[] = DocumentTextController.getTemplatesByCategory('export');

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-start">
      <div 
        id="operationen-root" 
        className="relative min-h-[calc(100vh-140px)] w-full flex flex-col items-center justify-center text-slate-100 select-none pb-16 animate-in fade-in duration-300"
      >
      {/* Save Success Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 z-[9999] px-5 py-3 rounded-2xl metallic-card-luminous border border-slate-400/80 text-white shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 backdrop-blur-xl print:hidden"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 metallic-debossed-icon" />
            <span className="text-sm font-bold tracking-wide">{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* VIEW 1: EXACT HUB ICON DISPLAY (CIRCULAR ORBITAL ARENA)                   */}
      {/* ========================================================================= */}
      {viewState === 'hub' && (
        <div className="relative w-full max-w-5xl px-4 py-4 sm:py-8 flex flex-col items-center justify-center my-auto">
          
          {/* Smart Session Context Banner (CNC-Milled Brushed Aluminum / Stainless Steel Look) */}
          {(chosenVehicle || chosenCustomer) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 px-4 py-3 rounded-2xl metallic-card-luminous border border-slate-500/60 shadow-[0_12px_32px_rgba(0,0,0,0.7)] flex flex-wrap items-center justify-between gap-3 text-xs max-w-xl w-full backdrop-blur-md"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                  Aktive Sitzung:
                </span>
                
                {chosenVehicle ? (
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold px-2.5 py-1 rounded-lg metallic-inner-subbox border border-emerald-400/30">
                    <Car className="w-3.5 h-3.5 metallic-debossed-icon" />
                    <span className="truncate max-w-[150px]">{chosenVehicle.brand} {chosenVehicle.model}</span>
                    <button 
                      type="button" 
                      onClick={() => setIsLagerDrawerOpen(true)}
                      className="text-[10px] text-cyan-400 hover:text-white underline cursor-pointer ml-0.5 font-semibold"
                      title="Fahrzeug wechseln"
                    >
                      wechseln
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setIsLagerDrawerOpen(true)}
                    className="metallic-btn-secondary flex items-center gap-1 text-slate-300 hover:text-white transition cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold"
                  >
                    <Car className="w-3.5 h-3.5 metallic-debossed-icon" />
                    <span>+ Fahrzeug wählen</span>
                  </button>
                )}

                <span className="text-slate-600">|</span>

                {chosenCustomer ? (
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold px-2.5 py-1 rounded-lg metallic-inner-subbox border border-emerald-400/30">
                    <User className="w-3.5 h-3.5 metallic-debossed-icon" />
                    <span className="truncate max-w-[140px]">{chosenCustomer.name || chosenCustomer.companyName}</span>
                    <button 
                      type="button" 
                      onClick={() => setIsCustomerDrawerOpen(true)}
                      className="text-[10px] text-cyan-400 hover:text-white underline cursor-pointer ml-0.5 font-semibold"
                      title="Kunden wechseln"
                    >
                      wechseln
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setIsCustomerDrawerOpen(true)}
                    className="metallic-btn-secondary flex items-center gap-1 text-slate-300 hover:text-white transition cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold"
                  >
                    <User className="w-3.5 h-3.5 metallic-debossed-icon" />
                    <span>+ Kunde wählen</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="hub-session-btn-druckvorschau"
                  type="button"
                  onClick={() => setIsDruckvorschauOpen(true)}
                  className="metallic-btn-secondary text-[11px] text-emerald-300 hover:text-emerald-200 transition cursor-pointer px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold shadow-xs active:scale-95"
                  title="A4 DIN 5008 Druckvorschau öffnen"
                >
                  <Eye className="w-3.5 h-3.5 metallic-debossed-icon" />
                  <span>Druckvorschau</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChosenVehicle(null);
                    setChosenCustomer(null);
                    setProvisionalPayment(null);
                  }}
                  className="metallic-btn-secondary text-[10px] text-slate-400 hover:text-rose-400 transition cursor-pointer px-2 py-1 rounded-lg"
                  title="Sitzungsauswahl zurücksetzen"
                >
                  Zurücksetzen
                </button>
              </div>
            </motion.div>
          )}

          {/* Central Radial Document Arena (Top of Hub View) */}
          <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] md:w-[540px] md:h-[540px] flex items-center justify-center">
            
            {/* SVG Background Orbits & Precision Machined Metal Radar Rings */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none select-none z-0" 
              viewBox="0 0 500 500"
            >
              <defs>
                <linearGradient id="metallic-op-track-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                  <stop offset="25%" stopColor="#94a3b8" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="#64748b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Dotted Radial Axis Guidelines (Precision Engineering Lines) */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line
                  key={deg}
                  x1="250"
                  y1="250"
                  x2={250 + 230 * Math.cos((deg * Math.PI) / 180)}
                  y2={250 + 230 * Math.sin((deg * Math.PI) / 180)}
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeDasharray="4 6"
                  opacity="0.3"
                />
              ))}

              {/* Outer Orbit Track with Brushed Stainless Steel Sheen */}
              <circle
                cx="250"
                cy="250"
                r="195"
                fill="none"
                stroke="url(#metallic-op-track-grad)"
                strokeWidth="1.8"
                strokeDasharray="16 12 4 12"
                opacity="0.5"
                className="animate-[spin_90s_linear_infinite]"
              />

              {/* Middle Precision Guideline */}
              <circle
                cx="250"
                cy="250"
                r="155"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="40 60 80 40"
                opacity="0.35"
                className="animate-[spin_60s_linear_infinite_reverse]"
              />

              {/* Inner Core Accent Ring */}
              <circle
                cx="250"
                cy="250"
                r="88"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>

            {/* Central Master Core Centerpiece (Turned Stainless Steel Dial matching Home) */}
            <div 
              id="centerpiece-op-hub-core"
              className="group relative z-20 w-32 sm:w-40 h-32 sm:h-40 rounded-full flex flex-col items-center justify-center p-3 text-center transition-all duration-300 hover:scale-105"
            >
              {/* Dual-Layer Rotating Scanning Rings matching Home */}
              <DualLayerScanningRings
                outerInsetClass="-inset-[8px] sm:-inset-[10px]"
                innerInsetClass="-inset-[3.5px] sm:-inset-[4.5px]"
                outerStrokeWidth={0.8}
                innerStrokeWidth={0.55}
              />

              {/* Machined Metallic Dial Frame with Specular Chrome Bevel matching Home */}
              <div 
                className="absolute inset-0 rounded-full hub-center-dial transition-all duration-300 group-hover:shadow-[0_0_45px_rgba(255,255,255,0.9),0_16px_35px_rgba(60,80,100,0.35)]" 
              />

              {/* Flash Aura Shimmer on Hover */}
              <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-radial from-white/40 to-transparent blur-sm animate-pulse" />

              {/* Inner Recessed Concentric Groove Ring from Home Hub */}
              <div className="absolute inset-2 sm:inset-2.5 rounded-full hub-knopf-groove pointer-events-none" />

              {/* Content inside Centerpiece: Fully Debossed / Engraved matching Home */}
              <div className="relative z-10 flex flex-col items-center justify-center space-y-0.5 pointer-events-none">
                {hoveredItem ? (
                  <div className="animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center max-w-[110px] sm:max-w-[130px]">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider block truncate hub-engraved-text">
                      {hoveredItem.shortLabel}
                    </span>
                    <span className="text-[11px] sm:text-xs font-black line-clamp-1 hub-engraved-text">
                      {hoveredItem.label}
                    </span>
                    <span className="text-[8px] sm:text-[9px] line-clamp-2 leading-tight mt-0.5 font-bold hub-engraved-text-subtle">
                      {hoveredItem.description}
                    </span>
                    <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black mt-0.5 hub-engraved-text">
                      <span>{chosenVehicle && chosenCustomer ? 'Direkt öffnen' : chosenVehicle ? 'Kunde wählen' : chosenCustomer ? 'Fahrzeug wählen' : 'Assistent starten'}</span>
                      <ArrowRight className="w-2.5 h-2.5 hub-engraved-icon" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="pt-0.5 pb-0.5 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 hub-engraved-icon" />
                    </div>

                    <span className="text-sm sm:text-base font-black tracking-wider block uppercase hub-engraved-text leading-tight">
                      HUB CORE
                    </span>

                    <span className="text-[9px] sm:text-[10px] font-semibold block tracking-normal leading-tight hub-engraved-text-subtle">
                      Dokumenten-Engine
                    </span>

                    <div className="pt-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full hub-knopf-reset-pill text-[8px] sm:text-[8.5px] font-black uppercase tracking-widest hub-engraved-text">
                        8 VORLAGEN
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Orbiting Circular Document Nodes (Pop-out 3D Machined Coins matching Home) */}
            {DOCUMENT_HUB_ITEMS.map((item) => {
              const Icon = item.icon;
              const isHovered = hoveredItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  id={`op-hub-document-item-${item.id}`}
                  style={{
                    position: 'absolute',
                    transform: `translate(calc(cos(${item.angleDeg}deg) * var(--hub-radius)), calc(sin(${item.angleDeg}deg) * var(--hub-radius)))`,
                  }}
                  className="[--hub-radius:125px] sm:[--hub-radius:165px] md:[--hub-radius:190px] z-30 transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectHubItem(item)}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`group relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                      isHovered ? 'scale-125 z-40' : 'scale-100 hover:scale-115'
                    }`}
                    title={`${item.label} - ${item.description}`}
                  >
                    {/* 3D Minted Metallic Coin Medallion with Engraved Icon and Inner Recessed Groove Ring */}
                    <div 
                      className={`relative w-13 h-13 sm:w-15 sm:h-15 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isHovered
                          ? 'hub-coin-node-active scale-105'
                          : 'hub-coin-node'
                      }`}
                    >
                      {/* Dual-Layer Rotating Scanning Rings */}
                      <DualLayerScanningRings
                        outerInsetClass="-inset-[6px] sm:-inset-[8px]"
                        innerInsetClass="-inset-[2.5px] sm:-inset-[3px]"
                        outerStrokeWidth={0.95}
                        innerStrokeWidth={0.65}
                      />

                      {/* Inner Recessed Concentric Groove Ring matching Home Hub */}
                      <div className="absolute inset-1 sm:inset-1.5 rounded-full hub-knopf-groove pointer-events-none" />

                      {/* Flash Action Hover Glow */}
                      <div className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-radial from-white/50 to-transparent blur-xs animate-pulse" />

                      <Icon className="relative z-10 w-8 h-8 sm:w-9.5 sm:h-9.5 transition-transform duration-300 group-hover:scale-105 hub-engraved-icon metallic-debossed-icon" />
                    </div>

                    {/* Laser-Etched Subtitle Pill matching Home Design Language */}
                    <div className="mt-1.5">
                      <span className={`inline-block text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-all whitespace-nowrap ${
                        isHovered
                          ? 'hub-knopf-reset-pill scale-105 shadow-md text-slate-900'
                          : 'hub-knopf-reset-pill hub-engraved-text group-hover:scale-105'
                      }`}>
                        {item.shortLabel}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}

          </div>

          {/* Interactive Helper Text (Brushed Steel Status Panel with Chamfered Edges) */}
          <div className="mt-6 mb-6 text-center text-xs text-slate-200 flex items-center gap-2.5 metallic-card px-5 py-2.5 rounded-full border border-slate-500/50 shadow-[0_6px_18px_rgba(0,0,0,0.6)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse shrink-0" />
            <span className="font-medium tracking-wide">
              {chosenVehicle && chosenCustomer
                ? 'Sitzungsgedächtnis aktiv: Dokumente öffnen sofort vollständig vorausgefüllt'
                : chosenVehicle
                ? 'Fahrzeug ausgewählt: Dokument anklicken, um Kunden zuzuordnen'
                : chosenCustomer
                ? 'Kunde ausgewählt: Dokument anklicken, um Fahrzeug zuzuordnen'
                : 'Klicken Sie auf ein Dokument, um den Schiebe-Assistenten zu starten'}
            </span>
          </div>

          {/* Operations Real-time Performance Metrics Dashboard (Bottom of Hub View) */}
          <OperationsPerformanceDashboard 
            vehicles={vehicles}
            customers={customers}
            invoices={invoices}
          />

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FINAL CLEAN PDF-LIKE DOCUMENT (FLUID LAYOUT WITH GLOWING DOTS)    */}
      {/* ========================================================================= */}
      {viewState === 'document_view' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="relative w-full max-w-5xl px-2 sm:px-4 py-4 flex flex-col items-center"
        >
          {/* Top Control Bar (Strictly hidden on print) */}
          <div className="w-full metallic-card-luminous rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 mb-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-slate-600/60 print:hidden">
            <div className="flex items-center gap-2">
              <button
                id="operationen-btn-back-hub"
                type="button"
                onClick={() => setViewState('hub')}
                className="metallic-btn-secondary flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 metallic-debossed-icon" />
                <span>Zurück zum Hub</span>
              </button>

              <button
                id="operationen-btn-change-vehicle"
                type="button"
                onClick={() => setIsLagerDrawerOpen(true)}
                className="metallic-btn-secondary flex items-center gap-1.5 px-3 py-2 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <Car className="w-3.5 h-3.5 metallic-debossed-icon" />
                <span>Fahrzeug wechseln</span>
              </button>

              <button
                id="operationen-btn-change-customer"
                type="button"
                onClick={() => setIsCustomerDrawerOpen(true)}
                className="metallic-btn-secondary flex items-center gap-1.5 px-3 py-2 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <User className="w-3.5 h-3.5 metallic-debossed-icon" />
                <span>Kunde wechseln</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Payment Button - STRICTLY ONLY for Rechnung, e-Rechnung, EU-Export, Drittland-Export */}
              {isInvoiceDoc && (
                <button
                  id="operationen-btn-add-payment"
                  type="button"
                  onClick={handleOpenPaymentModal}
                  className={`metallic-btn-secondary flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                    provisionalPayment
                      ? 'border-emerald-500/60 text-emerald-300'
                      : 'text-emerald-300'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5 metallic-debossed-icon" />
                  <span>{provisionalPayment ? 'Zahlung / Quittung bearbeiten' : 'Zahlung hinzufügen'}</span>
                  {provisionalPayment && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  )}
                </button>
              )}

              {selectedDocId === 'e_rechnung' && (
                <button
                  id="operationen-btn-xml-preview"
                  type="button"
                  onClick={() => setShowXmlModal(true)}
                  className="metallic-btn-secondary flex items-center gap-1.5 px-3 py-2 text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <FileCode className="w-3.5 h-3.5 metallic-debossed-icon" />
                  <span>XML-Vorschau</span>
                </button>
              )}

              {/* Druckvorschau Modal Button */}
              <button
                id="operationen-btn-druckvorschau"
                type="button"
                onClick={() => setIsDruckvorschauOpen(true)}
                className="metallic-btn-secondary flex items-center gap-2 px-3.5 py-2 text-emerald-300 hover:text-emerald-200 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-sm"
                title="A4 DIN 5008 Druckvorschau öffnen"
              >
                <Eye className="w-4 h-4 metallic-debossed-icon" />
                <span>Druckvorschau</span>
              </button>

              <button
                id="operationen-btn-print-pdf"
                type="button"
                onClick={() => window.print()}
                className="metallic-btn-secondary flex items-center gap-2 px-4 py-2 text-emerald-300 hover:text-emerald-200 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 metallic-debossed-icon" />
                <span>Drucken / PDF</span>
              </button>

              <button
                id="operationen-btn-save-doc"
                type="button"
                onClick={handleSaveDocument}
                disabled={isSaving}
                className="metallic-btn-primary flex items-center gap-2 px-4 py-2 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4 metallic-debossed-icon" />
                <span>{isSaving ? 'Speichern...' : 'Beleg speichern'}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SPECIALIZED LAYOUTS FOR KAUFVERTRAG, PROBEFAHRT, UEBERGABEPROTOKOLL       */}
          {/* ========================================================================= */}
          {selectedDocId === 'kaufvertrag' ? (
            <div className={`relative w-full ${isDruckvorschauOpen ? 'print:hidden' : ''}`}>
              <KaufvertragA4Layout
                kaufvertrag={kaufvertragDetails}
                merchantSettings={merchantSettings}
                internalRefNumber={docNumber}
                onUpdateField={handleUpdateKaufvertragField}
                onUpdateSeller={handleUpdateKaufvertragSeller}
                onUpdateBuyer={handleUpdateKaufvertragBuyer}
                onSwapParties={handleSwapKaufvertragParties}
                onSign={(type) => setActiveKaufvertragSignTarget(type)}
                onClearSignature={(type) => {
                  if (type === 'seller') {
                    setKvSellerSignature('');
                  } else {
                    setKvBuyerSignature('');
                  }
                }}
                onSelectWarrantyTemplate={handleSelectWarrantyTemplate}
              />
            </div>
          ) : selectedDocId === 'probefahrt' ? (
            <div className={`relative w-full ${isDruckvorschauOpen ? 'print:hidden' : ''}`}>
              <ProbefahrtA4Layout
                probefahrt={probefahrtDetails}
                merchantSettings={merchantSettings}
                internalRefNumber={docNumber}
                onEditField={(field: ProbefahrtEditField) => {
                  if (field === 'driver') {
                    setIsCustomerDrawerOpen(true);
                  } else if (field === 'signatureDriver') {
                    setActiveProbefahrtSignTarget('driver');
                  } else if (field === 'signatureDealer') {
                    setActiveProbefahrtSignTarget('dealer');
                  } else {
                    setActiveProbefahrtEditField(field as ProbefahrtEditFieldType);
                  }
                }}
                onSign={(type) => setActiveProbefahrtSignTarget(type)}
                onClearSignature={(type) => {
                  if (type === 'driver') {
                    setProbefahrtDriverSignature('');
                  } else {
                    setProbefahrtDealerSignature('');
                  }
                }}
              />
            </div>
          ) : selectedDocId === 'uebergabeprotokoll' ? (
            <div className={`relative w-full ${isDruckvorschauOpen ? 'print:hidden' : ''}`}>
              <UebergabeProtocolA4Layout
                protocol={uebergabeprotokollDetails}
                merchantSettings={merchantSettings}
                internalRefNumber={docNumber}
                onUpdateField={handleUpdateUebergabeField}
                onToggleCheckItem={handleToggleUebergabeCheckItem}
                onSign={(type) => setActiveUebergabeSignTarget(type)}
                onClearSignature={handleClearUebergabeSignature}
                onOpenVehicleSettings={() => {
                  if (chosenVehicle && onEditVehicleMaster) {
                    onEditVehicleMaster(chosenVehicle, 'operationen', 'uebergabeprotokoll', chosenCustomer);
                  } else {
                    setIsVehicleDetailModalOpen(true);
                  }
                }}
                showGuideNotice={showUebergabeGuideNotice}
                onDismissGuideNotice={() => setShowUebergabeGuideNotice(false)}
              />
            </div>
          ) : selectedDocId === 'eu_export' && euExportActivePage === 2 ? (
            /* ======================================================================= */
            /* PAGE 2: GELANGENSBESTÄTIGUNG (DEUTSCH) GEM. § 17A ABS. 2 USTDV         */
            /* ======================================================================= */
            <div className={`relative w-full space-y-4 ${isDruckvorschauOpen ? 'print:hidden' : ''}`}>
              {/* EU-Export Page Switcher Bar */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/95 rounded-2xl border border-slate-700/80 text-xs shadow-lg print:hidden">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">EU-Export Dokument (3 A4-Seiten):</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEuExportActivePage(1)}
                    className="px-3 py-1 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    1. EU-Rechnung
                  </button>
                  <button
                    type="button"
                    onClick={() => setEuExportActivePage(2)}
                    className="px-3 py-1 rounded-lg text-xs font-bold transition metallic-btn-primary text-slate-950 font-black shadow-xs cursor-pointer"
                  >
                    2. Gelangensbestätigung (DE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEuExportActivePage(3)}
                    className="px-3 py-1 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    3. Confirmation of Receipt (EN)
                  </button>
                </div>
              </div>

              <GelangensbestaetigungA4Layout
                language="de"
                documentNumber={docNumber}
                date={docDate}
                customer={chosenCustomer}
                manualCustomer={!chosenCustomer ? { name: 'Kunde', city: 'Warszawa' } : null}
                vehicles={vehicleItems}
                merchantSettings={merchantSettings}
                exportCountry={chosenCustomer?.country || 'Polen'}
                exportVatId={chosenCustomer?.vatId || ''}
                details={gelangensbestaetigungDetails}
                onUpdateDetails={(updates) => setGelangensbestaetigungDetails(prev => ({ ...prev, ...updates }))}
                onSign={() => setIsGelangensSignModalOpen(true)}
                onClearSignature={() => setGelangensbestaetigungDetails(prev => ({ ...prev, signatureDataUrl: undefined }))}
                pageNumber={2}
                totalPages={3}
                isInteractive={true}
              />
            </div>
          ) : selectedDocId === 'eu_export' && euExportActivePage === 3 ? (
            /* ======================================================================= */
            /* PAGE 3: CONFIRMATION OF RECEIPT (ENGLISH) GEM. § 17A ABS. 2 USTDV       */
            /* ======================================================================= */
            <div className={`relative w-full space-y-4 ${isDruckvorschauOpen ? 'print:hidden' : ''}`}>
              {/* EU-Export Page Switcher Bar */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/95 rounded-2xl border border-slate-700/80 text-xs shadow-lg print:hidden">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">EU-Export Dokument (3 A4-Seiten):</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEuExportActivePage(1)}
                    className="px-3 py-1 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    1. EU-Rechnung
                  </button>
                  <button
                    type="button"
                    onClick={() => setEuExportActivePage(2)}
                    className="px-3 py-1 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    2. Gelangensbestätigung (DE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEuExportActivePage(3)}
                    className="px-3 py-1 rounded-lg text-xs font-bold transition metallic-btn-primary text-slate-950 font-black shadow-xs cursor-pointer"
                  >
                    3. Confirmation of Receipt (EN)
                  </button>
                </div>
              </div>

              <GelangensbestaetigungA4Layout
                language="en"
                documentNumber={docNumber}
                date={docDate}
                customer={chosenCustomer}
                manualCustomer={!chosenCustomer ? { name: 'Customer', city: 'Warszawa' } : null}
                vehicles={vehicleItems}
                merchantSettings={merchantSettings}
                exportCountry={chosenCustomer?.country || 'Polen'}
                exportVatId={chosenCustomer?.vatId || ''}
                details={gelangensbestaetigungDetails}
                onUpdateDetails={(updates) => setGelangensbestaetigungDetails(prev => ({ ...prev, ...updates }))}
                onSign={() => setIsGelangensSignModalOpen(true)}
                onClearSignature={() => setGelangensbestaetigungDetails(prev => ({ ...prev, signatureDataUrl: undefined }))}
                pageNumber={3}
                totalPages={3}
                isInteractive={true}
              />
            </div>
          ) : (
            /* ======================================================================= */
            /* A4 FLUID PRINT SHEET (RECHNUNG, E-RECHNUNG, EXPORT, ANGEBOT)            */
            /* ======================================================================= */
            <div className="relative w-full space-y-4">
              {/* EU-Export Page Switcher Bar when on Page 1 */}
              {selectedDocId === 'eu_export' && (
                <div className="w-full flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/95 rounded-2xl border border-slate-700/80 text-xs shadow-lg print:hidden">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">EU-Export Dokument (3 A4-Seiten):</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEuExportActivePage(1)}
                      className="px-3 py-1 rounded-lg text-xs font-bold transition metallic-btn-primary text-slate-950 font-black shadow-xs cursor-pointer"
                    >
                      1. EU-Rechnung
                    </button>
                    <button
                      type="button"
                      onClick={() => setEuExportActivePage(2)}
                      className="px-3 py-1 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                    >
                      2. Gelangensbestätigung (DE)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEuExportActivePage(3)}
                      className="px-3 py-1 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                    >
                      3. Confirmation of Receipt (EN)
                    </button>
                  </div>
                </div>
              )}

              <div 
                id="operationen-document-a4-sheet"
                className={`a4-print-sheet bg-white text-slate-900 mx-auto shadow-2xl border border-slate-200 rounded-none sm:rounded-lg font-sans relative flex flex-col justify-between select-text w-full max-w-[210mm] min-h-[297mm] p-[20mm_20mm_15mm_20mm] box-border ${isDruckvorschauOpen ? 'print:hidden' : ''}`}
              >
              <div>
                
                {/* 1. TOP HEADER ROW (DIN 5008 COMPLIANT) */}
                <div className="flex justify-between items-start pb-3 border-b border-slate-300">
                  
                  {/* Left: Window Envelope & Customer Billing Block */}
                  <div className="w-[85mm] flex flex-col justify-between h-[70mm]">
                    
                    {/* Merchant Logo */}
                    <div className="h-[15mm] flex items-center">
                      {merchantSettings.logoUrl ? (
                        <img
                          src={merchantSettings.logoUrl}
                          alt={merchantSettings.companyName || 'Firmenlogo'}
                          className="max-h-[14mm] max-w-[85mm] object-contain"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-black text-[11px]">
                            MF
                          </div>
                          <span className="font-black text-xs tracking-tight text-slate-900 uppercase">
                            {merchantSettings.companyName || 'MaxFleet Autohandel'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Window Envelope Return Line */}
                    <div className="h-[5mm] flex items-center">
                      <div className="text-[7.5pt] text-slate-500 font-medium underline tracking-tight truncate w-full">
                        {windowEnvelopeReturnLine}
                      </div>
                    </div>

                    {/* Customer Address with Minimalist Glowing Edit Dot (Re-opens Customer Selection Slider) */}
                    <div className="relative w-[85mm] h-[40mm] flex flex-col justify-center group/cust">
                      {/* Floating glowing dot on empty space beside customer block -> Opens Customer Selection Drawer */}
                      <div className="absolute -right-2 top-0 print:hidden">
                        <GlowingEditDot
                          onClick={() => setIsCustomerDrawerOpen(true)}
                          title="Anderen Kunden aus Datenbank auswählen"
                        />
                      </div>

                      <div className="p-2 bg-slate-50 border border-slate-200 hover:border-emerald-400/80 rounded-lg transition text-[10px] text-slate-800 leading-tight h-full flex flex-col justify-between">
                        <div>
                          <div className="text-[8px] font-extrabold text-emerald-800 uppercase tracking-wider pb-0.5">
                            Rechnungsempfänger:
                          </div>
                          {chosenCustomer?.companyName && (
                            <div className="font-extrabold text-slate-900 text-[11px] truncate">{chosenCustomer.companyName}</div>
                          )}
                          <div className="font-bold text-slate-900 text-[11px] truncate">
                            {chosenCustomer?.name || 'Barverkauf / Laufkunde'}
                          </div>
                          <div className="truncate">{chosenCustomer?.street || 'Musterstraße 1'}</div>
                          <div className="truncate">
                            {chosenCustomer?.postalCode || '10115'} {chosenCustomer?.city || 'Berlin'} &bull; {chosenCustomer?.country || 'Deutschland'}
                          </div>
                        </div>
                        {chosenCustomer?.vatId && (
                          <div className="text-[8.5px] font-mono text-slate-600 truncate">
                            USt-IdNr.: <span className="font-bold text-slate-900">{chosenCustomer.vatId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right: Metadata & Sender Details */}
                  <div className="w-[65mm] text-right flex flex-col justify-between h-[70mm]">
                    
                    {/* Document Title */}
                    <div className="h-[15mm] flex flex-col justify-center">
                      <h1 className="text-lg font-black text-slate-950 tracking-tight uppercase leading-none">
                        {getDocHeading()}
                      </h1>
                      <div className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">
                        {merchantSettings.companyName || 'MaxFleet Autohandel'}
                      </div>
                    </div>

                    {/* Sender Contact */}
                    <div className="h-[10mm] text-[8.5px] text-slate-600 flex flex-col justify-center space-y-0.5">
                      <div className="truncate">{merchantSettings.street || 'Bonner Straße 12'} &bull; {merchantSettings.postalCode || '53111'} {merchantSettings.city || 'Bonn'}</div>
                      <div className="truncate">Tel: <span className="font-semibold text-slate-800">{merchantSettings.phone || '+49 228 98765-0'}</span></div>
                      <div className="truncate">USt-IdNr.: <span className="font-mono font-semibold text-slate-800">{merchantSettings.vatId || 'DE 319 824 550'}</span></div>
                    </div>

                    {/* Metadata with Minimalist Glowing Edit Dot for LIEFERDATUM ONLY (Invoice Date & Number remain strictly locked) */}
                    <div className="relative h-[40mm] flex flex-col justify-end text-right text-[10px] space-y-1.5 pb-1 group/dates">
                      <div className="absolute -left-3 bottom-0 print:hidden">
                        <GlowingEditDot
                          onClick={() => setActiveModalDot('delivery_date')}
                          title="Lieferdatum anpassen (7 Tage, 14 Tage oder Kalender)"
                        />
                      </div>

                      <div className="flex justify-end items-baseline gap-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Belegnummer:</span>
                        <span className="font-mono font-black text-slate-950 text-[11px]">{docNumber}</span>
                      </div>
                      <div className="flex justify-end items-baseline gap-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Rechnungsdatum:</span>
                        <span className="font-bold text-slate-900 text-[10px]">{docDate}</span>
                      </div>
                      <div className="flex justify-end items-baseline gap-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Lieferdatum:</span>
                        <span className="font-bold text-emerald-700 text-[10px]">{deliveryDate}</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* 2. GREETING & TAX LEGAL CLAUSE */}
                <div className="pt-2 space-y-1.5 w-full">
                  
                  {/* Greeting Text with Minimalist Dot (Opens Settings Pre-saved Texts) */}
                  <div className="relative group/greet bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/90 w-full">
                    <div className="absolute -right-2 top-2 print:hidden">
                      <GlowingEditDot
                        onClick={() => setActiveModalDot('greeting_select')}
                        title="Begrüßungstext aus Einstellungen wählen"
                      />
                    </div>
                    <p className="text-[10px] text-slate-800 leading-snug font-sans whitespace-pre-wrap">
                      {greetingText || DocumentTextController.getDefaultText('welcome', selectedDocId)}
                    </p>
                  </div>

                  {/* Tax Legal Clause */}
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[9.5px] space-y-0.5 w-full">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 shrink-0 metallic-debossed-icon" />
                      <span>{taxParagraph.title}</span>
                    </div>
                    <p className="text-slate-600 text-[9px] leading-tight">
                      {taxParagraph.text}
                    </p>
                  </div>

                </div>

                {/* 3. SALES TABLE: VEHICLE LINE ITEM WITH GLOWING DOT (Re-opens Vehicle Selection Slider) */}
                <div className="relative pt-2 w-full group/table">
                  {/* Vehicle Section Dot: Strictly opens Vehicle Selection Drawer to swap vehicle */}
                  <div className="absolute -right-2 -top-1 print:hidden z-10">
                    <GlowingEditDot
                      onClick={() => setIsLagerDrawerOpen(true)}
                      title="Anderes Fahrzeug aus Bestand auswählen"
                    />
                  </div>

                  <div className="border border-slate-300 rounded-lg overflow-hidden text-[10px] w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider">
                          <th className="py-1.5 px-2.5 w-8">Pos.</th>
                          <th className="py-1.5 px-2.5">Fahrzeugbezeichnung & Spezifikation</th>
                          <th className="py-1.5 px-2 text-center w-12">Menge</th>
                          <th className="py-1.5 px-2.5 text-right w-24">Netto</th>
                          <th className="py-1.5 px-2.5 text-center w-20">USt.-Satz</th>
                          <th className="py-1.5 px-2.5 text-right w-24">Gesamt Brutto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {vehicleItems.map((veh, idx) => {
                          const lineNet = veh.taxType === 'standard_19' ? veh.sellingPrice / 1.19 : veh.sellingPrice;
                          const taxLabel = isMarginScheme || veh.taxType === 'diff_25a'
                            ? '§ 25a'
                            : veh.taxType === 'standard_19'
                            ? '19%'
                            : (selectedDocId === 'eu_export' || selectedDocId === 'export_drittland' ? '0% Export' : '§ 25a');
                          return (
                            <tr key={veh.id || idx} className="align-top">
                              <td className="py-1.5 px-2.5 font-bold text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-2.5 space-y-0.5">
                                <div className="font-extrabold text-slate-950 text-[11px]">
                                  {veh.brand} {veh.model} {veh.variant || ''}
                                </div>
                                <div className="font-mono text-[9px] text-slate-600 flex flex-wrap gap-x-2">
                                  <span>FIN: <strong>{veh.vin || 'Keine FIN'}</strong></span>
                                  {veh.firstRegistration && <span>EZ: {veh.firstRegistration}</span>}
                                  <span>{veh.mileage?.toLocaleString('de-DE')} km</span>
                                  {veh.powerPs && <span>{veh.powerPs} PS</span>}
                                  {veh.color && <span>Farbe: {veh.color}</span>}
                                </div>
                              </td>
                              <td className="py-1.5 px-2 text-center font-bold">1 Stk.</td>
                              <td className="py-1.5 px-2.5 text-right font-mono">
                                {lineNet.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                              </td>
                              <td className="py-1.5 px-2.5 text-center font-semibold text-slate-700">
                                {taxLabel}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-mono font-extrabold text-slate-950">
                                {veh.sellingPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. TOTALS & ZAHLUNGSZIEL WITH GLOWING DOT FOR PRICE & ZAHLUNGSZIEL */}
                <div className="pt-2 flex justify-end">
                  <div className="relative w-72 space-y-1 group/totals">
                    {/* Glowing Dot on Price & Zahlungsziel section */}
                    <div className="absolute -left-3 top-2 print:hidden">
                      <GlowingEditDot
                        onClick={() => setActiveModalDot('price_payment')}
                        title="Verkaufspreis & Zahlungsziel (7/14 Tage/Kalender) bearbeiten"
                      />
                    </div>

                    <div className="bg-slate-900 text-white rounded-lg p-2 space-y-0.5 text-[10px]">
                      {calc.totalTax > 0 && !isMarginScheme ? (
                        <>
                          <div className="flex justify-between text-slate-300">
                            <span>Nettobetrag:</span>
                            <span className="font-mono font-bold">{calc.totalNet.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Zzgl. 19% MwSt.:</span>
                            <span className="font-mono font-bold">{calc.totalTax.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-slate-300 text-[9px]">
                          <span>MwSt.-Ausweis:</span>
                          <span>{isMarginScheme ? 'gem. § 25a UStG' : (selectedDocId === 'eu_export' || selectedDocId === 'export_drittland' ? '0% Steuerfrei' : 'gem. § 25a UStG')}</span>
                        </div>
                      )}

                      {depositAmount > 0 && (
                        <div className="flex justify-between text-emerald-300 border-t border-slate-800 pt-0.5">
                          <span>Geleistete Anzahlung:</span>
                          <span className="font-mono font-bold">- {depositAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs font-black text-emerald-300 border-t border-slate-700 pt-0.5">
                        <span>Gesamtbetrag:</span>
                        <span className="font-mono text-sm">{calc.totalGross.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                      </div>

                      {provisionalPayment && provisionalPayment.amount > 0 && (
                        <>
                          <div className="flex justify-between text-emerald-400 border-t border-slate-800 pt-0.5 text-[9.5px] font-bold">
                            <span>Geleistete Zahlung ({provisionalPayment.paymentMethod}):</span>
                            <span className="font-mono">- {formatEur(provisionalPayment.amount)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-200 border-t border-slate-700 pt-0.5 text-[10.5px] font-black">
                            <span>Verbleibend offen:</span>
                            <span className="font-mono text-xs">{formatEur(Math.max(0, calc.totalGross - provisionalPayment.amount))}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[9.5px]">
                      <div className="flex justify-between items-center font-bold text-slate-800">
                        <span>Zahlungsziel:</span>
                        <span className="text-emerald-800 font-bold">{paymentTerms}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. GEWÄHRLEISTUNG WITH GLOWING DOT (Settings Pre-saved Texts) */}
                <div className="relative mt-2.5 mb-1.5 w-full group/warr">
                  <div className="absolute -right-2 top-2 print:hidden">
                    <GlowingEditDot
                      onClick={() => setActiveModalDot('warranty_select')}
                      title="Gewährleistungsklausel aus Einstellungen wählen"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[9px] space-y-1 w-full">
                    <p className="text-[9px] text-slate-600 leading-tight font-sans whitespace-pre-wrap">
                      {warrantyText || DocumentTextController.getDefaultText('warranty', selectedDocId)}
                    </p>
                  </div>
                </div>

                {/* 6. SONDERVEREINBARUNG */}
                <div className="relative mb-2 w-full group/notes">
                  <div className="absolute -right-2 top-2 print:hidden">
                    <GlowingEditDot
                      onClick={() => setActiveModalDot('sondervereinbarung')}
                      title="Sondervereinbarung erfassen / ändern"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[9px] space-y-0.5 w-full">
                    <span className="font-bold text-slate-800 block">Sondervereinbarung / Bemerkungen:</span>
                    <div className="text-slate-700 text-[9px] leading-tight whitespace-pre-wrap">
                      {sondervereinbarung || 'Keine gesonderten Vereinbarungen getroffen.'}
                    </div>
                  </div>
                </div>

              </div>

              {/* 8. FOOTER: BANK DETAILS & REGISTRATION */}
              <div className="border-t border-slate-300 pt-2 text-[8px] text-slate-500 leading-tight">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="font-bold text-slate-800">{merchantSettings.companyName || 'MaxFleet Autohandelsgruppe GmbH'}</div>
                    <div>Geschäftsführung: {merchantSettings.responsiblePerson || 'Geschäftsleitung'}</div>
                    <div>Sitz der Gesellschaft: {merchantSettings.city || 'Bonn'}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-800">Bankverbindung ({merchantSettings.bankName || 'Deutsche Bank'})</div>
                    <div className="font-mono">IBAN: <span className="font-semibold text-slate-800">{merchantSettings.iban || 'DE89 3704 0044 0532 0130 00'}</span></div>
                    <div className="font-mono">BIC: <span className="font-semibold text-slate-800">{merchantSettings.bic || 'DEUTDEDDXXX'}</span></div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-800">Amtsgericht & Steuern</div>
                    <div>Handelsregister: {merchantSettings.taxOffice || 'HRB 19482 AG Bonn'}</div>
                    <div>USt-IdNr.: <span className="font-mono font-semibold text-slate-800">{merchantSettings.vatId || 'DE 319 824 550'}</span></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

          {/* ========================================================================= */}
          {/* SECONDARY OFFICIAL RECEIPT PDF: QUITTUNG (LINKED TO INVOICE)              */}
          {/* ========================================================================= */}
          {isInvoiceDoc && provisionalPayment && (
            <div 
              id="operationen-quittung-a4-sheet"
              className={`w-full max-w-[210mm] min-h-[148mm] bg-white text-slate-900 shadow-2xl rounded-2xl p-8 sm:p-10 mx-auto flex flex-col justify-between relative mt-8 border border-emerald-400/40 print:mt-0 print:border-none print:shadow-none print:break-before-page ${isDruckvorschauOpen ? 'print:hidden' : ''}`}
            >
              {/* Top Accent Ribbon */}
              <div className="w-full h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 rounded-t-full mb-6 print:hidden" />

              <div className="space-y-6">
                {/* Header: Title & Meta */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-md uppercase tracking-wider">
                        Offizieller Beleg
                      </span>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">QUITTUNG</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Zahlungsbestätigung & Kassenbeleg gem. § 368 BGB
                    </p>
                  </div>

                  <div className="text-right text-xs space-y-1">
                    <div>
                      <span className="text-slate-500">Quittungs-Nr.: </span>
                      <span className="font-mono font-bold text-slate-900">{provisionalPayment.receiptNumber || `QUT-${docNumber}`}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Datum: </span>
                      <span className="font-semibold text-slate-900">{provisionalPayment.date}</span>
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        provisionalPayment.amount >= calc.totalGross 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {provisionalPayment.amount >= calc.totalGross ? 'Vollständig bezahlt' : 'Teilzahlung erhalten'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linked Invoice Reference Box */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Verknüpfte Rechnung</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{docNumber}</div>
                    <div className="text-slate-600 text-[11px]">Rechnungsdatum: {docDate}</div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Zahlungspflichtiger / Kunde</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {chosenCustomer ? (chosenCustomer.name || chosenCustomer.companyName || 'Kunde') : 'Barverkauf'}
                    </div>
                    {chosenCustomer?.city && (
                      <div className="text-slate-600 text-[11px]">{chosenCustomer.postalCode} {chosenCustomer.city}</div>
                    )}
                  </div>

                  {chosenVehicle && (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-700 flex justify-between">
                      <span><strong>Fahrzeug:</strong> {chosenVehicle.brand} {chosenVehicle.model} {chosenVehicle.variant || ''}</span>
                      <span className="font-mono text-slate-500">FIN: {chosenVehicle.vin || '-'}</span>
                    </div>
                  )}
                </div>

                {/* Amount Highlight Box */}
                <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl shadow-inner border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <span className="text-xs text-slate-400 font-medium">Erhaltene Zahlungssumme:</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {formatEur(provisionalPayment.amount)}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                      <span className="text-slate-400 text-[11px]">Betrag in Worten:</span>
                      <span className="font-semibold text-slate-100 text-xs italic">
                        {numberToWordsGerman(provisionalPayment.amount)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-slate-300">
                      <div>
                        <span className="text-slate-400">Zahlungsart: </span>
                        <strong className="text-emerald-300">{provisionalPayment.paymentMethod}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Rechnungsbetrag: </span>
                        <span className="font-mono">{formatEur(calc.totalGross)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Restbetrag: </span>
                        <span className="font-mono text-emerald-400 font-bold">{formatEur(Math.max(0, calc.totalGross - provisionalPayment.amount))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verwendungszweck */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Verwendungszweck / Bemerkung</span>
                  <div className="text-slate-800 font-medium">
                    {provisionalPayment.notes || `Zahlungseingang zu Rechnung ${docNumber}`}
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="space-y-1">
                    <div className="h-12 border-b border-slate-400 flex items-end pb-1">
                      <span className="text-xs text-slate-800 font-serif italic">{merchantSettings.responsiblePerson || 'Geschäftsleitung'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Betrag dankend erhalten ({merchantSettings.city || 'Bonn'}, den {provisionalPayment.date})
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Unterschrift Zahlungsempfänger
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-12 border-b border-slate-400" />
                    <div className="text-[10px] text-slate-500">
                      {chosenCustomer ? (chosenCustomer.name || chosenCustomer.companyName || 'Kunde') : 'Kunde'}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Unterschrift Einzahler / Kunde
                    </div>
                  </div>
                </div>

              </div>

              {/* Receipt Footer */}
              <div className="border-t border-slate-200 pt-3 mt-6 text-[8.5px] text-slate-500 flex justify-between items-center">
                <span>{merchantSettings.companyName || 'MaxFleet Autohandelsgruppe GmbH'} · {merchantSettings.city || 'Bonn'}</span>
                <span>Dieser Beleg ist eine offizielle Zahlungsquittung zu Rechnung {docNumber}</span>
              </div>
            </div>
          )}

        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* SLIDING DRAWERS (MATCHING HUB LAYOUT)                                      */}
      {/* ========================================================================= */}
      
      {/* 1. Vehicle Selection Sliding Drawer (Step 1 & Vehicle Dot) */}
      <LagerSelectionDrawer
        isOpen={isLagerDrawerOpen}
        onClose={() => setIsLagerDrawerOpen(false)}
        vehicles={vehicles}
        selectedVehicleId={chosenVehicle?.id}
        onSelectVehicle={handleSelectVehicleFromLager}
      />

      {/* 2. Customer Selection Sliding Drawer (Step 2 & Customer Dot) */}
      <KundenSelectionDrawer
        isOpen={isCustomerDrawerOpen}
        onClose={() => setIsCustomerDrawerOpen(false)}
        customers={customers}
        selectedCustomerId={chosenCustomer?.id}
        onSelectCustomer={handleSelectCustomerFromDrawer}
      />

      {/* ========================================================================= */}
      {/* POPUP EDIT MODALS TRIGGERED BY GLOWING MINIMALIST DOTS                    */}
      {/* ========================================================================= */}
      
      {/* Modal 1: Liefertermin (Delivery Date) - Compact Floating Popup with 7/14 Days & Calendar */}
      {activeModalDot === 'delivery_date' && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto bg-black/80 backdrop-blur-sm print:hidden animate-in fade-in">
          <div className="w-full max-w-sm metallic-modal-container p-5 text-white shadow-2xl space-y-4 my-0 sm:my-1 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 metallic-debossed-icon" />
                <h3 className="text-sm font-bold text-slate-100">Lieferdatum festlegen</h3>
              </div>
              <button onClick={() => setActiveModalDot(null)} className="text-slate-400 hover:text-white cursor-pointer transition">
                <X className="w-4 h-4 metallic-debossed-icon" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-slate-300 text-[11px]">
                Schnellauswahl für die geplante Fahrzeugübergabe:
              </div>

              {/* Quick Buttons: 7 Tage & 14 Tage */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryDate(addDaysToToday(7));
                    setActiveModalDot(null);
                  }}
                  className="metallic-btn-secondary px-3 py-2.5 rounded-xl font-bold text-center transition cursor-pointer flex flex-col items-center active:scale-95"
                >
                  <span className="text-xs text-slate-200">in 7 Tagen</span>
                  <span className="text-[10px] text-emerald-300/90 font-mono mt-0.5">{addDaysToToday(7)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryDate(addDaysToToday(14));
                    setActiveModalDot(null);
                  }}
                  className="metallic-btn-secondary px-3 py-2.5 rounded-xl font-bold text-center transition cursor-pointer flex flex-col items-center active:scale-95"
                >
                  <span className="text-xs text-slate-200">in 14 Tagen</span>
                  <span className="text-[10px] text-emerald-300/90 font-mono mt-0.5">{addDaysToToday(14)}</span>
                </button>
              </div>

              {/* Calendar Date Picker */}
              <div className="pt-2 border-t border-slate-700/60">
                <label className="block text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 metallic-debossed-icon" />
                  <span>Oder Datum aus Kalender wählen:</span>
                </label>
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      setDeliveryDate(parseInputDateToDe(e.target.value));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl metallic-input text-white font-mono text-xs cursor-pointer outline-none"
                />
              </div>

              <div className="p-2 rounded-lg metallic-card border border-slate-700/60 text-[10px] text-slate-300 flex justify-between items-center">
                <span>Aktuelles Lieferdatum:</span>
                <span className="font-bold text-emerald-300 font-mono">{deliveryDate}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-700/60">
              <button
                type="button"
                onClick={() => setActiveModalDot(null)}
                className="metallic-btn-primary px-4 py-2 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer active:scale-95"
              >
                Fertig
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Price & Zahlungsziel (7/14 Days / Calendar / Price Input) */}
      {activeModalDot === 'price_payment' && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto bg-black/80 backdrop-blur-sm print:hidden animate-in fade-in">
          <div className="w-full max-w-md metallic-modal-container p-5 text-white shadow-2xl space-y-4 my-0 sm:my-1 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 metallic-debossed-icon" />
                <h3 className="text-sm font-bold text-slate-100">Verkaufspreis & Zahlungsziel</h3>
              </div>
              <button onClick={() => setActiveModalDot(null)} className="text-slate-400 hover:text-white cursor-pointer transition">
                <X className="w-4 h-4 metallic-debossed-icon" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Price Modifier */}
              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Verkaufspreis (€ Brutto)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl metallic-input text-emerald-300 font-mono text-base font-extrabold outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-emerald-400 font-bold text-sm">€</span>
                </div>
              </div>

              {/* Anzahlung */}
              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Geleistete Anzahlung (€, optional)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl metallic-input text-white font-mono text-xs outline-none"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs">€</span>
                </div>
              </div>

              {/* Zahlungsziel Quick Buttons & Custom Input */}
              <div className="pt-2 border-t border-slate-700/60">
                <label className="block text-slate-200 font-bold mb-1.5">
                  Zahlungsziel auswählen:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentTerms('Sofort fällig')}
                    className={`px-2 py-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border active:scale-95 ${
                      paymentTerms === 'Sofort fällig'
                        ? 'metallic-btn-primary text-slate-950 font-black'
                        : 'metallic-btn-secondary text-slate-200'
                    }`}
                  >
                    Sofort fällig
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTerms(`Zahlbar innerhalb von 7 Tagen (bis ${addDaysToToday(7)})`)}
                    className={`px-2 py-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border active:scale-95 ${
                      paymentTerms.includes('7 Tagen')
                        ? 'metallic-btn-primary text-slate-950 font-black'
                        : 'metallic-btn-secondary text-slate-200'
                    }`}
                  >
                    7 Tage
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTerms(`Zahlbar innerhalb von 14 Tagen (bis ${addDaysToToday(14)})`)}
                    className={`px-2 py-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border active:scale-95 ${
                      paymentTerms.includes('14 Tagen')
                        ? 'metallic-btn-primary text-slate-950 font-black'
                        : 'metallic-btn-secondary text-slate-200'
                    }`}
                  >
                    14 Tage
                  </button>
                </div>

                <div className="mt-2">
                  <label className="block text-slate-400 text-[10px] mb-1">Oder Datum / Text manuell anpassen:</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl metallic-input text-white text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-700/60">
              <button
                type="button"
                onClick={() => setActiveModalDot(null)}
                className="metallic-btn-primary px-4 py-2 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer active:scale-95"
              >
                Übernehmen & Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Greeting Text Selection (Direct from Settings) */}
      {activeModalDot === 'greeting_select' && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto bg-black/80 backdrop-blur-sm print:hidden animate-in fade-in">
          <div className="w-full max-w-lg metallic-modal-container p-5 text-white shadow-2xl space-y-4 my-0 sm:my-1 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 metallic-debossed-icon" />
                <h3 className="text-sm font-bold text-slate-100">Begrüßungstext aus Einstellungen wählen</h3>
              </div>
              <button onClick={() => setActiveModalDot(null)} className="text-slate-400 hover:text-white cursor-pointer transition">
                <X className="w-4 h-4 metallic-debossed-icon" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 text-xs flex-1">
              <div className="text-slate-300 text-[11px] mb-2">
                Klicken Sie auf eine hinterlegte Vorlage, um sie sofort in das Dokument zu übernehmen:
              </div>

              {welcomeTemplates.length === 0 ? (
                <div className="p-3 metallic-card rounded-xl border border-slate-700/60 text-slate-400 text-center">
                  Keine Vorlagen in den Einstellungen angelegt. Standardtext ist aktiv.
                </div>
              ) : (
                welcomeTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setGreetingText(tpl.content);
                      setActiveModalDot(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1 active:scale-[0.99] ${
                      greetingText.trim() === tpl.content.trim()
                        ? 'metallic-card border-emerald-400 text-white shadow-md'
                        : 'metallic-btn-secondary text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300 text-xs">{tpl.title}</span>
                      {tpl.isDefault && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                          Standard
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                      {tpl.content}
                    </p>
                  </button>
                ))
              )}

              {/* Manual Customization Fallback */}
              <div className="pt-2 border-t border-slate-700/60">
                <label className="block text-slate-200 font-bold mb-1">Oder Text manuell anpassen:</label>
                <textarea
                  rows={3}
                  value={greetingText}
                  onChange={(e) => setGreetingText(e.target.value)}
                  className="w-full p-2.5 rounded-xl metallic-input text-white text-xs leading-relaxed outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-700/60 shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalDot(null)}
                className="metallic-btn-secondary px-4 py-2 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition cursor-pointer active:scale-95"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Warranty Text Selection (Direct from Settings) */}
      {activeModalDot === 'warranty_select' && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto bg-black/80 backdrop-blur-sm print:hidden animate-in fade-in">
          <div className="w-full max-w-lg metallic-modal-container p-5 text-white shadow-2xl space-y-4 my-0 sm:my-1 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 metallic-debossed-icon" />
                <h3 className="text-sm font-bold text-slate-100">Gewährleistungsklausel aus Einstellungen</h3>
              </div>
              <button onClick={() => setActiveModalDot(null)} className="text-slate-400 hover:text-white cursor-pointer transition">
                <X className="w-4 h-4 metallic-debossed-icon" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 text-xs flex-1">
              <div className="text-slate-300 text-[11px] mb-2">
                Wählen Sie eine der in den Einstellungen definierten Gewährleistungsklauseln:
              </div>

              {warrantyTemplates.length === 0 ? (
                <div className="p-3 metallic-card rounded-xl border border-slate-700/60 text-slate-400 text-center">
                  Keine Klauseln in den Einstellungen angelegt.
                </div>
              ) : (
                warrantyTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setWarrantyText(tpl.content);
                      setActiveModalDot(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1 active:scale-[0.99] ${
                      warrantyText.trim() === tpl.content.trim()
                        ? 'metallic-card border-emerald-400 text-white shadow-md'
                        : 'metallic-btn-secondary text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300 text-xs">{tpl.title}</span>
                      {tpl.isDefault && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                          Standard
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                      {tpl.content}
                    </p>
                  </button>
                ))
              )}

              {/* Manual Customization Fallback */}
              <div className="pt-2 border-t border-slate-700/60">
                <label className="block text-slate-200 font-bold mb-1">Oder Text manuell anpassen:</label>
                <textarea
                  rows={3}
                  value={warrantyText}
                  onChange={(e) => setWarrantyText(e.target.value)}
                  className="w-full p-2.5 rounded-xl metallic-input text-white text-xs leading-relaxed outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-700/60 shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalDot(null)}
                className="metallic-btn-secondary px-4 py-2 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition cursor-pointer active:scale-95"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Export Text Selection (Direct from Settings) */}
      {activeModalDot === 'export_select' && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto bg-black/80 backdrop-blur-sm print:hidden animate-in fade-in">
          <div className="w-full max-w-lg metallic-modal-container p-5 text-white shadow-2xl space-y-4 my-0 sm:my-1 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 metallic-debossed-icon" />
                <h3 className="text-sm font-bold text-slate-100">Export- & Zollklausel aus Einstellungen</h3>
              </div>
              <button onClick={() => setActiveModalDot(null)} className="text-slate-400 hover:text-white cursor-pointer transition">
                <X className="w-4 h-4 metallic-debossed-icon" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 text-xs flex-1">
              <div className="text-slate-300 text-[11px] mb-2">
                Wählen Sie eine der Vorlagen für EU-Export oder Drittlandlieferung:
              </div>

              {exportTemplates.length === 0 ? (
                <div className="p-3 metallic-card rounded-xl border border-slate-700/60 text-slate-400 text-center">
                  Keine Klauseln in den Einstellungen angelegt.
                </div>
              ) : (
                exportTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setExportText(tpl.content);
                      setActiveModalDot(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1 active:scale-[0.99] ${
                      exportText.trim() === tpl.content.trim()
                        ? 'metallic-card border-emerald-400 text-white shadow-md'
                        : 'metallic-btn-secondary text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300 text-xs">{tpl.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                      {tpl.content}
                    </p>
                  </button>
                ))
              )}

              {/* Manual Customization Fallback */}
              <div className="pt-2 border-t border-slate-700/60">
                <label className="block text-slate-200 font-bold mb-1">Oder Text manuell anpassen:</label>
                <textarea
                  rows={3}
                  value={exportText}
                  onChange={(e) => setExportText(e.target.value)}
                  className="w-full p-2.5 rounded-xl metallic-input text-white text-xs leading-relaxed outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-700/60 shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalDot(null)}
                className="metallic-btn-secondary px-4 py-2 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition cursor-pointer active:scale-95"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Sondervereinbarung */}
      {activeModalDot === 'sondervereinbarung' && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto bg-black/80 backdrop-blur-sm print:hidden animate-in fade-in">
          <div className="w-full max-w-lg metallic-modal-container p-5 text-white shadow-2xl space-y-4 my-0 sm:my-1 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 metallic-debossed-icon" />
                <h3 className="text-sm font-bold text-slate-100">Sondervereinbarung / Bemerkungen</h3>
              </div>
              <button onClick={() => setActiveModalDot(null)} className="text-slate-400 hover:text-white cursor-pointer transition">
                <X className="w-4 h-4 metallic-debossed-icon" />
              </button>
            </div>

            <div className="space-y-3 text-xs flex-1">
              <textarea
                rows={4}
                value={sondervereinbarung}
                onChange={(e) => setSondervereinbarung(e.target.value)}
                className="w-full p-3 rounded-xl metallic-input text-white leading-relaxed outline-none"
                placeholder="z.B. Inkl. 8-fach Bereifung auf Alufelgen, TÜV & Inspektion vor Übergabe neu..."
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-700/60 shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalDot(null)}
                className="metallic-btn-primary px-4 py-2 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer active:scale-95"
              >
                Übernehmen & Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 7: Payment Modal (Zahlung hinzufügen / Quittung erstellen) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto bg-black/80 backdrop-blur-sm print:hidden animate-in fade-in">
          <div className="w-full max-w-md metallic-modal-container p-5 text-white shadow-2xl space-y-4 my-0 sm:my-1 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 metallic-debossed-icon" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Zahlung zur Rechnung erfassen</h3>
                  <div className="text-[10px] text-slate-400">Rechnung: {docNumber} · Gesamt: {formatEur(calc.totalGross)}</div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPaymentModal(false)} 
                className="text-slate-400 hover:text-white cursor-pointer transition"
              >
                <X className="w-4 h-4 metallic-debossed-icon" />
              </button>
            </div>

            {/* Quick Amount Selection */}
            <div className="space-y-2 text-xs">
              <label className="block text-slate-200 font-bold">Zahlungsart & Betrag:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentAmountInput(calc.totalGross)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                    paymentAmountInput === calc.totalGross
                      ? 'metallic-btn-primary text-slate-950'
                      : 'metallic-btn-secondary text-slate-300'
                  }`}
                >
                  <span>Vollzahlung</span>
                  <span className="font-mono text-[10px] opacity-90">{formatEur(calc.totalGross)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentAmountInput(Math.round((calc.totalGross / 2) * 100) / 100)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                    paymentAmountInput === Math.round((calc.totalGross / 2) * 100) / 100
                      ? 'metallic-btn-primary text-slate-950'
                      : 'metallic-btn-secondary text-slate-300'
                  }`}
                >
                  <span>50% Anzahlung</span>
                  <span className="font-mono text-[10px] opacity-90">{formatEur(Math.round((calc.totalGross / 2) * 100) / 100)}</span>
                </button>
              </div>

              {/* Exact Amount Input */}
              <div className="space-y-1 pt-1">
                <label className="block text-slate-300 text-[11px]">Gezahlter Betrag (in €):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={calc.totalGross}
                    value={paymentAmountInput || ''}
                    onChange={(e) => setPaymentAmountInput(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 metallic-input rounded-xl text-white font-mono text-sm font-bold outline-none"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">€</span>
                </div>
                {paymentAmountInput > 0 && (
                  <div className="text-[10.5px] text-emerald-300/90 italic pt-0.5">
                    In Worten: {numberToWordsGerman(paymentAmountInput)}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1 text-xs">
              <label className="block text-slate-300 text-[11px]">Zahlungsweise:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Barzahlung', 'Banküberweisung', 'Kartenzahlung'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethodInput(method)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold text-center transition cursor-pointer active:scale-95 ${
                      paymentMethodInput === method
                        ? 'metallic-btn-primary text-slate-950 font-black'
                        : 'metallic-btn-secondary text-slate-300 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Date */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <label className="block text-slate-300 text-[11px]">Zahlungsdatum:</label>
                <button
                  type="button"
                  onClick={() => setPaymentDateInput(todayStr)}
                  className="text-[10px] text-emerald-300 hover:underline cursor-pointer"
                >
                  Heute ({todayStr})
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paymentDateInput}
                  onChange={(e) => setPaymentDateInput(e.target.value)}
                  placeholder="TT.MM.JJJJ"
                  className="flex-1 px-3 py-1.5 metallic-input rounded-xl text-white text-xs outline-none"
                />
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      setPaymentDateInput(parseInputDateToDe(e.target.value));
                    }
                  }}
                  className="px-2 py-1.5 metallic-input rounded-xl text-emerald-300 text-xs cursor-pointer outline-none"
                  title="Kalenderauswahl"
                />
              </div>
            </div>

            {/* Payment Note / Purpose */}
            <div className="space-y-1 text-xs">
              <label className="block text-slate-300 text-[11px]">Verwendungszweck / Quittungsvermerk:</label>
              <input
                type="text"
                value={paymentNotesInput}
                onChange={(e) => setPaymentNotesInput(e.target.value)}
                placeholder={`z.B. Zahlungseingang zu Rechnung ${docNumber}`}
                className="w-full px-3 py-1.5 metallic-input rounded-xl text-white text-xs outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
              {provisionalPayment ? (
                <button
                  type="button"
                  onClick={() => {
                    setProvisionalPayment(null);
                    setShowPaymentModal(false);
                  }}
                  className="text-rose-400 hover:text-rose-300 text-xs font-bold underline cursor-pointer"
                >
                  Zahlung verwerfen
                </button>
              ) : (
                <span />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-2 bg-transparent hover:bg-white/5 text-slate-300 rounded-xl text-xs transition cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  id="operationen-btn-confirm-payment"
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={!paymentAmountInput || paymentAmountInput <= 0}
                  className="metallic-btn-primary px-4 py-2 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Zahlung zur Rechnung hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* XML Viewer Modal */}
      {showXmlModal && (
        <ERechnungXmlViewerModal
          isOpen={showXmlModal}
          onClose={() => setShowXmlModal(false)}
          invoice={{
            id: `inv-${Date.now()}`,
            invoiceNumber: docNumber,
            date: docDate,
            dueDate: paymentTerms,
            documentType: 'e_rechnung',
            invoiceCategory: 'e_rechnung',
            customerName: chosenCustomer ? (chosenCustomer.name || chosenCustomer.companyName || 'Kunde') : 'Barverkauf',
            customerType: chosenCustomer?.type || 'B2C',
            vehicleTitle: chosenVehicle ? `${chosenVehicle.brand} ${chosenVehicle.model || ''}`.trim() : 'Fahrzeug',
            vin: chosenVehicle?.vin || '',
            amountNet: calc.totalNet,
            taxAmount: calc.totalTax,
            amountGross: calc.totalGross,
            taxType: isMarginScheme ? 'diff_25a' : 'standard_19',
            status: 'offen',
            paymentMethod: 'Überweisung',
            notes: sondervereinbarung
          }}
          vehicle={chosenVehicle}
          customer={chosenCustomer}
          merchantSettings={merchantSettings}
        />
      )}

      {/* Probefahrt Quick Edit Modal */}
      {activeProbefahrtEditField && (
        <ProbefahrtQuickEditModal
          isOpen={activeProbefahrtEditField !== null}
          onClose={() => setActiveProbefahrtEditField(null)}
          field={activeProbefahrtEditField}
          merchantSettings={merchantSettings}
          currentPlate={probefahrtPlate}
          currentDuration={probefahrtDuration}
          currentStartTime={probefahrtStartTime}
          currentRouteLimit={probefahrtRouteLimit}
          currentMileage={probefahrtMileage || chosenVehicle?.mileage || 0}
          currentFuelLevel={probefahrtFuelLevel}
          currentDeposit={probefahrtDeposit}
          currentDeductible={probefahrtDeductible}
          currentCustomLiabilityText={probefahrtCustomLiability}
          onSave={(updates) => {
            if (updates.plate !== undefined) setProbefahrtPlate(updates.plate);
            if (updates.duration !== undefined) setProbefahrtDuration(updates.duration);
            if (updates.startTime !== undefined) setProbefahrtStartTime(updates.startTime);
            if (updates.routeLimit !== undefined) setProbefahrtRouteLimit(updates.routeLimit);
            if (updates.mileage !== undefined) setProbefahrtMileage(updates.mileage);
            if (updates.fuelLevel !== undefined) setProbefahrtFuelLevel(updates.fuelLevel);
            if (updates.deposit !== undefined) setProbefahrtDeposit(updates.deposit);
            if (updates.deductible !== undefined) setProbefahrtDeductible(updates.deductible);
            if (updates.customLiabilityText !== undefined) setProbefahrtCustomLiability(updates.customLiabilityText);
          }}
        />
      )}

      {/* Probefahrt Signature Pad Modal */}
      {activeProbefahrtSignTarget && (
        <SignaturePadModal
          isOpen={activeProbefahrtSignTarget !== null}
          onClose={() => setActiveProbefahrtSignTarget(null)}
          title={
            activeProbefahrtSignTarget === 'driver'
              ? 'Unterschrift Probefahrer (Interessent)'
              : 'Unterschrift Autohaus (Fahrzeugüberlasser)'
          }
          signeeName={
            activeProbefahrtSignTarget === 'driver'
              ? (chosenCustomer?.name || chosenCustomer?.companyName || 'Probefahrer')
              : (merchantSettings.responsiblePerson || 'Inhaber / Geschäftsleitung')
          }
          role={activeProbefahrtSignTarget === 'driver' ? 'Probefahrer' : 'Autohaus'}
          onSaveSignature={(signatureDataUrl) => {
            if (activeProbefahrtSignTarget === 'driver') {
              setProbefahrtDriverSignature(signatureDataUrl);
            } else {
              setProbefahrtDealerSignature(signatureDataUrl);
            }
            setActiveProbefahrtSignTarget(null);
          }}
          initialSignature={
            activeProbefahrtSignTarget === 'driver'
              ? probefahrtDriverSignature
              : probefahrtDealerSignature
          }
          defaultMerchantSignatureUrl={
            activeProbefahrtSignTarget === 'dealer'
              ? merchantSettings.signatureUrl
              : undefined
          }
        />
      )}

      {/* Kaufvertrag Signature Pad Modal (Step 24) */}
      {activeKaufvertragSignTarget && (
        <SignaturePadModal
          isOpen={activeKaufvertragSignTarget !== null}
          onClose={() => setActiveKaufvertragSignTarget(null)}
          title={
            activeKaufvertragSignTarget === 'seller'
              ? (kvContractMode === 'verkauf' ? 'Unterschrift Verkäufer (Autohaus)' : 'Unterschrift Verkäufer (Kunde / Vorbesitzer)')
              : (kvContractMode === 'verkauf' ? 'Unterschrift Käufer (Kunde / Erwerber)' : 'Unterschrift Käufer (Autohaus / Ankäufer)')
          }
          signeeName={
            activeKaufvertragSignTarget === 'seller'
              ? (actualKvSeller.name || actualKvSeller.companyName || 'Verkäufer')
              : (actualKvBuyer.name || actualKvBuyer.companyName || 'Käufer')
          }
          role={
            activeKaufvertragSignTarget === 'seller'
              ? (kvContractMode === 'verkauf' ? 'Autohaus' : 'Kunde')
              : (kvContractMode === 'verkauf' ? 'Kunde' : 'Autohaus')
          }
          onSaveSignature={(signatureDataUrl) => {
            if (activeKaufvertragSignTarget === 'seller') {
              setKvSellerSignature(signatureDataUrl);
            } else {
              setKvBuyerSignature(signatureDataUrl);
            }
            setActiveKaufvertragSignTarget(null);
          }}
          initialSignature={
            activeKaufvertragSignTarget === 'seller'
              ? kvSellerSignature
              : kvBuyerSignature
          }
          defaultMerchantSignatureUrl={
            (activeKaufvertragSignTarget === 'seller' && kvContractMode === 'verkauf') ||
            (activeKaufvertragSignTarget === 'buyer' && kvContractMode === 'ankauf')
              ? merchantSettings.signatureUrl
              : undefined
          }
        />
      )}

      {/* Übergabeprotokoll Signature Pad Modal (Step 25) */}
      {activeUebergabeSignTarget && (
        <SignaturePadModal
          isOpen={activeUebergabeSignTarget !== null}
          onClose={() => setActiveUebergabeSignTarget(null)}
          title={
            activeUebergabeSignTarget === 'buyer'
              ? 'Unterschrift Übernehmer (Käufer)'
              : 'Unterschrift Übergeber (Autohaus)'
          }
          signeeName={
            activeUebergabeSignTarget === 'buyer'
              ? (uebergabeprotokollDetails.buyerName || 'Übernehmer')
              : (merchantSettings.responsiblePerson || merchantSettings.companyName || 'Übergeber')
          }
          role={activeUebergabeSignTarget === 'buyer' ? 'Kunde' : 'Autohaus'}
          onSaveSignature={(signatureDataUrl) => {
            if (activeUebergabeSignTarget === 'buyer') {
              setUebergabeBuyerSignature(signatureDataUrl);
            } else {
              setUebergabeSellerSignature(signatureDataUrl);
            }
            setActiveUebergabeSignTarget(null);
          }}
          initialSignature={
            activeUebergabeSignTarget === 'buyer'
              ? uebergabeBuyerSignature
              : uebergabeSellerSignature
          }
          defaultMerchantSignatureUrl={
            activeUebergabeSignTarget === 'seller'
              ? merchantSettings.signatureUrl
              : undefined
          }
        />
      )}

      {/* Gelangensbestätigung Signature Pad Modal */}
      {isGelangensSignModalOpen && (
        <SignaturePadModal
          isOpen={isGelangensSignModalOpen}
          onClose={() => setIsGelangensSignModalOpen(false)}
          title="Unterschrift Abnehmer (Gelangensbestätigung gem. § 17a Abs. 2 UStDV)"
          signeeName={gelangensbestaetigungDetails.signatoryName || chosenCustomer?.name || chosenCustomer?.companyName || 'Abnehmer'}
          role="Abnehmer / Empfangsbevollmächtigter"
          onSaveSignature={(signatureDataUrl) => {
            setGelangensbestaetigungDetails(prev => ({
              ...prev,
              signatureDataUrl,
              signatureDate: todayStr
            }));
            setIsGelangensSignModalOpen(false);
          }}
          initialSignature={gelangensbestaetigungDetails.signatureDataUrl}
        />
      )}

      {/* Vehicle Detail / Settings Modal for Live Editing from Übergabeprotokoll (Step 25 & 26) */}
      {isVehicleDetailModalOpen && chosenVehicle && (
        <VehicleDetailModal
          vehicle={chosenVehicle}
          initialSubTab="condition"
          onClose={() => setIsVehicleDetailModalOpen(false)}
          onUpdateVehicle={(id, updates) => {
            const updated = firebaseService.updateVehicle(id, updates);
            if (updated) {
              setChosenVehicle(updated);
              setVehicles(firebaseService.getVehicles());
            } else {
              const updatedVehicle = { ...chosenVehicle, ...updates };
              setChosenVehicle(updatedVehicle);
              setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
            }
          }}
          onDeleteVehicle={(id) => {
            firebaseService.deleteVehicle(id);
            setVehicles(firebaseService.getVehicles());
            setChosenVehicle(null);
            setIsVehicleDetailModalOpen(false);
          }}
          onAddExpense={(vehicleId, expense, pushToKasse) => {
            firebaseService.addVehicleExpense(vehicleId, expense, pushToKasse);
            const updatedVehicle = firebaseService.getVehicleById(vehicleId);
            if (updatedVehicle) setChosenVehicle(updatedVehicle);
            setVehicles(firebaseService.getVehicles());
          }}
          onDeleteExpense={(vehicleId, expenseId) => {
            firebaseService.deleteVehicleExpense(vehicleId, expenseId);
            const updatedVehicle = firebaseService.getVehicleById(vehicleId);
            if (updatedVehicle) setChosenVehicle(updatedVehicle);
            setVehicles(firebaseService.getVehicles());
          }}
          setActiveTab={setActiveTab}
          onEditVehicleMaster={(veh, tab) => {
            setIsVehicleDetailModalOpen(false);
            if (onEditVehicleMaster) {
              onEditVehicleMaster(veh, tab || 'operationen', 'uebergabeprotokoll', chosenCustomer);
            }
          }}
        />
      )}

      {/* Druckvorschau Modal (A4 DIN 5008 Summary & Print Preview) */}
      <DruckvorschauModal
        isOpen={isDruckvorschauOpen}
        onClose={() => setIsDruckvorschauOpen(false)}
        documentType={selectedDocId}
        onChangeDocumentType={(newType) => setSelectedDocId(newType)}
        documentNumber={docNumber}
        date={docDate}
        dueDate={paymentTerms}
        validUntil={docDate}
        customer={chosenCustomer}
        manualCustomer={!chosenCustomer ? { name: 'Kunde', city: 'Berlin' } : null}
        vehicles={vehicleItems}
        paymentMethod={provisionalPayment?.paymentMethod || 'Überweisung'}
        depositAmount={depositAmount}
        introText={greetingText}
        warrantyText={warrantyText}
        exportText={exportText}
        notes={sondervereinbarung}
        merchantSettings={merchantSettings}
        probefahrtLicensePlate={probefahrtPlate}
        probefahrtDrivingLicense={drivingLicenseNumber}
        probefahrtDurationHours={Math.round(probefahrtDuration / 60) || 1}
        probefahrtDeposit={probefahrtDeposit}
        probefahrtDeductible={probefahrtDeductible}
        probefahrtDetails={probefahrtDetails}
        uebergabeprotokollDetails={uebergabeprotokollDetails}
        kaufvertragDetails={kaufvertragDetails}
        exportCountry={chosenCustomer?.country || 'Polen'}
        exportVatId={chosenCustomer?.vatId || ''}
        gelangensbestaetigungDetails={gelangensbestaetigungDetails}
        onUpdateGelangensbestaetigungDetails={(updates) => setGelangensbestaetigungDetails(prev => ({ ...prev, ...updates }))}
        onSignGelangensbestaetigung={() => setIsGelangensSignModalOpen(true)}
        onClearGelangensbestaetigungSignature={() => setGelangensbestaetigungDetails(prev => ({ ...prev, signatureDataUrl: undefined }))}
        eRechnungBuyerRef={chosenCustomer?.vatId || '991-12345-67'}
        eRechnungFormat="XRechnung"
        provisionalPayment={provisionalPayment}
        onSaveDocument={() => handleSaveDocument()}
        isSaving={isSaving}
      />

      </div>
    </div>
  );
};
