const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { toCsv } = require("./toCsv");

describe("toCsv", () => {
  it("returns empty string for an empty array", () => {
    assert.equal(toCsv([]), "");
  });

  it("returns empty string for non-array input", () => {
    assert.equal(toCsv(null), "");
    assert.equal(toCsv(undefined), "");
    assert.equal(toCsv("string"), "");
  });

  it("serializes a single object with simple values", () => {
    const result = toCsv([{ name: "Alice", age: 30 }]);
    assert.equal(result, "name,age\r\nAlice,30");
  });

  it("serializes multiple rows", () => {
    const rows = [
      { id: 1, city: "Berlin", country: "Germany" },
      { id: 2, city: "Paris", country: "France" },
      { id: 3, city: "Tokyo", country: "Japan" },
    ];
    const expected =
      "id,city,country\r\n" +
      "1,Berlin,Germany\r\n" +
      "2,Paris,France\r\n" +
      "3,Tokyo,Japan";
    assert.equal(toCsv(rows), expected);
  });

  it("escapes values that contain a comma", () => {
    const result = toCsv([{ phrase: "hello, world", num: 1 }]);
    assert.equal(result, 'phrase,num\r\n"hello, world",1');
  });

  it("escapes values that contain double-quotes", () => {
    const result = toCsv([{ quote: 'say "hi"' }]);
    assert.equal(result, 'quote\r\n"say ""hi"""');
  });

  it("escapes values that contain newlines", () => {
    const result = toCsv([{ notes: "line1\nline2" }]);
    assert.equal(result, 'notes\r\n"line1\nline2"');
  });

  it("treats null and undefined values as empty strings", () => {
    const result = toCsv([{ a: null, b: undefined, c: "ok" }]);
    assert.equal(result, "a,b,c\r\n,,ok");
  });

  it("uses column order from the first object's keys", () => {
    const rows = [
      { z: "last", a: "first" },
      { a: "uno", z: "cero" },
    ];
    const result = toCsv(rows);
    assert.equal(result, "z,a\r\nlast,first\r\ncero,uno");
  });

  it("handles numeric and boolean values", () => {
    const result = toCsv([{ x: 3.14, flag: true }]);
    assert.equal(result, "x,flag\r\n3.14,true");
  });
});
