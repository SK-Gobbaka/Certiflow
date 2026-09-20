export function createMimeMessage(
  to: string,
  subject: string,
  body: string,
  pdfBytes: Uint8Array,
  pdfFilename: string
): string {
  const boundary = `====boundary_${Date.now()}====`;
  
  const headers = [
    `To: ${to}`,
    `From: me`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`
  ].join('\r\n');

  const textPart = [
    `--${boundary}`,
    `Content-Type: text/plain; charset="utf-8"`,
    `Content-Transfer-Encoding: base64`,
    '',
    btoa(unescape(encodeURIComponent(body)))
  ].join('\r\n');

  let binary = '';
  for (let i = 0; i < pdfBytes.length; i++) {
    binary += String.fromCharCode(pdfBytes[i]);
  }
  const pdfBase64 = btoa(binary).match(/.{1,76}/g)?.join('\r\n') || btoa(binary);

  const attachmentPart = [
    `--${boundary}`,
    `Content-Type: application/pdf; name="${pdfFilename}"`,
    `Content-Disposition: attachment; filename="${pdfFilename}"`,
    `Content-Transfer-Encoding: base64`,
    '',
    pdfBase64,
    `--${boundary}--`
  ].join('\r\n');

  const rawMessage = [headers, '', textPart, '', attachmentPart].join('\r\n');
  
  // Gmail API requires base64url encoding
  // rawMessage only contains ASCII characters because text and pdf are already base64 encoded inside the parts.
  return btoa(rawMessage)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
