/**
 * sumArray - returns the sum of all numbers in an array.
 * @param {number[]} arr - Array of numbers.
 * @returns {number} The sum of the array elements, or 0 for an empty array.
 */
function sumArray(arr) {
  return arr.reduce((acc, val) => acc + val, 0);
}

module.exports = sumArray;
