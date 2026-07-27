export interface ResultMetric {
  value: string
  label: string
  photo: string
  gradient: string
  title: string
  description: string
}

/** Single stack of result pills — blue-only gradients */
export const resultMetrics: ResultMetric[] = [
  {
    value: '85%',
    label: 'Fluency Up',
    photo: 'https://i.pravatar.cc/120?img=9',
    gradient: 'from-[#1e4fd6] to-[#4F7CFF]',
    title: 'Speak With Confidence',
    description:
      'Guided speaking clubs push fluency up fast — learners go from hesitant answers to natural conversation.',
  },
  {
    value: '120+',
    label: 'Clubs / Mo',
    photo: 'https://i.pravatar.cc/120?img=15',
    gradient: 'from-[#2563eb] to-[#60a5fa]',
    title: 'Practice Every Week',
    description:
      'Dozens of live sessions every month mean there is always a club that fits your level and schedule.',
  },
  {
    value: '8 max',
    label: 'Per Group',
    photo: 'https://i.pravatar.cc/120?img=32',
    gradient: 'from-[#1d4ed8] to-[#93c5fd]',
    title: 'Small Groups, Real Attention',
    description:
      'No more than eight people in a room — everyone speaks, gets feedback, and stays engaged.',
  },
  {
    value: '4.9',
    label: 'Club Rating',
    photo: 'https://i.pravatar.cc/120?img=20',
    gradient: 'from-[#3b82f6] to-[#93c5fd]',
    title: 'Loved by Learners',
    description:
      'Students rate clubs highly for friendly coaches, clear topics, and measurable progress.',
  },
  {
    value: '45m',
    label: 'Live Session',
    photo: 'https://i.pravatar.cc/120?img=44',
    gradient: 'from-[#1e40af] to-[#4F7CFF]',
    title: 'Focused Live Practice',
    description:
      'Short, intense sessions keep energy high and make it easy to fit speaking into a busy week.',
  },
]
