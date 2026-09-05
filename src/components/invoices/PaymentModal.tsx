import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Banknote, 
  Building2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { Invoice, InvoicePayment } from '../../types';
import { firebaseService } from '../../services/firebaseService';

interface PaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentSuccess: (updatedInvoice: Invoice) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, onClose, onPaymentSuccess }) => {
  const previousPaid = Number(invoice.amountPaid) || 0;
  const remainingAmount = Math.max(0, invoice.amountGross - previousPaid);

  const [amount, setAmount] = useState<number>(remainingAmount);
  const [paymentMethod, setPaymentMethod] = useState<'Barzahlung' | 'Banküberweisung' | 'Kartenzahlung' | 'Finanzierung' | 'Treuhand'>('Banküberweisung');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString('de-DE');
  });
  const [receiptNumber, setReceiptNumber] = useState<string>(() => {
    return paymentMethod === 'Barzahlung' 
      ? `KB-2026-${Math.floor(140 + Math.random() * 80)}`
      : `BK-2026-${Math.floor(80 + Math.random() * 80)}`;
  });
  const [notes, setNotes] = useState<string>('');
  const [registerInFinances, setRegisterInFinances] = useState<boolean>(true);

  // Success screen state
  const [savedPayment, setSavedPayment] = useState<{ updatedInvoice: Invoice; receiptNum: string } | null>(null);

  // Check for auto-fill parameters from Max AI or compound workflows
  useEffect(() => {
    try {
      const preAmount = localStorage.getItem('rechnungen_payment_amount');
      if (preAmount) {
        const parsed = parseFloat(preAmount);
        if (!isNaN(parsed) && parsed > 0) {
          setAmount(parsed);
        }
      }

      const preMethod = localStorage.getItem('rechnungen_payment_method');
      if (preMethod && ['Barzahlung', 'Banküberweisung', 'Kartenzahlung', 'Finanzierung', 'Treuhand'].includes(preMethod)) {
        handleMethodChange(preMethod as any);
      }

      const preDate = localStorage.getItem('rechnungen_payment_date');
      if (preDate) {
        setDate(preDate);
      }

      localStorage.removeItem('rechnungen_payment_amount');
      localStorage.removeItem('rechnungen_payment_method');
      localStorage.removeItem('rechnungen_payment_date');
    } catch {
      // ignore
    }
  }, []);

  const handleMethodChange = (newMethod: typeof paymentMethod) => {
    setPaymentMethod(newMethod);
    setReceiptNumber(newMethod === 'Barzahlung' 
      ? `KB-2026-${Math.floor(140 + Math.random() * 80)}`
      : `BK-2026-${Math.floor(80 + Math.random() * 80)}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Bitte geben Sie einen gültigen Zahlungsbetrag größer als 0 € ein.');
      return;
    }

    const result = firebaseService.recordInvoicePayment(
      invoice.id,
      {
        amount: Number(amount),
        paymentMethod,
        date,
        receiptNumber,
        notes: notes.trim() || undefined,
        recordedBy: 'M. Mustermann'
      },
      registerInFinances
    );

    if (result) {
      setSavedPayment({
        updatedInvoice: result.updatedInvoice,
        receiptNum: receiptNumber
      });
      onPaymentSuccess(result.updatedInvoice);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-modal-container rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-0 sm:my-1 max-h-[92vh] flex flex-col text-[#0e264b]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-300/70 flex items-center justify-between bg-gradient-to-b from-white/40 to-slate-200/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-sm">
              <Receipt className="w-5 h-5 text-[#0e264b] metallic-debossed-icon" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#0e264b] tracking-tight">Zahlung erfassen & buchen</h2>
              <p className="text-xs text-[#1e3a5f]/80 font-semibold">Rechnung #{invoice.invoiceNumber}</p>
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

        {/* Modal Body: Either Confirmation Receipt or Form */}
        {savedPayment ? (
          <div className="p-6 space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 metallic-debossed-icon" />
              </div>
              <h3 className="text-lg font-black text-[#0e264b]">Zahlungseingang erfolgreich verbucht</h3>
              <p className="text-xs text-[#1e3a5f]/80 max-w-md mx-auto">
                Der Betrag von <strong className="text-[#0e264b] font-black">{amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong> wurde für Beleg {invoice.invoiceNumber} registriert.
              </p>
            </div>

            {/* Visual Receipt Card */}
            <div className="metallic-card border border-slate-300/80 rounded-2xl p-4 text-xs space-y-3 font-sans">
              <div className="flex justify-between items-center border-b border-slate-300/70 pb-2">
                <span className="font-bold text-[#1e3a5f]">Quittungs- / Buchungsbeleg:</span>
                <span className="font-mono font-black text-blue-700">{savedPayment.receiptNum}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[#1e3a5f]">
                <div>Kunde: <strong className="text-[#0e264b] block font-bold">{invoice.customerName}</strong></div>
                <div>Zahlungsart: <strong className="text-[#0e264b] block font-bold">{paymentMethod}</strong></div>
                <div>Datum: <strong className="text-[#0e264b] block font-bold">{date}</strong></div>
                <div>Status Beleg: <strong className="text-emerald-700 block uppercase font-black">{savedPayment.updatedInvoice.status}</strong></div>
              </div>
              <div className="border-t border-slate-300/70 pt-2 flex justify-between items-center text-sm">
                <span className="font-bold text-[#0e264b]">Verbuchter Betrag:</span>
                <span className="font-mono font-black text-emerald-700 text-base">{amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
              </div>
              {registerInFinances && (
                <div className="text-[11px] bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-300/80 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0 metallic-debossed-icon text-emerald-700" />
                  <span>Automatisch in Finanzen / Kassenbuch ({paymentMethod === 'Barzahlung' ? 'Kasse' : 'Bankkonto'}) gebucht.</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-1.5 px-4 py-2.5 metallic-card-luminous border border-slate-300/70 hover:bg-white/60 text-[#1e3a5f] font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                <Printer className="w-4 h-4 metallic-debossed-icon" />
                <span>Quittung drucken</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs sm:text-sm rounded-xl shadow-sm transition cursor-pointer active:scale-95"
              >
                Fertigstellen
              </button>
            </div>

          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            
            {/* Invoice Summary Overview */}
            <div className="metallic-card border border-slate-300/80 rounded-2xl p-4 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[#1e3a5f]/70 font-semibold block">Gesamtbetrag:</span>
                <span className="font-mono font-black text-[#0e264b] text-sm">{invoice.amountGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div>
                <span className="text-[#1e3a5f]/70 font-semibold block">Bereits bezahlt:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{previousPaid.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div>
                <span className="text-[#1e3a5f]/70 font-semibold block">Offener Restbetrag:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">{remainingAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1e3a5f]">Zahlungsart wählen</label>
              <div className="grid grid-cols-3 gap-2">
                
                <button
                  type="button"
                  onClick={() => handleMethodChange('Banküberweisung')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                    paymentMethod === 'Banküberweisung'
                      ? 'metallic-btn-primary text-[#091a34] font-black shadow-xs'
                      : 'metallic-card-luminous border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b]'
                  }`}
                >
                  <Building2 className="w-5 h-5 mb-1 metallic-debossed-icon" />
                  <span>Banküberweisung</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange('Barzahlung')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                    paymentMethod === 'Barzahlung'
                      ? 'metallic-btn-primary text-[#091a34] font-black shadow-xs'
                      : 'metallic-card-luminous border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b]'
                  }`}
                >
                  <Banknote className="w-5 h-5 mb-1 metallic-debossed-icon" />
                  <span>Barzahlung</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange('Kartenzahlung')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                    paymentMethod === 'Kartenzahlung'
                      ? 'metallic-btn-primary text-[#091a34] font-black shadow-xs'
                      : 'metallic-card-luminous border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1 metallic-debossed-icon" />
                  <span>Kartenzahlung</span>
                </button>

              </div>
            </div>

            {/* Amount Field with Quick-Fill */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#1e3a5f]">Zahlungsbetrag (€)</label>
                {remainingAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(remainingAmount)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                  >
                    Vollen Restbetrag einsetzen ({remainingAmount.toLocaleString('de-DE')} €)
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="metallic-input w-full pl-3 pr-10 py-2.5 text-[#0e264b] font-black text-base"
                  required
                />
                <span className="absolute right-3.5 top-2.5 font-extrabold text-[#1e3a5f]/60">€</span>
              </div>
            </div>

            {/* Date & Receipt Number */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1e3a5f]">Zahlungsdatum</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none metallic-debossed-icon" />
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="TT.MM.JJJJ"
                    className="metallic-input w-full pl-9 pr-3 py-2 text-[#0e264b] font-medium text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1e3a5f]">Beleg- / Quittungs-Nr.</label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="metallic-input w-full px-3 py-2 text-[#0e264b] font-mono font-bold text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1e3a5f]">Bemerkung / Verwendungszweck (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="z.B. Baranzahlung bei Kaufvertragsabschluss..."
                className="metallic-input w-full px-3 py-2 text-[#0e264b] font-medium text-xs sm:text-sm"
              />
            </div>

            {/* Checkbox for Finance Sync */}
            <div className="p-3.5 metallic-card border border-slate-300/80 rounded-2xl">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#0e264b]">
                <input
                  type="checkbox"
                  checked={registerInFinances}
                  onChange={(e) => setRegisterInFinances(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
                <span>Automatisch in Finanzen / Kassenbuch (Konto {paymentMethod === 'Barzahlung' ? 'Kasse' : 'Bank'}) als Einnahme verbuchen</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-300/70">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 metallic-card-luminous border border-slate-300/70 hover:bg-white/60 text-[#1e3a5f] font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Abbrechen
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs sm:text-sm rounded-xl shadow-sm transition cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 metallic-debossed-icon" />
                <span>Zahlung verbuchen</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
