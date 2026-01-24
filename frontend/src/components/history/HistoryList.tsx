import { HistoryItem as HistoryItemType } from '../../types';
import { HistoryItem } from './HistoryItem';

interface HistoryListProps {
  items: HistoryItemType[];
  onFeedback: (id: string, feedback: 'up' | 'down') => void;
  onReuse: (item: HistoryItemType) => void;
}

export function HistoryList({ items, onFeedback, onReuse }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="history-empty">
        <p>Ingen historikk ennå. Generer din første sangtekst!</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      <h2>Sanger ({items.length})</h2>
      {items.map((item) => (
        <HistoryItem
          key={item.id}
          item={item}
          onFeedback={onFeedback}
          onReuse={onReuse}
        />
      ))}
    </div>
  );
}
