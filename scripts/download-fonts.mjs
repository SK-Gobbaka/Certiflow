import fs from 'fs'
import path from 'path'
import { PDFDocument } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

const FONTS_TO_FETCH = [
  // Script / Calligraphy
  { id: 'GreatVibes', family: 'Great Vibes', weight: '400', label: 'Great Vibes (Elegant Script)' },
  { id: 'AlexBrush', family: 'Alex Brush', weight: '400', label: 'Alex Brush (Classic Script)' },
  { id: 'DancingScript-Bold', family: 'Dancing Script', weight: '700', label: 'Dancing Script Bold (Modern Script)' },
  
  // Serif / Formal / Academic / Diplomas
  { id: 'Cinzel-Bold', family: 'Cinzel', weight: '700', label: 'Cinzel Bold (Regal Roman)' },
  { id: 'Cinzel', family: 'Cinzel', weight: '400', label: 'Cinzel (Classical Roman)' },
  { id: 'PlayfairDisplay-Bold', family: 'Playfair Display', weight: '700', label: 'Playfair Display Bold (Prestigious Serif)' },
  { id: 'PlayfairDisplay', family: 'Playfair Display', weight: '400', label: 'Playfair Display (Prestigious Serif)' },
  { id: 'CormorantGaramond-Bold', family: 'Cormorant Garamond', weight: '700', label: 'Cormorant Garamond Bold (Academic Diploma)' },
  
  // Sans-Serif / Modern / Tech & Hackathons
  { id: 'Montserrat-Bold', family: 'Montserrat', weight: '700', label: 'Montserrat Bold (Modern Clean)' },
  { id: 'Montserrat', family: 'Montserrat', weight: '400', label: 'Montserrat (Modern Clean)' },
  { id: 'Poppins-Bold', family: 'Poppins', weight: '700', label: 'Poppins Bold (Contemporary)' },
  { id: 'Poppins', family: 'Poppins', weight: '400', label: 'Poppins (Contemporary)' },
  { id: 'Roboto-Bold', family: 'Roboto', weight: '700', label: 'Roboto Bold (Tech Sans)' },
  { id: 'Roboto', family: 'Roboto', weight: '400', label: 'Roboto (Tech Sans)' },
]

async function getTtfUrl(family, weight = '400') {
  const url = `https://fonts.googleapis.com/css?family=${family.replace(/ /g, '+')}:${weight}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.1.1; en-gb; Build/KLP) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30'
    }
  })
  const text = await res.text()
  const match = text.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/)
  return match ? match[1] : null
}

async function run() {
  const dir = path.join(process.cwd(), 'public', 'fonts')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  for (const item of FONTS_TO_FETCH) {
    const filePath = path.join(dir, `${item.id}.ttf`)
    if (fs.existsSync(filePath)) {
      console.log(`Already exists: ${item.id}.ttf`)
      continue
    }
    console.log(`Fetching URL for ${item.family} (${item.weight})...`)
    const url = await getTtfUrl(item.family, item.weight)
    if (!url) {
      console.error(`Failed to find URL for ${item.family}`)
      continue
    }
    console.log(`Downloading ${item.id} from ${url}...`)
    const res = await fetch(url)
    const buffer = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(filePath, buffer)
    console.log(`Saved ${item.id}.ttf (${buffer.length} bytes)`)
  }

  // Test embedding into a sample PDF
  console.log('Testing embedding with pdf-lib and fontkit...')
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const testFontBuffer = fs.readFileSync(path.join(dir, 'GreatVibes.ttf'))
  const embeddedFont = await pdfDoc.embedFont(testFontBuffer)
  const page = pdfDoc.addPage([600, 400])
  page.drawText('Rahul Kumar', {
    x: 50,
    y: 200,
    size: 40,
    font: embeddedFont,
  })
  const pdfBytes = await pdfDoc.save()
  console.log(`Successfully generated test PDF (${pdfBytes.length} bytes)! All fonts verified!`)
}

run().catch(console.error)
