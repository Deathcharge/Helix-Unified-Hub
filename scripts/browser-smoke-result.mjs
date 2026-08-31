// Run after browser-smoke.mjs in the same isolated Playwright CLI session.
async (page) => {
  await page.waitForFunction(() => Boolean(window.__samsarixSmokeResult), null, { timeout: 30000 });
  const result = await page.evaluate(() => window.__samsarixSmokeResult);
  if (!result.passed || result.checks?.length !== 7) {
    throw new Error(result.error || 'Browser smoke did not complete all seven check groups.');
  }
  return result;
}
