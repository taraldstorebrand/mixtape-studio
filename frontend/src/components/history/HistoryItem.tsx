import { HistoryItem as HistoryItemType } from '../../types';

interface HistoryItemProps {
  item: HistoryItemType;
  onFeedback: (id: string, feedback: 'up' | 'down') => void;
  onReuse: (item: HistoryItemType) => void;
}

export function HistoryItem({ item, onFeedback, onReuse }: HistoryItemProps) {
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

  return (
    <div className="history-item">
      <div className="history-header">
        <div className="history-meta">
          <strong className="history-title">{displayTitle}</strong>
          {getStatusBadge()}
          <span className="history-date">
            {new Date(item.createdAt).toLocaleDateString('no-NO')}
          </span>
        </div>
        <div className="history-actions">
          <button
            onClick={() => onReuse(item)}
            className="reuse-button"
            title="Gjenbruk denne teksten"
          >
            Gjenbruk
          </button>
          <div className="feedback-buttons">
            <button
              onClick={() => onFeedback(item.id, 'up')}
              className={`thumb-button ${item.feedback === 'up' ? 'active' : ''}`}
              title="Thumbs up"
            >
              +
            </button>
            <button
              onClick={() => onFeedback(item.id, 'down')}
              className={`thumb-button ${item.feedback === 'down' ? 'active' : ''}`}
              title="Thumbs down"
            >
              -
            </button>
          </div>
        </div>
      </div>
      {hasAudio && (
        <div className="audio-previews">
          {(item.sunoLocalUrls && item.sunoLocalUrls.length > 0) ? (
            item.sunoLocalUrls.map((url, index) => (
              <div key={index} className="audio-preview">
                <label>#{index + 1}</label>
                <audio controls src={url} />
              </div>
            ))
          ) : item.sunoAudioUrls ? (
            item.sunoAudioUrls.map((url, index) => (
              <div key={index} className="audio-preview">
                <label>#{index + 1}</label>
                <audio controls src={url} />
              </div>
            ))
          ) : item.sunoAudioUrl ? (
            <div className="audio-preview">
              <label>#1</label>
              <audio controls src={item.sunoAudioUrl} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
