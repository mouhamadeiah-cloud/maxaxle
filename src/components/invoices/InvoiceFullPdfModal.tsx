import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CreditCard, 
  FileX2, 
  FileBadge, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Car, 
  ShieldCheck,
  AlertTriangle,
  Receipt,
  QrCode,
  FileText
} from 'lucide-react';
import { Invoice, MerchantSettings } from '../../types';

interface InvoiceFullPdfModalProps {
  invoice: Invoice;
  merchantSettings: MerchantSettings;
  onClose: () => void;
  onOpenPayment: (invoice: Invoice) => void;
  onOpenStorno: (invoice: Invoice) => void;
  onOpenGutschrift: (invoice: Invoice) => void;
  onOpenMahnung: (invoice: Invoice) => void;
}

export const InvoiceFullPdfModal: React.FC<InvoiceFullPdfModalProps> = ({
  invoice,
  merchantSettings,
  onClose,
  onOpenPayment,
  onOpenStorno,
  onOpenGutschrift,
  onOpenMahnung
}) => {
  const isStorniert = invoice.status === 'storniert' || invoice.invoiceCategory === 'storno';
  const isGutschrift = invoice.invoiceCategory === 'gutschrift';
  const isBezahlt = invoice.status === 'bezahlt';
  const isTeilbezahlt = invoice.status === 'teilbezahlt';
  const isOffen = invoice.status === 'offen';

  const previousPaid = Number(invoice.amountPaid) || 0;
  const remainingBalance = Math.max(0, invoice.amountGross - previousPaid);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    alert(`PDF-Export für Dokument ${invoice.invoiceNumber} wurde gestartet.`);
  };

  const getDocTitle = () => {
    if (isStorniert) return 'STORNORECHNUNG / RECHNUNGSKORREKTUR';
    if (isGutschrift) return 'GUTSCHRIFT / RECHNUNGSKORREKTUR';
    if (invoice.documentType === 'eu_export' || invoice.invoiceCategory === 'eu_export') return 'EU-EXPORT RECHNUNG (STEUERFREI)';
    if (invoice.documentType === 'export_drittland' || invoice.invoiceCategory === 'export_drittland') return 'EXPORT-RECHNUNG DRITTLAND';
    if (invoice.taxType === 'kaufvertrag') return 'KAUFVERTRAGS-RECHNUNG';
    if (invoice.taxType === 'barverkauf') return 'BARVERKAUF / QUITTUNG';
    return 'FAHRZEUG-RECHNUNG';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-start justify-center p-1 sm:p-3 md:p-4 pt-2 sm:pt-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl max-w-4xl w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-0 sm:my-2 flex flex-col max-h-[96vh]">
        
        {/* ========================================================================= */}
        {/* FIXED ACTION TOOLBAR (DIRECTLY ABOVE A4 PDF PREVIEW)                       */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 shrink-0 flex flex-wrap items-center justify-between gap-2 shadow-md">
          
          {/* Left: Document Label & Status */}
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-extrabold text-sm text-blue-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              {invoice.invoiceNumber}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
              isBezahlt ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              isStorniert ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              isTeilbezahlt ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {invoice.status.toUpperCase()}
            </span>
            {remainingBalance > 0 && !isStorniert && (
              <span className="text-xs text-slate-300 hidden sm:inline">
                Offen: <strong className="text-emerald-400 font-mono">{remainingBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong>
              </span>
            )}
          </div>

          {/* Right: Interactive Action Buttons */}
          <div className="flex items-center flex-wrap gap-1.5">
            
            {/* Zahlung + */}
            {!isStorniert && !isBezahlt && (
              <button
                type="button"
                onClick={() => onOpenPayment(invoice)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                title="Zahlungseingang erfassen und verbuchen"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Zahlung +</span>
              </button>
            )}

            {/* Gutschrift */}
            {!isStorniert && (
              <button
                type="button"
                onClick={() => onOpenGutschrift(invoice)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                title="Gutschrift / Rechnungskorrektur erstellen"
              >
                <FileBadge className="w-3.5 h-3.5" />
                <span>Gutschrift</span>
              </button>
            )}

            {/* Mahnung */}
            {!isStorniert && !isBezahlt && (
              <button
                type="button"
                onClick={() => onOpenMahnung(invoice)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                title="1. oder 2. Mahnung / Zahlungserinnerung generieren"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Mahnung</span>
              </button>
            )}

            {/* Storno */}
            {!isStorniert && (
              <button
                type="button"
                onClick={() => onOpenStorno(invoice)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                title="GoBD-konforme Stornierung"
              >
                <FileX2 className="w-3.5 h-3.5" />
                <span>Storno</span>
              </button>
            )}

            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

            {/* Drucken */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition cursor-pointer border border-slate-700"
              title="A4 Dokument drucken"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Drucken</span>
            </button>

            {/* PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="PDF exportieren"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            {/* Schließen */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1 cursor-pointer"
              title="Schließen"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* FULL A4 INVOICE SHEET VIEWER CONTAINER                                    */}
        {/* ========================================================================= */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-200/70 flex justify-center">
          
          <div className="bg-white text-slate-900 rounded-xl shadow-xl border border-slate-300/80 w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 font-sans text-xs space-y-8 relative">
            
            {/* Storno Watermark if applicable */}
            {isStorniert && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <span className="text-8xl font-black text-red-600 uppercase tracking-widest rotate-[-30deg] select-none border-8 border-red-600 p-8 rounded-3xl">
                  STORNIERT
                </span>
              </div>
            )}

            {/* LETTERHEAD / DEALER HEADER */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div className="space-y-1">
                {merchantSettings.logoUrl ? (
                  <img
                    src={merchantSettings.logoUrl}
                    alt={merchantSettings.companyName || 'Autohaus Logo'}
                    className="h-12 max-w-[180px] object-contain mb-2"
                  />
                ) : (
                  <div className="font-black text-2xl tracking-tight text-blue-600 mb-1">
                    {merchantSettings.companyName || 'MaxFleet Autohandelsgruppe GmbH'}
                  </div>
                )}
                <div className="text-slate-600 text-xs">
                  {merchantSettings.street || 'Kurfürstendamm 210'} &bull; {merchantSettings.postalCode || '10719'} {merchantSettings.city || 'Berlin'}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Telefon: {merchantSettings.phone || '+49 (0) 30 987654-0'} &bull; E-Mail: {merchantSettings.email || 'info@maxfleet-autohandel.de'}
                </div>
                <div className="text-slate-500 text-[11px]">
                  USt-IdNr.: {merchantSettings.vatId || 'DE 319 824 550'} &bull; Handelsregister: {merchantSettings.commercialRegister || 'AG Berlin-Charlottenburg, HRB 198421 B'}
                </div>
              </div>

              {/* Document Meta Box */}
              <div className="text-right space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Dokument-Typ</div>
                <div className={`font-black text-sm ${isStorniert ? 'text-red-600' : isGutschrift ? 'text-purple-600' : 'text-slate-900'}`}>
                  {getDocTitle()}
                </div>
                <div className="font-mono font-extrabold text-base text-blue-700 pt-1">
                  {invoice.invoiceNumber}
                </div>
                <div className="text-[11px] text-slate-600">Datum: <strong>{invoice.date}</strong></div>
                <div className="text-[11px] text-slate-600">Zahlungsziel: <strong>{invoice.dueDate || invoice.date}</strong></div>
                <div className="text-[11px] text-slate-600">Kunden-Nr.: <span className="font-mono font-semibold">KD-{invoice.customerType}-2026</span></div>
              </div>
            </div>

            {/* DIN 5008 SENDER LINE & CUSTOMER RECIPIENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider underline mb-2">
                  {merchantSettings.companyName || 'MaxFleet GmbH'} &bull; {merchantSettings.street || 'Kurfürstendamm 210'} &bull; {merchantSettings.postalCode || '10719'} {merchantSettings.city || 'Berlin'}
                </div>
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Rechnungsempfänger / Käufer:</div>
                  <div className="font-extrabold text-slate-900 text-sm">{invoice.customerName}</div>
                  <div className="text-slate-700">{invoice.customerStreet || 'Musterstraße 42'}</div>
                  <div className="text-slate-700">{invoice.customerPostalCode || '10115'} {invoice.customerCity || 'Berlin'}</div>
                  <div className="text-slate-500 text-[11px]">Deutschland</div>
                </div>
              </div>

              {/* Delivery / Performance Notice */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-xs mb-1">Lieferung & Leistungsdatum:</div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Das Leistungsdatum entspricht dem Rechnungsdatum, sofern nicht gesondert durch ein Übergabeprotokoll vereinbart.
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex justify-between">
                  <span>Zahlungsart: <strong>{invoice.paymentMethod}</strong></span>
                  <span>Bearbeiter: <strong>{merchantSettings.responsiblePerson || 'Geschäftsleitung'}</strong></span>
                </div>
              </div>
            </div>

            {/* INVOICE ITEMS TABLE */}
            <div className="space-y-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-700 font-bold text-xs uppercase">
                    <th className="py-2.5 px-3">Pos.</th>
                    <th className="py-2.5 px-3">Artikel- & Fahrzeugspezifikation</th>
                    <th className="py-2.5 px-3 text-center">Menge</th>
                    <th className="py-2.5 px-3 text-right">Einzelpreis</th>
                    <th className="py-2.5 px-3 text-right">Gesamtpreis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  <tr className="align-top">
                    <td className="py-3.5 px-3 font-bold text-slate-500">1</td>
                    <td className="py-3.5 px-3 space-y-1">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {invoice.vehicleTitle}
                      </div>
                      <div className="font-mono text-slate-600 text-xs">
                        Fahrzeug-Identifizierungsnummer (FIN): <strong className="text-slate-900">{invoice.vin}</strong>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Kraftfahrzeug gem. Kaufvertrag / Bestellung mit allen serienmäßigen und vertraglich vereinbarten Ausstattungsmerkmalen.
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold">1 Stk.</td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium">
                      {Math.abs(invoice.amountGross).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {invoice.amountGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TOTALS & TAX SECTION */}
            <div className="border-t-2 border-slate-900 pt-4 flex flex-col sm:flex-row justify-between gap-6">
              
              {/* Left: Tax Clause Notice */}
              <div className="sm:max-w-md space-y-2">
                {invoice.taxType === 'diff_25a' ? (
                  <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Sonderregelung Differenzbesteuerung nach § 25a UStG</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Gebrauchtgegenstände / Sonderregelung: Die Umsatzsteuer wird gemäß § 25a UStG (Differenzbesteuerung) nicht gesondert ausgewiesen. Kein Vorsteuerabzug für gewerbliche Käufer möglich.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>Regelbesteuerung (19% Umsatzsteuer)</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Enthält die gesetzliche Mehrwertsteuer in Höhe von 19%. Zum Vorsteuerabzug berechtigte Unternehmen können die ausgewiesene Steuer geltend machen.
                    </p>
                  </div>
                )}

                {invoice.notes && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                    <span className="font-bold block text-slate-700">Vermerk / Bemerkung:</span>
                    {invoice.notes}
                  </div>
                )}
              </div>

              {/* Right: Numerical Breakdown */}
              <div className="sm:w-72 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {invoice.taxType === 'standard_19' ? (
                  <>
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Nettobetrag:</span>
                      <span className="font-mono font-semibold">{invoice.amountNet.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Zzgl. 19% MwSt.:</span>
                      <span className="font-mono font-semibold">{invoice.taxAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t-2 border-slate-300">
                      <span>Rechnungsbetrag:</span>
                      <span className="font-mono text-blue-700">{invoice.amountGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-slate-900 font-black text-base">
                      <span>Gesamtbetrag:</span>
                      <span className="font-mono text-blue-700">{invoice.amountGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                    </div>
                    <div className="text-[10px] text-slate-500 italic">
                      * Inklusive aller Nebenkosten & Sonderregelungen
                    </div>
                  </>
                )}

                {/* Payment summary */}
                <div className="border-t border-slate-200 pt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Bereits bezahlt:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {previousPaid.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold">
                    <span>Offener Restbetrag:</span>
                    <span className={`font-mono font-black ${remainingBalance > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {remainingBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* PAYMENT DETAILS & BANK ACCOUNT FOOTER */}
            <div className="p-4 bg-slate-900 text-white rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-bold">Bankverbindung</div>
                <div className="font-extrabold mt-0.5">{merchantSettings.bankName || 'Commerzbank AG Berlin'}</div>
                <div className="font-mono text-slate-300 text-[11px] mt-0.5">IBAN: {merchantSettings.iban || 'DE89 1004 0000 0123 4567 89'}</div>
                <div className="font-mono text-slate-400 text-[11px]">BIC: {merchantSettings.bic || 'COBADEFFXXX'}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase text-slate-400 font-bold">Verwendungszweck</div>
                <div className="font-mono font-black text-blue-400 text-sm mt-0.5">{invoice.invoiceNumber}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Bitte stets Rechnungsnummer bei Überweisung angeben.</div>
              </div>

              <div className="text-right flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold">GoBD-Belegstatus</div>
                  <div className="text-emerald-400 font-bold text-xs mt-0.5 flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Unveränderbar archiviert</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">
                  Erstellt am {invoice.date} durch AutoManagement
                </div>
              </div>
            </div>

            {/* SIGNATURE FIELDS */}
            <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-200">
              <div>
                <div className="border-b border-slate-400 pb-8" />
                <div className="text-[11px] text-slate-500 mt-1.5">
                  Ort, Datum & Unterschrift Verkäufer ({merchantSettings.companyName || 'MaxFleet GmbH'})
                </div>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-8" />
                <div className="text-[11px] text-slate-500 mt-1.5">
                  Ort, Datum & Unterschrift Käufer ({invoice.customerName})
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
