/**
 * Serializes an array of plain objects into a CSV string.
 *
 * - The first row is a header derived from the keys of the first object.
 * - Each subsequent row contains the values for each object, in the same
 *   column order as the header.
 * - Values are escaped by wrapping them in double-quotes whenever they
 *   contain a comma, double-quote, or newline; embedded double-quotes are
 *   doubled per RFC 4180.
 *
 * @param {Array<Record<string, unknown>>} rows - Array of plain objects to serialize.
 * @returns {string} CSV-formatted string (CRLF line endings per RFC 4180).
 */
function toCsv(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);

  /**
   * Escapes a single cell value according to RFC 4180.
   * @param {unknown} value
   * @returns {string}
   */
  function escapeCell(value) {
    const str = value === null || value === undefined ? "" : String(value);
    if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  const lines = [headers.map(escapeCell).join(",")];

  for (const row of rows) {
    const cells = headers.map((h) => escapeCell(row[h]));
    lines.push(cells.join(","));
  }

  return lines.join("\r\n");
}

module.exports = { toCsv };
