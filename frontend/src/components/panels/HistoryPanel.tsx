import { HistoryList } from '../history/HistoryList';
import { HistoryItem } from '../../types';

interface HistoryPanelProps {
  items: HistoryItem[];
  selectedItemId: string | null;
  onFeedback: (id: string, feedback: 'up' | 'down' | null) => void;
  onSelect: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onDeleteTrack: (id: string, trackIndex: number) => void;
}

export function HistoryPanel({
  items,
  selectedItemId,
  onFeedback,
  onSelect,
  onDeleteItem,
  onDeleteTrack,
}: HistoryPanelProps) {
  return (
    <HistoryList
      items={items}
      selectedItemId={selectedItemId}
      onFeedback={onFeedback}
      onSelect={onSelect}
      onDeleteItem={onDeleteItem}
      onDeleteTrack={onDeleteTrack}
    />
  );
}
