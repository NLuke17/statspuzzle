import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sliding Puzzle Experiment',
  description: 'A statistics experiment on sliding puzzle solve times',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


