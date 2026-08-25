import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { Movie, WatchlistEntry, WatchStatus } from '../types'

interface WatchlistState {
  entries: WatchlistEntry[]
  add: (movie: Movie) => void
  remove: (movieId: number) => void
  toggle: (movie: Movie) => void
  update: (movieId: number, patch: Partial<WatchlistEntry>) => void
  clear: () => void
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      entries: [],

      add: (movie) =>
        set((state) => {
          if (state.entries.some((e) => e.movieId === movie.id)) return state
          const entry: WatchlistEntry = {
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            releaseDate: movie.release_date,
            addedAt: new Date().toISOString(),
            note: '',
            myRating: null,
            status: 'to-watch',
          }
          return { entries: [entry, ...state.entries] }
        }),

      remove: (movieId) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.movieId !== movieId),
        })),

      toggle: (movie) => {
        const inList = get().entries.some((e) => e.movieId === movie.id)
        inList ? get().remove(movie.id) : get().add(movie)
      },

      update: (movieId, patch) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.movieId === movieId ? { ...e, ...patch } : e,
          ),
        })),

      clear: () => set({ entries: [] }),
    }),
    {
      name: 'reelist-watchlist',
      version: 1,
    },
  ),
)

/** Selector hook — only re-renders when THIS movie's membership changes. */
export const useIsInWatchlist = (movieId: number): boolean =>
  useWatchlist((s) => s.entries.some((e) => e.movieId === movieId))

/** Counts per status, for the tab badge and filter chips. */
export const useStatusCounts = () =>
  useWatchlist(
    useShallow((s) => {
      const counts: Record<WatchStatus, number> = {
        'to-watch': 0,
        watched: 0,
        skip: 0,
      }
      for (const e of s.entries) counts[e.status]++
      return counts
    }),
  )