'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { HAPTIC, haptic } from '../../../src/lib/haptics';

/**
 * Drag to reorder, with a finger or a mouse.
 *
 * Built on pointer events rather than HTML5 drag-and-drop, which does not exist
 * on touch — and touch is where this is used. The panel is worked from a phone.
 *
 * **Touch starts on a hold, not on contact.** A tile that grabbed the finger
 * immediately would eat every attempt to scroll the page past a photo grid. A
 * quarter-second press is the same contract the phone's own photo apps use, and
 * a tick confirms the pickup so the hold does not feel like nothing happened.
 * A mouse has no such ambiguity: it starts as soon as the pointer travels a few
 * pixels, and a click that never moves stays a click.
 *
 * **The list reorders while the finger is still down.** Holding the change
 * until the drop makes the drag a guess. `onMove` reorders what is on screen;
 * `onDrop` is the one that persists, so a drag that wanders back to where it
 * started writes nothing.
 *
 * Drag is an addition, never the only way through: reordering must stay
 * possible with a keyboard, so the buttons this sits beside stay.
 */

const HOLD_MS = 250;
const MOUSE_THRESHOLD_PX = 5;
/** A hold that drifts this far was a scroll, not a grab. */
const HOLD_TOLERANCE_PX = 10;

type Options = {
  count: number;
  onMove: (from: number, to: number) => void;
  onDrop: (moved: boolean) => void;
  disabled?: boolean;
};

export function useDragSort({ count, onMove, onDrop, disabled }: Options) {
  const [dragging, setDragging] = useState<number | null>(null);
  const elements = useRef(new Map<number, HTMLElement>());
  const holdTimer = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const startIndex = useRef<number | null>(null);
  const currentIndex = useRef<number | null>(null);
  const movedRef = useRef(false);

  const clearHold = useCallback(() => {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  useEffect(() => clearHold, [clearHold]);

  const begin = useCallback(
    (index: number) => {
      startIndex.current = index;
      currentIndex.current = index;
      movedRef.current = false;
      setDragging(index);
      haptic(HAPTIC.tap);
    },
    []
  );

  /** The tile whose centre is nearest the pointer right now. */
  const indexUnder = useCallback((x: number, y: number): number | null => {
    let best: number | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const [index, element] of elements.current) {
      const rect = element.getBoundingClientRect();
      const dx = x - (rect.left + rect.width / 2);
      const dy = y - (rect.top + rect.height / 2);
      const distance = dx * dx + dy * dy;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    }

    return best;
  }, []);

  const finish = useCallback(() => {
    clearHold();
    const moved = movedRef.current;
    startIndex.current = null;
    currentIndex.current = null;
    origin.current = null;
    movedRef.current = false;
    setDragging((was) => {
      if (was !== null) onDrop(moved);
      return null;
    });
  }, [clearHold, onDrop]);

  const itemProps = useCallback(
    (index: number) => ({
      ref: (element: HTMLElement | null) => {
        if (element) elements.current.set(index, element);
        else elements.current.delete(index);
      },
      onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
        if (disabled || count < 2 || event.button !== 0) return;

        // The tile carries its own buttons — the arrows and the bin. A press
        // that lands on one of those is aimed at it, not at the photo, and
        // arming the drag there would make the arrows unusable with a mouse:
        // the smallest wobble while clicking would lift the tile instead.
        if (
          (event.target as HTMLElement).closest(
            'button, a, input, select, textarea, [role="button"]'
          )
        ) {
          return;
        }

        origin.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);

        if (event.pointerType === 'mouse') return;
        holdTimer.current = window.setTimeout(() => begin(index), HOLD_MS);
      },
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
        const from = origin.current;
        if (!from) return;

        const travelled = Math.hypot(
          event.clientX - from.x,
          event.clientY - from.y
        );

        // Still waiting on the hold: a finger that travels was scrolling.
        if (currentIndex.current === null) {
          if (event.pointerType === 'mouse') {
            if (travelled > MOUSE_THRESHOLD_PX) begin(index);
          } else if (travelled > HOLD_TOLERANCE_PX) {
            clearHold();
            origin.current = null;
          }
          return;
        }

        event.preventDefault();
        const over = indexUnder(event.clientX, event.clientY);
        if (over === null || over === currentIndex.current) return;

        onMove(currentIndex.current, over);
        currentIndex.current = over;
        movedRef.current = true;
        setDragging(over);
        haptic(HAPTIC.tap);
      },
      onPointerUp: finish,
      onPointerCancel: finish,
      style: {
        // Only while dragging: before that the browser must keep the gesture so
        // the page can still be scrolled from on top of a photo.
        touchAction: dragging === index ? ('none' as const) : undefined,
      },
    }),
    [
      begin,
      clearHold,
      count,
      disabled,
      dragging,
      finish,
      indexUnder,
      onMove,
    ]
  );

  return { dragging, itemProps };
}
