import test from 'node:test'
import assert from 'node:assert/strict'
import { replacePlaceholders, createMimeMessage } from '../src/lib/email.ts'
import { parseParticipants } from '../src/lib/validate.ts'

test('replacePlaceholders substitutes standard and custom fields', () => {
  const template = 'Hello {{name}} from {{department}}, role: {{role}}, extra: {{college}}'
  const participant = {
    name: 'Rahul',
    email: 'rahul@example.com',
    role: 'Speaker',
    department: 'CSE',
    extra: { college: 'IIT Madras' },
  }
  const result = replacePlaceholders(template, participant)
  assert.equal(result, 'Hello Rahul from CSE, role: Speaker, extra: IIT Madras')
})

test('replacePlaceholders handles missing optional fields gracefully', () => {
  const template = 'Hello {{name}}, role: {{role}}, dept: {{department}}'
  const participant = {
    name: 'Priya',
    email: 'priya@example.com',
  }
  const result = replacePlaceholders(template, participant)
  assert.equal(result, 'Hello Priya, role: , dept: ')
})

test('createMimeMessage builds valid base64url payload and sanitizes headers', () => {
  const dummyPdf = new Uint8Array([37, 80, 68, 70]) // %PDF
  const raw = createMimeMessage(
    'test@example.com\r\nBcc: evil@example.com',
    'Certificate for Priya',
    'Congratulations Priya!',
    dummyPdf,
    'Priya_Certificate.pdf'
  )
  assert.ok(typeof raw === 'string' && raw.length > 0)
  // Base64url contains no '+', '/', or '='
  assert.ok(!/[+/=]/.test(raw))
  // Decoded payload must sanitize CR/LF in To header
  const decoded = atob(raw.replace(/-/g, '+').replace(/_/g, '/'))
  assert.ok(!decoded.includes('To: test@example.com\r\nBcc:'))
  assert.ok(decoded.includes('Content-Type: multipart/mixed'))
  assert.ok(decoded.includes('application/pdf'))
})

test('parseParticipants handles valid, invalid, duplicate rows and UTF-8 BOM', () => {
  const csv = '\uFEFFname,email,role,department,rank\n' +
    'Alice,alice@example.com,Winner,CS,1\n' +
    'Bob,bob@example.com,Runner Up,IT,2\n' +
    'Alice Dup,alice@example.com,Winner,CS,1\n' +
    'Bad Email,not-an-email,Participant,EE,3\n' +
    ',missing-name@example.com,Participant,EE,4\n'

  const res = parseParticipants(csv)
  assert.equal(res.participants.length, 5)
  assert.equal(res.participants[0].status, 'valid')
  assert.equal(res.participants[0].extra.rank, '1')
  assert.equal(res.participants[1].status, 'valid')
  assert.equal(res.participants[2].status, 'duplicate')
  assert.equal(res.participants[3].status, 'invalid')
  assert.equal(res.participants[4].status, 'invalid')
})
