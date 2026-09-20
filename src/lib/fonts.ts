import { PDFDocument, StandardFonts } from 'pdf-lib'

export interface FontOption {
  value: string
  label: string
}

export const FONT_OPTIONS: FontOption[] = [
  { value: 'Helvetica-Bold', label: 'Helvetica Bold (Standard)' },
  { value: 'Helvetica', label: 'Helvetica (Standard)' },
  { value: 'Times-Bold', label: 'Times New Roman Bold (Standard)' },
  { value: 'Times-Roman', label: 'Times New Roman (Standard)' },
  { value: 'Courier-Bold', label: 'Courier Bold (Standard)' },
  { value: 'Courier', label: 'Courier (Standard)' },
]

export async function embedSelectedFont(pdfDoc: PDFDocument, fontValue: string) {
  const option = FONT_OPTIONS.find(o => o.value === fontValue) || FONT_OPTIONS[0]
  return pdfDoc.embedFont(option.value as StandardFonts)
}
