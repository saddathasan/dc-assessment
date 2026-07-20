/* Layout-matched Solutions placeholder: tab-pill stub over the intro-block
   footprint, so the visible region doesn't jump when content lands. One query
   now backs the whole tab panel (D-028), so this must grow with it — the card
   row in MS-7 and the showcase in MS-8 — or the panel's later parts land as
   layout shift. */
export function SolutionsSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="mx-auto h-20 max-w-[1440px] pt-5 lg:h-[100px] lg:pt-[30px]">
        <div className="mx-5 h-10 rounded-[5px] bg-white/60 lg:mx-0 lg:ml-[490px] lg:h-[70px] lg:w-[612px] lg:rounded-card" />
      </div>
      <div className="mx-auto flex h-[600px] max-w-[1440px] items-center justify-center px-5 lg:h-[370px] lg:items-end lg:justify-start lg:pb-[50px]">
        <div className="h-[424px] w-full max-w-[342px] rounded-card bg-black/10 lg:h-[234px] lg:w-[1078px] lg:max-w-none" />
      </div>
    </div>
  )
}
