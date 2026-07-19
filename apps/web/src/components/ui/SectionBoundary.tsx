import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'

interface SectionBoundaryProps<T> {
  query: UseQueryResult<T>
  /** Layout-matched placeholder so the page doesn't jump when content lands. */
  skeleton: ReactNode
  children: (data: T) => ReactNode
}

/** Per-Section loading/error/content switch: every Section fails and recovers alone (D-007). */
export function SectionBoundary<T>({ query, skeleton, children }: SectionBoundaryProps<T>) {
  if (query.isPending) {
    return <>{skeleton}</>
  }
  if (query.isError) {
    return (
      <div role="alert" className="grid min-h-80 place-items-center gap-4 p-10 text-center">
        <div>
          <p className="font-sans text-body-lg">This section could not be loaded.</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-4 rounded-card bg-accent px-[35px] py-[10px] font-sans text-ui font-bold text-ink"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
  return <>{children(query.data)}</>
}
