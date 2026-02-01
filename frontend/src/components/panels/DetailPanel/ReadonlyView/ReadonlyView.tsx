import { useState, useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import type { HistoryItem } from '../../../../types';
import { t } from '../../../../i18n';
import { isPlayingAtom, editorOpenAtom } from '../../../../store';
import { CollapsibleSection } from '../CollapsibleSection/CollapsibleSection';
import { formatDuration } from '../../../../utils/formatDuration';
import styles from '../../DetailPanel.module.css';

interface ReadonlyViewProps {
  item: HistoryItem;
  onCopy: () => void;
  nowPlayingItem?: HistoryItem | null;
  onSelectItem?: (itemId: string) => void;
  sunoAvailable?: boolean;
}

export function ReadonlyView({ item, onCopy, nowPlayingItem, onSelectItem, sunoAvailable = false }: ReadonlyViewProps) {
  const setEditorOpen = useSetAtom(editorOpenAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Reset expanded state when item changes
  useEffect(() => {
    setIsPromptExpanded(false);
    setIsLyricsExpanded(false);
  }, [item.id]);

  useEffect(() => {
    const checkOverflow = () => {
      const el = titleRef.current;
      if (!el) return;

      const overflow = el.scrollWidth - el.clientWidth;
      if (overflow > 0) {
        el.style.setProperty('--marquee-distance', `-${overflow}px`);
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [item.id, item.title]);

  // Show indicator if a different song is playing
  const showNowPlayingIndicator =
    isPlaying &&
    nowPlayingItem &&
    nowPlayingItem.id !== item.id;

  const handleNowPlayingClick = () => {
    if (nowPlayingItem && onSelectItem) {
      onSelectItem(nowPlayingItem.id);
    }
  };
  return (
    <div className={styles.readonlyView}>
      <button
        type="button"
        className={styles.newDraftButton}
        onClick={() => setEditorOpen(true)}
        style={sunoAvailable ? undefined : { visibility: 'hidden', pointerEvents: 'none' }}
        tabIndex={sunoAvailable ? 0 : -1}
      >
        {t.actions.createSong}
      </button>
      <div className={styles.readonlyHeader}>
        <div className={styles.readonlyTitleRow}>
          <h2
            ref={titleRef}
            className={`${styles.readonlyTitle} ${isOverflowing ? styles.readonlyTitleMarquee : ''}`}
            title={item.title}
          >
            {isOverflowing ? <span>{item.title}</span> : item.title}
          </h2>
          {(item.prompt || item.lyrics) && (
            <button type="button" className={styles.copyButton} onClick={onCopy} aria-label={t.actions.copy}>
              <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          )}
        </div>
        {item.artist && (
          <span className={styles.readonlyArtist}>
            {item.artist}
          </span>
        )}
        {item.genre && (
          <span className={styles.readonlyGenre}>
            {item.genre}
          </span>
        )}
        {showNowPlayingIndicator && nowPlayingItem && (
          <button
            type="button"
            className={styles.nowPlayingIndicator}
            onClick={handleNowPlayingClick}
            aria-label={t.messages.nowPlaying(nowPlayingItem.title || t.messages.untitled)}
          >
            {t.messages.nowPlaying(nowPlayingItem.title || t.messages.untitled)}
          </button>
        )}
      </div>
      <div className={styles.readonlyCoverImage}>
        <img src={item.sunoImageUrl || '/assets/placeholder.png'} alt={item.title} />
        {item.duration != null && item.duration > 0 && (
          <span className={styles.durationBadge}>{formatDuration(item.duration)}</span>
        )}
      </div>
      {item.lyrics && (
        <CollapsibleSection
          label={t.labels.lyrics}
          isExpanded={isLyricsExpanded}
          onToggle={() => setIsLyricsExpanded(!isLyricsExpanded)}
          mode="readonly"
        >
          <pre className={styles.readonlyLyricsContent}>{item.lyrics}</pre>
        </CollapsibleSection>
      )}
      {item.prompt && (
        <CollapsibleSection
          label={t.labels.chatGptPrompt}
          isExpanded={isPromptExpanded}
          onToggle={() => setIsPromptExpanded(!isPromptExpanded)}
          mode="readonly"
        >
          <p className={styles.readonlyPromptContent}>{item.prompt}</p>
        </CollapsibleSection>
      )}
    </div>
  );
}
