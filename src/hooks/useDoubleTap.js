import { useCallback, useRef } from "react";

const DEFAULT_DELAY_MS = 320;
const DEFAULT_DISTANCE_PX = 28;

export function useDoubleTap(
  onDoubleTap,
  { delay = DEFAULT_DELAY_MS, distance = DEFAULT_DISTANCE_PX, disabled = false } = {},
) {
  const lastTapRef = useRef({ at: 0, x: 0, y: 0 });

  const reset = useCallback(() => {
    lastTapRef.current = { at: 0, x: 0, y: 0 };
  }, []);

  const onPointerUp = useCallback(
    (event) => {
      if (disabled) return false;

      const now = Date.now();
      const { at, x, y } = lastTapRef.current;
      const dx = Math.abs(event.clientX - x);
      const dy = Math.abs(event.clientY - y);

      if (at && now - at <= delay && dx <= distance && dy <= distance) {
        lastTapRef.current = { at: 0, x: 0, y: 0 };
        onDoubleTap(event);
        return true;
      }

      lastTapRef.current = {
        at: now,
        x: event.clientX,
        y: event.clientY,
      };
      return false;
    },
    [delay, distance, disabled, onDoubleTap],
  );

  return { onPointerUp, reset };
}
