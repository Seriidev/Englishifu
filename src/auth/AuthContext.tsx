import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { PublicUser } from '../types/user'
import {
  applyTutorServerStatus,
  changePassword as changePasswordRequest,
  completeTutorProfile,
  fetchSessionUser,
  loginUser,
  logoutSession,
  registerStudent,
  registerTutor,
  saveStudentPlacementResult,
  updateStudentProfile,
  updateTutorProfile,
  type CompleteTutorProfileInput,
  type CreateStudentInput,
  type CreateTutorInput,
  type SaveStudentPlacementInput,
  type UpdateStudentProfileInput,
  type UpdateTutorProfileInput,
} from '../utils/authStorage'
import { clearApiToken, setApiToken, syncApiSession } from '../utils/bookingApi'
import { fetchTutorMe } from '../utils/adminApi'

async function syncTutorModeration(user: PublicUser) {
  if (user.role !== 'tutor') return user
  try {
    await syncApiSession(user)
    const me = await fetchTutorMe()
    if (me?.status) {
      return (
        applyTutorServerStatus(
          me.status as 'incomplete' | 'pending' | 'approved',
          user,
        ) ?? user
      )
    }
  } catch {
    /* offline */
  }
  return user
}

interface AuthContextValue {
  user: PublicUser | null
  isLoading: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }>
  registerAsStudent: (
    input: CreateStudentInput,
  ) => Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }>
  registerAsTutor: (
    input: CreateTutorInput,
  ) => Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }>
  completeProfile: (
    input: CompleteTutorProfileInput,
  ) => Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }>
  updateStudent: (
    input: UpdateStudentProfileInput,
  ) => Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }>
  updateTutor: (
    input: UpdateTutorProfileInput,
  ) => Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }>
  savePlacementResult: (
    input: SaveStudentPlacementInput,
  ) => Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }>
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }>
  refreshUser: () => Promise<PublicUser | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const session = await fetchSessionUser()
      if (cancelled) return
      if (!session) {
        setUser(null)
        setIsLoading(false)
        return
      }
      const next =
        session.role === 'tutor'
          ? await syncTutorModeration(session)
          : session
      if (!cancelled) {
        setUser(next)
        setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password)
    if ('error' in result) return { ok: false as const, error: result.error }
    await syncApiSession(result.user)
    const next =
      result.user.role === 'tutor'
        ? await syncTutorModeration(result.user)
        : result.user
    setUser(next)
    return { ok: true as const, user: next }
  }, [])

  const registerAsStudent = useCallback(async (input: CreateStudentInput) => {
    const result = await registerStudent(input)
    if ('error' in result) return { ok: false as const, error: result.error }
    setUser(result.user)
    void syncApiSession(result.user)
    return { ok: true as const, user: result.user }
  }, [])

  const registerAsTutor = useCallback(async (input: CreateTutorInput) => {
    const result = await registerTutor(input)
    if ('error' in result) return { ok: false as const, error: result.error }
    setUser(result.user)
    void syncApiSession(result.user)
    return { ok: true as const, user: result.user }
  }, [])

  const completeProfile = useCallback(
    async (input: CompleteTutorProfileInput) => {
      if (!user || user.role !== 'tutor') {
        return { ok: false as const, error: 'Not signed in as tutor' }
      }
      const result = await completeTutorProfile(user.id, input)
      if ('error' in result) return { ok: false as const, error: result.error }
      setUser(result.user)
      void syncApiSession(result.user)
      return { ok: true as const, user: result.user }
    },
    [user],
  )

  const updateStudent = useCallback(
    async (input: UpdateStudentProfileInput) => {
      if (!user || user.role !== 'student') {
        return { ok: false as const, error: 'Not signed in as student' }
      }
      const result = await updateStudentProfile(user.id, input)
      if ('error' in result) return { ok: false as const, error: result.error }
      setUser(result.user)
      return { ok: true as const, user: result.user }
    },
    [user],
  )

  const updateTutor = useCallback(
    async (input: UpdateTutorProfileInput) => {
      if (!user || user.role !== 'tutor') {
        return { ok: false as const, error: 'Not signed in as tutor' }
      }
      const result = await updateTutorProfile(user.id, input)
      if ('error' in result) return { ok: false as const, error: result.error }
      if (result.user.role !== 'tutor') {
        return {
          ok: false as const,
          error: 'Could not save teacher profile. Please log in again.',
        }
      }
      setUser(result.user)
      return { ok: true as const, user: result.user }
    },
    [user],
  )

  const savePlacementResult = useCallback(
    async (input: SaveStudentPlacementInput) => {
      if (!user || user.role !== 'student') {
        return { ok: false as const, error: 'Not signed in as student' }
      }
      const result = await saveStudentPlacementResult(user.id, input)
      if ('error' in result) return { ok: false as const, error: result.error }
      setUser(result.user)
      return { ok: true as const, user: result.user }
    },
    [user],
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) {
        return { ok: false as const, error: 'Not signed in' }
      }
      const result = await changePasswordRequest(currentPassword, newPassword)
      if ('error' in result) return { ok: false as const, error: result.error }
      setUser(result.user)
      return { ok: true as const, user: result.user }
    },
    [user],
  )

  const refreshUser = useCallback(async () => {
    const session = await fetchSessionUser()
    if (!session) return null
    const next =
      session.role === 'tutor'
        ? await syncTutorModeration(session)
        : session
    setUser(next)
    return next
  }, [])

  const logout = useCallback(async () => {
    await logoutSession()
    clearApiToken()
    setApiToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      registerAsStudent,
      registerAsTutor,
      completeProfile,
      updateStudent,
      updateTutor,
      savePlacementResult,
      changePassword,
      refreshUser,
      logout,
    }),
    [
      user,
      isLoading,
      login,
      registerAsStudent,
      registerAsTutor,
      completeProfile,
      updateStudent,
      updateTutor,
      savePlacementResult,
      changePassword,
      refreshUser,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
