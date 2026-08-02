import type { ReadingSectionConfig } from '../components/reading/types'

/** Original TOEFL-style Reading mocks (not ETS materials). */
export const readingMockConfig: ReadingSectionConfig = {
  sectionTimeSeconds: 27 * 60,
  stage1Passages: [
    {
      id: 'r-s1-complete-words',
      title: 'Complete the Words',
      topicType: 'daily-life',
      difficultyTier: 'baseline',
      paragraphs: [
        {
          id: 'cw-p1',
          text: 'Complete each incomplete word by typing the missing letters.',
        },
      ],
      questions: [
        {
          id: 'r-cw-1',
          type: 'complete-words',
          prompt: 'Complete the words in the passage.',
          options: [],
          segments: [
            {
              type: 'text',
              content:
                'Libraries are places that help people access knowledge and information. They ',
            },
            {
              type: 'blank',
              blankId: 'b1',
              visiblePrefix: 'sto',
              slotCount: 2,
              correctAnswer: 're',
            },
            { type: 'text', content: ' books, ' },
            {
              type: 'blank',
              blankId: 'b2',
              visiblePrefix: 'journ',
              slotCount: 3,
              correctAnswer: 'als',
            },
            { type: 'text', content: ', and other ' },
            {
              type: 'blank',
              blankId: 'b3',
              visiblePrefix: 'reso',
              slotCount: 5,
              correctAnswer: 'urces',
            },
            { type: 'text', content: ' for the ' },
            {
              type: 'blank',
              blankId: 'b4',
              visiblePrefix: 'pub',
              slotCount: 3,
              correctAnswer: 'lic',
            },
            { type: 'text', content: ' to use. ' },
            {
              type: 'blank',
              blankId: 'b5',
              visiblePrefix: 'Ma',
              slotCount: 2,
              correctAnswer: 'ny',
            },
            { type: 'text', content: ' libraries ' },
            {
              type: 'blank',
              blankId: 'b6',
              visiblePrefix: 'al',
              slotCount: 2,
              correctAnswer: 'so',
            },
            { type: 'text', content: ' offer digital ' },
            {
              type: 'blank',
              blankId: 'b7',
              visiblePrefix: 'serv',
              slotCount: 4,
              correctAnswer: 'ices',
            },
            { type: 'text', content: ', such as e-books and online ' },
            {
              type: 'blank',
              blankId: 'b8',
              visiblePrefix: 'datab',
              slotCount: 4,
              correctAnswer: 'ases',
            },
            {
              type: 'text',
              content:
                '. Librarians assist visitors in ',
            },
            {
              type: 'blank',
              blankId: 'b9',
              visiblePrefix: 'find',
              slotCount: 3,
              correctAnswer: 'ing',
            },
            {
              type: 'text',
              content:
                ' materials and often organize community events. The concept of public libraries dates back centuries and ',
            },
            {
              type: 'blank',
              blankId: 'b10',
              visiblePrefix: 'cont',
              slotCount: 5,
              correctAnswer: 'inues',
            },
            {
              type: 'text',
              content: ' to evolve alongside technology.',
            },
          ],
          correctAnswer: {
            b1: 're',
            b2: 'als',
            b3: 'urces',
            b4: 'lic',
            b5: 'ny',
            b6: 'so',
            b7: 'ices',
            b8: 'ases',
            b9: 'ing',
            b10: 'inues',
          },
        },
      ],
    },
    {
      id: 'r-s1-email-gym',
      title: 'Membership Renewal',
      topicType: 'daily-life',
      difficultyTier: 'baseline',
      paragraphs: [
        {
          id: 'gym-meta',
          text: 'To: davis.family@dmail.com\nFrom: greenvalley.gym@dmail.com\nSubject: Membership Renewal',
        },
        {
          id: 'gym-body',
          text: 'Dear Mr. Davis,\n\nYour gym membership is set to expire on July 15th. To continue enjoying uninterrupted access, please renew before that date. Renewals completed after July 15th will incur a $20 reactivation fee.\n\nBest regards,\nGreen Valley Gym',
        },
      ],
      questions: [
        {
          id: 'r-gym-q1',
          type: 'multiple-choice',
          prompt: "When does Mr. Davis's membership expire?",
          options: ['July 5th', 'July 15th', 'July 20th', 'August 15th'],
          correctAnswer: '1',
        },
        {
          id: 'r-gym-q2',
          type: 'multiple-choice',
          prompt: 'What happens if Mr. Davis renews after the deadline?',
          options: [
            'His membership is cancelled',
            'He pays an extra fee',
            'He loses access permanently',
            'He gets a discount',
          ],
          correctAnswer: '1',
        },
      ],
    },
    {
      id: 'r-s1-email-road',
      title: 'Road Closure Notice',
      topicType: 'daily-life',
      difficultyTier: 'baseline',
      paragraphs: [
        {
          id: 'road-meta',
          text: 'To: patel.r@dmail.com\nFrom: cityworks.dept@dmail.com\nSubject: Road Closure Notice',
        },
        {
          id: 'road-body',
          text: 'Dear Resident,\n\nMaple Street will be closed for resurfacing from Monday, June 2nd through Friday, June 6th. During this period, please use Oak Avenue as an alternate route. Residents with driveways on Maple Street will still have access during non-working hours (after 5:00 PM).\n\nThank you for your patience,\nCity Public Works Department',
        },
      ],
      questions: [
        {
          id: 'r-road-q3',
          type: 'multiple-choice',
          prompt: 'Why is the notice being sent?',
          options: [
            'To announce a new road',
            'To inform residents of a closure',
            'To request feedback',
            'To advertise a service',
          ],
          correctAnswer: '1',
        },
        {
          id: 'r-road-q4',
          type: 'multiple-choice',
          prompt:
            'When can residents access their Maple Street driveways during the closure?',
          options: ['Never', 'Only on weekends', 'After 5:00 PM', 'Anytime'],
          correctAnswer: '2',
        },
        {
          id: 'r-road-q5',
          type: 'multiple-choice',
          prompt: 'What is suggested about Oak Avenue?',
          options: [
            'It will also be closed',
            'It is an alternate route',
            'It is being resurfaced too',
            'It has no traffic',
          ],
          correctAnswer: '1',
        },
      ],
    },
  ],
  stage2EasyPassages: [
    {
      id: 'r-s2e-green',
      title: 'The Rise of Urban Green Spaces',
      topicType: 'daily-life',
      difficultyTier: 'easy',
      paragraphs: [
        {
          id: 'ug-p1',
          text: 'Urban green spaces, including parks, community gardens, and green roofs, have become increasingly valued in modern city planning. These areas provide numerous environmental and social benefits that extend well beyond simple aesthetics.',
        },
        {
          id: 'ug-p2',
          text: 'One major advantage is improved air quality. Plants absorb carbon dioxide and filter pollutants, which can be especially significant in densely populated areas with heavy traffic. Green spaces also help reduce the "urban heat island" effect, wherein cities become significantly warmer than surrounding rural areas due to concrete and asphalt absorbing heat.',
        },
        {
          id: 'ug-p3',
          text: 'Beyond environmental benefits, green spaces foster social interaction. Community gardens, for instance, bring neighbors together around a shared purpose, while parks serve as venues for recreation and gathering. Studies suggest that access to green spaces is also linked to improved mental well-being, with reduced stress levels reported among city residents who have regular exposure to nature.',
        },
        {
          id: 'ug-p4',
          text: 'However, creating and maintaining urban green spaces is not without challenges. Limited available land in dense cities often makes expansion difficult, and maintenance costs can strain municipal budgets. Some cities have responded creatively, converting unused rooftops and abandoned lots into green areas, demonstrating that innovation can help overcome spatial constraints.',
        },
      ],
      questions: [
        {
          id: 'r-ug-e-q6',
          type: 'multiple-choice',
          prompt:
            'The word "significantly" in the passage is closest in meaning to',
          options: ['rarely', 'considerably', 'briefly', 'accidentally'],
          correctAnswer: '1',
        },
        {
          id: 'r-ug-e-q7',
          type: 'multiple-choice',
          prompt:
            'According to the passage, what causes the "urban heat island" effect?',
          options: [
            'Lack of green spaces',
            'Heavy traffic',
            'Concrete and asphalt absorbing heat',
            'High population density',
          ],
          correctAnswer: '2',
        },
        {
          id: 'r-ug-e-match',
          type: 'match-main-idea',
          prompt: 'Match each paragraph to its main idea.',
          options: [
            'Environmental benefits of green spaces',
            'Social and mental-health benefits',
            'Introduction: value of urban green spaces',
            'Challenges and creative solutions',
          ],
          paragraphRefs: ['ug-p1', 'ug-p2', 'ug-p3', 'ug-p4'],
          correctAnswer: {
            'ug-p1': 'Introduction: value of urban green spaces',
            'ug-p2': 'Environmental benefits of green spaces',
            'ug-p3': 'Social and mental-health benefits',
            'ug-p4': 'Challenges and creative solutions',
          },
        },
      ],
    },
  ],
  stage2HardPassages: [
    {
      id: 'r-s2h-green',
      title: 'The Rise of Urban Green Spaces',
      topicType: 'academic',
      difficultyTier: 'hard',
      paragraphs: [
        {
          id: 'ug-p1',
          text: 'Urban green spaces, including parks, community gardens, and green roofs, have become increasingly valued in modern city planning. These areas provide numerous environmental and social benefits that extend well beyond simple aesthetics.',
        },
        {
          id: 'ug-p2',
          text: 'One major advantage is improved air quality. Plants absorb carbon dioxide and filter pollutants, which can be especially significant in densely populated areas with heavy traffic. Green spaces also help reduce the "urban heat island" effect, wherein cities become significantly warmer than surrounding rural areas due to concrete and asphalt absorbing heat.',
        },
        {
          id: 'ug-p3',
          text: 'Beyond environmental benefits, green spaces foster social interaction. Community gardens, for instance, bring neighbors together around a shared purpose, while parks serve as venues for recreation and gathering. Studies suggest that access to green spaces is also linked to improved mental well-being, with reduced stress levels reported among city residents who have regular exposure to nature.',
        },
        {
          id: 'ug-p4',
          text: 'However, creating and maintaining urban green spaces is not without challenges. Limited available land in dense cities often makes expansion difficult, and maintenance costs can strain municipal budgets. Some cities have responded creatively, converting unused rooftops and abandoned lots into green areas, demonstrating that innovation can help overcome spatial constraints.',
        },
      ],
      questions: [
        {
          id: 'r-ug-h-q6',
          type: 'multiple-choice',
          prompt:
            'The word "significantly" in the passage is closest in meaning to',
          options: ['rarely', 'considerably', 'briefly', 'accidentally'],
          correctAnswer: '1',
        },
        {
          id: 'r-ug-h-q7',
          type: 'multiple-choice',
          prompt:
            'According to the passage, what causes the "urban heat island" effect?',
          options: [
            'Lack of green spaces',
            'Heavy traffic',
            'Concrete and asphalt absorbing heat',
            'High population density',
          ],
          correctAnswer: '2',
        },
        {
          id: 'r-ug-h-q8',
          type: 'multiple-choice',
          prompt: 'What is the relationship between paragraphs 3 and 4?',
          options: [
            'Paragraph 4 presents challenges related to the benefits in paragraph 3',
            'Paragraph 4 contradicts paragraph 3',
            'Paragraph 4 provides more evidence for paragraph 3',
            'Paragraph 4 introduces an unrelated topic',
          ],
          correctAnswer: '0',
        },
        {
          id: 'r-ug-h-q9',
          type: 'multiple-choice',
          prompt: 'What can be inferred about cities with limited land?',
          options: [
            'They cannot have any green spaces',
            'They may need creative solutions to add green spaces',
            'They are unaffected by budget constraints',
            'They prioritize parks over gardens',
          ],
          correctAnswer: '1',
        },
        {
          id: 'r-ug-h-q10',
          type: 'multiple-choice',
          prompt: 'Why does the author mention rooftops and abandoned lots?',
          options: [
            'To criticize city planning decisions',
            'To give an example of creative solutions to space constraints',
            'To explain why green spaces are expensive',
            'To argue against expanding green spaces',
          ],
          correctAnswer: '1',
        },
      ],
    },
  ],
}
