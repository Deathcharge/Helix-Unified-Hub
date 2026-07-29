import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { SAFE_STATUSES, safeHref } from '../docs/assets/catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join(root, 'docs');
const failures = [];
const fail = (message) => failures.push(message);
const read = (relativePath) => readFile(path.join(root, relativePath), 'utf8');
const registry = JSON.parse(await read('docs/portals.json'));

async function htmlFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await htmlFiles(absolute));
    else if (entry.name.endsWith('.html')) found.push(absolute);
  }
  return found;
}

if (registry.schemaVersion !== 1 || !Array.isArray(registry.entries)) {
  fail('docs/portals.json must use schemaVersion 1 and contain an entries array.');
}

const ids = new Set();
for (const [index, entry] of registry.entries.entries()) {
  const label = entry.id || `entry ${index + 1}`;
  if (!entry.id || !/^[a-z0-9-]+$/.test(entry.id)) fail(`${label}: invalid id.`);
  if (ids.has(entry.id)) fail(`${label}: duplicate id.`);
  ids.add(entry.id);
  if (!entry.name || !entry.description || !entry.category) fail(`${label}: missing display fields.`);
  if (!SAFE_STATUSES.has(entry.status)) fail(`${label}: unsupported status ${entry.status}.`);
  if (!safeHref(entry.href)) fail(`${label}: unsafe href ${entry.href}.`);
  if (!Array.isArray(entry.tags) || entry.tags.length === 0) fail(`${label}: at least one tag is required.`);
  if (!/^https:\/\//.test(entry.href)) {
    try {
      await access(path.join(docs, entry.href));
    } catch {
      fail(`${label}: local destination ${entry.href} does not exist.`);
    }
  }
}

const primaryPages = ['docs/index.html', 'docs/404.html', 'docs/legal.html'];
for (const relativePath of primaryPages) {
  const html = await read(relativePath);
  if (!html.includes('Content-Security-Policy')) fail(`${relativePath}: missing Content Security Policy.`);
  if (!html.includes('<main')) fail(`${relativePath}: missing main landmark.`);
  if (/\son\w+\s*=/.test(html)) fail(`${relativePath}: inline event handlers are not allowed.`);
  if (/<script(?![^>]+\bsrc=)/i.test(html)) fail(`${relativePath}: inline scripts are not allowed.`);
  if (/https?:\/\/(?:fonts|cdnjs|cdn\.)/i.test(html)) fail(`${relativePath}: runtime CDN dependency found.`);
  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    if (!/rel="[^"]*noopener[^"]*noreferrer[^"]*"/i.test(match[0])) {
      fail(`${relativePath}: target=_blank link is missing noopener noreferrer.`);
    }
  }
}

for (const absolute of await htmlFiles(docs)) {
  const relativePath = path.relative(root, absolute).replaceAll(path.sep, '/');
  const html = await readFile(absolute, 'utf8');
  if (/<script\b[^>]*\bsrc=["']https?:\/\//i.test(html)) {
    fail(`${relativePath}: remote executable script is not allowed in the release artifact.`);
  }
  if (/@import\s+url\(["']?https?:\/\//i.test(html)) {
    fail(`${relativePath}: remote CSS import is not allowed in the release artifact.`);
  }
}

for (const relativePath of ['LICENSE', 'NOTICE', 'docs/LICENSE.txt', 'docs/NOTICE.txt']) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    fail(`${relativePath}: required release legal file is missing.`);
  }
}

const [license, publishedLicense, notice, publishedNotice] = await Promise.all([
  read('LICENSE'),
  read('docs/LICENSE.txt'),
  read('NOTICE'),
  read('docs/NOTICE.txt')
]);
if (license !== publishedLicense) fail('docs/LICENSE.txt must exactly mirror LICENSE.');
if (notice !== publishedNotice) fail('docs/NOTICE.txt must exactly mirror NOTICE.');
if (!license.includes('Licensor:             Samsarix LLC')) fail('LICENSE: Samsarix LLC is not the named licensor.');
if (!license.includes('contact@samsarix.com')) fail('LICENSE: commercial contact is missing.');

if (failures.length) {
  console.error(`Site checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Site checks passed: ${registry.entries.length} catalog entries and ${primaryPages.length} primary pages validated.`);
