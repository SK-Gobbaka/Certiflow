'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useStore } from '../../../../lib/store'
import { drawCertificate, getDefaultCertificateStyle } from '../../../../lib/certificate'

export default function GeneratePage() {
  const router = useRouter()
  const params = useParams() || {}
  const id = Array.isArray(params.id) ? params.id[0] : params.id || ''
  const { getEvent } = useStore()
  const ev = getEvent(id)

  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [zipBlob, setZipBlob] = useState<Blob | null>(null)

  if (!ev) return null

  const validParticipants = (ev.participants || []).filter((p) => p.status === 'valid')

  async function generateCertificates() {
    setGenerating(true)
    setProgress(0)
    setZipBlob(null)

    try {
      const zip = new JSZip()
      
      // Parse template image type
      const isPng = Boolean(ev?.template?.startsWith('data:image/png'))
      const isJpg = Boolean(ev?.template?.startsWith('data:image/jpeg') || ev?.template?.startsWith('data:image/jpg'))
      
      if (!isPng && !isJpg) {
        alert("Unsupported image format. Please use a PNG or JPG template.")
        setGenerating(false)
        return
      }

      // Fetch the base64 data as a blob and get array buffer
      const res = await fetch(ev!.template!)
      const imageBytes = await res.arrayBuffer()
      const certStyle = getDefaultCertificateStyle(ev!)
      
      for (let i = 0; i < validParticipants.length; i++) {
        const participant = validParticipants[i]
        
        const pdfDoc = await PDFDocument.create()
        await drawCertificate(pdfDoc, imageBytes, isPng, participant.name, certStyle)
        
        const pdfBytes = await pdfDoc.save()
        zip.file(`${participant.name.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`, pdfBytes)
        
        setProgress(Math.round(((i + 1) / validParticipants.length) * 100))
      }

      const content = await zip.generateAsync({ type: 'blob' })
      setZipBlob(content)
      
    } catch (err: any) {
      console.error(err)
      alert("Error generating certificates: " + (err.message || String(err)))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Generate Certificates</h2>
      <p className="mt-1 text-muted">
        Ready to create {validParticipants.length} certificates. This might take a few moments depending on the number of participants.
      </p>

      <div className="mt-8 rounded-lg border border-line bg-paper p-8 text-center">
        {!generating && !zipBlob && (
          <div>
            <p className="text-ink mb-6">Click the button below to start the generation process.</p>
            <button
              onClick={generateCertificates}
              className="rounded-md bg-ink px-6 py-3 text-base font-semibold text-white hover:brightness-125"
            >
              Start Generating
            </button>
          </div>
        )}

        {generating && (
          <div className="w-full max-w-md mx-auto">
             <div className="flex justify-between mb-2">
               <span className="text-sm font-medium text-ink">Generating...</span>
               <span className="text-sm font-medium text-ink">{progress}%</span>
             </div>
             <div className="w-full bg-page rounded-full h-2.5 border border-line">
               <div className="bg-seal h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
             </div>
          </div>
        )}

        {zipBlob && !generating && (
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok-soft text-ok mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Successfully Generated!</h3>
            <p className="text-muted mb-6">All certificates have been combined into a single ZIP file.</p>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => saveAs(zipBlob, `${ev.name.replace(/[^a-z0-9]/gi, '_')}_Certificates.zip`)}
                className="rounded-md bg-ink px-6 py-3 text-base font-semibold text-white hover:brightness-125 shadow-sm"
              >
                Download ZIP
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => router.push(`/event/${id}/review`)}
          className="rounded-md border border-line px-5 py-2.5 text-sm font-medium hover:border-ink"
        >
          Back
        </button>
        <button
          onClick={() => router.push(`/event/${id}/send`)}
          disabled={!zipBlob}
          className="rounded-md bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to send emails
        </button>
      </div>
    </div>
  )
}
