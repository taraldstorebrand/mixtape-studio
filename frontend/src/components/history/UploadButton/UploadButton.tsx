import { useState, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { historyAtom } from '../../../store/atoms';
import { uploadMp3 } from '../../../services/api';
import type { HistoryItem } from '../../../types';

export function UploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setHistory = useSetAtom(historyAtom);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTitle(file.name.replace(/\.mp3$/i, ''));
      setShowTitleInput(true);
      setError(null);
    }
  }

  function handleCancel() {
    setShowTitleInput(false);
    setSelectedFile(null);
    setTitle('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleUpload() {
    if (!selectedFile || !title.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      const { id, localUrl } = await uploadMp3(selectedFile, title.trim());

      const newItem: HistoryItem = {
        id,
        prompt: '',
        title: title.trim(),
        lyrics: '',
        createdAt: new Date().toISOString(),
        sunoLocalUrl: localUrl,
        isUploaded: true,
      };

      setHistory((prev) => [newItem, ...prev]);
      handleCancel();
    } catch (err: any) {
      setError(err.message || 'Kunne ikke laste opp fil');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,.mp3"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      {!showTitleInput ? (
        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          Last opp MP3
        </button>
      ) : (
        <div className="upload-form">
          <input
            type="text"
            className="upload-title-input"
            placeholder="Tittel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
          />
          <div className="upload-actions">
            <button
              className="upload-confirm-button"
              onClick={handleUpload}
              disabled={isUploading || !title.trim()}
            >
              {isUploading ? 'Laster opp...' : 'Last opp'}
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
