import { useQuery } from '@tanstack/react-query'
import { fetchSection, type SectionKey, type SectionPayloads } from '../lib/sections'

/** One typed server-cache query per Section; Query owns retries/caching (D-014). */
export function useSectionQuery<K extends SectionKey>(section: K) {
  return useQuery<SectionPayloads[K]>({
    queryKey: ['section', section],
    queryFn: () => fetchSection(section),
  })
}
