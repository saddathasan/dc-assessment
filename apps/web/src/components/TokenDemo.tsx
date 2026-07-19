/* MS-0 proof page: tokens, fonts, and radii render from @theme. Replaced by the landing page in MS-2. */
const swatches = [
  ['accent', 'bg-accent'],
  ['ink', 'bg-ink'],
  ['deep', 'bg-deep'],
  ['surface', 'bg-surface'],
  ['surface-2', 'bg-surface-2'],
  ['showcase', 'bg-showcase'],
] as const

export function TokenDemo() {
  return (
    <main className="min-h-screen bg-deep p-10 text-white">
      <h1 className="font-display text-hero font-extrabold">
        Building <span className="text-accent">Intelligence</span>
      </h1>
      <p className="mt-6 max-w-md font-sans text-body font-light">
        MetaTech integrates custom software engineering, advanced data and AI
        systems, and strategic staff augmentation.
      </p>
      <div className="mt-10 flex gap-4">
        {swatches.map(([name, cls]) => (
          <div key={name} className="text-center">
            <div className={`h-16 w-16 rounded-card border border-line/20 ${cls}`} />
            <span className="font-sans text-ui">{name}</span>
          </div>
        ))}
      </div>
      <button className="mt-10 rounded-card bg-accent px-[35px] py-[10px] font-sans text-ui font-bold text-ink">
        Book for Demo
      </button>
    </main>
  )
}
