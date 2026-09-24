'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { StoreProvider } from '../lib/store'

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'MISSING_CLIENT_ID'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <StoreProvider>
        {children}
      </StoreProvider>
    </GoogleOAuthProvider>
  )
}
