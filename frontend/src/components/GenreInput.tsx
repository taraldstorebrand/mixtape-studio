import { useState, useRef, useEffect } from 'react';
import styles from './GenreInput.module.css';

interface GenreInputProps {
  value: string;
  onChange: (value: string) => void;
  genreHistory: string[];
  onRemoveGenre: (genre: string) => void;
}

export function GenreInput({
  value,
  onChange,
  genreHistory,
  onRemoveGenre,
}: GenreInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = genreHistory.filter((genre) =>
    genre.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [value]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
    setIsOpen(true);
  }

  function handleInputFocus() {
    setIsOpen(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && e.key !== 'Escape') {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        onChange(filteredOptions[highlightedIndex]);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  function handleOptionClick(genre: string) {
    onChange(genre);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleRemoveClick(e: React.MouseEvent, genre: string) {
    e.stopPropagation();
    e.preventDefault();
    onRemoveGenre(genre);
  }

  function handleClear() {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div className={styles.control}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={styles.input}
          placeholder="Velg eller skriv sjanger..."
        />
        {value && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            title="Tøm"
          >
            ×
          </button>
        )}
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul className={styles.dropdown}>
          {filteredOptions.map((genre, index) => (
            <li
              key={genre}
              className={`${styles.option} ${index === highlightedIndex ? styles.optionHighlighted : ''}`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => handleOptionClick(genre)}
            >
              <span>{genre}</span>
              <button
                type="button"
                className={styles.removeButton}
                onClick={(e) => handleRemoveClick(e, genre)}
                title="Fjern fra historikk"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
