// src/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode
  featured?: boolean
  surface?: 'light' | 'dark'
  className?: string
}

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export function Card({ children, featured = false, surface = 'light', className = '' }: CardProps) {
  const surfaceClass = surface === 'light' ? 'bg-white border-line text-ink' : 'bg-navy-card border-[#23367A] text-white'
  return (
    <div className={`border p-5 ${surfaceClass} ${className}`} style={featured ? CHAMFER_STYLE : undefined}>
      {children}
    </div>
  )
}
