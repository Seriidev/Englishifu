export interface FeatureStat {
  value: string
  suffix: string
  title: string
  description: string
}

export const featureStats: FeatureStat[] = [
  {
    value: '10K',
    suffix: '+',
    title: 'Students Enrolled',
    description: 'Trusted by thousands of learners worldwide',
  },
  {
    value: '50',
    suffix: '+',
    title: 'TOEFL Courses',
    description: 'Structured programs across all skill levels',
  },
  {
    value: '500',
    suffix: '+',
    title: 'Expert Tutors',
    description: 'Certified teachers with real-world experience',
  },
  {
    value: '4.9',
    suffix: '',
    title: 'Average Rating',
    description: 'Highly rated by our learning community',
  },
]
