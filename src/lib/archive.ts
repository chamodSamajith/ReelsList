import type { ArchiveDoc } from '../types'

const ADVANCED_SEARCH = 'https://archive.org/advancedsearch.php'

/**
 * Public-domain feature films from the Internet Archive.
 * Legal to stream and embed — this is the only content we actually play in-app.
 */
export async function searchArchive(query: string): Promise<ArchiveDoc[]> {
  const base = 'collection:(feature_films) AND mediatype:(movies)'
  const q = query.trim() ? `title:(${query}) AND ${base}` : base

  const params = new URLSearchParams({
    q,
    rows: '24',
    page: '1',
    output: 'json',
    sort: 'downloads desc',
  })
  // fl[] repeats, so URLSearchParams gets them appended separately
  for (const field of ['identifier', 'title', 'year', 'description', 'downloads']) {
    params.append('fl[]', field)
  }

  const res = await fetch(`${ADVANCED_SEARCH}?${params}`)
  if (!res.ok) throw new Error(`Internet Archive request failed (${res.status})`)

  const data = await res.json()
  return (data?.response?.docs ?? []) as ArchiveDoc[]
}

export const archiveEmbedUrl = (identifier: string) =>
  `https://archive.org/embed/${identifier}`

export const archiveThumbUrl = (identifier: string) =>
  `https://archive.org/services/img/${identifier}`