import { getBrowserState } from '../utils'

// WebKit requires a real user gesture for `navigator.clipboard` calls made by
// page scripts, even when the `clipboard-read` permission is granted, while
// scripts evaluated through the Playwright protocol run with an emulated user
// gesture. Route the text methods through the provider so they work the same
// way they do in other browsers.
// See https://github.com/vitest-dev/vitest/issues/10623
export function setupClipboardBridge(): void {
  const clipboard = navigator.clipboard
  // clipboard is only available in secure contexts
  if (!clipboard) {
    return
  }
  const commands = getBrowserState().commands
  clipboard.readText = () =>
    commands.triggerCommand<string>(
      '__vitest_clipboardReadText',
      [],
      new Error('readText'),
    )
  clipboard.writeText = (text: string) =>
    commands.triggerCommand<void>(
      '__vitest_clipboardWriteText',
      [String(text)],
      new Error('writeText'),
    )
}
