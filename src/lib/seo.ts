/** Serializes JSON-LD, escaping `<` so it cannot break out of the script tag. */
export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
