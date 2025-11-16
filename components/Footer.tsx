import type { ReactNode } from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M20 8 L20 32 M8 20 L32 20 M12 12 L28 28 M28 12 L12 28" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div>
              <span className="text-lg font-semibold">Nicholas Chen</span>
              <p className="text-xs text-gray-400">Building atmospheric tooling</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <ExternalLink href="https://nicholaschen.me">nicholaschen.me</ExternalLink>
            <ExternalLink href="https://www.linkedin.com/in/nicholaschen">LinkedIn</ExternalLink>
            <ExternalLink href="https://github.com/nicholaschen">GitHub</ExternalLink>
            <ExternalLink href="https://twitter.com/nicholaschen">Twitter</ExternalLink>
          </div>
        </div>
      </div>
    </footer>
  )
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-300 hover:text-white transition-colors"
    >
      {children}
    </a>
  )
}
