/**
 * Slug Generation Utility
 * Converts business names to URL-friendly slugs
 */

/**
 * Convert a string to a URL-friendly slug
 * @param text - Text to slugify
 * @returns URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove special characters
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and multiple hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug for a professional
 * @param businessName - Business name to slugify
 * @param emirate - Professional's primary emirate (optional)
 * @returns Unique slug
 */
export function generateProSlug(businessName: string, emirate?: string): string {
  const baseSlug = slugify(businessName);

  // Add emirate for better SEO and uniqueness
  if (emirate) {
    const emirateSlug = slugify(emirate);
    return `${baseSlug}-${emirateSlug}`;
  }

  return baseSlug;
}

/**
 * Generate a unique slug with counter for duplicate names
 * @param baseSlug - Base slug to use
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug with counter if needed
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate if a string is a valid slug
 * @param slug - Slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Only lowercase letters, numbers, and hyphens
  // No leading/trailing hyphens
  // No consecutive hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
