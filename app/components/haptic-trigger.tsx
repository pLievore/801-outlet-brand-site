'use client';

import { HAPTIC_LABEL_ID } from '../../src/lib/haptics';

/**
 * The iPhone's haptic trigger — a hidden island holding one native switch.
 *
 * Safari exposes no vibration API. The only path to the Taptic Engine is the
 * native switch control, so anywhere in the app can ask for a tick without
 * having a native control under the finger: `haptic()` clicks this label.
 *
 * On iOS 26.5 and later Apple requires a trusted event, so here the element is
 * inert with no side effect — an invisible checkbox changes state and nothing
 * else happens. It costs one node and keeps the tick working on every device
 * that still allows it.
 *
 * Hidden by size and opacity rather than `display: none`, which would make the
 * control unclickable and defeat the whole thing.
 */
export function HapticTrigger() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: 1,
        height: 1,
        opacity: 0.001,
        overflow: 'hidden',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <input
        type="checkbox"
        id="haptic-trigger-switch"
        // Non-standard Safari attribute; React passes unknown props through.
        {...{ switch: '' }}
        // Out of the tab order: this is machinery, not a control. Without it a
        // screen reader finds an unnamed switch inside an aria-hidden island.
        tabIndex={-1}
        aria-hidden="true"
        readOnly
      />
      <label
        htmlFor="haptic-trigger-switch"
        id={HAPTIC_LABEL_ID}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
