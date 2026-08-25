import { test, expect } from '@playwright/test'

test.describe('Discover page', () => {
  test('searching filters the results heading', async ({ page }) => {
    await page.goto('/')

    await page.getByPlaceholder('Search for a movie…').fill('Inception')
    await expect(page.getByRole('heading', { name: /Results for/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Results for “Inception”/ })).toBeVisible()

    // Trending row is hidden while searching.
    await expect(page.getByRole('heading', { name: 'Trending This Week' })).toBeHidden()
  })

  test('clearing the search restores popular movies and trending row', async ({ page }) => {
    await page.goto('/')

    const search = page.getByPlaceholder('Search for a movie…')
    await search.fill('Inception')
    await expect(page.getByRole('heading', { name: /Results for/ })).toBeVisible()

    await search.fill('')
    await expect(page.getByRole('heading', { name: 'Popular Right Now' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Trending This Week' })).toBeVisible()
  })

  test('toggling a movie card updates the watchlist badge', async ({ page }) => {
    await page.goto('/')

    const watchlistLink = page.getByRole('link', { name: 'Watchlist' })
    await expect(watchlistLink).not.toContainText(/\d/)

    const firstCard = page.locator('main .grid > div').first()
    await firstCard.hover()
    const addButton = firstCard.getByRole('button', { name: /Add .* to watchlist/ })
    await addButton.click()

    await expect(watchlistLink).toContainText('1')
    await expect(firstCard.getByRole('button', { name: /Remove .* from watchlist/ })).toBeVisible()
  })
})
