import Papa from 'papaparse'
import type { Participant } from '../types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const norm = (s: string) => s.trim().toLowerCase().replace(/[\s-]+/g, '_')

export interface ParseResult {
  participants: Participant[]
  columns: string[]
  fatal?: string
}

export function parseParticipants(csvText: string): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => norm(h),
  })

  const columns = (parsed.meta.fields ?? []).filter(Boolean)
  if (!columns.includes('name') || !columns.includes('email')) {
    return {
      participants: [],
      columns,
      fatal: 'The file needs a "name" column and an "email" column in its header row.',
    }
  }

  const seen = new Set<string>()
  const known = new Set(['name', 'email', 'role', 'department'])

  const participants = parsed.data.map((row, i): Participant => {
    const name = (row.name ?? '').trim()
    const email = (row.email ?? '').trim()
    const key = email.toLowerCase()
    const issues: string[] = []
    let status: Participant['status'] = 'valid'

    if (!name) issues.push('Missing name')
    if (!email) issues.push('Missing email')
    else if (!EMAIL_RE.test(email)) issues.push('Invalid email')

    if (issues.length) status = 'invalid'
    else if (seen.has(key)) {
      status = 'duplicate'
      issues.push('Email already appears earlier in the list')
    }
    if (status === 'valid') seen.add(key)

    const extra: Record<string, string> = {}
    for (const c of columns) if (!known.has(c)) extra[c] = (row[c] ?? '').trim()

    return {
      id: `${i + 1}`,
      name,
      email,
      role: (row.role ?? '').trim(),
      department: (row.department ?? '').trim(),
      extra,
      status,
      issues,
    }
  })

  return { participants, columns }
}

export const SAMPLE_CSV = `name,email,role,department
Rahul Kumar,rahul@example.com,Winner,CSE
Priya Sharma,priya@example.com,Participant,IT
Arjun Reddy,arjun@example.com,Runner Up,ECE
`
