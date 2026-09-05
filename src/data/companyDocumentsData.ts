import { CompanyCatalogDefinition, CompanyDocument, CompanyDocumentMainCategory } from '../types';

export const COMPANY_DOCUMENT_CATALOGS: CompanyCatalogDefinition[] = [
  {
    id: 'vertraege',
    titleDe: 'Verträge & Rechtliches',
    titleAr: 'عقود',
    description: 'Miet-, Leasing-, Software-, Kooperations- und Lieferantenverträge Ihres Autohauses.',
    iconName: 'FileSignature',
    defaultSubcategories: [
      'Mietverträge & Pacht',
      'Leasing- & Finanzierungsverträge',
      'Lieferanten- & Kooperationsverträge',
      'Software- & IT-Lizenzen',
      'Kauf- & Rahmenverträge',
      'Sonstige Verträge'
    ]
  },
  {
    id: 'versicherungen',
    titleDe: 'Versicherungen & Risikoschutz',
    titleAr: 'تأمينات',
    description: 'Betriebshaftpflicht, Flottenversicherung, Rote Kennzeichen, Gebäude- & Inventarschutz.',
    iconName: 'ShieldCheck',
    defaultSubcategories: [
      'Betriebshaftpflichtversicherung',
      'Flotten- & Rote Kennzeichen Deckung',
      'Gebäude- & Inventarversicherung',
      'Rechtsschutzversicherung',
      'Elektronik- & Cyberversicherung',
      'Sonstige Versicherungen'
    ]
  },
  {
    id: 'versorger',
    titleDe: 'Versorger, Energie & Nebenkosten',
    titleAr: 'اشتراكات كهرباء وماء وغيرها',
    description: 'Gewerbestrom, Gas, Wasser, Internet, Abfallwirtschaft und Reinigungsdienste.',
    iconName: 'Zap',
    defaultSubcategories: [
      'Stromversorgung & Gewerbestrom',
      'Wasser & Abwasser',
      'Heizung & Erdgas',
      'Internet, Festnetz & Mobilfunk',
      'Entsorgung & Abfallwirtschaft',
      'Reinigung & Hausmeisterservice',
      'Sonstige Versorger'
    ]
  },
  {
    id: 'personal',
    titleDe: 'Personal- & Mitarbeiterdokumente',
    titleAr: 'وثائق عمال',
    description: 'Arbeitsverträge, Lohnabrechnungen, SV-Meldungen, BG Verkehr und Schulungszertifikate.',
    iconName: 'Users',
    defaultSubcategories: [
      'Arbeitsverträge & Zusatzvereinbarungen',
      'Lohn- & Gehaltsabrechnungen',
      'Sozialversicherung & Krankenkassen',
      'Personalausweise & Aufenthaltstitel',
      'Berufsgenossenschaft (BG Verkehr)',
      'Zertifikate, Schulungen & Führerscheine',
      'Urlaubs- & Krankmeldungen',
      'Sonstige Personalakten'
    ]
  },
  {
    id: 'steuern_behoerden',
    titleDe: 'Behörden, Steuern & Finanzen',
    titleAr: 'ضرائب وترخيص وحكومية',
    description: 'Gewerbeschein, Handelsregisterauszug, Finanzamt-Bescheide, IHK und Bankunterlagen.',
    iconName: 'Landmark',
    defaultSubcategories: [
      'Gewerbeanmeldung & Gewerbeschein',
      'Handelsregisterauszug (HRB)',
      'Finanzamt & Steuerbescheide',
      'IHK & Handwerkskammer',
      'Zoll & EORI-Unterlagen',
      'Bankbestätigungen & Kredite'
    ]
  },
  {
    id: 'sonstiges',
    titleDe: 'Sonstiges & Allgemeine Firmenakten',
    titleAr: 'Sonstiges',
    description: 'TÜV/UVV Prüfbücher für Hebebühnen, Gewährleistungen, Notariatsurkunden und Archiv.',
    iconName: 'FolderArchive',
    defaultSubcategories: [
      'TÜV / UVV Prüfprotokolle Betriebsmittel',
      'Notarielle Urkunden & Gesellschafterbeschlüsse',
      'Garantieurkunden & Bedienungsanleitungen',
      'Archiv & Altunterlagen',
      'Allgemeine Belege & Schriftverkehr'
    ]
  }
];

