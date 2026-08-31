import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = new URL('../docs/', import.meta.url);
const files = ['assets/readiness.mjs', 'assets/registry-import.mjs', 'assets/registry-app.mjs',
  'assets/registry.css', 'assets/styles.css', 'registry.html'];
// Canonical LF keeps cache keys stable across Git's Windows checkout conversion.
const digest = (text) => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex');

function stamp(source, target, content) {
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?<=["'])${escaped}(?:\\?v=[a-f0-9]{64})?(?=["'])`, 'g');
  if (source.match(pattern)?.length !== 1) throw new Error(`Expected exactly one quoted asset reference: ${target}`);
  return source.replace(pattern, `${target}?v=${digest(content)}`);
}

// Leaves first, then parents: a policy change invalidates both importers and the
// HTML entry point. All importers use the identical policy URL/module instance.
export function versionRegistrySources(sources) {
  const next = { ...sources };
  for (const file of files) if (typeof next[file] !== 'string') throw new Error(`Missing asset source: ${file}`);
  next['assets/registry-import.mjs'] = stamp(next['assets/registry-import.mjs'], './readiness.mjs', next['assets/readiness.mjs']);
  next['assets/registry-app.mjs'] = stamp(next['assets/registry-app.mjs'], './readiness.mjs', next['assets/readiness.mjs']);
  next['assets/registry-app.mjs'] = stamp(next['assets/registry-app.mjs'], './registry-import.mjs', next['assets/registry-import.mjs']);
  for (const file of ['assets/registry-app.mjs', 'assets/registry.css', 'assets/styles.css']) {
    next['registry.html'] = stamp(next['registry.html'], file, next[file]);
  }
  return next;
}

export async function syncRegistryAssetVersions({ write = false } = {}) {
  const sources = Object.fromEntries(await Promise.all(files.map(async (file) => [file, await readFile(new URL(file, docs), 'utf8')])));
  const next = versionRegistrySources(sources);
  const changed = files.filter((file) => sources[file] !== next[file]);
  if (write) for (const file of changed) await writeFile(new URL(file, docs), next[file]);
  return changed;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const option = process.argv[2] || '--check';
  if (!['--check', '--write'].includes(option) || process.argv.length > 3) {
    throw new Error('Usage: node scripts/version-registry-assets.mjs [--check|--write]');
  }
  const changed = await syncRegistryAssetVersions({ write: option === '--write' });
  if (changed.length && option !== '--write') {
    console.error(`Stale registry asset versions: ${changed.join(', ')}. Run node scripts/version-registry-assets.mjs --write.`);
    process.exitCode = 1;
  } else console.log(changed.length ? `Updated registry asset versions: ${changed.join(', ')}` : 'Registry asset versions are current.');
}
