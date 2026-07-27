export interface SpeakingClubMeeting {
  id: number
  level: string
  date: string
  time: string
  title: string
  spotsLeft: number
  image: string
  imageAlt: string
}

export const speakingClubMeetings: SpeakingClubMeeting[] = [
  {
    id: 1,
    level: 'B1-B2',
    date: 'April 18',
    time: '7:00 PM',
    title: 'Travel Stories: Dream Destinations',
    spotsLeft: 4,
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
    imageAlt: 'Group of friends talking and practicing English',
  },
  {
    id: 2,
    level: 'B2-C1',
    date: 'April 20',
    time: '11:00 AM',
    title: 'Work-Life Balance: Finding Harmony',
    spotsLeft: 6,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    imageAlt: 'People discussing in a casual meeting',
  },
  {
    id: 3,
    level: 'A2-B1',
    date: 'April 22',
    time: '7:00 PM',
    title: 'Food & Culture: Culinary Traditions',
    spotsLeft: 5,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    imageAlt: 'Students collaborating around a table',
  },
]
