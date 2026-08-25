import { useState } from 'react'
import { imageUrl } from '../lib/tmdb'
import { useWatchlist, useStatusCounts } from '../store/watchlist'
import { ProviderPanel } from '../components/ProviderPanel'
import { cn, formatDate, yearOf } from '../utils/format'
import type { WatchStatus } from '../types'

const STATUS_META: Record<WatchStatus, { label: string; color: string }> = {
  'to-watch': { label: 'To Watch', color: 'bg-brand-teal text-brand-navy' },
  watched: { label: 'Watched', color: 'bg-brand-green text-brand-navy' },
  skip: { label: "Don't Watch", color: 'bg-rose-500 text-white' },
}

const STATUSES = Object.keys(STATUS_META) as WatchStatus[]

export default function Watchlist() {
  const entries = useWatchlist((s) => s.entries)
  const update = useWatchlist((s) => s.update)
  const remove = useWatchlist((s) => s.remove)
  const counts = useStatusCounts()
  const [filter, setFilter] = useState<WatchStatus | 'all'>('all')

  const visible = filter === 'all' ? entries : entries.filter((e) => e.status === filter)

  if (entries.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="text-5xl mb-4">🍿</p>
        <h2 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
        <p className="text-slate-400">Head to Discover and hit the + on any poster.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-1">My Watchlist</h1>
      <p className="text-sm text-slate-400 mb-6">{entries.length} movies saved</p>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setFilter('all')}
          className={cn('px-4 py-1.5 rounded-full text-xs font-semibold transition',
            filter === 'all' ? 'bg-white text-brand-navy' : 'bg-white/10 text-slate-300 hover:bg-white/20')}
        >
          All ({entries.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn('px-4 py-1.5 rounded-full text-xs font-semibold transition',
              filter === s ? STATUS_META[s].color : 'bg-white/10 text-slate-300 hover:bg-white/20')}
          >
            {STATUS_META[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.map((e) => {
          const poster = imageUrl(e.posterPath, 'w185')
          return (
            <article key={e.movieId} className="flex gap-4 sm:gap-5 rounded-xl bg-white/5 border border-white/10 p-4">
              {poster ? (
                <img src={poster} alt={e.title} className="w-24 sm:w-28 rounded-lg shrink-0 self-start" />
              ) : (
                <div className="w-24 sm:w-28 aspect-[2/3] rounded-lg bg-slate-800 shrink-0" />
              )}

              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white leading-tight">
                      {e.title} <span className="font-normal text-slate-400">({yearOf(e.releaseDate)})</span>
                    </h3>
                    <p className="text-xs text-slate-500">Added {formatDate(e.addedAt)}</p>
                  </div>
                  <button
                    onClick={() => remove(e.movieId)}
                    className="text-xs text-slate-500 hover:text-rose-400 transition shrink-0 h-fit"
                  >
                    Remove
                  </button>
                </div>

                {/* Status */}
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => update(e.movieId, { status: s })}
                      className={cn('px-3 py-1 rounded-full text-[11px] font-semibold transition',
                        e.status === s ? STATUS_META[s].color : 'bg-white/10 text-slate-400 hover:bg-white/20')}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 mr-1">My rating</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => update(e.movieId, { myRating: e.myRating === n ? null : n })}
                      aria-label={`Rate ${n} of 5`}
                      className={cn('text-lg leading-none transition hover:scale-125',
                        (e.myRating ?? 0) >= n ? 'text-amber-400' : 'text-slate-700')}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  value={e.note}
                  onChange={(ev) => update(e.movieId, { note: ev.target.value })}
                  placeholder="Add a private note…"
                  rows={2}
                  className="w-full rounded-lg bg-brand-navy/60 border border-white/10 p-2.5 text-sm text-white
                             placeholder:text-slate-600 outline-none focus:border-brand-teal resize-none transition"
                />

                <ProviderPanel movieId={e.movieId} />
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}