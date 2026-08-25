import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('renders the input with the given value and placeholder', () => {
    render(<SearchBar value="dune" onChange={vi.fn()} placeholder="Find a film…" />)

    const input = screen.getByPlaceholderText('Find a film…')
    expect(input).toHaveValue('dune')
  })

  it('calls onChange with the typed text as the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)

    await user.type(screen.getByPlaceholderText('Search for a movie…'), 'up')

    // Controlled input with a stubbed onChange doesn't re-render between
    // keystrokes, so each call receives the single new character typed.
    expect(onChange).toHaveBeenNthCalledWith(1, 'u')
    expect(onChange).toHaveBeenNthCalledWith(2, 'p')
  })
})
