export type NavTab = 
  | 'home' 
  | 'hub'
  | 'operationen'
  | 'neu' 
  | 'lager' 
  | 'kunden' 
  | 'rechnungen' 
  | 'finanzen' 
  | 'einstellungen'
  | 'showroom';

export type SettingsSubTab = 
  | 'firma'             // 1. Persönliche Daten & Firma
  | 'adresse'           // 2. Adresse
  | 'kontakt'           // 3. Kontakt
  | 'steuer'            // 4. Steuer & Zoll
  | 'bank'              // 5. Bankverbindung
  | 'kasse'             // 6. Anfangskasse (Startkapital)
  | 'standorte'         // 7. Zusätzliche Standorte
  | 'rote_kennzeichen'  // 8. Rote Nummernschilder
  | 'benutzer'          // 9. Benutzerverwaltung
  | 'textvorlagen'      // 10. Textvorlagen Management
  | 'showroom'          // 11. Web-Showroom & Online-Präsenz
  | 'selbergestalten'   // 12. Selber gestalten (Service-Basis & Unterkategorien)
  | 'meine_dokumente';  // 13. Meine Dokumente (Firmen-Dokumentenarchiv)

export interface AdditionalLocation {
  id: string;
  name: string;
  type: 'Filiale' | 'Showroom' | 'Außenlager' | 'Aufbereitung' | 'Werkstatt' | string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  contactPerson?: string;
  phone?: string;
  isMainInvoiceAddress?: boolean; // Always false for additional locations; main address is fixed
  notes?: string;
}

export interface RedLicensePlate {
  id: string;
  plateNumber: string; // e.g. "B-06124"
  validUntil: string; // e.g. "2027-12-31"
  status: 'verfuegbar' | 'probefahrt' | 'ueberfuehrung' | 'gesperrt';
  assignedDriver?: string;
  vehicleAssigned?: string;
  logbookNotes?: string;
  lastUsed?: string;
}

export type UserRole = 'Administrator' | 'Mitarbeiter' | 'Verkäufer' | 'Buchhaltung' | 'Werkstatt';

export interface UserPermissions {
  canAccessSettings: boolean;
  canManageVehicles: boolean;
  canManageCustomers: boolean;
  canManageInvoices: boolean;
  canManageFinances: boolean;
}

export interface AppUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  roleType: 'admin' | 'mitarbeiter'; // admin = Voller Zugriff, mitarbeiter = Ohne Einstellungen
  status: 'Aktiv' | 'Inaktiv';
  password?: string;
  passwordHash?: string;
  pinCode?: string;
  permissions?: UserPermissions;
  lastLogin?: string;
  createdAt?: string;
}

export interface WebShowroomSettings {
  enabled: boolean;
  showroomTitle: string;
  showroomSlogan: string;
  heroBgUrl?: string;
  heroBgPreset?: 'luxury_showroom' | 'night_dealership' | 'modern_glass' | 'custom';
  customDomain?: string;
  subdomainSlug?: string;
  whatsappNumber?: string;
  openingHours?: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  legalImpressum?: {
    companyName: string;
    representedBy: string;
    streetAddress: string;
    zipCity: string;
    phone: string;
    email: string;
    registerCourt: string;
    registerNumber: string;
    vatId: string;
    disclaimerText: string;
  };
  defaultShowMechanical: boolean;
  defaultShowBodywork: boolean;
  defaultShowFeatures: boolean;
  defaultShowVin: boolean;
  enableAiChatbot: boolean;
  aiChatbotWelcomeMessage: string;
  dealerPreferredChatLanguage: 'de' | 'ar' | 'en' | 'tr' | 'pl';
}

export interface MerchantSettings {
  // 1. Persönliche Daten & Firma
  companyName: string;
  responsiblePerson: string; // Inhaber / Vertretungsberechtigter Geschäftsführer
  legalForm: string;
  commercialRegister?: string;
  registerCourt?: string;
  logoUrl?: string; // Händlerlogo für Rechnungen und Dokumente (Data-URL oder Bildlink)
  signatureUrl?: string; // Standard-Händlerunterschrift / Signatur (Data-URL oder Bild)
  signatureTitle?: string; // Signatur-Titel (z.B. Inhaber / Geschäftsführung)

