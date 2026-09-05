import React, { useState } from 'react';
import { 
  FileCode, 
  X, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Code
} from 'lucide-react';
import { downloadXRechnungFile } from '../../utils/eRechnungXmlGenerator';

interface ERechnungXmlViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  xmlContent: string;
  documentNumber: string;
}

export const ERechnungXmlViewerModal: React.FC<ERechnungXmlViewerModalProps> = ({
  isOpen,
  onClose,
  xmlContent,
  documentNumber
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadXRechnungFile(xmlContent, `XRechnung-${documentNumber}.xml`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-modal-container rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-600/60 space-y-5 my-0 sm:my-1 animate-in fade-in zoom-in-95 text-white max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5 metallic-debossed-icon" />
            </div>
            <div>
              <h3 className="font-black text-slate-100 text-base flex items-center gap-2">
                <span>E-Rechnung XML-Inspektor (EN 16931 / XRechnung 3.0)</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 metallic-debossed-icon" />
                  Valide CII
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Strukturierte elektronische Rechnungsdaten zur automatischen Verarbeitung in ERP- und Buchhaltungssystemen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        {/* XML Compliance Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 metallic-card rounded-xl">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">Norm & Schema</span>
            <span className="font-bold text-slate-200">EN 16931 / XRechnung 3.0</span>
          </div>
          <div className="p-3 metallic-card rounded-xl">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">Syntax</span>
            <span className="font-bold text-slate-200">UN/CEFACT CII (XML)</span>
          </div>
          <div className="p-3 metallic-card rounded-xl">
            <span className="text-[10px] text-blue-300 font-bold uppercase block">Einsatzbereich</span>
            <span className="font-bold text-slate-200">B2G & B2B Deutschland/EU</span>
          </div>
        </div>

        {/* XML Code Viewer */}
        <div className="relative">
          <pre className="p-4 bg-slate-950 text-emerald-300 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-96 leading-relaxed border border-slate-700 shadow-inner select-all">
            {xmlContent}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 metallic-btn-secondary px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer border"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 metallic-debossed-icon" />}
            <span>{copied ? 'Kopiert!' : 'XML kopieren'}</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 metallic-debossed-icon" />
            <span>Automatisch in den Beleg eingebettet</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="metallic-btn-secondary px-4 py-2 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Schließen
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="metallic-btn-primary px-5 py-2 text-slate-950 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 metallic-debossed-icon" />
              <span>XML-Datei herunterladen</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
