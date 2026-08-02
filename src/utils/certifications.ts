import type { TutorCertification } from '../types/user'

/** Migrate legacy string[] certifications → TutorCertification[] */
export function normalizeCertifications(raw: unknown): TutorCertification[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    if (typeof item === 'string') {
      return {
        id: crypto.randomUUID(),
        name: item,
      }
    }
    const cert = item as TutorCertification
    return {
      id: cert.id || crypto.randomUUID(),
      name: cert.name ?? '',
      imageUrl: cert.imageUrl,
      uploadedAt: cert.uploadedAt,
    }
  }).filter((c) => c.name.trim().length > 0)
}
