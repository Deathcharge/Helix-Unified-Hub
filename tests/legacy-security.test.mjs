import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('legacy navigation keeps remote values out of executable HTML sinks', async () => {
  const source = await readFile(path.join(root, 'shared-components', 'helix-nav.js'), 'utf8');
  assert.match(source, /title\.textContent = String\(result/);
  assert.match(source, /userButton\.textContent =/);
  assert.match(source, /message\.textContent = String\(notification/);
  assert.doesNotMatch(source, /const resultsHTML = results\.map/);
  assert.doesNotMatch(source, /\$\{session\.username\}/);
});

test('legacy generated webhook output is authenticated, bounded, and text-only', async () => {
  const source = await readFile(path.join(root, 'deploy-infinite-scale.sh'), 'utf8');
  assert.match(source, /PORTAL_WEBHOOK_SECRET must be set to at least 32 characters/);
  assert.match(source, /express\.json\(\{ limit: '32kb' \}\)/);
  assert.match(source, /crypto\.timingSafeEqual/);
  assert.match(source, /new WebSocket\.Server\(\{ noServer: true, maxPayload: 32 \* 1024 \}\)/);
  assert.match(source, /wss\.clients\.size >= 100/);
  assert.match(source, /ws\.close\(1008, 'Read-only stream'\)/);
  assert.match(source, /const webhookData = \{/);
  assert.match(source, /entry\.textContent =/);
  assert.doesNotMatch(source, /entry\.innerHTML =/);
  assert.doesNotMatch(source, /axios\.post/);
});

test('Zapier WebSocket upgrades require a separate secret and explicit bounds', async () => {
  const source = await readFile(path.join(root, 'zapier-integration', 'helix-zapier-nervous-system.js'), 'utf8');
  assert.match(source, /noServer: true, maxPayload: 32 \* 1024/);
  assert.match(source, /authorizedBearer\(request, WEBSOCKET_SECRET\)/);
  assert.match(source, /wss\.clients\.size >= 100/);
  assert.match(source, /messagesInWindow > 30/);
  assert.match(source, /client\.ping\(\)/);
});

test('private export artifacts remain absent from the current tree', async () => {
  const forbidden = [
    'original_conversation_1762646582_2163.txt',
    'assets/chat10-21-25 (1).html',
    'assets/context_dump.txt',
    'assets/context_dump2.txt',
    'assets/crai_dataset.json'
  ];
  for (const relative of forbidden) {
    await assert.rejects(access(path.join(root, relative)));
  }
});
