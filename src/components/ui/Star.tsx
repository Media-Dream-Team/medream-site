// src/components/ui/Star.tsx
interface StarProps {
  variant?: 'filled' | 'outline'
  className?: string
}

const STAR_PATH = 'M8 0l1.8 6.2L16 8l-6.2 1.8L8 16l-1.8-6.2L0 8l6.2-1.8z'

export function Star({ variant = 'filled', className = '' }: StarProps) {
  if (variant === 'outline') {
    return (
      <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
        <path d={STAR_PATH} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d={STAR_PATH} />
    </svg>
  )
}
