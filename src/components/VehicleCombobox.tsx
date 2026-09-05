import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  ChevronDown, 
  Search, 
  X, 
  Sparkles, 
  Layers, 
  Car, 
  PlusCircle,
  Tag
} from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label?: string;
  badge?: string;
  subtext?: string;
  icon?: string;
  category?: string;
}

export const RequiredAsterisk: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span 
    className={`inline-flex items-center text-rose-500 font-bold ml-0.5 cursor-help relative group/req ${className}`}
    title="Eingabe erforderlich"
  >
    <span>*</span>
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/req:flex items-center gap-1 px-2 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-md shadow-xl whitespace-nowrap z-[9999]">
      Eingabe erforderlich
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
    </span>
  </span>
);

interface VehicleComboboxProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[] | string[];
  placeholder?: string;
  dataFirebaseField?: string;
  required?: boolean;
  disabled?: boolean;
  badgeCountText?: string;
  helperText?: string;
  emptyStateText?: string;
  allowCustom?: boolean;
  className?: string;
  onSelectOption?: (option: ComboboxOption | string) => void;
  datalistId?: string;
  filterMode?: 'prefix' | 'contains' | 'smart';
}

export const VehicleCombobox: React.FC<VehicleComboboxProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Wählen oder eingeben...',
  dataFirebaseField,
  required = false,
  disabled = false,
  badgeCountText,
  helperText,
  emptyStateText = 'Kein Standardmodell gefunden. Eigene Eingabe wird direkt übernommen.',
  allowCustom = true,
  className = '',
  onSelectOption,
  datalistId,
  filterMode = 'prefix'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize options to ComboboxOption shape
  const normalizedOptions: ComboboxOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Filter options:
  // When filterMode === 'prefix': filters items starting with searchTerm.
  // When filterMode === 'contains': filters items containing searchTerm.
  // When filterMode === 'smart': prioritizes prefix matches first, then contains matches.
  const filteredOptions = normalizedOptions.filter((opt) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    if (filterMode === 'prefix') {
      return (
        opt.value.toLowerCase().startsWith(term) ||
        (opt.label && opt.label.toLowerCase().startsWith(term))
      );
    } else if (filterMode === 'contains') {
      return (
        opt.value.toLowerCase().includes(term) ||
        (opt.label && opt.label.toLowerCase().includes(term)) ||
        (opt.subtext && opt.subtext.toLowerCase().includes(term)) ||
        (opt.category && opt.category.toLowerCase().includes(term))
      );
    } else {
      // Smart mode
      return (
        opt.value.toLowerCase().includes(term) ||
        (opt.label && opt.label.toLowerCase().includes(term)) ||
        (opt.subtext && opt.subtext.toLowerCase().includes(term))
      );
    }
  });

  // Check if current value exists in dataset
  const exactMatch = normalizedOptions.find(
    (opt) => opt.value.toLowerCase() === (value || '').trim().toLowerCase()
  );
  const isCustomEntry = Boolean(value && value.trim() && !exactMatch);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When dropdown opens, highlight the matching selected option if available
  useEffect(() => {
    if (isOpen) {
      const selectedIdx = filteredOptions.findIndex(
        (opt) => opt.value.toLowerCase() === (value || '').trim().toLowerCase()
      );
      if (selectedIdx >= 0) {
        setHighlightedIndex(selectedIdx);
      } else {
        setHighlightedIndex(0);
      }
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
    setSearchTerm(newVal);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt.value);
    setSearchTerm('');
    setIsOpen(false);
    if (onSelectOption) {
      onSelectOption(opt);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setSearchTerm('');
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setSearchTerm('');
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isOpen && filteredOptions.length > 0 && filteredOptions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative flex flex-col ${isOpen ? 'z-[99999]' : 'z-10'} ${className}`}
    >
      {/* Label & Counter info */}
      <div className="flex items-center justify-between mb-1.5 min-h-[20px]">
        <label htmlFor={id} className="font-bold text-slate-800 text-xs sm:text-sm flex items-center">
          <span>{label}</span>
          {required && <RequiredAsterisk />}
        </label>
        
        {/* Dynamic status pill */}
        <div className="flex items-center gap-1.5">
          {isCustomEntry && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <Tag className="w-2.5 h-2.5" />
              Individuell
            </span>
          )}
          {badgeCountText && (
            <span className="text-[11px] text-slate-500 font-normal">
              {badgeCountText}
            </span>
          )}
        </div>
      </div>

      {/* Input container with dual-mode controls */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          id={id}
          list={datalistId}
          data-firebase-field={dataFirebaseField}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setSearchTerm('');
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className={`w-full pl-3.5 pr-14 py-2.5 metallic-input rounded-xl text-slate-900 font-semibold text-xs sm:text-sm transition placeholder:text-slate-400 ${
            isOpen 
              ? 'ring-2 ring-blue-500/20' 
              : 'hover:border-slate-300'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
        />

        {/* Optional HTML5 Datalist for standard native browser suggestions fallback */}
        {datalistId && (
          <datalist id={datalistId}>
            {normalizedOptions.map((opt, i) => (
              <option key={`${opt.value}-${i}`} value={opt.value}>
                {opt.label !== opt.value ? opt.label : undefined}
              </option>
            ))}
          </datalist>
        )}

        {/* Right action buttons: Clear & Dropdown toggle */}
        <div className="absolute right-2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
              title="Eingabe leeren"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isOpen) {
                setSearchTerm('');
                setIsOpen(true);
                inputRef.current?.focus();
              } else {
                setIsOpen(false);
                setSearchTerm('');
              }
            }}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer"
            title={isOpen ? 'Optionen schließen' : 'Optionen anzeigen'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Helper text if provided */}
      {helperText && (
        <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
      )}

      {/* Floating Suggestions Popover - tightly anchored directly beneath input with highest z-index overlay */}
      {isOpen && !disabled && (
        <div 
          className="absolute z-[99999] left-0 right-0 top-[calc(100%+6px)] min-w-full bg-slate-900/98 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/90 text-xs animate-in fade-in zoom-in-98 duration-150"
          style={{ 
            maxHeight: '320px',
            zIndex: 99999
          }}
        >
          {/* Header bar inside popover */}
          <div className="px-3.5 py-2 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between text-[11px] font-bold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>{filteredOptions.length} Optionen</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Wählen oder tippen
            </span>
          </div>

          {/* Option list */}
          <div 
            ref={listRef}
            className="overflow-y-auto max-h-60 divide-y divide-slate-800/50 p-1"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = (value || '').toLowerCase() === opt.value.toLowerCase();
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={`${opt.value}-${index}`}
                    data-index={index}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : isHighlighted
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {opt.icon && (
                        <span className="text-sm shrink-0">{opt.icon}</span>
                      )}
                      <div className="truncate">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`truncate ${isSelected ? 'text-white font-bold' : 'text-slate-100 font-medium'}`}>
                            {opt.label || opt.value}
                          </span>
                          {opt.badge && (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                              isSelected
                                ? 'bg-blue-700 text-white border border-blue-400/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.subtext && (
                          <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {opt.subtext}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 ml-2">
                      {isSelected && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3.5 text-center space-y-2.5">
                <p className="text-slate-300 font-medium text-xs leading-relaxed">
                  {emptyStateText}
                </p>
                {allowCustom && value && (
                  <div className="p-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-left text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Aktuelle Eingabe:</span>
                      <span className="font-bold text-white">"{value}"</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Übernehmen
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-1.5 bg-slate-800/90 border-t border-slate-700/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Tipp: <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-[9px] font-mono text-slate-300">↑↓</kbd> Navigieren, <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-[9px] font-mono text-slate-300">Enter</kbd> Auswählen</span>
            <span className="text-amber-400 font-medium">✓ KBA FZ6 2024</span>
          </div>
        </div>
      )}
    </div>
  );
};
