'use client'

import { useStore } from '../lib/store'
import EventsPage from '../views/EventsPage'
import LandingPage from '../views/LandingPage'

export default function Home() {
  const { token } = useStore()
  return token ? <EventsPage /> : <LandingPage />
}
