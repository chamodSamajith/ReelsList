import { useQuery } from '@tanstack/react-query'
import { getProviders, imageUrl } from '../lib/tmdb'
import type { Provider } from '../types'

const REGION = 'AU'

function ProviderRow({ label, providers, accent }: { label: string; providers: Provider[]; accent: string }) {
  if (providers.length === 0) return null
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-[11px] font-semibold ${accent}`}>{label}</span>
      {providers.map((p) => {
        const logo = imageUrl(p.logo_path, 'w45')
        return logo ? (
          <img
            key={p.provider_id}
            src={logo}
            alt={p.provider_name}
            title={p.provider_name}
            className="w-7 h-7 rounded-md ring-1 ring-white/20"
          />
        ) : null
      })}
    </div>
  )
}

export function ProviderPanel({ movieId }: { movieId: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['providers', movieId],
    queryFn: () => getProviders(movieId),
    staleTime: 1000 * 60 * 60 * 24,
  })

  if (isLoading) {
    return <div className="h-7 w-40 rounded bg-white/10 animate-pulse" />
  }
  if (isError) return null

  const region = data?.results?.[REGION]
  const free = [...(region?.free ?? []), ...(region?.ads ?? [])]
  const flatrate = region?.flatrate ?? []
  const rent = region?.rent ?? []

  const hasAny = free.length + flatrate.length + rent.length > 0

  return (
    <div className="pt-3 border-t border-white/10 space-y-2">
      {!hasAny ? (
        <p className="text-xs text-slate-500">Not currently streaming in {REGION}.</p>
      ) : (
        <>
          <ProviderRow label="Free" providers={free} accent="text-brand-green" />
          <ProviderRow label="Stream" providers={flatrate} accent="text-brand-teal" />
          <ProviderRow label="Rent" providers={rent} accent="text-slate-400" />

          {region?.link && (
            <a
              href={region.link}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-1 text-[11px] font-bold text-brand-navy bg-gradient-to-r from-brand-lime to-brand-teal rounded-full px-4 py-1.5 hover:opacity-90 transition"
            >
              Watch now
            </a>
          )}
        </>
      )}
      <p className="text-[10px] text-slate-600">Streaming data by JustWatch</p>
    </div>
  )
}
