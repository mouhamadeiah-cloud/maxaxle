import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Car, 
  CheckCircle2, 
  Lock, 
  Calendar, 
  ArrowRight, 
  Edit2, 
  Menu,
  Receipt,
  FileBadge,
  CreditCard,
  Scale,
  Plus,
  User,
  Coins,
  Clock,
  Key,
  Route,
  ShieldAlert,
  Trash2,
  QrCode,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { 
  Customer, 
  MerchantSettings, 
  OperationDocumentType, 
  OperationVehicleItem,
  KaufvertragDetails,
  ProbefahrtDetails,
  UebergabeprotokollDetails
} from '../../types';
import { calculateDocumentTaxes } from '../../utils/taxCalculationEngine';
import { firebaseService } from '../../services/firebaseService';
import { KaufvertragA4Layout } from './KaufvertragA4Layout';
import { ProbefahrtA4Layout } from './ProbefahrtA4Layout';
import { UebergabeProtocolA4Layout } from './UebergabeProtocolA4Layout';
import { DocumentTemplateDropdown } from './DocumentTemplateDropdown';
import { DocumentTextController } from '../../controllers/DocumentTextController';

interface InteractiveDocumentA4Props {
  documentType: OperationDocumentType;
  documentNumber: string;
  date: string;
  setDate: (d: string) => void;
  dueDate: string;
  setDueDate: (d: string) => void;
  validUntil: string;
  setValidUntil: (d: string) => void;
  customer: Customer | null;
  manualCustomer: Partial<Customer> | null;
  vehicles: OperationVehicleItem[];
  onChangeVehicles: (v: OperationVehicleItem[]) => void;
  paymentMethod: string;
  setPaymentMethod: (p: any) => void;
  depositAmount: number;
  setDepositAmount: (a: number) => void;
  introText: string;
  setIntroText: (t: string) => void;
  warrantyText?: string;
  setWarrantyText?: (w: string) => void;
  exportText?: string;
  setExportText?: (e: string) => void;
  notes: string;
  setNotes: (n: string) => void;
  merchantSettings: MerchantSettings;

  // Specific Parameters
  probefahrtLicensePlate?: string;
  setProbefahrtLicensePlate?: (p: string) => void;
  probefahrtDurationHours?: number;
  setProbefahrtDurationHours?: (h: number) => void;
  probefahrtDeductible?: number;
  setProbefahrtDeductible?: (d: number) => void;
  probefahrtDetails?: ProbefahrtDetails;
  uebergabeprotokollDetails?: UebergabeprotokollDetails;
  kaufvertragDetails?: KaufvertragDetails;

  exportCountry?: string;
  setExportCountry?: (c: string) => void;
  exportVatId?: string;
  setExportVatId?: (v: string) => void;
  exportCustomsOffice?: string;
  eRechnungBuyerRef?: string;
  eRechnungFormat?: 'XRechnung' | 'ZUGFeRD';

  // Modal / Drawer triggers
  onOpenLagerDrawer: () => void;
  onOpenKundenDrawer: () => void;
  onOpenQuickEditProbefahrt: (field: 'plate' | 'duration' | 'route' | 'deductible') => void;
  onOpenTemplateModal: () => void;

  pageNumber?: number;
  totalPages?: number;
}

