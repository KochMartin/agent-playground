const { factorial } = require('./factorial');

describe('factorial', () => {
  test('factorial(0) === 1', () => {
    expect(factorial(0)).toBe(1);
  });

  test('factorial(1) === 1', () => {
    expect(factorial(1)).toBe(1);
  });

  test('factorial(5) === 120', () => {
    expect(factorial(5)).toBe(120);
  });

  test('throws RangeError for negative input', () => {
    expect(() => factorial(-1)).toThrow(RangeError);
    expect(() => factorial(-1)).toThrow('factorial is not defined for negative numbers');
  });
});
