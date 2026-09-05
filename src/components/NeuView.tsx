import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  UserPlus, 
  Save, 
  UploadCloud, 
  Check, 
  Sparkles, 
  FileText, 
  Info, 
  Percent, 
  Euro, 
  Gauge, 
  Calendar,
  Building, 
  UserCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  FileCheck, 
  ShieldCheck, 
  Wrench, 
  Eye, 
  Sliders, 
  Star, 
  Layers, 
  MapPin, 
  ArrowLeft, 
  Building2, 
  CreditCard, 
  Hash, 
  AlertCircle,
  Wallet,
  Banknote,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileSpreadsheet,
  Database,
  Search
} from 'lucide-react';
import { Vehicle, Customer, NavTab, PaymentInstallment, VehicleDamageEntry, VehicleDocumentItem } from '../types';
import { 
  VEHICLE_DATASET, 
  getModelsForBrand, 
  getBrandMetadata 
} from '../data/vehicleDatabase';
import { compressImage } from '../utils/mediaProcessor';
import { 
  lookupHsnTsn, 
  normalizeHsn, 
  normalizeTsn, 
  HsnTsnLookupResult,
  KBA_MANUFACTURERS,
  getAllKbaBrands,
  getKbaModelsForBrand
} from '../data/hsnTsnDatabase';
import { 
  BODY_TYPE_OPTIONS,
  FUEL_TYPE_OPTIONS,
  TRANSMISSION_OPTIONS,
  COLOR_OPTIONS,
  LOCATION_OPTIONS,
  DRIVE_TYPE_OPTIONS,
  DOORS_OPTIONS,
  SEATS_OPTIONS,
  EMISSION_OPTIONS,
  OWNERS_OPTIONS,
  SELLER_TYPE_OPTIONS,
  VARIANT_OPTIONS,
  ENGINE_CONDITION_OPTIONS,
  TRANSMISSION_CONDITION_OPTIONS,
  BRAKES_TIRES_OPTIONS,
  PAINT_CONDITION_OPTIONS,
  INTERIOR_CONDITION_OPTIONS
} from '../data/vehiclePresets';
import { VehicleCombobox, ComboboxOption, RequiredAsterisk } from './VehicleCombobox';
import { TuvMonthYearPicker } from './TuvMonthYearPicker';
import { ZustandsberichtSection } from './ZustandsberichtSection';
import { VehicleDocumentUploadSection } from './VehicleDocumentUploadSection';

interface NeuViewProps {
  onAddVehicle: (vehicle: Partial<Vehicle>) => void;
  onUpdateVehicle?: (id: string, updates: Partial<Vehicle>) => void;
  onAddCustomer: (customer: Partial<Customer>) => void;
  setActiveTab?: (tab: NavTab) => void;
  editingVehicle?: Vehicle | null;
  returnTab?: NavTab;
  onCancelEdit?: () => void;
  prefillVehicleData?: Partial<Vehicle> | null;
  prefillCustomerData?: Partial<Customer> | null;
  onClearPrefill?: () => void;
}

// Preset equipment items
const PRESET_FEATURES = [
  'Klimaanlage',
  '2-Zonen-Klimaautomatik',
  'Navigationssystem Plus',
  'Parkassistent (PDC)',
  'Rückfahrkamera',
  '360° Surround-Kamera',
  'LED-Scheinwerfer',
  'Matrix LED / Laserlicht',
  'Panoramaglasdach',
  'Sitzheizung vorne',
  'Sitzbelüftung',
  'Lenkradheizung',
  'Abstandstempomat (ACC)',
  'Apple CarPlay & Android Auto',
  'Lederausstattung Nappa',
  'Allradantrieb (4x4)',
  'Anhängerkupplung',
  'Bluetooth Freisprecheinrichtung',
  'Totwinkel-Assistent',
  'Spurhalteassistent',
  'Head-Up Display',
  'Elektrische Heckklappe',
  'Soundsystem Premium',
  'Alarmanlage',
  'Keyless-Go & Start',
  'DAB+ Digitalradio',
  'Ambientebeleuchtung Mehrfarbig',
  'Schaltwippen am Lenkrad'
];

// Sample default vehicle images
const DEFAULT_SAMPLE_IMAGES: string[] = [];

