import React from 'react';
import { InvoiceTextTemplate } from '../../../types';
import { FileText, X } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTemplate: InvoiceTextTemplate | null;
  templateCategoryTab: 'welcome' | 'warranty' | 'export';
  templateForm: Partial<InvoiceTextTemplate>;
  setTemplateForm: React.Dispatch<React.SetStateAction<Partial<InvoiceTextTemplate>>>;
  handleSaveTemplate: (e: React.FormEvent) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  editingTemplate,
  templateCategoryTab,
  templateForm,
  setTemplateForm,
  handleSaveTemplate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-card-luminous rounded-3xl max-w-lg w-full shadow-2xl border border-white/80 overflow-hidden animate-in fade-in zoom-in-95 my-0 sm:my-1 max-h-[92vh] flex flex-col">
        <div className="p-5 border-b border-white/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900/10 text-slate-950 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 metallic-debossed-icon text-slate-800" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base">
                {editingTemplate ? 'Textvorlage bearbeiten' : 'Neue Textvorlage anlegen'}
              </h3>
              <p className="text-xs text-slate-700 font-semibold">
                {templateCategoryTab === 'welcome' 
                  ? 'Begrüßungstext / Kopfzeile' 
                  : templateCategoryTab === 'warranty'
                  ? 'Garantie- & Gewährleistungsklausel'
                  : 'Export- & Zollklausel'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-white/60 transition cursor-pointer"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        <form onSubmit={handleSaveTemplate} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-black text-slate-900 mb-1">Titel / Bezeichnung der Vorlage *</label>
            <input
              type="text"
              required
              value={templateForm.title || ''}
              onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
              placeholder={
                templateCategoryTab === 'welcome' 
                  ? 'z.B. Standard Rechnungskopf B2C' 
                  : templateCategoryTab === 'warranty'
                  ? 'z.B. 12 Monate Händler-Gewährleistung'
                  : 'z.B. EU-Export Steuerfreie Lieferung § 6a UStG'
              }
              className="metallic-input w-full p-2.5 rounded-xl font-bold text-slate-950"
            />
          </div>

          <div>
            <label className="block font-black text-slate-900 mb-1">Vollständiger Textinhalt *</label>
            <textarea
              rows={5}
              required
              value={templateForm.content || ''}
              onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
              placeholder="Geben Sie hier den genauen Text ein, der auf die Rechnung gedruckt werden soll..."
              className="metallic-input w-full p-3 rounded-xl leading-relaxed font-sans font-medium text-slate-950"
            />
          </div>

          <div className="metallic-inner-subbox p-3 rounded-xl border border-white/60 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="tplDefaultCheckbox"
              checked={templateForm.isDefault || false}
              onChange={(e) => setTemplateForm({ ...templateForm, isDefault: e.target.checked })}
              className="w-4 h-4 text-slate-950 rounded focus:ring-slate-400 border-slate-400"
            />
            <label htmlFor="tplDefaultCheckbox" className="font-bold text-slate-900 text-xs cursor-pointer">
              Als Standard-Vorlage festlegen (wird automatisch in neue Rechnungen eingefügt)
            </label>
          </div>

          <div className="pt-4 border-t border-white/30 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="metallic-btn-secondary px-4 py-2 text-slate-950 font-black rounded-xl transition cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="metallic-btn-primary px-5 py-2 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer"
            >
              Vorlage speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
