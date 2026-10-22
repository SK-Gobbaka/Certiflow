import { PDFDocument, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export interface FontOption {
  value: string
  label: string
  category: 'script' | 'serif' | 'sans' | 'standard'
  file?: string
  cssFamily: string
  weight: 'bold' | 'normal'
}

export interface FontCategory {
  label: string
  category: FontOption['category']
  options: FontOption[]
}

export const FONT_OPTIONS: FontOption[] = [
  // Calligraphy & Script
  {
    value: 'GreatVibes',
    label: 'Great Vibes (Flourished Script)',
    category: 'script',
    file: 'GreatVibes.ttf',
    cssFamily: "'Great Vibes', cursive",
    weight: 'normal',
  },
  {
    value: 'AlexBrush',
    label: 'Alex Brush (Classic Calligraphy)',
    category: 'script',
    file: 'AlexBrush.ttf',
    cssFamily: "'Alex Brush', cursive",
    weight: 'normal',
  },
  {
    value: 'DancingScript-Bold',
    label: 'Dancing Script Bold (Casual Script)',
    category: 'script',
    file: 'DancingScript-Bold.ttf',
    cssFamily: "'Dancing Script', cursive",
    weight: 'bold',
  },

  // Serif / Formal Diplomas & Academic
  {
    value: 'Cinzel-Bold',
    label: 'Cinzel Bold (Regal Roman)',
    category: 'serif',
    file: 'Cinzel-Bold.ttf',
    cssFamily: "'Cinzel', serif",
    weight: 'bold',
  },
  {
    value: 'Cinzel',
    label: 'Cinzel Regular (Classical Roman)',
    category: 'serif',
    file: 'Cinzel.ttf',
    cssFamily: "'Cinzel', serif",
    weight: 'normal',
  },
  {
    value: 'PlayfairDisplay-Bold',
    label: 'Playfair Display Bold (Prestigious Serif)',
    category: 'serif',
    file: 'PlayfairDisplay-Bold.ttf',
    cssFamily: "'Playfair Display', serif",
    weight: 'bold',
  },
  {
    value: 'PlayfairDisplay',
    label: 'Playfair Display (Prestigious Serif)',
    category: 'serif',
    file: 'PlayfairDisplay.ttf',
    cssFamily: "'Playfair Display', serif",
    weight: 'normal',
  },
  {
    value: 'CormorantGaramond-Bold',
    label: 'Cormorant Garamond Bold (Academic Diploma)',
    category: 'serif',
    file: 'CormorantGaramond-Bold.ttf',
    cssFamily: "'Cormorant Garamond', serif",
    weight: 'bold',
  },
  {
    value: 'Times-Bold',
    label: 'Times New Roman Bold (Standard)',
    category: 'serif',
    cssFamily: '"Times New Roman", Times, Georgia, serif',
    weight: 'bold',
  },
  {
    value: 'Times-Roman',
    label: 'Times New Roman (Standard)',
    category: 'serif',
    cssFamily: '"Times New Roman", Times, Georgia, serif',
    weight: 'normal',
  },

  // Modern & Tech / Sans-Serif
  {
    value: 'Montserrat-Bold',
    label: 'Montserrat Bold (Modern Clean)',
    category: 'sans',
    file: 'Montserrat-Bold.ttf',
    cssFamily: "'Montserrat', sans-serif",
    weight: 'bold',
  },
  {
    value: 'Montserrat',
    label: 'Montserrat Regular (Modern Clean)',
    category: 'sans',
    file: 'Montserrat.ttf',
    cssFamily: "'Montserrat', sans-serif",
    weight: 'normal',
  },
  {
    value: 'Poppins-Bold',
    label: 'Poppins Bold (Contemporary)',
    category: 'sans',
    file: 'Poppins-Bold.ttf',
    cssFamily: "'Poppins', sans-serif",
    weight: 'bold',
  },
  {
    value: 'Poppins',
    label: 'Poppins Regular (Contemporary)',
    category: 'sans',
    file: 'Poppins.ttf',
    cssFamily: "'Poppins', sans-serif",
    weight: 'normal',
  },
  {
    value: 'Roboto-Bold',
    label: 'Roboto Bold (Tech Sans)',
    category: 'sans',
    file: 'Roboto-Bold.ttf',
    cssFamily: "'Roboto', sans-serif",
    weight: 'bold',
  },
  {
    value: 'Roboto',
    label: 'Roboto Regular (Tech Sans)',
    category: 'sans',
    file: 'Roboto.ttf',
    cssFamily: "'Roboto', sans-serif",
    weight: 'normal',
  },
  {
    value: 'Helvetica-Bold',
    label: 'Helvetica Bold (Standard)',
    category: 'sans',
    cssFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    weight: 'bold',
  },
  {
    value: 'Helvetica',
    label: 'Helvetica (Standard)',
    category: 'sans',
    cssFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    weight: 'normal',
  },

  // Monospace / Code
  {
    value: 'Courier-Bold',
    label: 'Courier Bold (Monospace)',
    category: 'standard',
    cssFamily: '"Courier New", Courier, monospace',
    weight: 'bold',
  },
  {
    value: 'Courier',
    label: 'Courier (Monospace)',
    category: 'standard',
    cssFamily: '"Courier New", Courier, monospace',
    weight: 'normal',
  },
]

export const FONT_CATEGORIES: FontCategory[] = [
  {
    label: '🖋️ Calligraphy & Script',
    category: 'script',
    options: FONT_OPTIONS.filter((f) => f.category === 'script'),
  },
  {
    label: '🏛️ Formal Diplomas & Serif',
    category: 'serif',
    options: FONT_OPTIONS.filter((f) => f.category === 'serif'),
  },
  {
    label: '🚀 Modern & Tech (Sans-Serif)',
    category: 'sans',
    options: FONT_OPTIONS.filter((f) => f.category === 'sans'),
  },
  {
    label: '💻 Monospace / Typewriter',
    category: 'standard',
    options: FONT_OPTIONS.filter((f) => f.category === 'standard'),
  },
]

// In-memory cache for font buffers to avoid re-fetching or re-reading files on every certificate
const fontBufferCache = new Map<string, ArrayBuffer>()

export async function embedSelectedFont(pdfDoc: PDFDocument, fontValue: string) {
  const option = FONT_OPTIONS.find((o) => o.value === fontValue) || FONT_OPTIONS[0]

  if (option.file) {
    try {
      pdfDoc.registerFontkit(fontkit)
      let buffer = fontBufferCache.get(option.file)

      if (!buffer) {
        if (typeof window !== 'undefined') {
          const res = await fetch(`/fonts/${option.file}`)
          if (!res.ok) {
            throw new Error(`Failed to load font file: ${option.file} (HTTP ${res.status})`)
          }
          buffer = await res.arrayBuffer()
        } else {
          const fs = await import('fs')
          const path = await import('path')
          const filePath = path.join(process.cwd(), 'public', 'fonts', option.file)
          const fileBuf = fs.readFileSync(filePath)
          buffer = fileBuf.buffer.slice(fileBuf.byteOffset, fileBuf.byteOffset + fileBuf.byteLength)
        }
        fontBufferCache.set(option.file, buffer)
      }

      return await pdfDoc.embedFont(buffer)
    } catch (err) {
      console.warn(`Could not load custom font ${option.file}, falling back to Helvetica:`, err)
      return pdfDoc.embedFont(StandardFonts.HelveticaBold)
    }
  }

  // Standard PDF fonts fallback
  return pdfDoc.embedFont((option.value as StandardFonts) || StandardFonts.HelveticaBold)
}

export function getFontFamilyCss(fontValue?: string): { fontFamily: string; fontWeight: 'bold' | 'normal' } {
  const option = FONT_OPTIONS.find((o) => o.value === fontValue)
  if (option) {
    return {
      fontFamily: option.cssFamily,
      fontWeight: option.weight,
    }
  }

  const font = fontValue || 'Helvetica-Bold'
  if (font.startsWith('Times')) {
    return {
      fontFamily: '"Times New Roman", Times, Georgia, serif',
      fontWeight: font.includes('Bold') ? 'bold' : 'normal',
    }
  }
  if (font.startsWith('Courier')) {
    return {
      fontFamily: '"Courier New", Courier, monospace',
      fontWeight: font.includes('Bold') ? 'bold' : 'normal',
    }
  }
  return {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: font.includes('Bold') ? 'bold' : 'normal',
  }
}

export function getFontLabel(fontValue?: string): string {
  const option = FONT_OPTIONS.find((o) => o.value === fontValue)
  return option ? option.label : (fontValue || 'Default Font')
}
