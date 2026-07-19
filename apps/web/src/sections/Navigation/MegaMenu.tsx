// Mega-menu panel: the 1400x444 #161616 sheet that extends from the bar, holding
// the three Solution tiles whose images reveal individually (notes 1:512/1:514).
// Geometry from Figma nodes 1:459..1:509; reveal styling from the 1:481 composite.
import { useState } from 'react'
import type { MegaMenuTile, SolutionId } from '@metatech/shared'

/** Open-state panel with per-tile image reveal on hover/focus (D-010: CSS transitions, small React state). */
export function MegaMenuPanel({ tiles }: { tiles: MegaMenuTile[] }) {
  const [revealed, setRevealed] = useState<SolutionId | null>(null)

  return (
    <div
      id="mega-menu-panel"
      data-testid="mega-menu-panel"
      className="absolute inset-x-5 top-5 mx-auto h-[444px] max-w-[1400px] rounded-bar bg-ink motion-safe:animate-menu-in"
    >
      {/* Tiles sit 86px under the panel top with 18px side inset (nodes 1:462..1:464). */}
      <div className="flex gap-1.5 pl-[18px] pt-[86px]">
        {tiles.map((tile) => (
          <a
            key={tile.solution}
            href="#solutions"
            data-testid="mega-menu-tile"
            data-revealed={revealed === tile.solution}
            onMouseEnter={() => setRevealed(tile.solution)}
            onMouseLeave={() => setRevealed(null)}
            onFocus={() => setRevealed(tile.solution)}
            onBlur={() => setRevealed(null)}
            className="group relative block h-[339px] w-[450px] overflow-hidden rounded-tile border border-white/25 bg-black"
          >
            <img
              src={tile.image.src}
              alt={tile.image.alt}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ease-out group-data-[revealed=true]:opacity-100"
            />
            {/* 25% scrim (Rectangle 35) keeps the heading legible over the revealed image. */}
            <span aria-hidden="true" className="absolute inset-0 bg-black/25" />
            <h3 className="absolute left-8 top-[26px] max-w-[250px] font-display text-tile font-extrabold tracking-[-0.05em] text-accent transition-colors duration-200 ease-out group-data-[revealed=true]:text-[#f4f6f5]">
              {tile.title}
            </h3>
          </a>
        ))}
      </div>
    </div>
  )
}
