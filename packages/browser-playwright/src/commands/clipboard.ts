import type { BrowserCommand, BrowserCommandContext } from 'vitest/node'

// WebKit only lets page scripts access the clipboard while handling a real
// user gesture; the `clipboard-read` permission alone does not lift that
// requirement. Scripts evaluated through the Playwright protocol run with an
// emulated user gesture, so the WebKit tester bridges `navigator.clipboard`
// text methods to these commands. They evaluate on the orchestrator page
// instead of the tester frame because the frame's `navigator.clipboard` is
// patched to call them.
// See https://github.com/vitest-dev/vitest/issues/10623

const grantedContexts = new WeakSet<object>()

async function grantClipboardPermissions(context: BrowserCommandContext): Promise<void> {
  const browserContext = context.context
  if (grantedContexts.has(browserContext)) {
    return
  }
  grantedContexts.add(browserContext)
  try {
    await browserContext.grantPermissions(['clipboard-read'])
  }
  catch {
    // not every browser supports the permission; the evaluation below can
    // still succeed without it
  }
}

export const clipboardReadText: BrowserCommand<[]> = async (context) => {
  await grantClipboardPermissions(context)
  return context.page.evaluate(() => navigator.clipboard.readText())
}

export const clipboardWriteText: BrowserCommand<[text: string]> = async (context, text) => {
  await grantClipboardPermissions(context)
  await context.page.evaluate(text => navigator.clipboard.writeText(text), text)
}
