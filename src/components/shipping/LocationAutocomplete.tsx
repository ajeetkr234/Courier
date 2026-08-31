import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Check, X, Search, AlertCircle } from 'lucide-react';
import { ServiceableLocationItem } from '../../types/serviceability';
import { searchLocations } from '../../services/serviceability';

interface LocationAutocompleteProps {
  label: string;
  placeholder?: string;
  value: ServiceableLocationItem | null;
  onChange: (location: ServiceableLocationItem | null) => void;
  error?: string;
  id?: string;
  required?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder = 'Search city, area or PIN code',
  value,
  onChange,
  error,
  id,
  required = false,
}) => {
  const inputId = id || `location-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const listboxId = `${inputId}-listbox`;

  const [query, setQuery] = useState(value ? value.displayText : '');
  const [suggestions, setSuggestions] = useState<ServiceableLocationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [unconfirmedError, setUnconfirmedError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      setQuery(value.displayText);
      setUnconfirmedError(null);
    }
  }, [value]);

  // Filter suggestions on query change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setUnconfirmedError(null);

    // If user modifies text, clear confirmed selection
    if (value && text !== value.displayText) {
      onChange(null);
    }

    if (text.trim().length >= 2) {
      const results = searchLocations(text);
      setSuggestions(results);
      setIsOpen(true);
      setActiveIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelectLocation = (loc: ServiceableLocationItem) => {
    onChange(loc);
    setQuery(loc.displayText);
    setIsOpen(false);
    setSuggestions([]);
    setUnconfirmedError(null);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setUnconfirmedError(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleBlur = () => {
    // Timeout allows click on suggestion item to register before closing
    setTimeout(() => {
      setIsOpen(false);
      // If user typed something but didn't select a valid location from suggestions
      if (query.trim() && !value) {
        setUnconfirmedError('Please select and confirm a valid location from the suggestions list.');
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelectLocation(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const activeError = error || unconfirmedError;

  return (
    <div ref={containerRef} className="w-full space-y-1.5 relative">
      <label htmlFor={inputId} className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-600" /> {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {value && (
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" /> Confirmed
          </span>
        )}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-invalid={!!activeError}
          aria-describedby={activeError ? `${inputId}-error` : undefined}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 2 && suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full bg-white border text-slate-900 rounded-xl pl-10 pr-10 py-3 text-sm placeholder:text-slate-400 font-medium focus:outline-none transition-all shadow-xs ${
            activeError
              ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : value
              ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
          }`}
        />

        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
            aria-label="Clear location input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs animate-fadeIn"
        >
          {suggestions.map((loc, idx) => (
            <li
              key={loc.id}
              role="option"
              aria-selected={idx === activeIndex}
              onClick={() => handleSelectLocation(loc)}
              className={`p-3 cursor-pointer transition flex items-center justify-between ${
                idx === activeIndex ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">{loc.locality}, {loc.city}</span>
                  <span className="text-[11px] text-slate-500">{loc.state} — PIN: <strong>{loc.pincode}</strong></span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                {loc.pincode}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Inline Error Display */}
      {activeError && (
        <p id={`${inputId}-error`} className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{activeError}</span>
        </p>
      )}
    </div>
  );
};
