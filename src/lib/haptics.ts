/**
 * Haptic feedback — what each platform actually allows.
 *
 * **Android / Chrome / Firefox**: `navigator.vibrate`, which works any time
 * after the first interaction with the page.
 *
 * **iPhone**: Safari has never implemented a vibration API. The only route to
 * the Taptic Engine from the web is the native `<input type="checkbox" switch>`
 * control (Safari 17.4+) — toggling it makes the system play the tick. The
 * catch is that Apple changed the rules partway:
 *
 * - **iOS 17.4 – 26.4**: a scripted `label.click()` counted as a toggle and
 *   buzzed. That is what the hidden trigger in the layout is for.
 * - **iOS 26.5+**: a trusted event is required. No synthetic click buzzes any
 *   more — `isTrusted` cannot be forged from script. Only a real finger on a
 *   real native control reaches the Taptic Engine.
 *
 * So on an up-to-date iPhone this function is best-effort and often silent.
 * That is deliberate: haptics are a garnish, never the signal itself. Every
 * place this is called also changes something visible, because a caller must
 * never depend on the buzz landing.
 *
 * ⚠️ The click has to go through the **label**. Clicking the input from script
 * never fires the tick — a WebKit quirk that predates the change above.
 */

/** Where the hidden native switch lives; see `HapticTrigger`. */
export const HAPTIC_LABEL_ID = 'haptic-trigger-label';

/**
 * Durations in milliseconds. Short enough to read as a tick rather than a
 * buzz — anything past ~30ms starts to feel like an error on Android.
 */
export const HAPTIC = {
  /** Selection, toggle, picking up a photo to drag. */
  tap: 10,
  /** Something committed: added to cart, saved, dropped into place. */
  commit: 18,
  /** Something removed or refused. Two short ticks read as "undone". */
  undo: [12, 40, 12],
} as const;

export function haptic(
  pattern: number | readonly number[] = HAPTIC.tap
): void {
  if (typeof document !== 'undefined') {
    // Must be the label — clicking the input from script never ticks.
    document.getElementById(HAPTIC_LABEL_ID)?.click();
  }

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      // `vibrate` mutates nothing; the cast only drops `readonly`, which the
      // `as const` on HAPTIC adds.
      navigator.vibrate(pattern as number | number[]);
    } catch {
      // Some browsers throw when the tab is in the background.
    }
  }
}