  // 2. Adresse (Haupt-Rechnungsadresse)
  street: string;
  postalCode: string;
  city: string;
  country: string;

  // 3. Kontakt
  phone: string;
  mobile?: string;
  email: string;
  website?: string;

  // 4. Steuer & Zoll
  taxNumber: string;
  vatId: string;
  eoriNumber: string;
  taxOffice?: string;
  defaultTaxation: 'diff_25a' | 'standard_19';
  vatRate?: number; // Flexibler Standard-Mehrwertsteuersatz (MwSt. in %, Standard: 19.0)

  // 5. Bankverbindung
  bankName: string;
  iban: string;
  bic: string;
  accountHolder: string;

  // 6. Startkapital (Kasse & Bank)
  initialCashBalance: number;
  initialCashDate: string;
  initialCashRegistered: boolean;
  initialBankBalance: number;
  initialBankDate: string;
  initialBankRegistered: boolean;

  // Master-Zugangsdaten & Administrator-Sicherheit
  masterPassword?: string;
  masterPin?: string;
  adminUsername?: string;
  securityUpdatedAt?: string;

  // 7. Zusätzliche Standorte
  additionalLocations: AdditionalLocation[];

  // 8. Rote Nummernschilder
  redLicensePlates: RedLicensePlate[];

  // 9. Benutzerverwaltung
  users: AppUser[];

  // 11. Web-Showroom & Online-Präsenz
  showroomSettings?: WebShowroomSettings;

  // 12. Selber gestalten (Service-Basis & Unterkategorien)
  serviceBases?: ServiceBasisCategory[];

  // 13. Meine Dokumente (Firmen-Dokumentenarchiv)
  companyDocuments?: CompanyDocument[];
  customDocumentSubcategories?: Record<string, string[]>;

  updatedAt?: string;
}

export type CompanyDocumentMainCategory = 
  | 'vertraege'         // عقود
  | 'versicherungen'    // تأمينات
  | 'versorger'         // اشتراكات كهرباء وماء وغيرها
  | 'personal'          // وثائق عمال
  | 'steuern_behoerden' // ضرائب وترخيص وحكومية
  | 'sonstiges';        // Sonstiges / أخرى

export interface CompanyDocument {
  id: string;
  title: string;
  category: CompanyDocumentMainCategory;
  subcategory: string;
  referenceNumber?: string; // Vertragsnummer / Versicherungsnummer / Aktenzeichen / Zählernummer
  issuer?: string; // Vertragspartner / Versicherungsgesellschaft / Versorger / Behörde
  documentDate?: string; // YYYY-MM-DD
  validUntil?: string; // YYYY-MM-DD (Kündigungsfrist oder Ablaufdatum)
  noticePeriod?: string; // e.g. "3 Monate zum Jahresende"
  costAmount?: number; // Regelmäßige Kosten (z.B. 240 €)
  costInterval?: 'einmalig' | 'monatlich' | 'vierteljaehrlich' | 'jaehrlich';
  notes?: string;
  tags?: string[];
  isPinned?: boolean;
  fileName: string;
  fileSize: number; // in Bytes
  fileType: string; // e.g. 'application/pdf', 'image/png'
  fileDataUrl: string; // Base64 data URL
  uploadedAt: string; // ISO string
  updatedAt?: string;
}

