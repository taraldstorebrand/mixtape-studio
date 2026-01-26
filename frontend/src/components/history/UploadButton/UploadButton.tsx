import { useState, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { historyAtom } from '../../../store/atoms';
import { uploadMp3Files } from '../../../services/api';
import type { HistoryItem } from '../../../types';

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
      setError('Maksimalt 10 filer per opplasting');
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
      setError('Alle filer må ha en tittel');
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
        isUploaded: true,
      }));

      setHistory((prev) => [...newItems.reverse(), ...prev]);
      handleCancel();
    } catch (err: any) {
      setError(err.message || 'Kunne ikke laste opp filer');
    } finally {
      setIsUploading(false);
    }
  }

  const showForm = selectedFiles.length > 0;

  return (
    <div className="upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,.mp3"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      {!showForm ? (
        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          Last opp MP3
        </button>
      ) : (
        <div className="upload-form">
          <div className="upload-file-list">
            {selectedFiles.map((item, index) => (
              <div key={index} className="upload-file-item">
                <input
                  type="text"
                  className="upload-title-input"
                  placeholder="Tittel"
                  value={item.title}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                  disabled={isUploading}
                />
                <button
                  className="upload-remove-button"
                  onClick={() => handleRemoveFile(index)}
                  disabled={isUploading}
                  title="Fjern"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="upload-actions">
            <button
              className="upload-confirm-button"
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.some((f) => !f.title.trim())}
            >
              {isUploading
                ? 'Laster opp...'
                : `Last opp ${selectedFiles.length} fil${selectedFiles.length > 1 ? 'er' : ''}`}
            </button>
            <button
              className="upload-cancel-button"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
}
