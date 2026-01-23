import { useState, useCallback } from 'react';
import { HistoryItem } from '../types';
import { getHistory, saveHistoryItem, updateFeedback, updateHistoryItem } from '../services/storage';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => getHistory());

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  const addHistoryItem = useCallback((item: HistoryItem) => {
    saveHistoryItem(item);
    setHistory(getHistory());
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<HistoryItem>) => {
    updateHistoryItem(id, updates);
    setHistory(getHistory());
  }, []);

  const handleFeedback = useCallback((id: string, feedback: 'up' | 'down') => {
    updateFeedback(id, feedback);
    setHistory(getHistory());
  }, []);

  return {
    history,
    addHistoryItem,
    updateHistoryItem: updateItem,
    handleFeedback,
    refreshHistory,
  };
}
