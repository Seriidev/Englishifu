import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getTutorProfileByHandle } from '../mocks/tutorProfileMock'
import type { TutorPublicProfile } from '../types/tutorProfile'
import type { PublicTutor } from '../types/user'

export function useOwnTutorProfile() {
  const { user } = useAuth()
  const tutor = user?.role === 'tutor' ? user : null
  const [profile, setProfile] = useState<TutorPublicProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tutor?.handle) {
      setProfile(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    void getTutorProfileByHandle(tutor.handle).then((next) => {
      if (cancelled) return
      setProfile(next)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [tutor?.handle])

  return { tutor, profile, loading } as {
    tutor: PublicTutor | null
    profile: TutorPublicProfile | null
    loading: boolean
  }
}
