import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Search, 
  FileText, 
  Check, 
  Plus, 
  Sparkles, 
  Bookmark, 
  ShieldCheck, 
  Globe, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { TextTemplate, TextTemplateCategory } from '../../types';
import { firebaseService } from '../../services/firebaseService';

interface TextTemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (content: string, targetField: 'intro' | 'notes' | 'warranty' | 'export') => void;
}

export const TextTemplateSelectorModal: React.FC<TextTemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate
}) => {
  const [templates, setTemplates] = useState<TextTemplate[]>(() => firebaseService.getTextTemplates());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetField, setTargetField] = useState<'intro' | 'notes' | 'warranty' | 'export'>('intro');
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);

  // New template quick-create state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TextTemplateCategory>('welcome');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    const unsub = firebaseService.subscribeTextTemplates(setTemplates);
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  // Additional built-in preset templates for easy automotive trade operation
  const allTemplates: TextTemplate[] = [
    ...templates,
    {
      id: 'tpl-export-eu',
      category: 'welcome',
      title: 'EU-Export Klausel (§ 4 Nr. 1b UStG)',
      content: 'Innergemeinschaftliche steuerfreie Lieferung gem. § 4 Nr. 1b UStG i.V.m. § 6a UStG. Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge). Die Verpflichtung zur Rücksendung der Gelangensbestätigung gilt als vereinbart.',
      isDefault: false,
      orderIndex: 90,
      tags: ['Export', 'EU', 'Steuerfrei'],
      createdAt: '2026-08-01T00:00:00.000Z'
    },
    {
      id: 'tpl-export-drittland',
      category: 'welcome',
      title: 'Drittland Ausfuhrklausel (§ 4 Nr. 1a UStG)',
      content: 'Steuerfreie Ausfuhrlieferung gem. § 4 Nr. 1a UStG i.V.m. § 6 UStG in das Drittland. Der Ausfuhrnachweis erfolgt über den elektronischen Ausgangsvermerk des Ausfuhrzollamtes (ATLAS / MRN).',
      isDefault: false,
      orderIndex: 91,
      tags: ['Export', 'Drittland', 'Zoll'],
      createdAt: '2026-08-01T00:00:00.000Z'
    },
    {
      id: 'tpl-diff-25a',
      category: 'welcome',
      title: 'Differenzbesteuerung § 25a UStG Hinweis',
      content: 'Gebrauchtgegenstände / Sonderregelung nach § 25a UStG (Differenzbesteuerung). Ein gesonderter Ausweis der Umsatzsteuer auf der Rechnung ist gesetzlich ausgeschlossen.',
      isDefault: false,
      orderIndex: 92,
      tags: ['§ 25a', 'Gebrauchtwagen'],
      createdAt: '2026-08-01T00:00:00.000Z'
    },
    {
      id: 'tpl-payment-terms-14',
      category: 'warranty',
      title: 'Zahlungsziel 14 Tage netto',
      content: 'Zahlbar rein netto innerhalb von 14 Tagen ab Rechnungsdatum ohne jeden Abzug. Bitte geben Sie bei der Überweisung unbedingt die Belegnummer als Verwendungszweck an.',
      isDefault: false,
      orderIndex: 93,
      tags: ['Zahlung', '14 Tage'],
      createdAt: '2026-08-01T00:00:00.000Z'
    },
    {
      id: 'tpl-payment-pickup',
      category: 'warranty',
      title: 'Zahlung bei Fahrzeugübergabe / Abholung',
      content: 'Der Rechnungsbetrag ist spätestens bei Fahrzeugabholung in bar oder per vorab eingegangener bankbestätigter Überweisung zur Zahlung fällig.',
      isDefault: false,
      orderIndex: 94,
      tags: ['Zahlung', 'Abholung'],
      createdAt: '2026-08-01T00:00:00.000Z'
    }
  ];

  // Filter templates
  const filteredTemplates = allTemplates.filter(t => {
    const matchesCat = selectedCategory === 'all' || 
      (selectedCategory === 'welcome' && t.category === 'welcome') ||
      (selectedCategory === 'warranty' && t.category === 'warranty') ||
      (selectedCategory === 'export' && (t.tags?.includes('Export') || t.title.includes('Export')));

    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      t.title.toLowerCase().includes(q) || 
      t.content.toLowerCase().includes(q) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)));

    return matchesCat && matchesSearch;
  });

  const handleApply = (tpl: TextTemplate) => {
    onApplyTemplate(tpl.content, targetField);
    setAppliedTemplateId(tpl.id);
    onClose();
  };

  const handleSaveNewTemplate = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newTpl: TextTemplate = {
      id: `tpl-user-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      isDefault: false,
      orderIndex: templates.length + 1,
      tags: ['Benutzerdefiniert'],
      createdAt: new Date().toISOString()
    };

    firebaseService.saveTextTemplate(newTpl);
    setIsCreatingNew(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto print:hidden">
      <div className="metallic-modal-container rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-600/60 space-y-4 my-0 sm:my-1 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center font-bold">
              <Menu className="w-5 h-5 metallic-debossed-icon" />
            </div>
            <div>
              <h3 className="font-black text-slate-100 text-base flex items-center gap-2">
                <span>Textvorlagen-Manager</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {filteredTemplates.length} Vorlagen
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Wählen Sie vorgefertigte Begrüßungs-, Gewährleistungs- und Export-Texte zur sofortigen Übernahme
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer transition p-1"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        {/* Target Field Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 metallic-card rounded-2xl border border-slate-700/60">
          <span className="text-xs font-bold text-slate-300">
            Einfügen in Belegabschnitt:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTargetField('intro')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                targetField === 'intro' 
                  ? 'metallic-btn-primary text-slate-950 font-black' 
                  : 'metallic-btn-secondary text-slate-300 hover:text-white'
              }`}
            >
              Einleitung / Kopftext
            </button>
            <button
              type="button"
              onClick={() => setTargetField('warranty')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                targetField === 'warranty' 
                  ? 'metallic-btn-primary text-slate-950 font-black' 
                  : 'metallic-btn-secondary text-slate-300 hover:text-white'
              }`}
            >
              Gewährleistung
            </button>
            <button
              type="button"
              onClick={() => setTargetField('export')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                targetField === 'export' 
                  ? 'metallic-btn-primary text-slate-950 font-black' 
                  : 'metallic-btn-secondary text-slate-300 hover:text-white'
              }`}
            >
              Exportklausel
            </button>
            <button
              type="button"
              onClick={() => setTargetField('notes')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                targetField === 'notes' 
                  ? 'metallic-btn-primary text-slate-950 font-black' 
                  : 'metallic-btn-secondary text-slate-300 hover:text-white'
              }`}
            >
              Bemerkungen
            </button>
          </div>
        </div>

        {/* Search and Category Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 metallic-debossed-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vorlagen durchsuchen (z. B. B2C, Sachmängelhaftung, Export, § 25a, Zahlung)..."
              className="metallic-input w-full pl-10 pr-4 py-2 text-xs font-medium text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                selectedCategory === 'all' 
                  ? 'metallic-btn-primary text-slate-950 font-black' 
                  : 'metallic-btn-secondary text-slate-300 hover:text-white'
              }`}
            >
              Alle Vorlagen
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('welcome')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                selectedCategory === 'welcome' 
                  ? 'metallic-btn-primary text-slate-950 font-black' 
                  : 'metallic-btn-secondary text-slate-300 hover:text-white'
              }`}
            >
              Begrüßung & Kopftext
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('warranty')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                selectedCategory === 'warranty' 
                  ? 'metallic-btn-primary text-slate-950 font-black' 
                  : 'metallic-btn-secondary text-slate-300 hover:text-white'
              }`}
            >
              Gewährleistung & Garantie
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('export')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                selectedCategory === 'export' 
                  ? 'metallic-btn-primary text-slate-950 font-black' 
                  : 'metallic-btn-secondary text-slate-300 hover:text-white'
              }`}
            >
              Export & Steuerrecht
            </button>
          </div>
        </div>

        {/* Templates List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredTemplates.map(tpl => {
            const isApplied = appliedTemplateId === tpl.id;
            return (
              <div
                key={tpl.id}
                className={`p-3.5 rounded-2xl border transition text-left flex flex-col justify-between gap-2.5 ${
                  isApplied 
                    ? 'metallic-card border-emerald-400 text-white' 
                    : 'metallic-card border-slate-700/60 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-emerald-300">{tpl.title}</span>
                      {tpl.isDefault && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                          Standard
                        </span>
                      )}
                    </div>
                    {tpl.tags && tpl.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {tpl.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-bold metallic-pill text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3">
                    {tpl.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                  <span className="text-[11px] text-slate-400">
                    Kategorie: {tpl.category === 'welcome' ? 'Kopfzeile / Begrüßung' : 'Gewährleistung / Schlusstext'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApply(tpl)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      isApplied
                        ? 'metallic-btn-primary text-slate-950 font-black'
                        : 'metallic-btn-secondary text-slate-200 hover:text-white'
                    }`}
                  >
                    {isApplied ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    <span>{isApplied ? 'Übernommen' : 'Vorlage übernehmen'}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Keine passenden Textvorlagen gefunden.
            </div>
          )}
        </div>

        {/* Create Custom Template Accordion */}
        {!isCreatingNew ? (
          <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5 cursor-pointer transition"
            >
              <Plus className="w-4 h-4 metallic-debossed-icon" />
              <span>Neue eigene Vorlage anlegen</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="metallic-btn-secondary px-4 py-2 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
            >
              Schließen
            </button>
          </div>
        ) : (
          <div className="p-4 metallic-card border border-slate-700/60 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Neue Textvorlage speichern</span>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Abbrechen
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Titel der Vorlage</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="z. B. Sondervereinbarung Inspektion neu"
                  className="w-full px-3 py-2 metallic-input text-xs text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategorie</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 metallic-input text-xs text-slate-100 outline-none"
                >
                  <option value="welcome">Begrüßung / Kopfzeile</option>
                  <option value="warranty">Gewährleistung / Klausel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Inhaltlicher Text</label>
              <textarea
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Geben Sie den Text ein..."
                className="w-full px-3 py-2 metallic-input text-xs text-slate-100 outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="metallic-btn-secondary px-3 py-1.5 text-xs text-slate-300 rounded-xl"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSaveNewTemplate}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="metallic-btn-primary px-4 py-1.5 text-xs font-black text-slate-950 rounded-xl disabled:opacity-50 cursor-pointer active:scale-95"
              >
                In Vorlagen speichern
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
