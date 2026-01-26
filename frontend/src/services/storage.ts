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
    return stored ? JSON.parse(stored) : [];
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

export function updateFeedback(id: string, feedback: 'up' | 'down' | null): void {
  updateHistoryItem(id, { feedback: feedback ?? undefined });
}

export function removeHistoryItem(id: string): void {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
