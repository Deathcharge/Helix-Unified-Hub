import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { after, before } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  CLI_FILES, buildCliDistribution, npmCliPath, runCommand, sha256, writeCliDistribution
} from '../scripts/package-cli.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(path.join(tmpdir(), 'samsarix packaged cli '));
let bundle;
let installed;
let extracted;
let npmCli;

before(async () => {
  npmCli = await npmCliPath();
  bundle = await buildCliDistribution();
  await writeCliDistribution(bundle, temporary);
  const extractedRoot = path.join(temporary, 'extracted');
  await mkdir(extractedRoot);
  await runCommand('tar', ['-xzf', path.join(temporary, bundle.archiveName), '-C', extractedRoot]);
  extracted = path.join(extractedRoot, 'package');
  const consumer = path.join(temporary, 'consumer');
  await mkdir(consumer);
  await writeFile(path.join(consumer, 'package.json'), JSON.stringify({
    name: 'packaged-cli-test', private: true,
    scripts: { probe: 'samsarix-registry --version' }
  }));
  await runCommand(process.execPath, [npmCli, 'install', path.join(temporary, bundle.archiveName),
    '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--no-save', '--package-lock=false'
  ], { cwd: consumer });
  installed = path.join(consumer, 'node_modules', 'samsarix-agent-readiness-registry');
});

after(async () => {
  await rm(temporary, { recursive: true, force: true });
});

function invoke(packageRoot, args, options = {}) {
  const result = spawnSync(process.execPath, [path.join(packageRoot, 'bin/samsarix-registry.mjs'), ...args], {
    cwd: temporary, encoding: 'utf8', timeout: 30_000, windowsHide: true, ...options
  });
  if (result.error) throw result.error;
  return result;
}

