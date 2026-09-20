import { Navigate, Route, Routes } from 'react-router-dom'
import TopBar from './components/TopBar'
import LandingPage from './pages/LandingPage'
import EventsPage from './pages/EventsPage'
import EventShell from './pages/EventShell'
import ParticipantsPage from './pages/ParticipantsPage'
import CertificatePage from './pages/CertificatePage'
import EmailPage from './pages/EmailPage'
import ReviewPage from './pages/ReviewPage'
import GeneratePage from './pages/GeneratePage'
import SendPage from './pages/SendPage'
import { useStore } from './lib/store'

export default function App() {
  const { token } = useStore()

  return (
    <div className="min-h-full flex flex-col">
      <TopBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={token ? <EventsPage /> : <LandingPage />} />
          <Route path="/event/:id" element={token ? <EventShell /> : <Navigate to="/" replace />}>
            <Route index element={<Navigate to="participants" replace />} />
            <Route path="participants" element={<ParticipantsPage />} />
            <Route path="certificate" element={<CertificatePage />} />
            <Route path="email" element={<EmailPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="generate" element={<GeneratePage />} />
            <Route path="send" element={<SendPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
