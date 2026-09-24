'use client'

import Link from 'next/link'
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import { useStore } from '../lib/store'

export default function TopBar() {
  const { token, setToken } = useStore()

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/gmail.send',
    onSuccess: (codeResponse) => setToken(codeResponse.access_token),
    onError: (error) => console.log('Login Failed:', error)
  })

  const logout = () => {
    googleLogout()
    setToken(null)
  }

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="CertiFlow Logo" className="h-8 w-auto" />
        </Link>
        <div>
          {token ? (
            <button onClick={() => logout()} className="text-sm font-medium text-muted hover:text-ink">
              Sign Out
            </button>
          ) : (
            <button onClick={() => login()} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:brightness-125 shadow-sm">
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
