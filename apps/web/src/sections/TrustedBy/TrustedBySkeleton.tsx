/* Layout-matched Trusted By placeholder: heading stub above the 2x4 aspect-tile
   grid on mobile; the 4x2 wall bottom-pinned in the 320 band at 1440. */
export function TrustedBySkeleton() {
  return (
    <div
      aria-hidden
      className="mx-auto animate-pulse px-[21.5px] pt-20 pb-5 lg:flex lg:h-[320px] lg:max-w-[1440px] lg:flex-col lg:justify-end lg:p-5"
    >
      <div className="lg:flex lg:items-start lg:justify-between">
        <div className="h-12 w-[218px] rounded-card bg-white/10 lg:h-[60px] lg:w-[192px]" />
        <div className="mt-[30px] grid grid-cols-2 lg:hidden">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="aspect-[175/70] border border-white/10" />
          ))}
        </div>
        <div className="hidden lg:grid lg:h-[200px] lg:w-[925px] lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="border border-white/10" />
          ))}
        </div>
      </div>
    </div>
  )
}
