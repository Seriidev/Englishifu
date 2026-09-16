import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  geminiGenerateJson,
  geminiSpeakingApiKey,
  geminiWritingApiKey,
  uniqueGeminiKeys,
} from '../_lib/gemini.js'

export type WritingTaskTypeAi =
  | 'build-sentence'
  | 'write-email'
  | 'academic-discussion'

interface ScoreWritingRequest {
  taskType: WritingTaskTypeAi
  prompt: string
  studentResponse: string
}

export interface WritingRubricScore {
  grammar: number
  vocabulary: number
  organization: number
  taskAchievement: number
  overallBand: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

function clamp01to5(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n)
  if (Number.isNaN(v)) return 0
  return Math.max(0, Math.min(5, Math.round(v * 2) / 2))
}

function bandFromRubric(scores: {
  grammar: number
  vocabulary: number
  organization: number
  taskAchievement: number
}): number {
  const sum =
    scores.grammar +
    scores.vocabulary +
    scores.organization +
    scores.taskAchievement
  return Math.round((sum / 20) * 6 * 2) / 2
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKeys = uniqueGeminiKeys(
    geminiWritingApiKey(),
    geminiSpeakingApiKey(),
  )
  if (apiKeys.length === 0) {
    return res.status(503).json({ error: 'GEMINI_WRITING_API_KEY is not configured' })
  }

  const body = req.body as ScoreWritingRequest
  const { taskType, prompt, studentResponse } = body ?? {}

  if (!studentResponse?.trim()) {
    return res.status(400).json({ error: 'No response provided' })
  }

  const systemPrompt = `You are an expert TOEFL iBT Writing rater following official ETS scoring rubrics.
Score the student's response on 4 dimensions, each 0-5:
- Grammar & Mechanics: correctness of grammar, syntax, punctuation
- Vocabulary & Word Choice: range and precision of vocabulary
- Organization & Coherence: logical structure, clear transitions, paragraph organization
- Task Achievement: how well the response fulfills the specific task requirements

Be a strict but fair rater. Do not inflate scores. Average independent-level writing is 3.0, not 4.5.
Task type: ${taskType ?? 'unknown'}
Task prompt: ${prompt ?? ''}

Respond ONLY with valid JSON matching this exact schema, no other text.`

  try {
    const parsed = await geminiGenerateJson({
      apiKey: apiKeys,
      system: systemPrompt,
      parts: [{ text: studentResponse }],
      schema: {
        type: 'OBJECT',
        properties: {
          grammar: { type: 'NUMBER' },
          vocabulary: { type: 'NUMBER' },
          organization: { type: 'NUMBER' },
          taskAchievement: { type: 'NUMBER' },
          feedback: { type: 'STRING' },
          strengths: { type: 'ARRAY', items: { type: 'STRING' } },
          improvements: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: [
          'grammar',
          'vocabulary',
          'organization',
          'taskAchievement',
          'feedback',
          'strengths',
          'improvements',
        ],
      },
    })

    const rubric = {
      grammar: clamp01to5(parsed.grammar),
      vocabulary: clamp01to5(parsed.vocabulary),
      organization: clamp01to5(parsed.organization),
      taskAchievement: clamp01to5(parsed.taskAchievement),
    }

    const result: WritingRubricScore = {
      ...rubric,
      overallBand: bandFromRubric(rubric),
      feedback:
        typeof parsed.feedback === 'string'
          ? parsed.feedback
          : 'Review grammar, vocabulary, and how fully you addressed the prompt.',
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.map(String).slice(0, 3)
        : [],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.map(String).slice(0, 3)
        : [],
    }

    return res.status(200).json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to score response'
    console.error('Writing scoring error:', err)
    if (/API key not valid/i.test(message)) {
      return res.status(401).json({
        error:
          'GEMINI_WRITING_API_KEY is not valid. Copy the full key from Google AI Studio (it usually starts with AIza).',
      })
    }
    return res.status(500).json({ error: message || 'Failed to score response' })
  }
}
