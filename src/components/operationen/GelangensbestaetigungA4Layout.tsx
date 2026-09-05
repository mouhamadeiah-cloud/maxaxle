import React from 'react';
import { 
  Building2, 
  Car, 
  CheckCircle2, 
  FileText, 
  Globe, 
  MapPin, 
  PenTool, 
  ShieldCheck, 
  Trash2, 
  Calendar, 
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  Customer, 
  MerchantSettings, 
  OperationVehicleItem,
  GelangensbestaetigungDetails
} from '../../types';

export interface GelangensbestaetigungA4LayoutProps {
  language: 'de' | 'en';
  documentNumber: string;
  date: string;
  customer: Customer | null;
  manualCustomer: Partial<Customer> | null;
  vehicles: OperationVehicleItem[];
  merchantSettings: MerchantSettings;
  exportCountry?: string;
  exportVatId?: string;
  details?: GelangensbestaetigungDetails;
  onUpdateDetails?: (updates: Partial<GelangensbestaetigungDetails>) => void;
  onSign?: () => void;
  onClearSignature?: () => void;
  pageNumber?: number;
  totalPages?: number;
  isInteractive?: boolean;
}

export const GelangensbestaetigungA4Layout: React.FC<GelangensbestaetigungA4LayoutProps> = ({
  language,
  documentNumber,
  date,
  customer,
  manualCustomer,
  vehicles,
  merchantSettings,
  exportCountry = 'Polen',
  exportVatId = '',
  details = {} as GelangensbestaetigungDetails,
  onUpdateDetails,
  onSign,
  onClearSignature,
  pageNumber = language === 'de' ? 2 : 3,
  totalPages = 3,
  isInteractive = false
}) => {
  const activeCustomer = customer || manualCustomer;
  const isDe = language === 'de';

  const customerName = details.consigneeName || activeCustomer?.name || 
    (activeCustomer?.companyName || `${activeCustomer?.firstName || ''} ${activeCustomer?.lastName || ''}`.trim()) || 
    'Abnehmer / Customer';

  const customerAddress = details.consigneeAddress || 
    `${activeCustomer?.street || 'Musterstraße 1'}, ${activeCustomer?.postalCode || '10115'} ${activeCustomer?.city || 'Warszawa'}, ${exportCountry || activeCustomer?.country || 'Polen'}`;

  const buyerVatId = details.consigneeVatId || exportVatId || activeCustomer?.vatId || 'PL1234567890';
  const destinationState = details.destinationMemberState || exportCountry || activeCustomer?.country || 'Polen';
  const destinationCity = details.destinationCity || activeCustomer?.city || 'Warszawa';
  
  const leaveBlank = details.leaveDateBlankForManualEntry ?? false;
  const dateOfReceipt = details.dateOfReceipt || date;
  const issueDate = details.issueDate || date;
  const leaveIssueDateBlank = details.leaveIssueDateBlank ?? false;

  const validVehicles = vehicles.filter(v => v.brand && v.sellingPrice > 0);
  const primaryVehicle = validVehicles[0] || {
    brand: 'Fahrzeug',
    model: 'Modell',
    vin: 'WBA00000000000000',
    mileage: 0,
    firstRegistration: date,
    sellingPrice: 0
  };

  const handleUpdate = (key: keyof GelangensbestaetigungDetails, value: any) => {
    if (onUpdateDetails) {
      onUpdateDetails({ [key]: value });
    }
  };

  return (
    <div 
      id={`gelangensbestaetigung-sheet-${language}`}
      className="a4-print-sheet bg-white text-slate-900 mx-auto p-8 sm:p-10 shadow-2xl border border-slate-200 rounded-none sm:rounded-lg font-sans relative flex flex-col justify-between"
      style={{
        width: '100%',
        maxWidth: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        pageBreakBefore: 'always',
        breakBefore: 'page'
      }}
    >
      <div className="space-y-4">
        
        {/* ========================================================================= */}
        {/* HEADER: COMPANY LOGO & LEGAL TITLE (§ 17a Abs. 2 UStDV)                  */}
        {/* ========================================================================= */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
                {isDe ? 'EU-STEUERNACHWEIS' : 'EU VAT PROOF'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 font-mono">
                § 17a Abs. 2 UStDV / § 6a UStG
              </span>
            </div>
            
            <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight mt-1">
              {isDe ? 'Gelangensbestätigung' : 'Confirmation of Receipt'}
            </h1>
            <p className="text-[10.5px] text-slate-600 font-medium max-w-lg leading-snug">
              {isDe 
                ? 'Bestätigung über das Gelangen des Gegenstands einer innergemeinschaftlichen Lieferung in das übrige Gemeinschaftsgebiet' 
                : 'Certification of the arrival of the object of an intra-Community supply in another EU Member State'}
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-2">
              {merchantSettings.logoUrl ? (
                <img
                  src={merchantSettings.logoUrl}
                  alt={merchantSettings.companyName || 'Logo'}
                  className="h-8 max-w-[130px] object-contain"
                />
              ) : (
                <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                  MF
                </div>
              )}
              <span className="font-extrabold text-sm text-slate-900">
                {merchantSettings.companyName || 'MaxFleet Autohandel'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {isDe ? 'Rechnungs-Ref:' : 'Invoice Ref:'} <strong className="text-slate-900">{documentNumber}</strong>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {isDe ? 'Rechnungsdatum:' : 'Invoice Date:'} <strong>{date}</strong>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE CONTROLS BANNER (VISIBLE IN SCREEN / HIDDEN ON PRINT)          */}
        {/* ========================================================================= */}
        {isInteractive && (
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-xs flex flex-wrap items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-700" />
              <span className="font-bold text-slate-800">
                {isDe ? 'Optionen zur Datums- & Unterschriftserfassung:' : 'Date & Signature options:'}
              </span>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Checkbox Leave Date Blank */}
              <label 
                onClick={() => handleUpdate('leaveDateBlankForManualEntry', !leaveBlank)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 cursor-pointer select-none"
              >
                {leaveBlank ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {isDe ? 'Datum freilassen (für handschriftlichen Eintrag im Bestimmungsland)' : 'Leave date blank (for handwriting in destination country)'}
                </span>
              </label>

              {/* Digital Signature Trigger */}
              {onSign && (
                <button
                  type="button"
                  onClick={onSign}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition"
                >
                  <PenTool className="w-3 h-3" />
                  <span>{details.signatureDataUrl ? (isDe ? 'Signatur ändern' : 'Change Signature') : (isDe ? 'Digital unterschreiben' : 'Sign Digitally')}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: LEISTENDER UNTERNEHMER (SUPPLIER) & ABNEHMER (CONSIGNEE)       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          
          {/* Supplier Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block border-b border-slate-200 pb-0.5">
              1. {isDe ? 'Leistender Unternehmer (Aussteller)' : 'Supplier (Issuer of Invoice)'}
            </span>
            <div className="font-extrabold text-slate-900">{merchantSettings.companyName || 'MaxFleet Autohandel GmbH'}</div>
            <div className="text-slate-600 text-[11px]">{merchantSettings.street || 'Kurfürstendamm 210'}</div>
            <div className="text-slate-600 text-[11px]">{merchantSettings.postalCode || '10719'} {merchantSettings.city || 'Berlin'}, Deutschland</div>
            <div className="text-[11px] font-mono font-bold text-slate-800 pt-0.5">
              USt-IdNr.: <span className="text-blue-900">{merchantSettings.vatId || 'DE123456789'}</span>
            </div>
          </div>

          {/* Consignee Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block border-b border-slate-200 pb-0.5">
              2. {isDe ? 'Abnehmer / Empfänger der Lieferung' : 'Customer / Consignee'}
            </span>
            <div className="font-extrabold text-slate-900">{customerName}</div>
            <div className="text-slate-600 text-[11px]">{customerAddress}</div>
            <div className="text-[11px] font-mono font-bold text-slate-800 pt-0.5">
              {isDe ? 'USt-IdNr. des Abnehmers:' : 'Customer VAT ID:'} <span className="text-blue-900">{buyerVatId}</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: GEGENSTAND DER LIEFERUNG (VEHICLE / GOODS SPECIFICATION)        */}
        {/* ========================================================================= */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-[10.5px] font-extrabold uppercase text-slate-900 block border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>3. {isDe ? 'Gegenstand der innergemeinschaftlichen Lieferung (Fahrzeugdaten)' : 'Object of the Intra-Community Supply (Vehicle Data)'}</span>
            <span className="text-[9.5px] font-mono text-slate-500 font-normal">
              {validVehicles.length} {validVehicles.length === 1 ? (isDe ? 'Fahrzeug' : 'Vehicle') : (isDe ? 'Fahrzeuge' : 'Vehicles')}
            </span>
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-[10px] text-slate-500 uppercase">
                  <th className="py-1 font-bold">{isDe ? 'Menge' : 'Qty'}</th>
                  <th className="py-1 font-bold">{isDe ? 'Handelsübliche Bezeichnung (Marke & Modell)' : 'Commercial Description (Brand & Model)'}</th>
                  <th className="py-1 font-bold font-mono">{isDe ? 'Fahrgestellnummer (FIN / VIN)' : 'VIN / Chassis No.'}</th>
                  <th className="py-1 font-bold text-right">{isDe ? 'Erstzulassung' : '1st Reg.'}</th>
                  <th className="py-1 font-bold text-right">{isDe ? 'km-Stand' : 'Mileage'}</th>
                  <th className="py-1 font-bold text-right">{isDe ? 'Lieferwert (Netto)' : 'Amount (Net)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {validVehicles.map((v, idx) => (
                  <tr key={v.id || idx}>
                    <td className="py-1.5 font-bold text-slate-900">1x</td>
                    <td className="py-1.5 font-bold text-slate-900">
                      {v.brand} {v.model} {v.variant ? `(${v.variant})` : ''}
                    </td>
                    <td className="py-1.5 font-mono font-bold text-slate-800 tracking-wider">
                      {v.vin || 'WBA00000000000000'}
                    </td>
                    <td className="py-1.5 text-right text-slate-700">
                      {v.firstRegistration || '–'}
                    </td>
                    <td className="py-1.5 text-right font-mono text-slate-700">
                      {v.mileage > 0 ? `${v.mileage.toLocaleString('de-DE')} km` : '–'}
                    </td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                      {v.sellingPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: BESTIMMUNGSORT & ZEITPUNKT DES ERHALTS (DESTINATION & RECEIPT)  */}
        {/* ========================================================================= */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <span className="text-[10.5px] font-extrabold uppercase text-slate-900 block border-b border-slate-200 pb-1">
            4. {isDe ? 'Bestimmungsort & Tag/Monat des Erhalts im Bestimmungsmitgliedstaat' : 'Destination & Date/Month of Receipt in Destination Member State'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Destination Member State & City */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isDe ? 'Bestimmungsmitgliedstaat & Ort:' : 'Destination Member State & City:'}
              </span>
              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{destinationCity}, {destinationState}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {isDe ? 'Ort des Endes der Beförderung oder Versendung' : 'Place where transport or dispatch ended'}
              </div>
            </div>

            {/* Date / Month of Receipt (Editable or Blank for manual entry) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isDe ? 'Tag / Monat des Erhalts des Gegenstands:' : 'Date / Month of receipt of goods:'}
              </span>
              
              {leaveBlank ? (
                <div className="p-1.5 border border-dashed border-slate-400 bg-white rounded text-center">
                  <div className="font-mono text-slate-400 text-xs tracking-widest">
                    ____________________________________
                  </div>
                  <div className="text-[9.5px] text-slate-500 italic mt-0.5">
                    {isDe 
                      ? '(Wird bei Ankunft im Bestimmungsland handschriftlich eingetragen)' 
                      : '(To be filled in by hand upon arrival in destination country)'}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dateOfReceipt}
                    onChange={(e) => handleUpdate('dateOfReceipt', e.target.value)}
                    placeholder={isDe ? 'z. B. 28.08.2026 oder August 2026' : 'e.g. 28.08.2026 or August 2026'}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold font-mono text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: GESETZLICHE BESTÄTIGUNGSERKLÄRUNG (LEGAL DECLARATION)          */}
        {/* ========================================================================= */}
        <div className="p-3.5 bg-emerald-50/60 border border-emerald-300 rounded-xl space-y-1.5 text-xs text-slate-800 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {isDe 
                ? 'Rechtsverbindliche Erklärung des Abnehmers (§ 17a Abs. 2 UStDV)' 
                : 'Legally Binding Declaration of the Consignee (§ 17a (2) UStDV)'}
            </span>
          </div>

          <p className="text-[11px] text-slate-700 leading-normal">
            {isDe ? (
              <>
                Der unterzeichnende Abnehmer (bzw. sein zur Entgegennahme Bevollmächtigter) bestätigt hiermit ausdrücklich, dass der oben bezeichnete Liefergegenstand in den Bestimmungsmitgliedstaat <strong>{destinationState}</strong> gelangt ist und dort im Rahmen der steuerfreien innergemeinschaftlichen Lieferung gem. <strong>§ 4 Nr. 1b i.V.m. § 6a UStG</strong> in Empfang genommen wurde.
              </>
            ) : (
              <>
                The undersigned consignee (or authorized representative) hereby explicitly confirms that the delivery item specified above has arrived in the destination Member State <strong>{destinationState}</strong> and was received there within the scope of a tax-exempt intra-Community supply pursuant to <strong>§ 4 No. 1b in conjunction with § 6a of the German VAT Act (UStG)</strong>.
              </>
            )}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: AUSSTELLUNGSDATUM & UNTERSCHRIFT DES ABNEHMERS                 */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t-2 border-slate-900 space-y-2">
          
          <div className="flex justify-between items-center text-xs text-slate-700 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">{isDe ? 'Ausstellungsort & Datum:' : 'Place & Date of issue:'}</span>
              <input
                type="text"
                value={details.placeOfIssue || destinationCity}
                onChange={(e) => handleUpdate('placeOfIssue', e.target.value)}
                placeholder={isDe ? 'Ort' : 'City'}
                className="font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 focus:bg-white focus:border-slate-400 border border-transparent rounded px-1.5 py-0.5 text-xs w-28"
              />
              <span>,</span>
              {leaveIssueDateBlank ? (
                <span className="font-mono text-slate-400">____________________</span>
              ) : (
                <input
                  type="text"
                  value={issueDate}
                  onChange={(e) => handleUpdate('issueDate', e.target.value)}
                  placeholder={isDe ? 'Datum' : 'Date'}
                  className="font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 focus:bg-white focus:border-slate-400 border border-transparent rounded px-1.5 py-0.5 text-xs font-mono w-24"
                />
              )}
            </div>

            <div className="text-[10px] text-slate-500">
              {isDe ? 'Unterschrift des Abnehmers oder Vertretungsberechtigten' : 'Signature of consignee or authorized representative'}
            </div>
          </div>

          {/* Signature Boxes Grid */}
          <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
            
            {/* Signatory Name & Function in Print */}
            <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/70 space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  {isDe ? 'Name des Unterzeichners in Druckbuchstaben:' : 'Signatory Name in Print:'}
                </span>
                <input
                  type="text"
                  value={details.signatoryName || customerName}
                  onChange={(e) => handleUpdate('signatoryName', e.target.value)}
                  placeholder={isDe ? 'Name des Unterzeichners' : 'Full Name'}
                  className="w-full mt-0.5 font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  {isDe ? 'Funktion / Vertretungsbefugnis:' : 'Function / Representation:'}
                </span>
                <input
                  type="text"
                  value={details.signatoryFunction || (isDe ? 'Geschäftsführer / Abnehmer' : 'Managing Director / Consignee')}
                  onChange={(e) => handleUpdate('signatoryFunction', e.target.value)}
                  placeholder={isDe ? 'z. B. Geschäftsführer / Abnehmer' : 'e.g. Managing Director / Consignee'}
                  className="w-full mt-0.5 text-slate-700 bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Electronic Signature / Signature Stamp Area */}
            <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/70 flex flex-col justify-between h-28 relative group">
              <div className="flex justify-between items-start text-[9.5px] text-slate-500">
                <span className="font-bold uppercase text-slate-700">
                  {isDe ? 'Unterschrift & Firmenstempel des Abnehmers:' : 'Signature & Company Stamp of Consignee:'}
                </span>
              </div>

              {/* Signature Display / Interactive Click */}
              <div 
                onClick={onSign}
                className={`flex-1 flex items-center justify-center my-0.5 rounded transition ${onSign ? 'cursor-pointer hover:bg-emerald-50/50' : ''}`}
              >
                {details.signatureDataUrl ? (
                  <img 
                    src={details.signatureDataUrl} 
                    alt="Unterschrift Abnehmer" 
                    className="max-h-14 max-w-full object-contain"
                  />
                ) : (
                  <div className="w-full flex flex-col items-center justify-end h-full pb-1">
                    <div className="w-full border-b border-slate-400 border-dashed" />
                    <span className="text-[9.5px] text-slate-400 italic pt-1">
                      {isDe ? '(Rechtsverbindliche Unterschrift & Firmenstempel)' : '(Legally binding signature & stamp)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Clear Signature Action */}
              {details.signatureDataUrl && onClearSignature && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSignature();
                  }}
                  className="absolute bottom-1 right-1 p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition print:hidden cursor-pointer"
                  title="Unterschrift löschen"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* DIN 5008 COMPLIANT 4-COLUMN FOOTER WITH OFFICIAL PAGINATION               */}
      {/* ========================================================================= */}
      <div className="mt-6 pt-3 border-t-2 border-slate-200 text-[9px] text-slate-500 space-y-1.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 leading-tight">
          
          {/* Col 1: Aussteller / Firmensitz */}
          <div className="space-y-0.5">
            <div className="font-bold text-slate-700">{merchantSettings.companyName || 'MaxFleet Gruppe'}</div>
            <div>Inhaber / GF: {merchantSettings.responsiblePerson}</div>
            <div>{merchantSettings.street}, {merchantSettings.postalCode} {merchantSettings.city}</div>
            <div>{merchantSettings.commercialRegister} {merchantSettings.registerCourt}</div>
          </div>

          {/* Col 2: Steuer & Zoll */}
          <div className="space-y-0.5 font-mono">
            <div className="font-bold text-slate-700 font-sans">{isDe ? 'Steuer & EU-Zoll' : 'Tax & EU Customs'}</div>
            <div>USt-IdNr.: {merchantSettings.vatId}</div>
            <div>St.-Nr.: {merchantSettings.taxNumber}</div>
            {merchantSettings.eoriNumber && <div>EORI: {merchantSettings.eoriNumber}</div>}
          </div>

          {/* Col 3: Rechtlicher Hinweis */}
          <div className="space-y-0.5">
            <div className="font-bold text-slate-700">{isDe ? 'Belegnachweis' : 'Documentary Proof'}</div>
            <div>§ 17a Abs. 2 UStDV</div>
            <div>§ 4 Nr. 1b / § 6a UStG</div>
            <div>EU Reverse Charge</div>
          </div>

          {/* Col 4: Pagination & Document ID */}
          <div className="space-y-0.5 text-right">
            <div className="font-bold text-slate-700">
              {isDe ? `Seite ${pageNumber} von ${totalPages}` : `Page ${pageNumber} of ${totalPages}`}
            </div>
            <div className="text-[8.5px] text-slate-400 font-mono">
              Ref: {documentNumber}
            </div>
            <div className="text-[8px] text-slate-400">
              DIN 5008 • EU Compliance
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
