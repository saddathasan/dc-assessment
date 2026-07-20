// The Footer's oversized METATECH mark — desktop node 1:262 (1432x227 at y=131
// inside the Footer), mobile 1:457 (391x62 at y=420), plus the desktop-only
// scrim 1:264 that sinks its lower half back into the band (D-031).
//
// The mark ships as a VECTOR, not TEXT, so there is no font to match: the eight
// glyph subpaths below are file.json's fillGeometry verbatim. Its `fills` field
// reads solid white and is a red herring — the per-glyph colour lives in
// `fillOverrideTable`, which paints subpaths 0..3 accent and leaves 4..7 white.
// Both artboards carry targetAspectRatio 164:26 and mobile reconstructs as
// desktop x 0.273045 to the pixel, so one viewBox drives both breakpoints.

/** METATECH glyphs 1-4, painted --color-accent by fillOverrideTable entry 1 (node 1:262). */
const META =
  'M0 222.635L0 4.36538L75.8167 4.36538L113.261 194.571L118.831 194.571L156.275 4.36538L232.092 4.36538L232.092 222.635L192.482 222.635L192.482 34.6113L186.911 34.6113L149.777 222.635L82.3153 222.635L45.1806 34.6113L39.6104 34.6113L39.6104 222.635L0 222.635Z M263.606 222.635L263.606 4.36538L402.861 4.36538L402.861 41.783L304.454 41.783L304.454 93.8558L394.196 93.8558L394.196 131.273L304.454 131.273L304.454 185.217L404.718 185.217L404.718 222.635L263.606 222.635Z M475.803 222.635L475.803 41.783L412.674 41.783L412.674 4.36538L579.78 4.36538L579.78 41.783L516.651 41.783L516.651 222.635L475.803 222.635Z M563.514 222.635L620.454 4.36538L691.629 4.36538L748.569 222.635L706.483 222.635L694.724 174.615L617.36 174.615L605.6 222.635L563.514 222.635ZM626.953 136.574L685.131 136.574L658.827 30.2459L653.257 30.2459L626.953 136.574Z'

/** METATECH glyphs 5-8, left on the node's base white fill (node 1:262). */
const TECH =
  'M795.401 222.635L795.401 41.783L732.272 41.783L732.272 4.36538L899.378 4.36538L899.378 41.783L836.249 41.783L836.249 222.635L795.401 222.635Z M917.911 222.635L917.911 4.36538L1057.17 4.36538L1057.17 41.783L958.76 41.783L958.76 93.8558L1048.5 93.8558L1048.5 131.273L958.76 131.273L958.76 185.217L1059.02 185.217L1059.02 222.635L917.911 222.635Z M1162.29 227C1135.47 227 1114.22 219.516 1098.54 204.549C1082.87 189.375 1075.03 167.756 1075.03 139.692L1075.03 87.3077C1075.03 59.2445 1082.87 37.7294 1098.54 22.7624C1114.22 7.58746 1135.47 0 1162.29 0C1188.91 0 1209.43 7.37958 1223.87 22.1387C1238.52 36.69 1245.85 56.75 1245.85 82.3187L1245.85 84.1896L1205.62 84.1896L1205.62 81.0714C1205.62 68.1832 1202.01 57.5815 1194.79 49.2665C1187.77 40.9515 1176.94 36.794 1162.29 36.794C1147.85 36.794 1136.5 41.2633 1128.25 50.2019C1120 59.1406 1115.87 71.3013 1115.87 86.6841L1115.87 140.316C1115.87 155.491 1120 167.652 1128.25 176.798C1136.5 185.737 1147.85 190.206 1162.29 190.206C1176.94 190.206 1187.77 186.049 1194.79 177.734C1202.01 169.211 1205.62 158.609 1205.62 145.929L1205.62 140.316L1245.85 140.316L1245.85 144.681C1245.85 170.25 1238.52 190.414 1223.87 205.173C1209.43 219.724 1188.91 227 1162.29 227Z M1269.85 222.635L1269.85 4.36538L1310.69 4.36538L1310.69 94.4794L1391.15 94.4794L1391.15 4.36538L1432 4.36538L1432 222.635L1391.15 222.635L1391.15 131.897L1310.69 131.897L1310.69 222.635L1269.85 222.635Z'

/**
 * The band-wide METATECH mark, decorative: the nav logo and the copyright line
 * already say the name, so a third announcement is noise for AT (D-031.2).
 */
export function FooterWordmark() {
  return (
    <div data-testid="footer-wordmark" aria-hidden className="relative mx-auto w-full max-w-[1440px]">
      {/* Mobile pins the mark to the left edge at its drawn 391 of a 393 frame;
          desktop centres its 1432 in the 1440 band, leaving the design's 4px
          side bearings. Height follows the viewBox, landing 62 / 227 exactly. */}
      <svg
        viewBox="0 0 1432 227"
        role="presentation"
        focusable="false"
        className="block h-auto w-[391px] lg:mx-auto lg:w-[1432px]"
      >
        <path className="fill-accent" d={META} />
        <path className="fill-white" d={TECH} />
      </svg>
      {/* Node 1:264, desktop only — the mobile artboard draws no scrim, which is
          why its mark stays crisp. Figma's stops run #161616 at the box bottom
          to transparent 12.8% down from its top, i.e. 0.872 x 227 = 197.94px of
          travel upward. The transparent stop is written in the band's own hue
          rather than Figma's literal rgba(0,0,0,0): Figma interpolates
          premultiplied, CSS does not, so a black zero-alpha stop would drag the
          midtones grey across the white half of the mark. */}
      <div className="absolute inset-0 hidden bg-[linear-gradient(to_top,#161616_0px,rgba(22,22,22,0)_197.94px)] lg:block" />
    </div>
  )
}
