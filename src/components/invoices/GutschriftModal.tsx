import React, { useState } from 'react';
import { 
  X, 
  FileBadge, 
  Receipt, 
  Building2, 
  Banknote, 
  Calendar, 
  CheckCircle2, 
  Printer, 
  Download, 
  Info,
  Euro,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Invoice } from '../../types';
import { firebaseService } from '../../services/firebaseService';

interface GutschriftModalProps {
  invoice: Invoice;
  onClose: () => void;
  onGutschriftSuccess: (originalInvoice: Invoice, gutschriftInvoice: Invoice) => void;
}

const GUTSCHRIFT_REASONS = [
  'Nachträglicher Preisnachlass / Sonderrabatt',
  'Mängelbeseitigung / Schaden am Fahrzeug (Lack/Kratzer)',
  'Ausgleich Überzahlung / Gebührenerstattung',
  'Zulassungskosten / Überführungserstattung',
  'Kulanzgutschrift nach Fahrzeugübernahme',
  'Rückerstattung Anzahlung / Teilbetrag',
  'Sonstige Gutschrift'
];

export const GutschriftModal: React.FC<GutschriftModalProps> = ({ invoice, onClose, onGutschriftSuccess }) => {
  const [reasonCategory, setReasonCategory] = useState<string>(GUTSCHRIFT_REASONS[0]);
  const [reasonText, setReasonText] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toLocaleDateString('de-DE'));
  const [amountGross, setAmountGross] = useState<number>(() => {
    // Default suggestion: 250 € or partial amount
    return Math.min(250, invoice.amountGross);
  });
  const [refundMethod, setRefundMethod] = useState<'Bank' | 'Bar' | 'Verrechnung'>('Bank');

  // Success state
  const [successResult, setSuccessResult] = useState<{
    originalInvoice: Invoice;
    gutschriftInvoice: Invoice;
  } | null>(null);

  // Calculations
  const grossNum = Number(amountGross) || 0;
  const isStandard19 = invoice.taxType === 'standard_19';
  const netAmount = isStandard19 ? Math.round((grossNum / 1.19) * 100) / 100 : grossNum;
  const taxAmount = isStandard19 ? Math.round((grossNum - netAmount) * 100) / 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grossNum <= 0) {
      alert('Bitte geben Sie einen Gutschriftbetrag größer als 0 € ein.');
      return;
    }
    if (grossNum > invoice.amountGross) {
      alert('Der Gutschriftbetrag darf den Rechnungsbetrag nicht übersteigen.');
      return;
    }

    const result = firebaseService.createCreditNoteGutschrift(invoice.id, {
      amountGross: grossNum,
      reasonCategory,
      reasonText: reasonText.trim() || reasonCategory,
      refundMethod,
      date,
      recordedBy: 'M. Mustermann'
    });

    if (result) {
      setSuccessResult({
        originalInvoice: result.originalInvoice,
        gutschriftInvoice: result.gutschriftInvoice
      });
      onGutschriftSuccess(result.originalInvoice, result.gutschriftInvoice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-modal-container rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col my-0 sm:my-1 text-[#0e264b]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-300/70 flex items-center justify-between bg-gradient-to-b from-white/40 to-slate-200/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-sm">
              <FileBadge className="w-5 h-5 text-[#0e264b] metallic-debossed-icon" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#0e264b] tracking-tight">Gutschrift / Rechnungskorrektur erstellen</h2>
              <p className="text-xs text-[#1e3a5f]/80 font-semibold">Zu Rechnung #{invoice.invoiceNumber}</p>
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
                <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto shadow-sm border border-purple-300">
                  <CheckCircle2 className="w-8 h-8 metallic-debossed-icon" />
                </div>
                <h3 className="text-lg font-black text-[#0e264b]">Gutschrift erfolgreich generiert</h3>
                <p className="text-xs text-[#1e3a5f]/80 max-w-md mx-auto">
                  Die Gutschrift wurde unter Belegnummer <strong className="text-purple-800 font-bold">{successResult.gutschriftInvoice.invoiceNumber}</strong> im Archiv angelegt und die Auszahlung erfasst.
                </p>
              </div>

              {/* Gutschrift Summary Card */}
              <div className="metallic-card border border-slate-300/80 rounded-2xl p-4 text-xs space-y-3 font-sans">
                <div className="flex justify-between items-center border-b border-slate-300/70 pb-2">
                  <span className="font-bold text-[#1e3a5f]">Gutschrift-Belegnummer:</span>
                  <span className="font-mono font-black text-purple-800">{successResult.gutschriftInvoice.invoiceNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#1e3a5f]">
                  <div>Empfänger: <strong className="text-[#0e264b] block font-bold">{invoice.customerName}</strong></div>
                  <div>Bezug auf Rechnung: <strong className="text-[#0e264b] block font-bold">{invoice.invoiceNumber}</strong></div>
                  <div>Datum: <strong className="text-[#0e264b] block font-bold">{date}</strong></div>
                  <div>Erstattungsart: <strong className="text-[#0e264b] block font-bold">{refundMethod}</strong></div>
                </div>
                <div className="border-t border-slate-300/70 pt-2 flex justify-between items-center text-sm">
                  <span className="font-bold text-[#0e264b]">Gutschriftbetrag (Brutto):</span>
                  <span className="font-mono font-black text-purple-800 text-base">
                    -{grossNum.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
                {(refundMethod === 'Bar' || refundMethod === 'Bank') && (
                  <div className="text-[11px] bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-300/80 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700 metallic-debossed-icon" />
                    <span>Auszahlung von {grossNum.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € wurde automatisch im Finanzkonto ({refundMethod === 'Bar' ? 'Kasse' : 'Bank'}) verbucht.</span>
                  </div>
                )}
              </div>

              {/* Actions */}
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
              
              {/* Target Invoice Info */}
              <div className="metallic-card border border-slate-300/80 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1e3a5f]/70 uppercase tracking-wider text-[10px]">Basis-Rechnung</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100/80 text-blue-900 font-mono border border-blue-200">
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#0e264b] font-medium">
                  <span>{invoice.customerName} &bull; {invoice.vehicleTitle}</span>
                  <span className="font-mono font-black text-[#0e264b]">
                    Rechnungsbetrag: {invoice.amountGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-4">
                
                {/* Date & Reason */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Gutschriftdatum <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none metallic-debossed-icon" />
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="TT.MM.JJJJ"
                        required
                        className="metallic-input w-full pl-9 pr-3 py-2 text-xs font-medium text-[#0e264b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Gutschriftgrund <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reasonCategory}
                      onChange={(e) => setReasonCategory(e.target.value)}
                      className="metallic-input w-full px-3 py-2 text-xs font-medium text-[#0e264b]"
                    >
                      {GUTSCHRIFT_REASONS.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Detailed reason text */}
                <div>
                  <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                    Begründungstext (erscheint auf Gutschrift-Beleg)
                  </label>
                  <input
                    type="text"
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    placeholder="Z. B. Ausgleich für nachträgliche Beseitigung eines Lackkratzers an der Fahrertür."
                    className="metallic-input w-full px-3 py-2 text-xs font-medium text-[#0e264b]"
                  />
                </div>

                {/* Amount & Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Gutschrift-Betrag Brutto (€) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={invoice.amountGross}
                        value={amountGross}
                        onChange={(e) => setAmountGross(parseFloat(e.target.value) || 0)}
                        required
                        className="metallic-input w-full pl-3 pr-8 py-2 text-xs font-black text-[#0e264b]"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-[#1e3a5f]/60">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Erstattungsart
                    </label>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value as any)}
                      className="metallic-input w-full px-3 py-2 text-xs font-medium text-[#0e264b]"
                    >
                      <option value="Bank">Banküberweisung an Kunden</option>
                      <option value="Bar">Barauszahlung (Kasse)</option>
                      <option value="Verrechnung">Verrechnung mit Kundenkonto</option>
                    </select>
                  </div>
                </div>

                {/* Tax Preview Calculation */}
                <div className="metallic-card border border-purple-200/80 rounded-2xl p-3.5 text-xs space-y-1.5">
                  <div className="font-bold text-[#0e264b] flex items-center justify-between">
                    <span>Steuerliche Aufteilung der Gutschrift:</span>
                    <span className="font-black text-purple-800">{invoice.taxType === 'standard_19' ? '19% MwSt.' : '§ 25a Differenzbesteuerung'}</span>
                  </div>
                  {isStandard19 ? (
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-[#1e3a5f] pt-1">
                      <div>Netto: <strong className="text-[#0e264b]">{netAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong></div>
                      <div>MwSt (19%): <strong className="text-[#0e264b]">{taxAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong></div>
                      <div className="text-right font-black text-purple-900">Brutto: {grossNum.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#1e3a5f]/80 font-medium">
                      * Keine separate Umsatzsteuer auszuweisen (§ 25a UStG). Gutschriftbetrag brutto = netto.
                    </div>
                  )}
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
                  className="flex items-center gap-1.5 px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-sm transition cursor-pointer active:scale-95"
                >
                  <FileBadge className="w-4 h-4 metallic-debossed-icon" />
                  <span>Gutschrift erstellen & verbuchen</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
