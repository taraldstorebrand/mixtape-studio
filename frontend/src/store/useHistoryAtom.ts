import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { historyAtom } from './atoms';
import { HistoryItem } from '../types';
import {
  fetchHistory,
  createHistoryItem as apiCreateHistoryItem,
  updateHistoryItem as apiUpdateHistoryItem,
  deleteHistoryItem as apiDeleteHistoryItem,
} from '../services/api';

export function useHistoryAtom() {
  const [history, setHistory] = useAtom(historyAtom);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeHistory = async () => {
      try {
        const items = await fetchHistory();
        setHistory(items);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    initializeHistory();
  }, [setHistory]);

  const addHistoryItem = async (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev]);

    try {
      await apiCreateHistoryItem(item);
    } catch (error) {
      console.error('Failed to create history item:', error);
      setHistory((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  const updateHistoryItem = async (id: string, updates: Partial<HistoryItem>) => {
    let previousItem: HistoryItem | undefined;

    setHistory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          previousItem = item;
          return { ...item, ...updates };
        }
        return item;
      })
    );

    try {
      await apiUpdateHistoryItem(id, updates);
    } catch (error) {
      console.error('Failed to update history item:', error);
      if (previousItem) {
        setHistory((prev) =>
          prev.map((item) => (item.id === id ? previousItem! : item))
        );
      }
    }
  };

  const handleFeedback = async (id: string, feedback: 'up' | 'down' | null) => {
    await updateHistoryItem(id, { feedback: feedback ?? undefined });
  };

  const removeHistoryItem = async (id: string) => {
    let removedItem: HistoryItem | undefined;

    setHistory((prev) => {
      removedItem = prev.find((item) => item.id === id);
      return prev.filter((item) => item.id !== id);
    });

    try {
      await apiDeleteHistoryItem(id);
    } catch (error) {
      console.error('Failed to delete history item:', error);
      if (removedItem) {
        setHistory((prev) => [removedItem!, ...prev]);
      }
    }
  };

  return {
    history,
    addHistoryItem,
    updateHistoryItem,
    removeHistoryItem,
    handleFeedback,
  };
}
