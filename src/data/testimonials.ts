export interface Testimonial {
  id: number
  quote: string
  name: string
  photo: string
  toeflScore: number
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      'Englishifu helped me raise my TOEFL score from 78 to 108 in just three months. The tutors are incredibly supportive and the practice tests feel just like the real exam.',
    name: 'Aisha Rahman',
    photo: 'https://i.pravatar.cc/300?img=47',
    toeflScore: 108,
  },
  {
    id: 2,
    quote:
      'Speaking clubs gave me the confidence I needed for university interviews. I went from nervous silence to leading conversations in English.',
    name: 'Carlos Mendes',
    photo: 'https://i.pravatar.cc/300?img=33',
    toeflScore: 102,
  },
  {
    id: 3,
    quote:
      'My personal tutor built a custom study plan around my weak areas. The free materials and simulations made a huge difference before test day.',
    name: 'Yuki Tanaka',
    photo: 'https://i.pravatar.cc/300?img=26',
    toeflScore: 114,
  },
]
