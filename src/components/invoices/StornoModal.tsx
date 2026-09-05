import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  FileX2, 
  Building2, 
  Banknote, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Printer, 
  Download, 
  ShieldAlert,
  ArrowRight,
  Info,
  Scale
} from 'lucide-react';
import { Invoice } from '../../types';
import { firebaseService } from '../../services/firebaseService';

interface StornoModalProps {
  invoice: Invoice;
  onClose: () => void;
  onStornoSuccess: (originalInvoice: Invoice, stornoInvoice: Invoice) => void;
}

const STORNO_REASONS = [
  'Kaufvertragsrücktritt / Wandlung nach § 323 BGB',
  'Falsche Rechnungs- oder Kundendaten',
  'Doppelerfassung / System-Fehlbuchung',
  'Kunde nicht liquide / Finanzierung abgelehnt',
  'Fahrzeugmangel vor Auslieferung / Einvernehmliche Stornierung',
  'Kulanzrücknahme durch Geschäftsleitung',
  'Sonstiger rechtlicher Stornogrund'
];

export const StornoModal: React.FC<StornoModalProps> = ({ invoice, onClose, onStornoSuccess }) => {
  const previousPaid = Number(invoice.amountPaid) || 0;
  
  const [selectedReason, setSelectedReason] = useState<string>(STORNO_REASONS[0]);
  const [customReasonDetails, setCustomReasonDetails] = useState<string>('');
  const [stornoDate, setStornoDate] = useState<string>(() => {
    return new Date().toLocaleDateString('de-DE');
  });
  const [refundMethod, setRefundMethod] = useState<'Bank' | 'Bar' | 'Verrechnung' | 'Keine'>(
    previousPaid > 0 ? (invoice.paymentMethod === 'Bar' ? 'Bar' : 'Bank') : 'Keine'
  );
  const [refundAmount, setRefundAmount] = useState<number>(previousPaid > 0 ? previousPaid : 0);
  const [notes, setNotes] = useState<string>('');
  const [confirmedStorno, setConfirmedStorno] = useState<boolean>(false);

  // Success state
  const [successResult, setSuccessResult] = useState<{
    originalInvoice: Invoice;
    stornoInvoice: Invoice;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedStorno) {
      alert('Bitte bestätigen Sie die Stornierungsbelehrung.');
      return;
    }

    const fullReason = customReasonDetails.trim() 
      ? `${selectedReason} - ${customReasonDetails.trim()}`
      : selectedReason;

    const result = firebaseService.cancelInvoiceWithStorno(invoice.id, {
      reason: fullReason,
      stornoDate,
      refundMethod,
      refundAmount: Number(refundAmount) || 0,
      notes: notes.trim() || undefined,
      recordedBy: 'M. Mustermann'
    });

    if (result) {
      setSuccessResult({
        originalInvoice: result.originalInvoice,
        stornoInvoice: result.stornoInvoice
      });
      onStornoSuccess(result.originalInvoice, result.stornoInvoice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-modal-container rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col my-0 sm:my-1 text-[#0e264b]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-300/70 flex items-center justify-between bg-gradient-to-b from-white/40 to-slate-200/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-sm">
              <FileX2 className="w-5 h-5 text-rose-700 metallic-debossed-icon" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#0e264b] tracking-tight">Rechnung stornieren (Rechnungskorrektur)</h2>
              <p className="text-xs text-[#1e3a5f]/80 font-semibold">Original-Beleg #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-[#0e264b] hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successResult ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto shadow-sm border border-rose-300">
                  <CheckCircle2 className="w-8 h-8 metallic-debossed-icon" />
                </div>
                <h3 className="text-lg font-black text-[#0e264b]">Rechnung erfolgreich storniert</h3>
                <p className="text-xs text-[#1e3a5f]/80 max-w-md mx-auto">
                  Die Originalrechnung <strong className="text-[#0e264b] font-bold">{invoice.invoiceNumber}</strong> wurde ordnungsgemäß als storniert gekennzeichnet. Es wurde ein offizieller Stornobeleg erstellt.
                </p>
              </div>

              {/* Storno Summary Card */}
              <div className="metallic-card border border-slate-300/80 rounded-2xl p-4 text-xs space-y-3 font-sans">
                <div className="flex justify-between items-center border-b border-slate-300/70 pb-2">
                  <span className="font-bold text-[#1e3a5f]">Generierte Stornorechnung:</span>
                  <span className="font-mono font-black text-rose-700">{successResult.stornoInvoice.invoiceNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#1e3a5f]">
                  <div>Kunde: <strong className="text-[#0e264b] block font-bold">{invoice.customerName}</strong></div>
                  <div>Fahrzeug: <strong className="text-[#0e264b] block font-bold">{invoice.vehicleTitle}</strong></div>
                  <div>Stornodatum: <strong className="text-[#0e264b] block font-bold">{stornoDate}</strong></div>
                  <div>Rückzahlungsart: <strong className="text-[#0e264b] block font-bold">{refundMethod}</strong></div>
                </div>
                <div className="border-t border-slate-300/70 pt-2 flex justify-between items-center text-sm">
                  <span className="font-bold text-[#0e264b]">Stornobetrag (Korrektur):</span>
                  <span className="font-mono font-black text-rose-700 text-base">
                    -{invoice.amountGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
                {refundAmount > 0 && (refundMethod === 'Bar' || refundMethod === 'Bank') && (
                  <div className="text-[11px] bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-300/80 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 metallic-debossed-icon" />
                    <span>Rückzahlung von {refundAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € wurde automatisch im Finanzbuch ({refundMethod === 'Bar' ? 'Kasse' : 'Bank'}) als Ausgabe erfasst.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-sm transition cursor-pointer active:scale-95"
                >
                  Fertigstellen & Schließen
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Invoice Summary Pill */}
              <div className="metallic-card border border-slate-300/80 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1e3a5f]/70 uppercase tracking-wider text-[10px]">Zu stornierender Beleg</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 font-mono border border-blue-200">
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#0e264b] font-medium">
                  <span>{invoice.customerName} &bull; {invoice.vehicleTitle}</span>
                  <span className="font-mono font-black text-[#0e264b] text-sm">
                    {invoice.amountGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#1e3a5f] pt-1 border-t border-slate-300/60">
                  <span>Bisher bezahlt: <strong className="text-[#0e264b]">{previousPaid.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong></span>
                  <span>Steuerart: <strong className="text-[#0e264b]">{invoice.taxType === 'standard_19' ? '19% MwSt' : '§ 25a UStG'}</strong></span>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-blue-950">
                <Scale className="w-4 h-4 text-blue-800 shrink-0 mt-0.5 metallic-debossed-icon" />
                <div className="space-y-1">
                  <p className="font-bold">Rechtssicherer Stornovorgang gem. GoBD & § 14 UStG</p>
                  <p className="text-[11px] text-blue-900/80 leading-relaxed font-medium">
                    Eine einmal ausgestellte Rechnung darf im deutschen Steuerrecht nicht gelöscht werden. Die Stornierung erzeugt eine offizielle Stornorechnung mit korrespondierendem Negativbetrag im Archiv.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                
                {/* Date & Reason Select */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Stornodatum <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none metallic-debossed-icon" />
                      <input
                        type="text"
                        value={stornoDate}
                        onChange={(e) => setStornoDate(e.target.value)}
                        placeholder="TT.MM.JJJJ"
                        required
                        className="metallic-input w-full pl-9 pr-3 py-2 text-xs font-medium text-[#0e264b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Stornogrund-Kategorie <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="metallic-input w-full px-3 py-2 text-xs font-medium text-[#0e264b]"
                    >
                      {STORNO_REASONS.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Reason Details */}
                <div>
                  <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                    Detailbegründung / Vermerk (erscheint auf Stornobeleg)
                  </label>
                  <input
                    type="text"
                    value={customReasonDetails}
                    onChange={(e) => setCustomReasonDetails(e.target.value)}
                    placeholder="Z. B. Kunde hat am 17.08. schriftlich vom Kaufvertrag gem. Widerrufsbelehrung zurückgetreten."
                    className="metallic-input w-full px-3 py-2 text-xs font-medium text-[#0e264b]"
                  />
                </div>

                {/* Refund Method & Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Rückabwicklung / Erstattungsart
                    </label>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value as any)}
                      className="metallic-input w-full px-3 py-2 text-xs font-medium text-[#0e264b]"
                    >
                      <option value="Bank">Banküberweisung (Rückzahlung Geschäftskonto)</option>
                      <option value="Bar">Barauszahlung (Kassenbuch Auszahlung)</option>
                      <option value="Verrechnung">Verrechnung mit anderem Kundenauftrag</option>
                      <option value="Keine">Keine Rückzahlung (Rechnung war unbezahlt)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Erstattungsbetrag (€)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                        disabled={refundMethod === 'Keine'}
                        className="metallic-input w-full pl-3 pr-8 py-2 text-xs font-black text-[#0e264b] disabled:opacity-50"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-[#1e3a5f]/60">€</span>
                    </div>
                  </div>
                </div>

                {/* Storno Confirmation Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedStorno}
                      onChange={(e) => setConfirmedStorno(e.target.checked)}
                      className="mt-0.5 rounded border-rose-300 text-rose-700 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold leading-relaxed">
                      Ich bestätige die unwiderrufliche Stornierung der Rechnung {invoice.invoiceNumber} und die Erstellung des Korrekturbelegs.
                    </span>
                  </label>
                </div>

              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-300/70">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 metallic-card-luminous border border-slate-300/70 hover:bg-white/60 text-[#1e3a5f] font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={!confirmedStorno}
                  className="flex items-center gap-1.5 px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-sm transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <FileX2 className="w-4 h-4 metallic-debossed-icon" />
                  <span>Storno durchführen & Beleg erstellen</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
