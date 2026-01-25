import { useState } from 'react';
import { HistoryItem } from '../types';
import { getHistory, saveHistoryItem, updateFeedback, updateHistoryItem, removeHistoryItem } from '../services/storage';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => getHistory());

  const refreshHistory = () => {
    setHistory(getHistory());
  };

  const addHistoryItem = (item: HistoryItem) => {
    saveHistoryItem(item);
    setHistory(getHistory());
  };

  const updateItem = (id: string, updates: Partial<HistoryItem>) => {
    updateHistoryItem(id, updates);
    setHistory(getHistory());
  };

  const handleFeedback = (id: string, feedback: 'up' | 'down' | null) => {
    updateFeedback(id, feedback);
    setHistory(getHistory());
  };

  const removeItem = (id: string) => {
    removeHistoryItem(id);
    setHistory(getHistory());
  };

  return {
    history,
    addHistoryItem,
    updateHistoryItem: updateItem,
    removeHistoryItem: removeItem,
    handleFeedback,
    refreshHistory,
  };
}
