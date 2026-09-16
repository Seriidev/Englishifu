type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }

type GeminiSchema = Record<string, unknown>

export function geminiWritingApiKey(): string | undefined {
  const key = process.env.GEMINI_WRITING_API_KEY?.trim()
  return key || undefined
}

export function geminiSpeakingApiKey(): string | undefined {
  const key = process.env.GEMINI_SPEAKING_API_KEY?.trim()
  return key || undefined
}

export function uniqueGeminiKeys(
  ...keys: Array<string | undefined>
): string[] {
  return [...new Set(keys.filter((key): key is string => Boolean(key)))]
}

function geminiModels(): string[] {
  return [
    process.env.GEMINI_MODEL?.trim(),
    'gemini-3.6-flash',
    'gemini-3-flash-preview',
    'gemini-2.0-flash',
  ].filter(
    (name, index, all): name is string =>
      Boolean(name) && all.indexOf(name) === index,
  )
}

export async function geminiGenerateJson(options: {
  apiKey: string | string[]
  system: string
  parts: GeminiPart[]
  schema: GeminiSchema
}): Promise<Record<string, unknown>> {
  const keys = uniqueGeminiKeys(
    ...(Array.isArray(options.apiKey) ? options.apiKey : [options.apiKey]),
  )
  if (keys.length === 0) {
    throw new Error('No Gemini API key configured')
  }

  let lastError = 'Gemini request failed'
  const models = geminiModels()

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const apiKey = keys[keyIndex]
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: options.system }] },
          contents: [{ role: 'user', parts: options.parts }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
            responseSchema: options.schema,
          },
        }),
      })

      const raw = await res.text()
      if (res.ok) {
        if (keyIndex > 0) {
          console.warn(
            'Primary Gemini key was rejected; scored with the fallback key.',
          )
        }
        return parseGeminiJson(raw)
      }

      lastError = geminiErrorMessage(res.status, raw)
      const invalidKey = /API key not valid/i.test(lastError)
      const modelGone =
        res.status === 404 || /no longer available|not found/i.test(lastError)
      if (invalidKey) break
      if (modelGone) continue
      throw new Error(lastError)
    }
  }

  throw new Error(lastError)
}

function parseGeminiJson(raw: string): Record<string, unknown> {
  let payload: {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
      finishReason?: string
    }>
    promptFeedback?: { blockReason?: string }
  }
  try {
    payload = JSON.parse(raw) as typeof payload
  } catch {
    throw new Error('Gemini returned a non-JSON envelope')
  }

  const text = payload.candidates
    ?.flatMap((c) => c.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('')
    .replace(/```json|```/g, '')
    .trim()

  if (!text) {
    const reason =
      payload.promptFeedback?.blockReason ||
      payload.candidates?.[0]?.finishReason ||
      'empty'
    throw new Error(`Gemini returned no score (${reason})`)
  }

  return JSON.parse(text) as Record<string, unknown>
}

export function audioMimeType(
  mimetype: string | null | undefined,
  filename: string | null | undefined,
): string {
  const raw = (mimetype || '').split(';')[0].trim().toLowerCase()
  if (raw === 'video/webm' || raw === 'audio/webm') return 'audio/webm'
  if (raw === 'audio/mpeg' || raw === 'audio/mp3') return 'audio/mp3'
  if (raw.startsWith('audio/')) return raw

  const name = (filename || '').toLowerCase()
  if (name.endsWith('.wav')) return 'audio/wav'
  if (name.endsWith('.mp3')) return 'audio/mp3'
  if (name.endsWith('.m4a') || name.endsWith('.mp4')) return 'audio/mp4'
  if (name.endsWith('.ogg') || name.endsWith('.opus')) return 'audio/ogg'
  return 'audio/webm'
}

function geminiErrorMessage(status: number, raw: string): string {
  try {
    const parsed = JSON.parse(raw) as {
      error?: { message?: string; status?: string }
    }
    const message = parsed.error?.message || parsed.error?.status
    if (message) return `Gemini ${status}: ${message}`
  } catch {
    /* ignore parse errors */
  }
  return `Gemini ${status}: ${raw.slice(0, 280) || 'request failed'}`
}
