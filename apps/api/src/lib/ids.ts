/**
 * ID generation: prefers the Web Crypto random UUID, with a timestamped
 * fallback for older runtimes. IDs are URL-safe and non-guessable enough for
 * unauthenticated read endpoints (they function as capability URLs).
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
