// Local dev entry: binds the shared Express app to a port. Production never
// runs this file — the Cloudflare Worker wraps the same app via worker.ts (D-011).
import { app } from './app.js'

const port = Number(process.env.PORT ?? 3001)

app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`)
})
