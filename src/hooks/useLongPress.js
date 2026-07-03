import { useCallback, useRef } from "react";

const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE = 10;

export function useLongPress(onLongPress, { disabled = false } = {}) {
  const timerRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(
    (event) => {
      if (disabled) return;
      firedRef.current = false;
      startRef.current = { x: event.clientX, y: event.clientY };
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        navigator.vibrate?.(12);
        onLongPress();
      }, LONG_PRESS_MS);
    },
    [disabled, onLongPress],
  );

  const onPointerMove = useCallback(
    (event) => {
      if (!timerRef.current) return;
      const dx = Math.abs(event.clientX - startRef.current.x);
      const dy = Math.abs(event.clientY - startRef.current.y);
      if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) clear();
    },
    [clear],
  );

  const onPointerUp = useCallback(() => {
    clear();
  }, [clear]);

  const onPointerCancel = useCallback(() => {
    clear();
  }, [clear]);

  const onContextMenu = useCallback(
    (event) => {
      if (disabled) return;
      event.preventDefault();
      firedRef.current = true;
      onLongPress();
    },
    [disabled, onLongPress],
  );

  return {
    longPressHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onContextMenu,
    },
    wasLongPress: () => firedRef.current,
    resetLongPress: () => {
      firedRef.current = false;
    },
  };
}
