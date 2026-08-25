import { useEffect, useState } from 'react'

/**
 * Returns `value` only after it has stopped changing for `delay` ms.
 * Keeps us from firing a TMDB request on every keystroke.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer) // cancels the pending timer on every new keystroke
  }, [value, delay])

  return debounced
}