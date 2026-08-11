import { isIP } from 'node:net';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_RETRIES = 1;
const MAX_REDIRECTS = 5;
const RESTRICTED_STATUSES = new Set([401, 403, 429]);

function privateIpv4(hostname) {
  const octets = hostname.split('.').map(Number);
  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value))) return false;
  return octets[0] === 10
    || octets[0] === 127
    || (octets[0] === 169 && octets[1] === 254)
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168)
    || octets[0] === 0;
}

function privateIpv6(hostname) {
  const candidate = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  return candidate === '::1' || candidate === '::' || candidate.startsWith('fc')
    || candidate.startsWith('fd') || /^fe[89ab]/.test(candidate);
}

export function validatedExternalUrl(value) {
  const candidate = String(value || '').trim();
  if (!candidate || candidate.length > 2048 || /[\u0000-\u001f\\]/.test(candidate)) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) return null;
    const ipVersion = isIP(hostname.replace(/^\[|\]$/g, ''));
    if ((ipVersion === 4 && privateIpv4(hostname)) || (ipVersion === 6 && privateIpv6(hostname))) return null;
    return url.href;
  } catch {
    return null;
  }
}

function normalizeTarget(entry, source) {
  const id = String(entry?.id || '').trim();
  const label = String(entry?.label || entry?.name || id).trim();
  const url = validatedExternalUrl(entry?.url || entry?.href);
  if (!id || !/^[a-z0-9-]+$/.test(id)) throw new Error(`${source}: every link needs a kebab-case id.`);
  if (!label) throw new Error(`${source}: ${id} needs a label.`);
  if (!url) throw new Error(`${source}: ${id} needs a public HTTPS URL without embedded credentials.`);
  return { id, label, url, source };
}

export async function loadLinkTargets({ rootDir = root } = {}) {
  const [catalogText, sourcesText] = await Promise.all([
    readFile(path.join(rootDir, 'docs', 'portals.json'), 'utf8'),
    readFile(path.join(rootDir, '.github', 'external-links.json'), 'utf8')
  ]);
  const catalog = JSON.parse(catalogText);
  const sources = JSON.parse(sourcesText);
  if (!Array.isArray(catalog.entries) || !Array.isArray(sources.links)) {
    throw new Error('External link inputs must contain catalog entries and a links array.');
  }
  const targets = [
    ...catalog.entries
      .filter((entry) => entry.status === 'external')
      .map((entry) => normalizeTarget(entry, 'docs/portals.json')),
    ...sources.links.map((entry) => normalizeTarget(entry, '.github/external-links.json'))
  ];
  const ids = new Set();
  const urls = new Set();
  return targets.filter((target) => {
    if (ids.has(target.id)) throw new Error(`Duplicate external link id: ${target.id}.`);
    ids.add(target.id);
    if (urls.has(target.url)) return false;
    urls.add(target.url);
    return true;
  });
}

function classify(status) {
  if (status >= 200 && status < 400) return 'ok';
  if (RESTRICTED_STATUSES.has(status)) return 'restricted';
  if (status >= 400 && status < 500) return 'broken';
  return 'indeterminate';
}

async function request(url, method, { fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`Timed out after ${timeoutMs} ms.`)), timeoutMs);
  try {
    let currentUrl = url;
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      const response = await fetchImpl(currentUrl, {
        method,
        redirect: 'manual',
        signal: controller.signal,
        headers: method === 'GET'
          ? { accept: 'text/html,application/json;q=0.9,*/*;q=0.1', range: 'bytes=0-1023' }
          : { accept: '*/*' }
      });
      if (response.body?.cancel) await response.body.cancel().catch(() => {});
      const location = response.headers?.get?.('location');
      if (response.status >= 300 && response.status < 400 && location) {
        if (redirectCount === MAX_REDIRECTS) {
          return { outcome: 'indeterminate', status: response.status, detail: `More than ${MAX_REDIRECTS} redirects.` };
        }
        const nextUrl = validatedExternalUrl(new URL(location, currentUrl).href);
        if (!nextUrl) {
          return { outcome: 'broken', status: response.status, detail: 'Redirected outside public HTTPS.' };
        }
        currentUrl = nextUrl;
        continue;
      }
      const finalUrl = validatedExternalUrl(response.url || currentUrl);
      if (!finalUrl) return { outcome: 'broken', status: response.status, detail: 'Resolved outside public HTTPS.' };
      return { outcome: classify(response.status), status: response.status, finalUrl };
    }
    return { outcome: 'indeterminate', status: 0, detail: 'Redirect processing did not complete.' };
  } finally {
    clearTimeout(timer);
  }
}

async function checkOnce(target, options) {
  let result = await request(target.url, 'HEAD', options);
  if (result.outcome === 'broken' || result.outcome === 'indeterminate') {
    result = await request(target.url, 'GET', options);
  }
  return { ...target, ...result };
}

export async function checkTarget(target, {
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retries = DEFAULT_RETRIES
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('A Fetch-compatible implementation is required.');
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await checkOnce(target, { fetchImpl, timeoutMs });
      if (result.outcome !== 'indeterminate' || attempt === retries) return { ...result, attempts: attempt + 1 };
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        return { ...target, outcome: 'indeterminate', status: 0, detail: error.message, attempts: attempt + 1 };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  return { ...target, outcome: 'indeterminate', status: 0, detail: lastError?.message || 'Unknown failure.', attempts: retries + 1 };
}

export async function checkTargets(targets, { concurrency = 4, ...options } = {}) {
  const results = new Array(targets.length);
  let next = 0;
  async function worker() {
    while (next < targets.length) {
      const index = next;
      next += 1;
      results[index] = await checkTarget(targets[index], options);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, worker));
  return results;
}

function displayUrl(value) {
  const url = new URL(value);
  url.search = '';
  url.hash = '';
  return url.href;
}

export async function runLinkCheck(options = {}) {
  const targets = await loadLinkTargets(options);
  const results = await checkTargets(targets, options);
  const failures = results.filter((result) => ['broken', 'indeterminate'].includes(result.outcome));
  for (const result of results) {
    const marker = result.outcome === 'ok' ? 'OK' : result.outcome === 'restricted' ? 'REACHABLE' : 'FAIL';
    const detail = result.status ? `HTTP ${result.status}` : result.detail;
    console.log(`[${marker}] ${result.label} — ${detail} — ${displayUrl(result.url)}`);
  }
  console.log(`External link check: ${results.length - failures.length}/${results.length} reachable, ${failures.length} requiring review.`);
  return { targets, results, failures };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const timeoutMs = Number.parseInt(process.env.SAMSARIX_LINK_TIMEOUT_MS || '', 10) || DEFAULT_TIMEOUT_MS;
    const { failures } = await runLinkCheck({ timeoutMs });
    if (failures.length) process.exitCode = 1;
  } catch (error) {
    console.error(`External link check could not run: ${error.message}`);
    process.exitCode = 1;
  }
}
