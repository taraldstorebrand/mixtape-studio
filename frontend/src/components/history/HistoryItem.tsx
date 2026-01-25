import { HistoryItem as HistoryItemType } from '../../types';

interface HistoryItemProps {
  item: HistoryItemType;
  isSelected: boolean;
  onFeedback: (id: string, feedback: 'up' | 'down' | null) => void;
  onSelect: (item: HistoryItemType) => void;
  onDelete: () => void;
  onDeleteTrack: (trackIndex: number) => void;
}

export function HistoryItem({ item, isSelected, onFeedback, onSelect, onDelete, onDeleteTrack }: HistoryItemProps) {
  const getStatusBadge = () => {
    if (!item.sunoStatus) return null;
    
    const statusMap = {
      pending: { text: 'Venter...', className: 'status-pending' },
      partial: { text: 'Delvis', className: 'status-partial' },
      completed: { text: 'Ferdig', className: 'status-completed' },
      failed: { text: 'Feilet', className: 'status-failed' },
    };
    
    const status = statusMap[item.sunoStatus];
    return <span className={`status-badge ${status.className}`}>{status.text}</span>;
  };

  const displayTitle = item.title || item.prompt || 'Uten tittel';
  const hasAudio = (item.sunoLocalUrls && item.sunoLocalUrls.length > 0) || 
                   (item.sunoAudioUrls && item.sunoAudioUrls.length > 0) || 
                   item.sunoAudioUrl;

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
          <strong className="history-title">{displayTitle}</strong>
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
      {hasAudio && (
        <div className="audio-previews">
          {(item.sunoLocalUrls && item.sunoLocalUrls.length > 0) ? (
            item.sunoLocalUrls.map((url, index) => (
              <div key={index} className="audio-preview">
                <label>#{index + 1}</label>
                <audio controls src={url} />
                <button
                  onClick={() => onDeleteTrack(index)}
                  className="delete-track-button"
                  title="Slett spor"
                >
                  🗑
                </button>
              </div>
            ))
          ) : item.sunoAudioUrls ? (
            item.sunoAudioUrls.map((url, index) => (
              <div key={index} className="audio-preview">
                <label>#{index + 1}</label>
                <audio controls src={url} />
                <button
                  onClick={() => onDeleteTrack(index)}
                  className="delete-track-button"
                  title="Slett spor"
                >
                  🗑
                </button>
              </div>
            ))
          ) : item.sunoAudioUrl ? (
            <div className="audio-preview">
              <label>#1</label>
              <audio controls src={item.sunoAudioUrl} />
              <button
                onClick={() => onDeleteTrack(0)}
                className="delete-track-button"
                title="Slett spor"
              >
                🗑
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
