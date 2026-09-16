/** Source JSON: `src/data/toefl-listening.json` (do not invent content). */

export interface ToeflListeningMeta {
  title: string
  sections: string[]
  counts: {
    listen_and_choose: number
    listen_to_a_conversation: number
    listen_to_an_announcement: number
    listen_to_an_academic_talk: number
    total_questions: number
  }
  /** Policy for implementers — never surface speaker/voice to the listener. */
  speaker_label_policy: string
  notice: string
}

/**
 * TTS voice key from JSON (`male_adult`, `female_young`, …).
 * Metadata only: never speak, print, or subtitle this value.
 */
export type ListeningVoiceKey = string

export interface ListeningSpeaker {
  id: string
  role: string
  /** Voice id for TTS only — never announce to the listener. */
  voice: ListeningVoiceKey
}

export interface ListeningLine {
  /** Speaker id or role key used only to pick a TTS voice. */
  speaker: string
  text: string
}

export interface ListeningOption {
  id: string
  text: string
}

export interface ListeningQuestion {
  id: string
  number: number
  prompt: string
  options: ListeningOption[]
  correct_option_id: string
  explanation: string
}

export interface ListenAndChooseItem {
  id: string
  number: number
  heard_line: string
  options: ListeningOption[]
  correct_option_id: string
  explanation: string
}

export interface ConversationItem {
  id: string
  setting: string
  speakers: ListeningSpeaker[]
  lines: ListeningLine[]
  questions: ListeningQuestion[]
}

export interface AnnouncementItem {
  id: string
  setting: string
  speaker: ListeningSpeaker
  text: string
  questions: ListeningQuestion[]
}

export interface AcademicTalkItem {
  id: string
  course: string
  setting: string
  lines: ListeningLine[]
  questions: ListeningQuestion[]
}

export interface ToeflListeningBank {
  meta: ToeflListeningMeta
  listen_and_choose: ListenAndChooseItem[]
  listen_to_a_conversation: ConversationItem[]
  listen_to_an_announcement: AnnouncementItem[]
  listen_to_an_academic_talk: AcademicTalkItem[]
}

export interface ListeningSession {
  listen_and_choose: ListenAndChooseItem[]
  listen_to_a_conversation: ConversationItem[]
  listen_to_an_announcement: AnnouncementItem[]
  listen_to_an_academic_talk: AcademicTalkItem[]
}

export type ListeningTaskKind =
  | 'listen_and_choose'
  | 'listen_to_a_conversation'
  | 'listen_to_an_announcement'
  | 'listen_to_an_academic_talk'

export type ListeningPlayable =
  | { kind: 'listen_and_choose'; item: ListenAndChooseItem }
  | { kind: 'listen_to_a_conversation'; item: ConversationItem }
  | { kind: 'listen_to_an_announcement'; item: AnnouncementItem }
  | { kind: 'listen_to_an_academic_talk'; item: AcademicTalkItem }
