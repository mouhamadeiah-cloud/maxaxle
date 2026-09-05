import React from 'react';
import { InvoiceTextTemplate } from '../../types';
import {
  FileText,
  Plus,
  GripVertical,
  Star,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  Check,
  Copy
} from 'lucide-react';

interface TextvorlagenSettingsTabProps {
  handleOpenAddTemplate: () => void;
  templateCategoryTab: 'welcome' | 'warranty' | 'export';
  setTemplateCategoryTab: (tab: 'welcome' | 'warranty' | 'export') => void;
  welcomeTemplates: InvoiceTextTemplate[];
  warrantyTemplates: InvoiceTextTemplate[];
  exportTemplates: InvoiceTextTemplate[];
  currentCategoryList: InvoiceTextTemplate[];
  handleMoveTemplate: (index: number, direction: 'up' | 'down') => void;
  handleOpenEditTemplate: (template: InvoiceTextTemplate) => void;
  handleDeleteTemplate: (id: string) => void;
  handleSetDefaultTemplate: (id: string, category: 'welcome' | 'warranty' | 'export') => void;
  handleCopy: (text: string, fieldKey: string) => void;
  copiedField: string | null;
}

export const TextvorlagenSettingsTab: React.FC<TextvorlagenSettingsTabProps> = ({
  handleOpenAddTemplate,
  templateCategoryTab,
  setTemplateCategoryTab,
  welcomeTemplates,
  warrantyTemplates,
  exportTemplates,
  currentCategoryList,
  handleMoveTemplate,
  handleOpenEditTemplate,
  handleDeleteTemplate,
  handleSetDefaultTemplate,
  handleCopy,
  copiedField
}) => {
  return (
    <div className="metallic-card-luminous rounded-3xl p-6 border border-white/70 shadow-xl space-y-6">
      <div className="pb-4 border-b border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
            <FileText className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            <span>10. Textvorlagen (Rechnungstexte)</span>
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Verwalten Sie modulare Textbausteine für Rechnungen mit Standard-Auswahl und Reihenfolge-Anpassung.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddTemplate}
          className="metallic-btn-primary px-4 py-2 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 metallic-debossed-icon" />
          <span>Vorlage hinzufügen</span>
        </button>
      </div>

      {/* Category Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-white/30 gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTemplateCategoryTab('welcome')}
            className={`pb-3 px-3 text-xs font-black border-b-2 transition cursor-pointer flex items-center gap-2 ${
              templateCategoryTab === 'welcome'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>a) Begrüßungstexte / Kopfzeile</span>
            <span className="metallic-pill px-2 py-0.5 text-[10px] text-slate-900 font-mono font-bold">
              {welcomeTemplates.length}/10
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTemplateCategoryTab('warranty')}
            className={`pb-3 px-3 text-xs font-black border-b-2 transition cursor-pointer flex items-center gap-2 ${
              templateCategoryTab === 'warranty'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>b) Garantie- & Gewährleistungstexte</span>
            <span className="metallic-pill px-2 py-0.5 text-[10px] text-slate-900 font-mono font-bold">
              {warrantyTemplates.length}/10
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTemplateCategoryTab('export')}
            className={`pb-3 px-3 text-xs font-black border-b-2 transition cursor-pointer flex items-center gap-2 ${
              templateCategoryTab === 'export'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>c) Export- & Zollklauseln</span>
            <span className="metallic-pill px-2 py-0.5 text-[10px] text-slate-900 font-mono font-bold">
              {exportTemplates.length}/10
            </span>
          </button>
        </div>

        <span className="text-[11px] text-slate-600 font-bold hidden sm:inline">
          Max. 10 Vorlagen pro Kategorie
        </span>
      </div>

      {/* Templates List with Drag Handle & Actions */}
      <div className="space-y-3">
        {currentCategoryList.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-white/80 bg-white/20 rounded-2xl text-slate-600 font-medium text-xs">
            Keine Textvorlagen in dieser Kategorie vorhanden.
          </div>
        ) : (
          currentCategoryList.map((tpl, index) => (
            <div
              key={tpl.id}
              className={`p-4 rounded-2xl metallic-inner-subbox border transition space-y-2.5 shadow-sm ${
                tpl.isDefault
                  ? 'border-slate-950/40 bg-white/70 ring-1 ring-slate-950/10'
                  : 'border-white/60 hover:border-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-slate-950 cursor-grab shrink-0">
                    <GripVertical className="w-5 h-5 metallic-debossed-icon text-slate-700" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-950 text-sm">{tpl.title}</span>
                      {tpl.isDefault && (
                        <span className="metallic-pill px-2.5 py-0.5 text-slate-950 font-black text-[10px] flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-emerald-500" />
                          <span>Standard-Rechnungstext</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order & Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveTemplate(index, 'up')}
                    className="p-1.5 text-slate-600 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-white/60 transition cursor-pointer"
                    title="Nach oben verschieben"
                  >
                    <ArrowUp className="w-3.5 h-3.5 metallic-debossed-icon" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={index === currentCategoryList.length - 1}
                    onClick={() => handleMoveTemplate(index, 'down')}
                    className="p-1.5 text-slate-600 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-white/60 transition cursor-pointer"
                    title="Nach unten verschieben"
                  >
                    <ArrowDown className="w-3.5 h-3.5 metallic-debossed-icon" />
                  </button>

                  <div className="h-4 w-px bg-white/40 mx-1" />

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditTemplate(tpl)}
                    className="p-1.5 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-white/60 transition cursor-pointer"
                    title="Text bearbeiten"
                  >
                    <Edit3 className="w-3.5 h-3.5 metallic-debossed-icon" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-900 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                    title="Löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5 metallic-debossed-icon" />
                  </button>
                </div>
              </div>

              {/* Text Content */}
              <div className="metallic-input rounded-xl p-3.5 text-xs text-slate-900 leading-relaxed font-sans font-medium">
                {tpl.content}
              </div>

              {/* Footer toggle for Default */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-black text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tpl.isDefault}
                    onChange={() => handleSetDefaultTemplate(tpl.id, tpl.category)}
                    className="w-4 h-4 text-slate-950 rounded focus:ring-slate-400 border-slate-400"
                  />
                  <span>Als Standard in Rechnungen verwenden</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleCopy(tpl.content, tpl.id)}
                  className="text-[11px] text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer font-bold"
                >
                  {copiedField === tpl.id ? (
                    <>
                      <Check className="w-3 h-3 metallic-debossed-icon text-emerald-700" />
                      <span className="text-emerald-700 font-black">Text kopiert</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 metallic-debossed-icon text-slate-800" />
                      <span>Kopieren</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
