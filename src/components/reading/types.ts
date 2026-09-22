/** Source JSON: `src/data/toefl-reading.json` (do not invent content). */

export interface ToeflReadingMeta {
  title: string
  sections: string[]
  blank_total: number
  question_total: number
  notice: string
}

export interface TextToken {
  type: 'text'
  value: string
}

export interface BlankToken {
  type: 'blank'
  id: number
  /** Visible stem of the incomplete word (e.g. "Wh"). */
  stem: string
  /** How many letters the student must type. */
  length: number
  /** Correct missing letters (compare case-insensitively). */
  answer: string
  global_id?: number
}

export type CompleteTheWordsToken = TextToken | BlankToken

export interface CompleteTheWordsBlank {
  id: number
  stem: string
  answer: string
  full_word?: string
  length: number
  global_id?: number
}

export interface CompleteTheWordsPassage {
  id: string
  number: number
  title: string
  instructions: string
  tokens: CompleteTheWordsToken[]
  paragraph_with_blanks?: string
  paragraph_with_answers?: string
  paragraph_solved?: string
  blank_count?: number
  global_range?: [number, number]
  blanks?: CompleteTheWordsBlank[]
}

export interface DailyLifeOption {
  id: string
  text: string
}

export interface DailyLifeQuestion {
  id: string
  number: number
  prompt: string
  options: DailyLifeOption[]
  correct_option_id: string
  explanation: string
}

interface DailyLifeBase {
  id: string
  number: number
  instructions: string
  questions: DailyLifeQuestion[]
}

export interface EmailDailyLifeItem extends DailyLifeBase {
  type: 'email'
  subject: string
  body: string[]
}

export interface AnnouncementDailyLifeItem extends DailyLifeBase {
  type: 'announcement'
  body: string[]
}

export interface TextChainMessage {
  sender: string
  time: string
  text: string
}

export interface TextChainDailyLifeItem extends DailyLifeBase {
  type: 'text_chain'
  messages: TextChainMessage[]
}

export type ReadInDailyLifeItem =
  | EmailDailyLifeItem
  | AnnouncementDailyLifeItem
  | TextChainDailyLifeItem

export interface AcademicPassage {
  id: string
  number: number
  title: string
  instructions: string
  paragraphs: string[]
  questions: DailyLifeQuestion[]
}

export interface ToeflReadingBank {
  meta: ToeflReadingMeta
  complete_the_words: CompleteTheWordsPassage[]
  read_in_daily_life: ReadInDailyLifeItem[]
  academic_passages: AcademicPassage[]
}

export interface ReadingSession {
  complete_the_words: CompleteTheWordsPassage[]
  read_in_daily_life: ReadInDailyLifeItem[]
  academic_passages: AcademicPassage[]
}
