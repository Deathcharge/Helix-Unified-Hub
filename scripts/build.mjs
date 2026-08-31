import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncRegistryAssetVersions } from './version-registry-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'docs');
const output = path.join(root, 'dist');

if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
  throw new Error(`Refusing to clean unexpected output path: ${output}`);
}

if ((await syncRegistryAssetVersions()).length) {
  throw new Error('Registry asset versions are stale. Run node scripts/version-registry-assets.mjs --write before building.');
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
console.log(`Built static release artifact: ${path.relative(root, output)}`);
