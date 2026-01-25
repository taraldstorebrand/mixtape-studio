import { useState } from 'react';
import { HistoryItem as HistoryItemType } from '../../types';
import { HistoryItem } from './HistoryItem';

type FilterType = 'default' | 'liked' | 'all';

interface HistoryListProps {
  items: HistoryItemType[];
  onFeedback: (id: string, feedback: 'up' | 'down' | null) => void;
  onReuse: (item: HistoryItemType) => void;
  onDeleteItem: (id: string) => void;
  onDeleteTrack: (id: string, trackIndex: number) => void;
}

export function HistoryList({ items, onFeedback, onReuse, onDeleteItem, onDeleteTrack }: HistoryListProps) {
  const [filter, setFilter] = useState<FilterType>('default');

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'liked') return item.feedback === 'up';
    return item.feedback !== 'down';
  });

  if (items.length === 0) {
    return (
      <div className="history-empty">
        <p>Ingen historikk ennå. Generer din første sangtekst!</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      <div className="history-header-bar">
        <h2>Sanger ({filteredItems.length})</h2>
        <div className="filter-buttons">
          <button
            className={`filter-button ${filter === 'default' ? 'active' : ''}`}
            onClick={() => setFilter('default')}
          >
            Default
          </button>
          <button
            className={`filter-button ${filter === 'liked' ? 'active' : ''}`}
            onClick={() => setFilter('liked')}
          >
            Liked
          </button>
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
      </div>
      {filteredItems.map((item) => (
        <HistoryItem
          key={item.id}
          item={item}
          onFeedback={onFeedback}
          onReuse={onReuse}
          onDelete={() => onDeleteItem(item.id)}
          onDeleteTrack={(trackIndex) => onDeleteTrack(item.id, trackIndex)}
        />
      ))}
    </div>
  );
}
