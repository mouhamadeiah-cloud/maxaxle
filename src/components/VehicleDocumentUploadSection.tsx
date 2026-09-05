import React, { useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Image as ImageIcon, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Plus,
  X
} from 'lucide-react';
import { VehicleDocCategory, VehicleDocumentItem } from '../types';

export interface VehicleDocumentUploadSectionProps {
  documents: VehicleDocumentItem[];
  onChangeDocuments: (docs: VehicleDocumentItem[]) => void;
  maxFiles?: number;
}

export const CATEGORY_DEFINITIONS: { 
  id: VehicleDocCategory; 
  title: string; 
  subtitle: string; 
  required?: boolean;
  color: string;
}[] = [
  {
    id: 'zulassung_1',
    title: 'Zulassungsbescheinigung Teil I',
    subtitle: 'Fahrzeugschein (Vorder- & Rückseite)',
    color: 'emerald'
  },
  {
    id: 'zulassung_2',
    title: 'Zulassungsbescheinigung Teil II',
    subtitle: 'Fahrzeugbrief / Eigentumsnachweis',
    color: 'blue'
  },
  {
    id: 'tuev_bericht',
    title: 'TÜV-Bericht (HU / AU)',
    subtitle: 'Aktueller Prüfbericht der Hauptuntersuchung',
    color: 'indigo'
  },
  {
    id: 'kaufvertrag',
    title: 'Kaufvertrag / Einkaufsrechnung',
    subtitle: 'Einkaufsbeleg, B2B-Rechnung oder Ankaufsschein',
    color: 'amber'
  },
  {
    id: 'sonstiges',
    title: 'Sonstiges',
    subtitle: 'Serviceheft, CoC-Papier, Garantie oder Gutachten',
    color: 'slate'
  }
];

