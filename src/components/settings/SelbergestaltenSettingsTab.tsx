import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Sparkles, 
  Wrench, 
  ShieldCheck, 
  Car, 
  Truck, 
  Disc, 
  FileText, 
  Shield, 
  Layers, 
  Tag, 
  Euro, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Info, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  FolderPlus, 
  Palette,
  X,
  Check,
  Zap,
  Sliders
} from 'lucide-react';
import { ServiceBasisCategory, ServiceSubcategory } from '../../types';
import { firebaseService } from '../../services/firebaseService';
import { DEFAULT_SERVICE_BASES } from '../../mockData';

interface SelbergestaltenSettingsTabProps {
  serviceBases: ServiceBasisCategory[];
  onSaveBases: (bases: ServiceBasisCategory[]) => void;
  onShowToast: (msg: string) => void;
}

const AVAILABLE_ICONS: { id: string; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'Wrench', label: 'Werkstatt & Werkzeug', icon: Wrench },
  { id: 'Sparkles', label: 'Aufbereitung & Glanz', icon: Sparkles },
  { id: 'ShieldCheck', label: 'Karosserie & Smart Repair', icon: ShieldCheck },
  { id: 'FileText', label: 'TÜV & Gutachten', icon: FileText },
  { id: 'Truck', label: 'Zulassung & Transport', icon: Truck },
  { id: 'Disc', label: 'Reifen & Räder', icon: Disc },
  { id: 'Shield', label: 'Garantie & Schutz', icon: Shield },
  { id: 'Car', label: 'Fahrzeugtechnik', icon: Car },
  { id: 'Sliders', label: 'Allgemeiner Service', icon: Sliders },
  { id: 'Zap', label: 'Elektrik & Diagnose', icon: Zap }
];

