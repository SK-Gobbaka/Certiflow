'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStore } from '../../../../lib/store'

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams() || {}
  const id = Array.isArray(params.id) ? params.id[0] : params.id || ''
  const { getEvent } = useStore()
  const ev = getEvent(id)

  if (!ev) return null

  const list = ev.participants || []
  const validCount = list.filter((p) => p.status === 'valid').length
  const invalidCount = list.length - validCount

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Review & Generate</h2>
      <p className="mt-1 text-muted">
        Review your event details before generating certificates and sending emails.
      </p>

      <div className="mt-6 space-y-6">
        <div className="rounded-lg border border-line bg-paper p-6">
          <h3 className="text-lg font-bold text-ink mb-4">Event Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">Event Name</dt>
              <dd className="font-medium text-ink mt-1">{ev.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Date</dt>
              <dd className="font-medium text-ink mt-1">{ev.date}</dd>
            </div>
            <div>
              <dt className="text-muted">Organizer</dt>
              <dd className="font-medium text-ink mt-1">{ev.organizer}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-line bg-paper p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink">Participants</h3>
            <button onClick={() => router.push(`/event/${id}/participants`)} className="text-seal text-sm font-medium hover:underline">
              Edit
            </button>
          </div>
          <div className="text-sm">
            <span className="font-medium text-ink">{validCount}</span> ready to receive certificates.
            {invalidCount > 0 && <span className="text-warn ml-2">({invalidCount} skipped)</span>}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-paper p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink">Certificate Template</h3>
            <button onClick={() => router.push(`/event/${id}/certificate`)} className="text-seal text-sm font-medium hover:underline">
              Edit
            </button>
          </div>
          <div className="text-sm">
            {ev.template ? (
              <span className="font-medium text-ok">Template uploaded successfully</span>
            ) : (
              <span className="font-medium text-warn">No template uploaded</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-paper p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink">Email Details</h3>
            <button onClick={() => router.push(`/event/${id}/email`)} className="text-seal text-sm font-medium hover:underline">
              Edit
            </button>
          </div>
          <div className="text-sm space-y-3">
            <div>
              <span className="text-muted block">Subject</span>
              <span className="font-medium text-ink mt-1">{ev.emailSubject || 'Your Certificate for ' + ev.name}</span>
            </div>
            <div>
               <span className="text-muted block">Body Preview</span>
               <div className="mt-2 p-3 bg-page rounded-md text-ink whitespace-pre-wrap border border-line">
                 {ev.emailBody || `Hi {{name}},\n\nThank you for participating in ${ev.name}!\n\nPlease find your certificate attached.\n\nBest regards,\n${ev.organizer}`}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => router.push(`/event/${id}/email`)}
          className="rounded-md border border-line px-5 py-2.5 text-sm font-medium hover:border-ink"
        >
          Back
        </button>
        <button
          onClick={() => router.push(`/event/${id}/generate`)}
          disabled={validCount === 0 || !ev.template}
          className="rounded-md bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate & Send Certificates
        </button>
      </div>
    </div>
  )
}
