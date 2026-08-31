import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { prepareRegistryImport } from '../docs/assets/registry-import.mjs';
import { MAX_IMPORT_BYTES, normalizeRegistryDocument, parseRegistryText, serializeRegistry } from '../docs/assets/readiness.mjs';

const fixture = async (name) => parseRegistryText(await readFile(new URL(`../docs/${name}`, import.meta.url), 'utf8'));
const inventory = (start, count, summary = 'Fictional concept.') => ({
  schemaVersion: 1,
  workspace: { name: 'Local inventory', description: '', updatedAt: '2026-08-31' },
  agents: Array.from({ length: count }, (_, i) => ({ id: `agent-${start + i}`, name: 'Example', summary }))
});

test('add combines A2A and MCP without changing workspace metadata or either source', async () => {
  const current = await fixture('a2a-agent-card-example.json');
  const incoming = await fixture('mcp-server-example.json');
  const before = structuredClone({ current, incoming });
  const merged = prepareRegistryImport(current, incoming, 'add');
  assert.deepEqual(merged.workspace, current.workspace);
  assert.deepEqual(merged.agents, [...current.agents, ...incoming.agents]);
  assert.deepEqual({ current, incoming }, before);
  merged.agents[0].owner.name = 'Changed only in result';
  assert.deepEqual({ current, incoming }, before, 'results must not share nested mutable state');
});

test('replace works without a current registry and uses incoming workspace details', () => {
  const incoming = inventory(1, 2);
  assert.deepEqual(prepareRegistryImport(null, incoming), normalizeRegistryDocument(incoming));
  assert.throws(() => prepareRegistryImport(null, incoming, 'add'), /Replace inventory before adding/);
  assert.throws(() => prepareRegistryImport(null, incoming, 'overwrite'), /Choose Replace inventory or Add agents/);
});

test('duplicate IDs reject the complete addition without silently overwriting evidence', () => {
  const current = inventory(1, 1);
  const incoming = inventory(1, 2);
  const before = structuredClone({ current, incoming });
  assert.throws(() => prepareRegistryImport(current, incoming, 'add'), /Duplicate agent id/);
  assert.deepEqual({ current, incoming }, before);
});

test('combined inventories enforce the 500-agent bound and remain exportable/reimportable', () => {
  const merged = prepareRegistryImport(inventory(1, 499), inventory(500, 1), 'add');
  assert.equal(merged.agents.length, 500);
  assert.equal(parseRegistryText(serializeRegistry(merged)).agents.length, 500);
  assert.throws(() => prepareRegistryImport(merged, inventory(501, 1), 'add'), /500 items or fewer/);
});

test('combined and normalized replacement sizes are bounded by UTF-8 saved JSON bytes', () => {
  const current = inventory(1, 250, '界'.repeat(600));
  const incoming = inventory(251, 250, '界'.repeat(600));
  assert.ok(Buffer.byteLength(serializeRegistry(current)) < MAX_IMPORT_BYTES);
  assert.ok(Buffer.byteLength(serializeRegistry(incoming)) < MAX_IMPORT_BYTES);
  assert.throws(() => prepareRegistryImport(current, incoming, 'add'), /saved\/exported size limit/);
  const compact = inventory(1, 500, 'x'.repeat(600));
  assert.ok(Buffer.byteLength(JSON.stringify(compact)) < MAX_IMPORT_BYTES, 'small source can expand when normalized');
  assert.throws(() => prepareRegistryImport(null, parseRegistryText(JSON.stringify(compact))), /saved\/exported size limit/);
});
