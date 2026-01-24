import { HistoryItem } from '../types';

const STORAGE_KEY = 'sangtekst_history';

export function saveHistoryItem(item: HistoryItem): void {
  const history = getHistory();
  history.unshift(item);
  // Keep only last 100 items
  const limitedHistory = history.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
}

export function getHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const history = stored ? JSON.parse(stored) : [];
    
    // Migrate old items with sunoAudioUrl to sunoAudioUrls
    const migratedHistory = history.map((item: any) => {
      if (item.sunoAudioUrl && !item.sunoAudioUrls) {
        return {
          ...item,
          sunoAudioUrls: [item.sunoAudioUrl],
          sunoAudioUrl: undefined, // Remove old field
        };
      }
      return item;
    });
    
    // Save migrated history if any changes were made
    if (migratedHistory.some((item: any, index: number) => item !== history[index])) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedHistory));
    }
    
    return migratedHistory;
  } catch (error) {
    console.error('Error reading history from localStorage:', error);
    return [];
  }
}

export function updateHistoryItem(id: string, updates: Partial<HistoryItem>): void {
  const history = getHistory();
  const index = history.findIndex(item => item.id === id);
  
  if (index !== -1) {
    history[index] = { ...history[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

export function updateFeedback(id: string, feedback: 'up' | 'down'): void {
  updateHistoryItem(id, { feedback });
}

export function removeHistoryItem(id: string): void {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
