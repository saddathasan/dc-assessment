// Cloudflare Workers entry: wraps the same Express app the local server runs.
// Bundled by wrangler (excluded from tsc — 'cloudflare:node' is runtime-provided).
import { httpServerHandler } from 'cloudflare:node'
import { app } from './app.js'

app.listen(3000)
export default httpServerHandler({ port: 3000 })
