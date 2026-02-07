/**
 * Utility functions for optimizing images via Supabase Storage Transformations
 * 
 * Supabase supports image transformations via URL parameters:
 * - width, height: resize
 * - quality: 1-100 (default 80)
 * - format: origin, webp, avif (default: origin)
 * - resize: cover, contain, fill
 * 
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */

const SUPABASE_STORAGE_URL = 'https://gsnqucupjpdlfeqpbjup.supabase.co/storage/v1';

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Check if URL is from Supabase Storage
 */
function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage/v1/object/public/');
}

/**
 * Transform a Supabase Storage image URL to use image transformations
 * 
 * @param url - Original image URL
 * @param options - Transformation options
 * @returns Transformed URL or original URL if not from Supabase
 */
export function getOptimizedImageUrl(
  url: string,
  options: ImageTransformOptions = {}
): string {
  // Return original URL if not from Supabase Storage
  if (!url || !isSupabaseStorageUrl(url)) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = options;

  // Extract bucket and path from URL
  // Format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) {
    return url;
  }

  const [, bucket, path] = match;

  // Build transformation URL
  // Format: /storage/v1/render/image/public/{bucket}/{path}?width=X&height=Y&format=webp
  const params = new URLSearchParams();
  
  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  params.set('format', format);
  params.set('resize', resize);

  return `${SUPABASE_STORAGE_URL}/render/image/public/${bucket}/${path}?${params.toString()}`;
}

/**
 * Get WebP version of image with specific size for product cards
 */
export function getProductCardImage(url: string): string {
  return getOptimizedImageUrl(url, {
    width: 400,
    height: 400,
    quality: 80,
    format: 'webp',
    resize: 'cover',
  });
}

/**
 * Get WebP version for product detail gallery
 */
export function getProductDetailImage(url: string): string {
  return getOptimizedImageUrl(url, {
    width: 800,
    height: 800,
    quality: 85,
    format: 'webp',
    resize: 'cover',
  });
}

/**
 * Get WebP version for thumbnails
 */
export function getProductThumbnail(url: string): string {
  return getOptimizedImageUrl(url, {
    width: 100,
    height: 100,
    quality: 75,
    format: 'webp',
    resize: 'cover',
  });
}

/**
 * Get WebP version for category/collection images
 */
export function getCategoryImage(url: string): string {
  return getOptimizedImageUrl(url, {
    width: 600,
    height: 400,
    quality: 80,
    format: 'webp',
    resize: 'cover',
  });
}

/**
 * Get WebP version for cart items
 */
export function getCartItemImage(url: string): string {
  return getOptimizedImageUrl(url, {
    width: 200,
    height: 200,
    quality: 75,
    format: 'webp',
    resize: 'cover',
  });
}
