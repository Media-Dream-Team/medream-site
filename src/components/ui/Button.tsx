// src/components/ui/Button.tsx
import Link from 'next/link'
import { Star } from './Star'

type Variant = 'primary' | 'secondary' | 'text'
type Surface = 'light' | 'dark'

interface ButtonProps {
  href: string
  variant?: Variant
  surface?: Surface
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

const ARROW_PATH = 'M2 7h9.2L7.6 3.4 9 2l6 6-6 6-1.4-1.4L11.2 9H2z'

const baseClass =
  'inline-flex items-center gap-2 font-display font-semibold text-[15px] leading-none transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-sky focus-visible:outline-offset-[3px]'

export function Button({ href, variant = 'primary', surface = 'light', onClick, children, className = '' }: ButtonProps) {
  if (variant === 'primary') {
    const surfaceClass =
      surface === 'light' ? 'bg-blue text-white hover:bg-navy' : 'bg-first-light text-navy hover:bg-dawn'
    return (
      <Link href={href} onClick={onClick} style={CHAMFER_STYLE} className={`${baseClass} px-[22px] py-[13px] ${surfaceClass} ${className}`}>
        <Star className="w-[0.9em] h-[0.9em]" />
        {children}
      </Link>
    )
  }

  if (variant === 'secondary') {
    const surfaceClass =
      surface === 'light'
        ? 'text-navy border-navy hover:bg-navy hover:text-white'
        : 'text-white border-white/75 hover:bg-white hover:text-navy'
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`${baseClass} px-[22px] py-[13px] bg-transparent border-[1.5px] ${surfaceClass} ${className}`}
      >
        {children}
        <svg viewBox="0 0 16 16" className="w-[0.9em] h-[0.9em]" fill="currentColor" aria-hidden="true">
          <path d={ARROW_PATH} />
        </svg>
      </Link>
    )
  }

  // variant === 'text'
  const surfaceClass = surface === 'light' ? 'text-navy' : 'text-white'
  return (
    <Link href={href} onClick={onClick} className={`group relative ${baseClass} py-2 hover:translate-y-0 ${surfaceClass} ${className}`}>
      {children}
      <svg viewBox="0 0 16 16" className="w-[0.9em] h-[0.9em]" fill="currentColor" aria-hidden="true">
        <path d={ARROW_PATH} />
      </svg>
      <span className="absolute left-0 bottom-0.5 h-0.5 w-full origin-left scale-x-[.35] bg-current transition-transform duration-[250ms] ease-out group-hover:scale-x-100" />
    </Link>
  )
}
