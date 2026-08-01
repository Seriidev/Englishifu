import type { SpeakingSectionConfig } from '../speaking/types'

/**
 * Original TOEFL-style Speaking mocks (not ETS materials).
 * audioUrl `tts:` → Web Speech API using transcript / questionText.
 */
export const speakingMockConfig: SpeakingSectionConfig = {
  listenRepeatItems: [
    {
      id: 'lr-1',
      audioUrl: 'tts:',
      visualUrl: 'https://picsum.photos/seed/toefl-orientation/900/560',
      transcript: 'Welcome to our student orientation.',
      responseSeconds: 8,
    },
    {
      id: 'lr-2',
      audioUrl: 'tts:',
      visualUrl: 'https://picsum.photos/seed/toefl-office/900/560',
      transcript: 'The main office is on the first floor.',
      responseSeconds: 8,
    },
    {
      id: 'lr-3',
      audioUrl: 'tts:',
      visualUrl: 'https://picsum.photos/seed/toefl-desk/900/560',
      transcript: 'Registration forms are available at the front desk.',
      responseSeconds: 9,
    },
    {
      id: 'lr-4',
      audioUrl: 'tts:',
      visualUrl: 'https://picsum.photos/seed/toefl-idphoto/900/560',
      transcript: 'All new students must complete an ID photo session.',
      responseSeconds: 10,
    },
    {
      id: 'lr-5',
      audioUrl: 'tts:',
      visualUrl: 'https://picsum.photos/seed/toefl-advisor/900/560',
      transcript:
        'Academic advisors are available every weekday from nine to five.',
      responseSeconds: 10,
    },
    {
      id: 'lr-6',
      audioUrl: 'tts:',
      visualUrl: 'https://picsum.photos/seed/toefl-portal/900/560',
      transcript:
        'You can check your class schedule through the online student portal.',
      responseSeconds: 11,
    },
    {
      id: 'lr-7',
      audioUrl: 'tts:',
      visualUrl: 'https://picsum.photos/seed/toefl-services/900/560',
      transcript:
        "If you have any questions, please don't hesitate to contact the student services office at extension 204.",
      responseSeconds: 12,
    },
  ],
  interviewItems: [
    {
      id: 'iv-1',
      audioUrl: 'tts:',
      questionText:
        'Thank you for joining the study. First, how often do you read for pleasure, and what kinds of books or materials do you usually choose?',
      responseSeconds: 45,
    },
    {
      id: 'iv-2',
      audioUrl: 'tts:',
      questionText:
        'I see. Imagine you could choose between reading a physical book or an e-book for the same story. Which would you choose, and why?',
      responseSeconds: 45,
    },
    {
      id: 'iv-3',
      audioUrl: 'tts:',
      questionText:
        "Interesting. Some people say it's becoming harder to focus while reading due to phones and other distractions. What are one or two ways people could improve their focus while reading?",
      responseSeconds: 45,
    },
    {
      id: 'iv-4',
      audioUrl: 'tts:',
      questionText:
        'Good points. Lastly, considering how much content is available online now, do you think traditional reading habits might change significantly in the future? How might this affect libraries and bookstores, both positively and negatively? Please give one example of each.',
      responseSeconds: 45,
    },
  ],
}

export const TOTAL_SPEAKING_ITEMS =
  speakingMockConfig.listenRepeatItems.length +
  speakingMockConfig.interviewItems.length

/** @deprecated Use speakingMockConfig — kept for existing imports */
export const mockSpeakingConfig = speakingMockConfig
