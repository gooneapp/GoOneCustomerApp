/**
 * GoOne Customer App — category emoji lookup
 *
 * Shared between Home and Shop so both screens render an identical icon
 * for the same business category. Real categories come back from
 * `catalogApi.getCategories()` / `mapBusiness()` as `{id, name}` — the id
 * is a backend UUID, so it cannot be used as a lookup key into a static
 * emoji table. Matching is done by substring against the category
 * *name* instead (mirrors the keywords from the app's original
 * hardcoded category list).
 */
export function emojiForCategory(name?: string | null): string {
  if (!name) return '🏪';
  const n = name.toLowerCase();
  if (n.includes('grocer')) return '🛒';
  if (n.includes('restaurant') || n.includes('food') || n.includes('hotel')) return '🍱';
  if (n.includes('medical') || n.includes('pharmac') || n.includes('medicine')) return '💊';
  if (n.includes('milk') || n.includes('water') || n.includes('dairy')) return '🥛';
  if (n.includes('farmer') || n.includes('farm')) return '🌾';
  if (n.includes('service') || n.includes('salon')) return '✂️';
  return '🏪';
}
