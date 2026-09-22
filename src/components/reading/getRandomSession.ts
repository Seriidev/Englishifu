import { getRandomSession as pickRandomSession, shuffleInPlace } from '../../utils/randomSession'
import type {
  AcademicPassage,
  DailyLifeQuestion,
  ReadInDailyLifeItem,
  ReadingSession,
  ToeflReadingBank,
} from './types'

/** Inclusive. Complete the Words is 2 or 3; Daily Life is 2–4; Academic is 1–2. */
export function randomCount(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/**
 * Shuffle option order and point `correct_option_id` at the same option
 * in the new array (ids travel with their text so explanations stay valid).
 */
export function shuffleQuestionOptions(question: DailyLifeQuestion): DailyLifeQuestion {
  const originalCorrect = question.options.find(
    (option) => option.id === question.correct_option_id,
  )
  const options = shuffleInPlace(question.options.map((option) => ({ ...option })))
  const correct = options.find((option) => option.id === originalCorrect?.id)
    ?? options.find((option) => option.text === originalCorrect?.text)

  return {
    ...question,
    options,
    correct_option_id: correct?.id ?? question.correct_option_id,
  }
}

function prepareDailyLifeItem(item: ReadInDailyLifeItem): ReadInDailyLifeItem {
  return {
    ...item,
    questions: item.questions.map(shuffleQuestionOptions),
  }
}

function prepareAcademicPassage(item: AcademicPassage): AcademicPassage {
  return {
    ...item,
    questions: item.questions.map(shuffleQuestionOptions),
  }
}

/** New random sample on every call: unique items within the session. */
export function getRandomSession(
  json: ToeflReadingBank,
  counts: {
    completeTheWords?: number
    readInDailyLife?: number
    academicPassages?: number
  } = {},
): ReadingSession {
  const picked = pickRandomSession(
    {
      complete_the_words: json.complete_the_words,
      read_in_daily_life: json.read_in_daily_life,
      academic_passages: json.academic_passages,
    },
    {
      complete_the_words: counts.completeTheWords ?? randomCount(2, 3),
      read_in_daily_life: counts.readInDailyLife ?? randomCount(2, 4),
      academic_passages: counts.academicPassages ?? randomCount(1, 2),
    },
  )

  return {
    complete_the_words: picked.complete_the_words,
    read_in_daily_life: picked.read_in_daily_life.map(prepareDailyLifeItem),
    academic_passages: picked.academic_passages.map(prepareAcademicPassage),
  }
}

export function isBlankCorrect(value: string, answer: string): boolean {
  return value.trim().toLowerCase() === answer.trim().toLowerCase()
}

export function countSessionAnswers(session: ReadingSession): number {
  const blanks = session.complete_the_words.reduce(
    (sum, passage) =>
      sum + passage.tokens.filter((token) => token.type === 'blank').length,
    0,
  )
  const questions = session.read_in_daily_life.reduce(
    (sum, item) => sum + item.questions.length,
    0,
  )
  const academic = session.academic_passages.reduce(
    (sum, item) => sum + item.questions.length,
    0,
  )
  return blanks + questions + academic
}
