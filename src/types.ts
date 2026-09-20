export type RowStatus = 'valid' | 'invalid' | 'duplicate'

export interface Participant {
  id: string
  name: string
  email: string
  role: string
  department: string
  /** any extra CSV columns, usable as {{placeholders}} later */
  extra: Record<string, string>
  status: RowStatus
  issues: string[]
}

export interface CertEvent {
  id: string
  name: string
  date: string
  organizer: string
  description: string
  createdAt: number
  participants: Participant[]
  /** original CSV column headers, in order */
  columns: string[]
  /** Base64 data URL for the certificate background template */
  template?: string
  templateDimensions?: { width: number; height: number }
  templateFont?: string
  emailSubject?: string
  emailBody?: string
}
