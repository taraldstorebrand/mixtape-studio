import { useAtom } from 'jotai';
import { searchQueryAtom } from '../../../../store/atoms';
import { t } from '../../../../i18n';
import styles from './SearchInput.module.css';

export function SearchInput() {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

  return (
    <div className={styles.searchWrapper}>
      <input
        type="text"
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.placeholders.searchForSongs}
        aria-label={t.placeholders.searchForSongs}
      />
      {searchQuery && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => setSearchQuery('')}
          aria-label={t.tooltips.clearSearch}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}
