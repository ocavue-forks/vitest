import { expect, test } from 'vitest';
import { server } from 'vitest/browser';

// webkit is the only browser where `navigator.clipboard` works without extra
// configuration: vitest bridges the text methods through the playwright
// provider there; chromium needs `clipboard-read`/`clipboard-write`
// permissions granted in `contextOptions`
test.runIf(server.provider === 'playwright' && server.config.browser.name === 'webkit')(
  'clipboard text round-trip without a user gesture',
  async () => {
    await navigator.clipboard.writeText('vitest clipboard text');
    await expect(navigator.clipboard.readText()).resolves.toBe('vitest clipboard text');
  },
);
