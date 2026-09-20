import { useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { saveAs } from 'file-saver'
import { useStore } from '../lib/store'
import { parseParticipants, SAMPLE_CSV } from '../lib/validate'
import type { RowStatus } from '../types'

type Filter = 'all' | RowStatus

const badge: Record<RowStatus, string> = {
  valid: 'bg-ok-soft text-ok',
  invalid: 'bg-seal-soft text-seal',
  duplicate: 'bg-warn-soft text-warn',
}

export default function ParticipantsPage() {
  const { id = '' } = useParams()
  const { getEvent, updateEvent } = useStore()
  const navigate = useNavigate()
  const ev = getEvent(id)
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const list = ev?.participants ?? []
  const counts = useMemo(
    () => ({
      all: list.length,
      valid: list.filter((p) => p.status === 'valid').length,
      invalid: list.filter((p) => p.status === 'invalid').length,
      duplicate: list.filter((p) => p.status === 'duplicate').length,
    }),
    [list],
  )

  if (!ev) return null

  async function readFile(file: File | undefined) {
    if (!file) return
    setError('')
    if (!/\.(csv|txt)$/i.test(file.name)) {
      setError('Upload a .csv file. In Excel or Google Sheets, use File > Download > CSV.')
      return
    }
    const res = parseParticipants(await file.text())
    if (res.fatal) return setError(res.fatal)
    if (!res.participants.length) return setError('No rows found below the header row.')
    updateEvent(id, { participants: res.participants, columns: res.columns })
    setFilter('all')
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDrag(false)
    readFile(e.dataTransfer.files[0])
  }

  const shown = filter === 'all' ? list : list.filter((p) => p.status === filter)

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">Participants</h2>
      <p className="mt-1 text-muted">
        Upload a CSV with <b>name</b> and <b>email</b> columns. <b>role</b> and <b>department</b> are optional, and any other column can be used as a placeholder later.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`mt-6 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          drag ? 'border-seal bg-seal-soft' : 'border-line bg-paper'
        }`}
      >
        <p className="font-medium">{list.length ? 'Replace the participant list' : 'Drop your CSV file here'}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <button onClick={() => input.current?.click()} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:brightness-125">
            Choose file
          </button>
          <button
            onClick={() => saveAs(new Blob([SAMPLE_CSV], { type: 'text/csv' }), 'participants-sample.csv')}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:border-ink"
          >
            Download sample CSV
          </button>
        </div>
        <input ref={input} type="file" accept=".csv,text/csv" hidden onChange={(e) => readFile(e.target.files?.[0])} />
        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-seal">
            {error}
          </p>
        )}
      </div>

      {list.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ['all', 'Rows in file'],
                ['valid', 'Ready'],
                ['invalid', 'Need fixing'],
                ['duplicate', 'Duplicates'],
              ] as [Filter, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                aria-pressed={filter === k}
                className={`rounded-lg border bg-paper p-4 text-left ${filter === k ? 'border-ink' : 'border-line hover:border-muted'}`}
              >
                <div className="font-display text-2xl font-bold">{counts[k]}</div>
                <div className="text-sm text-muted">{label}</div>
              </button>
            ))}
          </div>

          {counts.invalid + counts.duplicate > 0 && (
            <p className="mt-4 rounded-md bg-warn-soft px-4 py-3 text-sm text-warn">
              {counts.invalid + counts.duplicate} rows will be skipped. Fix them in your file and upload it again, or continue with the {counts.valid} ready rows.
            </p>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-paper">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-muted">
                <tr>
                  {['Name', 'Email', 'Role', 'Department', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.slice(0, 200).map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5">{p.name || <span className="text-seal">Missing</span>}</td>
                    <td className="px-4 py-2.5">{p.email || <span className="text-seal">Missing</span>}</td>
                    <td className="px-4 py-2.5">{p.role}</td>
                    <td className="px-4 py-2.5">{p.department}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[p.status]}`}>
                        {p.status === 'valid' ? 'Ready' : p.issues[0]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length > 200 && (
              <p className="border-t border-line px-4 py-2.5 text-sm text-muted">Showing the first 200 of {shown.length} rows.</p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              disabled={counts.valid === 0}
              onClick={() => navigate('../certificate')}
              className="rounded-md bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to certificate design
            </button>
          </div>
        </>
      )}
    </div>
  )
}
