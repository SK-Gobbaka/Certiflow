import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'

const field =
  'w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink'

export default function EventsPage() {
  const { events, createEvent, deleteEvent } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(events.length === 0)
  const [form, setForm] = useState({ name: '', date: '', organizer: '', description: '' })

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    const id = createEvent({ ...form, name: form.name.trim() })
    navigate(`/event/${id}/participants`)
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Your events</h1>
          <p className="mt-1 text-muted">Pick an event to continue, or start a new one.</p>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-md bg-seal px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            Create event
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={submit} className="mt-8 grid gap-4 rounded-lg border border-line bg-paper p-6 md:grid-cols-2">
          <label className="text-sm font-medium md:col-span-2">
            Event name
            <input className={`${field} mt-1`} value={form.name} onChange={set('name')} placeholder="College Tech Fest 2026" required autoFocus />
          </label>
          <label className="text-sm font-medium">
            Event date
            <input type="date" className={`${field} mt-1`} value={form.date} onChange={set('date')} />
          </label>
          <label className="text-sm font-medium">
            College or organizer
            <input className={`${field} mt-1`} value={form.organizer} onChange={set('organizer')} placeholder="SPEC E-Cell" />
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Description
            <textarea className={`${field} mt-1 min-h-20`} value={form.description} onChange={set('description')} />
          </label>
          <div className="flex gap-3 md:col-span-2">
            <button className="rounded-md bg-seal px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
              Create event and add participants
            </button>
            {events.length > 0 && (
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-muted hover:text-ink">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {events.length > 0 && (
        <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-paper">
          {events.map((ev) => {
            const valid = ev.participants.filter((p) => p.status === 'valid').length
            return (
              <li key={ev.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <Link to={`/event/${ev.id}`} className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg font-bold">{ev.name}</div>
                  <div className="text-sm text-muted">
                    {[ev.organizer, ev.date].filter(Boolean).join(', ') || 'No details yet'}
                    {' · '}
                    {ev.participants.length ? `${valid} valid participants` : 'No participants yet'}
                  </div>
                </Link>
                <button
                  onClick={() => confirm(`Delete "${ev.name}"? This cannot be undone.`) && deleteEvent(ev.id)}
                  className="text-sm font-medium text-muted hover:text-seal"
                >
                  Delete
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
