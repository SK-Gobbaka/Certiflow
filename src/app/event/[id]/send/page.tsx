'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PDFDocument, rgb } from 'pdf-lib'
import { useStore } from '../../../../lib/store'
import { createMimeMessage } from '../../../../lib/email'
import { embedSelectedFont } from '../../../../lib/fonts'

export default function SendPage() {
  const router = useRouter()
  const params = useParams() || {}
  const id = Array.isArray(params.id) ? params.id[0] : params.id || ''
  const { getEvent, token, setToken } = useStore()
  const ev = getEvent(id)

  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sentCount, setSentCount] = useState(0)
  const [failedList, setFailedList] = useState<{ email: string; error: string }[]>([])
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!ev) return null

  const validParticipants = (ev.participants || []).filter((p) => p.status === 'valid')

  async function startSending() {
    if (!token) {
      setError("Please sign in with Google using the TopBar first.")
      return
    }

    setSending(true)
    setProgress(0)
    setSentCount(0)
    setFailedList([])
    setError(null)

    try {
      // Parse template image type
      const isPng = ev?.template?.startsWith('data:image/png')
      const isJpg = ev?.template?.startsWith('data:image/jpeg') || ev?.template?.startsWith('data:image/jpg')
      
      if (!isPng && !isJpg) {
        throw new Error("Unsupported image format. Please use a PNG or JPG template.")
      }

      const res = await fetch(ev!.template!)
      const imageBytes = await res.arrayBuffer()
      
      for (let i = 0; i < validParticipants.length; i++) {
        const participant = validParticipants[i]
        
        try {
          // Generate PDF for this participant
          const pdfDoc = await PDFDocument.create()
          const font = await embedSelectedFont(pdfDoc, ev!.templateFont || 'Helvetica-Bold')
          
          const img = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes)
          const { width, height } = img.scale(1)
          const page = pdfDoc.addPage([width, height])
          
          page.drawImage(img, { x: 0, y: 0, width, height })
          
          const fontSize = Math.max(24, height * 0.08)
          const textWidth = font.widthOfTextAtSize(participant.name, fontSize)
          
          page.drawText(participant.name, {
            x: (width - textWidth) / 2,
            y: height / 2 - fontSize / 3,
            size: fontSize,
            font: font,
            color: rgb(0.15, 0.15, 0.15),
          })
          
          const pdfBytes = await pdfDoc.save()

          // Construct email
          const personalizedBody = (ev!.emailBody || '')
            .replace(/{{name}}/g, participant.name)
            .replace(/{{email}}/g, participant.email)
            .replace(/{{role}}/g, participant.role || '');

          const rawMsg = createMimeMessage(
            participant.email,
            ev!.emailSubject || `Your Certificate for ${ev!.name}`,
            personalizedBody,
            pdfBytes,
            `${participant.name.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`
          );

          // Send via Gmail API
          const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ raw: rawMsg })
          });

          if (!gmailRes.ok) {
            if (gmailRes.status === 401) {
              setToken(null);
              throw new Error("Your session has expired. Please sign in again.");
            }
            const errorText = await gmailRes.text();
            console.error("Gmail API Error:", errorText);
            let parsedError = "Unknown error";
            try {
              const parsed = JSON.parse(errorText);
              parsedError = parsed.error?.message || errorText;
            } catch(e) {
              parsedError = errorText;
            }
            throw new Error(`Gmail API Error: ${parsedError}`);
          }

          setSentCount((prev) => prev + 1)
        } catch (err: any) {
          if (err.message === "Your session has expired. Please sign in again.") {
            throw err
          }
          console.error(`Failed to send to ${participant.email}:`, err)
          setFailedList((prev) => [...prev, { email: participant.email, error: err.message || String(err) }])
        }

        setProgress(Math.round(((i + 1) / validParticipants.length) * 100))
        
        // Controlled delay to stay well within Gmail API limits (max 2.5 emails/sec)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setCompleted(true)
    } catch (err: any) {
      console.error(err)
      setError(`Error sending emails: ${err.message || String(err)}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Send Emails</h2>
      <p className="mt-1 text-muted">
        Almost done! You're about to send {validParticipants.length} emails with certificates attached.
      </p>

      <div className="mt-8 rounded-lg border border-line bg-paper p-8 text-center">
        {!sending && !completed && (
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-page text-muted shadow-sm mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">Ready to dispatch</h3>
            <p className="text-muted mb-6 text-sm max-w-sm mx-auto">
              This will send emails to all valid participants. Ensure you have reviewed the template before proceeding.
            </p>

            {error && (
              <div className="mb-6 rounded-md bg-warn-soft p-4 text-sm text-warn">
                {error}
              </div>
            )}

            {!token ? (
              <div className="mb-4 text-sm text-warn font-medium">
                You must sign in with Google (using the button in the top bar) to send emails.
              </div>
            ) : (
              <button
                onClick={startSending}
                className="rounded-md bg-ink px-6 py-3 text-base font-semibold text-white hover:brightness-125 shadow-sm"
              >
                Send {validParticipants.length} Emails
              </button>
            )}
          </div>
        )}

        {(sending || completed) && (
          <div className="w-full max-w-2xl mx-auto py-6 text-left">
            <div className="mb-6 rounded-lg border border-line bg-page p-6 shadow-sm">
              <h3 className="text-lg font-bold text-ink mb-4">{completed ? 'Batch Process Finished' : 'Sending Emails...'}</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="rounded border border-line p-3">
                  <div className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Total</div>
                  <div className="text-xl font-bold text-ink">{validParticipants.length}</div>
                </div>
                <div className="rounded border border-line p-3">
                  <div className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Sent</div>
                  <div className="text-xl font-bold text-ok">{sentCount}</div>
                </div>
                <div className="rounded border border-line p-3">
                  <div className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Failed</div>
                  <div className="text-xl font-bold text-warn">{failedList.length}</div>
                </div>
                <div className="rounded border border-line p-3">
                  <div className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Remaining</div>
                  <div className="text-xl font-bold text-ink">{Math.max(0, validParticipants.length - (sentCount + failedList.length))}</div>
                </div>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">
                  {completed ? 'Complete' : `Processing ${sentCount + failedList.length} of ${validParticipants.length}`}
                </span>
                <span className="text-sm font-medium text-ink">{progress}%</span>
              </div>
              <div className="w-full bg-paper rounded-full h-2.5 border border-line overflow-hidden">
                <div className="bg-seal h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              {!completed && (
                <p className="text-xs text-muted mt-4 text-center">
                  Please do not close this tab. Processing emails via your Gmail account.
                </p>
              )}
            </div>

            {failedList.length > 0 && (
              <div className="mb-6 rounded-lg border border-warn bg-warn-soft p-4">
                <h4 className="text-sm font-bold text-warn mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  {failedList.length} Failed Emails
                </h4>
                <ul className="text-sm text-warn space-y-1 max-h-40 overflow-y-auto">
                  {failedList.map((f, i) => (
                    <li key={i}>
                      <strong>{f.email}:</strong> {f.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {completed && (
              <div className="text-center mt-8">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 shadow-sm ${failedList.length === 0 ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'}`}>
                  {failedList.length === 0 ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  )}
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  {failedList.length === 0 ? 'All Emails Sent Successfully!' : 'Batch Completed with Errors'}
                </h3>
                <p className="text-muted mb-6 text-sm max-w-sm mx-auto">
                  {failedList.length === 0 
                    ? `All ${sentCount} participants have been emailed their certificates.` 
                    : `Successfully sent ${sentCount} emails, but ${failedList.length} failed. Check the error log above.`}
                </p>
                
                <button
                  onClick={() => router.push('/')}
                  className="rounded-md bg-seal px-6 py-3 text-base font-semibold text-white hover:brightness-110 shadow-sm"
                >
                  Return to Events
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!completed && (
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => router.push(`/event/${id}/generate`)}
            disabled={sending}
            className="rounded-md border border-line px-5 py-2.5 text-sm font-medium hover:border-ink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
        </div>
      )}
    </div>
  )
}
