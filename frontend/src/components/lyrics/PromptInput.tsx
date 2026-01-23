import React, { useState } from 'react';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="prompt-form">
      <div className="input-group">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Skriv en prompt for sangteksten (f.eks. 'En sang om sommer')"
          disabled={isLoading}
          className="prompt-input"
        />
        <button 
          type="submit" 
          disabled={!prompt.trim() || isLoading}
          className="generate-button"
        >
          {isLoading ? 'Genererer...' : 'Generer Tekst'}
        </button>
      </div>
    </form>
  );
}
