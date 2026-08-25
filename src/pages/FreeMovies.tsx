import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { searchArchive, archiveEmbedUrl, archiveThumbUrl } from '../lib/archive'
import { useDebounce } from '../hooks/useDebounce'
import { SearchBar } from '../components/SearchBar'
import type { ArchiveDoc } from '../types'

export default function FreeMovies() {
  const [query, setQuery] = useState('')
  const [playing, setPlaying] = useState<ArchiveDoc | null>(null)
  const debounced = useDebounce(query)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['archive', debounced],
    queryFn: () => searchArchive(debounced),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-1">Free to Watch</h1>
      <p className="text-sm text-slate-400 mb-6">
        {/* Public-domain films from the Internet Archive — free and legal to stream. */}
      </p>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search public-domain films…"
        className="max-w-2xl mb-8"
      />

      {playing && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">{playing.title}</h2>
            <button
              onClick={() => setPlaying(null)}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              ✕ Close player
            </button>
          </div>
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe
              src={archiveEmbedUrl(playing.identifier)}
              title={playing.title}
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-300 text-sm">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {data?.map((doc) => (
            <button
              key={doc.identifier}
              onClick={() => {
                setPlaying(doc)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="group text-left rounded-xl overflow-hidden bg-white/5 border border-white/10
                         hover:border-brand-teal transition"
            >
              <div className="aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={archiveThumbUrl(doc.identifier)}
                  alt={doc.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-brand-teal transition">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{doc.year ?? '—'}</p>
                <span className="inline-block mt-2 text-[11px] font-semibold text-brand-navy
                                 bg-brand-green rounded-full px-3 py-1">
                  ▶ Watch free
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}