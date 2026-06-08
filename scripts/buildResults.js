/**
 * Reads results-raw.json (Jest JSON output) and writes results.json
 * summarising pass/fail counts per test suite.
 */
const fs = require('fs');
const path = require('path');

const rawPath = path.join(__dirname, '..', 'results-raw.json');
const outPath = path.join(__dirname, '..', 'results.json');

if (!fs.existsSync(rawPath)) {
  console.error('results-raw.json not found. Run jest first.');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

const suites = raw.testResults.map((suite) => {
  const name = path.basename(suite.testFilePath);
  const passed = suite.testResults.filter((t) => t.status === 'passed').length;
  const failed = suite.testResults.filter((t) => t.status === 'failed').length;
  const skipped = suite.testResults.filter((t) => t.status === 'pending').length;
  return { suite: name, passed, failed, skipped };
});

const total = {
  passed: suites.reduce((a, s) => a + s.passed, 0),
  failed: suites.reduce((a, s) => a + s.failed, 0),
  skipped: suites.reduce((a, s) => a + s.skipped, 0),
};

const output = {
  generatedAt: new Date().toISOString(),
  overall: { ...total, status: total.failed === 0 ? 'PASS' : 'FAIL' },
  suites,
};

fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log('results.json written:', JSON.stringify(output, null, 2));
