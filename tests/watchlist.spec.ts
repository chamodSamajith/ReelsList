import { test, expect } from '@playwright/test'
import { seedWatchlist, makeEntry } from './helpers'

test.describe('Watchlist page', () => {
  test('shows an empty state with no entries', async ({ page }) => {
    await page.goto('/#/watchlist')
    await expect(page.getByText('Your watchlist is empty')).toBeVisible()
  })

  test('lists seeded entries with correct filter counts', async ({ page }) => {
    await seedWatchlist(page, [
      makeEntry({ movieId: 1, title: 'To Watch Movie', status: 'to-watch' }),
      makeEntry({ movieId: 2, title: 'Watched Movie', status: 'watched' }),
      makeEntry({ movieId: 3, title: 'Skip Movie', status: 'skip' }),
    ])
    await page.goto('/#/watchlist')

    await expect(page.getByText('3 movies saved')).toBeVisible()
    await expect(page.getByRole('button', { name: 'All (3)' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'To Watch (1)' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Watched (1)' })).toBeVisible()
    await expect(page.getByRole('button', { name: "Don't Watch (1)" })).toBeVisible()

    await expect(page.getByRole('heading', { name: /To Watch Movie/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Watched Movie/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Skip Movie/ })).toBeVisible()
  })

  test('filter chips narrow the visible entries', async ({ page }) => {
    await seedWatchlist(page, [
      makeEntry({ movieId: 1, title: 'To Watch Movie', status: 'to-watch' }),
      makeEntry({ movieId: 2, title: 'Watched Movie', status: 'watched' }),
    ])
    await page.goto('/#/watchlist')

    await page.getByRole('button', { name: 'Watched (1)' }).click()
    await expect(page.getByRole('heading', { name: /Watched Movie/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /To Watch Movie/ })).toBeHidden()

    await page.getByRole('button', { name: 'All (2)' }).click()
    await expect(page.getByRole('heading', { name: /To Watch Movie/ })).toBeVisible()
  })

  test('changing status on an entry updates counts and card', async ({ page }) => {
    await seedWatchlist(page, [makeEntry({ movieId: 1, title: 'To Watch Movie', status: 'to-watch' })])
    await page.goto('/#/watchlist')

    const card = page.locator('article').filter({ hasText: 'To Watch Movie' })
    await card.getByRole('button', { name: 'Watched' }).click()

    await expect(page.getByRole('button', { name: 'Watched (1)' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'To Watch (0)' })).toBeVisible()
  })

  test('rating an entry fills the stars', async ({ page }) => {
    await seedWatchlist(page, [makeEntry({ movieId: 1, title: 'To Watch Movie' })])
    await page.goto('/#/watchlist')

    const card = page.locator('article').filter({ hasText: 'To Watch Movie' })
    await card.getByRole('button', { name: 'Rate 4 of 5' }).click()

    // Stars 1-4 should be filled (amber), star 5 should not.
    for (const n of [1, 2, 3, 4]) {
      await expect(card.getByRole('button', { name: `Rate ${n} of 5` })).toHaveClass(/text-amber-400/)
    }
    await expect(card.getByRole('button', { name: 'Rate 5 of 5' })).not.toHaveClass(/text-amber-400/)
  })

  test('adding a note is written to persisted storage', async ({ page }) => {
    await seedWatchlist(page, [makeEntry({ movieId: 1, title: 'To Watch Movie' })])
    await page.goto('/#/watchlist')

    const card = page.locator('article').filter({ hasText: 'To Watch Movie' })
    const noteInput = card.getByPlaceholder('Add a private note…')
    await noteInput.fill('Watch this weekend')
    await expect(noteInput).toHaveValue('Watch this weekend')

    // Confirm zustand's persist middleware actually wrote the note to
    // localStorage, not just React state.
    const stored = await page.evaluate(() => window.localStorage.getItem('reelist-watchlist'))
    const parsed = JSON.parse(stored ?? '{}')
    expect(parsed.state.entries[0].note).toBe('Watch this weekend')
  })

  test('removing an entry updates the count and can restore the empty state', async ({ page }) => {
    await seedWatchlist(page, [makeEntry({ movieId: 1, title: 'Only Movie' })])
    await page.goto('/#/watchlist')

    await expect(page.getByText('1 movies saved')).toBeVisible()
    const card = page.locator('article').filter({ hasText: 'Only Movie' })
    await card.getByRole('button', { name: 'Remove' }).click()

    await expect(page.getByText('Your watchlist is empty')).toBeVisible()
  })
})
