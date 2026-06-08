/**
 * Divides a by b.
 * @throws {Error} if b is zero (division by zero)
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}
