import { useState, useEffect, RefObject } from 'react';

interface UseResizableOptions {
  containerRef: RefObject<HTMLElement | null>;
  storageKey: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

interface UseResizableReturn {
  width: number;
  isDragging: boolean;
  handleMouseDown: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function useResizable({
  containerRef,
  storageKey,
  defaultWidth = 50,
  minWidth = 30,
  maxWidth = 70,
}: UseResizableOptions): UseResizableReturn {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : defaultWidth;
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, width.toString());
  }, [storageKey, width]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setWidth(Math.max(minWidth, width - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setWidth(Math.min(maxWidth, width + 5));
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      setWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setWidth(Math.max(minWidth, width - 5));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setWidth(Math.min(maxWidth, width + 5));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging, containerRef, minWidth, maxWidth, width]);

  return { width, isDragging, handleMouseDown, handleKeyDown };
}
