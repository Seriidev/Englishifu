import { useLayoutEffect, useRef, useState } from 'react'
import { Check, Lightbulb } from 'lucide-react'
import { downloadEssayDocx } from '../../../utils/essayDocx'

const LINE = 36

type EssayKind = 'argumentative' | 'motivational'

interface EssaySection {
  id: string
  title: string
  lines: number
  tips: string[]
}

interface EssayDraft {
  title: string
  sections: Record<string, string>
}

const ARGUMENTATIVE: EssaySection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    lines: 4,
    tips: [
      'Start with a hook: a fact, question, or anecdote.',
      'Provide brief context for the topic.',
      'End with a clear thesis and your position.',
      'Preview your main supporting reasons.',
    ],
  },
  {
    id: 'argument-1',
    title: 'Argument 1',
    lines: 4,
    tips: [
      'Start with a clear topic sentence.',
      'Use a real example, fact, or short story.',
      'Explain how it supports your thesis.',
      'Link back to your main point.',
    ],
  },
  {
    id: 'argument-2',
    title: 'Argument 2',
    lines: 4,
    tips: [
      'Make a different point from Argument 1.',
      'Use a new example or source.',
      'Explain the connection to your thesis.',
      'Keep your ideas logical and clear.',
    ],
  },
  {
    id: 'argument-3',
    title: 'Argument 3',
    lines: 3,
    tips: [
      'Present a counterargument fairly.',
      'Reply why your position is stronger.',
      'Use logical reasons, not just opinion.',
    ],
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    lines: 4,
    tips: [
      'Restate your thesis in different words.',
      'Summarize your key reasons briefly.',
      'End with a strong final thought.',
    ],
  },
]

const MOTIVATIONAL: EssaySection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    lines: 4,
    tips: [
      'Start with a moment the reader can picture.',
      'Say who or what the essay is about.',
      'Show why the goal matters.',
      'Keep the opening short and clear.',
    ],
  },
  {
    id: 'challenge',
    title: 'Challenge',
    lines: 4,
    tips: [
      'Name one clear obstacle.',
      'Use a real moment, not a general statement.',
      'Show the feeling through details.',
      'Make the stakes easy to understand.',
    ],
  },
  {
    id: 'turning-point',
    title: 'Turning point',
    lines: 4,
    tips: [
      'Focus on one turning point.',
      'Use action verbs and specific details.',
      'Show the change, do not only tell it.',
      'Keep this paragraph moving forward.',
    ],
  },
  {
    id: 'lesson',
    title: 'Lesson',
    lines: 3,
    tips: [
      'State the lesson in one clear sentence.',
      'Connect it to a real result.',
      'Make the lesson specific to this story.',
    ],
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    lines: 3,
    tips: [
      'Restate the lesson in fresh words.',
      'End on a concrete image or result.',
      'Keep the last line strong and short.',
    ],
  },
]