export const InteractiveDocumentA4: React.FC<InteractiveDocumentA4Props> = ({
  documentType,
  documentNumber,
  date,
  setDate,
  dueDate,
  setDueDate,
  validUntil,
  setValidUntil,
  customer,
  manualCustomer,
  vehicles,
  onChangeVehicles,
  paymentMethod,
  setPaymentMethod,
  depositAmount,
  setDepositAmount,
  introText,
  setIntroText,
  warrantyText,
  setWarrantyText,
  exportText,
  setExportText,
  notes,
  setNotes,
  merchantSettings,

  probefahrtLicensePlate,
  setProbefahrtLicensePlate,
  probefahrtDurationHours = 1,
  setProbefahrtDurationHours,
  probefahrtDeductible = 1000,
  setProbefahrtDeductible,
  probefahrtDetails,
  uebergabeprotokollDetails,
  kaufvertragDetails,

  exportCountry = 'Polen',
  setExportCountry,
  exportVatId = '',
  setExportVatId,
  exportCustomsOffice,
  eRechnungBuyerRef,
  eRechnungFormat = 'XRechnung',

  onOpenLagerDrawer,
  onOpenKundenDrawer,
  onOpenQuickEditProbefahrt,
  onOpenTemplateModal,

  pageNumber = 1,
  totalPages = 1
}) => {
  // Dedicated specialized layouts for Kaufvertrag, Probefahrt, Uebergabeprotokoll
  if (documentType === 'kaufvertrag' && kaufvertragDetails) {
    return (
      <KaufvertragA4Layout
        kaufvertrag={kaufvertragDetails}
        merchantSettings={merchantSettings}
        internalRefNumber={documentNumber}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    );
  }

  if (documentType === 'probefahrt' && probefahrtDetails) {
    return (
      <ProbefahrtA4Layout
        probefahrt={probefahrtDetails}
        merchantSettings={merchantSettings}
        internalRefNumber={documentNumber}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    );
  }

  if (documentType === 'uebergabeprotokoll' && uebergabeprotokollDetails) {
    return (
      <UebergabeProtocolA4Layout
        protocol={uebergabeprotokollDetails}
        merchantSettings={merchantSettings}
        internalRefNumber={documentNumber}
        pageNumber={pageNumber}
        totalPages={totalPages || 3}
      />
    );
  }

  const activeCustomer = customer || manualCustomer;
  const validVehicles = vehicles.filter(v => v.brand && v.sellingPrice > 0);
  const primaryVeh = validVehicles[0];

  const hasVehicle = validVehicles.length > 0;
  const hasCustomer = !!activeCustomer && (!!activeCustomer.name || !!activeCustomer.companyName);

  // Check whether vehicle is margin scheme (Differenzbesteuerung § 25a UStG)
  const isMarginScheme = primaryVeh ? primaryVeh.taxType === 'diff_25a' : (merchantSettings.defaultTaxation === 'diff_25a');

  // Perform accurate tax calculation via Tax Engine
  const calc = calculateDocumentTaxes(documentType, validVehicles, depositAmount, notes, merchantSettings?.vatRate);

  // Critical Tax Rule: If vehicle is diff_25a, override export heading to standard RECHNUNG
  const getDocHeading = () => {
    if (isMarginScheme && (documentType === 'eu_export' || documentType === 'export_drittland')) {
      return 'RECHNUNG (§ 25a UStG)';
    }
    switch (documentType) {
      case 'angebot': return 'ANGEBOT';
      case 'rechnung': return 'RECHNUNG';
      case 'e_rechnung': return `E-RECHNUNG (${eRechnungFormat.toUpperCase()})`;
      case 'eu_export': return 'EU-RECHNUNG (STEUERFREI)';
      case 'export_drittland': return 'DRITTLANDRECHNUNG (AUSFUHR)';
      case 'kaufvertrag': return 'KAUFVERTRAG';
      case 'probefahrt': return 'PROBEFAHRT-VEREINBARUNG';
      case 'uebergabeprotokoll': return 'ÜBERGABEPROTOKOLL';
      default: return 'RECHNUNG';
    }
  };

  const windowEnvelopeReturnLine = `${merchantSettings.companyName || 'MaxFleet Autohandel'} · ${merchantSettings.street || 'Bonner Straße 12'} · ${merchantSettings.postalCode || '53111'} ${merchantSettings.city || 'Bonn'}`;

  const customerName = activeCustomer?.name || 
    (activeCustomer?.companyName || `${activeCustomer?.firstName || ''} ${activeCustomer?.lastName || ''}`.trim()) || 
    '';

  const primaryTaxType = primaryVeh?.taxType || 'diff_25a';

  // Tax/Legal clause based on document type & Critical Paragraph 25a override
  const getTaxLegalParagraph = () => {
    // Critical Tax Rule: If vehicle is diff_25a, always apply Paragraph 25a notice and override export paragraphs
    if (isMarginScheme) {
      return {
        title: 'Sonderregelung Differenzbesteuerung gem. § 25a UStG',
        text: 'Gebrauchtgegenstände / Sonderregelung: Die Besteuerung erfolgt nach § 25a UStG (Differenzbesteuerung). Ein gesonderter Ausweis der Umsatzsteuer auf der Rechnung ist gesetzlich ausgeschlossen. Ein Vorsteuerabzug ist für den Erwerber nicht möglich.'
      };
    }
    if (documentType === 'eu_export') {
      return {
        title: 'Steuerfreie innergemeinschaftliche Lieferung gem. § 4 Nr. 1b i.V.m. § 6a UStG',
        text: `Steuerfreie innergemeinschaftliche Fahrzeuglieferung. Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge). Bestimmungsland: ${exportCountry || 'EU-Mitgliedstaat'}. USt-IdNr. des Erwerbers: ${exportVatId || activeCustomer?.vatId || 'Geprüft & Gültig'}. Verbringungsnachweis / Gelangensbestätigung wird archiviert.`
      };
    }
    if (documentType === 'export_drittland') {
      return {
        title: 'Steuerfreie Ausfuhrlieferung in das Drittland gem. § 4 Nr. 1a i.V.m. § 6 UStG',
        text: `Steuerfreie Ausfuhrlieferung in das Drittland (${exportCountry || 'Drittland'}). Der Nachweis der Ausfuhr aus dem Zollgebiet der Europäischen Union erfolgt über das elektronische Ausfuhrverfahren ATLAS (Ausgangsvermerk).`
      };
    }
    if (documentType === 'e_rechnung') {
      return {
        title: 'Elektronische Rechnung gem. EN 16931 & E-Rechnungsverordnung',
        text: primaryTaxType === 'standard_19'
          ? `Regelbesteuerung: Rechnungsbetrag enthält 19% gesetzliche Umsatzsteuer. Elektronisch signiert & archiviert. Leitweg-ID: ${eRechnungBuyerRef || '04011000-12345-67'}.`
          : `Differenzbesteuerung nach § 25a UStG für Gebrauchtgegenstände / Sonderregelung. Kein gesonderter MwSt.-Ausweis. Leitweg-ID: ${eRechnungBuyerRef || '04011000-12345-67'}.`
      };
    }
    if (documentType === 'angebot') {
      return {
        title: 'Freibleibendes Angebot',
        text: `Dieses Angebot ist freibleibend und unverbindlich. Preisbindung bis einschließlich ${validUntil || date}. Zwischenverkauf, technische Änderungen und Irrtümer vorbehalten.`
      };
    }
    // Standard Rechnung
    if (primaryTaxType === 'standard_19') {
      return {
        title: 'Regelbesteuerung (19% Umsatzsteuer)',
        text: 'Die ausgewiesenen Leistungen unterliegen der regulären gesetzlichen Umsatzsteuer von 19%. Steuerschuldner ist der leistende Unternehmer. Vorsteuerabzugsberechtigte Unternehmer können die Steuer geltend machen.'
      };
    }
    return {
      title: 'Sonderregelung Differenzbesteuerung gem. § 25a UStG',
      text: 'Gebrauchtgegenstände / Sonderregelung: Die Besteuerung erfolgt nach § 25a UStG (Differenzbesteuerung). Ein gesonderter Ausweis der Umsatzsteuer auf der Rechnung ist gesetzlich ausgeschlossen. Ein Vorsteuerabzug ist für den Erwerber nicht möglich.'
    };
  };

  const taxParagraph = getTaxLegalParagraph();

  return (
    <div 
      id="interactive-document-a4-sheet"
      className="a4-print-sheet bg-white text-slate-900 mx-auto shadow-2xl border border-slate-200 rounded-none sm:rounded-lg font-sans relative flex flex-col justify-between select-text"
      style={{
        width: '100%',
        maxWidth: '210mm',
        minHeight: '297mm',
        maxHeight: '297mm',
        height: '297mm',
        padding: '20mm 20mm 15mm 20mm',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER SECTION: EXACT DIN 5008 & WINDOW ENVELOPE DIMENSIONS        */}
      {/* ========================================================================= */}
      <div>
        
        {/* UPPER ROW: LOGO & WINDOW ENVELOPE LEFT (85mm) vs METADATA RIGHT (65mm) */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-300">
          
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT BLOCK: EXACT DIN 5008 WINDOW (X: 20mm, Y: 50mm, W: 85mm, H: 40mm)   */}
          {/* ----------------------------------------------------------------------- */}
          <div className="w-[85mm] flex flex-col justify-between h-[70mm]">
            
            {/* Merchant Logo (Positioned strictly at Y: 25mm, height 15mm) */}
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

            {/* Merchant Return Address Line (At Y: 45mm, DIN 5008 window top line) */}
            <div className="h-[5mm] flex items-center">
              <div className="text-[7.5pt] text-slate-500 font-medium underline tracking-tight truncate w-full">
                {windowEnvelopeReturnLine}
              </div>
            </div>

            {/* Customer Billing Address Block (Y: 50mm to 90mm, W: 85mm, H: 40mm) */}
            <div className="w-[85mm] h-[40mm] flex flex-col justify-center">
              {!hasCustomer ? (
                <div 
                  id="a4-mandatory-customer-slot"
                  onClick={onOpenKundenDrawer}
                  className="group border-2 border-rose-500 bg-rose-50 hover:bg-rose-100/90 rounded-lg p-2 cursor-pointer transition-all duration-300 shadow-xs h-full flex flex-col justify-center animate-pulse"
                  title="Klicken um Kundenkartei zu öffnen (Pflichtfeld)"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-rose-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                        !
                      </div>
                      <div>
                        <div className="text-rose-700 font-black text-[10px] uppercase tracking-wider">
                          Kunde auswählen
                        </div>
                        <span className="text-[8.5px] font-semibold text-rose-600/90 block">
                          Pflichtfeld für Rechnungsempfänger
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                </div>
              ) : (
                <div className="group relative p-2 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-lg transition text-[10px] text-slate-800 leading-tight h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-0.5">
                      <span className="text-[8px] font-extrabold text-emerald-800 uppercase tracking-wider">
                        Rechnungsempfänger:
                      </span>
                      <button
                        type="button"
                        onClick={onOpenKundenDrawer}
                        className="text-[8px] font-bold text-slate-600 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer bg-white px-1.5 py-0.5 rounded border border-slate-300"
                      >
                        <Edit2 className="w-2 h-2" />
                        <span>Ändern</span>
                      </button>
                    </div>
                    {activeCustomer?.companyName && (
                      <div className="font-extrabold text-slate-900 text-[11px] truncate">{activeCustomer.companyName}</div>
                    )}
                    <div className="font-bold text-slate-900 text-[11px] truncate">{customerName}</div>
                    <div className="truncate">{activeCustomer?.street || 'Musterstraße 1'}</div>
                    <div className="truncate">{activeCustomer?.postalCode} {activeCustomer?.city} &bull; {activeCustomer?.country || 'Deutschland'}</div>
                  </div>
                  {(activeCustomer?.vatId || exportVatId) && (
                    <div className="text-[8.5px] font-mono text-slate-600 truncate">
                      USt-IdNr.: <span className="font-bold text-slate-900">{exportVatId || activeCustomer?.vatId}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT BLOCK: METADATA & SENDER DETAILS (X: 125mm, W: 65mm, H: 70mm)     */}
          {/* ----------------------------------------------------------------------- */}
          <div className="w-[65mm] text-right flex flex-col justify-between h-[70mm]">
            
            {/* Top Right: Document Title & Merchant Name (Aligns with Logo) */}
            <div className="h-[15mm] flex flex-col justify-center">
              <h1 className="text-lg font-black text-slate-950 tracking-tight uppercase leading-none">
                {getDocHeading()}
              </h1>
              <div className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">
                {merchantSettings.companyName || 'MaxFleet Autohandel'}
              </div>
            </div>

            {/* Merchant Details & Contact (Aligns with return line transition) */}
            <div className="h-[10mm] text-[8.5px] text-slate-600 flex flex-col justify-center space-y-0.5">
              <div className="truncate">{merchantSettings.street || 'Bonner Straße 12'} &bull; {merchantSettings.postalCode || '53111'} {merchantSettings.city || 'Bonn'}</div>
              <div className="truncate">Tel: <span className="font-semibold text-slate-800">{merchantSettings.phone || '+49 228 98765-0'}</span></div>
              <div className="truncate">USt-IdNr.: <span className="font-mono font-semibold text-slate-800">{merchantSettings.vatId || 'DE 319 824 550'}</span></div>
            </div>

            {/* Right Block Metadata (H: 40mm - Bottom baseline perfectly aligned with Customer Block) */}
            <div className="h-[40mm] flex flex-col justify-end text-right text-[10px] space-y-1.5 pb-1">
              {/* Line 1: Belegnummer */}
              <div className="flex justify-end items-baseline gap-2">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Belegnummer:</span>
                <span className="font-mono font-black text-slate-950 text-[11px]">{documentNumber}</span>
              </div>
              {/* Line 2: Datum */}
              <div className="flex justify-end items-baseline gap-2">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Datum:</span>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="font-bold text-slate-900 text-[10px] bg-transparent border-none outline-none text-right p-0 w-24"
                />
              </div>
              {/* Line 3: Lieferdatum */}
              <div className="flex justify-end items-baseline gap-2">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Lieferdatum:</span>
                <span className="font-bold text-slate-900 text-[10px]">{date}</span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. BODY: GREETING TEXT & TAX NOTICE (FULL WIDTH)                          */}
        {/* ========================================================================= */}
        <div className="pt-2 space-y-1.5 w-full">
          
          {/* Greeting Text (Full Width across page, dynamic from settings) */}
          <div className="relative group bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/90 w-full">
            <div className="flex items-center justify-end pb-1 print:hidden">
              {/* Single Unified Greeting Selector Trigger */}
              <DocumentTemplateDropdown
                category="welcome"
                onSelect={(selectedContent) => {
                  if (setIntroText) setIntroText(selectedContent);
                }}
                activeText={introText}
                variant="light-document"
                buttonLabel="Begrüßung wählen"
              />
            </div>

            <textarea
              rows={2}
              value={introText ?? DocumentTextController.getDefaultText('welcome', documentType)}
              onChange={(e) => setIntroText && setIntroText(e.target.value)}
              placeholder="Begrüßungstext eingeben oder oben eine Vorlage auswählen..."
              className="w-full text-[10px] text-slate-800 bg-transparent border-none outline-none resize-none leading-snug font-sans placeholder:text-slate-400"
            />
          </div>

          {/* Tax / Legal Notice Paragraph (Full Width) */}
          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[9.5px] space-y-0.5 w-full">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-700 shrink-0" />
              <span>{taxParagraph.title}</span>
            </div>
            <p className="text-slate-600 text-[9px] leading-tight">
              {taxParagraph.text}
            </p>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. SALES TABLE: COMPACT VEHICLE LINE ITEM & TAX RATES                     */}
        {/* ========================================================================= */}
        <div className="pt-2 w-full">
          {!hasVehicle ? (
            <div 
              id="a4-mandatory-vehicle-slot"
              onClick={onOpenLagerDrawer}
              className="group border-2 border-rose-500 bg-rose-50 hover:bg-rose-100/90 rounded-xl p-3 cursor-pointer transition-all duration-300 shadow-xs animate-pulse flex items-center justify-between"
              title="Klicken um Mein Lager zu öffnen & Fahrzeug zu wählen (Pflichtfeld)"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-rose-700 font-black text-xs uppercase tracking-wider">
                    Fahrzeug aus Fahrzeuglager auswählen (Pflichtfeld)
                  </div>
                  <span className="text-[10px] font-semibold text-rose-600/90">
                    Klicken zum automatischen Laden der Fahrzeugdaten & des Verkaufspreises
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-600" />
            </div>
          ) : (
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
                  {validVehicles.map((veh, idx) => {
                    const lineNet = veh.taxType === 'standard_19' ? veh.sellingPrice / 1.19 : veh.sellingPrice;
                    const taxLabel = isMarginScheme || veh.taxType === 'diff_25a'
                      ? '§ 25a'
                      : veh.taxType === 'standard_19'
                      ? '19%'
                      : (documentType === 'eu_export' || documentType === 'export_drittland' ? '0% Export' : '§ 25a');
                    return (
                      <tr key={veh.id || idx} className="align-top">
                        <td className="py-1.5 px-2.5 font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-1.5 px-2.5 space-y-0.5">
                          <div className="font-extrabold text-slate-950 text-[11px] flex items-center justify-between">
                            <span>{veh.brand} {veh.model} {veh.variant || ''}</span>
                            <button
                              type="button"
                              onClick={onOpenLagerDrawer}
                              className="text-[8.5px] font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-0.5 cursor-pointer bg-slate-100 px-1 py-0.5 rounded border border-slate-300"
                            >
                              <Edit2 className="w-2 h-2" />
                              <span>Wechseln</span>
                            </button>
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
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. TOTALS & ZAHLUNGSZIEL (RIGHT SIDE BENEATH SUMMARY)                     */}
        {/* ========================================================================= */}
        <div className="pt-2 flex justify-end">
          <div className="w-72 space-y-1">
            
            {/* Totals Box */}
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
                  <span>{isMarginScheme ? 'gem. § 25a UStG' : (documentType === 'eu_export' || documentType === 'export_drittland' ? '0% Steuerfrei' : 'gem. § 25a UStG')}</span>
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
            </div>

            {/* Payment Terms (Zahlungsziel) directly beneath Totals on the right */}
            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[9.5px]">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Zahlungsziel:</span>
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="font-bold text-slate-900 text-right bg-transparent border-none outline-none w-28 p-0"
                  placeholder="Sofort fällig"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. GEWÄHRLEISTUNG (FULL-WIDTH BLOCK BELOW PAYMENT TERMS)                  */}
        {/* ========================================================================= */}
        <div className="mt-2.5 mb-1.5 w-full">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[9px] space-y-1 w-full">
            <div className="flex items-center justify-end pb-0.5 print:hidden">
              <DocumentTemplateDropdown
                category="warranty"
                onSelect={(selectedContent) => {
                  if (setWarrantyText) setWarrantyText(selectedContent);
                }}
                activeText={warrantyText}
                variant="light-document"
                buttonLabel="Gewährleistung wählen"
              />
            </div>
            <textarea
              rows={2}
              value={warrantyText ?? DocumentTextController.getDefaultText('warranty', documentType)}
              onChange={(e) => setWarrantyText && setWarrantyText(e.target.value)}
              placeholder="Gewährleistungsklausel eingeben..."
              className="w-full text-[9px] text-slate-600 bg-transparent border-none outline-none resize-none leading-tight font-sans"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. SONDERVEREINBARUNG (FULL-WIDTH BLOCK, ONLY IF TEXT IS PROVIDED)        */}
        {/* ========================================================================= */}
        {DocumentTextController.isNotEmpty(notes) && (
          <div className="mb-2 w-full">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[9px] space-y-0.5 w-full">
              <span className="font-bold text-slate-800 block">Sondervereinbarung / Bemerkungen:</span>
              <div className="text-slate-700 text-[9px] leading-tight whitespace-pre-wrap">
                {notes.trim()}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 7. FOOTER (FUSSZEILE): BANK DETAILS & TAX / REGISTRATION AT VERY BOTTOM   */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-300 pt-2 text-[8px] text-slate-500 leading-tight">
        <div className="grid grid-cols-3 gap-3">
          
          {/* Column 1: Company & Management */}
          <div>
            <div className="font-bold text-slate-800">{merchantSettings.companyName || 'MaxFleet Autohandelsgruppe GmbH'}</div>
            <div>Geschäftsführung: {merchantSettings.responsiblePerson || 'Geschäftsleitung'}</div>
            <div>Sitz der Gesellschaft: {merchantSettings.city || 'Bonn'}</div>
          </div>

          {/* Column 2: Bank & Account Details */}
          <div>
            <div className="font-bold text-slate-800">Bankverbindung ({merchantSettings.bankName || 'Deutsche Bank'})</div>
            <div className="font-mono">IBAN: <span className="font-semibold text-slate-800">{merchantSettings.iban || 'DE89 3704 0044 0532 0130 00'}</span></div>
            <div className="font-mono">BIC: <span className="font-semibold text-slate-800">{merchantSettings.bic || 'DEUTDEDDXXX'}</span></div>
          </div>

          {/* Column 3: Tax & Commercial Registration */}
          <div className="text-right">
            <div className="font-bold text-slate-800">Amtsgericht & Steuern</div>
            <div>Handelsregister: {merchantSettings.taxOffice || 'HRB 19482 AG Bonn'}</div>
            <div>USt-IdNr.: <span className="font-mono font-semibold text-slate-800">{merchantSettings.vatId || 'DE 319 824 550'}</span></div>
          </div>

        </div>
      </div>

    </div>
  );
};

