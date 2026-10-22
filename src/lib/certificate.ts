import { PDFDocument, rgb } from 'pdf-lib'
import type { RGB } from 'pdf-lib'
import { embedSelectedFont } from './fonts'
import type { CertEvent } from '../types'

export interface CertificateStyle {
  position: { x: number; y: number }
  fontSize: number
  color: string
  align: 'center' | 'left' | 'right'
  font: string
}

export function getDefaultCertificateStyle(ev?: Partial<CertEvent>): CertificateStyle {
  const height = ev?.templateDimensions?.height || 1080
  return {
    position: ev?.namePosition || { x: 50, y: 58 },
    fontSize: ev?.nameFontSize || Math.round(height * 0.055),
    color: ev?.nameColor || '#111827',
    align: ev?.nameAlign || 'center',
    font: ev?.templateFont || 'Helvetica-Bold',
  }
}

export function hexToRgb(hex?: string): RGB {
  if (!hex) return rgb(0.1, 0.1, 0.1)
  const clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255
    const g = parseInt(clean[1] + clean[1], 16) / 255
    const b = parseInt(clean[2] + clean[2], 16) / 255
    return rgb(isNaN(r) ? 0.1 : r, isNaN(g) ? 0.1 : g, isNaN(b) ? 0.1 : b)
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255
    const g = parseInt(clean.substring(2, 4), 16) / 255
    const b = parseInt(clean.substring(4, 6), 16) / 255
    return rgb(isNaN(r) ? 0.1 : r, isNaN(g) ? 0.1 : g, isNaN(b) ? 0.1 : b)
  }
  return rgb(0.1, 0.1, 0.1)
}

export async function drawCertificate(
  pdfDoc: PDFDocument,
  imageBytes: ArrayBuffer,
  isPng: boolean,
  name: string,
  style: CertificateStyle
) {
  const font = await embedSelectedFont(pdfDoc, style.font || 'Helvetica-Bold')
  const img = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes)
  const { width, height } = img.scale(1)
  const page = pdfDoc.addPage([width, height])

  page.drawImage(img, {
    x: 0,
    y: 0,
    width,
    height,
  })

  const fontSize = style.fontSize || Math.round(height * 0.055)
  const textWidth = font.widthOfTextAtSize(name, fontSize)

  const xPercent = style.position?.x ?? 50
  let x = (xPercent / 100) * width
  if (style.align === 'center') {
    x -= textWidth / 2
  } else if (style.align === 'left') {
    x -= textWidth
  }

  const yPercent = style.position?.y ?? 58
  const yCenter = height - (yPercent / 100) * height
  const y = yCenter - (fontSize * 0.35)

  page.drawText(name, {
    x,
    y,
    size: fontSize,
    font,
    color: hexToRgb(style.color || '#111827'),
  })

  return { width, height }
}
