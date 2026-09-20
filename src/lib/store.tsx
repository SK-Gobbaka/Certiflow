import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CertEvent } from '../types'

const KEY = 'certiflow:events:v1'

interface Store {
  events: CertEvent[]
  createEvent: (e: Omit<CertEvent, 'id' | 'createdAt' | 'participants' | 'columns'>) => string
  updateEvent: (id: string, patch: Partial<CertEvent>) => void
  deleteEvent: (id: string) => void
  getEvent: (id: string) => CertEvent | undefined
  token: string | null
  setToken: (token: string | null) => void
}

const Ctx = createContext<Store | null>(null)

function load(): CertEvent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CertEvent[]>(load)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(events))
    } catch {
      /* storage full or unavailable: keep working in memory */
    }
  }, [events])

  const createEvent: Store['createEvent'] = useCallback((e) => {
    const id = crypto.randomUUID()
    setEvents((prev) => [{ ...e, id, createdAt: Date.now(), participants: [], columns: [] }, ...prev])
    return id
  }, [])

  const updateEvent: Store['updateEvent'] = useCallback((id, patch) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)))
  }, [])

  const deleteEvent: Store['deleteEvent'] = useCallback((id) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id))
  }, [])

  const value = useMemo<Store>(
    () => ({ events, createEvent, updateEvent, deleteEvent, getEvent: (id) => events.find((e) => e.id === id), token, setToken }),
    [events, createEvent, updateEvent, deleteEvent, token],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used inside StoreProvider')
  return v
}
