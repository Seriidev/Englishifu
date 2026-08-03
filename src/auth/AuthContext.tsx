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
  completeTutorProfile,
  getSessionUser,
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

interface AuthContextValue {
  user: PublicUser | null
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
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(() => getSessionUser())

  // Re-hydrate after migrations / hard refresh
  useEffect(() => {
    setUser(getSessionUser())
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password)
    if ('error' in result) return { ok: false as const, error: result.error }
    setUser(result.user)
    return { ok: true as const, user: result.user }
  }, [])

  const registerAsStudent = useCallback(async (input: CreateStudentInput) => {
    const result = await registerStudent(input)
    if ('error' in result) return { ok: false as const, error: result.error }
    setUser(result.user)
    return { ok: true as const, user: result.user }
  }, [])

  const registerAsTutor = useCallback(async (input: CreateTutorInput) => {
    const result = await registerTutor(input)
    if ('error' in result) return { ok: false as const, error: result.error }
    setUser(result.user)
    return { ok: true as const, user: result.user }
  }, [])

  const completeProfile = useCallback(
    async (input: CompleteTutorProfileInput) => {
      if (!user || user.role !== 'tutor') {
        return { ok: false as const, error: 'Not signed in as tutor' }
      }
      const result = completeTutorProfile(user.id, input)
      if ('error' in result) return { ok: false as const, error: result.error }
      setUser(result.user)
      return { ok: true as const, user: result.user }
    },
    [user],
  )

  const updateStudent = useCallback(
    async (input: UpdateStudentProfileInput) => {
      if (!user || user.role !== 'student') {
        return { ok: false as const, error: 'Not signed in as student' }
      }
      const result = updateStudentProfile(user.id, input)
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
      const result = updateTutorProfile(user.id, input)
      if ('error' in result) return { ok: false as const, error: result.error }
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
      const result = saveStudentPlacementResult(user.id, input)
      if ('error' in result) return { ok: false as const, error: result.error }
      setUser(result.user)
      return { ok: true as const, user: result.user }
    },
    [user],
  )

  const logout = useCallback(() => {
    logoutSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      login,
      registerAsStudent,
      registerAsTutor,
      completeProfile,
      updateStudent,
      updateTutor,
      savePlacementResult,
      logout,
    }),
    [
      user,
      login,
      registerAsStudent,
      registerAsTutor,
      completeProfile,
      updateStudent,
      updateTutor,
      savePlacementResult,
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
