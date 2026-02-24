import { HistoryList } from '../history/HistoryList/HistoryList';
import { HistoryItem } from '../../types';

interface HistoryPanelProps {
  items: HistoryItem[];
  selectedItemId: string | null;
  onFeedback: (id: string, feedback: 'up' | 'down' | null) => void;
  onSelect: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export function HistoryPanel({
  items,
  selectedItemId,
  onFeedback,
  onSelect,
  onDeleteItem,
}: HistoryPanelProps) {
  return (
    <HistoryList
      items={items}
      selectedItemId={selectedItemId}
      onFeedback={onFeedback}
      onSelect={onSelect}
      onDeleteItem={onDeleteItem}
    />
  );
}
