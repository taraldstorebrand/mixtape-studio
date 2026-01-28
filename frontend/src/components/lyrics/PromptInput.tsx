import React, { useState, useEffect } from 'react';

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
    <form onSubmit={handleSubmit} className="prompt-form">
      <div className="prompt-input-group">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Skriv en prompt for sangteksten (f.eks. 'En sang om sommer')"
          disabled={isLoading}
          className="prompt-textarea"
          rows={3}
        />
        <button 
          type="submit" 
          disabled={!prompt.trim() || isLoading}
          className="generate-button"
        >
          {isLoading ? <span className="button-loading"><span className="spinner" />Genererer tekst...</span> : 'Generer tekst'}
        </button>
      </div>
    </form>
  );
}
