import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Bell, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Printer, 
  Download, 
  AlertOctagon, 
  AlertTriangle,
  Scale,
  Send,
  FileText,
  Clock
} from 'lucide-react';
import { Invoice, MerchantSettings } from '../../types';
import { firebaseService } from '../../services/firebaseService';

interface MahnungModalProps {
  invoice: Invoice;
  merchantSettings?: MerchantSettings;
  onClose: () => void;
  onMahnungSuccess: (updatedInvoice: Invoice) => void;
}

export const MahnungModal: React.FC<MahnungModalProps> = ({ 
  invoice, 
  merchantSettings: propMerchantSettings, 
  onClose, 
  onMahnungSuccess 
}) => {
  const merchant = propMerchantSettings || firebaseService.getMerchantSettings();
  const previousPaid = Number(invoice.amountPaid) || 0;
  const openBalance = Math.max(0, invoice.amountGross - previousPaid);

  const [mahnstufe, setMahnstufe] = useState<1 | 2>(invoice.mahnstufe === 1 ? 2 : 1);
  const [mahnDate, setMahnDate] = useState<string>(() => new Date().toLocaleDateString('de-DE'));
  
  // Calculate new due date (7 days for 1st, 5 days for 2nd)
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('de-DE');
  });

  const [fee, setFee] = useState<number>(() => (mahnstufe === 2 ? 5.00 : 0.00));
  const [interest, setInterest] = useState<number>(0.00);
  const [customText, setCustomText] = useState<string>('');
  
  // View mode: 'editor' | 'preview'
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [savedSuccess, setSavedSuccess] = useState<Invoice | null>(null);

  const handleMahnstufeChange = (lvl: 1 | 2) => {
    setMahnstufe(lvl);
    if (lvl === 1) {
      setFee(0.00);
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDueDate(d.toLocaleDateString('de-DE'));
    } else {
      setFee(5.00);
      const d = new Date();
      d.setDate(d.getDate() + 5);
      setDueDate(d.toLocaleDateString('de-DE'));
    }
  };

  const totalClaim = openBalance + (Number(fee) || 0) + (Number(interest) || 0);

  const handleSave = () => {
    const updated = firebaseService.addInvoiceDunning(invoice.id, {
      level: mahnstufe,
      date: mahnDate,
      dueDate,
      fee: Number(fee) || 0,
      interest: Number(interest) || 0,
      totalClaim,
      notes: customText.trim() || undefined
    });

    if (updated) {
      setSavedSuccess(updated);
      onMahnungSuccess(updated);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-modal-container rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col my-0 sm:my-1 text-[#0e264b]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-300/70 flex items-center justify-between bg-gradient-to-b from-white/40 to-slate-200/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center shadow-sm">
              <Mail className="w-5 h-5 text-[#0e264b] metallic-debossed-icon" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#0e264b] tracking-tight">
                {mahnstufe === 1 ? '1. Mahnung (Freundliche Zahlungserinnerung)' : '2. Mahnung (Förmliche Mahnung mit Verzug)'}
              </h2>
              <p className="text-xs text-[#1e3a5f]/80 font-semibold">Rechnung #{invoice.invoiceNumber} &bull; Offener Betrag: {openBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
              className="px-3.5 py-1.5 metallic-card-luminous border border-slate-300/70 hover:bg-white/60 text-[#1e3a5f] rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {viewMode === 'editor' ? 'A4 Brief Vorschau' : 'Bearbeiten'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-[#0e264b] hover:bg-slate-200/50 transition cursor-pointer"
            >
              <X className="w-5 h-5 metallic-debossed-icon" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {savedSuccess ? (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 metallic-debossed-icon" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0e264b]">
                  {mahnstufe === 1 ? '1. Mahnung / Zahlungserinnerung' : '2. Mahnung'} erfolgreich erfasst
                </h3>
                <p className="text-xs text-[#1e3a5f]/80 max-w-md mx-auto mt-1">
                  Der Mahnstatus für Beleg <strong className="text-[#0e264b] font-bold">{invoice.invoiceNumber}</strong> wurde aktualisiert (Mahnstufe {mahnstufe}).
                </p>
              </div>

              {/* Dunning Letter A4 Box for instant printing */}
              <div className="metallic-card border border-slate-300/80 rounded-2xl p-6 text-left text-xs font-sans space-y-4 max-w-xl mx-auto shadow-sm">
                <div className="flex justify-between items-start border-b border-slate-300/70 pb-3">
                  <div>
                    <div className="font-black text-[#0e264b] text-sm">{merchant.companyName || 'MaxFleet Autohandel'}</div>
                    <div className="text-[11px] text-[#1e3a5f]/70">{merchant.street}, {merchant.postalCode} {merchant.city}</div>
                  </div>
                  <div className="text-right text-[11px] text-[#1e3a5f]/70">
                    <div>Datum: {mahnDate}</div>
                    <div className="font-bold text-[#0e264b]">Mahnung zu #{invoice.invoiceNumber}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[#1e3a5f]/70 text-[10px] uppercase font-bold">Empfänger:</div>
                  <div className="font-black text-[#0e264b]">{invoice.customerName}</div>
                  <div className="text-[#1e3a5f] text-xs font-medium">{invoice.customerStreet || 'Musterstraße 12'}, {invoice.customerPostalCode || '10115'} {invoice.customerCity || 'Berlin'}</div>
                </div>

                <div className="border-t border-slate-300/70 pt-3 space-y-2">
                  <div className="font-black text-[#0e264b] text-sm">
                    {mahnstufe === 1 ? 'Zahlungserinnerung / 1. Mahnung' : '2. Ausdrückliche Mahnung mit Zahlungsfrist'}
                  </div>
                  <p className="text-[#1e3a5f] leading-relaxed text-xs">
                    {mahnstufe === 1
                      ? `Sehr geehrte Damen und Herren, sicherlich ist es Ihrer Aufmerksamkeit entgangen, dass die Rechnung Nr. ${invoice.invoiceNumber} über ${invoice.vehicleTitle} noch zur Zahlung offen ist. Bitte überweisen Sie den fälligen Betrag bis zum ${dueDate}.`
                      : `Sehr geehrte Damen und Herren, trotz unserer bisherigen Zahlungserinnerung konnten wir keinen Zahlungseingang feststellen. Wir fordern Sie hiermit letztmalig auf, den Gesamtbetrag von ${totalClaim.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € bis zum ${dueDate} auf unser Konto zu überweisen.`
                    }
                  </p>
                </div>

                <div className="metallic-card-luminous p-3.5 rounded-xl border border-slate-300/70 text-xs space-y-1">
                  <div className="flex justify-between text-[#1e3a5f]">
                    <span>Hauptforderung (Rechnung {invoice.invoiceNumber}):</span>
                    <span className="font-mono font-bold text-[#0e264b]">{openBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                  </div>
                  {fee > 0 && (
                    <div className="flex justify-between text-[#1e3a5f]">
                      <span>Mahngebühren:</span>
                      <span className="font-mono font-bold text-[#0e264b]">{fee.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                    </div>
                  )}
                  {interest > 0 && (
                    <div className="flex justify-between text-[#1e3a5f]">
                      <span>Verzugszinsen:</span>
                      <span className="font-mono font-bold text-[#0e264b]">{interest.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#0e264b] font-black border-t border-slate-300/70 pt-1.5 text-sm">
                    <span>Gesamtforderung:</span>
                    <span className="font-mono text-emerald-700">{totalClaim.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#1e3a5f]/80 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/80">
                  Bankverbindung: {merchant.bankName || 'Commerzbank'} &bull; IBAN: {merchant.iban || 'DE89 1004 0000 0123 4567 89'} &bull; BIC: {merchant.bic || 'COBADEFFXXX'} &bull; Verwendungszweck: {invoice.invoiceNumber}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2.5 metallic-card-luminous border border-slate-300/70 hover:bg-white/60 text-[#1e3a5f] font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 metallic-debossed-icon" />
                  <span>Mahnung A4 Drucken</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-sm transition cursor-pointer active:scale-95"
                >
                  Schließen
                </button>
              </div>
            </div>
          ) : viewMode === 'preview' ? (
            /* Full A4 Letter Mockup Preview */
            <div className="space-y-4 font-sans">
              <div className="metallic-card border border-slate-300/80 rounded-2xl p-6 sm:p-8 text-xs space-y-6 shadow-sm">
                {/* Dealer Header */}
                <div className="flex justify-between items-start border-b border-slate-300/70 pb-4">
                  <div>
                    <div className="font-black text-lg text-[#0e264b]">{merchant.companyName || 'MaxFleet Autohandel GmbH'}</div>
                    <div className="text-[#1e3a5f]/80 text-xs">{merchant.street} &bull; {merchant.postalCode} {merchant.city}</div>
                    <div className="text-[#1e3a5f]/70 text-[11px]">Tel: {merchant.phone || '+49 30 12345678'} &bull; Email: {merchant.email || 'buchhaltung@maxfleet.de'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-sm text-[#0e264b]">
                      {mahnstufe === 1 ? '1. ZAHLUNGSERINNERUNG' : '2. MAHNUNG'}
                    </div>
                    <div className="text-[#1e3a5f]/70 text-xs mt-1">Datum: {mahnDate}</div>
                    <div className="text-rose-700 text-xs font-black">Frist bis: {dueDate}</div>
                  </div>
                </div>

                {/* Recipient */}
                <div className="p-3.5 metallic-card-luminous rounded-xl border border-slate-300/70 max-w-sm">
                  <div className="text-[10px] text-[#1e3a5f]/70 font-bold uppercase">Empfänger:</div>
                  <div className="font-black text-[#0e264b] mt-0.5">{invoice.customerName}</div>
                  <div className="text-[#1e3a5f] text-xs font-medium">{invoice.customerStreet || 'Musterweg 4'}, {invoice.customerPostalCode || '10115'} {invoice.customerCity || 'Berlin'}</div>
                </div>

                {/* Subject & Body */}
                <div className="space-y-3">
                  <div className="font-black text-sm text-[#0e264b] border-b border-slate-300/70 pb-2">
                    {mahnstufe === 1 
                      ? `Zahlungserinnerung zur Rechnung ${invoice.invoiceNumber}`
                      : `2. Mahnung zur Rechnung ${invoice.invoiceNumber} – Letzte Zahlungsaufforderung`
                    }
                  </div>
                  <p className="text-[#1e3a5f] leading-relaxed">
                    {mahnstufe === 1
                      ? `Sehr geehrte Damen und Herren,\n\nbei der Durchsicht unserer Buchhaltung haben wir festgestellt, dass der Betrag aus der Rechnung Nr. ${invoice.invoiceNumber} vom ${invoice.date} über das Fahrzeug ${invoice.vehicleTitle} bisher noch nicht beglichen wurde.\n\nSollte sich Ihre Zahlung mit diesem Schreiben gekreuzt haben, betrachten Sie diesen Hinweis bitte als gegenstandslos. Andernfalls bitten wir Sie höflich, den fälligen Betrag bis spätestens ${dueDate} auf unser unten genanntes Geschäftskonto zu überweisen.`
                      : `Sehr geehrte Damen und Herren,\n\ntrotz unserer vorangegangenen Zahlungserinnerung konnten wir bis zum heutigen Tag keinen Zahlungseingang zur Rechnung Nr. ${invoice.invoiceNumber} feststellen.\n\nWir fordern Sie hiermit nachdrücklich auf, den nachfolgend aufgeführten Gesamtbetrag inklusive Mahnkosten bis spätestens zum ${dueDate} auf unser Bankkonto zu überweisen. Bei Nichtzahlung behalten wir uns vor, ohne weitere Vorankündigung ein gerichtliches Mahnverfahren einzuleiten oder ein Inkassounternehmen zu beauftragen.`
                    }
                  </p>
                  {customText.trim() && (
                    <div className="p-3 metallic-card-luminous rounded-xl border border-slate-300/70 text-[#1e3a5f] italic text-xs">
                      {customText}
                    </div>
                  )}
                </div>

                {/* Calculation Breakdown */}
                <div className="metallic-card-luminous rounded-2xl border border-slate-300/70 p-4 space-y-2">
                  <div className="font-bold text-[#0e264b] border-b border-slate-300/70 pb-2 text-xs">
                    Forderungsaufstellung:
                  </div>
                  <div className="flex justify-between text-[#1e3a5f]">
                    <span>Offener Rechnungsbetrag (#{invoice.invoiceNumber}):</span>
                    <span className="font-mono font-bold text-[#0e264b]">{openBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                  </div>
                  {fee > 0 && (
                    <div className="flex justify-between text-[#1e3a5f]">
                      <span>Pauschale Mahngebühr:</span>
                      <span className="font-mono font-bold text-[#0e264b]">{fee.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                    </div>
                  )}
                  {interest > 0 && (
                    <div className="flex justify-between text-[#1e3a5f]">
                      <span>Verzugszinsen (§ 288 BGB):</span>
                      <span className="font-mono font-bold text-[#0e264b]">{interest.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#0e264b] font-black text-sm border-t border-slate-300/70 pt-2">
                    <span>Gesamtforderung zum {mahnDate}:</span>
                    <span className="font-mono text-rose-700 font-black">{totalClaim.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                  </div>
                </div>

                {/* Bank footer */}
                <div className="p-3.5 metallic-card-luminous rounded-xl border border-slate-300/70 text-[11px] text-[#1e3a5f]/80 grid grid-cols-2 gap-2">
                  <div>Bank: {merchant.bankName || 'Commerzbank'} &bull; IBAN: {merchant.iban || 'DE89 1004 0000 0123 4567 89'}</div>
                  <div className="text-right">BIC: {merchant.bic || 'COBADEFFXXX'} &bull; Verw.-Zweck: {invoice.invoiceNumber}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className="px-4 py-2.5 metallic-card-luminous border border-slate-300/70 hover:bg-white/60 text-[#1e3a5f] font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Zurück zum Editor
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2.5 metallic-card-luminous border border-slate-300/70 hover:bg-white/60 text-[#1e3a5f] font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4 metallic-debossed-icon" />
                    <span>Drucken</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-sm transition cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4 metallic-debossed-icon" />
                    <span>Mahnung registrieren & speichern</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Dunning Config Form */
            <div className="space-y-5">
              
              {/* Mahnstufe Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleMahnstufeChange(1)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    mahnstufe === 1
                      ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                      : 'metallic-card-luminous border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider">1. Mahnung</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100/90 text-blue-900 border border-blue-200">
                      Freundlich
                    </span>
                  </div>
                  <div className="text-xs font-bold mt-1.5">Zahlungserinnerung</div>
                  <div className="text-[11px] opacity-80 mt-1">
                    Höflicher Ton, keine Mahngebühren, 7 Tage Zahlungsfrist.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleMahnstufeChange(2)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    mahnstufe === 2
                      ? 'metallic-btn-primary text-[#091a34] shadow-sm'
                      : 'metallic-card-luminous border-slate-300/70 text-[#1e3a5f] hover:text-[#0e264b]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider">2. Mahnung</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Ausdrücklich
                    </span>
                  </div>
                  <div className="text-xs font-bold mt-1.5">Förmliche Mahnung</div>
                  <div className="text-[11px] opacity-80 mt-1">
                    Inkl. 5,00 € Mahngebühr, 5 Tage Frist, Hinweis auf Rechtsweg/Inkasso.
                  </div>
                </button>
              </div>

              {/* Dunning Configuration Fields */}
              <div className="space-y-4 metallic-card border border-slate-300/80 rounded-2xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Mahndatum <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none metallic-debossed-icon" />
                      <input
                        type="text"
                        value={mahnDate}
                        onChange={(e) => setMahnDate(e.target.value)}
                        placeholder="TT.MM.JJJJ"
                        className="metallic-input w-full pl-9 pr-3 py-2 text-xs font-medium text-[#0e264b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Neue Zahlungsfrist bis <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none metallic-debossed-icon" />
                      <input
                        type="text"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        placeholder="TT.MM.JJJJ"
                        className="metallic-input w-full pl-9 pr-3 py-2 text-xs font-black text-rose-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Mahngebühr (€)
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={fee}
                      onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                      className="metallic-input w-full px-3 py-2 text-xs font-black text-[#0e264b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                      Verzugszinsen (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={interest}
                      onChange={(e) => setInterest(parseFloat(e.target.value) || 0)}
                      className="metallic-input w-full px-3 py-2 text-xs font-black text-[#0e264b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1e3a5f] mb-1">
                    Individueller Zusatztext (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Z. B. Bei Rückfragen zu dieser Rechnung wenden Sie sich bitte direkt an Herrn Mustermann unter Tel. 030/123456."
                    className="metallic-input w-full px-3 py-2 text-xs font-medium text-[#0e264b]"
                  />
                </div>
              </div>

              {/* Total Claim Banner */}
              <div className="metallic-card border border-slate-300/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1e3a5f]">Gesamte Mahnforderung:</div>
                  <div className="text-[11px] text-[#1e3a5f]/70">Hauptforderung + Gebühren + Zinsen</div>
                </div>
                <div className="font-mono font-black text-xl text-[#0e264b]">
                  {totalClaim.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-300/70">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 metallic-card-luminous border border-slate-300/70 hover:bg-white/60 text-[#1e3a5f] font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Abbrechen
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className="flex items-center gap-1.5 px-4 py-2.5 metallic-card-luminous border border-slate-300/70 hover:bg-white/60 text-[#1e3a5f] font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 metallic-debossed-icon" />
                    <span>A4 Vorschau</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-5 py-2.5 metallic-btn-primary text-[#091a34] font-black text-xs rounded-xl shadow-sm transition cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4 metallic-debossed-icon" />
                    <span>Mahnung erfassen & speichern</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
