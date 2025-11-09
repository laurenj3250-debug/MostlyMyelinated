import { useEffect, useState } from 'react';

/**
 * Hook for detecting swipe gestures on mobile devices
 * @param onSwipe - Callback function that receives the swipe direction
 */
export function useSwipe(onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void) {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStart.x;
      const deltaY = e.changedTouches[0].clientY - touchStart.y;
      const threshold = 50; // Minimum distance for swipe detection

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
        // Vertical swipe
        onSwipe(deltaY < 0 ? 'up' : 'down');
      } else if (Math.abs(deltaX) > threshold) {
        // Horizontal swipe
        onSwipe(deltaX < 0 ? 'left' : 'right');
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, onSwipe]);
}
