/**
 * The panel colours that cannot be a CSS variable.
 *
 * Everything the panel paints goes through `rgb(var(--panel*))` in
 * `app/globals.css`. Charts are the exception: these values reach SVG through
 * attributes, where `var()` does not resolve — so they have to be literals.
 *
 * Two copies of a colour drift, and the one that drifts is the one nobody
 * tests. `contrast.test.ts` asserts each of these still equals the token it
 * mirrors, so a change to the stylesheet that forgets the chart fails the
 * suite instead of shipping two different greens.
 */

/** Mirrors `--panel-chart`. Bars and the area line on paper backgrounds. */
export const PANEL_CHART = '#6f8352';

/** The same line on the dark panel card, lifted for contrast against it. */
export const PANEL_CHART_ON_DARK = '#c9dbb2';

/** Mirrors `--panel`. The sidebar and dark cards. */
export const PANEL_SURFACE = '#171c17';

/** Mirrors `--panel-marker`. Active-item rule and the operator initials. */
export const PANEL_MARKER = '#a9bd95';
