/**
 * Client-side image compression utility
 * Compresses images before upload using Canvas API
 * Converts to WebP format, resizes to maxWidth, applies quality setting
 */

export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<File> {
  // Skip non-image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Skip already small files (< 100KB)
  if (file.size < 100 * 1024) {
    return file;
  }

  // Skip SVGs - they don't benefit from canvas compression
  if (file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Only resize if larger than maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fall back to JPEG
      const supportsWebP = canvas.toDataURL('image/webp').startsWith('data:image/webp');
      const mimeType = supportsWebP ? 'image/webp' : 'image/jpeg';
      const extension = supportsWebP ? 'webp' : 'jpg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Only use compressed version if it's actually smaller
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File([blob], `${baseName}.${extension}`, {
            type: mimeType,
            lastModified: Date.now(),
          });

          console.log(
            `[ImageCompression] ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% saved)`
          );

          resolve(compressedFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fall back to original on error
    };

    img.src = url;
  });
}
