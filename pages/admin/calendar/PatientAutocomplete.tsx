import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, User, Phone, Mail, X } from 'lucide-react';
import { Input } from '../../../components/ui';
import { Patient } from '../../../types';

type PatientAutocompleteProps = {
  patients: Patient[];
  value: string;
  onChange: (value: string, patient?: Patient) => void;
  placeholder?: string;
  disabled?: boolean;
};

// Simple fuzzy match - checks if query letters appear in order in target
function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  let qIndex = 0;
  for (let i = 0; i < t.length && qIndex < q.length; i++) {
    if (t[i] === q[qIndex]) {
      qIndex++;
    }
  }
  return qIndex === q.length;
}

// Score how well a patient matches the query
function scoreMatch(query: string, patient: Patient): number {
  const q = query.toLowerCase();
  let score = 0;

  // Exact name match = highest score
  if (patient.name.toLowerCase() === q) {
    score += 100;
  }
  // Name starts with query = high score
  else if (patient.name.toLowerCase().startsWith(q)) {
    score += 75;
  }
  // Name contains query = medium score
  else if (patient.name.toLowerCase().includes(q)) {
    score += 50;
  }
  // Fuzzy name match = lower score
  else if (fuzzyMatch(q, patient.name)) {
    score += 25;
  }

  // Phone match
  if (patient.phone && patient.phone.includes(q)) {
    score += 40;
  }

  // Email match
  if (patient.email && patient.email.toLowerCase().includes(q)) {
    score += 30;
  }

  // Recent patients get a slight boost (if lastVisit is recent)
  if (patient.lastVisit) {
    const daysSinceVisit = Math.floor(
      (Date.now() - new Date(patient.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceVisit < 30) {
      score += 10;
    } else if (daysSinceVisit < 90) {
      score += 5;
    }
  }

  return score;
}

export function PatientAutocomplete({
  patients,
  value,
  onChange,
  placeholder = 'חפש מטופל...',
  disabled = false,
}: PatientAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter and sort patients based on query
  const suggestions = useMemo(() => {
    if (!value.trim()) {
      // Show recent patients when no query
      return patients
        .filter(p => p.lastVisit)
        .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
        .slice(0, 5);
    }

    return patients
      .map(p => ({ patient: p, score: scoreMatch(value, p) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ patient }) => patient);
  }, [patients, value]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectPatient = (patient: Patient) => {
    onChange(patient.name, patient);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          handleSelectPatient(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10 pl-8"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto"
          role="listbox"
        >
          {!value.trim() && (
            <li className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border-b">
              מטופלים אחרונים
            </li>
          )}
          {suggestions.map((patient, index) => (
            <li
              key={patient.id}
              role="option"
              aria-selected={index === selectedIndex}
              className={`px-3 py-2 cursor-pointer flex items-start gap-3 ${
                index === selectedIndex ? 'bg-teal-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelectPatient(patient)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {patient.avatar ? (
                  <img
                    src={patient.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {patient.name}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {patient.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {patient.phone}
                    </span>
                  )}
                  {patient.email && (
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3" />
                      {patient.email}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && value.trim() && suggestions.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-gray-500 text-sm">
          לא נמצאו מטופלים תואמים
          <div className="mt-1 text-xs">
            יצירת מטופל חדש: &quot;{value}&quot;
          </div>
        </div>
      )}
    </div>
  );
}
