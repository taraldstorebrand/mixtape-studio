import { HistoryItem as HistoryItemType } from '../../types';

interface HistoryItemProps {
  item: HistoryItemType;
  isSelected: boolean;
  onFeedback: (id: string, feedback: 'up' | 'down' | null) => void;
  onSelect: (item: HistoryItemType) => void;
  onDelete: () => void;
}

export function HistoryItem({ item, isSelected, onFeedback, onSelect, onDelete }: HistoryItemProps) {
  const getStatusBadge = () => {
    if (!item.sunoStatus) return null;

    const statusMap: Record<string, { text: string; className: string }> = {
      pending: { text: 'Venter...', className: 'status-pending' },
      completed: { text: 'Ferdig', className: 'status-completed' },
      failed: { text: 'Feilet', className: 'status-failed' },
    };

    const status = statusMap[item.sunoStatus];
    if (!status) return null;
    return <span className={`status-badge ${status.className}`}>{status.text}</span>;
  };

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
        <div className="history-meta">
          <strong className="history-title">{displayTitle}{variationLabel}</strong>
          {getStatusBadge()}
          <span className="history-date">
            {new Date(item.createdAt).toLocaleDateString('no-NO')}
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
