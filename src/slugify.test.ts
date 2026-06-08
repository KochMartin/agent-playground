import { slugify } from './slugify';

describe('slugify', () => {
  it('converts a normal sentence to a slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  Hello,  World!! ')).toBe('hello-world');
  });

  it('collapses multiple separators into a single hyphen', () => {
    expect(slugify('foo---bar___baz')).toBe('foo-bar-baz');
  });

  it('handles punctuation runs as a single separator', () => {
    expect(slugify('one!!!two???three')).toBe('one-two-three');
  });

  it('produces no leading or trailing hyphens', () => {
    expect(slugify('!!!hello!!!')).toBe('hello');
  });

  it('returns an empty string for whitespace-only input', () => {
    expect(slugify('   ')).toBe('');
  });

  it('lowercases all characters', () => {
    expect(slugify('TypeScript Is GREAT')).toBe('typescript-is-great');
  });
});
