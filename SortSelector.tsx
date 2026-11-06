import { useState, useRef, useEffect, useId } from 'react';
import './SortSelector.css';

export type SortOption = 'date_desc' | 'date_asc' | 'duration_desc' | 'duration_asc';

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Сначала новые' },
  { value: 'date_asc', label: 'Сначала старые' },
  { value: 'duration_desc', label: 'Сначала долгие' },
  { value: 'duration_asc', label: 'Сначала быстрые' },
];

export const SortSelector = ({ value, onChange }: SortSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  };

  const selectOption = (option: SortOption) => {
    onChange(option);
    closeMenu(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = OPTIONS.findIndex((option) => option.value === value);

    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (currentIndex + direction + OPTIONS.length) % OPTIONS.length;
      onChange(OPTIONS[nextIndex].value);
      const nextItem = listRef.current?.children.item(nextIndex);
      if (nextItem instanceof HTMLElement) nextItem.focus();
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0 : OPTIONS.length - 1;
      onChange(OPTIONS[nextIndex].value);
      const nextItem = listRef.current?.children.item(nextIndex);
      if (nextItem instanceof HTMLElement) nextItem.focus();
    }
  };

  const selectedOption = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];

  return (
    <div className="custom-select" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        className="select-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Сортировка запусков"
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-expanded={isOpen}
      >
        {selectedOption.label}
        <svg className={`chevron ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <ul className="select-menu" id={listId} role="listbox" aria-label="Варианты сортировки" ref={listRef}>
          {OPTIONS.map((option) => (
            <li
              key={option.value}
              className={`select-item ${option.value === value ? 'selected' : ''}`}
              onClick={() => selectOption(option.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectOption(option.value);
                }
              }}
              tabIndex={0}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
