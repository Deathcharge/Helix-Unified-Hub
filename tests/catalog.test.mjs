import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { filterEntries, normalizeQuery, safeHref } from '../docs/assets/catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(await readFile(path.join(root, 'docs', 'portals.json'), 'utf8'));

test('registry identifiers and destinations are unique', () => {
  assert.equal(new Set(registry.entries.map((entry) => entry.id)).size, registry.entries.length);
  assert.equal(new Set(registry.entries.map((entry) => entry.href)).size, registry.entries.length);
});

test('search is case-insensitive and includes tags', () => {
  const result = filterEntries(registry.entries, { query: 'ETHICAL', category: 'all', status: 'all' });
  assert.ok(result.some((entry) => entry.id === 'kael-profile'));
  assert.equal(normalizeQuery('  AETHER  '), 'aether');
});

test('category and lifecycle filters compose', () => {
  const result = filterEntries(registry.entries, { query: '', category: 'Profiles', status: 'included' });
  assert.ok(result.length >= 10);
  assert.ok(result.every((entry) => entry.category === 'Profiles' && entry.status === 'included'));
});

test('safeHref rejects executable and escaping destinations', () => {
  assert.equal(safeHref('javascript:alert(1)'), null);
  assert.equal(safeHref('//attacker.example/path'), null);
  assert.equal(safeHref('http://example.com'), null);
  assert.equal(safeHref('../outside.html'), null);
  assert.equal(safeHref('agent_gallery.html'), 'agent_gallery.html');
  assert.equal(safeHref('https://github.com/Deathcharge/Helix-Unified-Hub'), 'https://github.com/Deathcharge/Helix-Unified-Hub');
});
