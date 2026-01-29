import { useState, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { historyAtom } from '../../../store/atoms';
import { uploadMp3Files } from '../../../services/api';
import type { HistoryItem } from '../../../types';
import { t } from '../../../i18n';
import styles from './UploadButton.module.css';

interface FileWithTitle {
  file: File;
  title: string;
}

export function UploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileWithTitle[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setHistory = useSetAtom(historyAtom);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 10) {
      setError(t.errors.maxFilesPerUpload);
      return;
    }

    const filesWithTitles = files.map((file) => ({
      file,
      title: file.name.replace(/\.mp3$/i, ''),
    }));

    setSelectedFiles(filesWithTitles);
    setError(null);
  }

  function handleTitleChange(index: number, newTitle: string) {
    setSelectedFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, title: newTitle } : item))
    );
  }

  function handleRemoveFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCancel() {
    setSelectedFiles([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return;
    if (selectedFiles.some((f) => !f.title.trim())) {
      setError(t.errors.allFilesMustHaveTitle);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const files = selectedFiles.map((f) => f.file);
      const titles = selectedFiles.map((f) => f.title.trim());
      const results = await uploadMp3Files(files, titles);

      const newItems: HistoryItem[] = results.map((result, index) => ({
        id: result.id,
        prompt: '',
        title: titles[index],
        lyrics: '',
        createdAt: new Date().toISOString(),
        sunoLocalUrl: result.localUrl,
        sunoImageUrl: result.imageUrl,
        isUploaded: true,
        duration: result.duration,
      }));

      setHistory((prev) => [...newItems.reverse(), ...prev]);
      handleCancel();
    } catch (err: any) {
      setError(err.message || t.errors.couldNotUploadFiles);
    } finally {
      setIsUploading(false);
    }
  }

  const showForm = selectedFiles.length > 0;

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,.mp3"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-label={t.actions.uploadMp3}
      />
      {!showForm ? (
        <button
          className={styles.button}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {t.actions.uploadMp3}
        </button>
      ) : (
        <div className={styles.form}>
          <div className={styles.fileList}>
            {selectedFiles.map((item, index) => (
              <div key={index} className={styles.fileItem}>
                <input
                  type="text"
                  className={styles.titleInput}
                  placeholder="Tittel"
                  value={item.title}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                  disabled={isUploading}
                />
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveFile(index)}
                  disabled={isUploading}
                  title={t.tooltips.remove}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <button
              className={styles.confirmButton}
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.some((f) => !f.title.trim())}
            >
              {isUploading
                ? t.actions.uploading
                : t.actions.uploadFiles(selectedFiles.length)}
            </button>
            <button
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isUploading}
            >
              {t.actions.cancel}
            </button>
          </div>
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