export const VehicleDocumentUploadSection: React.FC<VehicleDocumentUploadSectionProps> = ({
  documents,
  onChangeDocuments,
  maxFiles = 5
}) => {
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<VehicleDocumentItem | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileUpload = (category: VehicleDocCategory, file: File) => {
    setUploadError(null);

    // Validate limit
    if (documents.length >= maxFiles && !documents.some(d => d.category === category)) {
      setUploadError(`Maximal ${maxFiles} Dokumente oder PDF-Dateien erlaubt.`);
      return;
    }

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Die Datei überschreitet die maximale Größe von 10 MB.');
      return;
    }

    // Validate type
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);

    if (!isPdf && !isImage) {
      setUploadError('Bitte nur PDF-Dokumente oder Bilddateien (JPG, PNG, WebP) hochladen.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target?.result as string;
      const catDef = CATEGORY_DEFINITIONS.find(c => c.id === category);

      const newDoc: VehicleDocumentItem = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        category,
        categoryLabel: catDef ? catDef.title : 'Dokument',
        name: file.name,
        type: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        size: formatFileSize(file.size),
        fileData,
        uploadedAt: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      // Replace existing doc in same category or append
      const existingIdx = documents.findIndex(d => d.category === category);
      let updated: VehicleDocumentItem[];
      if (existingIdx >= 0) {
        updated = [...documents];
        updated[existingIdx] = newDoc;
      } else {
        updated = [...documents, newDoc];
      }

      onChangeDocuments(updated);
    };

    reader.onerror = () => {
      setUploadError('Fehler beim Lesen der Datei. Bitte erneut versuchen.');
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (id: string) => {
    onChangeDocuments(documents.filter(d => d.id !== id));
  };

  const handleDownload = (doc: VehicleDocumentItem) => {
    if (!doc.fileData) return;
    const a = document.createElement('a');
    a.href = doc.fileData;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      {/* Header with counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-300/60">
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-700" />
            <span>Fahrzeugdokumente & PDF-Upload (max. {maxFiles} Dateien)</span>
          </h4>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Laden Sie Fahrzeugschein, Fahrzeugbrief, TÜV-Bericht, Kaufvertrag oder sonstige Nachweise als PDF oder Bild hoch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
            documents.length === maxFiles 
              ? 'bg-emerald-100/70 text-emerald-950 border-emerald-400' 
              : documents.length > 0
              ? 'metallic-node text-slate-900 border-white/40'
              : 'metallic-card text-slate-700 border-white/40'
          }`}>
            {documents.length} von {maxFiles} Dokumenten
          </span>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-100 text-rose-950 border border-rose-300 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-600 hover:text-rose-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5 Categorized Upload Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {CATEGORY_DEFINITIONS.map((cat, idx) => {
          const doc = documents.find(d => d.category === cat.id);
          const isDragOver = dragOverCategory === cat.id;

          return (
            <div
              key={cat.id}
              className={`relative rounded-2xl border transition p-3.5 flex flex-col justify-between ${
                doc
                  ? 'metallic-card border-white/50 shadow-xs'
                  : isDragOver
                  ? 'bg-slate-300/80 border-slate-600 border-dashed ring-2 ring-blue-500/30'
                  : 'metallic-card border-white/30 border-dashed hover:border-white/60 hover:bg-white/40'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCategory(cat.id);
              }}
              onDragLeave={() => setDragOverCategory(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCategory(null);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(cat.id, e.dataTransfer.files[0]);
                }
              }}
            >
              {/* Category title & badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full metallic-node text-slate-900 text-[11px] font-mono font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">
                      {cat.title}
                    </span>
                  </div>
                  {doc && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-200/80 text-emerald-950 border border-emerald-400/50 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>Hinterlegt</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 font-medium pl-7 leading-relaxed mb-3">
                  {cat.subtitle}
                </p>
              </div>

              {/* Uploaded File View OR Drop Target */}
              {doc ? (
                <div className="mt-2 pt-2 border-t border-slate-300/50 flex items-center justify-between gap-2 metallic-card rounded-xl p-2.5 border border-white/40">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {doc.type.includes('pdf') ? (
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0 border border-rose-300">
                        <FileText className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg metallic-node text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 border border-white/40 overflow-hidden">
                        {doc.fileData ? (
                          <img src={doc.fileData} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono font-semibold">
                        {doc.size} • {doc.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-lg text-slate-700 hover:text-blue-800 hover:bg-white/60 transition cursor-pointer"
                      title="Vorschau ansehen"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-lg text-slate-700 hover:text-emerald-800 hover:bg-white/60 transition cursor-pointer"
                      title="Herunterladen"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-100/50 transition cursor-pointer"
                      title="Datei entfernen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    className="hidden"
                    ref={(el) => (fileInputRefs.current[cat.id] = el)}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(cat.id, e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[cat.id]?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-white/40 metallic-card hover:bg-white/60 transition text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-blue-700" />
                    <span>Datei auswählen / ablegen</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox / Preview Modal for Document / Image */}
      {previewDoc && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-2 sm:pt-4 overflow-y-auto animate-fadeIn">
          <div className="metallic-card-luminous border border-white/40 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-0 sm:my-2">
            <div className="px-5 py-3.5 border-b border-slate-300/60 metallic-card flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="font-extrabold text-sm text-slate-900 truncate">{previewDoc.name}</span>
                <span className="text-xs text-slate-600 font-medium">({previewDoc.categoryLabel})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(previewDoc)}
                  className="px-2.5 py-1 metallic-btn-primary text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-white/40 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center metallic-input min-h-[300px]">
              {previewDoc.type.includes('pdf') ? (
                <div className="text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-xs border border-rose-300">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-base">{previewDoc.name}</p>
                    <p className="text-xs text-slate-600 font-medium mt-1">{previewDoc.size} • PDF-Dokument</p>
                  </div>
                  {previewDoc.fileData && (
                    <div className="pt-2">
                      <a
                        href={previewDoc.fileData}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 metallic-btn-primary text-slate-950 rounded-xl text-xs font-black shadow-md transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Im neuen Tab in voller Größe öffnen</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : previewDoc.fileData ? (
                <img
                  src={previewDoc.fileData}
                  alt={previewDoc.name}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md border border-white/40"
                />
              ) : (
                <p className="text-slate-500 font-bold text-sm">Keine Vorschau verfügbar</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
