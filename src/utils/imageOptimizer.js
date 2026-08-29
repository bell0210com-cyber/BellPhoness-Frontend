/**
 * Optimizes Cloudinary image URLs with automatic format (WebP/AVIF), 
 * automatic quality compression, and size bounding.
 * 
 * Example transformation:
 * https://res.cloudinary.com/pkotqxwo/image/upload/v1234/test.png
 * -> https://res.cloudinary.com/pkotqxwo/image/upload/f_auto,q_auto,w_400,c_limit/v1234/test.png
 */
export function optimizeCloudinaryUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url || '';
  if (!url.includes('res.cloudinary.com')) return url;

  const {
    width = 400,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options;

  // Check if transformation is already present
  if (url.includes('/image/upload/f_') || url.includes('/image/upload/w_') || url.includes('/image/upload/q_')) {
    return url;
  }

  const transform = `f_${format},q_${quality},w_${width},c_${crop}`;
  return url.replace('/image/upload/', `/image/upload/${transform}/`);
}
