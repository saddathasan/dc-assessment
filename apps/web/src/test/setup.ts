// Vitest setup: registers jest-dom matchers (toBeInTheDocument, …) for every web test.
import '@testing-library/jest-dom/vitest'

// happy-dom reports each iframe blocked by `disableIframePageLoading` (vite.config)
// through the raw Node console it captured at Window construction — before vitest
// installs its interceptor, so onConsoleLog never sees the line. node:console's
// default instance IS that captured object; drop the one expected message there.
import nodeConsole from 'node:console'

const originalError = nodeConsole.error.bind(nodeConsole)
nodeConsole.error = (...args: unknown[]) => {
  if (String(args[0]).includes('Iframe page loading is disabled')) return
  originalError(...args)
}
