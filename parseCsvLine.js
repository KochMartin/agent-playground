/**
 * parseCsvLine(line)
 *
 * Splits a single CSV line into an array of string fields.
 * Handles:
 *  - Unquoted fields (delimited by commas)
 *  - Quoted fields that may contain commas
 *  - Escaped double-quotes inside quoted fields ("" → ")
 *
 * @param {string} line - A single CSV line string
 * @returns {string[]} Array of field strings
 */
function parseCsvLine(line) {
  const fields = [];
  let i = 0;

  // An empty string has one empty field
  if (line === '') {
    return [''];
  }

  while (i <= line.length) {
    if (i === line.length) {
      break;
    }

    if (line[i] === '"') {
      // Quoted field
      let field = '';
      i++; // skip opening quote
      while (i < line.length) {
        if (line[i] === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            // Escaped quote
            field += '"';
            i += 2;
          } else {
            // Closing quote
            i++;
            break;
          }
        } else {
          field += line[i];
          i++;
        }
      }
      fields.push(field);
      // Skip the comma separator (or end of string)
      if (i < line.length && line[i] === ',') {
        i++;
        // If this comma is the last character, add an empty trailing field
        if (i === line.length) {
          fields.push('');
        }
      }
    } else {
      // Unquoted field
      const start = i;
      while (i < line.length && line[i] !== ',') {
        i++;
      }
      fields.push(line.slice(start, i));
      if (i < line.length && line[i] === ',') {
        i++;
        // Trailing comma → trailing empty field
        if (i === line.length) {
          fields.push('');
        }
      }
    }
  }

  return fields;
}

module.exports = { parseCsvLine };
