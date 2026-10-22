import type { Metadata } from 'next'
import { Providers } from './Providers'
import TopBar from '../components/TopBar'
import '../index.css'

export const metadata: Metadata = {
  title: 'CertiFlow',
  description: 'Generate and send certificates easily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;700&family=Cormorant+Garamond:wght@700&family=Dancing+Script:wght@700&family=Great+Vibes&family=Montserrat:wght@400;700&family=Playfair+Display:wght@400;700&family=Poppins:wght@400;700&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div className="min-h-full flex flex-col">
            <TopBar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
