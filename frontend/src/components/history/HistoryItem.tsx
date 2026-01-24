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
      partial: { text: 'Første sang klar', className: 'status-partial' },
      completed: { text: 'Ferdig', className: 'status-completed' },
      failed: { text: 'Feilet', className: 'status-failed' },
    };
    
    const status = statusMap[item.sunoStatus];
    return <span className={`status-badge ${status.className}`}>{status.text}</span>;
  };

  return (
    <div className="history-item">
      <div className="history-header">
        <div className="history-meta">
          <strong className="history-prompt">{item.prompt}</strong>
          <span className="history-date">
            {new Date(item.createdAt).toLocaleString('no-NO')}
          </span>
          {getStatusBadge()}
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
              👍
            </button>
            <button
              onClick={() => onFeedback(item.id, 'down')}
              className={`thumb-button ${item.feedback === 'down' ? 'active' : ''}`}
              title="Thumbs down"
            >
              👎
            </button>
          </div>
        </div>
      </div>
      <div className="history-lyrics">{item.lyrics}</div>
      {((item.sunoLocalUrls && item.sunoLocalUrls.length > 0) || (item.sunoAudioUrls && item.sunoAudioUrls.length > 0) || item.sunoAudioUrl) && (
        <div className="audio-previews">
          {(item.sunoLocalUrls && item.sunoLocalUrls.length > 0) ? (
            item.sunoLocalUrls.map((url, index) => (
              <div key={index} className="audio-preview">
                <label>Sang {index + 1}:</label>
                <audio controls src={url}>
                  Din nettleser støtter ikke audio-elementet.
                </audio>
              </div>
            ))
          ) : item.sunoAudioUrls ? (
            item.sunoAudioUrls.map((url, index) => (
              <div key={index} className="audio-preview">
                <label>Sang {index + 1}:</label>
                <audio controls src={url}>
                  Din nettleser støtter ikke audio-elementet.
                </audio>
              </div>
            ))
          ) : item.sunoAudioUrl ? (
            <div className="audio-preview">
              <label>Sang:</label>
              <audio controls src={item.sunoAudioUrl}>
                Din nettleser støtter ikke audio-elementet.
              </audio>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
