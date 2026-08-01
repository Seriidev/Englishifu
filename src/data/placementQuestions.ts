export interface PlacementQuestion {
  id: number
  prompt: string
  context?: string
  options: string[]
  correctIndex: number
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    context: '"Are you from Senegal?"',
    prompt: '"No, _____."',
    options: ["I'm not", "I amn't", 'I are not', 'I not'],
    correctIndex: 0,
  },
  {
    id: 2,
    prompt: '"_____ Martha English?" "Yes, she _____."',
    options: ["Is / isn't", 'Are / is', 'Is / is', 'Are / are'],
    correctIndex: 2,
  },
  {
    id: 3,
    prompt: '"_____ is his job?" "He _____ a policeman."',
    options: ['Which / is', 'What / are', 'What / is', 'Where / is'],
    correctIndex: 2,
  },
  {
    id: 4,
    context: 'A: What is _____ ? B: She is a bank manager.',
    prompt: 'Choose the correct option.',
    options: ['his job', 'she job', 'he job', 'her job'],
    correctIndex: 3,
  },
  {
    id: 5,
    prompt: 'Rosemary _____ three languages.',
    options: ['speaks', 'talks', 'tells', 'know'],
    correctIndex: 0,
  },
  {
    id: 6,
    prompt: "Jane's a doctor. She _____ ill people.",
    options: ['looks at', 'speaks to', 'helps', 'serves drinks'],
    correctIndex: 2,
  },
  {
    id: 7,
    context: 'A: _____ does Anthony go to work? B: _____ bus.',
    prompt: 'Choose the correct option.',
    options: ['How / By', 'How well / On', 'What kind / In', 'How / In'],
    correctIndex: 0,
  },
  {
    id: 8,
    prompt: "There's a letter _____ you.",
    options: ['for', 'to', 'about', 'on'],
    correctIndex: 0,
  },
  {
    id: 9,
    prompt: "Anna likes Joanna, but Maria doesn't like _____.",
    options: ['her', 'them', 'your', 'their'],
    correctIndex: 0,
  },
  {
    id: 10,
    context: '"_____ you go out on Friday evenings?" "Yes, I do sometimes."',
    prompt: 'Choose the correct option.',
    options: ['Do', 'Where', 'Are', 'Does'],
    correctIndex: 0,
  },
  {
    id: 11,
    prompt: 'There is _____ photo of _____ teachers.',
    options: ['some / some', 'a / some', 'some / any', 'any / some'],
    correctIndex: 1,
  },
  {
    id: 12,
    prompt:
      'The children _____ very tired today. They _____ at a party yesterday evening.',
    options: ['were / was', 'are / were', 'was / was', 'am / was'],
    correctIndex: 1,
  },
  {
    id: 13,
    prompt: 'John lives _____ home _____ his parents.',
    options: ['in / with', 'at / with', 'at / of', 'on / with'],
    correctIndex: 1,
  },
  {
    id: 14,
    prompt:
      'Geoffrey _____ French before, but he _____ at university now.',
    options: [
      "study didn't / studies",
      "didn't study / study",
      'did not study / studies',
      "didn't studied / studies",
    ],
    correctIndex: 2,
  },
  {
    id: 15,
    context: "'_____?' 'He's very nice.'",
    prompt: 'Choose the correct option.',
    options: [
      'What does he look like?',
      "What's he like?",
      'How is he?',
      'How does he look?',
    ],
    correctIndex: 1,
  },
  {
    id: 16,
    prompt: 'Would you like _____ rice?',
    options: ['a', 'some', 'an', 'any'],
    correctIndex: 1,
  },
  {
    id: 17,
    prompt: '_____ I have a cheese sandwich, please?',
    options: ['Do', 'Does', 'Can', 'Am'],
    correctIndex: 2,
  },
  {
    id: 18,
    prompt: 'You are _____ me.',
    options: ['older', 'oldest', 'older than', 'older then'],
    correctIndex: 2,
  },
  {
    id: 19,
    prompt: 'She _____ to be a ballet dancer when she _____ up.',
    options: [
      'go / grow',
      'going / grows',
      'goes / grows',
      "'s going / grows",
    ],
    correctIndex: 3,
  },
  {
    id: 20,
    prompt: 'She has _____ to Portugal.',
    options: ['be', 'been', 'being', 'were'],
    correctIndex: 1,
  },
  {
    id: 21,
    context:
      "A: Welcome back. _____ have you been? B: I've _____ to Afghanistan.",
    prompt: 'Choose the correct option.',
    options: [
      'Where / gone',
      'Where / been',
      'When / been',
      'When / gone',
    ],
    correctIndex: 1,
  },
  {
    id: 22,
    context:
      "A: Ouch! There's _____ in my eye! B: Let me look. No, I can't see _____.",
    prompt: 'Choose the correct option.',
    options: [
      'something / anything',
      'anything / anywhere',
      'somebody / everywhere',
      'something / nothing',
    ],
    correctIndex: 0,
  },
  {
    id: 23,
    prompt: 'Lisa _____ me a lift because I _____ the bus.',
    options: [
      'gave / missed',
      'have given / have missed',
      'gave / had missed',
      'had gave / missed',
    ],
    correctIndex: 0,
  },
  {
    id: 24,
    prompt:
      'First she said "Yes", then she said "No", but in the end she _____ up her mind to marry him.',
    options: ['did', 'made', 'got', 'said'],
    correctIndex: 1,
  },
  {
    id: 25,
    prompt: "I'm really looking forward to _____ my new course.",
    options: ['start', 'starting', 'started', 'to start'],
    correctIndex: 1,
  },
  {
    id: 26,
    prompt: "She's going to be late because her plane _____.",
    options: [
      'has been delayed',
      'has delayed',
      'delayed',
      'was delayed',
    ],
    correctIndex: 0,
  },
  {
    id: 27,
    prompt:
      "Suppose! If it _____ last weekend, we _____ to play tennis.",
    options: [
      "rained - wouldn't be able",
      "rains - won't be able",
      'rain - would be able',
      'had rained -- could',
    ],
    correctIndex: 0,
  },
  {
    id: 28,
    context: 'A: Where is Ken? B: I think he _____ a bath.',
    prompt: 'Choose the correct option.',
    options: ['was having', 'has', 'is having', 'took'],
    correctIndex: 2,
  },
  {
    id: 29,
    prompt: 'It is probably about time we _____ the car serviced.',
    options: ['had', 'would have', 'will have', 'have had'],
    correctIndex: 0,
  },
  {
    id: 30,
    prompt:
      "He is fat because he doesn't take any exercise. If he _____ some exercise, he _____ so fat.",
    options: [
      "took / won't be",
      "will take / won't be",
      "takes / wouldn't be",
      "took / wouldn't be",
    ],
    correctIndex: 3,
  },
  {
    id: 31,
    prompt:
      'Not until the audit report was published _____ the true scale of the financial discrepancies.',
    options: [
      'the board realized',
      'did the board realize',
      'had the board realize',
      'the board had realized',
    ],
    correctIndex: 1,
  },
  {
    id: 32,
    prompt:
      "If she _____ her Master's application last month, she _____ in line for a scholarship right now.",
    options: [
      "didn't submit; wouldn't be",
      "hadn't submitted; wouldn't be",
      "hadn't submitted; wouldn't have been",
      "hasn't submitted; isn't",
    ],
    correctIndex: 1,
  },
  {
    id: 33,
    prompt:
      'She _____ left the office already; her coat is still hanging on the chair and her laptop is on.',
    options: [
      "mustn't have",
      "couldn't have",
      "shouldn't have",
      'might not be',
    ],
    correctIndex: 1,
  },
  {
    id: 34,
    prompt:
      'The project manager objected to _____ extra tasks without a corresponding shift in deadlines.',
    options: [
      'assigning',
      'be assigned',
      'being assigned',
      'have assigned',
    ],
    correctIndex: 2,
  },
  {
    id: 35,
    prompt:
      'Anyone _____ to submit their final transcript by Friday will be automatically disqualified.',
    options: ['failing', 'failed', 'who fail', 'fails'],
    correctIndex: 0,
  },
  {
    id: 36,
    prompt:
      'The research highlights _____ impact of digital transformation on contemporary management practices.',
    options: [
      'an extraordinarily',
      'the extraordinary',
      'extraordinary',
      'an extraordinary high',
    ],
    correctIndex: 1,
  },
  {
    id: 37,
    prompt:
      'Not only did he pass the language certification on his first attempt, but he did _____ with a perfect score.',
    options: ['so', 'such', 'it', 'as'],
    correctIndex: 0,
  },
  {
    id: 38,
    prompt:
      'The manager regretted _____ the employees that their positions were at risk before the decision was official.',
    options: [
      'to inform',
      'informing',
      'having informed to',
      'to have informed',
    ],
    correctIndex: 1,
  },
  {
    id: 39,
    prompt:
      '_____ all the necessary background research, the team felt confident presenting their proposal to the board.',
    options: [
      'Having conducted',
      'Conducting',
      'Conducted',
      'Being conducted',
    ],
    correctIndex: 0,
  },
  {
    id: 40,
    prompt:
      'The missing documents were believed _____ during the system upgrade last Tuesday.',
    options: [
      'to delete',
      'to be deleting',
      'to have been deleted',
      'having been deleted',
    ],
    correctIndex: 2,
  },
]
