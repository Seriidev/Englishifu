import { Link } from 'react-router-dom'

export default function StudyCertificatesPage() {
  return (
    <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:p-12">
      <h2 className="text-lg font-bold text-slate-900">
        Certificates
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Finish a TOEFL Full Test to earn a certificate of completion.
      </p>
      <Link
        to="/full-test"
        className="mt-6 inline-flex rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
      >
        Start Full Test
      </Link>
    </section>
  )
}
