/* Blocks mirror the design's Hero geometry (664×216 headline, 388-wide sub column, 571-tall media). */
export function HeroSkeleton() {
  return (
    <div aria-hidden className="animate-pulse px-[50px] py-10">
      <div className="flex flex-wrap justify-between gap-10 pb-20">
        <div className="h-[216px] w-full max-w-[664px] rounded-card bg-white/10" />
        <div className="w-full max-w-[388px] space-y-5">
          <div className="h-[92px] rounded-card bg-white/10" />
          <div className="h-[50px] w-[160px] rounded-card bg-white/10" />
        </div>
      </div>
      <div className="h-[571px] rounded-bar bg-white/10" />
    </div>
  )
}
