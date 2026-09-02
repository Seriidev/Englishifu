import CertificationsTab from '../../components/tutor-profile/CertificationsTab'
import { useOwnTutorProfile } from '../../hooks/useOwnTutorProfile'
import { normalizeCertifications } from '../../utils/certifications'

export default function TutorCertificatesPage() {
  const { tutor, profile, loading } = useOwnTutorProfile()

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>
  }

  const certifications = normalizeCertifications(
    tutor?.certifications ?? profile?.certifications ?? [],
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Certificates
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Credentials students see on your public profile.
        </p>
      </div>
      <CertificationsTab certifications={certifications} />
    </div>
  )
}
