// Optional Playwright CLI function, not a Node entry point or application module.
// Run only in a fresh, nonpersistent session; see docs/BROWSER_VERIFICATION.md.
async (page) => {
  const target = page.url();
  if (!/\/registry\.html(?:[?#]|$)/.test(target)) {
    throw new Error('Open registry.html in a fresh isolated browser before running this check.');
  }
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  const message = page.locator('#workspace-message');
  await page.waitForFunction(() => document.querySelector('#reset-registry')?.disabled === false);
  // Invalidate any previous test result, even if this run refuses the workspace.
  await page.evaluate(() => { window.__samsarixSmokeResult = null; });
  if (!(await message.innerText()).startsWith('Loaded the bundled concept inventory.')) {
    throw new Error('Refusing to replace an existing workspace. Use a fresh nonpersistent browser session.');
  }
  // Some CLI versions yield on native dialogs while this function keeps running.
  // The companion result check waits for the explicit final outcome, not exit 0.

  const base = target.split(/[?#]/)[0].replace(/registry\.html$/, '');
  const input = page.getByLabel('Import Samsarix registry, A2A Agent Card, or MCP server JSON', { exact: true });
  const checks = [];
  const require = (condition, reason) => { if (!condition) throw new Error(reason); };
  const click = (name) => page.getByRole('button', { name, exact: true }).click();
  const importFixture = async (fixture, confirmation) => {
    const upload = () => input.setInputFiles({ name: fixture.name, mimeType: 'application/json', buffer: fixture.bytes });
    if (confirmation === undefined) return upload();
    await Promise.all([
      page.waitForEvent('dialog').then(async (dialog) => {
        const expected = dialog.type() === 'confirm' && dialog.message().startsWith('Replace your current inventory with ');
        if (expected && confirmation) await dialog.accept();
        else await dialog.dismiss();
        require(expected, 'Unexpected replacement dialog');
      }),
      upload()
    ]);
  };
  const waitForSample = () => page.waitForFunction(() => document.querySelector('#workspace-message')?.textContent.startsWith('Loaded the bundled concept inventory.'));
  let phase = 'setup';
  let failure;
  let browser;

  try {
    browser = await page.context().browser().version();
    // Keep dated fixtures useful without freezing the application's timers.
    await page.clock.setFixedTime(new Date('2026-08-31T12:00:00Z'));
    await page.reload();
    await waitForSample();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const fixtures = [];
    for (const [name, ready] of [
      ['a2a-agent-card-example.json', '0'],
      ['mcp-server-example.json', '0'],
      ['review-ready-registry-example.json', '1']
    ]) {
      phase = `fixture ${name}`;
      // Test-runner requests fetch only bundled fictional fixtures, never agent URLs.
      const response = await page.request.get(base + name, { timeout: 10000, maxRedirects: 0 });
      require(response.ok(), `Fixture returned HTTP ${response.status()}`);
      const bytes = await response.body();
      require(bytes.length > 1 && bytes.length <= 1024 * 1024, 'Unexpected fixture size');
      fixtures.push({ name, ready, bytes, text: await response.text() });
    }

    phase = 'selection and keyboard navigation';
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: /^Agni Concept only/ }).click();
    await page.waitForFunction(() => {
      const active = document.activeElement;
      const box = active.getBoundingClientRect();
      return active.id === 'selected-agent-title' && box.top >= 0 && box.bottom <= innerHeight;
    });
    require(await page.locator('.detail-title').innerText() === 'Agni', 'Wrong selected agent');
    await page.keyboard.press('Tab');
    require(await page.evaluate(() => document.activeElement.textContent) === 'Back to agent list', 'Return control is not the next Tab stop');
    await page.keyboard.press('Tab');
    require(await page.evaluate(() => document.activeElement.getAttribute('aria-label')) === 'Agni readiness evidence', 'Evidence region is not keyboard reachable');
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('.evidence-table-wrap').scrollLeft > 0);
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Enter');
    require(await page.evaluate(() => document.activeElement.dataset.agentId) === 'agni', 'Return did not focus the selected row');
    checks.push('selection, keyboard evidence scrolling, and return');

    phase = 'responsive and empty results';
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      require(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Document overflows at ${width}px`);
    }
    const search = page.getByRole('searchbox', { name: 'Search agents' });
    await search.fill('no-such-agent-for-samsarix-smoke');
    require(await page.evaluate(() => document.activeElement.id === 'agent-search'
      && document.querySelector('.registry-layout').getBoundingClientRect().height === 0
      && !document.querySelector('#agent-empty').hidden), 'Empty results or filter focus regressed');
    await search.fill('');
    checks.push('320/390/768/1280px widths and empty-filter recovery');

    for (const [index, fixture] of fixtures.entries()) {
      phase = `import ${fixture.name}`;
      await importFixture(fixture, index ? true : undefined);
      await page.waitForFunction((name) => document.querySelector('#workspace-message').textContent.includes(`Imported 1 agent from ${name}`), fixture.name);
      require(await page.locator('#metric-total').innerText() === '1', 'Wrong imported count');
      require(await page.locator('#metric-ready').innerText() === fixture.ready, 'Wrong readiness classification');
      require(await page.locator('.evidence-table tbody tr').count() === 9, 'Missing evidence rows');
    }
    checks.push('A2A, MCP, and Samsarix imports with nine gates');

    phase = 'additive imports and duplicate rejection';
    await page.getByRole('combobox', { name: 'Import mode', exact: true }).selectOption('add');
    for (const fixture of fixtures.slice(0, 2)) {
      await importFixture(fixture);
      await page.waitForFunction((name) => document.querySelector('#workspace-message').textContent.includes(`Added 1 agent from ${name}`), fixture.name);
    }
    require(await page.locator('#metric-total').innerText() === '3', 'Add did not retain all three agents');
    await importFixture(fixtures[1]);
    await page.waitForFunction(() => document.querySelector('#workspace-error').textContent.includes('Duplicate agent id'));
    require(await page.locator('#metric-total').innerText() === '3', 'Duplicate addition changed the count');

    phase = 'persistence and malformed-file recovery';
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#workspace-message').textContent.startsWith('Restored 3 locally saved agents'));
    await importFixture(fixtures[2], false);
    await page.waitForFunction(() => document.querySelector('#workspace-message').textContent.startsWith('Import cancelled.'));
    require(await page.locator('#metric-total').innerText() === '3', 'Cancelled replacement changed the count');
    await input.setInputFiles({ name: 'malformed.json', mimeType: 'application/json', buffer: fixtures[2].bytes.subarray(0, 1) });
    await page.waitForFunction(() => !document.querySelector('#workspace-error').hidden);
    require((await message.innerText()).includes('current registry was not changed'), 'Rejected import lacks recovery status');
    require(await page.locator('#metric-ready').innerText() === '1', 'Rejected input changed the current registry');
    checks.push('three-agent reload persistence, cancelled replacement, and malformed-file rejection');

    phase = 'download parity';
    const expected = await page.evaluate(async (texts) => {
      const policy = await import(new URL('./assets/readiness.mjs', location.href).href);
      const [a2a, mcp, registry] = texts.map((text) => policy.parseRegistryText(text));
      registry.agents.push(...a2a.agents, ...mcp.agents);
      const encode = (value) => Array.from(new TextEncoder().encode(value));
      return { json: encode(policy.serializeRegistry(registry)), markdown: encode(policy.renderMarkdownPacket(registry)) };
    }, fixtures.map((fixture) => fixture.text));
    for (const [button, format] of [['Export JSON', 'json'], ['Export Markdown', 'markdown']]) {
      const [download] = await Promise.all([page.waitForEvent('download'), click(button)]);
      const stream = await download.createReadStream();
      require(stream, `${button} did not produce a readable download`);
      const bytes = [];
      for await (const chunk of stream) {
        require(bytes.length + chunk.length <= 1024 * 1024, 'Unexpectedly large smoke-test download');
        for (const byte of chunk) bytes.push(byte);
      }
      require(JSON.stringify(bytes) === JSON.stringify(expected[format]), `${button} bytes differ from the shared readiness policy`);
    }
    checks.push('real JSON/Markdown downloads match the shared policy bytes');
    phase = 'confirmed replacement';
    await importFixture(fixtures[2], true);
    await page.waitForFunction(() => document.querySelector('#workspace-message').textContent.startsWith('Imported 1 agent'));
    require(await page.locator('#metric-total').innerText() === '1', 'Confirmed replacement did not replace');
    require(await page.locator('#metric-ready').innerText() === '1', 'Replacement lost readiness evidence');
    checks.push('add accumulates formats; duplicates reject atomically; confirmed replacement succeeds');
  } catch (error) {
    failure = new Error(`${phase}: ${error.message}`);
  } finally {
    // Only reached after the fresh-workspace preflight. Remove only our test data.
    try {
      await page.reload();
      await page.waitForFunction(() => document.querySelector('#reset-registry')?.disabled === false);
      await click('Reset sample');
      await click('Confirm reset');
      await page.reload();
      await waitForSample();
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      checks.push('confirmed reset survives reload; test inventory removed');
    } catch (error) {
      failure = new Error(`${failure ? `${failure.message}; ` : ''}cleanup: ${error.message}. Close this isolated session.`);
    }
  }
  const result = { passed: !failure, browser, reviewDate: '2026-08-31', checks, error: failure?.message,
    note: 'Close this isolated session; it still has a fixed test clock.' };
  // This test-only, in-memory marker survives only until the next navigation.
  await page.evaluate((value) => { window.__samsarixSmokeResult = value; }, result);
  if (failure) throw failure;
  return result;
}
