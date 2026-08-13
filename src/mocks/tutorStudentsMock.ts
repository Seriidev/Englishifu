import type { TutorStudent } from '../types/tutorStudent'
import type { StudentProfile } from '../types/user'

export const mockTutorStudents: TutorStudent[] = [
  {
    id: 'stu-demo-1',
    fullName: 'Aisha Rahman',
    handle: 'aisharahman',
    avatarUrl: 'https://i.pravatar.cc/96?img=32',
    cefrLevel: 'B1',
    lessonsCompleted: 12,
    nextLessonDate: 'Thu, Aug 14 · 4:00 PM',
    status: 'active',
  },
  {
    id: 'stu-demo-2',
    fullName: 'Daniel Kim',
    handle: 'danielkim',
    avatarUrl: 'https://i.pravatar.cc/96?img=12',
    cefrLevel: 'B2',
    lessonsCompleted: 28,
    nextLessonDate: 'Fri, Aug 15 · 6:30 PM',
    status: 'active',
  },
  {
    id: 'stu-demo-3',
    fullName: 'Marta Lopez',
    handle: 'martalopez',
    avatarUrl: 'https://i.pravatar.cc/96?img=47',
    cefrLevel: 'A2',
    lessonsCompleted: 5,
    nextLessonDate: 'Mon, Aug 18 · 2:00 PM',
    status: 'active',
  },
  {
    id: 'stu-demo-4',
    fullName: 'Omar Hassan',
    handle: 'omarhassan',
    avatarUrl: 'https://i.pravatar.cc/96?img=15',
    cefrLevel: 'C1',
    lessonsCompleted: 41,
    status: 'paused',
  },
  {
    id: 'stu-demo-5',
    fullName: 'Elena Petrova',
    handle: 'elenapetrova',
    avatarUrl: 'https://i.pravatar.cc/96?img=20',
    cefrLevel: 'B1',
    lessonsCompleted: 9,
    nextLessonDate: 'Wed, Aug 20 · 5:00 PM',
    status: 'active',
  },
]

/** Demo list + any registered students from localStorage (so Meet invites work end-to-end). */
export function getStudentsForTutor(): TutorStudent[] {
  const registered: TutorStudent[] = []
  try {
    const raw = localStorage.getItem('englishifu_users_v1')
    if (raw) {
      const users = JSON.parse(raw) as StudentProfile[]
      for (const u of users) {
        if (u.role !== 'student' || !u.handle) continue
        registered.push({
          id: u.id,
          fullName: u.fullName,
          handle: u.handle,
          avatarUrl: u.avatarUrl,
          cefrLevel: u.cefrLevel,
          lessonsCompleted: 0,
          status: 'active',
        })
      }
    }
  } catch {
    /* ignore */
  }

  const taken = new Set(registered.map((s) => s.handle.toLowerCase()))
  const demos = mockTutorStudents.filter(
    (s) => !taken.has(s.handle.toLowerCase()),
  )
  return [...registered, ...demos]
}