// Reusable dummy document data URLs for preview
const SAMPLE_PDF_SVG = (title: string, subtitle: string, color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100" fill="#f8fafc">
  <rect width="800" height="1100" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="800" height="14" fill="${color}"/>
  
  <!-- Header with seal -->
  <circle cx="710" cy="90" r="45" fill="#f1f5f9" stroke="${color}" stroke-width="2"/>
  <text x="710" y="85" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${color}" text-anchor="middle">OFFIZIELLES</text>
  <text x="710" y="100" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${color}" text-anchor="middle">DOKUMENT</text>
  
  <text x="60" y="90" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#0f172a">${title}</text>
  <text x="60" y="125" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#64748b">${subtitle}</text>
  <line x1="60" y1="150" x2="740" y2="150" stroke="#e2e8f0" stroke-width="2"/>
  
  <!-- Metadata Box -->
  <rect x="60" y="180" width="680" height="110" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="85" y="215" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155">Aktenzeichen / Vertrags-Nr.:</text>
  <text x="260" y="215" font-family="Courier, monospace" font-size="13" font-weight="bold" fill="${color}">DOK-MAXF-2026-9921</text>
  
  <text x="85" y="245" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155">Aussteller / Vertragspartner:</text>
  <text x="260" y="245" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">MaxFleet Autohandelsgruppe GmbH</text>
  
  <text x="85" y="275" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155">Status & Gültigkeit:</text>
  <text x="260" y="275" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#15803d">Geprüft & Rechtsgültig archiviert</text>

  <!-- Content Lines Simulation -->
  <rect x="60" y="330" width="680" height="18" fill="#e2e8f0" rx="4"/>
  <rect x="60" y="360" width="620" height="14" fill="#f1f5f9" rx="3"/>
  <rect x="60" y="385" width="650" height="14" fill="#f1f5f9" rx="3"/>
  <rect x="60" y="410" width="540" height="14" fill="#f1f5f9" rx="3"/>

  <rect x="60" y="450" width="680" height="18" fill="#e2e8f0" rx="4"/>
  <rect x="60" y="480" width="600" height="14" fill="#f1f5f9" rx="3"/>
  <rect x="60" y="505" width="630" height="14" fill="#f1f5f9" rx="3"/>
  <rect x="60" y="530" width="490" height="14" fill="#f1f5f9" rx="3"/>

  <rect x="60" y="570" width="680" height="18" fill="#e2e8f0" rx="4"/>
  <rect x="60" y="600" width="640" height="14" fill="#f1f5f9" rx="3"/>
  <rect x="60" y="625" width="580" height="14" fill="#f1f5f9" rx="3"/>

  <!-- Footer with signature -->
  <line x1="60" y1="920" x2="340" y2="920" stroke="#94a3b8" stroke-width="1"/>
  <text x="60" y="945" font-family="Arial, sans-serif" font-size="12" fill="#64748b">Ort, Datum & rechtsverbindliche Unterschrift</text>
  
  <rect x="60" y="980" width="680" height="50" rx="6" fill="#f1f5f9"/>
  <text x="400" y="1010" font-family="Arial, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">MaxFleet Digitales Dokumentenarchiv • Gesichert nach GoBD-Grundsätzen</text>
</svg>`)}`;

export const INITIAL_COMPANY_DOCUMENTS: CompanyDocument[] = [
  // 1. عقود (Verträge)
  {
    id: 'cdoc-1',
    title: 'Gewerbemietvertrag Autohaus Kurfürstendamm 210',
    category: 'vertraege',
    subcategory: 'Mietverträge & Pacht',
    referenceNumber: 'MV-KUDAMM-2024-B',
    issuer: 'Immobilienverwaltung KuDamm Forum GbR',
    documentDate: '2024-01-15',
    validUntil: '2029-12-31',
    noticePeriod: '12 Monate zum Jahresende',
    costAmount: 6450.00,
    costInterval: 'monatlich',
    notes: 'Hauptmietvertrag über Ausstellungsfläche, Kundenlounge und 18 Außenstellplätze.',
    tags: ['Miete', 'Firmensitz', 'Wichtig'],
    isPinned: true,
    fileName: 'Gewerbemietvertrag_KuDamm210_2024.pdf',
    fileSize: 2450800, // 2.45 MB
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('Gewerbemietvertrag', 'Hauptsitz Autohaus Kurfürstendamm', '#2563eb'),
    uploadedAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'cdoc-2',
    title: 'DMS Software- & Plattformvertrag (Mobile.de & AutoScout24)',
    category: 'vertraege',
    subcategory: 'Software- & IT-Lizenzen',
    referenceNumber: 'IT-LIC-9042',
    issuer: 'Dealer Solutions Pro GmbH',
    documentDate: '2026-01-01',
    validUntil: '2026-12-31',
    noticePeriod: '3 Monate zum Vertragsende',
    costAmount: 490.00,
    costInterval: 'monatlich',
    notes: 'Inklusive API-Schnittstelle, automatischer Fahrzeug-Export und 10 Benutzerzugänge.',
    tags: ['Software', 'Börsen-Export'],
    fileName: 'DMS_Lizenzvertrag_DealerSolutions.pdf',
    fileSize: 1120400,
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('Software-Lizenzvertrag', 'Dealer Solutions Pro Cloud Service', '#3b82f6'),
    uploadedAt: '2026-08-02T14:30:00.000Z'
  },

  // 2. تأمينات (Versicherungen)
  {
    id: 'cdoc-3',
    title: 'Betriebshaftpflicht & Umweltschadensdeckung',
    category: 'versicherungen',
    subcategory: 'Betriebshaftpflichtversicherung',
    referenceNumber: 'POL-ALLIANZ-BH-77192',
    issuer: 'Allianz Versicherungs-AG Deutschland',
    documentDate: '2026-01-01',
    validUntil: '2026-12-31',
    noticePeriod: '3 Monate zum Ablauf',
    costAmount: 2850.00,
    costInterval: 'jaehrlich',
    notes: 'Deckungssumme: 10.000.000 € pauschal für Personen- und Sachschäden, inkl. Werkstattrisiko.',
    tags: ['Versicherung', 'Haftpflicht', 'Pflicht'],
    isPinned: true,
    fileName: 'Police_Allianz_Betriebshaftpflicht_2026.pdf',
    fileSize: 1845000,
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('Betriebshaftpflicht-Versicherung', 'Allianz Versicherungs-AG Police #77192', '#059669'),
    uploadedAt: '2026-08-01T11:20:00.000Z'
  },
  {
    id: 'cdoc-4',
    title: 'Kfz-Flotten- & Rote Kennzeichen Versicherung (B-06)',
    category: 'versicherungen',
    subcategory: 'Flotten- & Rote Kennzeichen Deckung',
    referenceNumber: 'VHV-FLOTTE-88210',
    issuer: 'VHV Allgemeine Versicherung AG',
    documentDate: '2026-01-01',
    validUntil: '2027-12-31',
    noticePeriod: '1 Monat vor Ablauf',
    costAmount: 4120.00,
    costInterval: 'jaehrlich',
    notes: 'Vollkasko-Schutz für Überführungs- und Probefahrten aller roten Händler-Kennzeichen.',
    tags: ['Rote Kennzeichen', 'Probefahrten', 'Flotte'],
    fileName: 'VHV_Flottenpolice_RoteKennzeichen_2026.pdf',
    fileSize: 1980000,
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('Kfz-Flottenpolice & Rote Kennzeichen', 'VHV Allgemeine Versicherung #88210', '#10b981'),
    uploadedAt: '2026-08-03T09:15:00.000Z'
  },

  // 3. اشتراكات كهرباء وماء وغيرها (Versorger)
  {
    id: 'cdoc-5',
    title: 'Gewerbestromvertrag Showroom & Werkstatt (Ökostrom)',
    category: 'versorger',
    subcategory: 'Stromversorgung & Gewerbestrom',
    referenceNumber: 'VATTENFALL-STR-499120',
    issuer: 'Vattenfall Europe Sales GmbH',
    documentDate: '2025-11-01',
    validUntil: '2027-10-31',
    noticePeriod: '6 Wochen zum Vertragsende',
    costAmount: 780.00,
    costInterval: 'monatlich',
    notes: 'Zählernummer: 1EMH0049219482. Preisgarantie bis 31.10.2027, 100% Ökostrom für Ladestationen.',
    tags: ['Strom', 'Energie', 'Gewerbe'],
    fileName: 'Stromvertrag_Vattenfall_KuDamm.pdf',
    fileSize: 840000,
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('Gewerbestromvertrag', 'Vattenfall Europe Sales #499120', '#d97706'),
    uploadedAt: '2026-08-04T12:00:00.000Z'
  },
  {
    id: 'cdoc-6',
    title: 'Glasfaser Gigabit-Internet & VoIP-Telefonanlage',
    category: 'versorger',
    subcategory: 'Internet, Festnetz & Mobilfunk',
    referenceNumber: 'TEL-GF-2025-081',
    issuer: 'Telekom Deutschland GmbH Business',
    documentDate: '2025-06-01',
    validUntil: '2027-05-31',
    noticePeriod: '3 Monate vor Ablauf',
    costAmount: 149.00,
    costInterval: 'monatlich',
    notes: 'Company Pro 1000/200 MBit/s synchron, 8 Festnetznummern für Vertrieb & Werkstatt.',
    tags: ['Telekom', 'Glasfaser', 'Telefon'],
    fileName: 'Telekom_Business_Glasfaservertrag.pdf',
    fileSize: 620000,
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('Glasfaser & Festnetzvertrag', 'Telekom Business Company Pro 1000', '#f59e0b'),
    uploadedAt: '2026-08-04T12:30:00.000Z'
  },

  // 4. وثائق عمال (Personal)
  {
    id: 'cdoc-7',
    title: 'Muster-Arbeitsvertrag Automobilkaufmann (Vollzeit)',
    category: 'personal',
    subcategory: 'Arbeitsverträge & Zusatzvereinbarungen',
    referenceNumber: 'PERS-AV-MUSTER-2026',
    issuer: 'MaxFleet Personalabteilung',
    documentDate: '2026-01-15',
    notes: 'Rechtlich geprüfter Standardvertrag mit Provisionsvereinbarung und Geheimhaltungsklausel.',
    tags: ['Personal', 'Vertrag', 'Mitarbeiter'],
    fileName: 'Mustervertrag_Automobilkaufmann_2026.pdf',
    fileSize: 950000,
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('Standard-Arbeitsvertrag', 'MaxFleet Personalwesen Vollzeit', '#8b5cf6'),
    uploadedAt: '2026-08-05T15:00:00.000Z'
  },
  {
    id: 'cdoc-8',
    title: 'Unbedenklichkeitsbescheinigung Berufsgenossenschaft Verkehr',
    category: 'personal',
    subcategory: 'Berufsgenossenschaft (BG Verkehr)',
    referenceNumber: 'BGV-UNBED-2026-039',
    issuer: 'Berufsgenossenschaft Verkehrswirtschaft',
    documentDate: '2026-06-30',
    validUntil: '2027-06-30',
    notes: 'Bescheinigung über ordnungsgemäße Meldung und Beitragszahlung für alle Werkstattmitarbeiter.',
    tags: ['BG Verkehr', 'Unbedenklichkeit'],
    fileName: 'BG_Verkehr_Unbedenklichkeit_2026.pdf',
    fileSize: 450000,
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('BG Verkehr Bescheinigung', 'Berufsgenossenschaft Verkehr #2026-039', '#7c3aed'),
    uploadedAt: '2026-08-06T10:00:00.000Z'
  },

  // 5. ضرائب وترخيص وحكومية (Behörden, Steuern & Finanzen)
  {
    id: 'cdoc-9',
    title: 'Handelsregisterauszug Amtsgericht Charlottenburg (HRB 198421 B)',
    category: 'steuern_behoerden',
    subcategory: 'Handelsregisterauszug (HRB)',
    referenceNumber: 'HRB-198421-B-BE',
    issuer: 'Amtsgericht Charlottenburg Handelsregister',
    documentDate: '2026-07-10',
    validUntil: '2027-07-10',
    notes: 'Aktueller amtlicher Auszug mit Nachweis der Vertretungsbefugnis und Stammkapital.',
    tags: ['HRB', 'Register', 'Notar'],
    isPinned: true,
    fileName: 'Handelsregisterauszug_HRB198421B.pdf',
    fileSize: 1350000,
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('Handelsregisterauszug', 'Amtsgericht Charlottenburg HRB 198421 B', '#0284c7'),
    uploadedAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'cdoc-10',
    title: 'Gewerbeanmeldung gem. § 14 GewO (Kfz-Handel & Vermietung)',
    category: 'steuern_behoerden',
    subcategory: 'Gewerbeanmeldung & Gewerbeschein',
    referenceNumber: 'GEW-BLN-CH-2022-891',
    issuer: 'Bezirksamt Charlottenburg-Wilmersdorf von Berlin',
    documentDate: '2022-03-01',
    notes: 'Gewerbezulassung für An- und Verkauf von Kraftfahrzeugen, Im- und Export sowie KFZ-Pflege.',
    tags: ['Gewerbeschein', 'Gewerbeamt'],
    fileName: 'Gewerbeschein_Autohaus_Berlin.pdf',
    fileSize: 780000,
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('Gewerbeanmeldung', 'Bezirksamt Charlottenburg-Wilmersdorf § 14 GewO', '#0369a1'),
    uploadedAt: '2026-08-01T09:10:00.000Z'
  },

  // 6. Sonstiges
  {
    id: 'cdoc-11',
    title: 'UVV-Sicherheitsprüfprotokoll 2-Säulen-Hebebühnen (Werkstatt)',
    category: 'sonstiges',
    subcategory: 'TÜV / UVV Prüfprotokolle Betriebsmittel',
    referenceNumber: 'UVV-PR-2026-08',
    issuer: 'DEKRA Automobil GmbH',
    documentDate: '2026-05-12',
    validUntil: '2027-05-12',
    notes: 'Jährliche Sicherheitsprüfung der 4 Werkstatt-Hebebühnen ohne Mängel bestanden.',
    tags: ['UVV', 'DEKRA', 'Werkstatt', 'Sicherheit'],
    fileName: 'DEKRA_UVV_Pruefbuch_Hebebuehnen.pdf',
    fileSize: 1650000,
    fileType: 'application/pdf',
    fileDataUrl: SAMPLE_PDF_SVG('UVV-Prüfprotokoll DEKRA', 'Sicherheitsabnahme Werkstatt-Hebebühnen', '#64748b'),
    uploadedAt: '2026-08-07T11:45:00.000Z'
  }
];
