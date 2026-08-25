import { imageUrl } from '../lib/tmdb'
import { useWatchlist, useIsInWatchlist } from '../store/watchlist'
import { cn, yearOf } from '../utils/format'
import { ScoreRing } from './ScoreRing'
import type { Movie } from '../types'

export function MovieCard({ movie }: { movie: Movie }) {
  const toggle = useWatchlist((s) => s.toggle)
  const inList = useIsInWatchlist(movie.id)
  const poster = imageUrl(movie.poster_path, 'w342')

  return (
    <div className="group flex flex-col">
      <div className="relative rounded-lg overflow-hidden bg-slate-800 shadow-md
                      transition duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="w-full aspect-[2/3] object-cover"
          />
        ) : (
          <div className="w-full aspect-[2/3] grid place-items-center text-slate-500 text-xs px-2 text-center">
            No poster available
          </div>
        )}

        {/* Overview on hover */}
        <div className="absolute inset-0 bg-brand-navy/95 p-3 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 overflow-hidden hidden sm:block">
          <p className="text-[11px] leading-relaxed text-slate-200 line-clamp-[12]">
            {movie.overview || 'No description available.'}
          </p>
        </div>

        {/* Watchlist button */}
        <button
          onClick={() => toggle(movie)}
          aria-label={inList ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
          className={cn(
            'absolute top-2 right-2 w-8 h-8 rounded-full grid place-items-center text-sm font-bold',
            'backdrop-blur transition duration-200 hover:scale-110',
            inList ? 'bg-brand-green text-brand-navy' : 'bg-brand-navy/80 text-white hover:bg-brand-teal',
          )}
        >
          {inList ? '✓' : '+'}
        </button>
      </div>

      <div className="relative pl-2 pt-5 pb-2">
        <div className="absolute -top-4 left-2">
          <ScoreRing voteAverage={movie.vote_average} />
        </div>
        <h3 className="font-bold text-sm leading-tight text-white line-clamp-2
                       group-hover:text-brand-teal transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{yearOf(movie.release_date)}</p>
      </div>
    </div>
  )
}