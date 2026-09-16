import { getRandomSession, shuffleCopy } from '../../utils/randomSession'
import type {
  BuildASentenceItem,
  ToeflWritingBank,
  WritingSession,
} from './types'

export const DEFAULT_BUILD_A_SENTENCE_COUNT = 8
export const DEFAULT_WRITE_AN_EMAIL_COUNT = 1
export const DEFAULT_ACADEMIC_DISCUSSION_COUNT = 1

/** New random sample on every call: unique items within the session. */
export function getRandomWritingSession(
  json: ToeflWritingBank,
  counts: {
    buildASentence?: number
    writeAnEmail?: number
    academicDiscussion?: number
  } = {},
): WritingSession {
  return getRandomSession(
    {
      build_a_sentence: json.build_a_sentence,
      write_an_email: json.write_an_email,
      write_for_academic_discussion: json.write_for_academic_discussion,
    },
    {
      build_a_sentence: counts.buildASentence ?? DEFAULT_BUILD_A_SENTENCE_COUNT,
      write_an_email: counts.writeAnEmail ?? DEFAULT_WRITE_AN_EMAIL_COUNT,
      write_for_academic_discussion:
        counts.academicDiscussion ?? DEFAULT_ACADEMIC_DISCUSSION_COUNT,
    },
  )
}

/** Fisher–Yates copy of `chips_correct_order` for the chip pool. */
export function shuffleSentenceChips(item: BuildASentenceItem): string[] {
  return shuffleCopy(item.chips_correct_order)
}

/** Ignore case and spaces around punctuation when scoring assembled sentences. */
export function normalizeWritingAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*([.,!?;:])\s*/g, '$1')
    .trim()
}

export function assembleBuildSentence(
  item: BuildASentenceItem,
  chips: readonly string[],
): string {
  const middle = chips.join(' ').trim()
  let out = item.response_prefix.trim()
  if (middle) {
    out = out ? `${out} ${middle}` : middle
  }
  const suffix = item.response_suffix.trim()
  if (suffix) {
    const needsSpace = out.length > 0 && !/^[.,!?;:]/.test(suffix)
    out += (needsSpace ? ' ' : '') + suffix
  }
  return out
}

export function isBuildSentenceCorrect(
  item: BuildASentenceItem,
  chips: readonly string[],
): boolean {
  return (
    normalizeWritingAnswer(assembleBuildSentence(item, chips)) ===
    normalizeWritingAnswer(item.answer)
  )
}

export function writingStepLabel(
  kind:
    | 'build_a_sentence'
    | 'write_an_email'
    | 'write_for_academic_discussion',
): string {
  if (kind === 'build_a_sentence') return 'Build a Sentence'
  if (kind === 'write_an_email') return 'Write an Email'
  return 'Write for an Academic Discussion'
}
