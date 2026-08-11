import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkTarget,
  checkTargets,
  loadLinkTargets,
  validatedExternalUrl
} from '../scripts/check-links.mjs';

function response(status, url = 'https://example.com/resource', location = '') {
  return {
    status,
    url,
    headers: { get: (name) => name.toLowerCase() === 'location' ? location : null },
    body: { cancel: async () => {} }
  };
}

test('external link inventory combines catalog and curated sources without duplicate URLs', async () => {
  const targets = await loadLinkTargets();
  assert.ok(targets.length >= 7);
  assert.equal(new Set(targets.map((target) => target.id)).size, targets.length);
  assert.equal(new Set(targets.map((target) => target.url)).size, targets.length);
  assert.ok(targets.some((target) => target.id === 'source-repository'));
});

test('external URLs reject credentials and literal local or private destinations', () => {
  assert.equal(validatedExternalUrl('https://example.com/path'), 'https://example.com/path');
  assert.equal(validatedExternalUrl('http://example.com/path'), null);
  assert.equal(validatedExternalUrl('https://user:secret@example.com/path'), null);
  assert.equal(validatedExternalUrl('https://127.0.0.1/path'), null);
  assert.equal(validatedExternalUrl('https://169.254.169.254/latest/meta-data'), null);
  assert.equal(validatedExternalUrl('https://[::1]/path'), null);
});

test('link probe falls back to GET and classifies restricted responses as reachable', async () => {
  const methods = [];
  const result = await checkTarget(
    { id: 'fallback', label: 'Fallback', url: 'https://example.com/resource', source: 'test' },
    {
      retries: 0,
      fetchImpl: async (_url, options) => {
        methods.push(options.method);
        return options.method === 'HEAD' ? response(405) : response(200);
      }
    }
  );
  assert.deepEqual(methods, ['HEAD', 'GET']);
  assert.equal(result.outcome, 'ok');
  const restricted = await checkTarget(
    { id: 'restricted', label: 'Restricted', url: 'https://example.com/private', source: 'test' },
    { retries: 0, fetchImpl: async () => response(403, 'https://example.com/private') }
  );
  assert.equal(restricted.outcome, 'restricted');
});

test('link probe reports broken and transport-indeterminate destinations', async () => {
  const targets = [
    { id: 'missing', label: 'Missing', url: 'https://example.com/missing', source: 'test' },
    { id: 'offline', label: 'Offline', url: 'https://example.com/offline', source: 'test' }
  ];
  const results = await checkTargets(targets, {
    retries: 0,
    concurrency: 2,
    fetchImpl: async (url) => {
      if (url.endsWith('/missing')) return response(404, url);
      throw new Error('Network unavailable');
    }
  });
  assert.equal(results[0].outcome, 'broken');
  assert.equal(results[1].outcome, 'indeterminate');
});

test('link probe validates redirects before following them', async () => {
  const requested = [];
  const target = { id: 'redirect', label: 'Redirect', url: 'https://example.com/start', source: 'test' };
  const result = await checkTarget(target, {
    retries: 0,
    fetchImpl: async (url) => {
      requested.push(url);
      return response(302, url, 'https://127.0.0.1/private');
    }
  });
  assert.equal(result.outcome, 'broken');
  assert.deepEqual(requested, ['https://example.com/start', 'https://example.com/start']);
});
