import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('loads the Discover page by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Welcome.' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Discover' })).toHaveClass(/text-brand-teal/)
  })

  test('navigates to Watchlist and Free to Watch via the header', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Watchlist' }).click()
    await expect(page).toHaveURL(/\/watchlist$/)

    await page.getByRole('link', { name: 'Free to Watch' }).click()
    await expect(page).toHaveURL(/\/free$/)

    await page.getByRole('link', { name: 'Discover' }).click()
    await expect(page).toHaveURL('/')
  })

  test('shows a not-found message for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await expect(page.getByText('Page not found.')).toBeVisible()
  })
})
