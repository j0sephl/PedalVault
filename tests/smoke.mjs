/**
 * PedalVault smoke tests — run against local static server:
 *   python3 -m http.server 8765 --bind 127.0.0.1
 *   node tests/smoke.mjs
 *
 * Optional: BASE_URL=https://pedalvault.app node tests/smoke.mjs
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8765';
const results = [];

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.error(`  ✗ ${name} — ${detail}`);
}

async function test(name, fn) {
  try {
    await fn();
    if (!results.some((r) => r.name === name)) pass(name);
  } catch (err) {
    fail(name, err.message || String(err));
  }
}

async function waitVisible(locator, timeout = 5000) {
  await locator.waitFor({ state: 'visible', timeout });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  reducedMotion: 'no-preference',
});
const page = await context.newPage();

const consoleErrors = [];
const pageErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => pageErrors.push(err.message));

console.log(`\nPedalVault Playwright smoke @ ${BASE}\n`);

await test('homepage loads with title', async () => {
  const res = await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  assert.ok(res?.ok(), `status ${res?.status()}`);
  assert.match(await page.title(), /PedalVault/);
});

await test('robots.txt is crawlable', async () => {
  const res = await page.request.get(BASE + '/robots.txt');
  assert.ok(res.ok(), `status ${res.status()}`);
  const body = await res.text();
  assert.match(body, /Sitemap:\s*https:\/\/pedalvault\.app\/sitemap\.xml/);
  assert.match(body, /Allow:\s*\//);
});

await test('sitemap.xml is valid', async () => {
  const res = await page.request.get(BASE + '/sitemap.xml');
  assert.ok(res.ok(), `status ${res.status()}`);
  const body = await res.text();
  assert.match(body, /<urlset/);
  assert.match(body, /https:\/\/pedalvault\.app\//);
});

await test('vendor assets resolve (rive + wasm + papa)', async () => {
  for (const path of ['/vendor/rive.js', '/vendor/rive.wasm', '/vendor/papaparse.min.js']) {
    const res = await page.request.get(BASE + path);
    assert.ok(res.ok(), `${path} status ${res.status()}`);
  }
});

await test('skip link and main landmarks exist', async () => {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('.skip-link').getAttribute('href'), '#inventoryItems');
  await waitVisible(page.locator('main.content'));
  assert.match((await page.locator('h1.header-tagline').textContent()) || '', /Pedal Part Inventory/);
});

await test('desktop sidebar has hierarchy (Add + Import + groups)', async () => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await waitVisible(page.locator('.sync-buttons .add-part-btn'));
  assert.match(
    (await page.locator('.sync-buttons .sync-btn-secondary').textContent()) || '',
    /Import BOM/
  );
  assert.equal(await page.locator('.sync-group-summary').count(), 2);
});

await test('empty or inventory state renders', async () => {
  // Fresh storage so empty-state path is deterministic
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  const empty = page.locator('.empty-state');
  await waitVisible(empty);
  assert.match(
    (await empty.locator('.empty-state-primary').textContent()) || '',
    /Import BOM/
  );
});

await test('load sample parts and adjust qty with undo', async () => {
  await page.locator('.empty-state summary').click();
  await page.locator('[data-empty-action="sample"]').click();
  await waitVisible(page.locator('.inventory-item').first());
  // Let the "Loaded sample…" toast settle so it doesn't race the qty toast
  await page.waitForTimeout(400);

  const first = page.locator('.inventory-item').first();
  const qtyEl = first.locator('.quantity-number');
  const before = Number(await qtyEl.textContent());
  await first.locator('[data-action="increase"]').click();
  await page.waitForFunction(
    (expected) => {
      const el = document.querySelector('.inventory-item .quantity-number');
      return el && el.textContent.trim() === String(expected);
    },
    before + 1,
    { timeout: 3000 }
  );

  await waitVisible(page.locator('#notification.show'));
  await waitVisible(page.locator('#notificationUndoBtn:not(.hidden)'));
  await page.locator('#notificationUndoBtn').click();
  await page.waitForFunction(
    (expected) => {
      const el = document.querySelector('.inventory-item .quantity-number');
      return el && el.textContent.trim() === String(expected);
    },
    before,
    { timeout: 3000 }
  );
});

await test('stock status encoding on rows', async () => {
  const cls = await page.locator('.inventory-item').first().getAttribute('class');
  assert.match(cls || '', /stock-(ok|low|out)/);
});

await test('Rive logo canvas stays visible (WASM loads)', async () => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const canvas = page.locator('#rive-logo');
  await waitVisible(canvas);
  await page.waitForTimeout(2000);
  const display = await canvas.evaluate((el) => getComputedStyle(el).display);
  assert.notEqual(display, 'none', 'canvas hidden (likely WASM/load failure)');
  assert.ok(await page.evaluate(() => typeof window.rive !== 'undefined'), 'window.rive missing');
});

await test('mobile nav labels are Parts / Backup', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await waitVisible(page.locator('.mobile-nav'));
  assert.equal(
    (
      await page.locator('.mobile-nav-item[data-tab="action"] > span:not(.mobile-nav-badge)').textContent()
    )?.trim(),
    'Parts'
  );
  assert.equal(
    (
      await page.locator('.mobile-nav-item[data-tab="data"] > span:not(.mobile-nav-badge)').textContent()
    )?.trim(),
    'Backup'
  );
});

await test('no critical console/page errors on load', async () => {
  const critical = [...consoleErrors, ...pageErrors].filter(
    (t) =>
      !/favicon|vercel|insights|frame-ancestors|404 \(File not found\)/i.test(t)
  );
  assert.equal(critical.length, 0, critical.slice(0, 5).join(' | '));
});

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log('\nFailures:');
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
}
process.exit(failed.length ? 1 : 0);
