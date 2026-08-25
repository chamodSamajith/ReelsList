import { cn } from '../utils/format'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search for a movie…', className }: SearchBarProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full bg-white/95 pl-6 pr-28 py-3.5 text-sm text-brand-navy
                   placeholder:text-slate-400 outline-none
                   focus:ring-4 focus:ring-brand-teal/40 transition"
      />
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-6 py-2.5
                       text-sm font-semibold text-white
                       bg-gradient-to-r from-brand-lime to-brand-teal select-none">
        Search
      </span>
    </div>
  )
}