export interface CompanyCatalogDefinition {
  id: CompanyDocumentMainCategory;
  titleDe: string;
  titleAr: string;
  description: string;
  iconName: string;
  defaultSubcategories: string[];
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  defaultPrice?: number;
  defaultTaxRate?: string; // '19%', '0%', 'diff_25a'
  estimatedDurationMinutes?: number;
  active: boolean;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceBasisCategory {
  id: string;
  name: string;
  code?: string; // e.g. "SRV-WERKSTATT", "SRV-AUFBEREITUNG"
  icon?: string; // e.g. "Wrench", "Sparkles", "ShieldCheck", "Car", "Truck", "Disc", "FileText"
  color?: string; // e.g. "blue", "emerald", "amber", "purple", "rose", "cyan", "indigo"
  description?: string;
  defaultTaxRate?: string;
  subcategories: ServiceSubcategory[];
  orderIndex: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TextTemplateCategory = 'welcome' | 'warranty' | 'export'; // welcome: Begrüßungstexte / Kopfzeile, warranty: Garantie- & Gewährleistungstexte, export: Export- & Steuerklauseln

export interface TextTemplate {
  id: string;
  category: TextTemplateCategory;
  title: string;
  content: string;
  isDefault: boolean;
  orderIndex: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type TaxType = 'diff_25a' | 'standard_19' | 'kaufvertrag' | 'barverkauf';

export type VehicleStatus = 'verfuegbar' | 'reserviert' | 'aufbereitung' | 'verkauft';

export interface PaymentInstallment {
  id: string;
  amount: number;
  date: string;
  method: 'Bar' | 'Banküberweisung' | 'Scheck' | 'Kartenzahlung';
  note?: string;
}

export interface VehicleDamageEntry {
  id: string;
  part: string;
  damageType: string;
  severity: 'Leicht' | 'Mittel' | 'Schwer' | 'Bagatelle' | string;
  description?: string;
  estimatedCost?: number;
  repaired?: boolean;
}

export interface VehicleExpense {
  id: string;
  vehicleId: string;
  date: string;
  amount: number;
  paymentType: 'Bar' | 'Banküberweisung';
  category: 'Reinigung' | 'Reparatur' | 'Lackierung' | 'Transport' | 'TÜV/Gutachten' | 'Zulassung' | 'Ersatzteile' | 'Sonstiges' | string;
  reason: string;
  vendor?: string;
  receiptNumber?: string;
  invoiceFile?: {
    name: string;
    size?: string;
    type?: string;
    url?: string;
  };
  pushedToCashbook?: boolean;
  cashbookTransactionId?: string;
  createdAt: string;
}

export type VehicleDocCategory = 
  | 'zulassung_1'      // Zulassungsbescheinigung Teil I (Fahrzeugschein)
  | 'zulassung_2'      // Zulassungsbescheinigung Teil II (Fahrzeugbrief)
  | 'tuev_bericht'     // TÜV-Bericht (HU/AU)
  | 'kaufvertrag'      // Kaufvertrag oder Einkaufsrechnung
  | 'sonstiges';       // Sonstiges

export interface VehicleDocumentItem {
  id: string;
  category: VehicleDocCategory;
  categoryLabel: string;
  name: string;
  type: string; // 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp'
  size: string;
  fileData?: string; // Base64 data URL for preview/download
  uploadedAt: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  vin: string;
  firstRegistration: string;
  mileage: number;
  powerKw: number;
  powerPs: number;
  displacementCc?: number;
  fuelType: 'Benzin' | 'Diesel' | 'Elektro' | 'Hybrid' | 'Plug-in-Hybrid' | string;
  transmission: 'Automatik' | 'Schaltgetriebe' | 'Doppelkupplung' | string;
  color: string;
  isMetallic?: boolean;
  bodyType?: string;
  driveType?: string;
  doors?: string;
  seats?: string;
  emissionClass?: string;
  ownersCount?: string;
  sellerType?: string;
  purchasePrice: number;
  purchaseDate?: string;
  paymentMode?: 'komplett' | 'teilzahlung';
  purchaseCash?: number;
  purchaseBank?: number;
  paymentInstallments?: PaymentInstallment[];
  sellingPrice: number;
  expectedSellingPrice?: number;
  taxType: 'diff_25a' | 'standard_19';
  status: VehicleStatus;
  daysInStock: number;
  location: string;
  createdAt?: string;
  imageUrl: string;
  images?: string[];
  documents?: VehicleDocumentItem[];
  features: string[];
  expenses?: VehicleExpense[];
  totalExpenses?: number;
  operationStatus?: 'bestand' | 'werkstatt' | 'aufbereitung' | 'tuev' | 'auslieferung';
  conditionMechanical?: {
    engine?: string;
    transmission?: string;
    brakesTires?: string;
    tuvDate?: string;
    serviceHistory?: boolean;
    lastService?: string;
  };
  conditionVisual?: {
    paintCondition?: string;
    interiorCondition?: string;
    accidentFree?: boolean;
    damagesNotes?: string;
    paintThicknessUm?: number;
  };
  damageEntries?: VehicleDamageEntry[];

  // Detailed Description / Inseratstext (AutoScout24 / Showroom)
  description?: string;
  beschreibung?: string;
  licensePlate?: string;
  kennzeichen?: string;

  // AutoScout24 Extended Technical & Condition Specs
  hsnTsn?: string; // HSN / TSN (z.B. 0005/CSX)
  fuelConsumptionCombined?: string; // z.B. "7.2 l/100 km"
  fuelConsumptionCity?: string; // z.B. "8.9 l/100 km"
  fuelConsumptionHighway?: string; // z.B. "6.1 l/100 km"
  co2Emissions?: string; // z.B. "164 g/km"
  environmentalBadge?: string; // z.B. "4 (Grün)"
  nonSmoker?: boolean; // Nichtraucherfahrzeug
  fullServiceHistory?: boolean; // Scheckheftgepflegt
  guaranteeMonths?: number | string; // z.B. "12 Monate Gebrauchtwagengarantie"
  warrantyDetails?: string;
  upholsteryType?: 'Vollleder' | 'Teilleder' | 'Alcantara' | 'Stoff' | 'Velours' | string;
  interiorColor?: string; // z.B. "Schwarz / Anthrazit"
  cylinderCount?: number | string; // z.B. 6
  gearsCount?: number | string; // z.B. 8-Gang
  emptyWeightKg?: number | string; // z.B. 1795 kg
  grossWeightKg?: number | string; // z.B. 2350 kg

  // Web-Showroom Public Display Flags
  showInWebShowroom?: boolean;
  showInShowroom?: boolean; // compatibility alias
  showroomBadge?: string; // e.g. "Top Angebot", "1. Hand", "Scheckheftgepflegt", "TÜV Neu", "In Aufbereitung"
  showroomShowMechanical?: boolean;
  showroomShowBodywork?: boolean;
  showroomShowFeatures?: boolean;
  showroomCustomNote?: string;
  showroomHighlighted?: boolean;
}

export interface Customer {
  id: string;
  type: 'B2C' | 'B2B';
  name: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  salutation: 'Herr' | 'Frau' | 'Firma';
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  idCardNumber?: string;
  vatId?: string;
  taxNumber?: string;
  purchasesCount: number;
  totalSpent: number;
  lastContact: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OperationDocumentType = 
  | 'angebot'
  | 'rechnung'
  | 'e_rechnung'
  | 'eu_export'
  | 'export_drittland'
  | 'kaufvertrag'
  | 'probefahrt'
  | 'uebergabeprotokoll';

export interface OperationVehicleItem {
  id: string;
  vehicleId?: string; // relation binding autoId
  vin: string;
  brand: string;
  model: string;
  variant?: string;
  firstRegistration?: string;
  mileage: number;
  powerPs?: number;
  powerKw?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  location?: string;
  imageUrl?: string;
  listPrice: number;
  sellingPrice: number;
  discountAmount: number;
  taxType: 'diff_25a' | 'standard_19' | 'export_0' | 'reverse_charge';
  notes?: string;
}

export interface KaufvertragParty {
  type: 'dealer' | 'customer' | 'custom';
  companyName?: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  idCardNumber?: string; // Personalausweis / Reisepass-Nr.
  birthDate?: string;
  birthPlace?: string;
}

export interface KaufvertragDetails {
  // Mode & Parties
  contractMode: 'verkauf' | 'ankauf'; // verkauf: Dealer is Seller, Customer is Buyer; ankauf: Customer is Seller, Dealer is Buyer
  seller: KaufvertragParty;
  buyer: KaufvertragParty;
  
  // Vehicle details & HU/AU
  vin: string;
  brand: string;
  model: string;
  variant?: string;
  firstRegistration: string;
  mileage: number;
  mileageIsTotalKnown?: boolean; // Gesamtfahrleistung bekannt
  nextHuDate: string; // Nächste Hauptuntersuchung (HU)
  nextAuDate: string; // Nächste Abgasuntersuchung (AU)
  licensePlate?: string; // Bisheriges Kennzeichen
  powerPs?: number;
  powerKw?: number;
  color?: string;
  displacementCc?: number;

  // Handover Checklist (Übergabe)
  handoverDate: string;
  handoverTime?: string;
  purchasePrice: number;
  paymentMethod: 'Überweisung' | 'Bar' | 'Finanzierung' | 'Kartenzahlung' | 'Treuhand';
  depositAmount?: number;
  remainingAmount?: number;
  hasKfzBrief: boolean; // Zulassungsbescheinigung Teil II
  kfzBriefNumber?: string;
  hasKfzSchein: boolean; // Zulassungsbescheinigung Teil I
  hasHuAuBericht: boolean; // HU/AU-Prüfberichte
  keysCount: number; // Fahrzeugschlüssel mit Mengenangabe (z.B. 2)
  hasLicensePlates: boolean; // Kennzeichen am Fahrzeug
  hasDeregistrationDoc: boolean; // Stilllegungsbescheinigung / Abmeldebescheinigung
  hasServiceBook?: boolean; // Serviceheft / Bordmappe
  hasCocDocument?: boolean; // COC-Papier (EG-Übereinstimmungsbescheinigung)

  // Warranty & Vehicle History (Clauses C & D)
  ownershipConfirmed: boolean; // Fahrzeug ist unbeschränktes Eigentum des Verkäufers, frei von Rechten Dritter
  isAccidentFree: boolean; // keinen Unfallschaden hatte
  knownDamages: string; // bekannte Beschädigungen / reparierte Unfallschäden
  isReImport: boolean; // Re-Import Status
  reImportCountry?: string;
  usageType: 'privat' | 'gewerblich'; // Private vs. gewerbliche Nutzung (Mietwagen/Taxi/Fahrschule)
  commercialUsageNotes?: string;
  isOriginalEngine: boolean; // Originalmotor vs Austauschmotor
  engineMileageKm?: number;
  previousOwnersCount: number; // Anzahl der Vorbesitzer lt. Brief
  reRegistrationDeadlineDays: number; // Max 1 Woche / z.B. 3 oder 7 Werktage
  reRegistrationDeadlineDate?: string;
  retentionOfTitleAccepted: boolean; // Eigentumsvorbehalt bis zur vollständigen Bezahlung
  warrantyType: 'b2c_haendler_12m' | 'gewerblich_ausschluss' | 'privat_ausschluss' | 'herstellergarantie';
  warrantyCustomNotes?: string;

  // Special agreements (Besondere Vereinbarungen)
  specialAgreements: string; // Individuelle Zusatzvereinbarungen

  // Signatures
  place: string;
  contractDate: string;
  sellerSignature?: string; // Base64 data URL for touch/canvas signature
  buyerSignature?: string; // Base64 data URL for touch/canvas signature
  signedAt?: string;
}

export interface ProbefahrtDetails {
  driverName: string;
  driverStreet: string;
  driverPostalCode: string;
  driverCity: string;
  driverPhone: string;
  driverEmail?: string;
  driverBirthDate?: string;
  drivingLicenseNumber: string;
  drivingLicenseClasses: string; // e.g. B, BE, A
  drivingLicenseIssueDate?: string;
  drivingLicenseAuthority?: string;
  driverLicenseFile?: {
    name: string;
    size?: string;
    type?: string;
    dataUrl?: string;
  };

  vin: string;
  brand: string;
  model: string;
  variant?: string;
  color?: string;
  firstRegistration?: string;
  mileageStart: number;
  mileageEnd?: number;
  fuelLevelStart?: string;
  redLicensePlate: string; // Rotes Kennzeichen (z.B. B-06124)

  durationMinutes: number; // e.g. 30, 45, 60
  startTime: string; // HH:mm
  expectedReturnTime: string; // HH:mm
  actualReturnTime?: string;
  routeLimitKm: number; // e.g. 50 km
  depositAmount: number; // Kaution / Sicherheitsleistung in EUR
  liabilityDeductible: number; // Kasko-Selbstbeteiligung in EUR (z.B. 1.000 €)

  disclaimersAccepted: {
    stvoRules: boolean;
    noThirdParty: boolean;
    zeroAlcohol: boolean;
    deductibleAgreed: boolean;
    returnOnTime: boolean;
    trafficFineLiability: boolean;
    mileageChecked: boolean;
  };

  place: string;
  date: string;
  driverSignature?: string;
  dealerSignature?: string;
  notes?: string;
}

export type DamageCategoryCode = 'D1' | 'D2' | 'D3' | 'D4';

export interface DamageMapPoint {
  id: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  view: 'front' | 'rear' | 'side_left' | 'side_right' | 'roof';
  category: DamageCategoryCode; // D1 (Lack), D2 (Klein <1cm), D3 (Mittel), D4 (Groß)
  title: string;
  description: string;
  imageUrl?: string;
}

export interface CheckItemStatus {
  status: 'ok' | 'mangel' | 'nicht_vorhanden';
  note?: string;
}

export interface UebergabeprotokollDetails {
  protocolDate: string;
  protocolTime?: string;
  
  // Parties
  sellerName: string;
  sellerCompany: string;
  sellerPhone: string;
  buyerName: string;
  buyerCompany?: string;
  buyerPhone: string;
  buyerStreet: string;
  buyerPostalCode: string;
  buyerCity: string;
  driverLicenseNumber?: string;
  driverLicenseFile?: {
    name: string;
    size?: string;
    type?: string;
    dataUrl?: string;
  };

  // Vehicle data
  vin: string;
  brand: string;
  model: string;
  variant?: string;
  licensePlate: string;
  color: string;
  firstRegistration: string;
  powerPs?: number;
  powerKw?: number;
  fuelType?: string;
  mileage: number;
  fuelLevel: string; // e.g. 75% (3/4)
  keysCount: number;

  // PAGE 1: External Inspection & Tires
  externalInspection: {
    bumperFront: CheckItemStatus;
    bumperRear: CheckItemStatus;
    grille: CheckItemStatus;
    hood: CheckItemStatus;
    fendersFront: CheckItemStatus;
    fendersRear: CheckItemStatus;
    doorsLeft: CheckItemStatus;
    doorsRight: CheckItemStatus;
    pillars: CheckItemStatus;
    roof: CheckItemStatus;
    trunkLid: CheckItemStatus;
    windshield: CheckItemStatus;
    sideRearWindows: CheckItemStatus;
    headlights: CheckItemStatus;
    taillightsTurnSignals: CheckItemStatus;
  };

  tires: {
    tireType: 'Sommer' | 'Winter' | 'Allwetter';
    frontLeftMm: number;
    frontRightMm: number;
    rearLeftMm: number;
    rearRightMm: number;
    spareWheel: 'Reserverad' | 'Notrad' | 'Pannenset' | 'Keines';
    rimsCondition: 'ok' | 'kratzer' | 'beschaedigt';
    rimType: 'Alufelgen' | 'Stahlfelgen';
    notes?: string;
  };

  // PAGE 2: Interior, Equipment, Mechanical
  interiorInspection: {
    seatsUpholstery: CheckItemStatus;
    steeringWheel: CheckItemStatus;
    dashboardCockpit: CheckItemStatus;
    infotainmentNavi: CheckItemStatus;
    airConditioning: CheckItemStatus;
    heatingVentilation: CheckItemStatus;
    seatbelts: CheckItemStatus;
    floorMats: CheckItemStatus;
    headliner: CheckItemStatus;
    mirrors: CheckItemStatus;
  };

  additionalEquipment: {
    keysCountCheck: { present: boolean; count: number; status: 'ok' | 'mangel' };
    centralLocking: { present: boolean; status: 'ok' | 'mangel' };
    powerWindows: { present: boolean; status: 'ok' | 'mangel' };
    sunroof: { present: boolean; status: 'ok' | 'mangel' };
    parkingSensorsPdc: { present: boolean; status: 'ok' | 'mangel' };
    backupCamera: { present: boolean; status: 'ok' | 'mangel' };
    secondTireSet: { present: boolean; status: 'ok' | 'mangel'; details?: string };
    firstAidWarningTriangle: { present: boolean; status: 'ok' | 'mangel' };
    onboardTools: { present: boolean; status: 'ok' | 'mangel' };
  };

  mechanicalInspection: {
    engineStartIdle: { status: 'ok' | 'mangel'; note?: string };
    transmissionGearbox: { status: 'ok' | 'mangel'; note?: string };
    clutch: { status: 'ok' | 'mangel'; note?: string };
    brakesHandbrake: { status: 'ok' | 'mangel'; note?: string };
    steeringHandling: { status: 'ok' | 'mangel'; note?: string };
    suspensionShockAbsorbers: { status: 'ok' | 'mangel'; note?: string };
    exhaustSystem: { status: 'ok' | 'mangel'; note?: string };
    oilCoolantLevels: { status: 'ok' | 'mangel'; note?: string };
    starterBattery: { status: 'ok' | 'mangel'; note?: string };
    cockpitWarningLights: { status: 'ok' | 'mangel'; note?: string };
  };

  // PAGE 3: Damage Assessment Map & Signatures
  damagePoints: DamageMapPoint[];
  associatedDocuments: {
    huValidityDate: string;
    hasKfzBrief: boolean; // ZB II
    hasKfzSchein: boolean; // ZB I
    hasServiceBook: boolean;
    hasCoCDocument: boolean;
    hasPreviousInvoice: boolean;
    hasDeregistrationDoc: boolean;
    hasManuals: boolean;
  };

  photoAttachments: {
    id: string;
    name: string;
    dataUrl: string;
    description?: string;
  }[];

  generalNotes: string;
  receiptDeclarationConfirmed: boolean;
  place: string;
  handoverDate: string;
  sellerSignature?: string;
  buyerSignature?: string;
}

export interface GelangensbestaetigungDetails {
  consigneeName?: string;
  consigneeAddress?: string;
  consigneeVatId?: string;
  destinationMemberState?: string;
  destinationCity?: string;
  dateOfReceipt?: string;
  leaveDateBlankForManualEntry?: boolean;
  issueDate?: string;
  leaveIssueDateBlank?: boolean;
  signatoryName?: string;
  signatoryFunction?: string;
  signatureDataUrl?: string;
  signatureDate?: string;
  placeOfIssue?: string;
}

export interface OperationDocument {
  id: string;
  documentType: OperationDocumentType;
  documentNumber: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
  
  // Relation binding: kunden/ (kundeId)
  kundeId?: string;
  customer?: Customer;
  manualCustomer?: Partial<Customer>;
  isManualCustomer: boolean;
  
  // Relation binding: mein lager/ (autoId & multi-vehicles)
  autoId?: string;
  vehicles: OperationVehicleItem[];
  
  // Commercial totals
  totalNet: number;
  totalTax: number;
  totalGross: number;
  paymentMethod: 'Überweisung' | 'Bar' | 'Finanzierung' | 'Kartenzahlung' | 'Treuhand';
  depositAmount?: number;
  
  // Document-specific configurations
  probefahrtDetails?: ProbefahrtDetails;
  uebergabeprotokollDetails?: UebergabeprotokollDetails;
  
  exportDetails?: {
    destinationCountry: string;
    customerVatId?: string;
    customsOffice?: string;
    exportDeclarationNumber?: string;
    movementCertificate?: boolean;
  };
  
  eRechnungDetails?: {
    buyerReference: string; // Leitweg-ID
    standardFormat: 'XRechnung' | 'ZUGFeRD';
    buyerVatId?: string;
  };

  kaufvertragDetails?: KaufvertragDetails;
  
  introText?: string;
  warrantyText?: string;
  exportText?: string;
  notes?: string;
  status: 'entwurf' | 'offen' | 'abgeschlossen' | 'storniert';
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export type InvoiceStatus = 'bezahlt' | 'offen' | 'teilbezahlt' | 'storniert' | 'entwurf';

export type InvoiceCategory = 'rechnung' | 'eu_export' | 'export_drittland' | 'storno' | 'gutschrift' | 'kaufvertrag' | 'barverkauf' | 'e_rechnung';

export interface InvoicePayment {
  id: string;
  amount: number;
  paymentMethod: 'Barzahlung' | 'Banküberweisung' | 'Kartenzahlung' | 'Finanzierung' | 'Treuhand';
  date: string;
  receiptNumber?: string;
  recordedBy?: string;
  notes?: string;
}

export interface InvoiceDunning {
  id: string;
  level: 1 | 2; // 1 = 1. Zahlungserinnerung / Mahnung, 2 = 2. Mahnung / Letzte Mahnung
  date: string;
  dueDate: string;
  fee: number;
  interest: number;
  totalClaim: number;
  notes?: string;
  generatedAt: string;
}

export interface InvoiceStornoDetails {
  stornoNumber: string;
  stornoDate: string;
  reason: string;
  refundMethod: 'Bank' | 'Bar' | 'Verrechnung' | 'Keine';
  refundAmount: number;
  originalInvoiceNumber: string;
  originalInvoiceId: string;
  notes?: string;
}

export interface InvoiceGutschriftDetails {
  gutschriftNumber: string;
  gutschriftDate: string;
  reasonCategory: string;
  reasonText: string;
  refundMethod: 'Bank' | 'Bar' | 'Verrechnung';
  amountNet: number;
  taxAmount: number;
  amountGross: number;
  originalInvoiceNumber: string;
  originalInvoiceId: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  kundeId?: string;
  customerId?: string;
  autoId?: string;
  vehicleId?: string;
  documentType?: OperationDocumentType;
  invoiceCategory?: InvoiceCategory;
  customerName: string;
  customerType: 'B2C' | 'B2B';
  customerStreet?: string;
  customerPostalCode?: string;
  customerCity?: string;
  customerPhone?: string;
  customerEmail?: string;
  vehicleTitle: string;
  vin: string;
  amountNet: number;
  taxAmount: number;
  amountGross: number;
  amountPaid?: number;
  taxType: TaxType;
  status: InvoiceStatus;
  paymentMethod: 'Überweisung' | 'Bar' | 'Finanzierung' | 'Kartenzahlung' | 'Treuhand';
  vehiclesCount?: number;
  payments?: InvoicePayment[];
  dunnings?: InvoiceDunning[];
  mahnstufe?: number;
  lastMahnungDate?: string;
  stornoDetails?: InvoiceStornoDetails;
  gutschriftDetails?: InvoiceGutschriftDetails;
  originalInvoiceId?: string;
  originalInvoiceNumber?: string;
  introText?: string;
  warrantyText?: string;
  exportText?: string;
  notes?: string;
}

export type FinancialAccount = 'Kasse' | 'Bank';

export interface CashTransaction {
  id: string;
  receiptNumber: string;
  timestamp: string;
  type: 'einnahme' | 'ausgabe' | 'transit' | 'sturz';
  account?: FinancialAccount; // 'Kasse' (Bargeld/Kassenlade) | 'Bank' (Geschäftskonto)
  category: string;
  description: string;
  amount: number;
  taxRate: string;
  balanceAfter: number;
  recordedBy: string;
  locked?: boolean; // GoBD-Festschreibung (Schreibgeschützt / Festgestellt)
  lockedAt?: string; // Zeitstempel der Festschreibung
  lockedBy?: string; // Benutzer der Festschreibung
}

export interface DamagePoint {
  id: string;
  x: number;
  y: number;
  view: 'front' | 'side_left' | 'side_right' | 'rear' | 'roof';
  type: 'Kratzer' | 'Delle' | 'Steinschlag' | 'Nachlackierung' | 'Rost' | 'Sonstiges';
  severity: 'Leicht' | 'Mittel' | 'Schwer';
  description: string;
}

export interface InvoiceTextTemplate {
  id: string;
  title: string;
  content: string;
  category: 'welcome' | 'warranty' | 'export';
  isDefault?: boolean;
}

