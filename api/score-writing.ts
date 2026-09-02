import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not configured' })
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

Task type: ${taskType ?? 'unknown'}
Task prompt: ${prompt ?? ''}

Respond ONLY with valid JSON matching this exact schema, no other text:
{
  "grammar": number,
  "vocabulary": number,
  "organization": number,
  "taskAchievement": number,
  "feedback": string,
  "strengths": string[],
  "improvements": string[]
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: studentResponse }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response')
    }

    const cleaned = textBlock.text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned) as Record<string, unknown>

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
    console.error('Writing scoring error:', err)
    return res.status(500).json({ error: 'Failed to score response' })
  }
}
