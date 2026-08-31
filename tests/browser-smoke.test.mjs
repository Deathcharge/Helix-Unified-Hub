import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../scripts/browser-smoke.mjs', import.meta.url), 'utf8');
const smoke = vm.runInNewContext(source, {}, { timeout: 1000 });

test('optional browser smoke is a CLI function and rejects the wrong page before any actions', async () => {
  assert.equal(typeof smoke, 'function');
  await assert.rejects(smoke({ url: () => 'https://example.com/' }), /Open registry\.html/);
});

test('optional browser smoke refuses an existing inventory before fetching or mutating anything', async () => {
  const visited = [];
  const page = {
    url: () => 'https://example.com/registry.html',
    setDefaultTimeout: () => {},
    setDefaultNavigationTimeout: () => {},
    waitForFunction: async () => {},
    locator(selector) {
      visited.push(selector);
      return { innerText: async () => 'Restored 1 locally saved agent. No data was uploaded.' };
    },
    get request() { assert.fail('preflight must precede fixture requests'); },
    get clock() { assert.fail('preflight must precede clock changes'); },
    getByLabel() { assert.fail('preflight must precede file input access'); }
  };
  await assert.rejects(smoke(page), /Refusing to replace an existing workspace/);
  assert.deepEqual(visited, ['#workspace-message']);
});

for (const failCleanup of [false, true]) {
  test(`optional browser smoke retains the failure and ${failCleanup ? 'reports failed' : 'performs'} cleanup`, async () => {
    const clicks = [];
    let reloads = 0;
    const page = {
      url: () => 'https://example.com/registry.html',
      setDefaultTimeout: () => {},
      setDefaultNavigationTimeout: () => {},
      waitForFunction: async () => {},
      locator: () => ({ innerText: async () => 'Loaded the bundled concept inventory.' }),
      getByLabel: () => ({}),
      context: () => ({ browser: () => ({ version: async () => 'test-adapter' }) }),
      clock: { setFixedTime: async () => {} },
      reload: async () => { reloads += 1; },
      emulateMedia: async () => {},
      request: { get: async () => ({ ok: () => false, status: () => 503 }) },
      getByRole: (_role, { name }) => ({ click: async () => {
        clicks.push(name);
        if (failCleanup && name === 'Confirm reset') throw new Error('reset unavailable');
      } })
    };
    await assert.rejects(smoke(page), (error) => {
      assert.match(error.message, /fixture a2a-agent-card-example\.json: Fixture returned HTTP 503/);
      if (failCleanup) assert.match(error.message, /cleanup: reset unavailable/);
      return true;
    });
    assert.deepEqual(clicks, ['Reset sample', 'Confirm reset']);
    assert.equal(reloads, failCleanup ? 2 : 3);
  });
}
