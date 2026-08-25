import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MovieCard } from './MovieCard'
import { useWatchlist } from '../store/watchlist'
import type { Movie } from '../types'

const movie: Movie = {
  id: 550,
  title: 'Fight Club',
  poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  backdrop_path: null,
  release_date: '1999-10-15',
  vote_average: 8.4,
  overview: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.',
  genre_ids: [],
}

beforeEach(() => {
  useWatchlist.setState({ entries: [] })
})

describe('MovieCard', () => {
  it('renders the title, release year and poster image', () => {
    render(<MovieCard movie={movie} />)

    expect(screen.getByText('Fight Club')).toBeInTheDocument()
    expect(screen.getByText('1999')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fight Club' })).toHaveAttribute(
      'src',
      expect.stringContaining('/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'),
    )
  })

  it('adds the movie to the watchlist when the toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(<MovieCard movie={movie} />)

    const addButton = screen.getByRole('button', { name: 'Add Fight Club to watchlist' })
    await user.click(addButton)

    expect(useWatchlist.getState().entries.map((e) => e.movieId)).toContain(550)
    expect(screen.getByRole('button', { name: 'Remove Fight Club from watchlist' })).toBeInTheDocument()
  })
})
