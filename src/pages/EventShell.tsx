import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'

const STEPS = [
  { to: 'participants', label: 'Participants' },
  { to: 'certificate', label: 'Certificate' },
  { to: 'email', label: 'Email' },
  { to: 'review', label: 'Review' },
  { to: 'generate', label: 'Generate' },
  { to: 'send', label: 'Send' },
]

export default function EventShell() {
  const { id = '' } = useParams()
  const { getEvent } = useStore()
  const ev = getEvent(id)

  if (!ev) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="font-display text-2xl font-bold">Event not found</h1>
        <p className="mt-2 text-muted">It may have been deleted, or it was created in a different browser.</p>
        <Link to="/" className="mt-4 inline-block font-medium text-seal underline">
          Back to your events
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[13rem_1fr]">
      <aside>
        <Link to="/" className="text-sm text-muted hover:text-ink">
          All events
        </Link>
        <h1 className="mt-2 font-display text-xl font-bold leading-tight">{ev.name}</h1>
        <nav aria-label="Steps" className="mt-6">
          <ol className="space-y-1">
            {STEPS.map((s, i) => (
              <li key={s.to}>
                <NavLink
                  to={s.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium ${
                      isActive ? 'bg-ink text-white' : 'text-muted hover:bg-paper hover:text-ink'
                    }`
                  }
                >
                  <span className="grid size-5 place-items-center rounded-full border border-current text-[11px]">{i + 1}</span>
                  {s.label}
                </NavLink>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
