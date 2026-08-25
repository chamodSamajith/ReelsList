import type {
  Genre,
  Movie,
  TmdbListResponse,
  WatchProviderResponse,
} from '../types'

const BASE = 'https://api.themoviedb.org/3'
const TOKEN = import.meta.env.VITE_TMDB_TOKEN as string

if (!TOKEN) {
  throw new Error('Missing VITE_TMDB_TOKEN — check your .env.local and restart the dev server')
}

/** Build a TMDB image URL. Returns null when the movie has no artwork. */
export function imageUrl(path: string | null, size: string = 'w342'): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null
}

/** Generic fetch wrapper — the caller decides the response shape. */
async function tmdb<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      accept: 'application/json',
    },
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid TMDB token — check .env.local')
    if (res.status === 429) throw new Error('Rate limited by TMDB. Slow down.')
    throw new Error(`TMDB request failed (${res.status})`)
  }

  return res.json() as Promise<T>
}

// ---------- Endpoints ----------

export const getTrending = () =>
  tmdb<TmdbListResponse>('/trending/movie/week?language=en-US')

export const getPopular = (page = 1) =>
  tmdb<TmdbListResponse>(`/movie/popular?language=en-US&page=${page}`)

export const getTopRated = (page = 1) =>
  tmdb<TmdbListResponse>(`/movie/top_rated?language=en-US&page=${page}`)

export const searchMovies = (query: string, page = 1) =>
  tmdb<TmdbListResponse>(
    `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`,
  )

export const getProviders = (movieId: number) =>
  tmdb<WatchProviderResponse>(`/movie/${movieId}/watch/providers`)

export const getGenres = () =>
  tmdb<{ genres: Genre[] }>('/genre/movie/list?language=en-US')

export type { Movie }