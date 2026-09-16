import { getRandomSession as pickRandomSession, shuffleInPlace } from '../../utils/randomSession'
import type {
  DailyLifeQuestion,
  ReadInDailyLifeItem,
  ReadingSession,
  ToeflReadingBank,
} from './types'

export const DEFAULT_COMPLETE_THE_WORDS_COUNT = 5
export const DEFAULT_READ_IN_DAILY_LIFE_COUNT = 4

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

/** New random sample on every call: unique items within the session. */
export function getRandomSession(
  json: ToeflReadingBank,
  counts: {
    completeTheWords?: number
    readInDailyLife?: number
  } = {},
): ReadingSession {
  const picked = pickRandomSession(
    {
      complete_the_words: json.complete_the_words,
      read_in_daily_life: json.read_in_daily_life,
    },
    {
      complete_the_words: counts.completeTheWords ?? DEFAULT_COMPLETE_THE_WORDS_COUNT,
      read_in_daily_life: counts.readInDailyLife ?? DEFAULT_READ_IN_DAILY_LIFE_COUNT,
    },
  )

  return {
    complete_the_words: picked.complete_the_words,
    read_in_daily_life: picked.read_in_daily_life.map(prepareDailyLifeItem),
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
  return blanks + questions
}
