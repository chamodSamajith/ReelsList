import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getPopular, getTrending, searchMovies } from '../lib/tmdb'
import { useDebounce } from '../hooks/useDebounce'
import { MovieCard } from '../components/MovieCard'
import { MovieGridSkeleton } from '../components/Skeleton'
import { SearchBar } from '../components/SearchBar'

export default function Discover() {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query)
  const isSearching = debounced.trim().length > 0

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['movies', debounced],
    queryFn: () => (isSearching ? searchMovies(debounced) : getPopular()),
    placeholderData: keepPreviousData,
  })

  const trending = useQuery({
    queryKey: ['trending'],
    queryFn: getTrending,
    enabled: !isSearching,
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-navy to-brand-teal/70">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">Welcome.</h1>
          <p className="text-lg sm:text-2xl font-semibold text-white/90 mt-1 mb-6">
            Millions of movies to discover. Build your watchlist.
          </p>
          <SearchBar value={query} onChange={setQuery} className="max-w-3xl" />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Trending row — hidden while searching */}
        {!isSearching && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Trending This Week</h2>
            {trending.isLoading ? (
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="w-40 shrink-0 aspect-[2/3] rounded-lg bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4">
                {trending.data?.results.map((m) => (
                  <div key={m.id} className="w-40 shrink-0">
                    <MovieCard movie={m} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Main grid */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {isSearching ? `Results for “${debounced}”` : 'Popular Right Now'}
            </h2>
            {isFetching && !isLoading && (
              <span className="text-xs text-brand-teal animate-pulse">updating…</span>
            )}
          </div>

          {isError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-300 text-sm">
              {(error as Error).message}
            </div>
          )}

          {isLoading ? (
            <MovieGridSkeleton />
          ) : data && data.results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-8">
              {data.results.map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>
          ) : (
            <p className="text-slate-400 py-12 text-center">
              No movies found for “{debounced}”. Try a different search.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}