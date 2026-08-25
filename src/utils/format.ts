/** "2024-03-15" → "2024". Handles TMDB's empty-string dates. */
export const yearOf = (date?: string): string =>
  date && date.length >= 4 ? date.slice(0, 4) : '—'

/** "2024-03-15" → "15 Mar 2024" */
export function formatDate(date?: string): string {
  if (!date) return 'Unknown'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return 'Unknown'
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** TMDB's 0–10 float → 0–100 integer for the ring badge. */
export const toPercent = (voteAverage: number): number =>
  Math.round(voteAverage * 10)

/** TMDB-style ring colours: green / yellow / red. */
export function scoreColor(percent: number): string {
  if (percent >= 70) return '#21d07a'
  if (percent >= 40) return '#d2d531'
  return '#db2360'
}

/** Joins Tailwind classes, dropping falsy values. Lets us write cn('base', isActive && 'ring-2') */
export const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ')