// ---------- TMDB ----------

export interface Movie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  overview: string
  genre_ids: number[]
}

export interface TmdbListResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface Genre {
  id: number
  name: string
}

export interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priority: number
}

export interface RegionProviders {
  link?: string
  flatrate?: Provider[]
  free?: Provider[]
  ads?: Provider[]
  rent?: Provider[]
  buy?: Provider[]
}

export interface WatchProviderResponse {
  id: number
  results: Record<string, RegionProviders>
}

// ---------- Our app ----------

export type WatchStatus = 'to-watch' | 'watched' | 'skip'

export interface WatchlistEntry {
  movieId: number
  title: string
  posterPath: string | null
  releaseDate: string
  addedAt: string
  note: string
  myRating: number | null
  status: WatchStatus
}

// ---------- Internet Archive ----------

export interface ArchiveDoc {
  identifier: string
  title: string
  year?: number
  description?: string
  downloads?: number
}