const TEMPLATES: Record<EssayKind, EssaySection[]> = {
  argumentative: ARGUMENTATIVE,
  motivational: MOTIVATIONAL,
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function fileSlug(title: string, kind: EssayKind) {
  const base = title.trim() || `${kind}-essay`
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || kind}.docx`
}

function RuledArea({
  id,
  label,
  minLines,
  value,
  onChange,
}: {
  id: string
  label: string
  minLines: number
  value: string
  onChange: (value: string) => void
}) {
  const mirror = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState(minLines)
  const shown = value.endsWith('\n') ? `${value} ` : value || ' '

  useLayoutEffect(() => {
    const height = mirror.current?.scrollHeight ?? minLines * LINE
    const next = Math.max(minLines, Math.round(height / LINE))
    setLines((current) => (current === next ? current : next))
  }, [minLines, shown])

  return (
    <div className="relative mt-3">
      <div
        ref={mirror}
        aria-hidden
        className="invisible whitespace-pre-wrap break-words"
        style={{ lineHeight: `${LINE}px`, minHeight: minLines * LINE }}
      >
        {shown}
      </div>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className="essay-rule" style={{ height: LINE }} />
        ))}
      </div>
      <textarea
        id={id}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="essay-line absolute inset-0 h-full w-full resize-none bg-transparent outline-none"
        style={{ lineHeight: `${LINE}px` }}
      />
    </div>
  )
}

function WritingTips({ tips }: { tips: string[] }) {
  return (
    <aside className="essay-tips rounded-2xl px-4 py-3.5">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
        <p className="text-sm font-bold">Writing tips</p>
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm leading-snug">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default function EssayPractice() {
  const [kind, setKind] = useState<EssayKind>('argumentative')
  const [drafts, setDrafts] = useState<Record<EssayKind, EssayDraft>>({
    argumentative: { title: '', sections: {} },
    motivational: { title: '', sections: {} },
  })
  const [reviewed, setReviewed] = useState<EssayKind | null>(null)

  const template = TEMPLATES[kind]
  const draft = drafts[kind]
  const showReview = reviewed === kind
  const written = template.map((section) => ({
    ...section,
    text: (draft.sections[section.id] ?? '').trim(),
  }))
  const words = wordCount(
    [draft.title, ...written.map((section) => section.text)].join(' '),
  )

  const setTitle = (title: string) => {
    setDrafts((prev) => ({ ...prev, [kind]: { ...prev[kind], title } }))
  }

  const setSection = (id: string, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [kind]: {
        ...prev[kind],
        sections: { ...prev[kind].sections, [id]: value },
      },
    }))
  }

  const saveEssay = () => {
    downloadEssayDocx({
      fileName: fileSlug(draft.title, kind),
      title: draft.title,
      sections: template.map((section) => ({
        title: section.title,
        text: draft.sections[section.id] ?? '',
      })),
    })
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {(
          [
            ['argumentative', 'Argumentative essay'],
            ['motivational', 'Motivational essay'],
          ] as const
        ).map(([id, label]) => {
          const active = kind === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? 'essay-kind-active' : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-pressed={active}
            >
              {label}
            </button>
          )
        })}
      </div>

      <section className="rounded-[28px] bg-white px-4 py-6 sm:px-8 sm:py-8">
        <div className="grid items-end gap-x-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex items-end gap-3">
            <label
              htmlFor={`essay-title-${kind}`}
              className="essay-label shrink-0 text-lg font-semibold sm:text-xl"
            >
              Title of essay
            </label>
            <div className="relative min-w-0 flex-1">
              <div className="essay-rule" style={{ height: LINE }} aria-hidden />
              <input
                id={`essay-title-${kind}`}
                value={draft.title}
                onChange={(event) => setTitle(event.target.value)}
                className="essay-line absolute inset-0 h-full w-full bg-transparent outline-none"
                style={{ lineHeight: `${LINE}px` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {template.map((section) => (
            <div
              key={`${kind}-${section.id}`}
              className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8"
            >
              <div>
                <h2 className="essay-label text-base font-semibold sm:text-lg">
                  {section.title} :
                </h2>
                <RuledArea
                  id={`${kind}-${section.id}`}
                  label={section.title}
                  minLines={section.lines}
                  value={draft.sections[section.id] ?? ''}
                  onChange={(value) => setSection(section.id, value)}
                />
              </div>
              <WritingTips tips={section.tips} />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={saveEssay}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Save essay
          </button>
          <button
            type="button"
            onClick={() => setReviewed(kind)}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Submit for review
          </button>
        </div>

        {showReview ? (
          <div className="mt-5 max-w-xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-bold text-slate-900">
              {kind === 'argumentative' ? 'Argumentative essay review' : 'Motivational essay review'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {words === 0
                ? 'The lines are still empty. Write your essay, then submit again.'
                : `${words} word${words === 1 ? '' : 's'}. ${draft.title.trim() ? 'The title is in place.' : 'Add a title on the top line.'}`}
            </p>
            <ul className="mt-3 space-y-1.5">
              {written.map((section) => (
                <li key={section.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check
                    className={`h-3.5 w-3.5 shrink-0 ${
                      section.text ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                    aria-hidden
                  />
                  {section.title}
                  {section.text ? '' : ' — still empty'}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  )
}
