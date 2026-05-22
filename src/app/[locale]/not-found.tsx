import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-black text-dawn-gold mb-4">404</h1>
        <p className="text-horizon text-lg mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-2 bg-royal-blue hover:bg-electric text-white font-bold rounded transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
