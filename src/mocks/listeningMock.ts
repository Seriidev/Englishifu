import type {
  ListeningPractice,
  ListeningSectionConfig,
} from '../types/listening'
import { practiceToItems } from '../types/listening'

const CORAL_TALK =
  'Today we\'re discussing coral reefs, sometimes called the "rainforests of the sea" because of their remarkable biodiversity. Coral reefs are built by tiny organisms called coral polyps, which secrete calcium carbonate to form hard skeletons. Over time, these skeletons accumulate to create the reef structures we recognize. One thing that makes reefs so productive is their relationship with algae called zooxanthellae, which live within the coral tissue. The algae photosynthesize and provide the coral with nutrients, while the coral provides the algae with a protected environment. This partnership is essential — without it, most coral would struggle to survive. Unfortunately, rising ocean temperatures can disrupt this relationship, causing corals to expel the algae in a process called bleaching. Bleached coral isn\'t necessarily dead, but it becomes much more vulnerable, and prolonged bleaching events often lead to large-scale coral death.'

/** Practice library — each card is one audio + its questions. */
export const listeningPractices: ListeningPractice[] = [
  // —— Listen and Choose a Response ——
  {
    id: 'lp-cbr-0450',
    numberLabel: '#0450',
    title: 'TOEFL iBT Listening: Everyday Replies — Keys',
    taskType: 'listen-and-choose-response',
    dateAdded: '2026-06-12',
    solvedCount: 2463,
    difficultyTier: 'baseline',
    audioUrl: 'tts:',
    speakText: 'Have you seen my keys anywhere?',
    questions: [
      {
        id: 'lp-cbr-0450-q1',
        prompt: 'Choose the best response.',
        questionType: 'multiple-choice',
        mcSubtype: 'detail',
        options: [
          "They're on the counter.",
          'I locked the door.',
          "It's not far.",
          "Sure, I'll drive.",
        ],
        correctOptionIndex: 0,
      },
    ],
  },
  {
    id: 'lp-cbr-0451',
    numberLabel: '#0451',
    title: 'TOEFL iBT Listening: Everyday Replies — Meeting Time',
    taskType: 'listen-and-choose-response',
    dateAdded: '2026-06-12',
    solvedCount: 2188,
    difficultyTier: 'baseline',
    audioUrl: 'tts:',
    speakText: 'The meeting got moved to 3 PM.',
    questions: [
      {
        id: 'lp-cbr-0451-q1',
        prompt: 'Choose the best response.',
        questionType: 'multiple-choice',
        options: [
          "I'll be there at 3.",
          "It's a long meeting.",
          'The room is upstairs.',
          'I moved last year.',
        ],
        correctOptionIndex: 0,
      },
    ],
  },
  {
    id: 'lp-cbr-0452',
    numberLabel: '#0452',
    title: 'TOEFL iBT Listening: Everyday Replies — Plants',
    taskType: 'listen-and-choose-response',
    dateAdded: '2026-06-13',
    solvedCount: 1902,
    difficultyTier: 'baseline',
    audioUrl: 'tts:',
    speakText: "Could you water my plants while I'm away?",
    questions: [
      {
        id: 'lp-cbr-0452-q1',
        prompt: 'Choose the best response.',
        questionType: 'multiple-choice',
        options: [
          "They're very colorful.",
          'Sure, no problem.',
          "I'll be away too.",
          'The garden is big.',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'lp-cbr-0453',
    numberLabel: '#0453',
    title: 'TOEFL iBT Listening: Everyday Replies — Store Hours',
    taskType: 'listen-and-choose-response',
    dateAdded: '2026-06-13',
    solvedCount: 1755,
    difficultyTier: 'baseline',
    audioUrl: 'tts:',
    speakText: 'Do you know if the store is still open?',
    questions: [
      {
        id: 'lp-cbr-0453-q1',
        prompt: 'Choose the best response.',
        questionType: 'multiple-choice',
        options: [
          "It's a good store.",
          'I bought a jacket there.',
          'I think it closes at 9.',
          'The prices are fair.',
        ],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'lp-cbr-0454',
    numberLabel: '#0454',
    title: 'TOEFL iBT Listening: Everyday Replies — Coffee',
    taskType: 'listen-and-choose-response',
    dateAdded: '2026-06-14',
    solvedCount: 1630,
    difficultyTier: 'baseline',
    audioUrl: 'tts:',
    speakText: 'This coffee is really strong.',
    questions: [
      {
        id: 'lp-cbr-0454-q1',
        prompt: 'Choose the best response.',
        questionType: 'multiple-choice',
        mcSubtype: 'speaker-attitude',
        options: [
          'I like it that way.',
          'The cafe is close by.',
          "I'll order tea instead.",
          "It's raining outside.",
        ],
        correctOptionIndex: 0,
      },
    ],
  },
  {
    id: 'lp-cbr-0455',
    numberLabel: '#0455',
    title: 'TOEFL iBT Listening: Everyday Replies — Report',
    taskType: 'listen-and-choose-response',
    dateAdded: '2026-06-14',
    solvedCount: 1488,
    difficultyTier: 'baseline',
    audioUrl: 'tts:',
    speakText: 'Did you finish the report yet?',
    questions: [
      {
        id: 'lp-cbr-0455-q1',
        prompt: 'Choose the best response.',
        questionType: 'multiple-choice',
        options: [
          "It's due Friday.",
          'Almost, just one section left.',
          'The printer is broken.',
          'I read it twice.',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'lp-cbr-0456',
    numberLabel: '#0456',
    title: 'TOEFL iBT Listening: Everyday Replies — Hallway',
    taskType: 'listen-and-choose-response',
    dateAdded: '2026-06-15',
    solvedCount: 1321,
    difficultyTier: 'baseline',
    audioUrl: 'tts:',
    speakText: 'Why is the hallway so dark?',
    questions: [
      {
        id: 'lp-cbr-0456-q1',
        prompt: 'Choose the best response.',
        questionType: 'multiple-choice',
        mcSubtype: 'inference',
        options: [
          "It's on the second floor.",
          'A lightbulb must be out.',
          'The hallway is long.',
          "I'll be there soon.",
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'lp-cbr-0457',
    numberLabel: '#0457',
    title: 'TOEFL iBT Listening: Everyday Replies — Lunch Plans',
    taskType: 'listen-and-choose-response',
    dateAdded: '2026-06-15',
    solvedCount: 1204,
    difficultyTier: 'baseline',
    audioUrl: 'tts:',
    speakText: 'Are we still meeting for lunch tomorrow?',
    questions: [
      {
        id: 'lp-cbr-0457-q1',
        prompt: 'Choose the best response.',
        questionType: 'multiple-choice',
        options: [
          'The food was great.',
          'Yes, same time as always.',
          'I had lunch already.',
          "It's a nice restaurant.",
        ],
        correctOptionIndex: 1,
      },
    ],
  },

  // —— Conversations ——
  {
    id: 'lp-conv-0460',
    numberLabel: '#0460',
    title: 'TOEFL iBT Listening: Lost Lecture Notes',
    taskType: 'listen-to-conversation',
    dateAdded: '2026-06-18',
    solvedCount: 984,
    difficultyTier: 'baseline',
    audioUrl: 'tts:',
    speakText:
      "Woman: I can't find my notes from yesterday's lecture. Man: Did you check your bag again? You usually keep them there. Woman: I did, twice. I might have left them in the lecture hall. Man: Let's go check before the next class starts.",
    questions: [
      {
        id: 'lp-conv-0460-q1',
        prompt: "What is the woman's problem?",
        questionType: 'multiple-choice',
        mcSubtype: 'detail',
        options: [
          'She missed a lecture',
          'She lost her notes',
          'She forgot her bag',
          'She is late for class',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'lp-conv-0460-q2',
        prompt: 'What will the two speakers most likely do next?',
        questionType: 'multiple-choice',
        mcSubtype: 'inference',
        options: [
          'Ask the professor for help',
          'Buy new notebooks',
          'Go check the lecture hall',
          'Skip the next class',
        ],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'lp-conv-0461',
    numberLabel: '#0461',
    title: 'TOEFL iBT Listening: Changing Majors',
    taskType: 'listen-to-conversation',
    dateAdded: '2026-06-19',
    solvedCount: 876,
    difficultyTier: 'easy',
    audioUrl: 'tts:',
    speakText:
      "Man: I'm thinking about switching my major to biology. Woman: Really? What made you consider that? Man: I've been really into the chemistry and lab classes lately. Woman: That makes sense. Have you talked to an academic advisor about it? Man: Not yet, but I'll set up a meeting this week.",
    questions: [
      {
        id: 'lp-conv-0461-q1',
        prompt: 'What does the man want to do?',
        questionType: 'multiple-choice',
        mcSubtype: 'main-idea',
        options: [
          'Drop out of school',
          'Change his major',
          'Take more chemistry classes',
          'Become a lab assistant',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'lp-conv-0461-q2',
        prompt: 'What does the woman suggest?',
        questionType: 'multiple-choice',
        mcSubtype: 'detail',
        options: [
          'Talking to an advisor',
          'Taking a break from school',
          'Switching to a different school',
          'Studying abroad',
        ],
        correctOptionIndex: 0,
      },
    ],
  },

  // —— Announcement ——
  {
    id: 'lp-ann-0470',
    numberLabel: '#0470',
    title: 'TOEFL iBT Listening: Library Exam Hours',
    taskType: 'listen-to-announcement',
    dateAdded: '2026-06-20',
    solvedCount: 1120,
    difficultyTier: 'easy',
    audioUrl: 'tts:',
    speakText:
      'Attention students, the campus library will extend its hours during final exam week. Starting Monday, the library will remain open until 2 AM daily to accommodate students studying for exams. Additional study rooms will also be available for reservation starting this Friday.',
    questions: [
      {
        id: 'lp-ann-0470-q1',
        prompt: 'What is the main purpose of the announcement?',
        questionType: 'multiple-choice',
        mcSubtype: 'speaker-purpose',
        options: [
          'To advertise a new library',
          'To inform students of extended library hours',
          'To cancel study room reservations',
          'To announce a library closure',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'lp-ann-0470-q2',
        prompt: 'What can students do starting Friday?',
        questionType: 'multiple-choice',
        mcSubtype: 'detail',
        options: [
          'Study until 2 AM',
          'Reserve study rooms',
          'Attend a library tour',
          'Return overdue books',
        ],
        correctOptionIndex: 1,
      },
    ],
  },

  // —— Academic Talk ——
  {
    id: 'lp-talk-0480',
    numberLabel: '#0480',
    title: 'TOEFL iBT Listening: Coral Reefs and Bleaching',
    taskType: 'listen-to-academic-talk',
    dateAdded: '2026-06-22',
    solvedCount: 742,
    difficultyTier: 'hard',
    audioUrl: 'tts:',
    speakText: CORAL_TALK,
    questions: [
      {
        id: 'lp-talk-0480-q1',
        prompt: 'What is the main topic of the talk?',
        questionType: 'multiple-choice',
        mcSubtype: 'main-idea',
        options: [
          'The formation and biology of coral reefs',
          'Ocean temperature patterns',
          'Different species of algae',
          'Marine conservation policies',
        ],
        correctOptionIndex: 0,
      },
      {
        id: 'lp-talk-0480-q2',
        prompt: 'According to the professor, what role do zooxanthellae play?',
        questionType: 'multiple-choice',
        mcSubtype: 'detail',
        options: [
          'They build the coral skeleton',
          'They provide nutrients to coral through photosynthesis',
          'They protect coral from predators',
          'They cause coral bleaching',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'lp-talk-0480-q3',
        prompt: 'Why does the professor mention "bleaching"?',
        questionType: 'multiple-choice',
        mcSubtype: 'speaker-purpose',
        options: [
          'To describe a natural coral color',
          'To explain a threat caused by rising temperatures',
          'To introduce a new coral species',
          'To describe how reefs form',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'lp-talk-0480-q4',
        prompt: 'What can be inferred about bleached coral?',
        questionType: 'multiple-choice',
        mcSubtype: 'inference',
        options: [
          'It always dies immediately',
          'It is unaffected by further stress',
          'It becomes more vulnerable to further harm',
          'It recovers its algae quickly',
        ],
        correctOptionIndex: 2,
      },
    ],
  },
]

export function getListeningPractice(id: string): ListeningPractice | undefined {
  return listeningPractices.find((p) => p.id === id)
}

/** Adaptive full Listening section — flattened from practices by difficulty. */
export const listeningMockConfig: ListeningSectionConfig = {
  sectionTimeSeconds: 25 * 60,
  stage1Items: listeningPractices
    .filter((p) => p.difficultyTier === 'baseline')
    .flatMap(practiceToItems),
  stage2EasyItems: listeningPractices
    .filter((p) => p.difficultyTier === 'easy')
    .flatMap(practiceToItems),
  stage2HardItems: listeningPractices
    .filter((p) => p.difficultyTier === 'hard')
    .flatMap(practiceToItems),
}
