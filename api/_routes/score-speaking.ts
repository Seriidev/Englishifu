import Anthropic from '@anthropic-ai/sdk'
import { createReadStream } from 'fs'
import formidable from 'formidable'
import type { File as FormidableFile } from 'formidable'
import OpenAI, { toFile } from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  api: {
    bodyParser: false,
  },
}

export interface SpeakingRubricScore {
  fluencyCoherence: number
  languageUse: number
  topicDevelopment: number
  overallBand: number
  transcript: string
  feedback: string
}

function clamp01to5(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n)
  if (Number.isNaN(v)) return 0
  return Math.max(0, Math.min(5, Math.round(v * 2) / 2))
}

function bandFromRubric(scores: {
  fluencyCoherence: number
  languageUse: number
  topicDevelopment: number
}): number {
  const sum =
    scores.fluencyCoherence + scores.languageUse + scores.topicDevelopment
  return Math.round((sum / 15) * 6 * 2) / 2
}

function firstFile(
  files: formidable.Files,
  key: string,
): FormidableFile | undefined {
  const value = files[key]
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

function firstField(fields: formidable.Fields, key: string): string {
  const value = fields[key]
  if (value == null) return ''
  return Array.isArray(value) ? String(value[0] ?? '') : String(value)
}

function parseMultipart(
  req: VercelRequest,
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({
    maxFileSize: 25 * 1024 * 1024,
    multiples: false,
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  if (!anthropicKey || !openaiKey) {
    return res.status(503).json({
      error: 'ANTHROPIC_API_KEY and OPENAI_API_KEY must be configured',
    })
  }

  const anthropic = new Anthropic({ apiKey: anthropicKey })
  const openai = new OpenAI({ apiKey: openaiKey })

  try {
    const { fields, files } = await parseMultipart(req)
    const audio = firstFile(files, 'audio')
    const prompt = firstField(fields, 'prompt')
    const taskType = firstField(fields, 'taskType') || 'interview'

    if (!audio?.filepath) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    const whisperFile = await toFile(
      createReadStream(audio.filepath),
      audio.originalFilename || 'recording.webm',
    )

    const transcription = await openai.audio.transcriptions.create({
      file: whisperFile,
      model: 'whisper-1',
    })

    const transcript = transcription.text?.trim() ?? ''
    if (!transcript) {
      return res.status(400).json({
        error: 'Could not transcribe audio',
        transcript: '',
        fluencyCoherence: 0,
        languageUse: 0,
        topicDevelopment: 0,
        overallBand: 0,
        feedback:
          'No speech was detected in the recording. Try speaking more clearly and closer to the microphone.',
      })
    }

    const systemPrompt = `You are an expert TOEFL iBT Speaking rater. Score this transcript on 3 dimensions (0-5 each):
- Fluency & Coherence: natural flow, minimal hesitation markers visible in transcript
- Language Use: grammar and vocabulary range in spoken English
- Topic Development: completeness and relevance of content

Task type: ${taskType}
Task / question prompt: ${prompt}

Note: pronunciation and intonation cannot be assessed from a text transcript alone — factor this into your Fluency score conservatively, and mention this limitation briefly in your feedback.

Respond ONLY with valid JSON:
{
  "fluencyCoherence": number,
  "languageUse": number,
  "topicDevelopment": number,
  "feedback": string
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: transcript }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from scorer')
    }

    const cleaned = textBlock.text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned) as Record<string, unknown>

    const rubric = {
      fluencyCoherence: clamp01to5(parsed.fluencyCoherence),
      languageUse: clamp01to5(parsed.languageUse),
      topicDevelopment: clamp01to5(parsed.topicDevelopment),
    }

    const result: SpeakingRubricScore = {
      ...rubric,
      overallBand: bandFromRubric(rubric),
      transcript,
      feedback:
        typeof parsed.feedback === 'string'
          ? parsed.feedback
          : 'Focus on clearer development and more precise language use.',
    }

    return res.status(200).json(result)
  } catch (err) {
    console.error('Speaking scoring error:', err)
    return res.status(500).json({ error: 'Failed to score speaking response' })
  }
}
