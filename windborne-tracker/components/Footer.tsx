import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <svg className="w-8 h-8" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 8 L20 32 M8 20 L32 20 M12 12 L28 28 M28 12 L12 28" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="text-lg font-semibold">WindBorne</span>
          </div>

          {/* Links */}
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm">Terms</Link>
            <Link href="/api" className="text-gray-400 hover:text-white text-sm">API</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link>
          </div>

          {/* Last Update */}
          <div className="text-gray-400 text-sm">
            <span id="last-update">Last update: --</span>
          </div>
        </div>
      </div>
    </footer>
  )
}