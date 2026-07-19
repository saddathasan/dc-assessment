// Cloudflare Workers entry: wraps the same Express app the local server runs.
// Bundled by wrangler (excluded from tsc — 'cloudflare:node' is runtime-provided).
import { httpServerHandler } from 'cloudflare:node'
import { app } from './app.js'

// Port 3000 is Worker-internal only: the handler bridges incoming requests to
// the Node server registered on it; nothing is exposed on the network.
app.listen(3000)
export default httpServerHandler({ port: 3000 })
