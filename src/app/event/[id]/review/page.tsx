'use client'

import { useRef, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '../../../../lib/store'
import { getDefaultCertificateStyle } from '../../../../lib/certificate'
import { getFontFamilyCss, getFontLabel } from '../../../../lib/fonts'

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams() || {}
  const id = Array.isArray(params.id) ? params.id[0] : params.id || ''
  const { getEvent } = useStore()
  const ev = getEvent(id)
  const previewRef = useRef<HTMLDivElement>(null)
  const [renderedHeight, setRenderedHeight] = useState(250)

  // Track rendered height to scale font size accurately
  useEffect(() => {
    if (!previewRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setRenderedHeight(entry.contentRect.height)
        }
      }
    })
    ro.observe(previewRef.current)
    return () => ro.disconnect()
  }, [ev?.template])

  if (!ev) return null

  const list = ev.participants || []
  const validCount = list.filter((p) => p.status === 'valid').length
  const invalidCount = list.length - validCount

  const certStyle = getDefaultCertificateStyle(ev)
  const fontCss = getFontFamilyCss(certStyle.font)
  const sampleParticipantName = list.find((p) => p.status === 'valid')?.name || 'Participant Name'

  const templateHeight = ev.templateDimensions?.height || 1080
  const previewScale = renderedHeight / templateHeight
  const displayedFontSize = Math.max(10, Math.round(certStyle.fontSize * previewScale))

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
            <h3 className="text-lg font-bold text-ink">Certificate Template & Placeholder</h3>
            <button onClick={() => router.push(`/event/${id}/certificate`)} className="text-seal text-sm font-medium hover:underline">
              Adjust Position & Font
            </button>
          </div>

          {ev.template ? (
            <div className="space-y-4">
              {/* Visual preview thumbnail with live placeholder overlay */}
              <div className="flex justify-center rounded-lg border border-line/60 bg-page p-4">
                <div ref={previewRef} className="relative inline-block overflow-hidden rounded shadow-sm max-w-full">
                  <img
                    src={ev.template}
                    alt="Certificate Template Preview"
                    className="block max-h-[260px] w-auto max-w-full object-contain pointer-events-none"
                    onLoad={(e) => setRenderedHeight(e.currentTarget.clientHeight)}
                  />
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${certStyle.position.x}%`,
                      top: `${certStyle.position.y}%`,
                      transform:
                        certStyle.align === 'center'
                          ? 'translate(-50%, -50%)'
                          : certStyle.align === 'left'
                          ? 'translate(-100%, -50%)'
                          : 'translate(0, -50%)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: fontCss.fontFamily,
                        fontWeight: fontCss.fontWeight,
                        fontSize: `${displayedFontSize}px`,
                        color: certStyle.color,
                        textAlign: certStyle.align,
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                      }}
                      className="bg-white/40 px-1 rounded shadow-xs"
                    >
                      {sampleParticipantName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Style details summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded border border-line p-2.5 bg-page">
                  <div className="text-muted mb-0.5">Placeholder Position</div>
                  <div className="font-medium font-mono text-ink">
                    X: {certStyle.position.x.toFixed(1)}% | Y: {certStyle.position.y.toFixed(1)}%
                  </div>
                </div>
                <div className="rounded border border-line p-2.5 bg-page">
                  <div className="text-muted mb-0.5">Font & Size</div>
                  <div className="font-medium text-ink">
                    {getFontLabel(certStyle.font)} ({certStyle.fontSize}pt)
                  </div>
                </div>
                <div className="rounded border border-line p-2.5 bg-page">
                  <div className="text-muted mb-0.5">Color</div>
                  <div className="flex items-center gap-1.5 font-medium text-ink">
                    <span className="size-3.5 rounded-full border border-line" style={{ backgroundColor: certStyle.color }} />
                    <span className="font-mono">{certStyle.color}</span>
                  </div>
                </div>
                <div className="rounded border border-line p-2.5 bg-page">
                  <div className="text-muted mb-0.5">Alignment</div>
                  <div className="font-medium text-ink capitalize">{certStyle.align}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm font-medium text-warn">No template uploaded</div>
          )}
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
