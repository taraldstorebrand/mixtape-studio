import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { HistoryItem as HistoryItemType } from '../../types';
import { HistoryItem } from './HistoryItem/HistoryItem';
import { MixtapeButton } from './MixtapeButton/MixtapeButton';
import { AdvancedMixtapeButton } from '../mixtape/AdvancedMixtapeButton';
import { UploadButton } from './UploadButton/UploadButton';
import { filteredHistoryAtom } from '../../store';
import { t } from '../../i18n';
import styles from './HistoryList.module.css';

type FilterType = 'default' | 'liked' | 'all';

interface HistoryListProps {
  items: HistoryItemType[];
  selectedItemId: string | null;
  onFeedback: (id: string, feedback: 'up' | 'down' | null) => void;
  onSelect: (item: HistoryItemType) => void;
  onDeleteItem: (id: string) => void;
}

export function HistoryList({ items, selectedItemId, onFeedback, onSelect, onDeleteItem }: HistoryListProps) {
  const [filter, setFilter] = useState<FilterType>('default');
  const [isUploadFormActive, setIsUploadFormActive] = useState(false);
  const setFilteredHistory = useSetAtom(filteredHistoryAtom);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'liked') return item.feedback === 'up';
    return item.feedback !== 'down';
  });

  const likedItems = items.filter(item => item.feedback === 'up' && item.sunoLocalUrl);

  // Update global filtered history atom whenever filteredItems changes
  useEffect(() => {
    setFilteredHistory(filteredItems);
  }, [filteredItems, setFilteredHistory]);

  return (
    <div className={styles.historyList}>
      <div className={styles.panelActions}>
        <div className={styles.panelActionsButtons}>
          <UploadButton onUploadFormChange={setIsUploadFormActive} />
          {!isUploadFormActive && (
            <>
              <MixtapeButton likedItems={likedItems} />
              <AdvancedMixtapeButton allSongs={items} />
            </>
          )}
        </div>
      </div>
      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>{t.messages.noSongsAvailable}</p>
        </div>
      ) : (
        <>
          <div className={styles.headerBar}>
            <h2>{t.filters.songs} ({filteredItems.length})</h2>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${filter === 'default' ? styles.active : ''}`}
                onClick={() => setFilter('default')}
              >
                {t.filters.songs}
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'liked' ? styles.active : ''}`}
                onClick={() => setFilter('liked')}
              >
                {t.filters.liked}
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => setFilter('all')}
              >
                {t.filters.all}
              </button>
            </div>
          </div>
          {filteredItems.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              isSelected={item.id === selectedItemId}
              onFeedback={onFeedback}
              onSelect={onSelect}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}
