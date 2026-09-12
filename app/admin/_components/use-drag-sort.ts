'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { HAPTIC, haptic } from '../../../src/lib/haptics';

/**
 * Drag to reorder, with a finger or a mouse.
 *
 * Built on pointer events rather than HTML5 drag-and-drop, which does not exist
 * on touch and conflicts with native image drags on desktop.
 *
 * **Desktop starts immediately upon slight motion (4px).** No delay or hold
 * required with a mouse. Native browser image ghost-dragging is suppressed.
 *
 * **Touch starts on a fast hold (180ms).** A quick press-and-hold confirms
 * intention without hijacking regular page scrolling. Haptic feedback ticks
 * both on pickup and upon crossing each new slot.
 *
 * **Geometry is read directly from container children in real-time.** Rather
 * than relying on stale ref maps across React re-renders, the live layout of
 * grid slots is queried directly, guaranteeing that rapid moves and multi-hop
 * drags always hit the exact intended position.
 */

const TOUCH_HOLD_MS = 180;
const MOUSE_THRESHOLD_PX = 4;
const TOUCH_SCROLL_TOLERANCE_PX = 12;

type Options = {
  count: number;
  onMove: (from: number, to: number) => void;
  onDrop: (moved: boolean) => void;
  disabled?: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
};

export function useDragSort({
  count,
  onMove,
  onDrop,
  disabled,
  containerRef,
}: Options) {
  const [dragging, setDragging] = useState<number | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const activePointerId = useRef<number | null>(null);
  const currentIndex = useRef<number | null>(null);
  const isTouch = useRef(false);
  const movedRef = useRef(false);
  const startIndex = useRef<number | null>(null);

  const clearHold = useCallback(() => {
    if (holdTimer.current !== null) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  useEffect(() => clearHold, [clearHold]);

  const indexUnder = useCallback(
    (x: number, y: number): number | null => {
      const container = containerRef.current;
      if (!container) return null;

      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return null;

      let best: number | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let index = 0; index < children.length; index += 1) {
        const rect = children[index].getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = (x - cx) ** 2 + (y - cy) ** 2;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      }

      return best;
    },
    [containerRef]
  );

  const finish = useCallback(() => {
    clearHold();
    const moved = movedRef.current;
    currentIndex.current = null;
    origin.current = null;
    activePointerId.current = null;
    startIndex.current = null;
    movedRef.current = false;
    setDragging((was) => {
      if (was !== null) {
        onDrop(moved);
      }
      return null;
    });
  }, [clearHold, onDrop]);

  const begin = useCallback((index: number) => {
    currentIndex.current = index;
    movedRef.current = false;
    setDragging(index);
    haptic(HAPTIC.tap);
  }, []);

  // Global window listeners when a pointer interaction is active
  useEffect(() => {
    const onWindowPointerMove = (event: PointerEvent) => {
      if (
        activePointerId.current !== null &&
        event.pointerId !== activePointerId.current
      ) {
        return;
      }

      const from = origin.current;
      if (!from) return;

      const travelled = Math.hypot(
        event.clientX - from.x,
        event.clientY - from.y
      );

      // Before dragging has formally started
      if (currentIndex.current === null) {
        if (!isTouch.current) {
          // Mouse: start immediately when moved past threshold
          if (travelled > MOUSE_THRESHOLD_PX && startIndex.current !== null) {
            begin(startIndex.current);
          }
        } else {
          // Touch: if finger travels before hold timer fires, user is scrolling
          if (travelled > TOUCH_SCROLL_TOLERANCE_PX) {
            clearHold();
            origin.current = null;
            activePointerId.current = null;
          }
        }
        return;
      }

      // Dragging is active
      event.preventDefault();
      const over = indexUnder(event.clientX, event.clientY);
      if (over === null || over === currentIndex.current) return;

      onMove(currentIndex.current, over);
      currentIndex.current = over;
      movedRef.current = true;
      setDragging(over);
      haptic(HAPTIC.tap);
    };

    const onWindowPointerUp = (event: PointerEvent) => {
      if (
        activePointerId.current !== null &&
        event.pointerId !== activePointerId.current
      ) {
        return;
      }
      finish();
    };

    window.addEventListener('pointermove', onWindowPointerMove, {
      passive: false,
    });
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }, [begin, clearHold, finish, indexUnder, onMove]);

  const itemProps = useCallback(
    (index: number) => ({
      draggable: false,
      onDragStart: (event: React.DragEvent) => {
        event.preventDefault();
      },
      onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
        if (disabled || count < 2 || event.button !== 0) return;

        // Don't drag when pressing action buttons (arrows, trash)
        if (
          (event.target as HTMLElement).closest(
            'button, a, input, select, textarea, [role="button"]'
          )
        ) {
          return;
        }

        clearHold();
        origin.current = { x: event.clientX, y: event.clientY };
        activePointerId.current = event.pointerId;
        startIndex.current = index;
        isTouch.current =
          event.pointerType === 'touch' || event.pointerType === 'pen';

        if (isTouch.current) {
          holdTimer.current = setTimeout(() => {
            begin(index);
          }, TOUCH_HOLD_MS);
        }
      },
      style: {
        touchAction: dragging !== null ? ('none' as const) : undefined,
        userSelect: 'none' as const,
        WebkitUserSelect: 'none' as const,
      },
    }),
    [begin, clearHold, count, disabled, dragging]
  );

  return { dragging, itemProps };
}

