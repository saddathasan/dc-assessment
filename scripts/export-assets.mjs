// Derives apps/web/public/images/ from the committed Extraction (design/figma/):
// bitmap fills are copied out of images/ (keyed by imageRef) under semantic
// names, and the vector marks (MetaTech logo/wordmark/watermark, Angular) are
// reconstructed as SVGs from each node's fillGeometry. Run: node scripts/export-assets.mjs
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const figma = join(root, 'design/figma')
const out = join(root, 'apps/web/public/images')

// imageRef -> exported name (extension matches the actual encoding on disk)
const BITMAPS = {
  'b15a50b080a2b8cc08c40303215f872f40ce127a': 'hero-photo.png',
  '2cd77821c1da8edcbe36089a6c9c6129311b14e3': 'showcase-device.jpg',
  d238f842ee173f20f4fcf3fb750a9990de232a4e: 'amicredible-logo.png',
  '35f1781a9381767e9351132ab0921c86599c8e30': 'menu/custom-software.jpg',
  b227e81bb593601c6a88098a0b9efc413819cb79: 'menu/data-ai.png',
  '875e02ffc80692e7ec320ab6aea9d399ee63f40a': 'menu/tech-staffing.png',
  '7848b21de345f5f260397fc07c78558bf0b405cc': 'logos/databricks.png',
  '8adbfa7fc7ee50686c5dc9fcf1301bfe105fcb4c': 'logos/google-cloud.png',
  e832a45b04ee476f2b2438cd9e7bf685c7d691ed: 'logos/uipath.png',
  '48aad142df34977c8fe6f67e787a206468288fda': 'logos/alteryx.png',
  '16b55c3a845429a3c6bb0b162644418caf2a7394': 'logos/figma.png',
  ffdb7116e01d3ae2a6684c6a3d74506b9088f35a: 'logos/aws.png',
  b47be924b3b09f323060149cae8ffc32963b57ff: 'tech/react.png',
  df90b364406024a354f8d293ac049ddaa2e9be90: 'tech/nextjs.png',
  '33d0b6f922ecf7b78e64c1584ce52a91c7c5a3ed': 'tech/tailwind.png',
  f0553c2ace57d35504dbcc8199bd328677be02aa: 'tech/typescript.png',
  '059428fe7d42594263762b2abde83d78bdc6372f': 'tech/vue.png',
  '2e4d19a9920f71dccc5107c2bfcd846ebcc87b97': 'tech/go.png',
  '2ddf59d42c04ab690dc0470f84667635366a5d11': 'tech/python.png',
  '4b182fcfcbcc3559e8025e882360fbfac5a6c2c9': 'tech/nodejs.png',
  f9cd987c611701d66e0063acd8017289c9a2a298: 'tech/dotnet.png',
  d77babcf69a7f8c5a396734f254be79d989b5e2e: 'tech/ruby.png',
  '0bab4a2d4805359c17b30008ecfba4295a139fd1': 'tech/php.png',
  '6cf71e96ab7a3150101b1d6c322700ab946fcad1': 'tech/django.png',
  '44f6dd3252395f2af5c669ef4639c2390d1e9dad': 'tech/laravel.png',
  '7003060038b88229d7234e0895d01654bfebb2d4': 'tech/flutter.png',
  eceb15684d4183c66f73c1a9bb777eef708b2b66: 'tech/mysql.png',
  '50548498f4a1667b348b97de5433f43dbfa7e4f0': 'tech/mongodb.png',
  '2500e583e07d8a90a6b1adfcefa7d8074d14d4de': 'tech/html5.png',
}

const file = JSON.parse(readFileSync(join(figma, 'file.json'), 'utf8'))

const nodesByPath = new Map()
;(function walk(node, path) {
  const here = `${path}/${node.name}`
  nodesByPath.set(here, node)
  for (const child of node.children ?? []) walk(child, here)
})(file.document, '')

const WEB = '/Document/Page 1/Web View/Frame 289503/Frame 289502/Frame 289408'
const VECTORS = {
  'metatech-logo.svg': `${WEB}/Group 289357/Frame 289375/Frame 52/Frame 52/Frame 110/Frame 52/MetaTech`,
  'metatech-watermark.svg': `${WEB}/Group 289357/Frame 289375/Frame 289370/Frame 289523/Frame 81/MetaTech`,
  'metatech-wordmark.svg':
    '/Document/Page 1/Web View/Frame 289407/Frame 289406/Frame 289405/Frame 289404/Frame 289403/Footer/MetaTech',
  'tech/angular.svg':
    '/Document/Page 1/Web View/Frame 289407/Frame 289406/Frame 289402/Frame 289401/Frame 289385/Frame 95/angular-3-logo-svg-vector 1/Group',
}

const hex = (c) =>
  '#' +
  [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')

const rule = (windingRule) => (windingRule === 'EVENODD' ? 'evenodd' : 'nonzero')

// One node's fillGeometry -> <path> elements; per-path overrides win over the base fill.
function nodePaths(node, dx = 0, dy = 0) {
  const base = node.fills?.find((f) => f.type === 'SOLID')
  return (node.fillGeometry ?? []).map((geom) => {
    const override = geom.overrideID != null ? node.fillOverrideTable?.[geom.overrideID] : null
    const paint = override?.fills?.find((f) => f.type === 'SOLID') ?? base
    const transform = dx || dy ? ` transform="translate(${dx} ${dy})"` : ''
    const opacity = (paint?.opacity ?? 1) * (node.opacity ?? 1)
    const opacityAttr = opacity < 1 ? ` fill-opacity="${opacity}"` : ''
    return `  <path d="${geom.path}" fill="${hex(paint.color)}"${opacityAttr} fill-rule="${rule(geom.windingRule)}"${transform}/>`
  })
}

function toSvg(node) {
  const box = node.absoluteBoundingBox
  const paths =
    node.type === 'GROUP'
      ? (node.children ?? []).flatMap(function collect(child) {
          const cbox = child.absoluteBoundingBox
          return child.fillGeometry?.length
            ? nodePaths(child, cbox.x - box.x, cbox.y - box.y)
            : (child.children ?? []).flatMap(collect)
        })
      : nodePaths(node)
  const w = Math.round(box.width)
  const h = Math.round(box.height)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n${paths.join('\n')}\n</svg>\n`
}

for (const [ref, name] of Object.entries(BITMAPS)) {
  const dest = join(out, name)
  mkdirSync(dirname(dest), { recursive: true })
  copyFileSync(join(figma, 'images', ref), dest)
  console.log(`bitmap ${name}`)
}

for (const [name, path] of Object.entries(VECTORS)) {
  const node = nodesByPath.get(path)
  if (!node) throw new Error(`node not found: ${path}`)
  const dest = join(out, name)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, toSvg(node))
  console.log(`vector ${name}`)
}
