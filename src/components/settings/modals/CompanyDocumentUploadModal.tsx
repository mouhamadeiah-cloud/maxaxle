import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  Calendar, 
  Euro, 
  Tag, 
  FileCheck, 
  Folder, 
  Plus, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Users, 
  Landmark, 
  FolderArchive,
  Paperclip,
  Clock,
  Pin,
  RefreshCw,
  Eye,
  Trash2,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { CompanyDocument, CompanyDocumentMainCategory } from '../../../types';
import { COMPANY_DOCUMENT_CATALOGS } from '../../../data/companyDocumentsData';

interface CompanyDocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docItem: CompanyDocument) => void;
  initialDocument?: CompanyDocument | null;
  defaultCategory?: CompanyDocumentMainCategory;
  defaultSubcategory?: string;
  customSubcategories: Record<string, string[]>;
  onAddCustomSubcategory: (category: CompanyDocumentMainCategory, subcatName: string) => void;
}

export const CompanyDocumentUploadModal: React.FC<CompanyDocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDocument,
  defaultCategory = 'vertraege',
  defaultSubcategory,
  customSubcategories,
  onAddCustomSubcategory
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CompanyDocumentMainCategory>(defaultCategory);
  const [subcategory, setSubcategory] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [issuer, setIssuer] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [costAmount, setCostAmount] = useState<string>('');
  const [costInterval, setCostInterval] = useState<'einmalig' | 'monatlich' | 'vierteljaehrlich' | 'jaehrlich'>('monatlich');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  // File state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  // Custom subcategory creation inline
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  // Pre-fill on open / edit
  useEffect(() => {
    if (initialDocument) {
      setTitle(initialDocument.title);
      setCategory(initialDocument.category);
      setSubcategory(initialDocument.subcategory);
      setReferenceNumber(initialDocument.referenceNumber || '');
      setIssuer(initialDocument.issuer || '');
      setDocumentDate(initialDocument.documentDate || '');
      setValidUntil(initialDocument.validUntil || '');
      setNoticePeriod(initialDocument.noticePeriod || '');
      setCostAmount(initialDocument.costAmount ? String(initialDocument.costAmount) : '');
      setCostInterval(initialDocument.costInterval || 'monatlich');
      setNotes(initialDocument.notes || '');
      setTagsInput(initialDocument.tags ? initialDocument.tags.join(', ') : '');
      setIsPinned(!!initialDocument.isPinned);
      setFileName(initialDocument.fileName);
      setFileSize(initialDocument.fileSize);
      setFileType(initialDocument.fileType);
      setFileDataUrl(initialDocument.fileDataUrl);
      setFileError(null);
    } else {
      const selectedCat = defaultCategory || 'vertraege';
      const catDef = COMPANY_DOCUMENT_CATALOGS.find(c => c.id === selectedCat);
      const sub = defaultSubcategory || (catDef?.defaultSubcategories[0] || 'Allgemein');
      
      setTitle('');
      setCategory(selectedCat);
      setSubcategory(sub);
      setReferenceNumber('');
      setIssuer('');
      setDocumentDate(new Date().toISOString().split('T')[0]);
      setValidUntil('');
      setNoticePeriod('');
      setCostAmount('');
      setCostInterval('monatlich');
      setNotes('');
      setTagsInput('');
      setIsPinned(false);
      setFileName('');
      setFileSize(0);
      setFileType('');
      setFileDataUrl('');
      setFileError(null);
    }
    setShowFilePreview(false);
  }, [initialDocument, defaultCategory, defaultSubcategory, isOpen]);

  if (!isOpen) return null;

  // Compute available subcategories for selected catalog
  const catalogDef = COMPANY_DOCUMENT_CATALOGS.find(c => c.id === category);
  const defaultSubs = catalogDef?.defaultSubcategories || [];
  const customSubs = customSubcategories[category] || [];
  const allSubcategories = Array.from(new Set([...defaultSubs, ...customSubs]));

  const handleProcessFile = (file: File) => {
    setFileError(null);
    if (file.size > 20 * 1024 * 1024) {
      setFileError('Die Dateigröße darf maximal 20 MB betragen.');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'));

    // Auto-fill title if empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFileDataUrl(result);
    };
    reader.onerror = () => {
      setFileError('Fehler beim Lesen der Datei.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleAddNewSubcategory = () => {
    const trimmed = newSubcategoryName.trim();
    if (!trimmed) return;
    onAddCustomSubcategory(category, trimmed);
    setSubcategory(trimmed);
    setNewSubcategoryName('');
    setIsAddingSubcategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Bitte geben Sie einen Dokumententitel an.');
      return;
    }
    if (!fileDataUrl && !initialDocument) {
      setFileError('Bitte wählen Sie ein Dokument (PDF oder Bild) aus.');
      return;
    }

    const parsedCost = costAmount ? parseFloat(costAmount.replace(',', '.')) : undefined;
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const docItem: CompanyDocument = {
      id: initialDocument?.id || `cdoc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      category,
      subcategory: subcategory || allSubcategories[0] || 'Sonstiges',
      referenceNumber: referenceNumber.trim() || undefined,
      issuer: issuer.trim() || undefined,
      documentDate: documentDate || undefined,
      validUntil: validUntil || undefined,
      noticePeriod: noticePeriod.trim() || undefined,
      costAmount: parsedCost && !isNaN(parsedCost) ? parsedCost : undefined,
      costInterval: parsedCost && !isNaN(parsedCost) ? costInterval : undefined,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      isPinned,
      fileName: fileName || initialDocument?.fileName || 'Dokument.pdf',
      fileSize: fileSize || initialDocument?.fileSize || 1024,
      fileType: fileType || initialDocument?.fileType || 'application/pdf',
      fileDataUrl: fileDataUrl || initialDocument?.fileDataUrl || '',
      uploadedAt: initialDocument?.uploadedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(docItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {initialDocument ? 'Firmen-Dokument bearbeiten' : 'Neues Firmen-Dokument hochladen'}
              </h2>
              <p className="text-xs text-slate-700 font-medium">
                {initialDocument ? 'Metadaten und Gültigkeit anpassen' : 'Sicher im Autohaus-Archiv ablegen & kategorisieren'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* File Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Dokumentendatei (PDF oder Bild)</span>
                <span className="text-rose-500">*</span>
              </label>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              className="hidden"
            />

            {/* UPLOAD (DRAG & DROP / FILE SELECTION) */}
            <div className="space-y-2">
                {fileName && fileDataUrl ? (
                  /* Attached Document Summary Card */
                  <div className="p-4 bg-emerald-50/60 border-2 border-emerald-300 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {fileType.includes('image') ? (
                          <img 
                            src={fileDataUrl} 
                            alt="Dokumentvorschau" 
                            className="w-12 h-12 rounded-xl object-cover border border-emerald-200 shadow-xs shrink-0 cursor-pointer"
                            onClick={() => setShowFilePreview(!showFilePreview)}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <FileCheck className="w-6 h-6" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-slate-900 truncate">
                              {fileName}
                            </p>
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.2 rounded-md shrink-0">
                              {fileType.includes('image') ? 'Foto / Bild' : 'PDF Dokument'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {(fileSize / 1024 / 1024).toFixed(2)} MB • Erfasst am {new Date().toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle Inline Preview */}
                        <button
                          type="button"
                          onClick={() => setShowFilePreview(!showFilePreview)}
                          title="Vorschau ansehen"
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{showFilePreview ? 'Schließen' : 'Vorschau'}</span>
                        </button>

                        {/* Replace File */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          title="Neue Datei auswählen"
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1 transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Ersetzen</span>
                        </button>

                        {/* Remove File */}
                        <button
                          type="button"
                          onClick={() => {
                            setFileName('');
                            setFileSize(0);
                            setFileType('');
                            setFileDataUrl('');
                            setShowFilePreview(false);
                          }}
                          title="Datei entfernen"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Image or PDF Preview Drawer */}
                    {showFilePreview && (
                      <div className="pt-3 border-t border-emerald-200">
                        <div className="max-h-64 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center p-2 border border-emerald-300">
                          {fileType.includes('image') ? (
                            <img 
                              src={fileDataUrl} 
                              alt="Document Preview" 
                              className="max-h-60 max-w-full object-contain rounded-lg shadow-md"
                            />
                          ) : (
                            <div className="p-4 text-center text-white space-y-2">
                              <FileCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                              <p className="text-xs font-bold">{fileName}</p>
                              <p className="text-[11px] text-slate-400">PDF Dokument bereit zur Archivierung</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Drag & Drop File Zone */
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
                      isDragging 
                        ? 'border-emerald-500 bg-emerald-50/50' 
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-2 py-1">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          Dokument-Datei hierher ziehen oder durchsuchen
                        </p>
                        <p className="text-[11px] text-slate-700 mt-0.5">
                          Unterstützt PDF, JPG, PNG & WebP (bis 20 MB)
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Upload className="w-3.5 h-3.5 text-blue-400" />
                          <span>Datei auswählen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {fileError && (
                  <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{fileError}</span>
                  </p>
                )}
              </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Dokumententitel / Bezeichnung</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Gewerbemietvertrag KuDamm 210, Betriebshaftpflicht Allianz..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
            />
          </div>

          {/* Catalog & Subcatalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Main Catalog */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Hauptkatalog (Bereich)</span>
                <span className="text-[10px] text-slate-700">الكتالوج الرئيسي</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as CompanyDocumentMainCategory;
                  setCategory(newCat);
                  const def = COMPANY_DOCUMENT_CATALOGS.find(c => c.id === newCat);
                  const custom = customSubcategories[newCat] || [];
                  const firstSub = def?.defaultSubcategories[0] || custom[0] || 'Sonstiges';
                  setSubcategory(firstSub);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition cursor-pointer"
              >
                {COMPANY_DOCUMENT_CATALOGS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.titleDe} ({cat.titleAr})
                  </option>
                ))}
              </select>
            </div>

            {/* Subcatalog */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Unterkatalog (Ordner)</span>
                  <span className="text-[10px] text-slate-700">المجلد الفرعي</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingSubcategory(!isAddingSubcategory)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Neu</span>
                </button>
              </div>

              {isAddingSubcategory ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Name des neuen Unterkatalogs..."
                    className="flex-1 px-3 py-2 bg-blue-50/50 border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddNewSubcategory}
                    className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition cursor-pointer"
                  >
                    Hinzufügen
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingSubcategory(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition cursor-pointer"
                >
                  {allSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Reference & Issuer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reference Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Vertrags-Nr. / Aktenzeichen / Zählernummer
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="z.B. MV-2024-88, POL-77192..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            {/* Issuer / Partner */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Vertragspartner / Aussteller / Versorger
              </label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="z.B. Allianz, Vattenfall, Vermieter, Finanzamt..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>
          </div>

          {/* Dates & Fristen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Issue Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Dokumentendatum</span>
              </label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition cursor-pointer"
              />
            </div>

            {/* Valid Until */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Gültig bis / Verlängerung</span>
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition cursor-pointer"
              />
            </div>

            {/* Notice Period */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Kündigungsfrist
              </label>
              <input
                type="text"
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                placeholder="z.B. 3 Monate zum Jahresende"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>
          </div>

          {/* Cost & Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Euro className="w-3.5 h-3.5 text-slate-500" />
                <span>Regelmäßige Kosten (optional in €)</span>
              </label>
              <input
                type="text"
                value={costAmount}
                onChange={(e) => setCostAmount(e.target.value)}
                placeholder="z.B. 450,00"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Abrechnungsintervall
              </label>
              <select
                value={costInterval}
                onChange={(e) => setCostInterval(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition cursor-pointer"
              >
                <option value="monatlich">Monatlich</option>
                <option value="vierteljaehrlich">Vierteljährlich</option>
                <option value="jaehrlich">Jährlich</option>
                <option value="einmalig">Einmalig</option>
              </select>
            </div>
          </div>

          {/* Tags & Pin */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Schlagwörter / Tags (kommagetrennt)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="z.B. Miete, KuDamm, Wichtig, Pflicht..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Oben anheften</span>
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Notizen / Interne Vermerke
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Ansprechpartner Frau Meyer Durchwahl -24, Kundennummer 88102, Passwort im Tresor..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{initialDocument ? 'Änderungen speichern' : 'Dokument sicher archivieren'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
