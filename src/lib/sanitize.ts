/**
 * Escape ILIKE special characters to prevent wildcard injection.
 * PostgreSQL ILIKE treats % and _ as wildcards.
 */
export function escapeILike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}
