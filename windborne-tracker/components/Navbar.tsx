'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <svg className="w-10 h-10" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 8 L20 32 M8 20 L32 20 M12 12 L28 28 M28 12 L12 28" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="text-xl font-semibold">WindBorne</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">HOME</Link>
            <Link href="/tracker" className="text-gray-900 font-medium">TRACKER</Link>
            <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium">PRODUCTS</Link>
            <Link href="/resources" className="text-gray-600 hover:text-gray-900 font-medium">RESOURCES</Link>
            <Link href="/company" className="text-gray-600 hover:text-gray-900 font-medium">COMPANY</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">CONTACT</Link>
          </div>

          {/* Sign In Button */}
          <div className="hidden md:block">
            <button className="bg-gray-900 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors">
              SIGN IN
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50">HOME</Link>
            <Link href="/tracker" className="block px-3 py-2 rounded-md text-gray-900 bg-gray-50">TRACKER</Link>
            <Link href="/products" className="block px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50">PRODUCTS</Link>
            <Link href="/resources" className="block px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50">RESOURCES</Link>
            <Link href="/company" className="block px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50">COMPANY</Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50">CONTACT</Link>
            <button className="w-full text-left px-3 py-2 rounded-md bg-gray-900 text-white">SIGN IN</button>
          </div>
        </div>
      )}
    </nav>
  )
}