import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmod, lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_SOURCE_BYTES = 2 * 1024 * 1024;

// Exact files, not directories: future archives, fixtures, and prototypes stay out.
export const CLI_FILES = Object.freeze([
  ['bin/samsarix-registry.mjs', 'bin/samsarix-registry.mjs'],
  ['scripts/registry-cli.mjs', 'scripts/registry-cli.mjs'],
  ['docs/assets/readiness.mjs', 'docs/assets/readiness.mjs'],
  ['docs/agent-registry.schema.json', 'docs/agent-registry.schema.json'],
  ['docs/agent-registry-template.json', 'docs/agent-registry-template.json'],
  ['docs/a2a-agent-card-example.json', 'docs/a2a-agent-card-example.json'],
  ['docs/mcp-server-example.json', 'docs/mcp-server-example.json'],
  ['docs/review-ready-registry-example.json', 'docs/review-ready-registry-example.json'],
  ['docs/CLI_DISTRIBUTION.md', 'README.md'],
  ['LICENSE', 'LICENSE'],
  ['NOTICE', 'NOTICE'],
  ['THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.md'],
  ['TRADEMARKS.md', 'TRADEMARKS.md'],
  ['CITATION.cff', 'CITATION.cff']
].map((entry) => Object.freeze(entry)));

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export async function runCommand(command, args, options = {}) {
  return exec(command, args, {
    encoding: 'utf8', timeout: 60_000, maxBuffer: 2 * 1024 * 1024,
    windowsHide: true, ...options
  });
}

export async function npmCliPath() {
  // Launch npm's JS entry with Node instead of composing a Windows shell command.
  const candidates = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')
  ];
  for (const candidate of candidates) {
    if (!candidate || path.basename(candidate) !== 'npm-cli.js') continue;
    try {
      if ((await lstat(candidate)).isFile()) return candidate;
    } catch { /* Try the next conventional npm installation path. */ }
  }
  throw new Error('Cannot locate npm. Run this command through npm run pack:cli.');
}

async function readSource(rootDir, relative) {
  let location = rootDir;
  const parts = relative.split('/');
  for (const [index, part] of parts.entries()) {
    location = path.join(location, part);
    const info = await lstat(location);
    if (info.isSymbolicLink() || (index < parts.length - 1 ? !info.isDirectory() : !info.isFile())) {
      throw new Error(`CLI source must be a regular file through real directories: ${relative}`);
    }
    if (index === parts.length - 1 && info.size > MAX_SOURCE_BYTES) {
      throw new Error(`CLI source exceeds the 2 MiB per-file limit: ${relative}`);
    }
  }
  const bytes = await readFile(location);
  if (bytes.length > MAX_SOURCE_BYTES) throw new Error(`CLI source grew beyond its limit: ${relative}`);
  // All allowlisted inputs are UTF-8 text. Avoid host checkout newline differences.
  return Buffer.from(new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/\r\n/g, '\n'));
}

async function sourceState(rootDir) {
  const { stdout: revision } = await runCommand('git', ['rev-parse', 'HEAD'], { cwd: rootDir });
  const { stdout: status } = await runCommand('git', ['status', '--porcelain', '--untracked-files=normal'], { cwd: rootDir });
  if (!/^[a-f0-9]{40,64}$/.test(revision.trim())) throw new Error('Cannot identify the source Git revision.');
  return { revision: revision.trim(), dirty: Boolean(status.trim()) };
}

function json(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
}

