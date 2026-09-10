// src/components/ui/LevelBadge.tsx
import { Star } from './Star'

interface LevelBadgeProps {
  level: number
  total: number
  label: string
  className?: string
}

export function LevelBadge({ level, total, label, className = '' }: LevelBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 font-display font-semibold text-sm text-navy ${className}`}>
      <span>Lv.{level}</span>
      {Array.from({ length: total }, (_, i) => (
        <Star
          key={i}
          variant={i < level ? 'filled' : 'outline'}
          className={i < level ? 'w-4 h-4 text-first-light' : 'w-4 h-4 text-mist'}
        />
      ))}
      <span>{label}</span>
    </div>
  )
}
