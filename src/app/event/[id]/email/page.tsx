'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStore } from '../../../../lib/store'

export default function EmailPage() {
  const router = useRouter()
  const params = useParams() || {}
  const id = Array.isArray(params.id) ? params.id[0] : params.id || ''
  const { getEvent, updateEvent } = useStore()
  const ev = getEvent(id)

  if (!ev) return null

  const subject = ev.emailSubject ?? 'Your Certificate for ' + ev.name
  const body = ev.emailBody ?? `Hi {{name}},\n\nThank you for participating in ${ev.name}!\n\nPlease find your certificate attached.\n\nBest regards,\n${ev.organizer}`

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Email Template</h2>
      <p className="mt-1 text-muted">
        Customize the email that will be sent to participants along with their certificate. Use placeholders like <code>{'{{name}}'}</code>, <code>{'{{email}}'}</code>, or <code>{'{{role}}'}</code> to personalize the message.
      </p>

      <div className="mt-6 flex flex-col gap-5 rounded-lg border border-line bg-paper p-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-ink">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => updateEvent(id, { emailSubject: e.target.value })}
            className="mt-2 w-full rounded-md border border-line bg-page px-4 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
            placeholder="e.g. Your Certificate is here!"
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-semibold text-ink">
            Message Body
          </label>
          <textarea
            id="body"
            rows={8}
            value={body}
            onChange={(e) => updateEvent(id, { emailBody: e.target.value })}
            className="mt-2 w-full resize-y rounded-md border border-line bg-page px-4 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
            placeholder="Type your message here..."
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => router.push(`/event/${id}/certificate`)}
          className="rounded-md border border-line px-5 py-2.5 text-sm font-medium hover:border-ink"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (!ev.emailSubject) updateEvent(id, { emailSubject: subject })
            if (!ev.emailBody) updateEvent(id, { emailBody: body })
            router.push(`/event/${id}/review`)
          }}
          className="rounded-md bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
        >
          Continue to review
        </button>
      </div>
    </div>
  )
}
