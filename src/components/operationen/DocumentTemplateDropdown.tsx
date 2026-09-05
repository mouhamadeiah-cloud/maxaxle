import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Globe, ChevronDown, Check } from 'lucide-react';
import { TextTemplateCategory } from '../../types';
import { DocumentTextController } from '../../controllers/DocumentTextController';

interface DocumentTemplateDropdownProps {
  category: TextTemplateCategory;
  onSelect: (content: string) => void;
  activeText?: string;
  buttonLabel?: string;
  variant?: 'emerald-glass' | 'light-document' | 'compact-subtle';
  className?: string;
}

export const DocumentTemplateDropdown: React.FC<DocumentTemplateDropdownProps> = ({
  category,
  onSelect,
  activeText = '',
  buttonLabel,
  variant = 'emerald-glass',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const templates = DocumentTextController.getTemplatesByCategory(category);

  // Default labels and icons per category
  const defaultLabels = {
    welcome: 'Begrüßung wählen',
    warranty: 'Gewährleistung wählen',
    export: 'Exportklausel wählen'
  };

  const label = buttonLabel || defaultLabels[category];

  const CategoryIcon = category === 'welcome' 
    ? Sparkles 
    : category === 'warranty' 
    ? ShieldCheck 
    : Globe;

  if (templates.length === 0) {
    return null;
  }

  // Variant styling
  const buttonStyles = {
    'emerald-glass': 'metallic-btn-secondary px-2.5 py-1 text-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95',
    'light-document': 'px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer print:hidden',
    'compact-subtle': 'metallic-btn-secondary px-2 py-1 text-slate-200 rounded-md text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer active:scale-95'
  }[variant];

  const menuStyles = {
    'emerald-glass': 'absolute right-0 top-full mt-1.5 w-80 metallic-modal-container p-2 shadow-2xl z-50 text-left',
    'light-document': 'absolute right-0 top-full mt-1 w-72 bg-white border border-slate-300 rounded-xl p-2 shadow-2xl z-50 text-left text-slate-800 print:hidden',
    'compact-subtle': 'absolute right-0 top-full mt-1.5 w-80 metallic-modal-container p-2 shadow-2xl z-50 text-left'
  }[variant];

  const categoryTitles = {
    welcome: 'Begrüßungstexte',
    warranty: 'Garantie- & Gewährleistungsklauseln',
    export: 'Export- & Zollklauseln'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* SINGLE UNIFIED TRIGGER BUTTON */}
      <button
        type="button"
        id={`template-trigger-${category}`}
        onClick={() => setIsOpen(!isOpen)}
        className={buttonStyles}
      >
        <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* DROPDOWN MENU WITH ATOMIC AUTO-CLOSE */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className={menuStyles}>
            <div className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-wider border-b flex justify-between items-center mb-1.5 ${
              variant === 'light-document' 
                ? 'text-slate-500 border-slate-200' 
                : 'text-emerald-400/90 border-emerald-500/20'
            }`}>
              <span>{categoryTitles[category]}</span>
              <span className="font-semibold text-[9px] lowercase opacity-80">
                {templates.length} Vorlagen
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {templates.map((tpl) => {
                const isCurrent = activeText && activeText.trim() === tpl.content.trim();

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      DocumentTextController.handleSelectTemplate(
                        tpl,
                        onSelect,
                        () => setIsOpen(false)
                      );
                    }}
                    className={`w-full text-left p-2 rounded-xl transition group text-xs cursor-pointer border ${
                      variant === 'light-document'
                        ? isCurrent
                          ? 'bg-blue-50 border-blue-300 text-blue-900'
                          : 'hover:bg-slate-100 border-transparent hover:border-slate-200 text-slate-800'
                        : isCurrent
                        ? 'metallic-card-luminous border-emerald-400/40 text-emerald-200 shadow-md'
                        : 'metallic-card border-slate-700/50 hover:border-slate-500/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5">
                        {isCurrent && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                        <span className={`font-bold text-xs ${
                          variant === 'light-document' 
                            ? 'text-slate-900 group-hover:text-blue-600' 
                            : isCurrent ? 'text-emerald-300' : 'text-slate-200 group-hover:text-emerald-300'
                        }`}>
                          {tpl.title}
                        </span>
                      </div>
                      {tpl.isDefault && (
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border shrink-0 ${
                          variant === 'light-document'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30'
                        }`}>
                          Standard
                        </span>
                      )}
                    </div>
                    <p className={`text-[10.5px] line-clamp-2 leading-relaxed ${
                      variant === 'light-document' ? 'text-slate-500' : 'text-slate-400 group-hover:text-slate-300'
                    }`}>
                      {tpl.content}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
