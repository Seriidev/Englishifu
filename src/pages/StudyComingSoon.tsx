import { Link } from 'react-router-dom'

interface StudyComingSoonProps {
  title: string
  description: string
}

export default function StudyComingSoon({
  title,
  description,
}: StudyComingSoonProps) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-12">
      <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
        Coming soon
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {description}
      </p>
      <Link
        to="/study"
        className="mt-6 inline-flex rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
      >
        Back to Dashboard
      </Link>
    </section>
  )
}