export const NeuView: React.FC<NeuViewProps> = ({ 
  onAddVehicle, 
  onUpdateVehicle,
  onAddCustomer,
  setActiveTab,
  editingVehicle,
  returnTab,
  onCancelEdit,
  prefillVehicleData,
  prefillCustomerData,
  onClearPrefill
}) => {
  const [activeFormTab, setActiveFormTab] = useState<'vehicle' | 'customer'>('vehicle');
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Accordion state for Vehicle Form - Strictly only Basisdaten open by default in create mode, all open in edit mode!
  const [openSectionBasic, setOpenSectionBasic] = useState(true);
  const [openSectionEngine, setOpenSectionEngine] = useState(false);
  const [openSectionFinance, setOpenSectionFinance] = useState(false);
  const [openSectionFeatures, setOpenSectionFeatures] = useState(false);
  const [openSectionCondition, setOpenSectionCondition] = useState(false);
  const [openSectionDescription, setOpenSectionDescription] = useState(false);
  const [openSectionMedia, setOpenSectionMedia] = useState(false);

  // Accordion state for Customer Form
  const [openCustSectionStamm, setOpenCustSectionStamm] = useState(true);
  const [openCustSectionAddress, setOpenCustSectionAddress] = useState(true);
  const [openCustSectionTax, setOpenCustSectionTax] = useState(true);

  // Master Accordion Controls
  const handleOpenAllVehicle = () => {
    setOpenSectionBasic(true);
    setOpenSectionEngine(true);
    setOpenSectionFinance(true);
    setOpenSectionFeatures(true);
    setOpenSectionCondition(true);
    setOpenSectionDescription(true);
    setOpenSectionMedia(true);
  };

  const handleCloseAllVehicle = () => {
    setOpenSectionBasic(false);
    setOpenSectionEngine(false);
    setOpenSectionFinance(false);
    setOpenSectionFeatures(false);
    setOpenSectionCondition(false);
    setOpenSectionDescription(false);
    setOpenSectionMedia(false);
  };

  const handleOpenAllCustomer = () => {
    setOpenCustSectionStamm(true);
    setOpenCustSectionAddress(true);
    setOpenCustSectionTax(true);
  };

  const handleCloseAllCustomer = () => {
    setOpenCustSectionStamm(false);
    setOpenCustSectionAddress(false);
    setOpenCustSectionTax(false);
  };

  // ----------------------------------------------------
  // VEHICLE STATE
  // ----------------------------------------------------
  
  // HSN & TSN Identification State
  const [hsnInput, setHsnInput] = useState('');
  const [tsnInput, setTsnInput] = useState('');
  const [hsnTsnLookupStatus, setHsnTsnLookupStatus] = useState<HsnTsnLookupResult | null>(null);
  const [isSearchingHsnTsn, setIsSearchingHsnTsn] = useState(false);
  const [isSearchingAi, setIsSearchingAi] = useState(false);

  // Section 1: Basisdaten & Fahrzeugidentifikation
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [vin, setVin] = useState('');
  const [firstRegistration, setFirstRegistration] = useState('');
  const [mileage, setMileage] = useState<number | ''>('');
  const [color, setColor] = useState('');
  const [isMetallic, setIsMetallic] = useState<boolean>(false);
  const [bodyType, setBodyType] = useState('');

  // Section 2: Antrieb, Motor & Umwelt
  const [powerKw, setPowerKw] = useState<number | ''>('');
  const [powerPs, setPowerPs] = useState<number | ''>('');
  const [displacementCc, setDisplacementCc] = useState<number | ''>('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [driveType, setDriveType] = useState('');
  const [doors, setDoors] = useState('');
  const [seats, setSeats] = useState('');
  const [emissionClass, setEmissionClass] = useState('');
  const [ownersCount, setOwnersCount] = useState('');
  const [location, setLocation] = useState('');

  // Section 3: Einkauf & Finanzen
  const [purchaseDate, setPurchaseDate] = useState('');
  const [taxType, setTaxType] = useState<'diff_25a' | 'standard_19'>('diff_25a');
  const [sellerType, setSellerType] = useState('');
  const [totalPurchasePrice, setTotalPurchasePrice] = useState<number | ''>('');
  const [expectedSellingPrice, setExpectedSellingPrice] = useState<number | ''>('');
  
  // Payment Mode
  const [paymentMode, setPaymentMode] = useState<'komplett' | 'teilzahlung'>('komplett');
  const [fullPaymentMethod, setFullPaymentMethod] = useState<'Banküberweisung' | 'Bar' | 'Gemischt'>('Banküberweisung');
  const [fullPaymentCashSplit, setFullPaymentCashSplit] = useState<number>(0);

  // Multi-Payment Tracker Installments
  const [paymentInstallments, setPaymentInstallments] = useState<PaymentInstallment[]>([]);

  // Section 4: Ausstattung & Extras
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // Section 5: Zustand, Begutachtung & TÜV
  const [engineCondition, setEngineCondition] = useState('');
  const [transmissionCondition, setTransmissionCondition] = useState('');
  const [brakesTiresCondition, setBrakesTiresCondition] = useState('');
  const [tuvDate, setTuvDate] = useState('');
  const [serviceHistory, setServiceHistory] = useState<boolean>(false);
  const [lastService, setLastService] = useState('');
  
  const [paintCondition, setPaintCondition] = useState('');
  const [interiorCondition, setInteriorCondition] = useState('');
  const [accidentFree, setAccidentFree] = useState<boolean>(true);
  const [damagesNotes, setDamagesNotes] = useState('');
  const [paintThicknessUm, setPaintThicknessUm] = useState<number | ''>('');

  // Damage Entries
  const [damageEntries, setDamageEntries] = useState<VehicleDamageEntry[]>([]);

  // Section 6: Fahrzeugbeschreibung & Inseratstext (AutoScout24 / Mobile.de / Web-Showroom)
  const [description, setDescription] = useState<string>('');
  const [isGeneratingAiDescription, setIsGeneratingAiDescription] = useState(false);
  const [hsnTsn, setHsnTsn] = useState('');
  const [fuelConsumptionCombined, setFuelConsumptionCombined] = useState('');
  const [fuelConsumptionCity, setFuelConsumptionCity] = useState('');
  const [fuelConsumptionHighway, setFuelConsumptionHighway] = useState('');
  const [co2Emissions, setCo2Emissions] = useState('');
  const [environmentalBadge, setEnvironmentalBadge] = useState('');
  const [nonSmoker, setNonSmoker] = useState<boolean>(true);
  const [guaranteeMonths, setGuaranteeMonths] = useState<string>('');
  const [upholsteryType, setUpholsteryType] = useState<string>('');
  const [interiorColor, setInteriorColor] = useState<string>('');

  // AI Description Generator for AutoScout / Mobile / Showroom
  const handleGenerateAiDescription = async () => {
    setIsGeneratingAiDescription(true);
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'marketing_description',
          vehicleData: {
            brand,
            model,
            variant,
            firstRegistration,
            mileage,
            powerPs,
            fuelType,
            transmission,
            color,
            features: selectedFeatures,
            ownersCount,
            tuvDate,
            serviceHistory,
            lastService,
            accidentFree
          }
        })
      });
      const data = await response.json();
      if (data.result && typeof data.result === 'string') {
        setDescription(data.result);
      }
    } catch (err) {
      console.warn('AI Description fallback:', err);
      setDescription(
        `Exklusives Angebot: ${brand} ${model} (${variant || ''})\n\n` +
        `• Erstzulassung: ${firstRegistration || 'Neu'} | Kilometerstand: ${mileage ? mileage.toLocaleString('de-DE') + ' km' : '0 km'}\n` +
        `• Motor & Leistung: ${powerPs} PS / ${powerKw} kW (${fuelType}, ${transmission})\n` +
        `• Zustand: ${serviceHistory ? 'Lückenlos scheckheftgepflegt' : 'Geprüft'}, TÜV bis ${tuvDate || 'Neu'}\n` +
        `• Ausstattungs-Highlights: ${selectedFeatures.slice(0, 8).join(', ')}\n\n` +
        `Besichtigung und Probefahrt jederzeit nach Terminabsprache möglich. Inzahlungnahme und Finanzierung auf Wunsch realisierbar.`
      );
    } finally {
      setIsGeneratingAiDescription(false);
    }
  };

  // Section 7: Medien & Dokumente (Categorized Document Uploads)
  const [images, setImages] = useState<string[]>([]);
  const [vehicleDocuments, setVehicleDocuments] = useState<VehicleDocumentItem[]>([]);

  // Deep Pre-fill and Auto-Open when editing a vehicle (Full-Page Master Form Workflow)
  useEffect(() => {
    if (editingVehicle) {
      setActiveFormTab('vehicle');
      // Open ALL sections immediately for deep, unrestricted master editing
      setOpenSectionBasic(true);
      setOpenSectionEngine(true);
      setOpenSectionFinance(true);
      setOpenSectionFeatures(true);
      setOpenSectionCondition(true);
      setOpenSectionMedia(true);

      // Populate Basisdaten
      setBrand(editingVehicle.brand || '');
      setModel(editingVehicle.model || '');
      setVariant(editingVehicle.variant || '');
      setVin(editingVehicle.vin || '');
      setFirstRegistration(editingVehicle.firstRegistration || '');
      setMileage(editingVehicle.mileage !== undefined && editingVehicle.mileage !== null ? editingVehicle.mileage : '');
      setColor(editingVehicle.color || '');
      setIsMetallic(editingVehicle.isMetallic ?? false);
      setBodyType(editingVehicle.bodyType || '');

      // Populate Motor & Antrieb
      setPowerKw(editingVehicle.powerKw || (editingVehicle.powerPs ? Math.round(editingVehicle.powerPs * 0.735) : ''));
      setPowerPs(editingVehicle.powerPs || (editingVehicle.powerKw ? Math.round(editingVehicle.powerKw * 1.36) : ''));
      setDisplacementCc(editingVehicle.displacementCc || '');
      setFuelType(editingVehicle.fuelType || '');
      setTransmission(editingVehicle.transmission || '');
      setDriveType(editingVehicle.driveType || '');
      setDoors(editingVehicle.doors || '');
      setSeats(editingVehicle.seats || '');
      setEmissionClass(editingVehicle.emissionClass || '');
      setOwnersCount(editingVehicle.ownersCount || '');
      setLocation(editingVehicle.location || '');

      // Populate Einkauf & Finanzen
      setPurchaseDate(editingVehicle.purchaseDate || '');
      setTaxType(editingVehicle.taxType || 'diff_25a');
      setSellerType(editingVehicle.sellerType || '');
      setTotalPurchasePrice(editingVehicle.purchasePrice !== undefined && editingVehicle.purchasePrice !== null ? editingVehicle.purchasePrice : '');
      setExpectedSellingPrice(editingVehicle.sellingPrice || editingVehicle.expectedSellingPrice || '');
      setPaymentMode(editingVehicle.paymentMode || 'komplett');
      setFullPaymentMethod((editingVehicle.purchaseCash && !editingVehicle.purchaseBank) ? 'Bar' : 'Banküberweisung');
      setFullPaymentCashSplit(editingVehicle.purchaseCash || 0);
      setPaymentInstallments(editingVehicle.paymentInstallments && editingVehicle.paymentInstallments.length > 0 
        ? editingVehicle.paymentInstallments 
        : []
      );

      // Populate Ausstattung
      setSelectedFeatures(editingVehicle.features || []);

      // Populate Zustandsbericht & Mängel
      const mech = editingVehicle.conditionMechanical;
      setEngineCondition(mech?.engine || mech?.engineCondition || '');
      setTransmissionCondition(mech?.transmission || '');
      setBrakesTiresCondition(mech?.brakesTires || mech?.brakePads || '');
      setTuvDate(mech?.tuvDate || '');
      setServiceHistory(mech?.serviceHistory ?? false);
      setLastService(mech?.lastService || '');

      const vis = editingVehicle.conditionVisual;
      setPaintCondition(vis?.paintCondition || '');
      setInteriorCondition(vis?.interiorCondition || '');
      setAccidentFree(vis?.accidentFree ?? true);
      setDamagesNotes(vis?.damagesNotes || '');
      setPaintThicknessUm(vis?.paintThicknessUm !== undefined && vis?.paintThicknessUm !== null ? vis.paintThicknessUm : '');

      // Populate Beschreibung & AutoScout Details
      setDescription(editingVehicle.description || editingVehicle.beschreibung || '');
      setHsnTsn(editingVehicle.hsnTsn || '');
      if (editingVehicle.hsnTsn) {
        const parts = editingVehicle.hsnTsn.split('/');
        if (parts.length >= 2) {
          setHsnInput(parts[0].trim());
          setTsnInput(parts[1].trim());
        } else {
          setHsnInput(editingVehicle.hsnTsn.trim());
        }
      }
      setFuelConsumptionCombined(editingVehicle.fuelConsumptionCombined || '');
      setFuelConsumptionCity(editingVehicle.fuelConsumptionCity || '');
      setFuelConsumptionHighway(editingVehicle.fuelConsumptionHighway || '');
      setCo2Emissions(editingVehicle.co2Emissions || '');
      setEnvironmentalBadge(editingVehicle.environmentalBadge || '');
      setNonSmoker(editingVehicle.nonSmoker ?? true);
      setGuaranteeMonths(editingVehicle.guaranteeMonths ? String(editingVehicle.guaranteeMonths) : '');
      setUpholsteryType(editingVehicle.upholsteryType || '');
      setInteriorColor(editingVehicle.interiorColor || '');

      setDamageEntries(editingVehicle.damageEntries || []);
      setImages(editingVehicle.images && editingVehicle.images.length > 0 
        ? editingVehicle.images 
        : (editingVehicle.imageUrl ? [editingVehicle.imageUrl] : [])
      );
      setVehicleDocuments(editingVehicle.documents || []);
    }
  }, [editingVehicle]);

  // AI Assistant Pre-fill Auto-Population
  useEffect(() => {
    if (prefillVehicleData) {
      setActiveFormTab('vehicle');
      
      // Open all relevant sections for user inspection & approval
      setOpenSectionBasic(true);
      setOpenSectionEngine(true);
      setOpenSectionFinance(true);
      setOpenSectionFeatures(true);
      setOpenSectionCondition(true);
      setOpenSectionDescription(true);
      setOpenSectionMedia(true);

      if (prefillVehicleData.description || prefillVehicleData.beschreibung) {
        setDescription(prefillVehicleData.description || prefillVehicleData.beschreibung || '');
      }
      if (prefillVehicleData.hsnTsn) {
        setHsnTsn(prefillVehicleData.hsnTsn);
        const parts = prefillVehicleData.hsnTsn.split('/');
        if (parts.length >= 2) {
          setHsnInput(parts[0].trim());
          setTsnInput(parts[1].trim());
        } else {
          setHsnInput(prefillVehicleData.hsnTsn.trim());
        }
      }

      if (prefillVehicleData.brand) setBrand(prefillVehicleData.brand);
      if (prefillVehicleData.model) setModel(prefillVehicleData.model);
      if (prefillVehicleData.variant) setVariant(prefillVehicleData.variant);
      if (prefillVehicleData.vin) setVin(prefillVehicleData.vin);
      if (prefillVehicleData.firstRegistration) setFirstRegistration(prefillVehicleData.firstRegistration);
      if (prefillVehicleData.mileage !== undefined) setMileage(prefillVehicleData.mileage);
      if (prefillVehicleData.color) setColor(prefillVehicleData.color);
      if (prefillVehicleData.bodyType) setBodyType(prefillVehicleData.bodyType);
      
      if (prefillVehicleData.powerKw) {
        setPowerKw(prefillVehicleData.powerKw);
        setPowerPs(prefillVehicleData.powerPs || Math.round(prefillVehicleData.powerKw * 1.35962));
      } else if (prefillVehicleData.powerPs) {
        setPowerPs(prefillVehicleData.powerPs);
        setPowerKw(Math.round(prefillVehicleData.powerPs / 1.35962));
      }

      if (prefillVehicleData.displacementCc) setDisplacementCc(prefillVehicleData.displacementCc);
      if (prefillVehicleData.fuelType) setFuelType(prefillVehicleData.fuelType);
      if (prefillVehicleData.transmission) setTransmission(prefillVehicleData.transmission);
      if (prefillVehicleData.emissionClass) setEmissionClass(prefillVehicleData.emissionClass);
      
      if (prefillVehicleData.purchasePrice) {
        setTotalPurchasePrice(prefillVehicleData.purchasePrice);
        setExpectedSellingPrice(prefillVehicleData.sellingPrice || Math.round(prefillVehicleData.purchasePrice * 1.18));
      }
      if (prefillVehicleData.taxType) setTaxType(prefillVehicleData.taxType);
    }
  }, [prefillVehicleData]);

  useEffect(() => {
    if (prefillCustomerData) {
      setActiveFormTab('customer');
      setOpenCustSectionStamm(true);
      setOpenCustSectionAddress(true);
      setOpenCustSectionTax(true);

      if (prefillCustomerData.type) setCustType(prefillCustomerData.type);
      if (prefillCustomerData.salutation) setSalutation(prefillCustomerData.salutation);
      
      if (prefillCustomerData.name) {
        const parts = prefillCustomerData.name.trim().split(' ');
        if (parts.length > 1) {
          setFirstName(parts.slice(0, -1).join(' '));
          setLastName(parts[parts.length - 1]);
        } else {
          setFirstName(prefillCustomerData.name);
          setLastName('');
        }
      }
      if (prefillCustomerData.companyName) setCompanyName(prefillCustomerData.companyName);
      if (prefillCustomerData.street) setStreet(prefillCustomerData.street);
      if (prefillCustomerData.postalCode) setPostalCode(prefillCustomerData.postalCode);
      if (prefillCustomerData.city) setCity(prefillCustomerData.city);
      if (prefillCustomerData.country) setCountry(prefillCustomerData.country);
      if (prefillCustomerData.phone) setPhone(prefillCustomerData.phone);
      if (prefillCustomerData.email) setEmail(prefillCustomerData.email);
      if (prefillCustomerData.vatId) setVatId(prefillCustomerData.vatId);
      if (prefillCustomerData.taxNumber) setTaxNumber(prefillCustomerData.taxNumber);
    }
  }, [prefillCustomerData]);

  // Guarantee view scrolls to the very top immediately upon mounting or mode change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [activeFormTab, editingVehicle]);

  // ----------------------------------------------------
  // CUSTOMER STATE
  // ----------------------------------------------------
  const [custType, setCustType] = useState<'B2C' | 'B2B'>('B2C');
  const [salutation, setSalutation] = useState<'Herr' | 'Frau' | 'Firma'>('Herr');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Deutschland');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [vatId, setVatId] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Dynamic KW & PS calculations (1 KW ≈ 1.35962 PS)
  const handleKwChange = (kw: number | '') => {
    if (kw === '' || isNaN(Number(kw)) || Number(kw) <= 0) {
      setPowerKw('');
      setPowerPs('');
      return;
    }
    const val = Number(kw);
    setPowerKw(val);
    setPowerPs(Math.round(val * 1.35962));
  };

  const handlePsChange = (ps: number | '') => {
    if (ps === '' || isNaN(Number(ps)) || Number(ps) <= 0) {
      setPowerPs('');
      setPowerKw('');
      return;
    }
    const val = Number(ps);
    setPowerPs(val);
    setPowerKw(Math.round(val / 1.35962));
  };

  // ----------------------------------------------------
  // Helper: Reset Technical Spec fields to avoid stale data carry-over
  // ----------------------------------------------------
  const resetTechnicalSpecs = () => {
    setPowerKw('');
    setPowerPs('');
    setDisplacementCc('');
    setFuelType('');
    setTransmission('');
    setDriveType('');
    setDoors('');
    setSeats('');
    setEmissionClass('');
    setBodyType('');
    setCo2Emissions('');
    setFuelConsumptionCombined('');
    setFuelConsumptionCity('');
    setFuelConsumptionHighway('');
    setVariant('');
  };

  // ----------------------------------------------------
  // Helper: Full Reset for Starting Fresh
  // ----------------------------------------------------
  const resetAllVehicleFields = (clearHsnTsn = true) => {
    if (clearHsnTsn) {
      setHsnInput('');
      setTsnInput('');
      setHsnTsn('');
      setHsnTsnLookupStatus(null);
    }
    setBrand('');
    setModel('');
    setVariant('');
    setVin('');
    setFirstRegistration('');
    setMileage('');
    setColor('');
    setIsMetallic(false);
    setBodyType('');
    setPowerKw('');
    setPowerPs('');
    setDisplacementCc('');
    setFuelType('');
    setTransmission('');
    setDriveType('');
    setDoors('');
    setSeats('');
    setEmissionClass('');
    setOwnersCount('');
    setLocation('');
    setPurchaseDate('');
    setTaxType('diff_25a');
    setSellerType('');
    setTotalPurchasePrice('');
    setExpectedSellingPrice('');
    setPaymentMode('komplett');
    setFullPaymentMethod('Banküberweisung');
    setFullPaymentCashSplit(0);
    setPaymentInstallments([]);
    setSelectedFeatures([]);
    setCustomFeatureInput('');
    setEngineCondition('');
    setTransmissionCondition('');
    setBrakesTiresCondition('');
    setTuvDate('');
    setServiceHistory(false);
    setLastService('');
    setPaintCondition('');
    setInteriorCondition('');
    setAccidentFree(true);
    setDamagesNotes('');
    setDescription('');
    setFuelConsumptionCombined('');
    setFuelConsumptionCity('');
    setFuelConsumptionHighway('');
    setCo2Emissions('');
    setEnvironmentalBadge('');
    setNonSmoker(true);
    setGuaranteeMonths('');
    setUpholsteryType('');
    setInteriorColor('');
    setDamageEntries([]);
    setImages([]);
    setVehicleDocuments([]);
  };

  // ----------------------------------------------------
  // HSN Input Handler with Auto-Reset on new 4-digit HSN
  // ----------------------------------------------------
  const handleHsnInputChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 4);
    const prevHsn = hsnInput;
    setHsnInput(clean);

    if (clean !== prevHsn) {
      setHsnTsnLookupStatus(null);

      // When a new complete 4-digit HSN is entered:
      if (clean.length === 4) {
        // Reset all vehicle fields & prices cleanly so no previous data persists
        resetAllVehicleFields(false); // preserves HSN
        setHsnInput(clean);
        setTsnInput('');
        setHsnTsn(clean);

        // Instant manufacturer lookup
        const localResult = lookupHsnTsn(clean, '');
        if (localResult.found && localResult.manufacturer) {
          setBrand(localResult.manufacturer.brand);
          setHsnTsnLookupStatus({
            found: true,
            matchType: 'manufacturer',
            message: `Hersteller erkannt: ${localResult.manufacturer.brand} (${localResult.manufacturer.country}). Alle Felder wurden für die Neueingabe geleert. Bitte TSN eingeben.`
          });
        }
      }
    }
  };

  // ----------------------------------------------------
  // HSN / TSN Fahrzeug-Erkennung (KBA Lookup)
  // STRIKTE VORGABE: Nur exakt belegbare Werksdaten füllen.
  // Individuelle Werte (Kilometer, Zulassung, FIN, Farbe, Preis) bleiben unberührt!
  // ----------------------------------------------------
  const handleDetectVehicleByHsnTsn = () => {
    const rawHsn = hsnInput.trim();
    const rawTsn = tsnInput.trim();

    if (!rawHsn) {
      setHsnTsnLookupStatus({
        found: false,
        matchType: 'none',
        message: 'Bitte geben Sie die 4-stellige HSN (z.B. 0005 für BMW, 0588 für Audi) ein.'
      });
      return;
    }

    // Clear dependent technical specs prior to applying fresh lookup
    resetTechnicalSpecs();
    setIsSearchingHsnTsn(true);

    try {
      // 100% Deterministic instant KBA lookup (Pure KBA list, 0 AI)
      const localResult = lookupHsnTsn(rawHsn, rawTsn);

      if (localResult.found && localResult.record && localResult.matchType === 'exact') {
        const rec = localResult.record;
        if (rec.brand && rec.brand !== '0') setBrand(rec.brand);
        if (rec.model && rec.model !== '0') setModel(rec.model);
        if (rec.variant && rec.variant !== '0') setVariant(rec.variant);
        if (rec.powerKw && Number(rec.powerKw) > 0) handleKwChange(Number(rec.powerKw));
        else if (rec.powerPs && Number(rec.powerPs) > 0) handlePsChange(Number(rec.powerPs));
        if (rec.displacementCc && Number(rec.displacementCc) > 0) setDisplacementCc(Number(rec.displacementCc));
        if (rec.fuelType && rec.fuelType !== '0') setFuelType(rec.fuelType);
        if (rec.bodyType && rec.bodyType !== '0') setBodyType(rec.bodyType);
        if (rec.transmission && rec.transmission !== '0') setTransmission(rec.transmission);
        if (rec.emissionClass && rec.emissionClass !== '0') setEmissionClass(rec.emissionClass);
        if (rec.doors && rec.doors !== '0') setDoors(rec.doors);
        if (rec.seats && rec.seats !== '0') setSeats(rec.seats);
        if (rec.co2Emissions && rec.co2Emissions !== '0') setCo2Emissions(rec.co2Emissions);
        setHsnTsn(rawTsn ? `${rec.hsn}/${rec.tsn}` : rec.hsn);

        const specsInfo = rec.powerPs && rec.powerPs > 0 ? ` (${rec.powerPs} PS / ${rec.powerKw} kW)` : '';
        setHsnTsnLookupStatus({
          found: true,
          matchType: 'exact',
          message: `KBA-Register (Offiziell): ${rec.brand} ${rec.model}${specsInfo}`
        });
        return;
      }

      // 2. Fallback to local manufacturer match if recognized
      if (localResult.found && localResult.manufacturer) {
        setBrand(localResult.manufacturer.brand);
        setHsnTsnLookupStatus({
          found: true,
          matchType: 'manufacturer',
          message: `Hersteller erkannt: ${localResult.manufacturer.brand} (${localResult.manufacturer.country}). Modell kann gewählt werden.`
        });
      } else {
        setHsnTsnLookupStatus({
          found: false,
          matchType: 'none',
          message: `Kein KBA-Eintrag für HSN "${rawHsn}" ${rawTsn ? '/ TSN "' + rawTsn + '"' : ''} gefunden. Nutzen Sie 'KI erkennen' für gezielte Websuche.`
        });
      }
    } catch (err: any) {
      console.warn('HSN/TSN lookup error:', err);
      setHsnTsnLookupStatus({
        found: false,
        matchType: 'none',
        message: 'Fehler beim KBA-Abgleich. Bitte Daten manuell eintragen oder KI-Erkennung nutzen.'
      });
    } finally {
      setIsSearchingHsnTsn(false);
    }
  };

  // ----------------------------------------------------
  // Fast KI Fahrzeug-Erkennung & Internet-Recherche
  // Füllt schnell alle verifizierten technischen Felder aus
  // ----------------------------------------------------
  const handleDetectVehicleByAi = async () => {
    const rawHsn = hsnInput.trim();
    const rawTsn = tsnInput.trim();
    const curBrand = brand.trim();
    const curModel = model.trim();

    if (!rawHsn && !curBrand) {
      setHsnTsnLookupStatus({
        found: false,
        matchType: 'none',
        message: 'Bitte geben Sie die HSN (z.B. 0005) oder Marke & Modell ein, damit die KI suchen kann.'
      });
      return;
    }

    // Clear dependent technical specs prior to applying fresh KI transfer
    resetTechnicalSpecs();
    setIsSearchingAi(true);

    try {
      const resp = await fetch('/api/ai/fast-recognize-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hsn: rawHsn,
          tsn: rawTsn,
          brand: curBrand,
          model: curModel
        })
      });

      const data = await resp.json();

      if (data.found) {
        if (data.brand) setBrand(data.brand);
        if (data.model) setModel(data.model);
        if (data.variant) setVariant(data.variant);
        if (data.powerKw && Number(data.powerKw) > 0) handleKwChange(Number(data.powerKw));
        else if (data.powerPs && Number(data.powerPs) > 0) handlePsChange(Number(data.powerPs));
        if (data.displacementCc && Number(data.displacementCc) > 0) setDisplacementCc(Number(data.displacementCc));
        if (data.fuelType) setFuelType(data.fuelType);
        if (data.transmission) setTransmission(data.transmission);
        if (data.driveType) setDriveType(data.driveType);
        if (data.bodyType) setBodyType(data.bodyType);
        if (data.emissionClass) setEmissionClass(data.emissionClass);
        if (data.doors) setDoors(data.doors);
        if (data.seats) setSeats(data.seats);
        if (data.co2Emissions) setCo2Emissions(data.co2Emissions);
        if (data.fuelConsumptionCombined) setFuelConsumptionCombined(data.fuelConsumptionCombined);

        if (Array.isArray(data.suggestedFeatures) && data.suggestedFeatures.length > 0) {
          const combined = Array.from(new Set([...selectedFeatures, ...data.suggestedFeatures]));
          setSelectedFeatures(combined);
        }

        if (data.hsn) {
          setHsnInput(data.hsn);
          setHsnTsn(data.tsn ? `${data.hsn}/${data.tsn}` : data.hsn);
        }

        setHsnTsnLookupStatus({
          found: true,
          matchType: 'exact',
          message: data.message || `✨ KI-Erkennung erfolgreich: ${data.brand || curBrand} ${data.model || curModel}`
        });
      } else {
        setHsnTsnLookupStatus({
          found: false,
          matchType: 'none',
          message: data.message || 'Keine verifizierten Werksdaten gefunden. Daten bitte manuell ergänzen.'
        });
      }
    } catch (err: any) {
      console.warn('AI vehicle detection error:', err);
      setHsnTsnLookupStatus({
        found: false,
        matchType: 'none',
        message: 'Verbindungsfehler bei der KI-Recherche. Technische Daten bitte manuell ausfüllen.'
      });
    } finally {
      setIsSearchingAi(false);
    }
  };

  const handleClearHsnTsn = () => {
    setHsnInput('');
    setTsnInput('');
    setHsnTsnLookupStatus(null);
  };

  // Dynamic Brand & Model Options directly derived from kbaDatabase.json (Clean & Flag-free)
  const brandOptions: ComboboxOption[] = useMemo(() => {
    const kbaBrands = getAllKbaBrands();
    return kbaBrands.map((b) => {
      const meta = getBrandMetadata(b.brand);
      return {
        value: b.brand,
        label: b.brand,
        badge: meta?.category || (b.isPopular ? 'Beliebt' : undefined),
        subtext: meta?.country
          ? `${meta.country} • ${b.modelCount} KBA-Modelle`
          : `${b.modelCount} KBA-Modelle`
      };
    });
  }, []);

  const selectedBrandMetadata = useMemo(() => {
    return getBrandMetadata(brand);
  }, [brand]);

  const modelOptions: ComboboxOption[] = useMemo(() => {
    const rawModels = getModelsForBrand(brand);
    // Sort all models strictly alphabetically A to Z
    const models = [...rawModels].sort((a, b) => a.localeCompare(b, 'de', { numeric: true, sensitivity: 'base' }));
    return models.map((m) => {
      const isPopular = selectedBrandMetadata?.popularModels.some(
        pm => pm.toLowerCase() === m.toLowerCase()
      );
      return {
        value: m,
        label: m,
        badge: isPopular ? 'Bestseller' : undefined,
        subtext: isPopular ? `${brand} Top-Modell` : `${brand} Modell`
      };
    });
  }, [brand, selectedBrandMetadata]);

  const handleBrandChange = (newBrand: string) => {
    if (brand !== newBrand) {
      // Clear ALL vehicle input fields and prices when a new brand is selected in the manual dropdown
      resetAllVehicleFields(true);
      setBrand(newBrand);
    }
  };

  // Payment Calculation & Real-time Remaining Balance
  const totalInstallmentsAmount = useMemo(() => {
    return paymentInstallments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [paymentInstallments]);

  const remainingBalance = useMemo(() => {
    const purchaseNum = typeof totalPurchasePrice === 'number' ? totalPurchasePrice : (Number(totalPurchasePrice) || 0);
    return purchaseNum - totalInstallmentsAmount;
  }, [totalPurchasePrice, totalInstallmentsAmount]);

  const paymentPercentage = useMemo(() => {
    if (paymentMode === 'komplett') return 100;
    const purchaseNum = typeof totalPurchasePrice === 'number' ? totalPurchasePrice : (Number(totalPurchasePrice) || 0);
    if (purchaseNum <= 0) return 0;
    const pct = Math.round((totalInstallmentsAmount / purchaseNum) * 100);
    return Math.min(Math.max(pct, 0), 100);
  }, [paymentMode, totalInstallmentsAmount, totalPurchasePrice]);

  const handleAddInstallment = () => {
    const purchaseNum = typeof totalPurchasePrice === 'number' ? totalPurchasePrice : (Number(totalPurchasePrice) || 0);
    const remaining = purchaseNum - totalInstallmentsAmount;
    const newInst: PaymentInstallment = {
      id: `inst-${Date.now()}`,
      amount: remaining > 0 ? remaining : 0,
      date: new Date().toISOString().split('T')[0],
      method: 'Banküberweisung',
      note: remaining > 0 ? 'Restzahlung' : 'Teilzahlung'
    };
    setPaymentInstallments([...paymentInstallments, newInst]);
  };

  const handleAddRemainingAsInstallment = () => {
    if (remainingBalance <= 0) return;
    const newInst: PaymentInstallment = {
      id: `inst-${Date.now()}`,
      amount: remainingBalance,
      date: new Date().toISOString().split('T')[0],
      method: 'Banküberweisung',
      note: 'Restzahlung Ausgleich'
    };
    setPaymentInstallments([...paymentInstallments, newInst]);
  };

  const handleRemoveInstallment = (id: string) => {
    setPaymentInstallments(paymentInstallments.filter(i => i.id !== id));
  };

  const handleUpdateInstallment = (id: string, field: keyof PaymentInstallment, val: any) => {
    setPaymentInstallments(paymentInstallments.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  // Equipment selection
  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFeatureInput.trim() && !selectedFeatures.includes(customFeatureInput.trim())) {
      setSelectedFeatures([...selectedFeatures, customFeatureInput.trim()]);
      setCustomFeatureInput('');
    }
  };

  // Images Management with automatic high-efficiency compression
  const handleMockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files) as File[];
      
      // Compress each uploaded vehicle image to optimal 1600x1200 WebP/JPEG quality
      const compressedUrls = await Promise.all(
        fileList.map(async (file) => {
          try {
            const res = await compressImage(file, {
              maxWidth: 1600,
              maxHeight: 1200,
              quality: 0.84,
              format: 'image/jpeg'
            });
            return res.dataUrl;
          } catch (err) {
            console.error('Image compression failed, fallback to ObjectURL:', err);
            return URL.createObjectURL(file);
          }
        })
      );

      setImages([...images, ...compressedUrls].slice(0, 15));
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    setImages([target, ...rest]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  // Form Reset Actions
  const handleResetVehicleForm = () => {
    setHsnInput('');
    setTsnInput('');
    setHsnTsnLookupStatus(null);
    setBrand('');
    setModel('');
    setVariant('');
    setBodyType('');
    setVin('');
    setFirstRegistration('');
    setMileage('');
    setPowerKw('');
    setPowerPs('');
    setDisplacementCc('');
    setFuelType('');
    setTransmission('');
    setColor('');
    setIsMetallic(false);
    setLocation('');
    setDriveType('');
    setDoors('');
    setSeats('');
    setEmissionClass('');
    setOwnersCount('');
    setSellerType('');
    setPurchaseDate('');
    setTaxType('diff_25a');
    setTotalPurchasePrice('');
    setExpectedSellingPrice('');
    setPaymentMode('komplett');
    setFullPaymentMethod('Banküberweisung');
    setFullPaymentCashSplit(0);
    setPaymentInstallments([]);
    setSelectedFeatures([]);
    setCustomFeatureInput('');
    setEngineCondition('');
    setTransmissionCondition('');
    setBrakesTiresCondition('');
    setTuvDate('');
    setServiceHistory(false);
    setLastService('');
    setPaintCondition('');
    setInteriorCondition('');
    setAccidentFree(true);
    setDamagesNotes('');
    setPaintThicknessUm('');
    setDamageEntries([]);
    setDescription('');
    setHsnTsn('');
    setFuelConsumptionCombined('');
    setFuelConsumptionCity('');
    setFuelConsumptionHighway('');
    setCo2Emissions('');
    setEnvironmentalBadge('');
    setNonSmoker(true);
    setGuaranteeMonths('');
    setUpholsteryType('');
    setInteriorColor('');
    setImages([]);
    setVehicleDocuments([]);
  };

  const handleResetCustomerForm = () => {
    setCustType('B2C');
    setSalutation('Herr');
    setFirstName('');
    setLastName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setStreet('');
    setPostalCode('');
    setCity('');
    setCountry('Deutschland');
    setIdCardNumber('');
    setVatId('');
    setTaxNumber('');
    setCustNotes('');
  };

  // Form Submit Actions
  const handleSaveVehicle = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault?.();
    const primaryImg = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80';
    
    const finalCash = paymentMode === 'komplett'
      ? (fullPaymentMethod === 'Bar' ? totalPurchasePrice : (fullPaymentMethod === 'Gemischt' ? fullPaymentCashSplit : 0))
      : paymentInstallments.filter(i => i.method === 'Bar').reduce((s, i) => s + (Number(i.amount) || 0), 0);

    const finalBank = paymentMode === 'komplett'
      ? (fullPaymentMethod === 'Banküberweisung' ? totalPurchasePrice : (fullPaymentMethod === 'Gemischt' ? Math.max(0, totalPurchasePrice - fullPaymentCashSplit) : 0))
      : paymentInstallments.filter(i => i.method === 'Banküberweisung' || i.method === 'Scheck').reduce((s, i) => s + (Number(i.amount) || 0), 0);

    const finalInstallments: PaymentInstallment[] = paymentMode === 'teilzahlung'
      ? paymentInstallments
      : [
          {
            id: `inst-${Date.now()}`,
            amount: totalPurchasePrice,
            date: purchaseDate,
            method: fullPaymentMethod === 'Bar' ? 'Bar' : 'Banküberweisung',
            note: 'Komplettzahlung'
          }
        ];

    const vehiclePayload: Partial<Vehicle> = {
      brand,
      model,
      variant,
      vin,
      firstRegistration,
      mileage,
      powerKw,
      powerPs,
      displacementCc,
      fuelType,
      transmission,
      color,
      isMetallic,
      bodyType,
      driveType,
      doors,
      seats,
      emissionClass,
      ownersCount,
      sellerType,
      purchasePrice: totalPurchasePrice,
      purchaseDate,
      paymentMode,
      purchaseCash: finalCash,
      purchaseBank: finalBank,
      paymentInstallments: finalInstallments,
      sellingPrice: expectedSellingPrice || Math.round(totalPurchasePrice * 1.18),
      expectedSellingPrice,
      taxType,
      location,
      imageUrl: primaryImg,
      images,
      documents: vehicleDocuments,
      features: selectedFeatures,
      conditionMechanical: {
        engine: engineCondition,
        transmission: transmissionCondition,
        brakesTires: brakesTiresCondition,
        tuvDate,
        serviceHistory,
        lastService
      },
      conditionVisual: {
        paintCondition,
        interiorCondition,
        accidentFree,
        damagesNotes,
        paintThicknessUm
      },
      damageEntries,
      description,
      beschreibung: description,
      hsnTsn: (hsnInput.trim() && tsnInput.trim()) 
        ? `${normalizeHsn(hsnInput)}/${normalizeTsn(tsnInput)}` 
        : (hsnInput.trim() ? normalizeHsn(hsnInput) : (hsnTsn || '')),
      fuelConsumptionCombined,
      fuelConsumptionCity,
      fuelConsumptionHighway,
      co2Emissions,
      environmentalBadge,
      nonSmoker,
      fullServiceHistory: serviceHistory,
      guaranteeMonths,
      upholsteryType,
      interiorColor
    };

    if (editingVehicle) {
      if (onUpdateVehicle) {
        onUpdateVehicle(editingVehicle.id, vehiclePayload);
      }
      setShowSuccessToast(`Änderungen an "${brand} ${model}" erfolgreich gespeichert!`);
      
      // Smart Return Loop: Return back to active protocol or Lager
      setTimeout(() => {
        if (onCancelEdit) {
          onCancelEdit();
        } else if (setActiveTab) {
          setActiveTab(returnTab || 'lager');
        }
      }, 400);
    } else {
      onAddVehicle({
        ...vehiclePayload,
        createdAt: new Date().toISOString(),
        status: 'verfuegbar',
        daysInStock: 0,
        expenses: [],
        totalExpenses: 0
      });

      setShowSuccessToast(`Fahrzeug "${brand} ${model}" erfolgreich zum Fahrzeugbestand hinzugefügt!`);
      setTimeout(() => setShowSuccessToast(null), 5000);
    }
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = custType === 'B2B' && companyName ? companyName : `${firstName} ${lastName}`.trim();
    
    onAddCustomer({
      type: custType,
      salutation,
      firstName,
      lastName,
      name: fullName || 'Neuer Kunde',
      companyName: custType === 'B2B' ? companyName : undefined,
      email,
      phone,
      street,
      postalCode,
      city,
      country,
      idCardNumber,
      vatId: custType === 'B2B' ? vatId : undefined,
      taxNumber: custType === 'B2B' ? taxNumber : undefined,
      notes: custNotes,
      purchasesCount: 0,
      totalSpent: 0,
      lastContact: 'Heute'
    });

    setShowSuccessToast(`Kunde "${fullName}" erfolgreich angelegt!`);
    setTimeout(() => setShowSuccessToast(null), 5000);
  };

  // Margin Calculation
  const purchasePriceNum = typeof totalPurchasePrice === 'number' ? totalPurchasePrice : (Number(totalPurchasePrice) || 0);
  const sellingPriceNum = typeof expectedSellingPrice === 'number' ? expectedSellingPrice : (Number(expectedSellingPrice) || 0);
  const calculatedMarginEuro = sellingPriceNum > 0 && purchasePriceNum > 0 ? (sellingPriceNum - purchasePriceNum) : 0;
  const calculatedMarginPercent = purchasePriceNum > 0 ? ((calculatedMarginEuro / purchasePriceNum) * 100).toFixed(1) : '0.0';

  return (
    <div id="neu-view-root" className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div 
          id="neu-success-toast"
          className="p-4 metallic-card-luminous border border-emerald-400/80 text-emerald-950 rounded-3xl flex items-center justify-between shadow-lg animate-fadeIn"
        >
          <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
            <div className="w-8 h-8 rounded-xl metallic-node text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold block text-slate-950 text-sm">Erfolgreich gespeichert</span>
              <span className="text-slate-700 text-xs font-semibold">{showSuccessToast}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowSuccessToast(null)}
            className="text-xs font-bold text-slate-900 hover:text-slate-950 px-3 py-1.5 metallic-card rounded-xl border border-white/40 shadow-xs transition cursor-pointer"
          >
            Schließen
          </button>
        </div>
      )}

      {/* 1. Clean Top Header Card */}
      <div className={`metallic-card-luminous rounded-3xl p-6 border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        editingVehicle ? 'border-emerald-400/80' : 'border-white/30'
      }`}>
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {editingVehicle ? 'Fahrzeugstammdaten & Begutachtung bearbeiten' : 'Neuanlage & Erfassung'}
            </h1>
            {editingVehicle && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white shadow-xs">
                Vollzugriff Master
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            {editingVehicle 
              ? `Vollständige Bearbeitung für ${brand || 'Fahrzeug'} ${model} (FIN: ${vin || 'Keine FIN'}). Änderungen werden direkt ins Dokument und den Bestand übertragen.`
              : 'Fahrzeuge zum Fahrzeugbestand hinzufügen oder Kundenstammdaten erfassen.'}
          </p>
        </div>

        {/* Action Controls / Tab Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {editingVehicle ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-cancel-edit-master-top"
                onClick={() => onCancelEdit ? onCancelEdit() : (setActiveTab ? setActiveTab(returnTab || 'lager') : undefined)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold metallic-btn-secondary text-slate-900 transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Zurück zu {returnTab === 'operationen' ? 'Übergabeprotokoll' : 'Lager'}</span>
              </button>

              <button
                type="button"
                id="btn-save-edit-master-top"
                onClick={handleSaveVehicle}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Speichern & Zurück</span>
              </button>
            </div>
          ) : (
            <div className="flex p-1 bg-slate-900/10 rounded-2xl border border-white/20">
              <button
                id="tab-btn-vehicle-mode"
                type="button"
                onClick={() => setActiveFormTab('vehicle')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeFormTab === 'vehicle'
                    ? 'metallic-btn-primary text-slate-950 shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Fahrzeug erfassen</span>
              </button>
              <button
                id="tab-btn-customer-mode"
                type="button"
                onClick={() => setActiveFormTab('customer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeFormTab === 'customer'
                    ? 'metallic-btn-primary text-slate-950 shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Kunde erfassen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: VEHICLE ENTRY FORM                                             */}
      {/* ========================================================================= */}
      {activeFormTab === 'vehicle' && (
        <form 
          id="form-vehicle-entry" 
          onSubmit={handleSaveVehicle} 
          className="space-y-6"
        >
          {/* Quick Expand/Collapse Actions */}
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
              <span>7 strukturierte Abschnitte</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-reset-all-vehicle-form"
                onClick={() => resetAllVehicleFields(true)}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 px-3 py-1.5 bg-rose-50/70 hover:bg-rose-100/80 rounded-xl border border-rose-200/60 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                title="Alle Felder leeren für saubere Neueingabe"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Felder leeren</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAllVehicle}
                className="text-xs font-semibold text-slate-800 hover:text-slate-950 px-3 py-1.5 metallic-card-luminous rounded-xl border border-white/30 transition cursor-pointer shadow-xs"
              >
                Alle aufklappen
              </button>
              <button
                type="button"
                onClick={handleCloseAllVehicle}
                className="text-xs font-semibold text-slate-800 hover:text-slate-950 px-3 py-1.5 metallic-card-luminous rounded-xl border border-white/30 transition cursor-pointer shadow-xs"
              >
                Alle zuklappen
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 1. BASISDATEN & FAHRZEUGIDENTIFIKATION                         */}
          {/* ------------------------------------------------------------- */}
          <div className="metallic-card-luminous rounded-3xl border border-white/40 shadow-md overflow-visible relative z-40">
            <div 
              onClick={() => setOpenSectionBasic(!openSectionBasic)}
              className={`px-6 py-4 hover:bg-white/40 transition cursor-pointer flex items-center justify-between ${
                openSectionBasic ? 'border-b border-slate-300/60 rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node text-slate-900 flex items-center justify-center font-bold">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    1. Basisdaten & Fahrzeugidentifikation
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Marke, Modell, Ausführung, VIN, Erstzulassung, Kilometerstand & Karosserie
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {openSectionBasic ? 'Einklappen' : 'Ausklappen'}
                </span>
                <div className="p-1 text-slate-600">
                  {openSectionBasic ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {openSectionBasic && (
              <div className="p-6 space-y-5 animate-fadeIn">
                {/* 0. HSN / TSN Schnell-Erkennung Bar - Kompakt & Passgenau */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900/5 via-blue-950/5 to-slate-900/5 border border-slate-300/80 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>HSN / TSN Eingabe & Schnell-Erkennung</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 border border-amber-500/30">
                            Feld 2.1 / 2.2
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Fahrzeugschein-Schlüssel für automatische technische Spezifikation
                        </div>
                      </div>
                    </div>

                    {/* Compact Input Fields & Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* HSN (4 Ziffern) - Klein & passgenau */}
                      <div className="flex items-center gap-1.5">
                        <label htmlFor="input-vehicle-hsn" className="text-xs font-bold text-slate-700 whitespace-nowrap">
                          HSN:
                        </label>
                        <input
                          type="text"
                          id="input-vehicle-hsn"
                          value={hsnInput}
                          onChange={(e) => handleHsnInputChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleDetectVehicleByHsnTsn();
                            }
                          }}
                          maxLength={4}
                          placeholder=""
                          className="w-20 px-2.5 py-1.5 metallic-input rounded-lg text-slate-900 font-mono text-xs font-bold tracking-wider text-center uppercase placeholder:text-slate-400"
                          title="Herstellerschlüsselnummer (4 Ziffern, z.B. 0005 für BMW, 0588 für Audi)"
                        />
                      </div>

                      {/* TSN (3-8 Zeichen) - Klein & passgenau */}
                      <div className="flex items-center gap-1.5">
                        <label htmlFor="input-vehicle-tsn" className="text-xs font-bold text-slate-700 whitespace-nowrap">
                          TSN:
                        </label>
                        <input
                          type="text"
                          id="input-vehicle-tsn"
                          value={tsnInput}
                          onChange={(e) => setTsnInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleDetectVehicleByHsnTsn();
                            }
                          }}
                          maxLength={8}
                          placeholder=""
                          className="w-24 px-2.5 py-1.5 metallic-input rounded-lg text-slate-900 font-mono text-xs font-bold tracking-wider text-center uppercase placeholder:text-slate-400"
                          title="Typschlüsselnummer (3-8 Zeichen, z.B. CSX)"
                        />
                      </div>

                      {/* Action Button: Fahrzeug erkennen (kompakt) */}
                      <button
                        type="button"
                        id="btn-detect-vehicle-hsn-tsn"
                        onClick={handleDetectVehicleByHsnTsn}
                        disabled={isSearchingHsnTsn || isSearchingAi || !hsnInput.trim()}
                        className="py-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded-lg shadow-2xs border border-slate-700/80 transition cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap"
                        title="Fahrzeug über offizielle KBA-Liste identifizieren (offline, 0ms)"
                      >
                        <Database className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{isSearchingHsnTsn ? 'Abgleich...' : 'Fzg. erkennen'}</span>
                      </button>

                      {/* Action Button: KI erkennen (klein daneben mit Live-Websuche) */}
                      <button
                        type="button"
                        id="btn-detect-vehicle-ai"
                        onClick={handleDetectVehicleByAi}
                        disabled={isSearchingAi || isSearchingHsnTsn || (!hsnInput.trim() && !brand.trim())}
                        className="py-1 px-2.5 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 hover:from-indigo-900 hover:to-purple-900 text-amber-300 font-semibold text-[11px] rounded-lg shadow-2xs border border-indigo-500/40 hover:border-amber-400/60 transition cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap"
                        title="Fahrzeug über KI & Internet-Recherche analysieren und verifizierte Werksdaten ergänzen"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300 shrink-0 animate-pulse" />
                        <span>{isSearchingAi ? 'KI sucht...' : 'KI erkennen'}</span>
                      </button>

                      {/* Reset-Button */}
                      {(hsnInput || tsnInput || hsnTsnLookupStatus || brand || model) && (
                        <button
                          type="button"
                          id="btn-clear-vehicle-inputs"
                          onClick={() => {
                            handleClearHsnTsn();
                            resetTechnicalSpecs();
                          }}
                          className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50/80 transition cursor-pointer flex items-center gap-1"
                          title="Eingaben & Spezifikationen leeren"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span className="hidden sm:inline text-[10px]">Leeren</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Feedback */}
                  {hsnTsnLookupStatus && (
                    <div className={`mt-2.5 p-2.5 rounded-xl text-xs font-medium border flex items-start gap-2 animate-fadeIn ${
                      hsnTsnLookupStatus.found && hsnTsnLookupStatus.matchType === 'exact'
                        ? 'bg-emerald-500/10 text-emerald-950 border-emerald-500/30'
                        : hsnTsnLookupStatus.found && hsnTsnLookupStatus.matchType === 'manufacturer'
                        ? 'bg-blue-500/10 text-blue-950 border-blue-500/30'
                        : 'bg-amber-500/10 text-amber-950 border-amber-500/30'
                    }`}>
                      {hsnTsnLookupStatus.found && hsnTsnLookupStatus.matchType === 'exact' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : hsnTsnLookupStatus.found && hsnTsnLookupStatus.matchType === 'manufacturer' ? (
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-bold">{hsnTsnLookupStatus.message}</div>
                        {hsnTsnLookupStatus.found && hsnTsnLookupStatus.matchType === 'exact' && (
                          <div className="text-[11px] text-emerald-800 mt-0.5">
                            Technische Werksdaten wurden eingetragen. Individuelle Angaben (Kilometer, Zulassung, FIN, Farbe) bleiben für Ihre manuelle Eingabe frei.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 1: Marke, Modell, Ausführung, VIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-20">
                  {/* Marke */}
                  <VehicleCombobox
                    id="input-vehicle-brand"
                    label="Marke / Hersteller"
                    required
                    value={brand}
                    onChange={handleBrandChange}
                    options={brandOptions}
                    filterMode="prefix"
                    placeholder="Marke wählen oder eingeben..."
                    emptyStateText="Keine hinterlegte Marke gefunden. Eigene Eingabe wird direkt übernommen."
                    allowCustom={true}
                  />

                  {/* Modell */}
                  <VehicleCombobox
                    id="input-vehicle-model"
                    label="Modell / Baureihe"
                    required
                    value={model}
                    onChange={setModel}
                    options={modelOptions}
                    filterMode="prefix"
                    placeholder="Modell wählen oder eingeben..."
                    emptyStateText={`Kein Standard-Modell für ${brand} gefunden. Eigene Eingabe wird direkt übernommen.`}
                    allowCustom={true}
                  />

                  {/* Ausführung / Variante */}
                  <VehicleCombobox
                    id="input-vehicle-variant"
                    label="Modellvariante / Paket"
                    value={variant}
                    onChange={setVariant}
                    options={VARIANT_OPTIONS}
                    filterMode="smart"
                    placeholder="Ausführung / Modellvariante..."
                    allowCustom={true}
                  />

                  {/* VIN */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 min-h-[20px]">
                      <label htmlFor="input-vehicle-vin" className="font-bold text-slate-800 text-xs sm:text-sm flex items-center">
                        <span>Fahrgestellnummer (VIN)</span>
                        <RequiredAsterisk />
                      </label>
                      <span className="text-[11px] text-slate-500 font-mono">17 Stellen</span>
                    </div>
                    <input
                      type="text"
                      id="input-vehicle-vin"
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      maxLength={17}
                      placeholder="17-stellige FIN / VIN eingeben"
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-mono text-xs sm:text-sm font-semibold uppercase transition placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Erstzulassung, Kilometerstand, Farbe mit Metallic Checkbox, Karosserieform */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start relative z-10">
                  {/* Erstzulassung */}
                  <div>
                    <label htmlFor="input-vehicle-reg" className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Erstzulassung</span>
                      <RequiredAsterisk />
                    </label>
                    <input
                      type="date"
                      id="input-vehicle-reg"
                      value={firstRegistration}
                      onChange={(e) => setFirstRegistration(e.target.value)}
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm transition"
                      required
                    />
                  </div>

                  {/* Kilometerstand */}
                  <div>
                    <label htmlFor="input-vehicle-mileage" className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Kilometerstand</span>
                      <RequiredAsterisk />
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-vehicle-mileage"
                        value={mileage === '' ? '' : mileage}
                        onChange={(e) => setMileage(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder=""
                        className="w-full pl-3.5 pr-12 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm transition placeholder:text-slate-400"
                        required
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-500 font-bold text-xs pointer-events-none">km</span>
                    </div>
                  </div>

                  {/* Außenfarbe & Metallic Checkbox */}
                  <div>
                    <VehicleCombobox
                      id="input-vehicle-color"
                      label="Außenfarbe / Lack"
                      required
                      value={color}
                      onChange={(val) => {
                        setColor(val);
                        if (val.toLowerCase().includes('metallic')) {
                          setIsMetallic(true);
                        }
                      }}
                      options={COLOR_OPTIONS}
                      placeholder="Farbe wählen oder eingeben..."
                      allowCustom={true}
                    />
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isMetallic}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setIsMetallic(checked);
                            if (checked && !color.toLowerCase().includes('metallic')) {
                              setColor(color ? `${color} Metallic` : 'Schwarz Metallic');
                            } else if (!checked && color.toLowerCase().includes('metallic')) {
                              setColor(color.replace(/ metallic/gi, '').trim() || 'Schwarz Uni');
                            }
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                        />
                        <span className="flex items-center gap-1">
                          <span>Metallic-Lackierung</span>
                          <span className="text-[10px] text-slate-500 font-normal">(Effektlack)</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Karosserieform */}
                  <VehicleCombobox
                    id="input-vehicle-body"
                    label="Karosserieform"
                    required
                    value={bodyType}
                    onChange={setBodyType}
                    options={BODY_TYPE_OPTIONS}
                    placeholder="Karosserieform wählen..."
                    allowCustom={true}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 2. ANTRIEB, MOTOR & UMWELT                                    */}
          {/* ------------------------------------------------------------- */}
          <div className="metallic-card-luminous rounded-3xl border border-white/40 shadow-md overflow-visible relative z-30">
            <div 
              onClick={() => setOpenSectionEngine(!openSectionEngine)}
              className={`px-6 py-4 hover:bg-white/40 transition cursor-pointer flex items-center justify-between ${
                openSectionEngine ? 'border-b border-slate-300/60 rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node text-slate-900 flex items-center justify-center font-bold">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    2. Antrieb, Motor & Umwelt
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Motorleistung (kW/PS), Hubraum, Kraftstoff, Getriebe, Schadstoffklasse & Standort
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {openSectionEngine ? 'Einklappen' : 'Ausklappen'}
                </span>
                <div className="p-1 text-slate-600">
                  {openSectionEngine ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {openSectionEngine && (
              <div className="p-6 space-y-4 animate-fadeIn">
                {/* Row 1: Kraftstoffart, Getriebeart, Antriebsart, Schadstoffklasse */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-20">
                  {/* Kraftstoff */}
                  <VehicleCombobox
                    id="input-vehicle-fuel"
                    label="Kraftstoffart"
                    required
                    value={fuelType}
                    onChange={setFuelType}
                    options={FUEL_TYPE_OPTIONS}
                    placeholder="Kraftstoffart wählen..."
                    allowCustom={true}
                  />

                  {/* Getriebe */}
                  <VehicleCombobox
                    id="input-vehicle-transmission"
                    label="Getriebeart"
                    required
                    value={transmission}
                    onChange={setTransmission}
                    options={TRANSMISSION_OPTIONS}
                    placeholder="Getriebeart wählen..."
                    allowCustom={true}
                  />

                  {/* Antriebsart */}
                  <VehicleCombobox
                    id="input-vehicle-drive"
                    label="Antriebsart"
                    required
                    value={driveType}
                    onChange={setDriveType}
                    options={DRIVE_TYPE_OPTIONS}
                    placeholder="Antriebsart wählen..."
                    allowCustom={true}
                  />

                  {/* Schadstoffklasse */}
                  <VehicleCombobox
                    id="input-vehicle-emission"
                    label="Schadstoffklasse / Abgasnorm"
                    value={emissionClass}
                    onChange={setEmissionClass}
                    options={EMISSION_OPTIONS}
                    placeholder="Schadstoffklasse wählen..."
                    allowCustom={true}
                  />
                </div>

                {/* Row 2: Leistung (kW / PS), Hubraum, Türen, Sitze */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                  {/* Leistung mit synchroner Umrechnung */}
                  <div>
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Motorleistung (kW / PS)</span>
                      <RequiredAsterisk />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          id="input-vehicle-power-kw"
                          value={powerKw === '' ? '' : powerKw}
                          onChange={(e) => handleKwChange(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder=""
                          className="w-full pl-3 pr-8 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm transition"
                          required
                        />
                        <span className="absolute right-2.5 top-2.5 text-slate-500 font-bold text-xs pointer-events-none">kW</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          id="input-vehicle-power-ps"
                          value={powerPs === '' ? '' : powerPs}
                          onChange={(e) => handlePsChange(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder=""
                          className="w-full pl-3 pr-8 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm transition"
                          required
                        />
                        <span className="absolute right-2.5 top-2.5 text-slate-500 font-bold text-xs pointer-events-none">PS</span>
                      </div>
                    </div>
                  </div>

                  {/* Hubraum */}
                  <div>
                    <label htmlFor="input-vehicle-displacement" className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px]">
                      Hubraum (ccm)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-vehicle-displacement"
                        value={displacementCc === '' ? '' : displacementCc}
                        onChange={(e) => setDisplacementCc(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder=""
                        className="w-full pl-3.5 pr-12 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm transition placeholder:text-slate-400"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-500 font-bold text-xs pointer-events-none">ccm</span>
                    </div>
                  </div>

                  {/* Türen */}
                  <VehicleCombobox
                    id="input-vehicle-doors"
                    label="Anzahl Türen"
                    value={doors}
                    onChange={setDoors}
                    options={DOORS_OPTIONS}
                    placeholder="Anzahl Türen wählen..."
                    allowCustom={true}
                  />

                  {/* Sitze */}
                  <VehicleCombobox
                    id="input-vehicle-seats"
                    label="Anzahl Sitzplätze"
                    value={seats}
                    onChange={setSeats}
                    options={SEATS_OPTIONS}
                    placeholder="Anzahl Sitze wählen..."
                    allowCustom={true}
                  />
                </div>

                {/* Row 3: Vorbesitzer & Standort */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-[5]">
                  {/* Vorbesitzer */}
                  <VehicleCombobox
                    id="input-vehicle-owners"
                    label="Anzahl Vorbesitzer / Fahrzeughalter"
                    value={ownersCount}
                    onChange={setOwnersCount}
                    options={OWNERS_OPTIONS}
                    placeholder="Vorbesitzer wählen..."
                    allowCustom={true}
                  />

                  {/* Standort */}
                  <VehicleCombobox
                    id="input-vehicle-location"
                    label="Standort / Filiale"
                    required
                    value={location}
                    onChange={setLocation}
                    options={LOCATION_OPTIONS}
                    placeholder="Standort wählen..."
                    allowCustom={true}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 3. EINKAUF, FINANZEN & ZAHLUNGSMODUS                           */}
          {/* ------------------------------------------------------------- */}
          <div className="metallic-card-luminous rounded-3xl border border-white/40 shadow-md overflow-visible relative z-20">
            <div 
              onClick={() => setOpenSectionFinance(!openSectionFinance)}
              className={`px-6 py-4 hover:bg-white/40 transition cursor-pointer flex items-center justify-between ${
                openSectionFinance ? 'border-b border-slate-300/60 rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node text-slate-900 flex items-center justify-center font-bold">
                  <Euro className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    3. Einkauf, Finanzen & Zahlungsabwicklung
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Einkaufsdatum, Steuerart, Gesamtkaufpreis, Zahlungsmodus & Marge
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {openSectionFinance ? 'Einklappen' : 'Ausklappen'}
                </span>
                <div className="p-1 text-slate-600">
                  {openSectionFinance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {openSectionFinance && (
              <div className="p-6 space-y-5 animate-fadeIn">
                {/* Row 1: Einkaufsdatum, Steuerart, Herkunft, Zahlungsmodus Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Einkaufsdatum */}
                  <div>
                    <label htmlFor="input-purchase-date" className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Einkaufsdatum</span>
                      <RequiredAsterisk />
                    </label>
                    <input
                      type="date"
                      id="input-purchase-date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm transition"
                      required
                    />
                  </div>

                  {/* Steuerart */}
                  <div>
                    <label htmlFor="input-purchase-tax" className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Steuerart (UStG)</span>
                      <RequiredAsterisk />
                    </label>
                    <select
                      id="input-purchase-tax"
                      value={taxType}
                      onChange={(e) => setTaxType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm transition"
                    >
                      <option value="diff_25a">Differenzbesteuerung (§ 25a UStG)</option>
                      <option value="standard_19">Regelbesteuerung (19% MwSt. ausweisbar)</option>
                    </select>
                  </div>

                  {/* Herkunft / Verkäufertyp */}
                  <VehicleCombobox
                    id="input-purchase-seller"
                    label="Herkunft / Verkäufertyp"
                    value={sellerType}
                    onChange={setSellerType}
                    options={SELLER_TYPE_OPTIONS}
                    placeholder="Verkäufertyp wählen..."
                    allowCustom={true}
                  />

                  {/* Zahlungsmodus Toggle */}
                  <div>
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Zahlungsmodus</span>
                      <RequiredAsterisk />
                    </label>
                    <div className="flex p-1 bg-slate-900/10 rounded-xl border border-white/30">
                      <button
                        type="button"
                        onClick={() => setPaymentMode('komplett')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          paymentMode === 'komplett'
                            ? 'metallic-btn-primary text-slate-950 shadow-xs'
                            : 'text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Komplett</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode('teilzahlung')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          paymentMode === 'teilzahlung'
                            ? 'metallic-btn-primary text-slate-950 shadow-xs'
                            : 'text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Teilzahlungen</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Pricing & Calculated Margin KPI Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 metallic-card rounded-2xl border border-white/30">
                  {/* Gesamtkaufpreis Input */}
                  <div>
                    <label htmlFor="input-total-purchase-price" className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 flex items-center">
                      <span>Gesamtkaufpreis (€)</span>
                      <RequiredAsterisk />
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-total-purchase-price"
                        value={totalPurchasePrice === '' ? '' : totalPurchasePrice}
                        onChange={(e) => setTotalPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder=""
                        className="w-full pl-3.5 pr-10 py-2.5 metallic-input rounded-xl text-slate-900 font-bold text-sm sm:text-base transition"
                        required
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-500 font-bold text-sm pointer-events-none">€</span>
                    </div>
                  </div>

                  {/* Erwarteter Verkaufspreis Input */}
                  <div>
                    <label htmlFor="input-selling-price" className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                      Erwarteter Verkaufspreis (€)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-selling-price"
                        value={expectedSellingPrice === '' ? '' : expectedSellingPrice}
                        onChange={(e) => setExpectedSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder=""
                        className="w-full pl-3.5 pr-10 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-sm sm:text-base transition"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-500 font-bold text-sm pointer-events-none">€</span>
                    </div>
                  </div>

                  {/* Kalkulierte Bruttomarge */}
                  <div className="p-3.5 metallic-node rounded-xl border border-white/40 flex flex-col justify-between">
                    <span className="text-slate-600 text-xs font-semibold">Kalkulierte Bruttomarge:</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-base font-extrabold font-mono ${calculatedMarginEuro >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {calculatedMarginEuro > 0 ? `+${calculatedMarginEuro.toLocaleString('de-DE')} €` : `${calculatedMarginEuro.toLocaleString('de-DE')} €`}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">Aufschlag</span>
                    </div>
                  </div>

                  {/* Margen-Faktor */}
                  <div className="p-3.5 metallic-node rounded-xl border border-white/40 flex flex-col justify-between">
                    <span className="text-slate-600 text-xs font-semibold">Margen-Faktor (%):</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-base font-extrabold font-mono ${Number(calculatedMarginPercent) >= 0 ? 'text-blue-700' : 'text-rose-600'}`}>
                        {Number(calculatedMarginPercent) > 0 ? `+${calculatedMarginPercent} %` : `${calculatedMarginPercent} %`}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">Bruttorendite</span>
                    </div>
                  </div>
                </div>

                {/* Payment Detail Section */}
                {paymentMode === 'komplett' ? (
                  /* Mode A: Komplettzahlung */
                  <div className="p-4.5 metallic-card rounded-2xl border border-white/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-600" />
                        <span>Komplettzahlung konfigurieren</span>
                      </h4>
                      <span className="text-[11px] text-slate-600 font-semibold">
                        Gesamter Betrag: {(typeof totalPurchasePrice === 'number' ? totalPurchasePrice : (Number(totalPurchasePrice) || 0)).toLocaleString('de-DE')} €
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs mb-1.5">
                          Zahlungsart
                        </label>
                        <select
                          value={fullPaymentMethod}
                          onChange={(e) => setFullPaymentMethod(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                        >
                          <option value="Banküberweisung">Banküberweisung (100% Bank)</option>
                          <option value="Bar">Barzahlung (100% Bar)</option>
                          <option value="Gemischt">Gemischte Zahlung (Bar & Bank split)</option>
                        </select>
                      </div>

                      {fullPaymentMethod === 'Gemischt' && (
                        <>
                          <div>
                            <label className="block font-bold text-slate-800 text-xs mb-1.5">
                              Baranteil (€)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={fullPaymentCashSplit}
                                onChange={(e) => setFullPaymentCashSplit(Number(e.target.value))}
                                className="w-full pl-3.5 pr-8 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                              />
                              <span className="absolute right-3 top-2.5 text-slate-500 font-bold text-xs">€</span>
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-800 text-xs mb-1.5">
                              Bankanteil (€)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                disabled
                                value={Math.max(0, totalPurchasePrice - fullPaymentCashSplit)}
                                className="w-full pl-3.5 pr-8 py-2.5 bg-slate-200/80 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs sm:text-sm cursor-not-allowed"
                              />
                              <span className="absolute right-3 top-2.5 text-slate-500 font-bold text-xs">€</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Mode B: Teilzahlungen / Multi-Payment Tracker */
                  <div className="p-4.5 metallic-card rounded-2xl border border-white/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span>Teilzahlungs-Plan & Ratenüberwachung</span>
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Erfassen Sie alle Raten & Zahlungsbelege in Echtzeit
                        </p>
                      </div>

                      {remainingBalance > 0 && (
                        <button
                          type="button"
                          onClick={handleAddRemainingAsInstallment}
                          className="px-3.5 py-2 metallic-btn-primary text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restbetrag ({remainingBalance.toLocaleString('de-DE')} €) buchen</span>
                        </button>
                      )}
                    </div>

                    {/* Progress Bar & Status Cards */}
                    <div className="p-4 metallic-card-luminous rounded-2xl border border-white/40 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">Zahlungsfortschritt:</span>
                        <span className="text-blue-700 font-mono">{paymentPercentage}% bezahlt</span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-300/60 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            remainingBalance === 0 
                              ? 'bg-emerald-600' 
                              : remainingBalance < 0 
                              ? 'bg-emerald-600' 
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                        <div className="p-2.5 metallic-node rounded-xl border border-white/40 flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Gesamtkaufpreis:</span>
                          <span className="font-extrabold font-mono text-slate-950">{(typeof totalPurchasePrice === 'number' ? totalPurchasePrice : (Number(totalPurchasePrice) || 0)).toLocaleString('de-DE')} €</span>
                        </div>
                        <div className="p-2.5 bg-emerald-100/70 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                          <span className="text-emerald-900 font-medium">Summe erfasst:</span>
                          <span className="font-extrabold font-mono text-emerald-800">{totalInstallmentsAmount.toLocaleString('de-DE')} €</span>
                        </div>
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          remainingBalance === 0
                            ? 'bg-emerald-100/70 text-emerald-900 border-emerald-200/80'
                            : remainingBalance > 0
                            ? 'bg-emerald-100/70 text-emerald-950 border-emerald-300/80'
                            : 'bg-rose-100/70 text-rose-950 border-rose-300/80'
                        }`}>
                          <span className="font-medium">Restbetrag:</span>
                          <span className="font-extrabold font-mono">
                            {remainingBalance === 0 ? 'Vollständig bezahlt (0 €)' : `${remainingBalance.toLocaleString('de-DE')} €`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Installments Table / Rows */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                        <span>Erfasste Teilzahlungen ({paymentInstallments.length})</span>
                        <button
                          type="button"
                          onClick={handleAddInstallment}
                          className="text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Weitere Rate hinzufügen</span>
                        </button>
                      </div>

                      {paymentInstallments.map((inst, index) => (
                        <div 
                          key={inst.id}
                          className="p-3 metallic-card-luminous rounded-xl border border-white/40 transition grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                        >
                          <div className="sm:col-span-1 flex items-center gap-1 text-xs font-bold text-slate-500">
                            <span>#{index + 1}</span>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5 sm:hidden">Betrag</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={inst.amount || ''}
                                onChange={(e) => handleUpdateInstallment(inst.id, 'amount', Number(e.target.value))}
                                placeholder="Betrag in €"
                                className="w-full pl-3 pr-7 py-2 metallic-input rounded-lg text-slate-900 font-bold text-xs sm:text-sm"
                              />
                              <span className="absolute right-2.5 top-2 text-slate-500 text-xs font-bold">€</span>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5 sm:hidden">Datum</label>
                            <input
                              type="date"
                              value={inst.date}
                              onChange={(e) => handleUpdateInstallment(inst.id, 'date', e.target.value)}
                              className="w-full px-3 py-2 metallic-input rounded-lg text-slate-900 font-semibold text-xs"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5 sm:hidden">Zahlart</label>
                            <select
                              value={inst.method}
                              onChange={(e) => handleUpdateInstallment(inst.id, 'method', e.target.value)}
                              className="w-full px-2.5 py-2 metallic-input rounded-lg text-slate-900 font-semibold text-xs"
                            >
                              <option value="Banküberweisung">Bank</option>
                              <option value="Bar">Bar</option>
                              <option value="Scheck">Scheck</option>
                              <option value="Kreditkarte">Karte</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5 sm:hidden">Zweck</label>
                            <input
                              type="text"
                              value={inst.note || ''}
                              onChange={(e) => handleUpdateInstallment(inst.id, 'note', e.target.value)}
                              placeholder="Notiz / Zweck"
                              className="w-full px-3 py-2 metallic-input rounded-lg text-slate-900 text-xs"
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveInstallment(inst.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                              title="Rate löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 4. AUSSTATTUNG & EXTRAS                                        */}
          {/* ------------------------------------------------------------- */}
          <div className="metallic-card-luminous rounded-3xl border border-white/40 shadow-md overflow-visible relative z-15">
            <div 
              onClick={() => setOpenSectionFeatures(!openSectionFeatures)}
              className={`px-6 py-4 hover:bg-white/40 transition cursor-pointer flex items-center justify-between ${
                openSectionFeatures ? 'border-b border-slate-300/60 rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node text-slate-900 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    4. Ausstattung & Sonderausstattungen
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Ausgewählte Ausstattungsmerkmale ({selectedFeatures.length} aktiv) & freie Extras
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {openSectionFeatures ? 'Einklappen' : 'Ausklappen'}
                </span>
                <div className="p-1 text-slate-600">
                  {openSectionFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {openSectionFeatures && (
              <div className="p-6 space-y-4 animate-fadeIn">
                {/* Equipment Chips */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_FEATURES.map((feat) => {
                    const active = selectedFeatures.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFeature(feat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          active
                            ? 'metallic-btn-primary text-slate-950 shadow-xs border border-white/40'
                            : 'metallic-card text-slate-800 hover:bg-white/60 border border-slate-300/60'
                        }`}
                      >
                        {active ? <Check className="w-3.5 h-3.5 text-blue-700" /> : <Plus className="w-3 h-3 text-slate-500" />}
                        <span>{feat}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Feature Add Input */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={customFeatureInput}
                    onChange={(e) => setCustomFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customFeatureInput.trim()) {
                          toggleFeature(customFeatureInput.trim());
                          setCustomFeatureInput('');
                        }
                      }
                    }}
                    placeholder="Eigenes Ausstattungsmerkmal eingeben..."
                    className="flex-1 px-3.5 py-2 metallic-input rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddCustomFeature(e)}
                    className="px-4 py-2 metallic-btn-secondary text-slate-900 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
                  >
                    + Hinzufügen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 5. ZUSTAND, BEGUTACHTUNG & TÜV                                 */}
          {/* ------------------------------------------------------------- */}
          <div className="metallic-card-luminous rounded-3xl border border-white/40 shadow-md overflow-visible relative z-10">
            <div 
              onClick={() => setOpenSectionCondition(!openSectionCondition)}
              className={`px-6 py-4 hover:bg-white/40 transition cursor-pointer flex items-center justify-between ${
                openSectionCondition ? 'border-b border-slate-300/60 rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node text-slate-900 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    5. Zustand, Begutachtung & TÜV
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Mechanik, Optik, TÜV / HU Monats-Picker & strukturierter Schadensbericht
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {openSectionCondition ? 'Einklappen' : 'Ausklappen'}
                </span>
                <div className="p-1 text-slate-600">
                  {openSectionCondition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {openSectionCondition && (
              <div className="p-6 space-y-6 animate-fadeIn">
                {/* 1. Mechanics & Inspection Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-20">
                  {/* Motor */}
                  <VehicleCombobox
                    id="input-cond-engine"
                    label="Motor & Laufkultur"
                    value={engineCondition}
                    onChange={setEngineCondition}
                    options={ENGINE_CONDITION_OPTIONS}
                    placeholder="Zustand wählen..."
                    allowCustom={true}
                  />

                  {/* Getriebe */}
                  <VehicleCombobox
                    id="input-cond-trans"
                    label="Getriebe & Kupplung"
                    value={transmissionCondition}
                    onChange={setTransmissionCondition}
                    options={TRANSMISSION_CONDITION_OPTIONS}
                    placeholder="Zustand wählen..."
                    allowCustom={true}
                  />

                  {/* Bremsen & Reifen */}
                  <VehicleCombobox
                    id="input-cond-brakes"
                    label="Bremsen & Bereifung"
                    value={brakesTiresCondition}
                    onChange={setBrakesTiresCondition}
                    options={BRAKES_TIRES_OPTIONS}
                    placeholder="Zustand wählen..."
                    allowCustom={true}
                  />

                  {/* TÜV Month / Year Picker */}
                  <TuvMonthYearPicker
                    id="input-cond-tuv"
                    label="TÜV / HU Fälligkeit"
                    required
                    value={tuvDate}
                    onChange={setTuvDate}
                  />
                </div>

                {/* 2. Visual Condition & Paint Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                  {/* Lackzustand */}
                  <VehicleCombobox
                    id="input-cond-paint"
                    label="Lackzustand"
                    value={paintCondition}
                    onChange={setPaintCondition}
                    options={PAINT_CONDITION_OPTIONS}
                    placeholder="Zustand wählen..."
                    allowCustom={true}
                  />

                  {/* Innenraum */}
                  <VehicleCombobox
                    id="input-cond-interior"
                    label="Innenraum & Polster"
                    value={interiorCondition}
                    onChange={setInteriorCondition}
                    options={INTERIOR_CONDITION_OPTIONS}
                    placeholder="Zustand wählen..."
                    allowCustom={true}
                  />

                  {/* Scheckheft Status */}
                  <div>
                    <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px]">
                      Scheckheftgepflegt
                    </label>
                    <div className="flex p-1 bg-slate-900/10 rounded-xl border border-white/30">
                      <button
                        type="button"
                        onClick={() => setServiceHistory(true)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                          serviceHistory
                            ? 'metallic-btn-primary text-slate-950 shadow-xs'
                            : 'text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Lückenlos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setServiceHistory(false)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                          !serviceHistory
                            ? 'metallic-btn-primary text-slate-950 shadow-xs'
                            : 'text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        <span>Teilweise / Nein</span>
                      </button>
                    </div>
                  </div>

                  {/* Letzter Service */}
                  <div>
                    <label htmlFor="input-cond-last-service" className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px]">
                      Letzte Inspektion / Wartung
                    </label>
                    <input
                      type="text"
                      id="input-cond-last-service"
                      value={lastService}
                      onChange={(e) => setLastService(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* 3. Structured Damage Report (Zustandsbericht) Component */}
                <div className="pt-2 border-t border-slate-300/60">
                  <ZustandsberichtSection
                    damages={damageEntries}
                    onChangeDamages={setDamageEntries}
                    damagesNotes={damagesNotes}
                    onChangeDamagesNotes={setDamagesNotes}
                    paintThicknessUm={paintThicknessUm}
                    onChangePaintThicknessUm={setPaintThicknessUm}
                    accidentFree={accidentFree}
                    onChangeAccidentFree={setAccidentFree}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 6. FAHRZEUGBESCHREIBUNG & AUTOSCOUT24 INSERATSTEXT            */}
          {/* ------------------------------------------------------------- */}
          <div className="metallic-card-luminous rounded-3xl border border-white/40 shadow-md overflow-visible relative z-[5]">
            <div 
              onClick={() => setOpenSectionDescription(!openSectionDescription)}
              className={`px-6 py-4 hover:bg-white/40 transition cursor-pointer flex items-center justify-between ${
                openSectionDescription ? 'border-b border-slate-300/60 rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node text-slate-900 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>6. Fahrzeugbeschreibung & AutoScout24-Inserat</span>
                    <span className="px-2 py-0.5 bg-blue-600/10 text-blue-700 text-[10px] font-extrabold rounded-full border border-blue-200">
                      Showroom & Portale
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Exposé-Text, Händlerbeschreibung, HSN/TSN & AutoScout24-Spezifikationen
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {openSectionDescription ? 'Einklappen' : 'Ausklappen'}
                </span>
                <div className="p-1 text-slate-600">
                  {openSectionDescription ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {openSectionDescription && (
              <div className="p-6 space-y-6 animate-fadeIn">
                {/* AI Assistant Banner & Quick Action */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-emerald-900/10 border border-blue-300/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        MAX KI-Inserats-Generator
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Erstellt automatisch einen verkaufsstarken, professionellen Inseratstext anhand der Fahrzeugdaten & Ausstattung.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={isGeneratingAiDescription}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingAiDescription ? 'Generiere Exposé...' : 'Exposé mit KI generieren'}</span>
                  </button>
                </div>

                {/* Primary Description Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                      <span>Fahrzeugbeschreibung / Inseratstext (Beschreibung)</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        (Wird 1:1 im Web-Showroom & auf Fahrzeugportalen angezeigt)
                      </span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {description.length} Zeichen
                    </span>
                  </div>
                  <textarea
                    id="input-vehicle-description"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beschreiben Sie hier die Besonderheiten des Fahrzeugs, Pflegezustand, Wartungshistorie, Umbauten oder Garantieumfang..."
                    className="w-full px-4 py-3 metallic-input rounded-2xl text-slate-900 text-xs sm:text-sm leading-relaxed border border-slate-300/80 focus:border-blue-500 transition font-normal"
                  />
                </div>

                {/* Extended AutoScout24 Technical Specs */}
                <div className="pt-4 border-t border-slate-300/60">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>AutoScout24 & Portale-Erweiterung</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* HSN/TSN */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                        HSN / TSN (Schlüsselnummer)
                      </label>
                      <input
                        type="text"
                        value={hsnTsn}
                        onChange={(e) => setHsnTsn(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      />
                    </div>

                    {/* Kraftstoffverbrauch Kombiniert */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                        Verbrauch kombiniert
                      </label>
                      <input
                        type="text"
                        value={fuelConsumptionCombined}
                        onChange={(e) => setFuelConsumptionCombined(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      />
                    </div>

                    {/* CO2-Emissionen */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                        CO₂-Emissionen
                      </label>
                      <input
                        type="text"
                        value={co2Emissions}
                        onChange={(e) => setCo2Emissions(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      />
                    </div>

                    {/* Umweltplakette */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                        Umweltplakette
                      </label>
                      <select
                        value={environmentalBadge}
                        onChange={(e) => setEnvironmentalBadge(e.target.value)}
                        className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      >
                        <option value="">Bitte wählen...</option>
                        <option value="4 (Grün)">4 (Grün)</option>
                        <option value="3 (Gelb)">3 (Gelb)</option>
                        <option value="2 (Rot)">2 (Rot)</option>
                        <option value="Keine">Keine Plakette</option>
                      </select>
                    </div>

                    {/* Polsterung */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                        Polsterung
                      </label>
                      <select
                        value={upholsteryType}
                        onChange={(e) => setUpholsteryType(e.target.value)}
                        className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      >
                        <option value="">Bitte wählen...</option>
                        <option value="Vollleder">Vollleder</option>
                        <option value="Teilleder">Teilleder</option>
                        <option value="Alcantara">Alcantara / Leder</option>
                        <option value="Stoff">Stoff</option>
                        <option value="Velours">Velours</option>
                      </select>
                    </div>

                    {/* Innenraumfarbe */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                        Farbe der Innenausstattung
                      </label>
                      <input
                        type="text"
                        value={interiorColor}
                        onChange={(e) => setInteriorColor(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      />
                    </div>

                    {/* Garantieumfang */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                        Garantie
                      </label>
                      <input
                        type="text"
                        value={guaranteeMonths}
                        onChange={(e) => setGuaranteeMonths(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      />
                    </div>

                    {/* Nichtraucher Toggle */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                        Nichtraucherfahrzeug
                      </label>
                      <div className="flex p-1 bg-slate-900/10 rounded-xl border border-white/30">
                        <button
                          type="button"
                          onClick={() => setNonSmoker(true)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                            nonSmoker
                              ? 'metallic-btn-primary text-slate-950 shadow-xs'
                              : 'text-slate-700 hover:text-slate-950'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Ja</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNonSmoker(false)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                            !nonSmoker
                              ? 'metallic-btn-primary text-slate-950 shadow-xs'
                              : 'text-slate-700 hover:text-slate-950'
                          }`}
                        >
                          <span>Nein</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 7. MEDIEN & DOKUMENTE                                          */}
          {/* ------------------------------------------------------------- */}
          <div className="metallic-card-luminous rounded-3xl border border-white/40 shadow-md overflow-visible relative z-[1]">
            <div 
              onClick={() => setOpenSectionMedia(!openSectionMedia)}
              className={`px-6 py-4 hover:bg-white/40 transition cursor-pointer flex items-center justify-between ${
                openSectionMedia ? 'border-b border-slate-300/60 rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node text-slate-900 flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    7. Fotos & Dokumente
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Fahrzeuggalerie ({images.length} Bilder), Hauptbild-Markierung & Fahrzeugdokumente
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {openSectionMedia ? 'Einklappen' : 'Ausklappen'}
                </span>
                <div className="p-1 text-slate-600">
                  {openSectionMedia ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {openSectionMedia && (
              <div className="p-6 space-y-6 animate-fadeIn">
                {/* Images Upload Area */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-slate-800 text-xs sm:text-sm">
                      Fahrzeugbilder ({images.length} / 15)
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Erstes Bild gilt als Hauptbild
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className={`group relative aspect-4/3 rounded-2xl overflow-hidden border-2 bg-slate-200 shadow-2xs ${
                          idx === 0 ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-white/40'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Fahrzeug ${idx + 1}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />

                        {idx === 0 && (
                          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-blue-600 text-white rounded-lg text-[10px] font-extrabold shadow-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span>Titelbild</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="p-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                              title="Als Hauptbild setzen"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                            title="Bild entfernen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {images.length < 15 && (
                      <label className="aspect-4/3 border-2 border-dashed border-slate-400 hover:border-blue-600 rounded-2xl metallic-card flex flex-col items-center justify-center text-center p-3 cursor-pointer transition">
                        <UploadCloud className="w-6 h-6 text-slate-600 group-hover:text-blue-600 mb-1" />
                        <span className="text-xs font-bold text-slate-800">+ Fotos hochladen</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleMockImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Categorized Document Upload Section (Max 5 Documents / PDFs) */}
                <div className="pt-4 border-t border-slate-300/60">
                  <VehicleDocumentUploadSection
                    documents={vehicleDocuments}
                    onChangeDocuments={setVehicleDocuments}
                    maxFiles={5}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* VEHICLE FORM ACTION BAR                                       */}
          {/* ------------------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-300/60">
            <button
              type="button"
              id="btn-cancel-vehicle"
              onClick={() => onCancelEdit ? onCancelEdit() : (setActiveTab ? setActiveTab(returnTab || 'home') : handleResetVehicleForm())}
              className="w-full sm:w-auto px-5 py-2.5 metallic-btn-secondary text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{editingVehicle ? `Zurück zu ${returnTab === 'operationen' ? 'Übergabeprotokoll' : 'Lager'}` : 'Abbrechen'}</span>
            </button>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              {!editingVehicle && (
                <button
                  type="button"
                  id="btn-reset-vehicle"
                  onClick={handleResetVehicleForm}
                  className="w-full sm:w-auto px-5 py-2.5 metallic-btn-secondary text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                  <span>Formular zurücksetzen</span>
                </button>
              )}

              {editingVehicle && (
                <button
                  type="button"
                  id="btn-save-as-is-vehicle"
                  onClick={handleSaveVehicle}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 metallic-btn-secondary text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Unverändert übernehmen & Zurück</span>
                </button>
              )}

              <button
                type="submit"
                id="btn-save-vehicle"
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm rounded-xl transition cursor-pointer font-black ${
                  editingVehicle ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' : 'metallic-btn-primary text-slate-950 shadow-md'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{editingVehicle ? `Änderungen speichern & Zurück zu ${returnTab === 'operationen' ? 'Übergabeprotokoll' : 'Lager'}` : 'Fahrzeug speichern'}</span>
              </button>
            </div>
          </div>

        </form>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CUSTOMER ENTRY FORM                                            */}
      {/* ========================================================================= */}
      {activeFormTab === 'customer' && (
        <form 
          id="form-customer-entry" 
          onSubmit={handleSaveCustomer} 
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <span>3 strukturierte Abschnitte</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAllCustomer}
                className="text-xs font-bold text-slate-800 hover:text-blue-700 px-3 py-1.5 metallic-card rounded-xl border border-white/40 shadow-2xs transition cursor-pointer"
              >
                Alle aufklappen
              </button>
              <button
                type="button"
                onClick={handleCloseAllCustomer}
                className="text-xs font-bold text-slate-800 hover:text-blue-700 px-3 py-1.5 metallic-card rounded-xl border border-white/40 shadow-2xs transition cursor-pointer"
              >
                Alle zuklappen
              </button>
            </div>
          </div>

          {/* 1. STAMMDATEN & KONTAKTDATEN */}
          <div className="metallic-card-luminous rounded-3xl border border-white/40 shadow-md overflow-visible relative">
            <div 
              onClick={() => setOpenCustSectionStamm(!openCustSectionStamm)}
              className={`px-6 py-4 hover:bg-white/40 transition cursor-pointer flex items-center justify-between ${
                openCustSectionStamm ? 'border-b border-slate-300/60 rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node text-slate-900 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    1. Stammdaten & Kontaktdaten
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Kundentyp (Privat vs. Gewerbe), Anrede, Name, E-Mail & Telefon
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {openCustSectionStamm ? 'Einklappen' : 'Ausklappen'}
                </span>
                <div className="p-1 text-slate-600">
                  {openCustSectionStamm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {openCustSectionStamm && (
              <div className="p-6 space-y-4 animate-fadeIn">
                {/* Kundentyp Toggle */}
                <div className="p-4 metallic-card rounded-2xl border border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">Kundentyp</span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      Steuert Rechnungsformate und B2B-Steuerpflichten
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-cust-type-b2c"
                      onClick={() => { setCustType('B2C'); setSalutation('Herr'); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        custType === 'B2C'
                          ? 'metallic-btn-primary text-slate-950 border-white/40 shadow-xs'
                          : 'metallic-card text-slate-700 border-slate-300/60 hover:bg-white/60'
                      }`}
                    >
                      Privatkunde (B2C)
                    </button>
                    <button
                      type="button"
                      id="btn-cust-type-b2b"
                      onClick={() => { setCustType('B2B'); setSalutation('Firma'); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        custType === 'B2B'
                          ? 'metallic-btn-primary text-slate-950 border-white/40 shadow-xs'
                          : 'metallic-card text-slate-700 border-slate-300/60 hover:bg-white/60'
                      }`}
                    >
                      Gewerbekunde / Händler (B2B)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Anrede */}
                  <div>
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Anrede</span>
                      <RequiredAsterisk />
                    </label>
                    <select
                      value={salutation}
                      onChange={(e) => setSalutation(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                    >
                      <option value="Herr">Herr</option>
                      <option value="Frau">Frau</option>
                      <option value="Firma">Firma</option>
                    </select>
                  </div>

                  {/* Vorname */}
                  <div>
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Vorname</span>
                      <RequiredAsterisk />
                    </label>
                    <input
                      type="text"
                      id="input-customer-firstname"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      required
                    />
                  </div>

                  {/* Nachname */}
                  <div>
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Nachname</span>
                      <RequiredAsterisk />
                    </label>
                    <input
                      type="text"
                      id="input-customer-lastname"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      required
                    />
                  </div>

                  {/* Firmenname if B2B */}
                  {custType === 'B2B' && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                        <span>Firmenname (Handelsregister)</span>
                        <RequiredAsterisk />
                      </label>
                      <input
                        type="text"
                        id="input-customer-company"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                        required
                      />
                    </div>
                  )}

                  {/* E-Mail */}
                  <div>
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>E-Mail-Adresse</span>
                      <RequiredAsterisk />
                    </label>
                    <input
                      type="email"
                      id="input-customer-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      required
                    />
                  </div>

                  {/* Telefon */}
                  <div>
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Telefonnummer</span>
                      <RequiredAsterisk />
                    </label>
                    <input
                      type="tel"
                      id="input-customer-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. ANSCHRIFT & RECHNUNGSADRESSE */}
          <div className="metallic-card-luminous rounded-3xl border border-white/40 shadow-md overflow-visible relative">
            <div 
              onClick={() => setOpenCustSectionAddress(!openCustSectionAddress)}
              className={`px-6 py-4 hover:bg-white/40 transition cursor-pointer flex items-center justify-between ${
                openCustSectionAddress ? 'border-b border-slate-300/60 rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node text-slate-900 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    2. Anschrift & Rechnungsadresse
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Straße, Hausnummer, Postleitzahl, Ort & Land
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {openCustSectionAddress ? 'Einklappen' : 'Ausklappen'}
                </span>
                <div className="p-1 text-slate-600">
                  {openCustSectionAddress ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {openCustSectionAddress && (
              <div className="p-6 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Straße & Hausnummer */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Straße & Hausnummer</span>
                      <RequiredAsterisk />
                    </label>
                    <input
                      type="text"
                      id="input-customer-street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      required
                    />
                  </div>

                  {/* PLZ */}
                  <div>
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Postleitzahl (PLZ)</span>
                      <RequiredAsterisk />
                    </label>
                    <input
                      type="text"
                      id="input-customer-postal"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      required
                    />
                  </div>

                  {/* Ort */}
                  <div>
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Stadt / Ort</span>
                      <RequiredAsterisk />
                    </label>
                    <input
                      type="text"
                      id="input-customer-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                      required
                    />
                  </div>

                  {/* Land */}
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px] flex items-center">
                      <span>Land</span>
                      <RequiredAsterisk />
                    </label>
                    <select
                      id="input-customer-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                    >
                      <option value="Deutschland">Deutschland</option>
                      <option value="Österreich">Österreich</option>
                      <option value="Schweiz">Schweiz</option>
                      <option value="Polen">Polen</option>
                      <option value="Niederlande">Niederlande</option>
                      <option value="Frankreich">Frankreich</option>
                      <option value="Italien">Italien</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. LEGITIMATION, STEUERN & NOTIZEN */}
          <div className="metallic-card-luminous rounded-3xl border border-white/40 shadow-md overflow-visible relative">
            <div 
              onClick={() => setOpenCustSectionTax(!openCustSectionTax)}
              className={`px-6 py-4 hover:bg-white/40 transition cursor-pointer flex items-center justify-between ${
                openCustSectionTax ? 'border-b border-slate-300/60 rounded-t-3xl' : 'rounded-3xl'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metallic-node text-slate-900 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    3. Legitimation, Steuern & Notizen
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Ausweisnummer, USt-IdNr., Steuernummer & besondere Vermerke
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {openCustSectionTax ? 'Einklappen' : 'Ausklappen'}
                </span>
                <div className="p-1 text-slate-600">
                  {openCustSectionTax ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {openCustSectionTax && (
              <div className="p-6 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Ausweisnummer */}
                  <div>
                    <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px]">
                      Ausweisnummer
                    </label>
                    <input
                      type="text"
                      id="input-customer-idcard"
                      value={idCardNumber}
                      onChange={(e) => setIdCardNumber(e.target.value.toUpperCase())}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-mono text-xs sm:text-sm uppercase font-semibold"
                    />
                  </div>

                  {/* USt-IdNr */}
                  <div>
                    <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px]">
                      USt-IdNr.
                    </label>
                    <input
                      type="text"
                      id="input-customer-vat"
                      value={vatId}
                      onChange={(e) => setVatId(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-mono text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  {/* Steuernummer */}
                  <div>
                    <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px]">
                      Steuernummer
                    </label>
                    <input
                      type="text"
                      id="input-customer-taxnum"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-mono text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  {/* Notizen */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5 min-h-[20px]">
                      Kundennotizen & Präferenzen
                    </label>
                    <textarea
                      rows={3}
                      value={custNotes}
                      onChange={(e) => setCustNotes(e.target.value)}
                      placeholder="Besondere Absprachen, gesuchte Fahrzeugtypen, Finanzierungsanfragen..."
                      className="w-full px-3.5 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CUSTOMER FORM ACTION BAR                                      */}
          {/* ------------------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-300/60">
            <button
              type="button"
              id="btn-cancel-customer"
              onClick={() => setActiveTab ? setActiveTab('home') : handleResetCustomerForm()}
              className="w-full sm:w-auto px-5 py-2.5 metallic-btn-secondary text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Abbrechen</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                id="btn-reset-customer"
                onClick={handleResetCustomerForm}
                className="w-full sm:w-auto px-5 py-2.5 metallic-btn-secondary text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span>Formular zurücksetzen</span>
              </button>

              <button
                type="submit"
                id="btn-save-customer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 metallic-btn-primary text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Kunde speichern</span>
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
};
