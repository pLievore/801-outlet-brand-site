/**
 * The half of a "opens in a new tab" link that only some people get.
 *
 * A sighted person sees the tab appear and understands immediately. Someone
 * using a screen reader hears the link text, follows it, and lands somewhere
 * with no history to go back through — the Back button does nothing, and there
 * is no clue why. WCAG asks for the warning to come before the trip, not after.
 *
 * Rendered inside the link so it is read as part of the link's name.
 */
export function NewTabHint() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}