const AVAILABLE_COLORS: { id: string; label: string; bgClass: string; borderClass: string; textClass: string; badgeClass: string }[] = [
  { id: 'blue', label: 'Blau (Saphir)', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-400/30', textClass: 'text-blue-700', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'emerald', label: 'Grün (Smaragd)', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-400/30', textClass: 'text-emerald-700', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'amber', label: 'Bernstein (Gold)', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-400/30', textClass: 'text-amber-700', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'purple', label: 'Violett (Amethyst)', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-400/30', textClass: 'text-purple-700', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'cyan', label: 'Türkis (Cyan)', bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-400/30', textClass: 'text-cyan-700', badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { id: 'rose', label: 'Rubin (Rot)', bgClass: 'bg-rose-500/10', borderClass: 'border-rose-400/30', textClass: 'text-rose-700', badgeClass: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'indigo', label: 'Indigo (Nachtblau)', bgClass: 'bg-indigo-500/10', borderClass: 'border-indigo-400/30', textClass: 'text-indigo-700', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
];

export const SelbergestaltenSettingsTab: React.FC<SelbergestaltenSettingsTabProps> = ({
  serviceBases,
  onSaveBases,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [expandedBaseIds, setExpandedBaseIds] = useState<Set<string>>(() => new Set(serviceBases.map(b => b.id)));

  // Modals state
  const [editingBase, setEditingBase] = useState<ServiceBasisCategory | null>(null);
  const [isNewBaseModalOpen, setIsNewBaseModalOpen] = useState(false);
  const [baseForm, setBaseForm] = useState<Partial<ServiceBasisCategory>>({
    name: '',
    code: '',
    icon: 'Wrench',
    color: 'blue',
    description: '',
    defaultTaxRate: '19%',
    active: true
  });

  const [editingSubcategory, setEditingSubcategory] = useState<{ basisId: string; sub: ServiceSubcategory } | null>(null);
  const [newSubcategoryBasisId, setNewSubcategoryBasisId] = useState<string | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState<Partial<ServiceSubcategory>>({
    name: '',
    code: '',
    description: '',
    defaultPrice: 0,
    defaultTaxRate: '19%',
    estimatedDurationMinutes: 60,
    active: true
  });

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'basis' | 'subcategory';
    basisId: string;
    subId?: string;
    title: string;
  } | null>(null);

  // Toggle accordion expand
  const toggleExpand = (id: string) => {
    setExpandedBaseIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedBaseIds(new Set(serviceBases.map(b => b.id)));
  };

  const collapseAll = () => {
    setExpandedBaseIds(new Set());
  };

  // Helper to render icon
  const renderCategoryIcon = (iconName?: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Wrench': return <Wrench className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Truck': return <Truck className={className} />;
      case 'Disc': return <Disc className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Car': return <Car className={className} />;
      case 'Zap': return <Zap className={className} />;
      default: return <Sliders className={className} />;
    }
  };

  const getColorConfig = (colorId?: string) => {
    return AVAILABLE_COLORS.find(c => c.id === colorId) || AVAILABLE_COLORS[0];
  };

  // Filtered list
  const filteredBases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return serviceBases.filter(basis => {
      if (filterActiveOnly && !basis.active) return false;
      if (!q) return true;

      const matchesBaseName = basis.name.toLowerCase().includes(q);
      const matchesBaseCode = (basis.code || '').toLowerCase().includes(q);
      const matchesBaseDesc = (basis.description || '').toLowerCase().includes(q);

      const matchesSub = (basis.subcategories || []).some(sub => 
        sub.name.toLowerCase().includes(q) ||
        (sub.code || '').toLowerCase().includes(q) ||
        (sub.description || '').toLowerCase().includes(q)
      );

      return matchesBaseName || matchesBaseCode || matchesBaseDesc || matchesSub;
    });
  }, [serviceBases, searchQuery, filterActiveOnly]);

  // Statistics
  const stats = useMemo(() => {
    const totalBases = serviceBases.length;
    const activeBases = serviceBases.filter(b => b.active).length;
    const totalSubs = serviceBases.reduce((sum, b) => sum + (b.subcategories?.length || 0), 0);
    const activeSubs = serviceBases.reduce((sum, b) => sum + (b.subcategories?.filter(s => s.active)?.length || 0), 0);
    return { totalBases, activeBases, totalSubs, activeSubs };
  }, [serviceBases]);

  // Handler: Open Add Base Modal
  const handleOpenAddBase = () => {
    setBaseForm({
      name: '',
      code: `SRV-${(serviceBases.length + 1).toString().padStart(2, '0')}`,
      icon: 'Wrench',
      color: AVAILABLE_COLORS[(serviceBases.length) % AVAILABLE_COLORS.length].id,
      description: '',
      defaultTaxRate: '19%',
      active: true
    });
    setIsNewBaseModalOpen(true);
  };

  // Handler: Open Edit Base Modal
  const handleOpenEditBase = (base: ServiceBasisCategory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingBase(base);
    setBaseForm({
      name: base.name,
      code: base.code || '',
      icon: base.icon || 'Wrench',
      color: base.color || 'blue',
      description: base.description || '',
      defaultTaxRate: base.defaultTaxRate || '19%',
      active: base.active ?? true
    });
  };

  // Handler: Save Base (New or Edit)
  const handleSaveBase = () => {
    if (!baseForm.name?.trim()) {
      alert('Bitte geben Sie einen Namen für die Service-Basis ein.');
      return;
    }

    if (editingBase) {
      const updated = firebaseService.updateServiceBasis(editingBase.id, {
        name: baseForm.name.trim(),
        code: baseForm.code?.trim().toUpperCase(),
        icon: baseForm.icon,
        color: baseForm.color,
        description: baseForm.description?.trim(),
        defaultTaxRate: baseForm.defaultTaxRate || '19%',
        active: baseForm.active ?? true
      });
      if (updated) {
        onSaveBases(firebaseService.getServiceBases());
        onShowToast(`Service-Basis "${baseForm.name}" erfolgreich aktualisiert.`);
      }
      setEditingBase(null);
    } else {
      const newCreated = firebaseService.addServiceBasis({
        name: baseForm.name.trim(),
        code: baseForm.code?.trim().toUpperCase(),
        icon: baseForm.icon || 'Wrench',
        color: baseForm.color || 'blue',
        description: baseForm.description?.trim(),
        defaultTaxRate: baseForm.defaultTaxRate || '19%',
        active: baseForm.active ?? true,
        orderIndex: serviceBases.length,
        subcategories: []
      });
      onSaveBases(firebaseService.getServiceBases());
      setExpandedBaseIds(prev => new Set([...prev, newCreated.id]));
      onShowToast(`Neue Service-Basis "${baseForm.name}" angelegt.`);
      setIsNewBaseModalOpen(false);
    }
  };

  // Handler: Toggle Base Active
  const handleToggleBaseActive = (basis: ServiceBasisCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    const newActive = !basis.active;
    firebaseService.updateServiceBasis(basis.id, { active: newActive });
    onSaveBases(firebaseService.getServiceBases());
    onShowToast(`Service-Basis "${basis.name}" ist jetzt ${newActive ? 'aktiviert' : 'deaktiviert'}.`);
  };

  // Handler: Reorder Bases
  const handleMoveBase = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= serviceBases.length) return;

    const listCopy = [...serviceBases];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    const reorderedIds = listCopy.map(b => b.id);
    const reordered = firebaseService.reorderServiceBases(reorderedIds);
    onSaveBases(reordered);
    onShowToast('Reihenfolge der Service-Basen angepasst.');
  };

  // Handler: Open Add Subcategory Modal
  const handleOpenAddSubcategory = (basisId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const basis = serviceBases.find(b => b.id === basisId);
    setNewSubcategoryBasisId(basisId);
    setSubcategoryForm({
      name: '',
      code: '',
      description: '',
      defaultPrice: 0,
      defaultTaxRate: basis?.defaultTaxRate || '19%',
      estimatedDurationMinutes: 60,
      active: true
    });
  };

  // Handler: Open Edit Subcategory Modal
  const handleOpenEditSubcategory = (basisId: string, sub: ServiceSubcategory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSubcategory({ basisId, sub });
    setSubcategoryForm({
      name: sub.name,
      code: sub.code || '',
      description: sub.description || '',
      defaultPrice: sub.defaultPrice ?? 0,
      defaultTaxRate: sub.defaultTaxRate || '19%',
      estimatedDurationMinutes: sub.estimatedDurationMinutes ?? 60,
      active: sub.active ?? true
    });
  };

  // Handler: Save Subcategory (New or Edit)
  const handleSaveSubcategory = () => {
    if (!subcategoryForm.name?.trim()) {
      alert('Bitte geben Sie einen Namen für die Unterkategorie ein.');
      return;
    }

    if (editingSubcategory) {
      firebaseService.updateServiceSubcategory(editingSubcategory.basisId, editingSubcategory.sub.id, {
        name: subcategoryForm.name.trim(),
        code: subcategoryForm.code?.trim().toUpperCase(),
        description: subcategoryForm.description?.trim(),
        defaultPrice: Number(subcategoryForm.defaultPrice) || 0,
        defaultTaxRate: subcategoryForm.defaultTaxRate || '19%',
        estimatedDurationMinutes: Number(subcategoryForm.estimatedDurationMinutes) || 0,
        active: subcategoryForm.active ?? true
      });
      onSaveBases(firebaseService.getServiceBases());
      onShowToast(`Unterkategorie "${subcategoryForm.name}" erfolgreich gespeichert.`);
      setEditingSubcategory(null);
    } else if (newSubcategoryBasisId) {
      firebaseService.addServiceSubcategory(newSubcategoryBasisId, {
        name: subcategoryForm.name.trim(),
        code: subcategoryForm.code?.trim().toUpperCase(),
        description: subcategoryForm.description?.trim(),
        defaultPrice: Number(subcategoryForm.defaultPrice) || 0,
        defaultTaxRate: subcategoryForm.defaultTaxRate || '19%',
        estimatedDurationMinutes: Number(subcategoryForm.estimatedDurationMinutes) || 0,
        active: subcategoryForm.active ?? true,
        orderIndex: 99
      });
      onSaveBases(firebaseService.getServiceBases());
      setExpandedBaseIds(prev => new Set([...prev, newSubcategoryBasisId]));
      onShowToast(`Neue Unterkategorie "${subcategoryForm.name}" angelegt.`);
      setNewSubcategoryBasisId(null);
    }
  };

  // Handler: Toggle Subcategory Active
  const handleToggleSubActive = (basisId: string, sub: ServiceSubcategory) => {
    const newActive = !sub.active;
    firebaseService.updateServiceSubcategory(basisId, sub.id, { active: newActive });
    onSaveBases(firebaseService.getServiceBases());
    onShowToast(`Unterkategorie "${sub.name}" ist nun ${newActive ? 'aktiviert' : 'deaktiviert'}.`);
  };

  // Handler: Move Subcategory
  const handleMoveSubcategory = (basisId: string, subIndex: number, direction: 'up' | 'down') => {
    const basis = serviceBases.find(b => b.id === basisId);
    if (!basis) return;
    const subs = [...(basis.subcategories || [])];
    const targetIndex = direction === 'up' ? subIndex - 1 : subIndex + 1;
    if (targetIndex < 0 || targetIndex >= subs.length) return;

    const temp = subs[subIndex];
    subs[subIndex] = subs[targetIndex];
    subs[targetIndex] = temp;

    const reorderedIds = subs.map(s => s.id);
    firebaseService.reorderServiceSubcategories(basisId, reorderedIds);
    onSaveBases(firebaseService.getServiceBases());
    onShowToast('Reihenfolge der Unterkategorien aktualisiert.');
  };

  // Confirm Delete Execution
  const handleExecuteDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'basis') {
      firebaseService.deleteServiceBasis(deleteConfirm.basisId);
      onSaveBases(firebaseService.getServiceBases());
      onShowToast(`Service-Basis "${deleteConfirm.title}" wurde gelöscht.`);
    } else if (deleteConfirm.type === 'subcategory' && deleteConfirm.subId) {
      firebaseService.deleteServiceSubcategory(deleteConfirm.basisId, deleteConfirm.subId);
      onSaveBases(firebaseService.getServiceBases());
      onShowToast(`Unterkategorie "${deleteConfirm.title}" wurde gelöscht.`);
    }
    setDeleteConfirm(null);
  };

  // Restore Default Service Bases
  const handleRestoreDefaults = () => {
    if (window.confirm('Möchten Sie den Standard-KFZ-Servicekatalog mit allen Basiskategorien und Unterkategorien wiederherstellen?')) {
      firebaseService.saveServiceBases(DEFAULT_SERVICE_BASES);
      onSaveBases(DEFAULT_SERVICE_BASES);
      setExpandedBaseIds(new Set(DEFAULT_SERVICE_BASES.map(b => b.id)));
      onShowToast('Standard-KFZ-Katalog erfolgreich wiederhergestellt.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Action Bar */}
      <div className="metallic-card-luminous p-5 sm:p-6 rounded-3xl border border-white/30 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-800 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Selbst gestalten • Service-Basis & Unterkategorien</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Service-Basis & Unterkategorien konfigurieren
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              Verwalten Sie Hauptkategorien (Service-Basis) und zugehörige Unterkategorien für Werkstattleistungen, Aufbereitung, Reparaturen und Ausgaben.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRestoreDefaults}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/70 hover:bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 shadow-xs transition cursor-pointer hover:text-slate-900"
              title="Standardkatalog wiederherstellen"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Standards laden</span>
            </button>
            <button
              id="btn-add-service-basis"
              onClick={handleOpenAddBase}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Neue Service-Basis anlegen</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/60">
          <div className="p-3 bg-white/60 rounded-2xl border border-white/50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Service-Basen</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
              <span>{stats.totalBases}</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full border border-emerald-200">
                {stats.activeBases} aktiv
              </span>
            </div>
          </div>
          <div className="p-3 bg-white/60 rounded-2xl border border-white/50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Unterkategorien</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
              <span>{stats.totalSubs}</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded-full border border-blue-200">
                {stats.activeSubs} aktiv
              </span>
            </div>
          </div>
          <div className="p-3 bg-white/60 rounded-2xl border border-white/50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Einsatzbereiche</div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate">
              Fahrzeugkosten & Finanzen
            </div>
          </div>
          <div className="p-3 bg-white/60 rounded-2xl border border-white/50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Synchronisation</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Automatisch aktiv</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/50 p-3 rounded-2xl border border-white/40 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Kategorie oder Unterkategorie suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-8 py-2 bg-white rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setFilterActiveOnly(!filterActiveOnly)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
              filterActiveOnly 
                ? 'bg-blue-100 text-blue-800 border-blue-300' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Nur aktive</span>
          </button>
          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer"
            title="Alle aufklappen"
          >
            Alle öffnen
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer"
            title="Alle zuklappen"
          >
            Alle schließen
          </button>
        </div>
      </div>

      {/* 3. Service Bases List */}
      <div className="space-y-4">
        {filteredBases.length === 0 ? (
          <div className="metallic-card-luminous p-12 rounded-3xl border border-white/30 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
              <Sliders className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-800">Keine Service-Basen gefunden</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery 
                ? `Für den Suchbegriff "${searchQuery}" wurden keine passenden Kategorien oder Unterkategorien gefunden.`
                : 'Es sind aktuell keine Service-Basen hinterlegt. Legen Sie jetzt eine neue Kategorie an.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer"
              >
                Suche zurücksetzen
              </button>
            ) : (
              <button
                onClick={handleOpenAddBase}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Erste Service-Basis anlegen
              </button>
            )}
          </div>
        ) : (
          filteredBases.map((basis, baseIndex) => {
            const isExpanded = expandedBaseIds.has(basis.id);
            const colorCfg = getColorConfig(basis.color);
            const subs = basis.subcategories || [];

            return (
              <div 
                key={basis.id}
                id={`service-basis-card-${basis.id}`}
                className={`metallic-card-luminous rounded-3xl border transition shadow-sm overflow-hidden ${
                  basis.active ? 'border-white/40' : 'border-slate-200 opacity-75 bg-slate-50/50'
                }`}
              >
                {/* Basis Header Bar */}
                <div 
                  onClick={() => toggleExpand(basis.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none hover:bg-white/40 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleExpand(basis.id); }}
                      className="p-1 text-slate-400 hover:text-slate-700 transition"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-700" /> : <ChevronRight className="w-5 h-5" />}
                    </button>

                    {/* Icon Badge */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${colorCfg.bgClass} ${colorCfg.borderClass} ${colorCfg.textClass} shadow-xs`}>
                      {renderCategoryIcon(basis.icon, 'w-5 h-5')}
                    </div>

                    {/* Titles */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                          {basis.name}
                        </h3>
                        {basis.code && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-900/10 text-slate-800 rounded-md border border-slate-200">
                            {basis.code}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          basis.active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                          {basis.active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                          MwSt: {basis.defaultTaxRate || '19%'}
                        </span>
                      </div>
                      {basis.description && (
                        <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                          {basis.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Header Toolbar */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-bold text-slate-500 mr-2 bg-slate-100/80 px-2 py-1 rounded-lg border border-slate-200">
                      {subs.length} Unterkategori{subs.length === 1 ? 'e' : 'en'}
                    </span>

                    {/* Move Up / Down */}
                    <button
                      onClick={(e) => handleMoveBase(baseIndex, 'up', e)}
                      disabled={baseIndex === 0}
                      className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Nach oben verschieben"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleMoveBase(baseIndex, 'down', e)}
                      disabled={baseIndex === serviceBases.length - 1}
                      className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Nach unten verschieben"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Active */}
                    <button
                      onClick={(e) => handleToggleBaseActive(basis, e)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        basis.active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                      title={basis.active ? 'Basis deaktivieren' : 'Basis aktivieren'}
                    >
                      {basis.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Add Subcategory */}
                    <button
                      onClick={(e) => handleOpenAddSubcategory(basis.id, e)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg border border-blue-200 shadow-2xs transition cursor-pointer"
                      title="Unterkategorie hinzufügen"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Unterkategorie</span>
                    </button>

                    {/* Edit Base */}
                    <button
                      onClick={(e) => handleOpenEditBase(basis, e)}
                      className="p-1.5 text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 rounded-lg border border-slate-200 transition cursor-pointer"
                      title="Service-Basis bearbeiten"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Base */}
                    <button
                      onClick={() => setDeleteConfirm({
                        type: 'basis',
                        basisId: basis.id,
                        title: basis.name
                      })}
                      className="p-1.5 text-rose-600 hover:text-rose-800 bg-white hover:bg-rose-50 rounded-lg border border-slate-200 transition cursor-pointer"
                      title="Service-Basis löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Collapsible Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-200/60 bg-white/40">
                    <div className="flex items-center justify-between py-2.5 mb-2">
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span>Zugeordnete Unterkategorien ({subs.length})</span>
                      </span>
                      <button
                        onClick={() => handleOpenAddSubcategory(basis.id)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Unterkategorie hinzufügen</span>
                      </button>
                    </div>

                    {subs.length === 0 ? (
                      <div className="p-6 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                        <p className="text-xs font-semibold text-slate-500">
                          Noch keine Unterkategorien für "{basis.name}" angelegt.
                        </p>
                        <button
                          onClick={() => handleOpenAddSubcategory(basis.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Erste Unterkategorie erstellen
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {subs.map((sub, subIndex) => (
                          <div
                            key={sub.id}
                            id={`subcat-row-${sub.id}`}
                            className={`p-3 bg-white rounded-2xl border transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              sub.active ? 'border-slate-200/80 hover:border-blue-300' : 'border-slate-200 opacity-60 bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-black shrink-0 border border-slate-200">
                                {subIndex + 1}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                                    {sub.name}
                                  </span>
                                  {sub.code && (
                                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                      {sub.code}
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                    sub.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}>
                                    {sub.active ? 'Aktiv' : 'Inaktiv'}
                                  </span>
                                </div>
                                {sub.description && (
                                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                    {sub.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Meta Badges & Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <div className="flex items-center gap-2">
                                {sub.defaultPrice !== undefined && sub.defaultPrice > 0 && (
                                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                                    <Euro className="w-3 h-3 text-slate-500" />
                                    <span>{sub.defaultPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                                  </span>
                                )}
                                {sub.estimatedDurationMinutes !== undefined && sub.estimatedDurationMinutes > 0 && (
                                  <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{sub.estimatedDurationMinutes} Min.</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleMoveSubcategory(basis.id, subIndex, 'up')}
                                  disabled={subIndex === 0}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Nach oben"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveSubcategory(basis.id, subIndex, 'down')}
                                  disabled={subIndex === subs.length - 1}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Nach unten"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleToggleSubActive(basis.id, sub)}
                                  className={`p-1 rounded cursor-pointer ${
                                    sub.active ? 'text-emerald-600 hover:text-emerald-800' : 'text-slate-400 hover:text-slate-600'
                                  }`}
                                  title={sub.active ? 'Deaktivieren' : 'Aktivieren'}
                                >
                                  {sub.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleOpenEditSubcategory(basis.id, sub)}
                                  className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                                  title="Unterkategorie bearbeiten"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({
                                    type: 'subcategory',
                                    basisId: basis.id,
                                    subId: sub.id,
                                    title: sub.name
                                  })}
                                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Unterkategorie löschen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL: SERVICE-BASIS (Neu / Bearbeiten) */}
      {/* ======================================================== */}
      {(isNewBaseModalOpen || editingBase) && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {editingBase ? 'Service-Basis bearbeiten' : 'Neue Service-Basis anlegen'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Definieren Sie eine Hauptkategorie für Dienstleistungen und Ausgaben
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsNewBaseModalOpen(false); setEditingBase(null); }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Name der Service-Basis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="z.B. Werkstatt & Mechanik, Aufbereitung, Smart Repair..."
                  value={baseForm.name || ''}
                  onChange={(e) => setBaseForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl text-sm font-semibold text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Code & Steuersatz */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kürzel / Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. SRV-WERKSTATT"
                    value={baseForm.code || ''}
                    onChange={(e) => setBaseForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl text-sm font-mono font-bold text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Standard-Steuersatz
                  </label>
                  <select
                    value={baseForm.defaultTaxRate || '19%'}
                    onChange={(e) => setBaseForm(prev => ({ ...prev, defaultTaxRate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl text-sm font-semibold text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="19%">19% Regelbesteuerung (Regelbesteuert)</option>
                    <option value="0%">0% Steuerfrei / Durchlaufend</option>
                    <option value="diff_25a">§ 25a UStG Differenzbesteuerung</option>
                  </select>
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kategorie-Symbol (Icon)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((ic) => {
                    const isSelected = (baseForm.icon || 'Wrench') === ic.id;
                    const IconComp = ic.icon;
                    return (
                      <button
                        type="button"
                        key={ic.id}
                        onClick={() => setBaseForm(prev => ({ ...prev, icon: ic.id }))}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20 shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[9px] font-bold truncate max-w-full">{ic.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Farbschema
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {AVAILABLE_COLORS.map((col) => {
                    const isSelected = (baseForm.color || 'blue') === col.id;
                    return (
                      <button
                        type="button"
                        key={col.id}
                        onClick={() => setBaseForm(prev => ({ ...prev, color: col.id }))}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${col.bgClass} ${col.borderClass} ${col.textClass} ${
                          isSelected ? 'ring-2 ring-slate-800 shadow-xs' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{col.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Beschreibung / Einsatzbereich
                </label>
                <textarea
                  rows={2}
                  placeholder="Kurze Beschreibung, welche Tätigkeiten unter diese Basis fallen..."
                  value={baseForm.description || ''}
                  onChange={(e) => setBaseForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 rounded-xl text-xs font-medium text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Status dieser Service-Basis</span>
                <button
                  type="button"
                  onClick={() => setBaseForm(prev => ({ ...prev, active: !prev.active }))}
                  className={`px-3 py-1 text-xs font-black rounded-lg border transition cursor-pointer ${
                    baseForm.active ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {baseForm.active ? 'Aktiviert' : 'Deaktiviert'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setIsNewBaseModalOpen(false); setEditingBase(null); }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSaveBase}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                {editingBase ? 'Änderungen speichern' : 'Service-Basis erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: UNTERKATEGORIE (Neu / Bearbeiten) */}
      {/* ======================================================== */}
      {(newSubcategoryBasisId || editingSubcategory) && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {editingSubcategory ? 'Unterkategorie bearbeiten' : 'Neue Unterkategorie anlegen'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Spezifische Leistung mit Richtpreis und Standarddauer
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setNewSubcategoryBasisId(null); setEditingSubcategory(null); }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Name der Unterkategorie <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="z.B. Große Inspektion, Keramikversiegelung, Bremsenwechsel..."
                  value={subcategoryForm.name || ''}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl text-sm font-semibold text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Code & Richtpreis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kürzel / Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. INSP-01"
                    value={subcategoryForm.code || ''}
                    onChange={(e) => setSubcategoryForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl text-sm font-mono font-bold text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Standard-Richtpreis (€ netto/brutto)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={subcategoryForm.defaultPrice ?? ''}
                      onChange={(e) => setSubcategoryForm(prev => ({ ...prev, defaultPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 rounded-xl text-sm font-bold text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">€</span>
                  </div>
                </div>
              </div>

              {/* Richtdauer & Steuersatz */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Richtdauer (in Minuten)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="5"
                      min="0"
                      placeholder="60"
                      value={subcategoryForm.estimatedDurationMinutes ?? ''}
                      onChange={(e) => setSubcategoryForm(prev => ({ ...prev, estimatedDurationMinutes: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 rounded-xl text-sm font-bold text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">Min.</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Steuersatz
                  </label>
                  <select
                    value={subcategoryForm.defaultTaxRate || '19%'}
                    onChange={(e) => setSubcategoryForm(prev => ({ ...prev, defaultTaxRate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl text-sm font-semibold text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="19%">19% MwSt.</option>
                    <option value="0%">0% MwSt.</option>
                    <option value="diff_25a">Differenzbesteuert</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Leistungsbeschreibung / Tätigkeitsumfang
                </label>
                <textarea
                  rows={2}
                  placeholder="Details zur Durchführung, inklusive Teile oder Arbeitsumfang..."
                  value={subcategoryForm.description || ''}
                  onChange={(e) => setSubcategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 rounded-xl text-xs font-medium text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Status dieser Unterkategorie</span>
                <button
                  type="button"
                  onClick={() => setSubcategoryForm(prev => ({ ...prev, active: !prev.active }))}
                  className={`px-3 py-1 text-xs font-black rounded-lg border transition cursor-pointer ${
                    subcategoryForm.active ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {subcategoryForm.active ? 'Aktiviert' : 'Deaktiviert'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setNewSubcategoryBasisId(null); setEditingSubcategory(null); }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSaveSubcategory}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                {editingSubcategory ? 'Unterkategorie aktualisieren' : 'Unterkategorie hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: DELETE CONFIRMATION */}
      {/* ======================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {deleteConfirm.type === 'basis' ? 'Service-Basis löschen?' : 'Unterkategorie löschen?'}
                </h3>
                <p className="text-xs text-slate-500">
                  Dieser Vorgang kann nicht rückgängig gemacht werden.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200/80 text-xs text-rose-900 space-y-1">
              <div className="font-bold">Ausgewähltes Element:</div>
              <div className="font-black text-sm text-rose-950">"{deleteConfirm.title}"</div>
              {deleteConfirm.type === 'basis' && (
                <div className="text-[11px] text-rose-700 pt-1">
                  Hinweis: Alle in dieser Service-Basis enthaltenen Unterkategorien werden ebenfalls entfernt.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Unwiderruflich löschen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
