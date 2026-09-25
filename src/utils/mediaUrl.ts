/**
 * RevEg Fresh Foods - URL & Media Path Resolver
 * Ensures smooth operation in root (/) and Apache subfolders (/public_html/site2/)
 */

export const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85';

/**
 * Resolves an image URL so it works seamlessly in any subfolder or hosting environment.
 */
export function resolveMediaUrl(url?: string | null, fallback = DEFAULT_HERO_IMAGE): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // Absolute URLs, Blob URLs (for instant previews), and Data URLs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Remove leading slash if it references uploads or assets, making it relative to current subfolder
  if (trimmed.startsWith('/uploads/')) {
    return trimmed.slice(1);
  }
  if (trimmed.startsWith('/assets/')) {
    return trimmed.slice(1);
  }
  if (trimmed.startsWith('/')) {
    return trimmed.slice(1);
  }

  return trimmed;
}

/**
 * Resolves an API URL relative to the current subfolder location.
 */
export function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/')) {
    return path.slice(1);
  }
  return path;
}
