import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Save, 
  Send, 
  FileCode, 
  Menu, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Sparkles, 
  ShieldCheck,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  Car,
  User,
  ChevronDown,
  Layers
} from 'lucide-react';
import { 
  Customer, 
  MerchantSettings, 
  OperationDocumentType, 
  OperationVehicleItem,
  KaufvertragDetails,
  ProbefahrtDetails,
  UebergabeprotokollDetails,
  Vehicle
} from '../../types';
import { InteractiveDocumentA4 } from './InteractiveDocumentA4';
import { TextTemplateSelectorModal } from './TextTemplateSelectorModal';
import { EmailDocumentModal } from './EmailDocumentModal';
import { ERechnungXmlViewerModal } from './ERechnungXmlViewerModal';
import { LagerSelectionDrawer } from './LagerSelectionDrawer';
import { KundenSelectionDrawer } from './KundenSelectionDrawer';
import { ProbefahrtQuickEditModal } from './ProbefahrtQuickEditModal';
import { generateXRechnungXml, downloadXRechnungFile } from '../../utils/eRechnungXmlGenerator';
import { calculateDocumentTaxes } from '../../utils/taxCalculationEngine';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: OperationDocumentType;
  onChangeDocumentType?: (type: OperationDocumentType) => void;
  documentNumber: string;
  date: string;
  setDate: (d: string) => void;
  dueDate: string;
  setDueDate: (d: string) => void;
  validUntil: string;
  setValidUntil: (d: string) => void;
  customer: Customer | null;
  onSelectCustomer: (cust: Customer | null) => void;
  manualCustomer: Partial<Customer> | null;
  vehicles: OperationVehicleItem[];
  onChangeVehicles: (v: OperationVehicleItem[]) => void;
  allAvailableVehicles?: Vehicle[];
  allAvailableCustomers?: Customer[];
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

  // Specific parameters
  probefahrtLicensePlate?: string;
  setProbefahrtLicensePlate?: (p: string) => void;
  probefahrtDrivingLicense?: string;
  setProbefahrtDrivingLicense?: (l: string) => void;
  probefahrtDurationHours?: number;
  setProbefahrtDurationHours?: (h: number) => void;
  probefahrtDeposit?: number;
  setProbefahrtDeposit?: (d: number) => void;
  probefahrtDeductible?: number;
  setProbefahrtDeductible?: (sb: number) => void;
  probefahrtDetails?: ProbefahrtDetails;
  uebergabeprotokollDetails?: UebergabeprotokollDetails;

  exportCountry?: string;
  setExportCountry?: (c: string) => void;
  exportVatId?: string;
  setExportVatId?: (v: string) => void;
  exportCustomsOffice?: string;

  eRechnungBuyerRef?: string;
  eRechnungFormat?: 'XRechnung' | 'ZUGFeRD';

  kaufvertragDetails?: KaufvertragDetails;

  onSaveDocument: (status: 'offen' | 'entwurf' | 'abgeschlossen') => void;
  isSaving: boolean;
  onResetDocument?: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documentType,
  onChangeDocumentType,
  documentNumber,
  date,
  setDate,
  dueDate,
  setDueDate,
  validUntil,
  setValidUntil,
  customer,
  onSelectCustomer,
  manualCustomer,
  vehicles,
  onChangeVehicles,
  allAvailableVehicles = [],
  allAvailableCustomers = [],
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

  probefahrtLicensePlate = 'B-06124',
  setProbefahrtLicensePlate,
  probefahrtDrivingLicense,
  setProbefahrtDrivingLicense,
  probefahrtDurationHours = 1,
  setProbefahrtDurationHours,
  probefahrtDeposit = 0,
  setProbefahrtDeposit,
  probefahrtDeductible = 1000,
  setProbefahrtDeductible,
  probefahrtDetails,
  uebergabeprotokollDetails,

  exportCountry = 'Polen',
  setExportCountry,
  exportVatId = '',
  setExportVatId,
  exportCustomsOffice,

  eRechnungBuyerRef = '',
  eRechnungFormat = 'XRechnung',

  kaufvertragDetails,

  onSaveDocument,
  isSaving,
  onResetDocument
}) => {
  // Modal sub-dialogs & Drawers
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [isLagerDrawerOpen, setIsLagerDrawerOpen] = useState(false);
  const [isKundenDrawerOpen, setIsKundenDrawerOpen] = useState(false);
  const [quickEditProbefahrtField, setQuickEditProbefahrtField] = useState<'plate' | 'duration' | 'route' | 'deductible' | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeProtocolPage, setActiveProtocolPage] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  const validVehicles = vehicles.filter(v => v.brand && v.brand.trim() !== '' && v.sellingPrice > 0);
  const activeCustomer = customer || manualCustomer;
  const hasVehicle = validVehicles.length > 0;
  const hasCustomer = !!activeCustomer && (!!activeCustomer.name || !!activeCustomer.companyName);
  const isFormComplete = hasVehicle && hasCustomer;

  const calc = calculateDocumentTaxes(documentType, validVehicles, depositAmount, notes);

  // Generate XRechnung XML on demand
  const xmlContent = generateXRechnungXml({
    documentNumber,
    documentType,
    date,
    dueDate,
    customer: customer || undefined,
    manualCustomer: manualCustomer || undefined,
    vehicles: validVehicles,
    paymentMethod,
    depositAmount,
    notes,
    eRechnungDetails: {
      buyerReference: eRechnungBuyerRef || '991-12345-67',
      standardFormat: (eRechnungFormat as 'XRechnung' | 'ZUGFeRD') || 'XRechnung',
      buyerVatId: exportVatId || customer?.vatId || manualCustomer?.vatId
    }
  }, merchantSettings);

  const handlePrint = () => {
    if (!isFormComplete) {
      alert('Bitte füllen Sie zuerst die Pflichtfelder (Fahrzeug & Kunde) aus, bevor Sie das Dokument drucken.');
      return;
    }
    window.print();
  };

  const handleApplyTemplate = (content: string, targetField: 'intro' | 'notes' | 'warranty') => {
    if (targetField === 'intro') {
      setIntroText(content);
    } else {
      setNotes(prev => (prev ? `${prev}\n\n${content}` : content));
    }
  };

  const handleSelectVehicleFromDrawer = (veh: Vehicle) => {
    const newItem: OperationVehicleItem = {
      id: `pos-${Date.now()}`,
      vehicleId: veh.id,
      vin: veh.vin,
      brand: veh.brand,
      model: veh.model,
      variant: veh.variant || '',
      firstRegistration: veh.firstRegistration || '',
      mileage: veh.mileage || 0,
      powerPs: veh.powerPs || 150,
      powerKw: veh.powerKw || 110,
      fuelType: veh.fuelType || 'Benzin',
      transmission: veh.transmission || 'Automatik',
      color: veh.color || 'Schwarz',
      location: veh.location || 'Hauptstandort',
      imageUrl: veh.imageUrl,
      listPrice: veh.sellingPrice || 0,
      sellingPrice: veh.sellingPrice || 0,
      discountAmount: 0,
      taxType: veh.taxType === 'standard_19' ? 'standard_19' : 'diff_25a'
    };
    onChangeVehicles([newItem]);
  };

  const handleSelectCustomerFromDrawer = (cust: Customer) => {
    onSelectCustomer(cust);
  };

  const isMultiPageProtocol = documentType === 'uebergabeprotokoll';

  const docTypes: { id: OperationDocumentType; label: string }[] = [
    { id: 'rechnung', label: 'Rechnung' },
    { id: 'kaufvertrag', label: 'Kaufvertrag' },
    { id: 'angebot', label: 'Angebot' },
    { id: 'probefahrt', label: 'Probefahrt' },
    { id: 'uebergabeprotokoll', label: 'Übergabeprotokoll' },
    { id: 'e_rechnung', label: 'E-Rechnung (XML)' },
    { id: 'eu_export', label: 'EU-Export' },
    { id: 'export_drittland', label: 'Drittland-Export' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start justify-center p-1 sm:p-3 md:p-4 pt-2 sm:pt-4 overflow-hidden animate-in fade-in duration-300">
      
      {/* METALLIC MODAL CONTAINER */}
      <div className="metallic-modal-container w-full max-w-6xl h-[96vh] flex flex-col justify-between rounded-3xl overflow-hidden shadow-2xl border border-slate-400/40 relative z-10">

        {/* TOP ACTION BAR (DARK TITANIUM METALLIC) */}
        <header className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 text-white px-4 sm:px-6 py-3 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3 shadow-2xl shrink-0 z-20">
          
          {/* Left: Document Type Switcher & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 text-emerald-300 border border-slate-400/60 flex items-center justify-center font-black text-xs shadow-md">
              DIN
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Document Type Dropdown Switcher */}
                {onChangeDocumentType ? (
                  <div className="relative inline-block">
                    <select
                      value={documentType}
                      onChange={(e) => onChangeDocumentType(e.target.value as OperationDocumentType)}
                      className="bg-slate-950/80 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-xl border border-slate-600/80 cursor-pointer focus:outline-none focus:border-emerald-400 pr-7 shadow-inner"
                    >
                      {docTypes.map(dt => (
                        <option key={dt.id} value={dt.id} className="bg-slate-900 text-white">
                          {dt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                ) : (
                  <span className="font-extrabold text-xs text-emerald-300 tracking-tight">
                    {docTypes.find(d => d.id === documentType)?.label || documentType}
                  </span>
                )}

                <span className="font-mono text-xs font-bold text-white bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-700">
                  {documentNumber}
                </span>

                {/* Status Badge */}
                {!isFormComplete ? (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    {!hasVehicle && !hasCustomer 
                      ? '⚠️ 2 Pflichtfelder erforderlich (Fahrzeug & Kunde)'
                      : !hasVehicle 
                        ? '⚠️ Fahrzeug erforderlich' 
                        : '⚠️ Kunde erforderlich'}
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Alle Pflichtangaben vollständig</span>
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>A4 Live-Drucklayout</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">
                  {calc.totalGross > 0 ? `${calc.totalGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €` : '0,00 €'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Multi-page Switcher & Zoom */}
          <div className="flex items-center gap-3">
            {isMultiPageProtocol && (
              <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-700">
                <span className="text-[11px] text-emerald-300 mr-1 font-bold">Seite:</span>
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActiveProtocolPage(p as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeProtocolPage === p
                        ? 'metallic-btn-primary text-slate-950 font-black shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    S. {p}
                  </button>
                ))}
              </div>
            )}

            <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(60, prev - 10))}
                className="p-1 text-slate-400 hover:text-white rounded transition cursor-pointer"
                title="Verkleinern"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold text-emerald-300 w-12 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
                className="p-1 text-slate-400 hover:text-white rounded transition cursor-pointer"
                title="Vergrößern"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Action Bar Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Text Templates */}
            {documentType !== 'probefahrt' && documentType !== 'uebergabeprotokoll' && (
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="metallic-btn-secondary px-3 py-2 text-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                title="Textvorlagen-Manager (3-Zeilen-Menü)"
              >
                <Menu className="w-4 h-4 text-emerald-400 metallic-debossed-icon" />
                <span className="hidden sm:inline">Textvorlagen</span>
              </button>
            )}

            {/* E-Rechnung XML Button */}
            {documentType === 'e_rechnung' && (
              <button
                type="button"
                onClick={() => setShowXmlModal(true)}
                className="metallic-btn-secondary px-3 py-2 text-emerald-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                title="XRechnung XML-Datei einsehen oder herunterladen"
              >
                <FileCode className="w-4 h-4 text-emerald-400 metallic-debossed-icon" />
                <span className="hidden sm:inline">XML (EN 16931)</span>
              </button>
            )}

            {/* Print / PDF Button (Disabled until mandatory red fields are filled) */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={!isFormComplete}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                !isFormComplete
                  ? 'bg-slate-800/60 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                  : 'metallic-btn-secondary text-emerald-300 cursor-pointer shadow-xs'
              }`}
              title={!isFormComplete ? 'Pflichtfelder (Fahrzeug & Kunde) müssen ausgefüllt sein' : 'Dokument drucken oder als PDF speichern'}
            >
              <Printer className="w-4 h-4 metallic-debossed-icon" />
              <span>Drucken / PDF</span>
            </button>

            {/* Email Dispatch Button (Disabled until mandatory red fields are filled) */}
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              disabled={!isFormComplete}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                !isFormComplete
                  ? 'bg-slate-800/60 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                  : 'metallic-btn-secondary text-emerald-200 cursor-pointer shadow-xs'
              }`}
              title={!isFormComplete ? 'Pflichtfelder (Fahrzeug & Kunde) müssen ausgefüllt sein' : 'Dokument per E-Mail an Kunden versenden'}
            >
              <Send className="w-4 h-4 metallic-debossed-icon" />
              <span>Per E-Mail</span>
            </button>

            {/* Save & Book Button (Disabled until mandatory red fields are filled) */}
            <button
              type="button"
              onClick={() => onSaveDocument('offen')}
              disabled={!isFormComplete || isSaving}
              className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-1.5 ${
                !isFormComplete || isSaving
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 opacity-50 cursor-not-allowed'
                  : 'metallic-btn-primary text-slate-950 shadow-[0_0_20px_rgba(16, 185, 129,0.4)] cursor-pointer'
              }`}
              title={!isFormComplete ? 'Pflichtfelder (Fahrzeug & Kunde) müssen ausgefüllt sein' : 'Dokument fest buchen und in der Datenbank speichern'}
            >
              <CheckCircle2 className="w-4 h-4 metallic-debossed-icon" />
              <span>Buchen & Speichern</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* CENTER: SCROLLABLE A4 DOCUMENT PREVIEW CANVAS WITH INTERACTIVE COLOR-CODED SLOTS */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center gap-8 bg-[#0b131b]/95">
        <div 
          className="transition-transform duration-200 origin-top shadow-2xl space-y-8 max-w-full"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          <InteractiveDocumentA4
            documentType={documentType}
            documentNumber={documentNumber}
            date={date}
            setDate={setDate}
            dueDate={dueDate}
            setDueDate={setDueDate}
            validUntil={validUntil}
            setValidUntil={setValidUntil}
            customer={customer}
            manualCustomer={manualCustomer}
            vehicles={vehicles}
            onChangeVehicles={onChangeVehicles}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            introText={introText}
            setIntroText={setIntroText}
            warrantyText={warrantyText}
            setWarrantyText={setWarrantyText}
            exportText={exportText}
            setExportText={setExportText}
            notes={notes}
            setNotes={setNotes}
            merchantSettings={merchantSettings}

            probefahrtLicensePlate={probefahrtLicensePlate}
            setProbefahrtLicensePlate={setProbefahrtLicensePlate}
            probefahrtDurationHours={probefahrtDurationHours}
            setProbefahrtDurationHours={setProbefahrtDurationHours}
            probefahrtDeductible={probefahrtDeductible}
            setProbefahrtDeductible={setProbefahrtDeductible}
            probefahrtDetails={probefahrtDetails}
            uebergabeprotokollDetails={uebergabeprotokollDetails}
            kaufvertragDetails={kaufvertragDetails}

            exportCountry={exportCountry}
            setExportCountry={setExportCountry}
            exportVatId={exportVatId}
            setExportVatId={setExportVatId}
            exportCustomsOffice={exportCustomsOffice}

            eRechnungBuyerRef={eRechnungBuyerRef}
            eRechnungFormat={eRechnungFormat}

            onOpenLagerDrawer={() => setIsLagerDrawerOpen(true)}
            onOpenKundenDrawer={() => setIsKundenDrawerOpen(true)}
            onOpenQuickEditProbefahrt={(field) => setQuickEditProbefahrtField(field)}
            onOpenTemplateModal={() => setShowTemplateModal(true)}

            pageNumber={activeProtocolPage}
            totalPages={isMultiPageProtocol ? 3 : 1}
          />
        </div>
      </main>

      {/* BOTTOM QUICK FOOTER BAR */}
      <footer className="bg-[#01160f] border-t border-emerald-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-200/90 font-medium">
            GoBD- & UStG-konformer Dokumentenaufbau • Rote Felder sind Pflichtfelder, Orange Felder sind vorausgefüllt & anpassbar
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onResetDocument && (
            <button
              type="button"
              onClick={onResetDocument}
              className="text-slate-400 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vorgang zurücksetzen</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-[#021d15] hover:bg-[#03291e] text-emerald-200 border border-emerald-500/30 rounded-xl text-xs font-bold cursor-pointer"
          >
            Vorschau schließen
          </button>
        </div>
      </footer>

      {/* SLIDE-IN DRAWER 1: MEIN LAGER (VEHICLE SELECTOR) */}
      <LagerSelectionDrawer
        isOpen={isLagerDrawerOpen}
        onClose={() => setIsLagerDrawerOpen(false)}
        vehicles={allAvailableVehicles}
        selectedVehicleId={vehicles[0]?.vehicleId}
        onSelectVehicle={handleSelectVehicleFromDrawer}
      />

      {/* SLIDE-IN DRAWER 2: KUNDENLISTE (CUSTOMER SELECTOR) */}
      <KundenSelectionDrawer
        isOpen={isKundenDrawerOpen}
        onClose={() => setIsKundenDrawerOpen(false)}
        customers={allAvailableCustomers}
        selectedCustomerId={customer?.id}
        onSelectCustomer={handleSelectCustomerFromDrawer}
      />

      {/* SUB-MODAL 1: PROBEFAHRT QUICK-EDIT POPUP */}
      <ProbefahrtQuickEditModal
        isOpen={!!quickEditProbefahrtField}
        onClose={() => setQuickEditProbefahrtField(null)}
        field={quickEditProbefahrtField}
        merchantSettings={merchantSettings}
        currentPlate={probefahrtLicensePlate}
        currentDuration={probefahrtDurationHours * 60}
        currentRouteLimit={50}
        currentDeductible={probefahrtDeductible}
        onSave={(updates) => {
          if (updates.plate && setProbefahrtLicensePlate) setProbefahrtLicensePlate(updates.plate);
          if (updates.duration && setProbefahrtDurationHours) setProbefahrtDurationHours(Math.round(updates.duration / 60) || 1);
          if (updates.deductible !== undefined && setProbefahrtDeductible) setProbefahrtDeductible(updates.deductible);
        }}
      />

      {/* SUB-MODAL 2: TEXT TEMPLATE SELECTOR */}
      <TextTemplateSelectorModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* SUB-MODAL 3: EMAIL DISPATCH MODAL */}
      <EmailDocumentModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        documentType={documentType}
        documentNumber={documentNumber}
        customer={customer}
        manualCustomer={manualCustomer}
        merchantSettings={merchantSettings}
        totalGross={calc.totalGross}
        onSentSuccess={() => {}}
      />

      {/* SUB-MODAL 4: E-RECHNUNG XML INSPECTOR MODAL */}
      <ERechnungXmlViewerModal
        isOpen={showXmlModal}
        onClose={() => setShowXmlModal(false)}
        xmlContent={xmlContent}
        documentNumber={documentNumber}
      />

      </div>
    </div>
  );
};
