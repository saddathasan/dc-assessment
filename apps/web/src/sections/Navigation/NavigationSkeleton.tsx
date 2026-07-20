// Layout-matched loading placeholder for the Navigation bar: same pill footprint
// at both widths so content landing never shifts the page (D-007 skeleton policy).

/** Pulsing stand-in matching the bar's exact box at 393 and 1440. */
export function NavigationSkeleton() {
  return (
    <div className="mx-auto h-14 max-w-[1400px] animate-pulse rounded-[5px] bg-white/10 lg:h-20 lg:rounded-bar" />
  )
}
