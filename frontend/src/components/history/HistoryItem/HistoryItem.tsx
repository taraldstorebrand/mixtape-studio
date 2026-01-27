import { HistoryItem as HistoryItemType } from '../../../types';
import { StatusBadge } from './StatusBadge/StatusBadge';

interface HistoryItemProps {
  item: HistoryItemType;
  isSelected: boolean;
  onFeedback: (id: string, feedback: 'up' | 'down' | null) => void;
  onSelect: (item: HistoryItemType) => void;
  onDelete: () => void;
}

export function HistoryItem({ item, isSelected, onFeedback, onSelect, onDelete }: HistoryItemProps) {
  const displayTitle = item.title || item.prompt || 'Uten tittel';
  const variationLabel = item.variationIndex !== undefined ? ` #${item.variationIndex + 1}` : '';
  const audioUrl = item.sunoLocalUrl || item.sunoAudioUrl;

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('audio')) {
      return;
    }
    onSelect(item);
  };

  return (
    <div
      className={`history-item ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="history-header">
        <img
          src={item.sunoImageUrl || '/images/placeholder.jpg'}
          alt=""
          className="history-thumbnail"
        />
        <div className="history-meta">
          <strong className="history-title">{displayTitle}{variationLabel}</strong>
          <StatusBadge status={item.sunoStatus} />
          <span className="history-date">
            {new Date(item.createdAt).toLocaleString('no-NO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {item.isUploaded && <span className="uploaded-label">Lastet opp</span>}
          </span>
        </div>
        <div className="history-actions">
          <div className="feedback-buttons">
            <button
              onClick={() => onFeedback(item.id, item.feedback === 'up' ? null : 'up')}
              className={`thumb-button ${item.feedback === 'up' ? 'active' : ''}`}
              title="Thumbs up"
            >
              👍
            </button>
            <button
              onClick={() => onFeedback(item.id, item.feedback === 'down' ? null : 'down')}
              className={`thumb-button ${item.feedback === 'down' ? 'active' : ''}`}
              title="Thumbs down"
            >
              👎
            </button>
          </div>
          <button
            onClick={onDelete}
            className="delete-button"
            title="Slett"
          >
            🗑
          </button>
        </div>
      </div>
      {audioUrl && (
        <div className="audio-previews">
          <div className="audio-preview">
            <audio controls src={audioUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
