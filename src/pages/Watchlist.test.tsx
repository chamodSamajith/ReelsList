import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Watchlist from './Watchlist'
import { useWatchlist } from '../store/watchlist'

beforeEach(() => {
  useWatchlist.setState({ entries: [] })
})

describe('Watchlist page', () => {
  it('shows the empty state when there are no saved entries', () => {
    render(<Watchlist />)

    expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument()
    expect(screen.getByText('Head to Discover and hit the + on any poster.')).toBeInTheDocument()
  })
})
