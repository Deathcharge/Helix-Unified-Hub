import assert from 'node:assert/strict';
import test from 'node:test';
import { syncRegistryAssetVersions, versionRegistrySources } from '../scripts/version-registry-assets.mjs';

const sources = {
  'assets/readiness.mjs': 'export const policy = 1;',
  'assets/registry-import.mjs': "import { policy } from './readiness.mjs';",
  'assets/registry-app.mjs': "import { policy } from './readiness.mjs'; import './registry-import.mjs';",
  'assets/registry.css': '.registry { color: white; }',
  'assets/styles.css': 'body { margin: 0; }',
  'registry.html': '<script src="assets/registry-app.mjs"></script><link href="assets/registry.css"><link href="assets/styles.css">'
};

test('asset versions are deterministic, idempotent, and do not mutate source input', () => {
  const before = { ...sources };
  const first = versionRegistrySources(sources);
  assert.deepEqual(sources, before);
  assert.deepEqual(versionRegistrySources(first), first);
  assert.equal(first['assets/registry-import.mjs'].match(/readiness\.mjs\?v=([a-f0-9]{64})/)[1],
    first['assets/registry-app.mjs'].match(/readiness\.mjs\?v=([a-f0-9]{64})/)[1]);
});

test('policy changes invalidate both importers and their HTML entry point', () => {
  const first = versionRegistrySources(sources);
  const changed = versionRegistrySources({ ...first, 'assets/readiness.mjs': 'export const policy = 2;' });
  for (const file of ['assets/registry-import.mjs', 'assets/registry-app.mjs', 'registry.html']) {
    assert.notEqual(changed[file], first[file], file);
  }
});

test('cache versions are stable across LF and CRLF checkouts', () => {
  const lf = Object.fromEntries(Object.entries(sources).map(([file, text]) => [file, `${text}\n`]));
  const crlf = Object.fromEntries(Object.entries(lf).map(([file, text]) => [file, text.replace(/\n/g, '\r\n')]));
  const normalized = Object.fromEntries(Object.entries(versionRegistrySources(crlf)).map(([file, text]) => [file, text.replace(/\r\n/g, '\n')]));
  assert.deepEqual(normalized, versionRegistrySources(lf));
});

test('helper and style changes invalidate the affected parents without changing policy bytes', () => {
  const first = versionRegistrySources(sources);
  for (const leaf of ['assets/registry-import.mjs', 'assets/registry.css', 'assets/styles.css']) {
    const changed = versionRegistrySources({ ...first, [leaf]: `${first[leaf]}\n/* change */` });
    assert.notEqual(changed['registry.html'], first['registry.html']);
    assert.equal(changed['assets/readiness.mjs'], first['assets/readiness.mjs']);
  }
});

test('missing or ambiguous references fail closed instead of leaving stale URLs', () => {
  assert.throws(() => versionRegistrySources({ ...sources, 'registry.html': '' }), /exactly one/);
  assert.throws(() => versionRegistrySources({ ...sources, 'registry.html': sources['registry.html'].repeat(2) }), /exactly one/);
  assert.throws(() => versionRegistrySources({ ...sources, 'assets/readiness.mjs': undefined }), /Missing asset/);
});

test('checked-in registry assets already carry their current content versions', async () => {
  assert.deepEqual(await syncRegistryAssetVersions(), []);
});
