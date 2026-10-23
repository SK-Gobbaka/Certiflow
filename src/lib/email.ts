export function replacePlaceholders(
  template: string,
  participant: { name: string; email: string; role?: string; department?: string; extra?: Record<string, string> }
): string {
  let result = (template || '')
    .replace(/{{name}}/g, participant.name)
    .replace(/{{email}}/g, participant.email)
    .replace(/{{role}}/g, participant.role || '')
    .replace(/{{department}}/g, participant.department || '')
  if (participant.extra) {
    for (const [key, value] of Object.entries(participant.extra)) {
      result = result.replaceAll(`{{${key}}}`, value || '')
    }
  }
  return result
}

function toBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  const len = bytes.length
  for (let i = 0; i < len; i += 8192) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + 8192, len)) as unknown as number[])
  }
  return btoa(binary)
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const len = bytes.length
  for (let i = 0; i < len; i += 8192) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + 8192, len)) as unknown as number[])
  }
  return btoa(binary)
}

export function createMimeMessage(
  to: string,
  subject: string,
  body: string,
  pdfBytes: Uint8Array,
  pdfFilename: string
): string {
  const boundary = `====boundary_${Date.now()}====`
  const cleanTo = to.replace(/[\r\n]/g, '').trim()
  const cleanFilename = (pdfFilename || 'certificate.pdf').replace(/[\r\n"]/g, '_')
  
  const headers = [
    `To: ${cleanTo}`,
    `From: me`,
    `Subject: =?utf-8?B?${toBase64Utf8(subject)}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`
  ].join('\r\n')

  const textPart = [
    `--${boundary}`,
    `Content-Type: text/plain; charset="utf-8"`,
    `Content-Transfer-Encoding: base64`,
    '',
    toBase64Utf8(body)
  ].join('\r\n')

  const pdfBase64 = bytesToBase64(pdfBytes).match(/.{1,76}/g)?.join('\r\n') || bytesToBase64(pdfBytes)

  const attachmentPart = [
    `--${boundary}`,
    `Content-Type: application/pdf; name="${cleanFilename}"`,
    `Content-Disposition: attachment; filename="${cleanFilename}"`,
    `Content-Transfer-Encoding: base64`,
    '',
    pdfBase64,
    `--${boundary}--`
  ].join('\r\n')

  const rawMessage = [headers, '', textPart, '', attachmentPart].join('\r\n')
  
  // Gmail API requires base64url encoding
  return btoa(rawMessage)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

