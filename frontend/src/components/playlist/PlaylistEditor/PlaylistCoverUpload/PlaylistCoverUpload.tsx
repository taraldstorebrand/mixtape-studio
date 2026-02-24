import { useRef, useState } from 'react';
import { uploadPlaylistCover } from '../../../../services/playlists';
import { t } from '../../../../i18n';
import { getErrorMessage } from '../../../../utils/errors';
import styles from './PlaylistCoverUpload.module.css';

interface PlaylistCoverUploadProps {
  playlistId: string;
  coverImageUrl: string | null;
  onCoverUploaded: (url: string) => void;
  onError: (message: string) => void;
}

export function PlaylistCoverUpload({ playlistId, coverImageUrl, onCoverUploaded, onError }: PlaylistCoverUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      onError(t.errors.coverImageInvalidType);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError(t.errors.coverImageTooLarge);
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadPlaylistCover(playlistId, file);
      onCoverUploaded(result.coverImageUrl);
    } catch (err: unknown) {
      onError(getErrorMessage(err) || t.errors.couldNotUploadCover);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.button} ${!coverImageUrl ? styles.buttonEmpty : ''}`}
        onClick={handleClick}
        disabled={isUploading}
        aria-label={t.tooltips.uploadCover}
      >
        {coverImageUrl && (
          <img src={coverImageUrl} alt="" className={styles.image} aria-hidden="true" />
        )}
        {isUploading ? (
          <div className={styles.spinnerOverlay}>
            <div className={styles.spinner} />
          </div>
        ) : (
          <div className={`${styles.hint} ${!coverImageUrl ? styles.hintVisible : ''}`} aria-hidden="true">
            +
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className={styles.hiddenInput}
        onChange={handleChange}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
