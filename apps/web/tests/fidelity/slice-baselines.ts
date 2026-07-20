/**
 * Slices per-Section Baselines out of the committed Figma renders (design/figma/renders/)
 * so the Fidelity Gate diffs against design truth, not build-over-build drift (D-021).
 * Deterministic; outputs are committed. Regenerate: pnpm --filter web fidelity:slice
 * Run with Node ≥24 (native TypeScript type stripping).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import { targets, type FidelityTarget } from './sections.ts'

/** Renders are exported @2x (D-001); manifest geometry is logical px. */
const SCALE = 2

const here = dirname(fileURLToPath(import.meta.url))
const rendersDir = join(here, '..', '..', '..', '..', 'design', 'figma', 'renders')
const outDir = join(here, 'baselines')

/** Crops one Baseline out of its source render, flattening alpha onto the page background when asked. */
function slice(target: FidelityTarget): void {
  const src = PNG.sync.read(readFileSync(join(rendersDir, target.source)))
  const { x, y, width, height } = target.crop
  const out = new PNG({ width: width * SCALE, height: height * SCALE })
  PNG.bitblt(src, out, x * SCALE, y * SCALE, width * SCALE, height * SCALE, 0, 0)

  if (target.flattenOnto) {
    const bg = [1, 3, 5].map((i) => parseInt(target.flattenOnto!.slice(i, i + 2), 16))
    for (let i = 0; i < out.data.length; i += 4) {
      const a = out.data[i + 3] / 255
      for (let c = 0; c < 3; c++) out.data[i + c] = Math.round(out.data[i + c] * a + bg[c] * (1 - a))
      out.data[i + 3] = 255
    }
  }

  writeFileSync(join(outDir, `${target.id}.png`), PNG.sync.write(out))
  console.log(`sliced ${target.id}.png  ${width * SCALE}x${height * SCALE} from ${target.source}`)
}

mkdirSync(outDir, { recursive: true })
// Deviated Sections (D-032) have no render pixel to slice against — their
// Baseline is captured from the build (fidelity:baseline:build), so skip them.
targets.forEach((t) => {
  if (t.deviated) {
    console.log(`skipped ${t.id}.png (deviated ${t.deviated} — Baseline is build-sourced)`)
    return
  }
  slice(t)
})
