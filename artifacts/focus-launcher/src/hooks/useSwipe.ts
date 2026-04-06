import { useState, useEffect, useRef, useCallback } from 'react';

interface SwipeState {
  isDragging: boolean;
  dragOffset: number;
}

interface UseSwipeProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  disabled?: boolean;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 80, disabled = false }: UseSwipeProps) {
  const [swipeState, setSwipeState] = useState<SwipeState>({ isDragging: false, dragOffset: 0 });
  const startX = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);

  const handleDragStart = useCallback((clientX: number) => {
    if (disabled) return;
    startX.current = clientX;
    currentX.current = clientX;
    setSwipeState({ isDragging: true, dragOffset: 0 });
  }, [disabled]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!swipeState.isDragging || startX.current === null) return;
    currentX.current = clientX;
    const diff = clientX - startX.current;
    setSwipeState({ isDragging: true, dragOffset: diff });
  }, [swipeState.isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!swipeState.isDragging || startX.current === null || currentX.current === null) {
      setSwipeState({ isDragging: false, dragOffset: 0 });
      return;
    }

    const diff = currentX.current - startX.current;
    
    if (diff > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (diff < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    startX.current = null;
    currentX.current = null;
    setSwipeState({ isDragging: false, dragOffset: 0 });
  }, [swipeState.isDragging, threshold, onSwipeLeft, onSwipeRight]);

  const touchHandlers = {
    onTouchStart: (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX),
    onTouchMove: (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX),
    onTouchEnd: handleDragEnd,
  };

  const mouseHandlers = {
    onMouseDown: (e: React.MouseEvent) => handleDragStart(e.clientX),
    onMouseMove: (e: React.MouseEvent) => handleDragMove(e.clientX),
    onMouseUp: handleDragEnd,
    onMouseLeave: handleDragEnd,
  };

  return {
    handlers: { ...touchHandlers, ...mouseHandlers },
    isDragging: swipeState.isDragging,
    dragOffset: swipeState.dragOffset
  };
}
