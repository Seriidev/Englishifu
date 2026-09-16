import { readFile } from 'fs/promises'
import formidable from 'formidable'
import type { File as FormidableFile } from 'formidable'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  audioMimeType,
  geminiGenerateJson,
  geminiSpeakingApiKey,
} from '../_lib/gemini.js'

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

  const apiKey = geminiSpeakingApiKey()
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_SPEAKING_API_KEY is not configured',
    })
  }

  try {
    const { fields, files } = await parseMultipart(req)
    const audio = firstFile(files, 'audio')
    const prompt = firstField(fields, 'prompt')
    const taskType = firstField(fields, 'taskType') || 'interview'

    if (!audio?.filepath) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    const audioBytes = await readFile(audio.filepath)
    const mimeType = audioMimeType(audio.mimetype, audio.originalFilename)

    const systemPrompt = `You are an expert TOEFL iBT Speaking rater.
First transcribe the student's spoken English exactly.
Then score the response on 3 dimensions (0-5 each):
- Fluency & Coherence: natural flow, hesitation, connected speech
- Language Use: grammar and vocabulary range in spoken English
- Topic Development: completeness and relevance of content

Be a strict but fair rater. Do not inflate scores. A typical independent response is around 3.0, not 4.5.
Task type: ${taskType}
Task / question prompt: ${prompt}

If there is no intelligible English speech, return an empty transcript and zeros.
Respond ONLY with valid JSON.`

    const parsed = await geminiGenerateJson({
      apiKey,
      system: systemPrompt,
      parts: [
        {
          inlineData: {
            mimeType,
            data: audioBytes.toString('base64'),
          },
        },
        {
          text: 'Transcribe this recording and score it against the TOEFL speaking rubric.',
        },
      ],
      schema: {
        type: 'OBJECT',
        properties: {
          transcript: { type: 'STRING' },
          fluencyCoherence: { type: 'NUMBER' },
          languageUse: { type: 'NUMBER' },
          topicDevelopment: { type: 'NUMBER' },
          feedback: { type: 'STRING' },
        },
        required: [
          'transcript',
          'fluencyCoherence',
          'languageUse',
          'topicDevelopment',
          'feedback',
        ],
      },
    })

    const transcript =
      typeof parsed.transcript === 'string' ? parsed.transcript.trim() : ''
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
    const message =
      err instanceof Error ? err.message : 'Failed to score speaking response'
    console.error('Speaking scoring error:', err)
    if (/API key not valid/i.test(message)) {
      return res.status(401).json({
        error:
          'GEMINI_SPEAKING_API_KEY is not valid. Copy the full key from Google AI Studio (it usually starts with AIza or AQ.).',
      })
    }
    return res.status(500).json({ error: message || 'Failed to score speaking response' })
  }
}
