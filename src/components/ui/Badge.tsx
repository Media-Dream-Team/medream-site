// src/components/ui/Badge.tsx
interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block bg-dawn text-navy font-display font-medium text-xs uppercase tracking-[.1em] px-[10px] py-1 ${className}`}
    >
      {children}
    </span>
  )
}
