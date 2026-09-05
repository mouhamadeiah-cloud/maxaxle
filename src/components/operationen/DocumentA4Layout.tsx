import React from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Car,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import { 
  Customer, 
  MerchantSettings, 
  OperationDocumentType, 
  OperationVehicleItem,
  KaufvertragDetails,
  ProbefahrtDetails,
  UebergabeprotokollDetails,
  GelangensbestaetigungDetails
} from '../../types';
import { calculateDocumentTaxes } from '../../utils/taxCalculationEngine';
import { firebaseService } from '../../services/firebaseService';
import { KaufvertragA4Layout } from './KaufvertragA4Layout';
import { ProbefahrtA4Layout } from './ProbefahrtA4Layout';
import { UebergabeProtocolA4Layout } from './UebergabeProtocolA4Layout';
import { GelangensbestaetigungA4Layout } from './GelangensbestaetigungA4Layout';
import { DocumentTextController } from '../../controllers/DocumentTextController';

interface DocumentA4LayoutProps {
  documentType: OperationDocumentType;
  documentNumber: string;
  date: string;
  dueDate: string;
  validUntil: string;
  customer: Customer | null;
  manualCustomer: Partial<Customer> | null;
  vehicles: OperationVehicleItem[];
  paymentMethod: string;
  depositAmount: number;
  introText?: string;
  warrantyText?: string;
  exportText?: string;
  notes?: string;
  merchantSettings: MerchantSettings;
  
  // Specifics
  probefahrtLicensePlate?: string;
  probefahrtDrivingLicense?: string;
  probefahrtDurationHours?: number;
  probefahrtDeposit?: number;
  probefahrtDeductible?: number;
  probefahrtDetails?: ProbefahrtDetails;
  uebergabeprotokollDetails?: UebergabeprotokollDetails;

  exportCountry?: string;
  exportVatId?: string;
  exportCustomsOffice?: string;

  gelangensbestaetigungDetails?: GelangensbestaetigungDetails;
  onUpdateGelangensbestaetigungDetails?: (updates: Partial<GelangensbestaetigungDetails>) => void;
  onSignGelangensbestaetigung?: () => void;
  onClearGelangensbestaetigungSignature?: () => void;

  eRechnungBuyerRef?: string;
  eRechnungFormat?: 'XRechnung' | 'ZUGFeRD';

  kaufvertragDetails?: KaufvertragDetails;

  provisionalPayment?: { amount: number; paymentMethod: string; receiptNumber?: string; date: string } | null;

  pageNumber?: number;
  totalPages?: number;
  isInteractive?: boolean;
}

