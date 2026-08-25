import { scoreColor, toPercent } from '../utils/format'

interface ScoreRingProps {
  voteAverage: number
  size?: number
}

export function ScoreRing({ voteAverage, size = 38 }: ScoreRingProps) {
  const percent = toPercent(voteAverage)
  const color = scoreColor(percent)
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div
      className="relative rounded-full bg-brand-navy p-[3px] shadow-lg"
      style={{ width: size, height: size }}
      title={`User score: ${percent}%`}
    >
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r={radius} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={3} />
        <circle
          cx="18" cy="18" r={radius} fill="none"
          stroke={color} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-white">
        {percent === 0 ? 'NR' : percent}
        {percent > 0 && <sup className="text-[6px]">%</sup>}
      </span>
    </div>
  )
}