export interface StudentLearningStats {
  learningHours: number
  coursesCompleted: number
  practiceCompleted: number
  testsCompleted: number
}

export interface StudentProfileTabCounts {
  badgesEarned: number
  badgesTotal: number
  certifications: number
  certificatesOfCompletion: number
}

export const mockStudentLearningStats = (
  _userId: string,
): StudentLearningStats => ({
  learningHours: 0,
  coursesCompleted: 0,
  practiceCompleted: 0,
  testsCompleted: 0,
})

export const mockStudentProfileTabCounts = (
  _userId: string,
): StudentProfileTabCounts => ({
  badgesEarned: 0,
  badgesTotal: 182,
  certifications: 0,
  certificatesOfCompletion: 0,
})
