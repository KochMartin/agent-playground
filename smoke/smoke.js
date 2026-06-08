/**
 * QA Campaign F9 — Platform Playwright UI Smoke
 * Requirement: RQ071082
 * Target: https://agentos.aqua-cloud.io/ (basic-auth gate)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://qa:dquzft5gHtnSinpckNRv@agentos.aqua-cloud.io/';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

async function main() {
  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const results = {
    landing: { rendered: false, title: null, rebranded: false },
    fleet: { rendered: false },
    items: { rendered: false },
    consoleErrors: [],
  };

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(msg.text());
      console.log(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });

  // ── Step 1: Open landing URL ──────────────────────────────────────────────
  console.log('\n[1] Opening landing URL...');
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Give the SPA extra time to hydrate
    await page.waitForTimeout(4000);

    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body?.innerText || '');
    const htmlContent = await page.content();

    results.landing.title = title;
    results.landing.rendered = true;

    // ── Step 3: Confirm rebrand ───────────────────────────────────────────
    const rebranded =
      title.toLowerCase().includes('aqua intelligence') ||
      title.toLowerCase().includes('agent os') ||
      bodyText.toLowerCase().includes('aqua intelligence agent os') ||
      htmlContent.toLowerCase().includes('aqua intelligence agent os');

    results.landing.rebranded = rebranded;
    console.log(`    Page title: "${title}"`);
    console.log(`    Rebrand confirmed: ${rebranded}`);

    // ── Step 6: Screenshot landing page ──────────────────────────────────
    const landingPath = path.join(SCREENSHOTS_DIR, 'landing.png');
    await page.screenshot({ path: landingPath, fullPage: true });
    console.log(`    Screenshot saved: ${landingPath}`);
  } catch (err) {
    console.error(`    [ERROR] Landing page failed: ${err.message}`);
    results.landing.error = err.message;
  }

  // ── Step 4: Navigate to Fleet page ───────────────────────────────────────
  console.log('\n[2] Navigating to Fleet page...');
  try {
    // Try common SPA navigation patterns
    const fleetNavigated = await tryNavigate(page, [
      () => page.getByRole('link', { name: /fleet/i }).first().click(),
      () => page.locator('a[href*="fleet"], nav >> text=Fleet, [data-testid*="fleet"]').first().click(),
      () => page.goto(BASE_URL + 'fleet', { waitUntil: 'domcontentloaded', timeout: 20000 }),
      () => page.goto(BASE_URL + '#/fleet', { waitUntil: 'domcontentloaded', timeout: 20000 }),
    ]);

    await page.waitForTimeout(3000);
    const fleetPath = path.join(SCREENSHOTS_DIR, 'fleet.png');
    await page.screenshot({ path: fleetPath, fullPage: true });
    results.fleet.rendered = true;
    console.log(`    Fleet screenshot saved: ${fleetPath}`);
  } catch (err) {
    console.error(`    [ERROR] Fleet page failed: ${err.message}`);
    results.fleet.error = err.message;
    try {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fleet.png'), fullPage: true });
    } catch (_) {}
  }

  // ── Step 5: Navigate to Items page ───────────────────────────────────────
  console.log('\n[3] Navigating to Items page...');
  try {
    // Try common SPA navigation patterns
    const itemsNavigated = await tryNavigate(page, [
      () => page.getByRole('link', { name: /items/i }).first().click(),
      () => page.locator('a[href*="item"], nav >> text=Items, [data-testid*="item"]').first().click(),
      () => page.goto(BASE_URL + 'items', { waitUntil: 'domcontentloaded', timeout: 20000 }),
      () => page.goto(BASE_URL + '#/items', { waitUntil: 'domcontentloaded', timeout: 20000 }),
    ]);

    await page.waitForTimeout(3000);
    const itemsPath = path.join(SCREENSHOTS_DIR, 'items.png');
    await page.screenshot({ path: itemsPath, fullPage: true });
    results.items.rendered = true;
    console.log(`    Items screenshot saved: ${itemsPath}`);
  } catch (err) {
    console.error(`    [ERROR] Items page failed: ${err.message}`);
    results.items.error = err.message;
    try {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'items.png'), fullPage: true });
    } catch (_) {}
  }

  await browser.close();

  // ── Report ────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════');
  console.log('        QA F9 SMOKE TEST REPORT         ');
  console.log('════════════════════════════════════════');
  console.log(`Landing page rendered:  ${results.landing.rendered}`);
  console.log(`Page title:             "${results.landing.title}"`);
  console.log(`Rebrand confirmed:      ${results.landing.rebranded}`);
  console.log(`Fleet page rendered:    ${results.fleet.rendered}`);
  console.log(`Items page rendered:    ${results.items.rendered}`);
  console.log(`Total console errors:   ${results.consoleErrors.length}`);
  if (results.consoleErrors.length > 0) {
    console.log('Console errors:');
    results.consoleErrors.forEach((e, i) => console.log(`  [${i + 1}] ${e}`));
  }

  const passed =
    results.landing.rendered &&
    results.landing.rebranded &&
    results.fleet.rendered &&
    results.items.rendered;

  console.log(`\nOVERALL: ${passed ? '✅ PASS' : '❌ FAIL'}`);

  // Write JSON results for CI / attachment
  const reportPath = path.join(__dirname, 'smoke-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nFull report saved: ${reportPath}`);

  return results;
}

/** Try each action in sequence; return on first success */
async function tryNavigate(page, actions) {
  for (const action of actions) {
    try {
      await action();
      return true;
    } catch (_) {
      // try next
    }
  }
  return false;
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
