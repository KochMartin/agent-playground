import { divide } from '../utils';

describe('divide', () => {
  describe('normal division', () => {
    it('divides two positive numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    it('divides to a non-integer result', () => {
      expect(divide(7, 2)).toBe(3.5);
    });

    it('divides a number by 1', () => {
      expect(divide(42, 1)).toBe(42);
    });

    it('divides a number by itself', () => {
      expect(divide(5, 5)).toBe(1);
    });
  });

  describe('negative numbers', () => {
    it('divides a negative numerator by a positive denominator', () => {
      expect(divide(-10, 2)).toBe(-5);
    });

    it('divides a positive numerator by a negative denominator', () => {
      expect(divide(10, -2)).toBe(-5);
    });

    it('divides two negative numbers', () => {
      expect(divide(-10, -2)).toBe(5);
    });
  });

  describe('division by zero', () => {
    it('throws an Error when dividing by zero', () => {
      expect(() => divide(10, 0)).toThrow(Error);
    });

    it('throws with the message "Division by zero"', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero');
    });

    it('throws when dividing zero by zero', () => {
      expect(() => divide(0, 0)).toThrow('Division by zero');
    });
  });
});
