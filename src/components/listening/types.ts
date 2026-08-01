/** Re-export listening types from the shared types module. */
export type {
  ListeningTaskType,
  ListeningQuestionType,
  MCSubtype,
  ListeningTaskConfig,
  ListeningHotspot,
  ListeningPracticeQuestion,
  ListeningPractice,
  ListeningItem,
  ListeningSectionConfig,
} from '../../types/listening'

export {
  LISTENING_TASK_TYPES,
  taskTypeLabel,
  taskTypeToContentType,
  practiceToItems,
} from '../../types/listening'
