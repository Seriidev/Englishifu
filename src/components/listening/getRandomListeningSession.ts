import { getRandomSession, shuffleInPlace } from '../../utils/randomSession'
import type {
  AcademicTalkItem,
  AnnouncementItem,
  ConversationItem,
  ListenAndChooseItem,
  ListeningOption,
  ListeningQuestion,
  ListeningSession,
  ListeningTaskKind,
  ToeflListeningBank,
} from './types'

export const DEFAULT_LISTEN_AND_CHOOSE_COUNT = 5
export const DEFAULT_CONVERSATION_COUNT = 2
export const DEFAULT_ANNOUNCEMENT_COUNT = 2
export const DEFAULT_ACADEMIC_TALK_COUNT = 1

interface ShufflableQuestion {
  options: ListeningOption[]
  correct_option_id: string
}

/**
 * Shuffle option order and keep `correct_option_id` pointing at the same
 * option (ids travel with their text so explanations stay valid).
 */
export function shuffleQuestionOptions<T extends ShufflableQuestion>(question: T): T {
  const originalCorrect = question.options.find(
    (option) => option.id === question.correct_option_id,
  )
  const options = shuffleInPlace(question.options.map((option) => ({ ...option })))
  const correct =
    options.find((option) => option.id === originalCorrect?.id) ??
    options.find((option) => option.text === originalCorrect?.text)

  return {
    ...question,
    options,
    correct_option_id: correct?.id ?? question.correct_option_id,
  }
}

function prepareChoose(item: ListenAndChooseItem): ListenAndChooseItem {
  return shuffleQuestionOptions({ ...item, options: item.options.map((o) => ({ ...o })) })
}

function prepareQuestions<T extends { questions: ListeningQuestion[] }>(item: T): T {
  return {
    ...item,
    questions: item.questions.map((question) => shuffleQuestionOptions({ ...question })),
  }
}

/** New random sample on every call: unique items within the session. */
export function getRandomListeningSession(
  json: ToeflListeningBank,
  counts: {
    listenAndChoose?: number
    conversation?: number
    announcement?: number
    academicTalk?: number
  } = {},
): ListeningSession {
  const picked = getRandomSession(
    {
      listen_and_choose: json.listen_and_choose,
      listen_to_a_conversation: json.listen_to_a_conversation,
      listen_to_an_announcement: json.listen_to_an_announcement,
      listen_to_an_academic_talk: json.listen_to_an_academic_talk,
    },
    {
      listen_and_choose: counts.listenAndChoose ?? DEFAULT_LISTEN_AND_CHOOSE_COUNT,
      listen_to_a_conversation: counts.conversation ?? DEFAULT_CONVERSATION_COUNT,
      listen_to_an_announcement: counts.announcement ?? DEFAULT_ANNOUNCEMENT_COUNT,
      listen_to_an_academic_talk: counts.academicTalk ?? DEFAULT_ACADEMIC_TALK_COUNT,
    },
  )

  return {
    listen_and_choose: picked.listen_and_choose.map(prepareChoose),
    listen_to_a_conversation: picked.listen_to_a_conversation.map(prepareQuestions),
    listen_to_an_announcement: picked.listen_to_an_announcement.map(prepareQuestions),
    listen_to_an_academic_talk: picked.listen_to_an_academic_talk.map(prepareQuestions),
  }
}

export function chooseAsQuestion(item: ListenAndChooseItem): ListeningQuestion {
  return {
    id: item.id,
    number: item.number,
    prompt: 'Choose the best response.',
    options: item.options,
    correct_option_id: item.correct_option_id,
    explanation: item.explanation,
  }
}

export function questionsForItem(
  kind: ListeningTaskKind,
  session: ListeningSession,
  id: string,
): ListeningQuestion[] {
  if (kind === 'listen_and_choose') {
    const item = session.listen_and_choose.find((entry) => entry.id === id)
    return item ? [chooseAsQuestion(item)] : []
  }
  if (kind === 'listen_to_a_conversation') {
    return session.listen_to_a_conversation.find((entry) => entry.id === id)?.questions ?? []
  }
  if (kind === 'listen_to_an_announcement') {
    return session.listen_to_an_announcement.find((entry) => entry.id === id)?.questions ?? []
  }
  return session.listen_to_an_academic_talk.find((entry) => entry.id === id)?.questions ?? []
}

export function countSessionAnswers(session: ListeningSession): number {
  return (
    session.listen_and_choose.length +
    session.listen_to_a_conversation.reduce((sum, item) => sum + item.questions.length, 0) +
    session.listen_to_an_announcement.reduce((sum, item) => sum + item.questions.length, 0) +
    session.listen_to_an_academic_talk.reduce((sum, item) => sum + item.questions.length, 0)
  )
}

export function listeningStepLabel(kind: ListeningTaskKind): string {
  if (kind === 'listen_and_choose') return 'Listen and choose a response'
  if (kind === 'listen_to_a_conversation') return 'Listen to a conversation'
  if (kind === 'listen_to_an_announcement') return 'Listen to an announcement'
  return 'Listen to an academic talk'
}

export function findConversation(
  session: ListeningSession,
  id: string,
): ConversationItem | undefined {
  return session.listen_to_a_conversation.find((item) => item.id === id)
}

export function findAnnouncement(
  session: ListeningSession,
  id: string,
): AnnouncementItem | undefined {
  return session.listen_to_an_announcement.find((item) => item.id === id)
}

export function findAcademicTalk(
  session: ListeningSession,
  id: string,
): AcademicTalkItem | undefined {
  return session.listen_to_an_academic_talk.find((item) => item.id === id)
}

export function findListenAndChoose(
  session: ListeningSession,
  id: string,
): ListenAndChooseItem | undefined {
  return session.listen_and_choose.find((item) => item.id === id)
}
