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
