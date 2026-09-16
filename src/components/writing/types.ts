/** Source JSON: `src/data/toefl-writing.json` (do not invent content). */

export interface ToeflWritingMeta {
  title: string
  sections: string[]
  counts: {
    build_a_sentence: number
    write_an_email: number
    write_for_academic_discussion: number
  }
  notice: string
}

export interface BuildASentenceItem {
  id: string
  number: number
  prompt: string
  response_prefix: string
  response_suffix: string
  chips_correct_order: string[]
  /** One recorded shuffle in the JSON — do not use for live randomization. */
  chips_shuffled?: string[]
  answer: string
}

export interface WriteAnEmailItem {
  id: string
  number: number
  scenario: string
  to: string
  subject: string
  instructions: string[]
  time_limit_minutes: number
  min_words: number | null
  sample_answer: string | null
}

export interface AcademicDiscussionPost {
  name: string
  text: string
}

export interface WriteForAcademicDiscussionItem {
  id: string
  number: number
  course: string
  professor: string
  question: string
  student_posts: AcademicDiscussionPost[]
  instructions: string[]
  time_limit_minutes: number
  min_words: number
  sample_answer: string | null
}

export interface ToeflWritingBank {
  meta: ToeflWritingMeta
  build_a_sentence: BuildASentenceItem[]
  write_an_email: WriteAnEmailItem[]
  write_for_academic_discussion: WriteForAcademicDiscussionItem[]
}

export interface WritingSession {
  build_a_sentence: BuildASentenceItem[]
  write_an_email: WriteAnEmailItem[]
  write_for_academic_discussion: WriteForAcademicDiscussionItem[]
}

export interface WritingRubricScores {
  grammar: number
  vocabulary: number
  organization: number
  coherence: number
}
