import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PDFDocument, rgb } from 'pdf-lib'
import { useStore } from '../lib/store'
import { createMimeMessage } from '../lib/email'
import { embedSelectedFont } from '../lib/fonts'

export default function SendPage() {
  const { id = '' } = useParams()
  const { getEvent, token } = useStore()
  const navigate = useNavigate()
  const ev = getEvent(id)

  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
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

        setProgress(Math.round(((i + 1) / validParticipants.length) * 100))
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

        {sending && (
          <div className="w-full max-w-md mx-auto py-6">
             <div className="flex justify-between mb-2">
               <span className="text-sm font-medium text-ink">Sending real emails...</span>
               <span className="text-sm font-medium text-ink">{progress}%</span>
             </div>
             <div className="w-full bg-page rounded-full h-2.5 border border-line">
               <div className="bg-seal h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
             </div>
             <p className="text-xs text-muted mt-4">Please do not close this tab while emails are being sent via your Gmail account.</p>
          </div>
        )}

        {completed && (
          <div className="py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok-soft text-ok mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Emails Sent Successfully!</h3>
            <p className="text-muted mb-6 text-sm max-w-sm mx-auto">
              All {validParticipants.length} participants have been emailed their certificates directly from your Gmail account. Great job!
            </p>
            
            <button
              onClick={() => navigate('/')}
              className="rounded-md bg-seal px-6 py-3 text-base font-semibold text-white hover:brightness-110 shadow-sm"
            >
              Return to Events
            </button>
          </div>
        )}
      </div>

      {!completed && (
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => navigate('../generate')}
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
