import { GraduationCap } from 'lucide-react'
import type { TutorCertification } from '../../types/user'

export default function CertificationsTab({
  certifications,
}: {
  certifications: TutorCertification[]
}) {
  if (certifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
        <p className="text-base font-semibold text-ink">No certifications yet</p>
        <p className="mt-1 text-sm text-muted">
          Add TEFL, CELTA, and other credentials in Complete Profile.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {certifications.map((cert) => (
        <div
          key={cert.id}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 pr-4 shadow-sm"
        >
          {cert.imageUrl ? (
            <img
              src={cert.imageUrl}
              alt={cert.name}
              className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-100"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-light">
              <GraduationCap className="h-5 w-5 text-brand" aria-hidden />
            </span>
          )}
          <span className="text-sm font-semibold text-ink">{cert.name}</span>
        </div>
      ))}
    </div>
  )
}
