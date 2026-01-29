import React, { useState, useEffect } from 'react';
import styles from './PromptInput.module.css';
import { t } from '../../i18n';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export function PromptInput({ onGenerate, isLoading, initialValue = '' }: PromptInputProps) {
  const [prompt, setPrompt] = useState(initialValue);

  useEffect(() => {
    setPrompt(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.promptForm}>
      <div className={styles.promptInputGroup}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.placeholders.promptForLyrics}
          disabled={isLoading}
          className={styles.promptTextarea}
          rows={3}
        />
        <button 
          type="submit" 
          disabled={!prompt.trim() || isLoading}
          className={styles.generateButton}
        >
          {isLoading ? <span className={styles.buttonLoading}><span className={styles.spinner} />{t.actions.generatingLyrics}</span> : t.actions.generateLyrics}
        </button>
      </div>
    </form>
  );
}
