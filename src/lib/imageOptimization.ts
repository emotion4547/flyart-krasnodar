/**
 * Image optimization utilities
 * 
 * Note: Supabase Image Transformations require a Pro plan.
 * These functions return original URLs as-is for compatibility,
 * serving as future-ready placeholders if transformations become available.
 */

/**
 * Returns the image URL (passthrough for now)
 */
export function getOptimizedImageUrl(url: string): string {
  return url || '';
}

export function getProductCardImage(url: string): string {
  return url || '';
}

export function getProductDetailImage(url: string): string {
  return url || '';
}

export function getProductThumbnail(url: string): string {
  return url || '';
}

export function getCategoryImage(url: string): string {
  return url || '';
}

export function getCartItemImage(url: string): string {
  return url || '';
}
