'use client'

import { useEffect, useRef, useState } from 'react'
import type { DragEvent, PointerEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '../../../../lib/store'
import { FONT_CATEGORIES, FONT_OPTIONS, getFontFamilyCss } from '../../../../lib/fonts'
import { getDefaultCertificateStyle } from '../../../../lib/certificate'

const COLOR_PRESETS = [
  { label: 'Charcoal', value: '#111827' },
  { label: 'Black', value: '#000000' },
  { label: 'Royal Navy', value: '#1e3a8a' },
  { label: 'Deep Blue', value: '#1e40af' },
  { label: 'Crimson', value: '#991b1b' },
  { label: 'Forest Green', value: '#166534' },
  { label: 'Gold Bronze', value: '#b45309' },
]

export default function CertificatePage() {
  const router = useRouter()
  const params = useParams() || {}
  const id = Array.isArray(params.id) ? params.id[0] : params.id || ''
  const { getEvent, updateEvent } = useStore()
  const ev = getEvent(id)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [isDraggingPlaceholder, setIsDraggingPlaceholder] = useState(false)
  const [renderedHeight, setRenderedHeight] = useState(500)
  const [customTestName, setCustomTestName] = useState<string | null>(null)

  // Track rendered image height to scale font size accurately in preview
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setRenderedHeight(entry.contentRect.height)
        }
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [ev?.template])

  if (!ev) return null

  const defaultStyle = getDefaultCertificateStyle(ev)
  const posX = ev.namePosition?.x ?? defaultStyle.position.x
  const posY = ev.namePosition?.y ?? defaultStyle.position.y
  const fontVal = ev.templateFont || defaultStyle.font
  const fontSize = ev.nameFontSize ?? defaultStyle.fontSize
  const fontColor = ev.nameColor || defaultStyle.color
  const fontAlign = ev.nameAlign || defaultStyle.align

  // Sample name to preview: derived during render
  const firstParticipant = ev.participants?.[0]?.name
  const testName = customTestName ?? (firstParticipant || 'Participant Name')

  const templateHeight = ev.templateDimensions?.height || 1080
  const previewScale = renderedHeight / templateHeight
  const displayedFontSize = Math.max(12, Math.round(fontSize * previewScale))
  const fontCss = getFontFamilyCss(fontVal)

  function handleFile(file: File | undefined) {
    if (!file) return
    setError('')
    const isPng = file.type === 'image/png' || /\.png$/i.test(file.name)
    const isJpg = file.type === 'image/jpeg' || file.type === 'image/jpg' || /\.(jpe?g)$/i.test(file.name)
    if (!isPng && !isJpg) {
      setError('Please upload a PNG or JPG certificate template image.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string

      const img = new Image()
      img.onload = () => {
        updateEvent(id, {
          template: dataUrl,
          templateDimensions: { width: img.width, height: img.height },
          namePosition: ev?.namePosition || { x: 50, y: 58 },
          nameFontSize: ev?.nameFontSize || Math.round(img.height * 0.055),
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
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function updatePositionFromClientCoords(clientX: number, clientY: number) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const rawX = ((clientX - rect.left) / rect.width) * 100
    const rawY = ((clientY - rect.top) / rect.height) * 100

    let x = Math.max(0, Math.min(100, Math.round(rawX * 10) / 10))
    // Magnetic snap to center if within 1.5%
    if (Math.abs(x - 50) < 1.5) {
      x = 50
    }
    const y = Math.max(0, Math.min(100, Math.round(rawY * 10) / 10))

    updateEvent(id, { namePosition: { x, y } })
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDraggingPlaceholder(true)
    updatePositionFromClientCoords(e.clientX, e.clientY)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!isDraggingPlaceholder) return
    updatePositionFromClientCoords(e.clientX, e.clientY)
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (isDraggingPlaceholder) {
      setIsDraggingPlaceholder(false)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {}
    }
  }

  const isCenterSnapped = Math.abs(posX - 50) < 0.2

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Certificate Template & Placeholder</h2>
        <p className="mt-1 text-muted text-sm">
          Position where the participant&apos;s name will be printed on the certificate. Click or drag the placeholder directly on the template.
        </p>
      </div>

      {ev.template ? (
        <div className="space-y-6">
          {/* Main Visual Certificate Editor */}
          <div className="rounded-xl border border-line bg-page p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-medium text-ink">Visual Placeholder Placement</span>
                <span>• Click or drag the name box to place it</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-paper px-2 py-1 font-mono font-medium text-ink border border-line">
                  X: {posX.toFixed(1)}% | Y: {posY.toFixed(1)}%
                </span>
                {isCenterSnapped && (
                  <span className="rounded bg-sky-50 px-2 py-1 font-medium text-sky-700 border border-sky-200">
                    Centered
                  </span>
                )}
              </div>
            </div>

            {/* Certificate Canvas / Container */}
            <div className="flex justify-center overflow-hidden rounded-lg border border-line/60 bg-paper/60 p-3 sm:p-6">
              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative inline-block select-none cursor-crosshair touch-none shadow-md rounded overflow-hidden"
                style={{ touchAction: 'none' }}
              >
                <img
                  src={ev.template}
                  alt="Certificate Template"
                  className="block max-h-[500px] w-auto max-w-full object-contain pointer-events-none"
                  onLoad={(e) => {
                    const el = e.currentTarget
                    setRenderedHeight(el.clientHeight)
                    if (!ev.templateDimensions) {
                      updateEvent(id, {
                        templateDimensions: { width: el.naturalWidth, height: el.naturalHeight },
                      })
                    }
                  }}
                />

                {/* Vertical Center Guideline when snapped */}
                {isCenterSnapped && (
                  <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-sky-400 pointer-events-none z-10 opacity-70" />
                )}

                {/* Draggable Placeholder Element */}
                <div
                  className="absolute pointer-events-none z-20 transition-[top,left] duration-75"
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform:
                      fontAlign === 'center'
                        ? 'translate(-50%, -50%)'
                        : fontAlign === 'left'
                        ? 'translate(-100%, -50%)'
                        : 'translate(0, -50%)',
                  }}
                >
                  <div
                    className={`group relative pointer-events-auto cursor-grab active:cursor-grabbing rounded px-3 py-1.5 transition-all ${
                      isDraggingPlaceholder
                        ? 'ring-2 ring-seal bg-white/90 shadow-xl scale-105'
                        : 'hover:ring-2 hover:ring-seal/70 hover:bg-white/80 ring-1 ring-dashed ring-seal/50 bg-white/40 shadow-sm'
                    }`}
                  >
                    {/* Floating pill badge */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white shadow pointer-events-none opacity-85">
                      Name Placeholder ({posX.toFixed(0)}%, {posY.toFixed(0)}%)
                    </div>

                    <div
                      style={{
                        fontFamily: fontCss.fontFamily,
                        fontWeight: fontCss.fontWeight,
                        fontSize: `${displayedFontSize}px`,
                        color: fontColor,
                        textAlign: fontAlign,
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {testName}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>💡 Tip: Click anywhere on the certificate to move the placeholder immediately.</span>
              <button
                type="button"
                onClick={() => updateEvent(id, { namePosition: { x: 50, y: 58 } })}
                className="text-seal hover:underline font-medium"
              >
                Reset Position to Default (50%, 58%)
              </button>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Position & Alignment Card */}
            <div className="rounded-xl border border-line bg-paper p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Position & Alignment</h3>
                <button
                  type="button"
                  onClick={() => updateEvent(id, { namePosition: { x: 50, y: posY } })}
                  className="rounded border border-line bg-page px-2 py-1 text-xs font-medium text-ink hover:border-ink"
                >
                  Center Horizontally
                </button>
              </div>

              {/* X position slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="xPosInput" className="font-medium text-ink">Horizontal Position (X)</label>
                  <span className="font-mono text-muted">{posX.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="xPosInput"
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={posX}
                    onChange={(e) => updateEvent(id, { namePosition: { x: parseFloat(e.target.value), y: posY } })}
                    className="w-full accent-seal h-1.5 bg-line rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={posX}
                    onChange={(e) => updateEvent(id, { namePosition: { x: parseFloat(e.target.value) || 0, y: posY } })}
                    className="w-16 rounded border border-line bg-page px-2 py-1 text-xs font-mono text-ink text-center"
                  />
                </div>
              </div>

              {/* Y position slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="yPosInput" className="font-medium text-ink">Vertical Position (Y)</label>
                  <span className="font-mono text-muted">{posY.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="yPosInput"
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={posY}
                    onChange={(e) => updateEvent(id, { namePosition: { x: posX, y: parseFloat(e.target.value) } })}
                    className="w-full accent-seal h-1.5 bg-line rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={posY}
                    onChange={(e) => updateEvent(id, { namePosition: { x: posX, y: parseFloat(e.target.value) || 0 } })}
                    className="w-16 rounded border border-line bg-page px-2 py-1 text-xs font-mono text-ink text-center"
                  />
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-1.5 pt-2 border-t border-line">
                <label className="text-xs font-medium text-ink block">Text Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateEvent(id, { nameAlign: align })}
                      className={`rounded-md border py-1.5 text-xs font-medium capitalize transition-colors ${
                        fontAlign === align
                          ? 'border-ink bg-ink text-white'
                          : 'border-line bg-page text-muted hover:border-ink hover:text-ink'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Name Input */}
              <div className="space-y-1.5 pt-2 border-t border-line">
                <label htmlFor="testNameInput" className="text-xs font-medium text-ink block">
                  Preview Name
                </label>
                <input
                  id="testNameInput"
                  type="text"
                  value={testName}
                  onChange={(e) => setCustomTestName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-md border border-line bg-page px-3 py-1.5 text-xs text-ink focus:border-ink focus:outline-none"
                />
              </div>
            </div>

            {/* Typography & Style Card */}
            <div className="rounded-xl border border-line bg-paper p-5 space-y-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Font & Appearance</h3>

              {/* Font Family */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="fontSelect" className="text-xs font-medium text-ink block">
                    Font Family
                  </label>
                  <span className="text-[11px] text-muted">
                    {FONT_OPTIONS.length} fonts
                  </span>
                </div>
                <select
                  id="fontSelect"
                  value={fontVal}
                  onChange={(e) => updateEvent(id, { templateFont: e.target.value })}
                  className="w-full rounded-md border border-line bg-page px-3 py-2 text-xs font-medium text-ink focus:border-ink focus:outline-none"
                >
                  {FONT_CATEGORIES.map((cat) => (
                    <optgroup key={cat.label} label={cat.label}>
                      {cat.options.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          style={{ fontFamily: opt.cssFamily }}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <label htmlFor="fontSizeInput" className="text-xs font-medium text-ink block">
                  Font Size (pt)
                </label>
                <div className="relative">
                  <input
                    id="fontSizeInput"
                    type="number"
                    min="1"
                    step="1"
                    value={fontSize || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      updateEvent(id, { nameFontSize: isNaN(val) ? 0 : val })
                    }}
                    onBlur={() => {
                      if (!fontSize || fontSize < 8) {
                        updateEvent(id, { nameFontSize: 40 })
                      }
                    }}
                    placeholder="e.g. 140"
                    className="w-full rounded-md border border-line bg-page px-3 py-2 pr-10 text-xs font-mono text-ink focus:border-ink focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none font-medium">
                    pt
                  </span>
                </div>
              </div>

              {/* Font Color */}
              <div className="space-y-2 pt-2 border-t border-line">
                <div className="flex items-center justify-between">
                  <label htmlFor="colorInput" className="text-xs font-medium text-ink">Text Color</label>
                  <div className="flex items-center gap-2">
                    <span className="size-4 rounded-full border border-line" style={{ backgroundColor: fontColor }}></span>
                    <span className="font-mono text-xs text-muted">{fontColor}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="colorInput"
                    type="color"
                    value={fontColor}
                    onChange={(e) => updateEvent(id, { nameColor: e.target.value })}
                    className="size-8 rounded border border-line cursor-pointer bg-page p-0.5"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => updateEvent(id, { nameColor: preset.value })}
                        title={preset.label}
                        className={`size-6 rounded-full border transition-transform ${
                          fontColor.toLowerCase() === preset.value.toLowerCase()
                            ? 'scale-110 ring-2 ring-seal ring-offset-1 border-white'
                            : 'border-line/60 hover:scale-105'
                        }`}
                        style={{ backgroundColor: preset.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Template File Actions */}
              <div className="pt-3 border-t border-line flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 rounded-md border border-line bg-page py-2 text-xs font-medium hover:border-ink text-ink"
                >
                  Change Background Image
                </button>
                <button
                  type="button"
                  onClick={() => updateEvent(id, { template: undefined, templateDimensions: undefined })}
                  className="rounded-md border border-warn-soft px-3 py-2 text-xs font-medium text-warn hover:bg-warn-soft"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-line">
            <button
              onClick={() => router.push(`/event/${id}/participants`)}
              className="rounded-md border border-line px-5 py-2.5 text-sm font-medium hover:border-ink"
            >
              Back
            </button>
            <button
              onClick={() => router.push(`/event/${id}/email`)}
              className="rounded-md bg-seal px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 shadow-sm"
            >
              Continue to email template
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-14 text-center transition-colors ${
            dragOver ? 'border-seal bg-seal-soft' : 'border-line bg-paper'
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-page text-muted shadow-sm">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-ink">Upload a certificate template</h3>
          <p className="mt-2 text-sm text-muted">PNG or JPG recommended (e.g. 1920x1080 landscape)</p>
          <div className="mt-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:brightness-125 shadow-sm"
            >
              Select Image
            </button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => handleFile(e.target.files?.[0])} />

      {error && (
        <p role="alert" className="mt-4 text-center text-sm font-medium text-seal">
          {error}
        </p>
      )}
    </div>
  )
}
