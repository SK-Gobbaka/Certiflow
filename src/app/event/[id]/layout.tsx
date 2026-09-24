'use client'

import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useStore } from '../../../lib/store'

const STEPS = [
  { to: 'participants', label: 'Participants' },
  { to: 'certificate', label: 'Certificate' },
  { to: 'email', label: 'Email' },
  { to: 'review', label: 'Review' },
  { to: 'generate', label: 'Generate' },
  { to: 'send', label: 'Send' },
]

export default function EventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams() || {}
  const id = Array.isArray(params.id) ? params.id[0] : params.id || ''
  const pathname = usePathname() || ''
  const { getEvent, token } = useStore()
  const ev = getEvent(id)
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.replace('/')
    }
  }, [token, router])

  if (!token) return null


  if (!ev) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="font-display text-2xl font-bold">Event not found</h1>
        <p className="mt-2 text-muted">It may have been deleted, or it was created in a different browser.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-seal underline">
          Back to your events
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[13rem_1fr]">
      <aside>
        <Link href="/" className="text-sm text-muted hover:text-ink">
          All events
        </Link>
        <h1 className="mt-2 font-display text-xl font-bold leading-tight">{ev.name}</h1>
        <nav aria-label="Steps" className="mt-6">
          <ol className="space-y-1">
            {STEPS.map((s, i) => {
              const href = `/event/${id}/${s.to}`
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <li key={s.to}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium ${
                      isActive ? 'bg-ink text-white' : 'text-muted hover:bg-paper hover:text-ink'
                    }`}
                  >
                    <span className="grid size-5 place-items-center rounded-full border border-current text-[11px]">{i + 1}</span>
                    {s.label}
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>
      </aside>
      <section className="min-w-0">
        {children}
      </section>
    </div>
  )
}
