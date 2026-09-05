import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  Euro, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Users, 
  Landmark, 
  FolderArchive,
  ExternalLink,
  Tag,
  AlertTriangle,
  FileText,
  FileCheck,
  Pin
} from 'lucide-react';
import { CompanyDocument } from '../../../types';
import { COMPANY_DOCUMENT_CATALOGS } from '../../../data/companyDocumentsData';

interface CompanyDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CompanyDocument | null;
  onEdit: (doc: CompanyDocument) => void;
  onDelete: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

export const CompanyDocumentPreviewModal: React.FC<CompanyDocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onEdit,
  onDelete,
  onTogglePin
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !doc) return null;

  const catalogDef = COMPANY_DOCUMENT_CATALOGS.find(c => c.id === doc.category);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownload = () => {
    if (!doc.fileDataUrl) return;
    const link = window.document.createElement('a');
    link.href = doc.fileDataUrl;
    link.download = doc.fileName || 'Dokument.pdf';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!doc.fileDataUrl) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${doc.title}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; display: flex; justify-content: center; }
              img, iframe { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            ${doc.fileType.startsWith('image/') || doc.fileDataUrl.startsWith('data:image/')
              ? `<img src="${doc.fileDataUrl}" style="max-width:100%; max-height:95vh;" onload="window.print();" />`
              : `<iframe src="${doc.fileDataUrl}" style="width:100%; height:100vh; border:none;" onload="window.print();"></iframe>`
            }
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Expiration calculation
  const getExpirationStatus = () => {
    if (!doc.validUntil) {
      return { status: 'unbefristet', label: 'Unbefristet gültig', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDate = new Date(doc.validUntil);
    const diffTime = validDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        status: 'expired', 
        label: `Abgelaufen vor ${Math.abs(diffDays)} Tagen`, 
        color: 'bg-rose-50 text-rose-700 border-rose-200' 
      };
    } else if (diffDays <= 60) {
      return { 
        status: 'expiring', 
        label: `Läuft ab in ${diffDays} Tagen!`, 
        color: 'bg-amber-50 text-amber-800 border-amber-300 font-bold' 
      };
    } else {
      return { 
        status: 'valid', 
        label: `Gültig (noch ${diffDays} Tage)`, 
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
      };
    }
  };

  const expStatus = getExpirationStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                  {doc.title}
                </h2>
                {doc.isPinned && (
                  <span className="shrink-0 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Pin className="w-2.5 h-2.5 fill-current" />
                    <span>Angeheftet</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 font-medium truncate">
                {catalogDef?.titleDe} ({catalogDef?.titleAr}) • {doc.subcategory}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              title="Datei herunterladen"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Herunterladen</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="Drucken"
              className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Drucken</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(doc);
              }}
              title="Bearbeiten"
              className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Bearbeiten</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Möchten Sie dieses Dokument wirklich unwiderruflich aus dem Firmenarchiv löschen?')) {
                  onDelete(doc.id);
                  onClose();
                }
              }}
              title="Löschen"
              className="p-2 sm:px-3 sm:py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-rose-200"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Löschen</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view (Document Viewer on Left/Center, Metadata Sidebar on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Document Viewer Container */}
          <div className="lg:col-span-8 bg-slate-900/5 p-4 sm:p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto max-h-[50vh] lg:max-h-full">
            {doc.fileDataUrl ? (
              doc.fileType.startsWith('image/') || doc.fileDataUrl.startsWith('data:image/') ? (
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={doc.fileDataUrl}
                    alt={doc.title}
                    className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg border border-slate-200 bg-white"
                  />
                </div>
              ) : (
                <div className="w-full h-[65vh] rounded-2xl overflow-hidden shadow-lg border border-slate-300 bg-white">
                  <iframe
                    src={doc.fileDataUrl}
                    title={doc.title}
                    className="w-full h-full border-0"
                  />
                </div>
              )
            ) : (
              <div className="text-center p-8 space-y-3">
                <FileText className="w-16 h-16 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Keine visuelle Vorschau verfügbar</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Datei herunterladen ({doc.fileName})
                </button>
              </div>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className="lg:col-span-4 p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[40vh] lg:max-h-[78vh] bg-white">
            
            {/* Expiration Banner */}
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${expStatus.color}`}>
              {expStatus.status === 'expiring' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : expStatus.status === 'expired' ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-[11px] uppercase font-bold tracking-wider opacity-80">Gültigkeitsstatus</div>
                <div className="text-xs font-black">{expStatus.label}</div>
              </div>
            </div>

            {/* Document Details Group */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                Stammdaten des Dokuments
              </h3>

              {/* Reference Number */}
              {doc.referenceNumber && (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-600 block">Aktenzeichen / Vertrags-Nr.</span>
                    <span className="text-xs font-mono font-bold text-slate-900 truncate block">
                      {doc.referenceNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(doc.referenceNumber!, 'ref')}
                    className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition cursor-pointer shrink-0"
                    title="Kopieren"
                  >
                    {copiedField === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {/* Issuer / Partner */}
              {doc.issuer && (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-600 block">Partner / Aussteller / Versorger</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {doc.issuer}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(doc.issuer!, 'issuer')}
                    className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition cursor-pointer shrink-0"
                    title="Kopieren"
                  >
                    {copiedField === 'issuer' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-600 block">Dokumentendatum</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">
                    {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString('de-DE') : '-'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-600 block">Gültig bis</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">
                    {doc.validUntil ? new Date(doc.validUntil).toLocaleDateString('de-DE') : 'Unbefristet'}
                  </span>
                </div>
              </div>

              {/* Notice Period */}
              {doc.noticePeriod && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-600 block">Kündigungsfrist</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">
                    {doc.noticePeriod}
                  </span>
                </div>
              )}

              {/* Cost */}
              {doc.costAmount !== undefined && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 block">Regelmäßige Kosten</span>
                    <span className="text-sm font-black text-slate-900">
                      {doc.costAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 capitalize bg-slate-200/70 px-2 py-0.5 rounded-md">
                    {doc.costInterval || 'monatlich'}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            {doc.notes && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Notizen & Vermerke
                </h3>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                  {doc.notes}
                </p>
              </div>
            )}

            {/* Tags */}
            {doc.tags && doc.tags.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Tags & Kennzeichnungen
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* File Info */}
            <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Dateiname:</span>
                <span className="font-bold text-slate-800 truncate max-w-[180px]">{doc.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span>Dateigröße:</span>
                <span className="font-bold text-slate-800">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Hochgeladen am:</span>
                <span className="font-bold text-slate-800">{new Date(doc.uploadedAt).toLocaleDateString('de-DE')}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
