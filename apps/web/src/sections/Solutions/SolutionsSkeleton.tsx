/* Layout-matched Solutions placeholder: reserves the WHOLE tab panel's height so
   nothing below jumps when the single query (D-028) resolves. One query now backs
   the tab pill, the intro block, the value-card row (MS-7) and the showcase (MS-8),
   so the skeleton mirrors all four band heights — else the card row and showcase
   land as layout shift (CLS). Band heights match the loaded components:
   SolutionCards (h-[394px]/lg:h-[450px]) and SolutionShowcase (29/73px gap then
   h-[900px]/lg:h-[700px]). Never in a Baseline — it is aria-hidden and only shows
   while query.isPending, and the gate always screenshots settled content. */
export function SolutionsSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="mx-auto h-20 max-w-[1440px] pt-5 lg:h-[100px] lg:pt-[30px]">
        <div className="mx-5 h-10 rounded-[5px] bg-white/60 lg:mx-0 lg:ml-[490px] lg:h-[70px] lg:w-[612px] lg:rounded-card" />
      </div>
      <div className="mx-auto flex h-[600px] max-w-[1440px] items-center justify-center px-5 lg:h-[370px] lg:items-end lg:justify-start lg:pb-[50px]">
        <div className="h-[424px] w-full max-w-[342px] rounded-card bg-black/10 lg:h-[234px] lg:w-[1078px] lg:max-w-none" />
      </div>
      {/* Value-card row (SolutionCards h-[394px]/lg:h-[450px]). */}
      <div className="mx-auto flex h-[394px] max-w-[1440px] items-center px-5 lg:h-[450px] lg:justify-center lg:gap-4 lg:px-0">
        <div className="h-[350px] w-full max-w-[353px] rounded-card bg-black/10 lg:h-[450px] lg:w-[457px] lg:max-w-none" />
        <div className="hidden h-[450px] w-[457px] rounded-card bg-black/10 lg:block" />
        <div className="hidden h-[450px] w-[457px] rounded-card bg-black/10 lg:block" />
      </div>
      {/* Showcase band (SolutionShowcase: 29/73px gap, then h-[900px]/lg:h-[700px]). */}
      <div className="mx-auto mt-[29px] h-[900px] max-w-[1440px] px-5 lg:mt-[73px] lg:h-[700px] lg:px-0">
        <div className="h-full w-full rounded-card bg-black/10" />
      </div>
    </div>
  )
}
