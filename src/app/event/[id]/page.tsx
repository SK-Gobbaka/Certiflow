import { redirect } from 'next/navigation'

export default async function EventIndexPage({ params }: { params: { id: string } }) {
  const { id } = await params
  redirect(`/event/${id}/participants`)
}
