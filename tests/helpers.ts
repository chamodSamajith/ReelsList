import type { Page } from '@playwright/test'
import type { WatchlistEntry } from '../src/types'

const STORAGE_KEY = 'reelist-watchlist'

/**
 * Seeds the zustand-persisted watchlist store in localStorage before the app
 * mounts, so Watchlist tests don't depend on live TMDB calls or manual UI
 * setup. Must be called before `page.goto`.
 */
export async function seedWatchlist(page: Page, entries: WatchlistEntry[]) {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [STORAGE_KEY, JSON.stringify({ state: { entries }, version: 1 })],
  )
}

export function makeEntry(overrides: Partial<WatchlistEntry> = {}): WatchlistEntry {
  return {
    movieId: 550,
    title: 'Fight Club',
    posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    releaseDate: '1999-10-15',
    addedAt: '2026-01-01T00:00:00.000Z',
    note: '',
    myRating: null,
    status: 'to-watch',
    ...overrides,
  }
}
