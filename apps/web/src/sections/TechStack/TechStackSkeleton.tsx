/* Layout-matched Tech Stack placeholder: the bottom-pinned copy block over the
   three logo rows, holding the same 350+360 (mobile) / 850 (lg) band height so
   the page below does not shift when the payload lands. */
export function TechStackSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col justify-center lg:h-[850px]">
      <div className="mx-auto flex h-[350px] w-full max-w-[1440px] flex-col justify-end pb-[50px] pl-5 pr-[26px] lg:h-[297px] lg:pr-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-[358px]">
          <div className="h-6 w-[115px] rounded-card bg-black/10" />
          <div className="flex flex-col gap-5 lg:w-[681px] lg:shrink-0 lg:gap-[30px]">
            <div className="h-[68px] rounded-card bg-black/10 lg:h-9" />
            <div className="h-20 rounded-card bg-black/10 lg:h-[81px]" />
          </div>
        </div>
      </div>
      <div className="flex h-[360px] flex-col gap-[10px] lg:h-[470px]">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-[100px] rounded-card bg-black/5 lg:h-[150px]" />
        ))}
      </div>
    </div>
  )
}
