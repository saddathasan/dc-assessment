/* Layout-matched Footer placeholder: the same 390+30+62 (mobile) / 92+39+227
   (lg) band the loaded Section builds, so the page keeps its full height and
   the document's maximum scroll — which the sticky release depends on — does
   not move when the payload lands. */
export function FooterSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-[30px] lg:gap-[39px]">
      <div className="px-[30px] lg:hidden">
        <div className="flex flex-col gap-[50px]">
          <div className="flex flex-col gap-[30px]">
            <div className="h-[68px] w-[109px] rounded-card bg-white/10" />
            <div className="h-px w-5 bg-white/10" />
            <div className="h-[156px] w-[83px] rounded-card bg-white/10" />
            <div className="h-px w-5 bg-white/10" />
          </div>
          <div className="h-6 w-[323px] max-w-full rounded-card bg-white/10" />
        </div>
      </div>
      <div className="mx-auto hidden w-full max-w-[1440px] px-[88px] pt-[68px] lg:block">
        <div className="flex items-center justify-between">
          <div className="h-6 w-[323px] rounded-card bg-white/10" />
          <div className="h-6 w-[193px] rounded-card bg-white/10" />
          <div className="h-6 w-[320px] rounded-card bg-white/10" />
        </div>
      </div>
      <div className="h-[62px] rounded-card bg-white/5 lg:h-[227px]" />
    </div>
  )
}
