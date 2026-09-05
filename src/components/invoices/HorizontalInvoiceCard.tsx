import React from 'react';
import { 
  Eye, 
  CreditCard, 
  FileMinus, 
  Ban, 
  Bell, 
  CheckCircle2, 
  Clock, 
  FileX2, 
  User, 
  Car, 
  Calendar,
  AlertTriangle,
  FileText,
  BadgePercent,
  Globe2,
  Receipt
} from 'lucide-react';
import { Invoice, TaxType } from '../../types';

interface HorizontalInvoiceCardProps {
  invoice: Invoice;
  onOpenPreview: (invoice: Invoice) => void;
  onOpenPayment: (invoice: Invoice) => void;
  onOpenGutschrift: (invoice: Invoice) => void;
  onOpenStorno: (invoice: Invoice) => void;
  onOpenMahnung: (invoice: Invoice) => void;
}

export const HorizontalInvoiceCard: React.FC<HorizontalInvoiceCardProps> = ({
  invoice,
  onOpenPreview,
  onOpenPayment,
  onOpenGutschrift,
  onOpenStorno,
  onOpenMahnung,
}) => {
  const isStorno = invoice.status === 'storniert' || invoice.invoiceCategory === 'storno' || invoice.invoiceNumber.startsWith('STORNO');
  const isPaid = invoice.status === 'bezahlt';
  const isPartial = invoice.status === 'teilbezahlt';
  const isOpen = invoice.status === 'offen';
  
  const paidAmount = Number(invoice.amountPaid) || 0;
  const remainingBalance = Math.max(0, invoice.amountGross - paidAmount);

  // Document Type Label & Style
  const getDocumentTypeInfo = () => {
    if (isStorno) {
      return {
        label: 'Stornorechnung / Korrektur',
        bg: 'bg-rose-950/40 text-rose-300 border-rose-500/30',
        icon: <FileX2 className="w-3 h-3 text-rose-400 shrink-0" />
      };
    }
    if (invoice.invoiceCategory === 'gutschrift' || invoice.invoiceNumber.startsWith('GS-')) {
      return {
        label: 'Gutschrift',
        bg: 'bg-purple-950/40 text-purple-300 border-purple-500/30',
        icon: <FileMinus className="w-3 h-3 text-purple-400 shrink-0" />
      };
    }
    if (invoice.invoiceCategory === 'eu_export' || invoice.documentType === 'eu_export') {
      return {
        label: 'EU-Export (steuerfrei § 4 Nr. 1b)',
        bg: 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30',
        icon: <Globe2 className="w-3 h-3 text-indigo-400 shrink-0" />
      };
    }
    if (invoice.invoiceCategory === 'export_drittland' || invoice.documentType === 'export_drittland') {
      return {
        label: 'Export Drittland (steuerfrei)',
        bg: 'bg-sky-950/40 text-sky-300 border-sky-500/30',
        icon: <Globe2 className="w-3 h-3 text-sky-400 shrink-0" />
      };
    }
    if (invoice.taxType === 'diff_25a') {
      return {
        label: '§ 25a Differenzbesteuerung',
        bg: 'bg-slate-800 text-slate-200 border-white/20',
        icon: <BadgePercent className="w-3 h-3 text-slate-300 shrink-0" />
      };
    }
    if (invoice.taxType === 'standard_19') {
      return {
        label: '19% Regelbesteuerung',
        bg: 'bg-slate-800 text-emerald-300 border-emerald-500/30',
        icon: <Receipt className="w-3 h-3 text-emerald-400 shrink-0" />
      };
    }
    if (invoice.taxType === 'barverkauf') {
      return {
        label: 'Barverkaufsbeleg / Quittung',
        bg: 'bg-slate-800 text-slate-200 border-white/20',
        icon: <Receipt className="w-3 h-3 text-slate-300 shrink-0" />
      };
    }
    return {
      label: 'Rechnung',
      bg: 'bg-slate-800 text-slate-200 border-white/10',
      icon: <FileText className="w-3 h-3 text-slate-400 shrink-0" />
    };
  };

  const docTypeInfo = getDocumentTypeInfo();

  const renderStatusBadge = () => {
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/40">
          <span className="w-2 h-2 rounded-full jewel-emerald" />
          <span>Bezahlt</span>
        </span>
      );
    }
    if (isPartial) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/40">
          <span className="w-2 h-2 rounded-full jewel-amber" />
          <span>Teilbezahlt</span>
        </span>
      );
    }
    if (isStorno) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/90 text-rose-300 border border-rose-500/40">
          <span className="w-2 h-2 rounded-full jewel-red" />
          <span>Storniert</span>
        </span>
      );
    }
    // Offen
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/90 text-emerald-400 border border-emerald-500/30">
        <span className="w-2 h-2 rounded-full jewel-amber" />
        <span>Offen</span>
        {invoice.mahnstufe ? (
          <span className="ml-0.5 px-1 py-0.2 rounded bg-rose-500 text-white text-[9px] font-black">
            M{invoice.mahnstufe}
          </span>
        ) : null}
      </span>
    );
  };

  return (
    <div
      id={`invoice-card-${invoice.id}`}
      onClick={() => onOpenPreview(invoice)}
      className="group relative metallic-card-luminous rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-4 sm:p-5 shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:border-slate-500/60 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 active:translate-y-0 text-white"
    >
      {/* Status accent bar */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2 ${
          isPaid 
            ? 'bg-emerald-500' 
            : isPartial 
              ? 'bg-emerald-500' 
              : isStorno 
                ? 'bg-rose-500' 
                : 'bg-emerald-500/70'
        }`} 
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pl-1 sm:pl-2">
        
        {/* Main 3 Content Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 flex-1 min-w-0">
          
          {/* 1. Left side: Invoice Number & Date */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-mono font-black text-sm sm:text-base tracking-tight truncate ${
                isStorno ? 'text-rose-400' : 'text-white group-hover:text-slate-200 transition-colors'
              }`}>
                {invoice.invoiceNumber}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 metallic-debossed-icon" />
              <span>Datum: {invoice.date}</span>
            </div>
            {invoice.dueDate && (
              <div className="text-[11px] text-slate-400 mt-0.5">
                Fällig: <span className="font-semibold text-slate-200">{invoice.dueDate}</span>
              </div>
            )}
          </div>

          {/* 2. Customer: Customer name & type */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0 metallic-debossed-icon" />
              <span className="font-bold text-white text-sm truncate" title={invoice.customerName}>
                {invoice.customerName}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1 truncate">
              {invoice.customerCity ? (
                <span>{invoice.customerPostalCode ? `${invoice.customerPostalCode} ` : ''}{invoice.customerCity}</span>
              ) : (
                <span className="text-slate-400">Zahlung: {invoice.paymentMethod}</span>
              )}
            </div>
            {invoice.customerType && (
              <div className="mt-0.5">
                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700/80">
                  {invoice.customerType === 'B2B' ? 'Geschäftskunde (B2B)' : 'Privatkunde (B2C)'}
                </span>
              </div>
            )}
          </div>

          {/* 3. Vehicle / Document Type */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border truncate max-w-full ${docTypeInfo.bg}`}>
                {docTypeInfo.icon}
                <span className="truncate">{docTypeInfo.label}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
              <Car className="w-3.5 h-3.5 text-slate-400 shrink-0 metallic-debossed-icon" />
              <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate" title={invoice.vehicleTitle}>
                {invoice.vehicleTitle || 'Fahrzeugbeleg'}
              </span>
            </div>
            {invoice.vin && (
              <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                FIN: {invoice.vin}
              </div>
            )}
          </div>

        </div>

        {/* 4. Right side: Amount (Betrag) + Status & Quick Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0 shrink-0">
          
          {/* Amount and Status details */}
          <div className="text-left lg:text-right">
            <div className="flex items-center lg:justify-end gap-2">
              <div className={`text-lg sm:text-xl font-black font-mono tracking-tight ${
                isPaid ? 'text-white' : isPartial ? 'text-emerald-400' : isStorno ? 'text-rose-400' : 'text-white'
              }`}>
                {invoice.amountGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </div>
              <div className="block lg:hidden">
                {renderStatusBadge()}
              </div>
            </div>
            <div className="hidden lg:block mt-1">
              {renderStatusBadge()}
            </div>
            {remainingBalance > 0 && !isStorno && isPartial && (
              <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                Rest: {remainingBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </div>
            )}
            {invoice.taxType === 'standard_19' && !isStorno && (
              <div className="text-[10px] text-slate-400 mt-0.5">
                Netto: {invoice.amountNet.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </div>
            )}
          </div>

          {/* Quick Actions Toolbar */}
          <div 
            className="flex items-center gap-1.5 sm:gap-2 transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* 1. Vorschau: Eye icon */}
            <button
              type="button"
              onClick={() => onOpenPreview(invoice)}
              className="p-2 sm:p-2.5 metallic-btn-secondary text-slate-200 rounded-xl font-bold transition shadow-xs cursor-pointer flex items-center justify-center group/btn active:scale-95"
              title="Vorschau: Vollständige A4 PDF Rechnung öffnen"
            >
              <Eye className="w-4 h-4 transition-transform group-hover/btn:scale-110 metallic-debossed-icon" />
            </button>

            {/* 2. Zahlung +: Plus Euro icon */}
            {!isStorno && !isPaid && (
              <button
                type="button"
                onClick={() => onOpenPayment(invoice)}
                className="px-2 py-1.5 sm:px-2.5 sm:py-2 metallic-btn-primary rounded-xl font-bold transition shadow-xs cursor-pointer flex items-center gap-1 group/btn active:scale-95"
                title="Zahlung + : Zahlungseingang erfassen & Quittung drucken"
              >
                <CreditCard className="w-4 h-4 transition-transform group-hover/btn:scale-110 metallic-debossed-icon" />
                <span className="text-xs font-black">+€</span>
              </button>
            )}

            {/* 3. Gutschrift: Credit note icon */}
            {!isStorno && (
              <button
                type="button"
                onClick={() => onOpenGutschrift(invoice)}
                className="p-2 sm:p-2.5 bg-purple-950/60 hover:bg-purple-600 text-purple-200 rounded-xl font-bold transition shadow-xs border border-purple-500/40 cursor-pointer flex items-center justify-center group/btn active:scale-95"
                title="Gutschrift: Rechnungskorrektur erstellen"
              >
                <FileMinus className="w-4 h-4 transition-transform group-hover/btn:scale-110 metallic-debossed-icon" />
              </button>
            )}

            {/* 4. Mahnung: Warning / reminder icon */}
            {!isStorno && !isPaid && (
              <button
                type="button"
                onClick={() => onOpenMahnung(invoice)}
                className="p-2 sm:p-2.5 bg-emerald-950/60 hover:bg-emerald-600 text-emerald-200 rounded-xl font-bold transition shadow-xs border border-emerald-500/40 cursor-pointer flex items-center justify-center group/btn active:scale-95"
                title="Mahnung: Zahlungserinnerung / Mahnschreiben generieren"
              >
                <Bell className="w-4 h-4 transition-transform group-hover/btn:scale-110 metallic-debossed-icon" />
              </button>
            )}

            {/* 5. Storno: Cancellation icon */}
            {!isStorno && (
              <button
                type="button"
                onClick={() => onOpenStorno(invoice)}
                className="p-2 sm:p-2.5 bg-rose-950/60 hover:bg-rose-600 text-rose-200 rounded-xl font-bold transition shadow-xs border border-rose-500/40 cursor-pointer flex items-center justify-center group/btn active:scale-95"
                title="Storno: GoBD-konforme Rechnungsstornierung"
              >
                <Ban className="w-4 h-4 transition-transform group-hover/btn:scale-110 metallic-debossed-icon" />
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
