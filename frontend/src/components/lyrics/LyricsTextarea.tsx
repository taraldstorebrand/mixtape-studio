import CreatableSelect from 'react-select/creatable';
import type { ActionMeta, SingleValue, StylesConfig } from 'react-select';

interface GenreOption {
  value: string;
  label: string;
}

interface LyricsTextareaProps {
  lyrics: string;
  onChange: (lyrics: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  onGenerateSong: () => void;
  isLoading: boolean;
  isGeneratingSong: boolean;
  genreHistory: string[];
  onRemoveGenre: (genre: string) => void;
}

const selectStyles: StylesConfig<GenreOption, false> = {
  control: (base) => ({
    ...base,
    backgroundColor: '#1a1a1a',
    borderColor: '#444',
    borderWidth: '2px',
    borderRadius: '8px',
    minHeight: '44px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#646cff',
    },
  }),
  input: (base) => ({
    ...base,
    color: 'white',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#888',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#1a1a1a',
    border: '2px solid #444',
    borderRadius: '8px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#333' : '#1a1a1a',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '&:active': {
      backgroundColor: '#444',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#888',
    '&:hover': {
      color: '#646cff',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#888',
    '&:hover': {
      color: '#ff4444',
    },
  }),
};

export function LyricsTextarea({
  lyrics,
  onChange,
  title,
  onTitleChange,
  genre,
  onGenreChange,
  onGenerateSong,
  isLoading,
  isGeneratingSong,
  genreHistory,
  onRemoveGenre,
}: LyricsTextareaProps) {
  if (isLoading) {
    return (
      <div className="lyrics-container">
        <div className="loading">Genererer sangtekst...</div>
      </div>
    );
  }

  if (!lyrics) {
    return null;
  }

  const genreOptions: GenreOption[] = genreHistory.map((g) => ({
    value: g,
    label: g,
  }));

  const selectedOption: GenreOption | null = genre
    ? { value: genre, label: genre }
    : null;

  const handleGenreChange = (
    newValue: SingleValue<GenreOption>,
    actionMeta: ActionMeta<GenreOption>
  ) => {
    if (actionMeta.action === 'clear') {
      onGenreChange('');
    } else if (newValue) {
      onGenreChange(newValue.value);
    }
  };

  const formatOptionLabel = (
    option: GenreOption,
    { context }: { context: 'menu' | 'value' }
  ) => {
    if (context === 'value') {
      return <span>{option.label}</span>;
    }
    return (
      <div className="genre-option">
        <span>{option.label}</span>
        <button
          type="button"
          className="genre-remove-button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemoveGenre(option.value);
          }}
          title="Fjern fra historikk"
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="lyrics-container">
      <div className="title-input-container">
        <label htmlFor="title-input" className="title-label">
          Sangtittel (påkrevd):
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="title-input"
          placeholder="Skriv inn sangtittel..."
        />
      </div>
      <label htmlFor="lyrics-editor" className="lyrics-label">
        Sangtekst:
      </label>
      <textarea
        id="lyrics-editor"
        value={lyrics}
        onChange={(e) => onChange(e.target.value)}
        className="lyrics-editor"
        rows={14}
        placeholder="Sangteksten vil vises her..."
      />
      <div className="genre-input-container">
        <label className="genre-label">
          Sjanger/stil (valgfritt):
        </label>
        <CreatableSelect<GenreOption, false>
          options={genreOptions}
          value={selectedOption}
          onChange={handleGenreChange}
          isClearable
          placeholder="Velg eller skriv sjanger..."
          formatCreateLabel={(inputValue) => `Bruk "${inputValue}"`}
          formatOptionLabel={formatOptionLabel}
          styles={selectStyles}
          noOptionsMessage={() => 'Skriv for å legge til sjanger'}
        />
      </div>
      <button
        onClick={onGenerateSong}
        disabled={!lyrics.trim() || !title.trim() || isGeneratingSong}
        className="generate-song-button"
      >
        {isGeneratingSong ? '⏳ Genererer sang...' : 'Generer Sang med Suno'}
      </button>
    </div>
  );
}
