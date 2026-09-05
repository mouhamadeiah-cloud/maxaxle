import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  CheckCircle2, 
  ChevronDown, 
  Layers, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Download,
  Send,
  FileCode,
  RotateCcw
} from 'lucide-react';
import { 
  Customer, 
  MerchantSettings, 
  OperationDocumentType, 
  OperationVehicleItem,
  KaufvertragDetails,
  ProbefahrtDetails,
  UebergabeprotokollDetails,
  GelangensbestaetigungDetails,
  Vehicle,
  InvoicePayment
} from '../../types';
import { DocumentA4Layout } from './DocumentA4Layout';
import { calculateDocumentTaxes } from '../../utils/taxCalculationEngine';

export interface DruckvorschauModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: OperationDocumentType;
  onChangeDocumentType?: (type: OperationDocumentType) => void;
  documentNumber: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
  customer: Customer | null;
  manualCustomer?: Partial<Customer> | null;
  vehicles: OperationVehicleItem[];
  paymentMethod?: string;
  depositAmount?: number;
  introText?: string;
  warrantyText?: string;
  exportText?: string;
  notes?: string;
  merchantSettings: MerchantSettings;

  // Specific document details
  probefahrtLicensePlate?: string;
  probefahrtDrivingLicense?: string;
  probefahrtDurationHours?: number;
  probefahrtDeposit?: number;
  probefahrtDeductible?: number;
  probefahrtDetails?: ProbefahrtDetails;
  uebergabeprotokollDetails?: UebergabeprotokollDetails;
  kaufvertragDetails?: KaufvertragDetails;

  exportCountry?: string;
  exportVatId?: string;
  exportCustomsOffice?: string;

  gelangensbestaetigungDetails?: GelangensbestaetigungDetails;
  onUpdateGelangensbestaetigungDetails?: (updates: Partial<GelangensbestaetigungDetails>) => void;
  onSignGelangensbestaetigung?: () => void;
  onClearGelangensbestaetigungSignature?: () => void;

  eRechnungBuyerRef?: string;
  eRechnungFormat?: 'XRechnung' | 'ZUGFeRD';

  provisionalPayment?: InvoicePayment | null;
  onSaveDocument?: () => void;
  isSaving?: boolean;
}

const DOCUMENT_TYPES: { id: OperationDocumentType; label: string; short: string }[] = [
  { id: 'rechnung', label: 'Handelsrechnung', short: 'Rechnung' },
  { id: 'e_rechnung', label: 'E-Rechnung (EN 16931)', short: 'E-Rechnung' },
  { id: 'eu_export', label: 'EU-Export (3-Seiten inkl. Gelangensbestätigung DE & EN)', short: 'EU-Export' },
  { id: 'export_drittland', label: 'Drittland-Export (Ausfuhr)', short: 'Drittland' },
  { id: 'kaufvertrag', label: 'Verbindlicher Kaufvertrag', short: 'Kaufvertrag' },
  { id: 'angebot', label: 'Fahrzeug-Angebot', short: 'Angebot' },
  { id: 'probefahrt', label: 'Probefahrt-Vereinbarung', short: 'Probefahrt' },
  { id: 'uebergabeprotokoll', label: 'Übergabeprotokoll (3-Seiten)', short: 'Übergabe' }
];

