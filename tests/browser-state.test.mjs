import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { parseRegistryText, serializeRegistry } from '../docs/assets/readiness.mjs';

const STORAGE_KEY = 'samsarix.agent-readiness-registry.v1';
const fixtures = Object.fromEntries(await Promise.all([
  ['bundled', 'agents.json'], ['ready', 'review-ready-registry-example.json'],
  ['a2a', 'a2a-agent-card-example.json'], ['mcp', 'mcp-server-example.json']
].map(async ([key, file]) => [key, await readFile(new URL(`../docs/${file}`, import.meta.url), 'utf8')])));
let instance = 0;

// A deliberately small DOM/storage adapter executes the actual controller module.
// These are state/event tests, not a substitute for rendered browser or layout QA.
class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.value = '';
    this.disabled = false;
    this.hidden = false;
    this.files = [];
    this.ownText = '';
    this.scrollTop = 0;
  }
  set textContent(text) { this.ownText = String(text); this.children = []; }
  get textContent() { return this.ownText + this.children.map((child) => typeof child === 'string' ? child : child.textContent).join(''); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.ownText = ''; this.children = children; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  emit(name) { return this.listeners.get(name)?.({ currentTarget: this }); }
  querySelector(selector) {
    assert.match(selector, /^\.[a-z-]+$/, 'adapter supports only the controller class selectors');
    for (const child of this.children) {
      if (typeof child === 'string') continue;
      if (child.className?.split(' ').includes(selector.slice(1))) return child;
      const match = child.querySelector(selector);
      if (match) return match;
    }
    return null;
  }
  focus(options) { this.focused = true; this.focusOptions = options; document.activeElement = this; }
  click() { return this.emit('click'); }
  remove() { this.removed = true; }
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

async function browser(t, options = {}) {
  // Readiness fixtures must not silently expire as wall-clock time advances.
  t.mock.timers.enable({ apis: ['Date'], now: Date.UTC(2026, 7, 31, 12) });
  const elements = Object.fromEntries([
    'metric-blocked', 'agent-detail', 'agent-empty', 'workspace-error', 'export-json',
    'export-markdown', 'registry-file', 'lifecycle-filter', 'agent-list', 'workspace-message',
    'metric-ready', 'readiness-filter', 'reset-registry', 'agent-result-count', 'risk-filter',
    'agent-search', 'metric-stale', 'metric-total', 'workspace-description', 'workspace-title'
  ].map((id) => [`#${id}`, new Element()]));
  elements['.registry-layout'] = new Element();
  for (const id of ['registry-file', 'export-json', 'export-markdown', 'reset-registry']) elements[`#${id}`].disabled = true;
  elements['#workspace-error'].hidden = true;
  elements['#reset-registry'].textContent = 'Reset sample';
  const body = new Element('body');
  const saved = new Map([['other-application', 'keep me']]);
  if (options.saved !== undefined) saved.set(STORAGE_KEY, options.saved);
  const timers = new Map();
  let timerId = 0;
  const blobs = new Map();
  const revoked = [];
  const globals = {
    document: {
      body,
      activeElement: body,
      querySelector(selector) {
        assert.ok(elements[selector], `unmodeled controller selector: ${selector}`);
        return elements[selector];
      },
      createElement: (tag) => new Element(tag)
    },
    window: {
      setTimeout(fn) { timers.set(++timerId, fn); return timerId; },
      clearTimeout(id) { timers.delete(id); }
    },
    localStorage: {
      getItem(key) { if (options.failRead) throw new Error('storage disabled'); return saved.get(key) ?? null; },
      setItem(key, value) { if (options.failWrite) throw new Error('storage full'); saved.set(key, value); },
      removeItem(key) { if (options.failRemove) throw new Error('storage disabled'); saved.delete(key); }
    },
    fetch: async (url, init) => {
      assert.equal(url, './agents.json', 'controller must not fetch imported metadata');
      if (options.fetch) return options.fetch(url, init);
      return { ok: true, text: async () => fixtures.bundled };
    }
  };
  const originals = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  t.mock.method(URL, 'createObjectURL', (blob) => { const url = `blob:audit-${blobs.size}`; blobs.set(url, blob); return url; });
  t.mock.method(URL, 'revokeObjectURL', (url) => revoked.push(url));
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  await import(`../docs/assets/registry-app.mjs?browser-state-test=${++instance}`);
  await nextTurn();
  return {
    elements, saved, timers, body, blobs, revoked,
    el: (id) => elements[id.startsWith('.') ? id : `#${id}`],
    async import(text, name = 'registry.json', extra = {}) {
      const input = elements['#registry-file'];
      input.files = [{ name, size: Buffer.byteLength(text), text: async () => text, ...extra }];
      input.value = name;
      await input.emit('change');
    },
    async reset() {
      await elements['#reset-registry'].emit('click');
      await elements['#reset-registry'].emit('click');
    },
    expireTimers() {
      for (const [id, fn] of [...timers]) { timers.delete(id); fn(); }
    }
  };
}

test('browser controller loads the sample and hides the entire empty results layout', async (t) => {
  const ui = await browser(t);
  assert.equal(ui.el('metric-total').textContent, '12');
  assert.equal(ui.el('metric-ready').textContent, '0');
  assert.equal(ui.el('registry-file').disabled, false);
  assert.equal(ui.el('reset-registry').disabled, false);
  ui.el('agent-search').value = 'no-such-agent-in-this-inventory';
  await ui.el('agent-search').emit('input');
  assert.equal(ui.el('agent-result-count').textContent, '0 of 12 agents');
  assert.equal(ui.el('.registry-layout').hidden, true);
  assert.equal(ui.el('agent-empty').hidden, false);
  ui.el('agent-search').value = 'Phoenix';
  await ui.el('agent-search').emit('input');
  assert.equal(ui.el('agent-result-count').textContent, '1 of 12 agents');
  assert.equal(ui.el('.registry-layout').hidden, false);
  assert.equal(ui.el('agent-empty').hidden, true);
  await ui.el('agent-list').children[0].emit('click');
  assert.equal(document.activeElement, ui.el('agent-detail').querySelector('.detail-title'));
});

test('agent selection focuses its title with native scrolling and returns to the current selected row', async (t) => {
  const ui = await browser(t);
  const list = ui.el('agent-list');
  const original = list.children[7];
  list.scrollTop = 450;
  assert.equal(original.attributes.get('aria-controls'), 'agent-detail');
  await original.emit('click');
  const title = ui.el('agent-detail').querySelector('.detail-title');
  assert.equal(title.textContent, 'Phoenix');
  assert.equal(title.id, 'selected-agent-title');
  assert.equal(title.tabIndex, -1, 'heading must not add a sequential tab stop');
  assert.equal(document.activeElement, title);
  assert.notEqual(title.focusOptions?.preventScroll, true, 'native focus scrolling must stay enabled');
  assert.equal(list.scrollTop, 450);
  const current = list.children[7];
  assert.notEqual(current, original, 'return control must resolve the newly rendered row');
  assert.equal(current.attributes.get('aria-pressed'), 'true');
  assert.equal(list.children.filter((row) => row.attributes.get('aria-pressed') === 'true').length, 1);
  const back = ui.el('agent-detail').querySelector('.detail-back');
  assert.equal(back.textContent, 'Back to agent list');
  assert.equal(back.type, 'button');
  assert.equal(back.attributes.get('aria-controls'), 'agent-list');
  await back.emit('click');
  assert.equal(document.activeElement, current);
  assert.notEqual(current.focusOptions?.preventScroll, true);
  assert.equal(ui.saved.has(STORAGE_KEY), false, 'navigation must not persist or alter the inventory');
});

test('filtering keeps focus on its control and return navigation follows the filtered selection', async (t) => {
  const ui = await browser(t);
  const search = ui.el('agent-search');
  search.focus();
  search.value = 'Phoenix';
  await search.emit('input');
  assert.equal(document.activeElement, search, 'render must not steal focus while filtering');
  assert.equal(ui.el('agent-detail').querySelector('.detail-title').textContent, 'Phoenix');
  await ui.el('agent-detail').querySelector('.detail-back').emit('click');
  assert.equal(document.activeElement, ui.el('agent-list').children[0]);
  search.focus();
  search.value = 'no-matching-agent';
  await search.emit('input');
  assert.equal(document.activeElement, search);
  assert.equal(ui.el('.registry-layout').hidden, true);
});

test('evidence overflow is a named keyboard-focusable region with column headers', async (t) => {
  const ui = await browser(t);
  const wrap = ui.el('agent-detail').querySelector('.evidence-table-wrap');
  assert.equal(wrap.tabIndex, 0);
  assert.equal(wrap.attributes.get('role'), 'region');
  assert.equal(wrap.attributes.get('aria-label'), 'Aether readiness evidence');
  assert.equal(wrap.attributes.get('aria-describedby'), 'evidence-scroll-help');
  const help = ui.el('agent-detail').querySelector('.evidence-scroll-help');
  assert.equal(help.id, 'evidence-scroll-help');
  assert.match(help.textContent, /Left and Right arrow keys/);
  const table = wrap.children[0];
  assert.equal(table.tagName, 'TABLE');
  assert.equal(table.children[0].tagName, 'CAPTION');
  for (const cell of table.children[1].children[0].children) {
    assert.equal(cell.tagName, 'TH');
    assert.equal(cell.scope, 'col');
  }
});

test('browser imports all three formats, persists normalized data, and downloads matching JSON', async (t) => {
  const ui = await browser(t);
  for (const format of ['ready', 'a2a', 'mcp']) {
    await ui.import(fixtures[format], `${format}.json`);
    const expected = serializeRegistry(parseRegistryText(fixtures[format]));
    assert.equal(ui.saved.get(STORAGE_KEY), expected);
    assert.equal(ui.el('metric-total').textContent, '1');
    assert.equal(ui.el('metric-ready').textContent, format === 'ready' ? '1' : '0');
    assert.equal(ui.el('registry-file').value, '');
    assert.match(ui.el('workspace-message').textContent, /Nothing was uploaded/);
    await ui.el('export-json').emit('click');
    assert.equal(await [...ui.blobs.values()].at(-1).text(), expected);
    assert.equal(ui.body.children.at(-1).removed, true);
  }
  ui.expireTimers();
  assert.equal(ui.revoked.length, 3);
  assert.equal(ui.saved.get('other-application'), 'keep me');
});

test('invalid and oversized imports retain the current inventory and permit the same file to be retried', async (t) => {
  const ui = await browser(t);
  await ui.import(fixtures.ready);
  const previous = ui.saved.get(STORAGE_KEY);
  const duplicate = JSON.parse(fixtures.ready);
  duplicate.agents.push(structuredClone(duplicate.agents[0]));
  const secret = JSON.parse(fixtures.ready);
  secret.agents[0].apiKey = 'fictional-not-a-real-credential';
  for (const text of ['{broken', JSON.stringify(duplicate), JSON.stringify(secret)]) {
    await ui.import(text, 'invalid.json');
    assert.equal(ui.saved.get(STORAGE_KEY), previous);
    assert.equal(ui.el('workspace-error').hidden, false);
    assert.match(ui.el('workspace-message').textContent, /current registry was not changed/);
    assert.equal(ui.el('registry-file').value, '');
  }
  for (let retry = 0; retry < 2; retry += 1) {
    await ui.import('', 'too-large.json', { size: 1024 * 1024 + 1, text: () => assert.fail('oversized content must not be read') });
    assert.match(ui.el('workspace-error').textContent, /1024 KiB limit/);
    assert.equal(ui.saved.get(STORAGE_KEY), previous);
    assert.equal(ui.el('registry-file').value, '');
  }
});

test('a newer import wins when an older file read finishes later', async (t) => {
  const ui = await browser(t);
  const slow = deferred();
  const first = ui.import('', 'slow.json', { text: () => slow.promise });
  await ui.import(fixtures.ready, 'latest.json');
  const expected = ui.saved.get(STORAGE_KEY);
  const message = ui.el('workspace-message').textContent;
  slow.resolve(fixtures.mcp);
  await first;
  assert.equal(ui.saved.get(STORAGE_KEY), expected);
  assert.equal(ui.el('workspace-message').textContent, message);
  assert.equal(ui.el('metric-ready').textContent, '1');
});

test('an obsolete read error cannot overwrite a newer successful import status', async (t) => {
  const ui = await browser(t);
  const slow = deferred();
  const first = ui.import('', 'slow.json', { text: () => slow.promise });
  await ui.import(fixtures.ready, 'latest.json');
  slow.reject(new Error('old read failed'));
  await first;
  assert.equal(ui.el('workspace-error').hidden, true);
  assert.match(ui.el('workspace-message').textContent, /latest.json/);
});

test('a rejected newer selection invalidates an earlier pending import', async (t) => {
  const ui = await browser(t);
  const slow = deferred();
  const first = ui.import('', 'slow.json', { text: () => slow.promise });
  await ui.import('', 'oversized.json', { size: 1024 * 1024 + 1 });
  slow.resolve(fixtures.ready);
  await first;
  assert.equal(ui.el('metric-total').textContent, '12');
  assert.equal(ui.saved.has(STORAGE_KEY), false);
  assert.match(ui.el('workspace-error').textContent, /1024 KiB limit/);
});

test('confirmed reset cancels pending imports before clearing only this application storage', async (t) => {
  const ui = await browser(t);
  await ui.import(fixtures.ready);
  const slow = deferred();
  const first = ui.import('', 'slow.json', { text: () => slow.promise });
  await ui.reset();
  const resetMessage = ui.el('workspace-message').textContent;
  slow.resolve(fixtures.mcp);
  await first;
  assert.equal(ui.el('metric-total').textContent, '12');
  assert.equal(ui.saved.has(STORAGE_KEY), false);
  assert.equal(ui.saved.get('other-application'), 'keep me');
  assert.equal(ui.el('workspace-message').textContent, resetMessage);
  assert.equal(ui.el('reset-registry').dataset.armed, undefined);
});

test('reset confirmation expires and is disarmed when import changes the workspace', async (t) => {
  const ui = await browser(t);
  await ui.el('reset-registry').emit('click');
  assert.equal(ui.el('reset-registry').textContent, 'Confirm reset');
  ui.expireTimers();
  assert.equal(ui.el('reset-registry').textContent, 'Reset sample');
  assert.match(ui.el('workspace-message').textContent, /confirmation expired/);
  await ui.el('reset-registry').emit('click');
  await ui.import(fixtures.ready);
  assert.equal(ui.el('reset-registry').dataset.armed, undefined);
  assert.equal(ui.timers.size, 0);
  const slow = deferred();
  const pending = ui.import('', 'slow.json', { text: () => slow.promise });
  await ui.el('reset-registry').emit('click');
  slow.resolve(fixtures.mcp);
  await pending;
  assert.equal(ui.el('reset-registry').dataset.armed, undefined);
});

test('failed storage removal never claims the saved inventory was deleted', async (t) => {
  const options = {};
  const ui = await browser(t, options);
  await ui.import(fixtures.ready);
  const previous = ui.saved.get(STORAGE_KEY);
  options.failRemove = true;
  await ui.reset();
  assert.equal(ui.el('metric-total').textContent, '12');
  assert.equal(ui.saved.get(STORAGE_KEY), previous);
  assert.equal(ui.el('workspace-message').dataset.kind, undefined);
  assert.match(ui.el('workspace-error').textContent, /could not be removed/);
  assert.match(ui.el('workspace-message').textContent, /may return on reload/);
});

test('saved inventory restores through validation without a remote lookup', async (t) => {
  const ui = await browser(t, { saved: fixtures.ready });
  assert.equal(ui.el('metric-total').textContent, '1');
  assert.match(ui.el('workspace-message').textContent, /Restored 1 locally saved agent/);
});

test('browser filters re-evaluate saved evidence as the review clock advances', async (t) => {
  const ui = await browser(t, { saved: fixtures.ready });
  assert.equal(ui.el('metric-ready').textContent, '1');
  t.mock.timers.setTime(Date.UTC(2027, 3, 1));
  ui.el('readiness-filter').value = 'stale';
  await ui.el('readiness-filter').emit('change');
  assert.equal(ui.el('metric-ready').textContent, '0');
  assert.equal(ui.el('metric-stale').textContent, '1');
  assert.equal(ui.el('agent-result-count').textContent, '1 of 1 agent');
});

test('a late read rejection cannot replace the confirmed reset result with an error', async (t) => {
  const ui = await browser(t);
  const slow = deferred();
  const pending = ui.import('', 'slow.json', { text: () => slow.promise });
  await ui.reset();
  const message = ui.el('workspace-message').textContent;
  slow.reject(new Error('read failed after reset'));
  await pending;
  assert.equal(ui.el('workspace-error').hidden, true);
  assert.equal(ui.el('workspace-message').textContent, message);
  assert.equal(ui.saved.has(STORAGE_KEY), false);
});

for (const failRemove of [false, true]) {
  test(`invalid saved data falls back honestly when removal ${failRemove ? 'fails' : 'succeeds'}`, async (t) => {
    const ui = await browser(t, { saved: '{broken', failRemove });
    assert.equal(ui.el('metric-total').textContent, '12');
    assert.equal(ui.saved.has(STORAGE_KEY), failRemove);
    assert.match(ui.el('workspace-message').textContent, failRemove ? /could not be removed/ : /was removed/);
  });
}

test('unavailable storage keeps imported records usable and warns before leaving', async (t) => {
  const ui = await browser(t, { failRead: true, failWrite: true });
  assert.match(ui.el('workspace-message').textContent, /storage is unavailable/);
  await ui.import(fixtures.ready);
  assert.equal(ui.el('metric-ready').textContent, '1');
  assert.equal(ui.el('export-json').disabled, false);
  assert.equal(ui.saved.has(STORAGE_KEY), false);
  assert.match(ui.el('workspace-message').textContent, /persistence is unavailable; export before leaving/);
});

test('a failed sample load leaves local import available without claiming a reset is possible', async (t) => {
  const ui = await browser(t, { fetch: async () => { throw new Error('offline'); } });
  assert.equal(ui.el('registry-file').disabled, false);
  assert.equal(ui.el('export-json').disabled, true);
  assert.match(ui.el('workspace-error').textContent, /could not be loaded/);
  await ui.import(fixtures.ready);
  assert.equal(ui.el('metric-ready').textContent, '1');
  assert.equal(ui.el('workspace-error').hidden, true);
  assert.equal(ui.el('reset-registry').disabled, true);
  assert.equal(ui.el('export-json').disabled, false);
});
