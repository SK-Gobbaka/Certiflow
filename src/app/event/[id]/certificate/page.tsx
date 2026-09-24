'use client'

import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '../../../../lib/store'
import { FONT_OPTIONS } from '../../../../lib/fonts'

export default function CertificatePage() {
  const router = useRouter()
  const params = useParams() || {}
  const id = Array.isArray(params.id) ? params.id[0] : params.id || ''
  const { getEvent, updateEvent } = useStore()
  const ev = getEvent(id)
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)

  if (!ev) return null

  function handleFile(file: File | undefined) {
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc).')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string

      const img = new Image()
      img.onload = () => {
        updateEvent(id, {
          template: dataUrl,
          templateDimensions: { width: img.width, height: img.height }
        })
      }
      img.onerror = () => setError('Failed to read image dimensions.')
      img.src = dataUrl
    }
    reader.onerror = () => setError('Failed to read the file.')
    reader.readAsDataURL(file)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Certificate Template</h2>
      <p className="mt-1 text-muted">
        Upload a background image for your certificates. We recommend a high-resolution landscape image (e.g., 1920x1080).
      </p>

      {ev.template ? (
        <div className="mt-6 flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-lg border border-line bg-page p-4 text-center">
            <img
              src={ev.template}
              alt="Certificate Template"
              className="mx-auto max-h-[500px] object-contain rounded shadow-sm"
            />

            <div className="mt-6 flex flex-col items-center gap-2">
              <label htmlFor="fontSelect" className="text-sm font-semibold text-ink">
                Participant Name Font
              </label>
              <select
                id="fontSelect"
                value={ev.templateFont || 'Helvetica-Bold'}
                onChange={(e) => updateEvent(id, { templateFont: e.target.value })}
                className="rounded-md border border-line bg-page px-4 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
              >
                {FONT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => input.current?.click()}
                className="rounded-md border border-line bg-paper px-4 py-2 text-sm font-medium hover:border-ink hover:text-ink"
              >
                Replace Template
              </button>
              <button
                onClick={() => updateEvent(id, { template: undefined, templateDimensions: undefined })}
                className="rounded-md border border-warn-soft text-warn px-4 py-2 text-sm font-medium hover:bg-warn-soft"
              >
                Remove
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => router.push(`/event/${id}/participants`)}
              className="rounded-md border border-line px-5 py-2.5 text-sm font-medium hover:border-ink"
            >
              Back
            </button>
            <button
              onClick={() => router.push(`/event/${id}/email`)}
              className="rounded-md bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Continue to email template
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`mt-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${drag ? 'border-seal bg-seal-soft' : 'border-line bg-paper'
            }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-page text-muted shadow-sm">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-ink">Upload a template</h3>
          <p className="mt-2 text-sm text-muted">PNG, JPG, or SVG up to 10MB</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => input.current?.click()} className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:brightness-125">
              Select image
            </button>
          </div>
        </div>
      )}

      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />

      {error && (
        <p role="alert" className="mt-4 text-center text-sm font-medium text-seal">
          {error}
        </p>
      )}
    </div>
  )
}
