import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join(root, 'docs');
const registry = JSON.parse(await readFile(path.join(docs, 'portals.json'), 'utf8'));

test('every bundled catalog destination exists', async () => {
  const local = registry.entries.filter((entry) => !entry.href.startsWith('https://'));
  await Promise.all(local.map((entry) => access(path.join(docs, entry.href))));
});

test('primary page leads with the readiness product and retains directory controls', async () => {
  const html = await readFile(path.join(docs, 'index.html'), 'utf8');
  assert.match(html, /<label[^>]+for="catalog-search"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /href="#catalog"/);
  assert.match(html, /Samsarix Agent Readiness Registry/);
  assert.match(html, /Open readiness workspace/);
  assert.match(html, /contact@samsarix\.com/);
  assert.match(html, /support@samsarix\.com/);
});

test('registry page exposes the complete local-first workflow and fallback content', async () => {
  const html = await readFile(path.join(docs, 'registry.html'), 'utf8');
  assert.match(html, /id="registry-file"/);
  assert.match(html, /id="export-json"/);
  assert.match(html, /id="export-markdown"/);
  assert.match(html, /id="reset-registry"/);
  assert.match(html, /id="agent-search"/);
  assert.match(html, /id="lifecycle-filter"/);
  assert.match(html, /id="risk-filter"/);
  assert.match(html, /id="readiness-filter"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /Your files stay in this browser/);
  assert.match(html, /never import credentials or sensitive production content/);
  assert.match(html, /href="mcp-server-example\.json"/);
  assert.match(html, /MCP Registry server\.json/);
});

test('registry browser controller preserves the local-only storage and rendering boundary', async () => {
  const source = await readFile(path.join(docs, 'assets', 'registry-app.mjs'), 'utf8');
  assert.match(source, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(source, /localStorage\.removeItem\(STORAGE_KEY/);
  assert.match(source, /Browser persistence is unavailable; export before leaving/);
  assert.match(source, /URL\.revokeObjectURL/);
  assert.match(source, /\.textContent = text/);
  assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML|eval\(|new Function/);
});

test('published legal files match the controlling repository notices', async () => {
  const [license, publishedLicense, notice, publishedNotice, legalPage] = await Promise.all([
    readFile(path.join(root, 'LICENSE'), 'utf8'),
    readFile(path.join(docs, 'LICENSE.txt'), 'utf8'),
    readFile(path.join(root, 'NOTICE'), 'utf8'),
    readFile(path.join(docs, 'NOTICE.txt'), 'utf8'),
    readFile(path.join(docs, 'legal.html'), 'utf8')
  ]);
  assert.equal(publishedLicense, license);
  assert.equal(publishedNotice, notice);
  assert.match(license, /Licensor:\s+Samsarix LLC/);
  assert.match(license, /Change Date:\s+July 28, 2030/);
  assert.match(legalPage, /Business Source License 1\.1/);
});

test('agent gallery links only to bundled profile pages and labels unavailable cards', async () => {
  const html = await readFile(path.join(docs, 'agent_gallery.html'), 'utf8');
  const destinations = [...html.matchAll(/href="([^"]+)"\s+class="agent-card(?:\s[^"]*)?"/g)].map((match) => match[1]);
  assert.equal(destinations.length, 12);
  assert.equal([...html.matchAll(/class="agent-card block unavailable-card"/g)].length, 2);
  assert.equal([...html.matchAll(/Profile not bundled/g)].length, 2);
  assert.ok(destinations.every((href) => /^[a-z0-9_-]+\.html$/.test(href)));
  await Promise.all(destinations.map((href) => access(path.join(docs, href))));
});