export const DruckvorschauModal: React.FC<DruckvorschauModalProps> = ({
  isOpen,
  onClose,
  documentType,
  onChangeDocumentType,
  documentNumber,
  date,
  dueDate = 'Sofort fällig',
  validUntil = '',
  customer,
  manualCustomer,
  vehicles,
  paymentMethod = 'Überweisung',
  depositAmount = 0,
  introText,
  warrantyText,
  exportText,
  notes = '',
  merchantSettings,

  probefahrtLicensePlate,
  probefahrtDrivingLicense,
  probefahrtDurationHours = 1,
  probefahrtDeposit = 0,
  probefahrtDeductible = 1000,
  probefahrtDetails,
  uebergabeprotokollDetails,
  kaufvertragDetails,

  exportCountry,
  exportVatId,
  exportCustomsOffice,

  gelangensbestaetigungDetails,
  onUpdateGelangensbestaetigungDetails,
  onSignGelangensbestaetigung,
  onClearGelangensbestaetigungSignature,

  eRechnungBuyerRef,
  eRechnungFormat = 'XRechnung',

  provisionalPayment,
  onSaveDocument,
  isSaving = false
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(90);
  const [activePage, setActivePage] = useState<number>(1);

  if (!isOpen) return null;

  const validVehicles = vehicles.filter(v => v.brand && v.brand.trim() !== '' && v.sellingPrice > 0);
  const activeCustomer = customer || manualCustomer;
  const isFormComplete = validVehicles.length > 0 && !!activeCustomer;

  const calc = calculateDocumentTaxes(documentType, validVehicles, depositAmount, notes, merchantSettings?.vatRate);

  const isMultiPage = documentType === 'uebergabeprotokoll' || documentType === 'eu_export';
  const totalPages = isMultiPage ? 3 : 1;

  const getPageLabel = (page: number) => {
    if (documentType === 'eu_export') {
      switch (page) {
        case 1: return '1. EU-Rechnung';
        case 2: return '2. Gelangensbestätigung (DE)';
        case 3: return '3. Confirmation of Receipt (EN)';
        default: return `Seite ${page}`;
      }
    }
    if (documentType === 'uebergabeprotokoll') {
      switch (page) {
        case 1: return '1. Karosserie & Bereifung';
        case 2: return '2. Technik & Innenraum';
        case 3: return '3. Unterlagen & Übergabe';
        default: return `Seite ${page}`;
      }
    }
    return `Seite ${page}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(140, Math.max(50, prev + delta)));
  };

  const handleResetZoom = () => {
    setZoomLevel(90);
  };

  const currentDocMeta = DOCUMENT_TYPES.find(d => d.id === documentType) || {
    id: documentType,
    label: documentType,
    short: documentType
  };

  return (
    <div 
      id="druckvorschau-modal-overlay"
      className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-start justify-center p-1 sm:p-3 md:p-4 pt-2 sm:pt-4 overflow-hidden animate-in fade-in duration-200 select-none print:p-0 print:bg-white print:fixed print:inset-0"
    >
      {/* METALLIC MODAL CONTAINER */}
      <div 
        id="druckvorschau-metallic-container"
        className="metallic-modal-container w-full max-w-6xl h-[96vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-slate-400/40 relative z-10 print:border-none print:shadow-none print:h-auto print:rounded-none print:bg-white"
      >
        {/* ======================================================================= */}
        {/* 1. TOP METALLIC ACTION & TOOLBAR HEADER (Strictly hidden on print)       */}
        {/* ======================================================================= */}
        <header className="px-4 sm:px-6 py-3.5 border-b border-slate-700/60 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          
          {/* Left: Title, Document Type Selector & Number Badge */}
          <div className="flex items-center gap-3">
            {/* Luminous DIN Indicator */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-400/60 flex items-center justify-center font-black text-xs text-emerald-300 shadow-md">
              A4
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm text-slate-100 tracking-tight flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-emerald-400 metallic-debossed-icon" />
                  Druckvorschau
                </span>

                {/* Document Type Dropdown */}
                {onChangeDocumentType ? (
                  <div className="relative inline-block">
                    <select
                      value={documentType}
                      onChange={(e) => onChangeDocumentType(e.target.value as OperationDocumentType)}
                      className="bg-slate-950/80 text-emerald-300 font-bold text-xs px-3 py-1 rounded-xl border border-slate-600/80 cursor-pointer focus:outline-none focus:border-emerald-400 pr-7 shadow-inner"
                    >
                      {DOCUMENT_TYPES.map(dt => (
                        <option key={dt.id} value={dt.id} className="bg-slate-900 text-white">
                          {dt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                ) : (
                  <span className="font-bold text-xs text-emerald-300 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-700">
                    {currentDocMeta.label}
                  </span>
                )}

                {/* Document Serial Number Badge */}
                <span className="font-mono text-xs font-bold text-slate-200 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-700 shadow-inner">
                  {documentNumber}
                </span>

                {/* Completeness Badge */}
                {isFormComplete ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Druckfertig</span>
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span>Entwurfsmodus</span>
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>DIN 5008 Standard</span>
                <span>•</span>
                <span>Datum: {date}</span>
                <span>•</span>
                <span className="text-emerald-300 font-mono font-bold">
                  {calc.totalGross > 0 ? `${calc.totalGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €` : '0,00 €'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Page Navigation (if multi-page) & Zoom Controls */}
          <div className="flex items-center gap-2">
            {isMultiPage && (
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-700/80 shadow-inner">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActivePage(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      activePage === p
                        ? 'metallic-btn-primary text-slate-950 font-black shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title={getPageLabel(p)}
                  >
                    <span>{getPageLabel(p)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-700/80 shadow-inner">
              <button
                type="button"
                onClick={() => handleZoom(-10)}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                title="Verkleinern"
              >
                <ZoomOut className="w-3.5 h-3.5 metallic-debossed-icon" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="text-xs font-mono font-bold text-emerald-300 w-12 text-center hover:text-white cursor-pointer"
                title="Zoom zurücksetzen"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={() => handleZoom(10)}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                title="Vergrößern"
              >
                <ZoomIn className="w-3.5 h-3.5 metallic-debossed-icon" />
              </button>
            </div>
          </div>

          {/* Right: Actions (Print, Save, Close) */}
          <div className="flex items-center gap-2">
            {/* Primary Print Button */}
            <button
              id="btn-druckvorschau-print"
              type="button"
              onClick={handlePrint}
              className="metallic-btn-primary px-4 py-2 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
              title="A4 Dokument drucken oder als PDF sichern"
            >
              <Printer className="w-4 h-4 metallic-debossed-icon" />
              <span>Drucken / PDF</span>
            </button>

            {/* Optional Save Beleg */}
            {onSaveDocument && (
              <button
                type="button"
                onClick={onSaveDocument}
                disabled={isSaving}
                className="metallic-btn-secondary hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-slate-200 hover:text-white cursor-pointer active:scale-95 transition-all"
                title="Beleg in der Datenbank buchen"
              >
                <CheckCircle2 className="w-3.5 h-3.5 metallic-debossed-icon text-emerald-400" />
                <span>{isSaving ? 'Speichern...' : 'Beleg buchen'}</span>
              </button>
            )}

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition cursor-pointer"
              title="Vorschau schließen"
            >
              <X className="w-5 h-5 metallic-debossed-icon" />
            </button>
          </div>

        </header>

        {/* ======================================================================= */}
        {/* 2. CENTER A4 DOCUMENT STAGE                                             */}
        {/* ======================================================================= */}
        <main 
          id="druckvorschau-canvas-viewport"
          className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex flex-col items-center gap-8 bg-[#0b131b]/95 print:p-0 print:bg-white print:overflow-visible"
        >
          {/* SCREEN PREVIEW CONTAINER (Single Active Page with Zoom, Hidden on Print) */}
          <div 
            id="druckvorschau-scaling-stage"
            className="transition-transform duration-200 origin-top shadow-2xl print:hidden"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <DocumentA4Layout
              documentType={documentType}
              documentNumber={documentNumber}
              date={date}
              dueDate={dueDate}
              validUntil={validUntil}
              customer={customer}
              manualCustomer={manualCustomer}
              vehicles={vehicles}
              paymentMethod={paymentMethod}
              depositAmount={depositAmount}
              introText={introText}
              warrantyText={warrantyText}
              exportText={exportText}
              notes={notes}
              merchantSettings={merchantSettings}

              probefahrtLicensePlate={probefahrtLicensePlate}
              probefahrtDrivingLicense={probefahrtDrivingLicense}
              probefahrtDurationHours={probefahrtDurationHours}
              probefahrtDeposit={probefahrtDeposit}
              probefahrtDeductible={probefahrtDeductible}
              probefahrtDetails={probefahrtDetails}
              uebergabeprotokollDetails={uebergabeprotokollDetails}
              kaufvertragDetails={kaufvertragDetails}

              exportCountry={exportCountry}
              exportVatId={exportVatId}
              exportCustomsOffice={exportCustomsOffice}

              gelangensbestaetigungDetails={gelangensbestaetigungDetails}
              onUpdateGelangensbestaetigungDetails={onUpdateGelangensbestaetigungDetails}
              onSignGelangensbestaetigung={onSignGelangensbestaetigung}
              onClearGelangensbestaetigungSignature={onClearGelangensbestaetigungSignature}

              eRechnungBuyerRef={eRechnungBuyerRef}
              eRechnungFormat={eRechnungFormat}

              pageNumber={activePage}
              totalPages={totalPages}
              isInteractive={true}
            />
          </div>

          {/* DEDICATED PRINT CONTAINER (Prints All Pages Sequentially, Hidden on Screen) */}
          <div className="hidden print:block print:w-full space-y-0">
            {isMultiPage ? (
              [1, 2, 3].map((page) => (
                <div key={page} className="print:page-break-after-always">
                  <DocumentA4Layout
                    documentType={documentType}
                    documentNumber={documentNumber}
                    date={date}
                    dueDate={dueDate}
                    validUntil={validUntil}
                    customer={customer}
                    manualCustomer={manualCustomer}
                    vehicles={vehicles}
                    paymentMethod={paymentMethod}
                    depositAmount={depositAmount}
                    introText={introText}
                    warrantyText={warrantyText}
                    exportText={exportText}
                    notes={notes}
                    merchantSettings={merchantSettings}

                    probefahrtLicensePlate={probefahrtLicensePlate}
                    probefahrtDrivingLicense={probefahrtDrivingLicense}
                    probefahrtDurationHours={probefahrtDurationHours}
                    probefahrtDeposit={probefahrtDeposit}
                    probefahrtDeductible={probefahrtDeductible}
                    probefahrtDetails={probefahrtDetails}
                    uebergabeprotokollDetails={uebergabeprotokollDetails}
                    kaufvertragDetails={kaufvertragDetails}

                    exportCountry={exportCountry}
                    exportVatId={exportVatId}
                    exportCustomsOffice={exportCustomsOffice}

                    gelangensbestaetigungDetails={gelangensbestaetigungDetails}
                    onUpdateGelangensbestaetigungDetails={onUpdateGelangensbestaetigungDetails}
                    onSignGelangensbestaetigung={onSignGelangensbestaetigung}
                    onClearGelangensbestaetigungSignature={onClearGelangensbestaetigungSignature}

                    eRechnungBuyerRef={eRechnungBuyerRef}
                    eRechnungFormat={eRechnungFormat}

                    pageNumber={page}
                    totalPages={totalPages}
                    isInteractive={false}
                  />
                </div>
              ))
            ) : (
              <DocumentA4Layout
                documentType={documentType}
                documentNumber={documentNumber}
                date={date}
                dueDate={dueDate}
                validUntil={validUntil}
                customer={customer}
                manualCustomer={manualCustomer}
                vehicles={vehicles}
                paymentMethod={paymentMethod}
                depositAmount={depositAmount}
                introText={introText}
                warrantyText={warrantyText}
                exportText={exportText}
                notes={notes}
                merchantSettings={merchantSettings}

                probefahrtLicensePlate={probefahrtLicensePlate}
                probefahrtDrivingLicense={probefahrtDrivingLicense}
                probefahrtDurationHours={probefahrtDurationHours}
                probefahrtDeposit={probefahrtDeposit}
                probefahrtDeductible={probefahrtDeductible}
                probefahrtDetails={probefahrtDetails}
                uebergabeprotokollDetails={uebergabeprotokollDetails}
                kaufvertragDetails={kaufvertragDetails}

                exportCountry={exportCountry}
                exportVatId={exportVatId}
                exportCustomsOffice={exportCustomsOffice}

                gelangensbestaetigungDetails={gelangensbestaetigungDetails}
                onUpdateGelangensbestaetigungDetails={onUpdateGelangensbestaetigungDetails}
                onSignGelangensbestaetigung={onSignGelangensbestaetigung}
                onClearGelangensbestaetigungSignature={onClearGelangensbestaetigungSignature}

                eRechnungBuyerRef={eRechnungBuyerRef}
                eRechnungFormat={eRechnungFormat}

                pageNumber={1}
                totalPages={1}
                isInteractive={false}
              />
            )}
          </div>
        </main>

        {/* ======================================================================= */}
        {/* 3. BOTTOM METALLIC FOOTER BAR (Strictly hidden on print)                */}
        {/* ======================================================================= */}
        <footer className="px-6 py-3 border-t border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex flex-wrap items-center justify-between text-xs text-slate-300 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 metallic-debossed-icon" />
            <span className="font-medium text-slate-300">
              GoBD- & UStG-konforme Druckausgabe nach DIN 5008 • Automatische Ränder & Briefkopfskalierung
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="metallic-btn-secondary px-4 py-1.5 rounded-xl text-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Printer className="w-3.5 h-3.5 metallic-debossed-icon" />
              <span>Drucken</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Schließen
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
