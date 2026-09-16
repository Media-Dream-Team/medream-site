import Link from 'next/link'

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 bg-midnight">
      <div className="text-center">
        <h1 className="font-display font-semibold text-white text-6xl mb-4">404</h1>
        <p className="text-mist text-lg mb-8">Page not found</p>
        <Link
          href="/"
          style={CHAMFER_STYLE}
          className="inline-block px-6 py-3 bg-first-light hover:bg-dawn text-navy font-display font-semibold transition-transform duration-200 ease-out hover:-translate-y-0.5"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