export const DocumentA4Layout: React.FC<DocumentA4LayoutProps> = ({
  documentType,
  documentNumber,
  date,
  dueDate,
  validUntil,
  customer,
  manualCustomer,
  vehicles,
  paymentMethod,
  depositAmount,
  introText,
  warrantyText,
  exportText,
  notes,
  merchantSettings,
  provisionalPayment,

  probefahrtLicensePlate,
  probefahrtDrivingLicense,
  probefahrtDurationHours = 1,
  probefahrtDeposit = 0,
  probefahrtDeductible = 1000,
  probefahrtDetails,
  uebergabeprotokollDetails,

  exportCountry,
  exportVatId,
  exportCustomsOffice,

  gelangensbestaetigungDetails,
  onUpdateGelangensbestaetigungDetails,
  onSignGelangensbestaetigung,
  onClearGelangensbestaetigungSignature,

  eRechnungBuyerRef,
  eRechnungFormat = 'XRechnung',

  kaufvertragDetails,

  pageNumber = 1,
  totalPages = 1,
  isInteractive = false
}) => {
  // If Kaufvertrag mode and details provided, render the dedicated Kaufvertrag legal A4 layout
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

  // If Probefahrt mode and details provided, render the dedicated Probefahrt A4 layout
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

  // If Übergabeprotokoll mode and details provided, render the dedicated 3-page Übergabeprotokoll A4 layout
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

  // If EU-Export and Page 2 is requested -> Render Gelangensbestätigung (German)
  if (documentType === 'eu_export' && pageNumber === 2) {
    return (
      <GelangensbestaetigungA4Layout
        language="de"
        documentNumber={documentNumber}
        date={date}
        customer={customer}
        manualCustomer={manualCustomer}
        vehicles={vehicles}
        merchantSettings={merchantSettings}
        exportCountry={exportCountry}
        exportVatId={exportVatId}
        details={gelangensbestaetigungDetails}
        onUpdateDetails={onUpdateGelangensbestaetigungDetails}
        onSign={onSignGelangensbestaetigung}
        onClearSignature={onClearGelangensbestaetigungSignature}
        pageNumber={2}
        totalPages={totalPages || 3}
        isInteractive={isInteractive}
      />
    );
  }

  // If EU-Export and Page 3 is requested -> Render Confirmation of Receipt (English)
  if (documentType === 'eu_export' && pageNumber === 3) {
    return (
      <GelangensbestaetigungA4Layout
        language="en"
        documentNumber={documentNumber}
        date={date}
        customer={customer}
        manualCustomer={manualCustomer}
        vehicles={vehicles}
        merchantSettings={merchantSettings}
        exportCountry={exportCountry}
        exportVatId={exportVatId}
        details={gelangensbestaetigungDetails}
        onUpdateDetails={onUpdateGelangensbestaetigungDetails}
        onSign={onSignGelangensbestaetigung}
        onClearSignature={onClearGelangensbestaetigungSignature}
        pageNumber={3}
        totalPages={totalPages || 3}
        isInteractive={isInteractive}
      />
    );
  }

  const activeCustomer = customer || manualCustomer;
  const validVehicles = vehicles.filter(v => v.brand && v.sellingPrice > 0);

  // Determine taxation scheme
  const isMarginScheme = (documentType === 'rechnung' ? false : (vehicles.some(v => v.taxationType === 'margin' || v.taxType === 'diff_25a')));

  // Perform accurate tax calculation via Tax Engine
  const calc = calculateDocumentTaxes(documentType, validVehicles, depositAmount, notes, merchantSettings?.vatRate);

  const getDocHeading = () => {
    if (isMarginScheme && (documentType === 'eu_export' || documentType === 'export_drittland')) {
      return 'RECHNUNG (§ 25a UStG)';
    }
    switch (documentType) {
      case 'angebot': return 'ANGEBOT';
      case 'rechnung': return 'HANDELSRECHNUNG';
      case 'e_rechnung': return `E-RECHNUNG (${eRechnungFormat || 'EN 16931'})`;
      case 'eu_export': return 'EU-EXPORTRECHNUNG (STEUERFREI)';
      case 'export_drittland': return 'DRITTLANDRECHNUNG (AUSFUHR)';
      case 'kaufvertrag': return 'VERBINDLICHER KAUFVERTRAG';
      case 'probefahrt': return 'PROBEFAHRT-VEREINBARUNG';
      case 'uebergabeprotokoll': return 'ÜBERGABEPROTOKOLL';
      default: return 'RECHNUNG';
    }
  };

  const getTaxLegalParagraph = () => {
    if (isMarginScheme) {
      return {
        title: 'Sonderregelung Differenzbesteuerung gem. § 25a UStG',
        text: 'Gebrauchtgegenstände / Sonderregelung: Die Besteuerung erfolgt nach § 25a UStG (Differenzbesteuerung). Ein gesonderter Ausweis der Umsatzsteuer auf der Rechnung ist gesetzlich ausgeschlossen. Ein Vorsteuerabzug ist für den Erwerber nicht möglich.'
      };
    }
    if (documentType === 'eu_export') {
      return {
        title: 'Steuerfreie innergemeinschaftliche Lieferung gem. § 4 Nr. 1b i.V.m. § 6a UStG',
        text: `Steuerfreie innergemeinschaftliche Fahrzeuglieferung. Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge). Bestimmungsland: ${activeCustomer?.country || exportCountry || 'EU-Mitgliedstaat'}. USt-IdNr. des Erwerbers: ${exportVatId || activeCustomer?.vatId || 'Geprüft & Gültig'}. Verbringungsnachweis / Gelangensbestätigung wird archiviert.`
      };
    }
    if (documentType === 'export_drittland') {
      return {
        title: 'Steuerfreie Ausfuhrlieferung in das Drittland gem. § 4 Nr. 1a i.V.m. § 6 UStG',
        text: `Steuerfreie Ausfuhrlieferung in das Drittland (${activeCustomer?.country || exportCountry || 'Drittland'}). Der Nachweis der Ausfuhr aus dem Zollgebiet der Europäischen Union erfolgt über das elektronische Ausfuhrverfahren ATLAS (Ausgangsvermerk).`
      };
    }
    if (documentType === 'e_rechnung') {
      return {
        title: 'Elektronische Rechnung gem. EN 16931 & E-Rechnungsverordnung',
        text: 'Die Rechnung wurde digital strukturiert nach europäischen Standards erstellt und archiviert.'
      };
    }
    if (documentType === 'angebot') {
      return {
        title: 'Freibleibendes Angebot',
        text: `Dieses Angebot ist freibleibend und unverbindlich. Preisbindung bis einschließlich ${validUntil || date}. Zwischenverkauf, technische Änderungen und Irrtümer vorbehalten.`
      };
    }
    return {
      title: 'Regelbesteuerung (19% Umsatzsteuer)',
      text: 'Die ausgewiesenen Leistungen unterliegen der regulären gesetzlichen Umsatzsteuer von 19%. Steuerschuldner ist der leistende Unternehmer.'
    };
  };

  const taxParagraph = getTaxLegalParagraph();

  // Return address line for DIN 5008 windowed envelope (Absenderzeile)
  const windowEnvelopeReturnLine = `${merchantSettings.companyName || 'MaxFleet Autohandel'} · ${merchantSettings.street || 'Bonner Straße 12'} · ${merchantSettings.postalCode || '53111'} ${merchantSettings.city || 'Bonn'}`;

  const customerName = activeCustomer?.name || 
    (activeCustomer?.companyName || `${activeCustomer?.firstName || ''} ${activeCustomer?.lastName || ''}`.trim()) || 
    'Kundenname nicht angegeben';

  return (
    <div 
      id="document-a4-sheet"
      className="a4-print-sheet bg-white text-slate-900 mx-auto shadow-2xl border border-slate-200 rounded-none sm:rounded-lg font-sans relative flex flex-col justify-between select-text w-full max-w-[210mm] min-h-[297mm] p-[20mm_20mm_15mm_20mm] box-border"
      style={{
        width: '100%',
        maxWidth: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box'
      }}
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

            {/* Customer Address */}
            <div className="relative w-[85mm] h-[40mm] flex flex-col justify-center">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-800 leading-tight h-full flex flex-col justify-between">
                <div>
                  <div className="text-[8px] font-extrabold text-emerald-800 uppercase tracking-wider pb-0.5">
                    Rechnungsempfänger:
                  </div>
                  {activeCustomer?.companyName && (
                    <div className="font-extrabold text-slate-900 text-[11px] truncate">{activeCustomer.companyName}</div>
                  )}
                  <div className="font-bold text-slate-900 text-[11px] truncate">
                    {customerName}
                  </div>
                  <div className="truncate">{activeCustomer?.street || 'Musterstraße 1'}</div>
                  <div className="truncate">
                    {activeCustomer?.postalCode || '10115'} {activeCustomer?.city || 'Berlin'} &bull; {activeCustomer?.country || 'Deutschland'}
                  </div>
                </div>
                {(activeCustomer?.vatId || exportVatId) && (
                  <div className="text-[8.5px] font-mono text-slate-600 truncate">
                    USt-IdNr.: <span className="font-bold text-slate-900">{exportVatId || activeCustomer?.vatId}</span>
                  </div>
                )}
                {documentType === 'e_rechnung' && eRechnungBuyerRef && (
                  <div className="text-[8.5px] font-mono text-blue-800 truncate">
                    Leitweg-ID: <span className="font-bold">{eRechnungBuyerRef}</span>
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

            {/* Metadata */}
            <div className="relative h-[40mm] flex flex-col justify-end text-right text-[10px] space-y-1.5 pb-1">
              <div className="flex justify-end items-baseline gap-2">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Belegnummer:</span>
                <span className="font-mono font-black text-slate-950 text-[11px]">{documentNumber}</span>
              </div>
              <div className="flex justify-end items-baseline gap-2">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Rechnungsdatum:</span>
                <span className="font-bold text-slate-900 text-[10px]">{date}</span>
              </div>
              <div className="flex justify-end items-baseline gap-2">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Lieferdatum:</span>
                <span className="font-bold text-emerald-700 text-[10px]">{dueDate || date}</span>
              </div>
            </div>

          </div>

        </div>

        {/* 2. GREETING & TAX LEGAL CLAUSE */}
        <div className="pt-2 space-y-1.5 w-full">
          {/* Greeting Text without Header Title */}
          <div className="relative bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/90 w-full">
            <p className="text-[10px] text-slate-800 leading-snug font-sans whitespace-pre-wrap">
              {introText || DocumentTextController.getDefaultText('welcome', documentType)}
            </p>
          </div>

          {/* Tax Legal Clause */}
          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[9.5px] space-y-0.5 w-full">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span>{taxParagraph.title}</span>
            </div>
            <p className="text-slate-600 text-[9px] leading-tight">
              {taxParagraph.text}
            </p>
          </div>
        </div>

        {/* 3. SALES TABLE: VEHICLE LINE ITEMS */}
        <div className="relative pt-2 w-full">
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

        {/* 4. TOTALS & PAYMENT */}
        <div className="pt-2 flex justify-end">
          <div className="w-72 space-y-1">
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

              {provisionalPayment && provisionalPayment.amount > 0 && (
                <>
                  <div className="flex justify-between text-emerald-400 border-t border-slate-800 pt-0.5 text-[9.5px] font-bold">
                    <span>Geleistete Zahlung ({provisionalPayment.paymentMethod}):</span>
                    <span className="font-mono">- {provisionalPayment.amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                  </div>
                  <div className="flex justify-between text-emerald-200 border-t border-slate-700 pt-0.5 text-[10.5px] font-black">
                    <span>Verbleibend offen:</span>
                    <span className="font-mono text-xs">{Math.max(0, calc.totalGross - provisionalPayment.amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                  </div>
                </>
              )}
            </div>

            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[9.5px]">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Zahlungsziel:</span>
                <span className="text-emerald-800 font-bold">{dueDate || 'Sofort nach Erhalt'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. GEWÄHRLEISTUNG WITHOUT HEADER TITLE */}
        <div className="mt-2.5 mb-1.5 w-full">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[9px] space-y-1 w-full">
            <p className="text-[9px] text-slate-600 leading-tight font-sans whitespace-pre-wrap">
              {warrantyText || DocumentTextController.getDefaultText('warranty', documentType)}
            </p>
          </div>
        </div>

        {/* 6. SONDERVEREINBARUNG */}
        <div className="mb-2 w-full">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[9px] space-y-0.5 w-full">
            <span className="font-bold text-slate-800 block">Sondervereinbarung / Bemerkungen:</span>
            <div className="text-slate-700 text-[9px] leading-tight whitespace-pre-wrap">
              {notes || 'Keine gesonderten Vereinbarungen getroffen.'}
            </div>
          </div>
        </div>

        {/* 8. SIGNATURE FIELDS FOR ANGEBOT */}
        {documentType === 'angebot' && (
          <div className="pt-2 grid grid-cols-2 gap-8 text-[9px]">
            <div className="border-t border-slate-400 pt-1 text-center">
              <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Anbieter / Verkäufer</span>
              <span className="font-bold text-slate-800">{merchantSettings.responsiblePerson || merchantSettings.companyName}</span>
              <div className="text-[8px] text-slate-400">Ort, Datum, Stempel & rechtsverbindliche Unterschrift</div>
            </div>
            <div className="border-t border-slate-400 pt-1 text-center">
              <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Kunde / Angebotsannahme</span>
              <span className="font-bold text-slate-800">{customerName}</span>
              <div className="text-[8px] text-slate-400">Ort, Datum & Unterschrift des Kunden</div>
            </div>
          </div>
        )}

      </div>

      {/* 9. FOOTER: BANK DETAILS & REGISTRATION */}
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
  );
};
