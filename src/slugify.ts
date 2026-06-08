/**
 * Converts a string into a URL-friendly slug.
 *
 * Steps:
 *  1. Trim surrounding whitespace.
 *  2. Lowercase the result.
 *  3. Replace every run of non-alphanumeric characters with a single hyphen.
 *  4. Strip any leading or trailing hyphens.
 *
 * @example
 *   slugify('  Hello,  World!! ') // => 'hello-world'
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