async function relativeFiles(directory, prefix = '') {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}${item.name}`;
    assert.equal(item.isSymbolicLink(), false, `unexpected symlink: ${relative}`);
    if (item.isDirectory()) files.push(...await relativeFiles(path.join(directory, item.name), `${relative}/`));
    else files.push(relative);
  }
  return files.sort();
}

test('CLI tarball has exactly the maintained allowlist and a complete byte-hash manifest', async () => {
  const expected = [...CLI_FILES.map(([, destination]) => destination), 'package.json', 'manifest.json'].sort();
  assert.deepEqual(await relativeFiles(extracted), expected);
  assert.deepEqual(await relativeFiles(installed), expected);
  assert.equal(bundle.archive.length < 100_000, true, 'CLI bundle unexpectedly large');
  const manifest = JSON.parse(await readFile(path.join(extracted, 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest, bundle.manifest);
  assert.match(manifest.source.revision, /^[a-f0-9]{40,64}$/);
  assert.equal(typeof manifest.source.dirty, 'boolean');
  assert.equal(manifest.scope, 'cli-only');
  assert.deepEqual(manifest.files.map((entry) => entry.path).sort(), expected.filter((name) => name !== 'manifest.json'));
  for (const file of manifest.files) {
    const bytes = await readFile(path.join(extracted, file.path));
    assert.equal(bytes.length, file.bytes);
    assert.equal(sha256(bytes), file.sha256);
    assert.equal(bytes.includes(Buffer.from('\r\n')), false);
  }
  const metadata = JSON.parse(await readFile(path.join(installed, 'package.json'), 'utf8'));
  assert.equal(metadata.private, true);
  assert.equal(metadata.scripts, undefined);
  assert.equal(metadata.dependencies, undefined);
  assert.equal(metadata.devDependencies, undefined);
  assert.equal(metadata.bin['samsarix-registry'], 'bin/samsarix-registry.mjs');
  assert.match(bundle.checksums.toString(), new RegExp(`^${sha256(bundle.archive)}  `));
  assert.match(bundle.checksums.toString(), new RegExp(`${sha256(bundle.manifestBytes)}  `));
});

test('extracted and installed CLI run the documented workflow outside the checkout', async () => {
  for (const packageRoot of [extracted, installed]) {
    assert.equal(invoke(packageRoot, ['--version']).stdout.trim(), bundle.manifest.version);
    assert.match(invoke(packageRoot, ['--help']).stdout, /Usage:/);
    for (const name of ['agent-registry-template.json', 'a2a-agent-card-example.json', 'mcp-server-example.json']) {
      const result = invoke(packageRoot, ['validate', path.join(packageRoot, 'docs', name), '--format', 'json']);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(JSON.parse(result.stdout).agents, 1);
    }
    const readyFile = path.join(packageRoot, 'docs/review-ready-registry-example.json');
    const passing = invoke(packageRoot, ['check', readyFile, '--require-candidates', '--now', '2026-08-09']);
    assert.equal(passing.status, 0, passing.stderr);
    assert.match(passing.stdout, /PASS/);
    const blocked = invoke(packageRoot, ['check', path.join(packageRoot, 'docs/mcp-server-example.json'),
      '--include-development', '--require-candidates', '--now', '2026-08-09']);
    assert.equal(blocked.status, 2);
    assert.match(blocked.stdout, /Risk tier is unassessed/);
    const reportArgs = ['report', readyFile, '--format', 'markdown', '--now', '2026-08-09'];
    const report = invoke(packageRoot, reportArgs);
    assert.equal(report.status, 0);
    assert.match(report.stdout, /Ready for governed use/);
    assert.equal(report.stdout, invoke(packageRoot, reportArgs).stdout);
    const input = await readFile(path.join(packageRoot, 'docs/mcp-server-example.json'), 'utf8');
    assert.equal(invoke(packageRoot, ['validate', '-'], { input }).status, 0);
  }
  const shim = await runCommand(process.execPath, [npmCli, 'run', 'probe', '--ignore-scripts'], {
    cwd: path.join(temporary, 'consumer')
  });
  assert.equal(shim.stdout.trim().endsWith(bundle.manifest.version), true);
});

test('packaged CLI preserves error codes and future-evidence security fixes', async () => {
  assert.equal(invoke(installed, ['unknown']).status, 64);
  assert.equal(invoke(installed, ['validate', '-'], { input: '{broken' }).status, 65);
  assert.equal(invoke(installed, ['validate', '-'], { input: ' '.repeat(1024 * 1024 + 1) }).status, 65);
  assert.equal(invoke(installed, ['validate', 'missing-registry.json']).status, 66);
  const future = JSON.parse(await readFile(path.join(installed, 'docs/review-ready-registry-example.json'), 'utf8'));
  for (const gate of Object.values(future.agents[0].evidence)) gate.reviewedAt = '9999-12-31';
  const result = invoke(installed, ['check', '-', '--now', '2026-08-09'], { input: JSON.stringify(future) });
  assert.equal(result.status, 2);
  assert.match(result.stdout, /future review date/);
});

test('packaging is repeatable and refuses to overwrite different or linked output', async () => {
  const again = await buildCliDistribution();
  assert.equal(sha256(again.archive), sha256(bundle.archive));
  assert.deepEqual(again.manifest, bundle.manifest);
  await writeCliDistribution(bundle, temporary); // Identical output is safe to reuse.
  const blocked = path.join(temporary, 'blocked');
  await mkdir(blocked);
  await writeFile(path.join(blocked, bundle.archiveName), 'keep me');
  await assert.rejects(writeCliDistribution(bundle, blocked), /Refusing to replace/);
  assert.equal(await readFile(path.join(blocked, bundle.archiveName), 'utf8'), 'keep me');
  const linked = path.join(temporary, 'linked-output');
  await symlink(blocked, linked, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(writeCliDistribution(bundle, linked), /real directory/);
});

test('release packer rejects linked source directories rather than following them', async () => {
  const fixture = path.join(temporary, 'source-fixture');
  await mkdir(fixture);
  await cp(path.join(root, 'package.json'), path.join(fixture, 'package.json'));
  await runCommand('git', ['init', '--quiet', fixture]);
  await runCommand('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '--quiet', '-m', 'fixture'], { cwd: fixture });
  await symlink(path.join(root, 'bin'), path.join(fixture, 'bin'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(buildCliDistribution({ rootDir: fixture }), /regular file through real directories/);
  assert.equal((await lstat(path.join(fixture, 'bin'))).isSymbolicLink(), true);
  await access(path.join(root, 'bin/samsarix-registry.mjs'));
});
