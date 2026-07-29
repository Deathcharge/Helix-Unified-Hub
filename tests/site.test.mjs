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

test('primary page has discovery controls and fallback content', async () => {
  const html = await readFile(path.join(docs, 'index.html'), 'utf8');
  assert.match(html, /<label[^>]+for="catalog-search"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /href="#catalog"/);
  assert.match(html, /Samsarix Hub Directory/);
  assert.match(html, /contact@samsarix\.com/);
  assert.match(html, /support@samsarix\.com/);
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
