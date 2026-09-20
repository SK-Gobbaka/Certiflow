export default function ComingNext({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-paper p-10 text-center">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-muted">This step is built in the next session.</p>
    </div>
  )
}
