import React, { useState } from 'react';
import { 
  Send, 
  X, 
  Mail, 
  FileText, 
  CheckCircle2, 
  Paperclip, 
  Sparkles, 
  Building, 
  User, 
  Clock 
} from 'lucide-react';
import { Customer, OperationDocumentType, MerchantSettings } from '../../types';

interface EmailDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: OperationDocumentType;
  documentNumber: string;
  customer: Customer | null;
  manualCustomer: Partial<Customer> | null;
  merchantSettings: MerchantSettings;
  totalGross: number;
  onSentSuccess?: () => void;
}

export const EmailDocumentModal: React.FC<EmailDocumentModalProps> = ({
  isOpen,
  onClose,
  documentType,
  documentNumber,
  customer,
  manualCustomer,
  merchantSettings,
  totalGross,
  onSentSuccess
}) => {
  const activeCustomer = customer || manualCustomer;
  const initialRecipientEmail = activeCustomer?.email || '';
  const customerName = activeCustomer?.name || 
    (activeCustomer?.companyName || `${activeCustomer?.firstName || ''} ${activeCustomer?.lastName || ''}`.trim()) || 
    'Sehr geehrte Damen und Herren';

  const [toEmail, setToEmail] = useState(initialRecipientEmail);
  const [ccEmail, setCcEmail] = useState(merchantSettings.email || 'info@maxfleet-gruppe.de');
  const [subject, setSubject] = useState(() => {
    switch (documentType) {
      case 'angebot': return `Ihr Angebot ${documentNumber} – ${merchantSettings.companyName || 'MaxFleet Gruppe'}`;
      case 'rechnung': return `Rechnung ${documentNumber} – ${merchantSettings.companyName || 'MaxFleet Gruppe'}`;
      case 'e_rechnung': return `E-Rechnung (EN 16931) ${documentNumber} – ${merchantSettings.companyName || 'MaxFleet Gruppe'}`;
      case 'eu_export': return `EU-Export Rechnung ${documentNumber} – ${merchantSettings.companyName || 'MaxFleet Gruppe'}`;
      case 'export_drittland': return `Ausfuhr-Rechnung Drittland ${documentNumber} – ${merchantSettings.companyName || 'MaxFleet Gruppe'}`;
      case 'kaufvertrag': return `Kaufvertragsdokument ${documentNumber} – ${merchantSettings.companyName || 'MaxFleet Gruppe'}`;
      default: return `Dokument ${documentNumber} – ${merchantSettings.companyName || 'MaxFleet Gruppe'}`;
    }
  });

  const [message, setMessage] = useState(() => {
    return `Sehr geehrte(r) ${customerName},

anbei erhalten Sie Ihr Belegdokument ${documentNumber} über einen Gesamtbetrag in Höhe von ${totalGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR als PDF-Dokument im Anhang.

${documentType === 'e_rechnung' ? 'Hinweis: Für Ihre elektronische Buchhaltung ist die strukturierte EN-16931 XRechnung XML-Datei beigefügt.\n\n' : ''}Bei Rückfragen stehen wir Ihnen jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen,
${merchantSettings.responsiblePerson || 'Ihr Verkaufsteam'}
${merchantSettings.companyName || 'MaxFleet Autohandelsgruppe'}
${merchantSettings.phone || ''}
${merchantSettings.website || ''}`;
  });

  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!toEmail.trim()) return;
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      if (onSentSuccess) onSentSuccess();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-0 sm:my-1 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Dokument per E-Mail versenden
              </h3>
              <p className="text-xs text-slate-500">
                Direkter Versand mit PDF-Anhang {documentType === 'e_rechnung' ? '& eingebetteter XRechnung XML' : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-black text-slate-900">E-Mail erfolgreich versendet!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Dokument {documentNumber} wurde an <strong className="text-slate-700">{toEmail}</strong> gesendet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipient email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Empfänger E-Mail-Adresse *
              </label>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="kunde@domain.de"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* CC email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Kopie an (CC)
              </label>
              <input
                type="email"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                placeholder="buchhaltung@autohaus.de"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Betreffzeile *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nachrichtentext
              </label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-sans"
              />
            </div>

            {/* Attachments preview banner */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span>Anhänge:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-500" />
                  {documentNumber}.pdf
                </span>
                {documentType === 'e_rechnung' && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 font-mono font-bold text-blue-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    XRechnung-{documentNumber}.xml
                  </span>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || !toEmail.trim()}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Wird gesendet...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>E-Mail jetzt senden</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
