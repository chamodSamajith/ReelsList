export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-[2/3] rounded-lg bg-slate-800" />
      <div className="pt-6 pl-2 space-y-2">
        <div className="h-3 bg-slate-800 rounded w-4/5" />
        <div className="h-2.5 bg-slate-800 rounded w-1/3" />
      </div>
    </div>
  )
}

export function MovieGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-8">
      {Array.from({ length: count }, (_, i) => <MovieCardSkeleton key={i} />)}
    </div>
  )
}