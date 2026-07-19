/* Layout-matched Hero placeholder: blocks mirror the real geometry at both widths
   (48px-headline column + photo card on mobile; 400px copy row + 571 media at 1440). */
export function HeroSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="mx-auto w-full max-w-[336px] lg:flex lg:h-[400px] lg:max-w-none lg:items-center lg:gap-[180px] lg:px-[50px]">
        <div className="h-[192px] rounded-card bg-white/10 lg:h-[216px] lg:w-[664px]" />
        <div className="mt-5 lg:mt-0 lg:w-[388px]">
          <div className="h-20 rounded-card bg-white/10 lg:h-[92px]" />
          <div className="mt-[30px] h-10 w-[130px] rounded-[10px] bg-white/10 lg:mt-5 lg:h-[50px] lg:w-[160px] lg:rounded-card" />
          <div className="mt-[50px] size-[100px] rounded-full bg-white/10 lg:hidden" />
        </div>
      </div>
      <div className="mx-auto mt-5 h-[200px] w-full max-w-[380px] rounded-tile bg-white/10 lg:mx-5 lg:mt-20 lg:h-[571px] lg:w-auto lg:max-w-none lg:rounded-[35px]" />
    </div>
  )
}
