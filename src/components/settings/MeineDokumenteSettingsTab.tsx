import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  Folder, 
  FolderPlus, 
  Search, 
  Filter, 
  Plus, 
  Grid, 
  List, 
  Eye, 
  Download, 
  Edit3, 
  Trash2, 
  Pin, 
  PinOff, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Euro, 
  ChevronRight, 
  ShieldCheck, 
  FileSignature, 
  Zap, 
  Users, 
  Landmark, 
  FolderArchive, 
  Sparkles, 
  Building2,
  Tag,
  ArrowUpDown,
  X
} from 'lucide-react';
import { CompanyDocument, CompanyDocumentMainCategory } from '../../types';
import { COMPANY_DOCUMENT_CATALOGS } from '../../data/companyDocumentsData';
import { firebaseService } from '../../services/firebaseService';
import { CompanyDocumentUploadModal } from './modals/CompanyDocumentUploadModal';
import { CompanyDocumentPreviewModal } from './modals/CompanyDocumentPreviewModal';

export const MeineDokumenteSettingsTab: React.FC = () => {
  // Documents and Subcategories state from Firebase Service
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [customSubcategories, setCustomSubcategories] = useState<Record<string, string[]>>({});

  // Filtering & View state
  const [selectedCatalog, setSelectedCatalog] = useState<CompanyDocumentMainCategory | 'all'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'expiring' | 'pinned'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<CompanyDocument | null>(null);
  const [previewDocument, setPreviewDocument] = useState<CompanyDocument | null>(null);
  const [defaultCategoryForNew, setDefaultCategoryForNew] = useState<CompanyDocumentMainCategory>('vertraege');
  const [defaultSubcatForNew, setDefaultSubcatForNew] = useState<string | undefined>(undefined);

  // Quick subcategory modal
  const [showAddSubcatModal, setShowAddSubcatModal] = useState(false);
  const [targetCatForSubcat, setTargetCatForSubcat] = useState<CompanyDocumentMainCategory>('vertraege');
  const [newSubcatInput, setNewSubcatInput] = useState('');

  // Subscribe to documents & load custom subcategories
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeCompanyDocuments((docs) => {
      setDocuments(docs);
    });
    setCustomSubcategories(firebaseService.getCustomDocumentSubcategories());
    return () => unsubscribe();
  }, []);

  // Handler to add custom subcategory
  const handleAddCustomSubcategory = (cat: CompanyDocumentMainCategory, name: string) => {
    const updated = firebaseService.saveCustomDocumentSubcategory(cat, name);
    setCustomSubcategories(updated);
  };

  // Handler to delete custom subcategory
  const handleDeleteCustomSubcategory = (cat: CompanyDocumentMainCategory, name: string) => {
    if (confirm(`Möchten Sie den Unterordner "${name}" wirklich entfernen?`)) {
      const updated = firebaseService.deleteCustomDocumentSubcategory(cat, name);
      setCustomSubcategories(updated);
      if (selectedSubcategory === name) {
        setSelectedSubcategory('all');
      }
    }
  };

  // Document actions
  const handleSaveDocument = (docItem: CompanyDocument) => {
    firebaseService.saveCompanyDocument(docItem);
  };

  const handleDeleteDocument = (id: string) => {
    firebaseService.deleteCompanyDocument(id);
    if (previewDocument?.id === id) {
      setPreviewDocument(null);
    }
  };

  const handleTogglePin = (id: string) => {
    firebaseService.toggleCompanyDocumentPinned(id);
  };

  const handleDownloadDocument = (doc: CompanyDocument) => {
    if (!doc.fileDataUrl) return;
    const link = window.document.createElement('a');
    link.href = doc.fileDataUrl;
    link.download = doc.fileName || 'Dokument.pdf';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  // Open upload modal with pre-selected category
  const handleOpenUploadForCatalog = (catId: CompanyDocumentMainCategory, subcat?: string) => {
    setDefaultCategoryForNew(catId);
    setDefaultSubcatForNew(subcat);
    setEditingDocument(null);
    setIsUploadModalOpen(true);
  };

  // Catalog styling helper
  const getCatalogMeta = (id: CompanyDocumentMainCategory) => {
    switch (id) {
      case 'vertraege':
        return {
          icon: <FileSignature className="w-5 h-5" />,
          colorClass: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50',
          activeBg: 'bg-blue-600 text-white',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
          accentText: 'text-blue-700',
          iconBg: 'bg-blue-600 text-white'
        };
      case 'versicherungen':
        return {
          icon: <ShieldCheck className="w-5 h-5" />,
          colorClass: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50',
          activeBg: 'bg-emerald-600 text-white',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          accentText: 'text-emerald-700',
          iconBg: 'bg-emerald-600 text-white'
        };
      case 'versorger':
        return {
          icon: <Zap className="w-5 h-5" />,
          colorClass: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50',
          activeBg: 'bg-amber-600 text-white',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
          accentText: 'text-amber-700',
          iconBg: 'bg-amber-600 text-white'
        };
      case 'personal':
        return {
          icon: <Users className="w-5 h-5" />,
          colorClass: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50',
          activeBg: 'bg-purple-600 text-white',
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
          accentText: 'text-purple-700',
          iconBg: 'bg-purple-600 text-white'
        };
      case 'steuern_behoerden':
        return {
          icon: <Landmark className="w-5 h-5" />,
          colorClass: 'border-sky-200 bg-sky-50/50 hover:bg-sky-50',
          activeBg: 'bg-sky-600 text-white',
          badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
          accentText: 'text-sky-700',
          iconBg: 'bg-sky-600 text-white'
        };
      case 'sonstiges':
      default:
        return {
          icon: <FolderArchive className="w-5 h-5" />,
          colorClass: 'border-slate-200 bg-slate-50/80 hover:bg-slate-100/80',
          activeBg: 'bg-slate-800 text-white',
          badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
          accentText: 'text-slate-700',
          iconBg: 'bg-slate-800 text-white'
        };
    }
  };

  // Expiration helper
  const getDocExpiration = (validUntil?: string) => {
    if (!validUntil) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(validUntil);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      diffDays,
      isExpired: diffDays < 0,
      isExpiringSoon: diffDays >= 0 && diffDays <= 60
    };
  };

  // Expiring soon documents count (for alert badge)
  const expiringDocs = useMemo(() => {
    return documents.filter(d => {
      const exp = getDocExpiration(d.validUntil);
      return exp && (exp.isExpired || exp.isExpiringSoon);
    });
  }, [documents]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalBytes = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
    const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
    const contractsCount = documents.filter(d => d.category === 'vertraege' || d.category === 'versicherungen').length;
    const totalMonthlyCosts = documents.reduce((acc, d) => {
      if (!d.costAmount) return acc;
      if (d.costInterval === 'monatlich') return acc + d.costAmount;
      if (d.costInterval === 'vierteljaehrlich') return acc + (d.costAmount / 3);
      if (d.costInterval === 'jaehrlich') return acc + (d.costAmount / 12);
      return acc;
    }, 0);

    return { totalDocs, totalMB, contractsCount, totalMonthlyCosts };
  }, [documents]);

  // Subcategories for current catalog filter
  const currentCatalogSubcategories = useMemo(() => {
    if (selectedCatalog === 'all') return [];
    const catDef = COMPANY_DOCUMENT_CATALOGS.find(c => c.id === selectedCatalog);
    const defSubs = catDef?.defaultSubcategories || [];
    const custSubs = customSubcategories[selectedCatalog] || [];
    return Array.from(new Set([...defSubs, ...custSubs]));
  }, [selectedCatalog, customSubcategories]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Catalog filter
      if (selectedCatalog !== 'all' && doc.category !== selectedCatalog) {
        return false;
      }
      // Subcategory filter
      if (selectedSubcategory !== 'all' && doc.subcategory !== selectedSubcategory) {
        return false;
      }
      // Status filter
      if (statusFilter === 'pinned' && !doc.isPinned) {
        return false;
      }
      if (statusFilter === 'expiring') {
        const exp = getDocExpiration(doc.validUntil);
        if (!exp || (!exp.isExpired && !exp.isExpiringSoon)) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchRef = doc.referenceNumber?.toLowerCase().includes(q);
        const matchIssuer = doc.issuer?.toLowerCase().includes(q);
        const matchSubcat = doc.subcategory.toLowerCase().includes(q);
        const matchNotes = doc.notes?.toLowerCase().includes(q);
        const matchTags = doc.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchRef && !matchIssuer && !matchSubcat && !matchNotes && !matchTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      // Pinned first, then newest
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }, [documents, selectedCatalog, selectedSubcategory, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-br from-blue-100/40 via-emerald-100/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-slate-900 text-emerald-400 text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md shadow-xs">
                Archiv & Verträge
              </span>
              <span className="text-xs text-slate-700 font-bold">
                أوراق ومستندات الشركة
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              13. Meine Dokumente & Firmen-Dokumentenarchiv
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-2xl font-medium leading-relaxed">
              Zentrale, rechtssichere Aufbewahrung aller Verträge, Versicherungspolicen, Versorgungsverträge, Personalakten und behördlichen Nachweise Ihres Autohauses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDefaultCategoryForNew(selectedCatalog !== 'all' ? selectedCatalog : 'vertraege');
                setDefaultSubcatForNew(selectedSubcategory !== 'all' ? selectedSubcategory : undefined);
                setEditingDocument(null);
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>+ Dokument hochladen</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 block">Archivierte Dokumente</span>
            <div className="text-lg font-black text-slate-900 mt-0.5 flex items-baseline gap-1.5">
              <span>{stats.totalDocs}</span>
              <span className="text-[11px] font-bold text-slate-700">Akten ({stats.totalMB} MB)</span>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 block">Verträge & Policen</span>
            <div className="text-lg font-black text-blue-700 mt-0.5 flex items-baseline gap-1.5">
              <span>{stats.contractsCount}</span>
              <span className="text-[11px] font-bold text-slate-700">Laufzeitverträge</span>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 block">Laufende Fixkosten</span>
            <div className="text-lg font-black text-slate-900 mt-0.5 flex items-baseline gap-1.5">
              <span>{stats.totalMonthlyCosts.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
              <span className="text-[11px] font-bold text-slate-700">/ Monat</span>
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter(statusFilter === 'expiring' ? 'all' : 'expiring')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer ${
              expiringDocs.length > 0 
                ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/60 text-amber-900' 
                : 'bg-slate-50/80 border-slate-100 text-slate-700'
            }`}
          >
            <span className="text-[11px] font-bold block flex items-center justify-between">
              <span>Fristen-Monitor</span>
              {expiringDocs.length > 0 && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
            </span>
            <div className="text-lg font-black mt-0.5 flex items-baseline gap-1.5">
              <span className={expiringDocs.length > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                {expiringDocs.length}
              </span>
              <span className="text-[11px] font-bold">
                {expiringDocs.length > 0 ? 'Fristen zu prüfen' : 'Alles im grünen Bereich'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Fristen-Alert Banner (if any upcoming expiration) */}
      {expiringDocs.length > 0 && statusFilter !== 'expiring' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black">
                {expiringDocs.length} {expiringDocs.length === 1 ? 'Dokument erfordert' : 'Dokumente erfordern'} Aufmerksamkeit!
              </h4>
              <p className="text-[11px] text-amber-800 font-medium">
                Bei einigen Verträgen oder Nachweisen läuft die Gültigkeits- oder Kündigungsfrist in weniger als 60 Tagen ab.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('expiring')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            Fristen jetzt filtern ({expiringDocs.length})
          </button>
        </div>
      )}

      {/* Main Catalogs Grid (6 Requested Categories) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-600" />
            <span>Dokumenten-Kataloge & Bereiche</span>
          </h2>
          <span className="text-xs text-slate-700 font-medium">
            Klicken zum schnellen Öffnen eines Bereichs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {COMPANY_DOCUMENT_CATALOGS.map((cat) => {
            const meta = getCatalogMeta(cat.id);
            const count = documents.filter(d => d.category === cat.id).length;
            const isSelected = selectedCatalog === cat.id;
            const customSubs = customSubcategories[cat.id] || [];
            const allSubs = [...cat.defaultSubcategories, ...customSubs];

            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedCatalog('all');
                    setSelectedSubcategory('all');
                  } else {
                    setSelectedCatalog(cat.id);
                    setSelectedSubcategory('all');
                  }
                }}
                className={`relative p-5 rounded-3xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isSelected 
                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg ring-2 ring-slate-900/20' 
                    : `${meta.colorClass} text-slate-900 shadow-xs`
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
                      isSelected ? 'bg-white/10 text-white' : meta.iconBg
                    }`}>
                      {meta.icon}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                        isSelected 
                          ? 'bg-white/10 text-white border-white/20' 
                          : meta.badgeClass
                      }`}>
                        {count} {count === 1 ? 'Dokument' : 'Dokumente'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black tracking-tight">
                        {cat.titleDe}
                      </h3>
                    </div>
                    <p className={`text-xs font-bold mt-0.5 ${isSelected ? 'text-emerald-400' : meta.accentText}`}>
                      {cat.titleAr}
                    </p>
                    <p className={`text-[11px] mt-1.5 leading-relaxed font-medium line-clamp-2 ${
                      isSelected ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Subcategories preview chips */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-700'}`}>
                    {allSubs.length} Unterordner
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetCatForSubcat(cat.id);
                        setNewSubcatInput('');
                        setShowAddSubcatModal(true);
                      }}
                      title="Neuen Unterkatalog / Unterordner anlegen"
                      className={`text-[10px] font-black px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                        isSelected 
                          ? 'bg-white/20 hover:bg-white/30 text-white' 
                          : 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ordner +</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenUploadForCatalog(cat.id);
                      }}
                      title="Dokument in diesen Katalog hochladen"
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isSelected 
                          ? 'hover:bg-white/20 text-white' 
                          : 'hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter, Search & View Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        
        {/* Top filter row: Active catalog selector tabs & search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Catalog tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => {
                setSelectedCatalog('all');
                setSelectedSubcategory('all');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition cursor-pointer ${
                selectedCatalog === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Alle Bereiche ({documents.length})
            </button>

            {COMPANY_DOCUMENT_CATALOGS.map((c) => {
              const cCount = documents.filter(d => d.category === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCatalog(c.id);
                    setSelectedSubcategory('all');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
                    selectedCatalog === c.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{c.titleDe.split('&')[0].trim()}</span>
                  <span className="opacity-70 text-[10px] font-black bg-white/20 px-1.5 py-0.2 rounded-md">
                    {cCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar & View mode toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suche nach Titel, Aktenzeichen, Partner..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Kachelansicht"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Tabellenansicht"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Subcategories & Status Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Subcategories row (if specific catalog selected) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mr-1">
              <Folder className="w-3.5 h-3.5 text-slate-500" />
              <span>Unterkatalog:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedSubcategory('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                selectedSubcategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Alle Ordner
            </button>

            {currentCatalogSubcategories.map((subcat) => {
              const subCount = documents.filter(d => 
                (selectedCatalog === 'all' || d.category === selectedCatalog) && 
                d.subcategory === subcat
              ).length;
              const isCustom = (customSubcategories[selectedCatalog] || []).includes(subcat);

              return (
                <div key={subcat} className="group relative flex items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedSubcategory(subcat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      selectedSubcategory === subcat
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{subcat}</span>
                    {subCount > 0 && (
                      <span className="text-[10px] opacity-75 font-semibold">({subCount})</span>
                    )}
                  </button>

                  {isCustom && selectedCatalog !== 'all' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomSubcategory(selectedCatalog as CompanyDocumentMainCategory, subcat)}
                      title="Diesen benutzerdefinierten Unterordner löschen"
                      className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 ml-0.5 transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {selectedCatalog !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  setTargetCatForSubcat(selectedCatalog as CompanyDocumentMainCategory);
                  setNewSubcatInput('');
                  setShowAddSubcatModal(true);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Neuer Unterordner</span>
              </button>
            )}
          </div>

          {/* Quick status filters: All / Expiring / Pinned */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'pinned' ? 'all' : 'pinned')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'pinned'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Pin className="w-3 h-3" />
              <span>Angeheftet</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'expiring' ? 'all' : 'expiring')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'expiring'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : expiringDocs.length > 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Fristen (&lt; 60 Tage)</span>
            </button>
          </div>

        </div>

      </div>

      {/* Document List / Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FolderArchive className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Keine Dokumente gefunden</h3>
            <p className="text-xs text-slate-700 mt-1 max-w-md mx-auto font-medium">
              Für die gewählten Filter oder den Suchbegriff liegen keine Firmenunterlagen vor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCatalog('all');
              setSelectedSubcategory('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const catDef = COMPANY_DOCUMENT_CATALOGS.find(c => c.id === doc.category);
            const meta = getCatalogMeta(doc.category);
            const exp = getDocExpiration(doc.validUntil);

            return (
              <div
                key={doc.id}
                onClick={() => setPreviewDocument(doc)}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Pinned bookmark indicator */}
                {doc.isPinned && (
                  <div className="absolute top-0 right-7 bg-amber-500 text-white p-1 rounded-b-md shadow-xs z-10" title="Im Archiv angeheftet">
                    <Pin className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}

                <div>
                  {/* Category & Date row */}
                  <div className="flex items-center justify-between gap-2 pr-6">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
                      {catDef?.titleDe.split('&')[0].trim()}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">
                      {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString('de-DE') : '-'}
                    </span>
                  </div>

                  {/* Title & Subcategory */}
                  <div className="mt-3">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-700 mt-0.5 flex items-center gap-1">
                      <Folder className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{doc.subcategory}</span>
                    </p>
                  </div>

                  {/* Metadata Chips (Reference, Issuer, Cost) */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    {doc.issuer && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-medium truncate">{doc.issuer}</span>
                      </div>
                    )}

                    {doc.referenceNumber && (
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                        <span className="text-slate-500">Ref:</span>
                        <span className="font-bold text-slate-800 truncate">{doc.referenceNumber}</span>
                      </div>
                    )}

                    {doc.costAmount !== undefined && (
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <Euro className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{doc.costAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                        <span className="text-[10px] text-slate-700 font-normal">({doc.costInterval || 'monatlich'})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer status & actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Expiration badge */}
                  <div>
                    {exp ? (
                      exp.isExpired ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                          Abgelaufen
                        </span>
                      ) : exp.isExpiringSoon ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                          Ablauf in {exp.diffDays} Tagen!
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Gültig bis {doc.validUntil ? new Date(doc.validUntil).toLocaleDateString('de-DE') : ''}
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-medium text-slate-700">
                        {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • PDF
                      </span>
                    )}
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleTogglePin(doc.id)}
                      title={doc.isPinned ? 'Anheftung lösen' : 'Oben anheften'}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        doc.isPinned ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDocument(doc)}
                      title="Herunterladen"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingDocument(doc);
                        setIsUploadModalOpen(true);
                      }}
                      title="Bearbeiten"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Dokument "${doc.title}" wirklich löschen?`)) {
                          handleDeleteDocument(doc.id);
                        }
                      }}
                      title="Löschen"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Dokument / Titel</th>
                  <th className="py-3 px-4">Katalog & Ordner</th>
                  <th className="py-3 px-4">Partner / Aussteller</th>
                  <th className="py-3 px-4">Vertrags-Nr.</th>
                  <th className="py-3 px-4">Gültigkeit / Frist</th>
                  <th className="py-3 px-4">Kosten</th>
                  <th className="py-3 px-4 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map((doc) => {
                  const catDef = COMPANY_DOCUMENT_CATALOGS.find(c => c.id === doc.category);
                  const meta = getCatalogMeta(doc.category);
                  const exp = getDocExpiration(doc.validUntil);

                  return (
                    <tr 
                      key={doc.id}
                      onClick={() => setPreviewDocument(doc)}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {doc.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />}
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 block truncate max-w-xs hover:text-blue-600">
                              {doc.title}
                            </span>
                            <span className="text-[10px] text-slate-600 font-normal">
                              {doc.fileName} ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.badgeClass} block w-fit`}>
                          {catDef?.titleDe.split('&')[0].trim()}
                        </span>
                        <span className="text-[11px] text-slate-700 block mt-0.5">
                          {doc.subcategory}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {doc.issuer || '-'}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-800 font-bold">
                        {doc.referenceNumber || '-'}
                      </td>

                      <td className="py-3 px-4">
                        {exp ? (
                          exp.isExpired ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              Abgelaufen
                            </span>
                          ) : exp.isExpiringSoon ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300">
                              In {exp.diffDays} Tagen
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-700">
                              bis {new Date(doc.validUntil!).toLocaleDateString('de-DE')}
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-slate-600">Unbefristet</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {doc.costAmount !== undefined ? (
                          <span>
                            {doc.costAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                            <span className="text-[10px] font-normal text-slate-600 block">{doc.costInterval || 'monatlich'}</span>
                          </span>
                        ) : '-'}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewDocument(doc)}
                            title="Vorschau"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadDocument(doc)}
                            title="Herunterladen"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingDocument(doc);
                              setIsUploadModalOpen(true);
                            }}
                            title="Bearbeiten"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Dokument "${doc.title}" wirklich löschen?`)) {
                                handleDeleteDocument(doc.id);
                              }
                            }}
                            title="Löschen"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Subcategory */}
      {showAddSubcatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">Neuen Unterordner erstellen</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubcatModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Zielkatalog</label>
                <select
                  value={targetCatForSubcat}
                  onChange={(e) => setTargetCatForSubcat(e.target.value as CompanyDocumentMainCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  {COMPANY_DOCUMENT_CATALOGS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.titleDe} ({c.titleAr})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Name des Unterordners</label>
                <input
                  type="text"
                  value={newSubcatInput}
                  onChange={(e) => setNewSubcatInput(e.target.value)}
                  placeholder="z.B. Solaranlage, Fuhrpark-Versicherung, Lehrverträge..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddSubcatModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={!newSubcatInput.trim()}
                onClick={() => {
                  handleAddCustomSubcategory(targetCatForSubcat, newSubcatInput.trim());
                  setShowAddSubcatModal(false);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Ordner anlegen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Document Upload & Edit */}
      <CompanyDocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setEditingDocument(null);
        }}
        onSave={handleSaveDocument}
        initialDocument={editingDocument}
        defaultCategory={defaultCategoryForNew}
        defaultSubcategory={defaultSubcatForNew}
        customSubcategories={customSubcategories}
        onAddCustomSubcategory={handleAddCustomSubcategory}
      />

      {/* Modal: Document Visual Preview & Details */}
      <CompanyDocumentPreviewModal
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        document={previewDocument}
        onEdit={(doc) => {
          setEditingDocument(doc);
          setIsUploadModalOpen(true);
        }}
        onDelete={handleDeleteDocument}
        onTogglePin={handleTogglePin}
      />

    </div>
  );
};
