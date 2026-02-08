import { useEffect, useState, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { scrollToItemIdAtom } from '../store';

export function useScrollToItem() {
  const scrollToItemId = useAtomValue(scrollToItemIdAtom);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    if (scrollToItemId === null) return;

    let highlightTimeoutId: ReturnType<typeof setTimeout>;

    const scrollTimeoutId = setTimeout(() => {
      const targetElement = itemRefs.current.get(scrollToItemId);

      if (!targetElement) {
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const isVisible =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= windowHeight &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);

      if (!isVisible) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      setHighlightedItemId(scrollToItemId);

      highlightTimeoutId = setTimeout(() => {
        setHighlightedItemId(null);
      }, 1500);
    }, 100);

    return () => {
      clearTimeout(scrollTimeoutId);
      clearTimeout(highlightTimeoutId);
    };
  }, [scrollToItemId]);

  const setItemRef = (itemId: string, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current.set(itemId, element);
    } else {
      itemRefs.current.delete(itemId);
    }
  };

  return { highlightedItemId, setItemRef };
}
