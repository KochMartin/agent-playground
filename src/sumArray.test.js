const sumArray = require('./sumArray');

describe('sumArray', () => {
  test('returns 0 for an empty array', () => {
    expect(sumArray([])).toBe(0);
  });

  test('returns the element itself for a single-element array', () => {
    expect(sumArray([42])).toBe(42);
  });

  test('sums positive numbers correctly', () => {
    expect(sumArray([1, 2, 3, 4, 5])).toBe(15);
  });

  test('sums negative numbers correctly', () => {
    expect(sumArray([-1, -2, -3])).toBe(-6);
  });

  test('sums mixed positive and negative numbers', () => {
    expect(sumArray([10, -3, 7, -4])).toBe(10);
  });

  test('handles floating-point numbers', () => {
    expect(sumArray([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
  });

  test('returns 0 for array of zeros', () => {
    expect(sumArray([0, 0, 0])).toBe(0);
  });
});
