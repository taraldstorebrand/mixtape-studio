import { useAtom } from 'jotai';
import { historyAtom } from './atoms';
import { HistoryItem } from '../types';
import {
  saveHistoryItem,
  updateHistoryItem as updateStorageItem,
  updateFeedback as updateStorageFeedback,
  removeHistoryItem as removeStorageItem,
  getHistory,
} from '../services/storage';

export function useHistoryAtom() {
  const [history, setHistory] = useAtom(historyAtom);

  const addHistoryItem = (item: HistoryItem) => {
    saveHistoryItem(item);
    setHistory(getHistory());
  };

  const updateHistoryItem = (id: string, updates: Partial<HistoryItem>) => {
    updateStorageItem(id, updates);
    setHistory(getHistory());
  };

  const handleFeedback = (id: string, feedback: 'up' | 'down' | null) => {
    updateStorageFeedback(id, feedback);
    setHistory(getHistory());
  };

  const removeHistoryItem = (id: string) => {
    removeStorageItem(id);
    setHistory(getHistory());
  };

  return {
    history,
    addHistoryItem,
    updateHistoryItem,
    removeHistoryItem,
    handleFeedback,
  };
}
