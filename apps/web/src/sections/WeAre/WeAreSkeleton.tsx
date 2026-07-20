/* Layout-matched We Are placeholder: eyebrow stub above the statement block on
   mobile; side by side, bottom-pinned in the 345 band at 1440. */
export function WeAreSkeleton() {
  return (
    <div
      aria-hidden
      className="mx-auto animate-pulse px-5 pt-[87px] pb-[50px] lg:flex lg:h-[345px] lg:max-w-[1440px] lg:flex-col lg:justify-end lg:pt-5"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-[400px]">
        <div className="h-6 w-[76px] rounded-card bg-black/10 lg:h-[30px]" />
        <div className="h-[189px] rounded-card bg-black/10 lg:h-[195px] lg:w-[680px] lg:shrink-0" />
      </div>
    </div>
  )
}
