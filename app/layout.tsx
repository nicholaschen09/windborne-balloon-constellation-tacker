import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WindBorne - Real Data + AI | Live Balloon Tracker',
  description: 'Real-time atmospheric monitoring with weather correlation'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