export async function buildCliDistribution({ rootDir = root } = {}) {
  const sourceRoot = await realpath(rootDir);
  const metadata = JSON.parse(await readSource(sourceRoot, 'package.json'));
  if (metadata.name !== 'samsarix-agent-readiness-registry'
    || !/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(metadata.version)) {
    throw new Error('Unexpected package identity or unsafe release version.');
  }
  const source = await sourceState(sourceRoot);
  const packageMetadata = {
    name: metadata.name, version: metadata.version, private: true, type: 'module',
    description: 'Offline AI agent readiness CLI with Samsarix, A2A, and MCP metadata import.',
    license: metadata.license, author: metadata.author, repository: metadata.repository,
    bin: { 'samsarix-registry': 'bin/samsarix-registry.mjs' },
    engines: metadata.engines,
    files: [...CLI_FILES.map(([, target]) => target), 'manifest.json'].sort()
  };
  const files = new Map([['package.json', json(packageMetadata)]]);
  for (const [relative, target] of CLI_FILES) files.set(target, await readSource(sourceRoot, relative));
  const after = await sourceState(sourceRoot);
  if (source.revision !== after.revision || source.dirty !== after.dirty) {
    throw new Error('Source Git state changed during packaging; retry from a stable checkout.');
  }
  const manifest = {
    schemaVersion: 1, name: metadata.name, version: metadata.version,
    scope: 'cli-only', source, textNormalization: 'UTF-8 with LF line endings',
    files: [...files].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
      .map(([name, bytes]) => ({ path: name, bytes: bytes.length, sha256: sha256(bytes) }))
  };
  const manifestBytes = json(manifest);
  files.set('manifest.json', manifestBytes);
  const temporary = await mkdtemp(path.join(tmpdir(), 'samsarix-cli-package-'));
  try {
    const stage = path.join(temporary, 'stage');
    for (const [relative, bytes] of files) {
      const destination = path.join(stage, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, bytes, { flag: 'wx' });
      await chmod(destination, relative.startsWith('bin/') ? 0o755 : 0o644);
    }
    const { stdout } = await runCommand(process.execPath, [
      await npmCliPath(), 'pack', stage, '--json', '--ignore-scripts', '--offline',
      '--pack-destination', temporary
    ], { cwd: temporary });
    const [packed] = JSON.parse(stdout);
    const expected = [...files.keys()].sort();
    const actual = packed.files.map((entry) => entry.path).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('npm packed unexpected or missing CLI files.');
    if (path.basename(packed.filename) !== packed.filename || !packed.filename.endsWith('.tgz')) {
      throw new Error('npm returned an unsafe archive filename.');
    }
    const archive = await readFile(path.join(temporary, packed.filename));
    const baseName = `${metadata.name}-${metadata.version}-cli`;
    const archiveName = `${baseName}.tgz`;
    const manifestName = `${baseName}.manifest.json`;
    return {
      archiveName, archive, manifestName, manifestBytes, manifest,
      checksumName: `${baseName}.sha256`,
      checksums: Buffer.from(`${sha256(archive)}  ${archiveName}\n${sha256(manifestBytes)}  ${manifestName}\n`)
    };
  } finally {
    // Only remove the fresh, private directory returned by mkdtemp.
    await rm(temporary, { recursive: true, force: true });
  }
}

export async function writeCliDistribution(bundle, outputDir) {
  await mkdir(outputDir, { recursive: true });
  if (!(await lstat(outputDir)).isDirectory()) throw new Error('Release output must be a real directory.');
  for (const [name, bytes] of [
    [bundle.archiveName, bundle.archive], [bundle.manifestName, bundle.manifestBytes],
    [bundle.checksumName, bundle.checksums]
  ]) {
    const destination = path.join(outputDir, name);
    try {
      // Never overwrite a previous artifact or follow an existing file symlink.
      await writeFile(destination, bytes, { flag: 'wx' });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (!(await lstat(destination)).isFile() || !bytes.equals(await readFile(destination))) {
        throw new Error(`Refusing to replace different release content: ${destination}. Choose a new --out directory.`);
      }
    }
  }
}

async function main(args) {
  if (args.length && (args.length !== 2 || args[0] !== '--out' || !args[1] || args[1].startsWith('--'))) {
    throw new Error('Usage: npm run pack:cli -- [--out <directory>]');
  }
  const outputDir = path.resolve(args[1] || path.join(root, 'release'));
  const bundle = await buildCliDistribution();
  await writeCliDistribution(bundle, outputDir);
  console.log(`CLI distribution: ${path.join(outputDir, bundle.archiveName)}`);
  console.log(`Files: ${bundle.manifest.files.length + 1}; archive bytes: ${bundle.archive.length}`);
  console.log(`Source: ${bundle.manifest.source.revision}${bundle.manifest.source.dirty ? ' (dirty; not a release artifact)' : ' (clean)'}`);
  console.log(`SHA-256: ${sha256(bundle.archive)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`CLI packaging failed: ${error.message}`);
    process.exitCode = 1;
  });
}
