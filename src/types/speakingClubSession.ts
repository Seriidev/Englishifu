export interface SpeakingClubSession {
  id: string
  dateLabel: string
  dateSubtext: string
  time: string
  title: string
  description: string
  hostName: string
  hostAvatarUrl?: string
  topicTags: string[]
  levelTag: string
  durationMinutes: number
  spotsTotal: number
  spotsFilled: number
  participantAvatars: string[]
  meetingPlatform: 'google-meet'
  isSaved: boolean
  /** Used for Today / Tomorrow / This Week chips */
  dayGroup: 'today' | 'tomorrow' | 'this-week' | 'later'
}

export interface SpeakingClubFilters {
  search: string
  topic?: string
  level?: string
  date?: string
  time?: string
  availability?: 'open' | 'any'
  dayChip: 'today' | 'tomorrow' | 'this-week' | 'all'
}
