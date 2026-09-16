import type {
  AcademicTalkItem,
  AnnouncementItem,
  ConversationItem,
  ListenAndChooseItem,
  ListeningPlayable,
  ListeningSpeaker,
} from './types'

/** Fallback when an item has no `voice` metadata (listen-and-choose). */
const DEFAULT_VOICE = 'female_adult'

/** Short gap between turns — not a speaker announcement. */
const TURN_GAP_MS = 280

export interface SpeechUtterance {
  /** Spoken text only — never prefixed with speaker/role/voice. */
  text: string
  /** JSON voice key (`male_adult`, …) used only to pick a TTS voice. */
  voice: string
  /** Stable speaker slot so the same person keeps one voice across lines. */
  slot: string
}

export interface TranscriptLine {
  /** Optional role label for the post-answer transcript only (never during play). */
  label?: string
  text: string
}

function voiceForSpeakerId(
  speakerId: string,
  speakers: readonly ListeningSpeaker[] | undefined,
): string {
  const match = speakers?.find((speaker) => speaker.id === speakerId)
  if (match?.voice) return match.voice
  return voiceForLineSpeaker(speakerId)
}

/** Academic talks use `professor` / `student` on lines with no speakers[]. */
function voiceForLineSpeaker(speaker: string): string {
  const key = speaker.trim().toLowerCase()
  if (key === 'professor') return 'male_adult'
  if (key === 'student') return 'female_young'
  if (key.includes('male') || key.includes('female')) return key
  return DEFAULT_VOICE
}

function formatRoleLabel(role: string): string {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

export function utterancesForItem(playable: ListeningPlayable): SpeechUtterance[] {
  if (playable.kind === 'listen_and_choose') {
    return [{ text: playable.item.heard_line, voice: DEFAULT_VOICE, slot: 'solo' }]
  }
  if (playable.kind === 'listen_to_an_announcement') {
    return [
      {
        text: playable.item.text,
        voice: playable.item.speaker.voice || DEFAULT_VOICE,
        slot: playable.item.speaker.id || 'announcer',
      },
    ]
  }
  const speakers =
    playable.kind === 'listen_to_a_conversation' ? playable.item.speakers : undefined
  return playable.item.lines.map((line) => ({
    text: line.text,
    voice: voiceForSpeakerId(line.speaker, speakers),
    slot: line.speaker,
  }))
}

export function transcriptForItem(playable: ListeningPlayable): TranscriptLine[] {
  if (playable.kind === 'listen_and_choose') {
    return [{ text: playable.item.heard_line }]
  }
  if (playable.kind === 'listen_to_an_announcement') {
    return [{ text: playable.item.text }]
  }
  const speakers =
    playable.kind === 'listen_to_a_conversation' ? playable.item.speakers : undefined
  return playable.item.lines.map((line) => ({
    label: speakers
      ? formatRoleLabel(
          speakers.find((speaker) => speaker.id === line.speaker)?.role ?? line.speaker,
        )
      : formatRoleLabel(line.speaker),
    text: line.text,
  }))
}

export function contextForItem(playable: ListeningPlayable): string | undefined {
  if (playable.kind === 'listen_and_choose') return undefined
  if (playable.kind === 'listen_to_an_academic_talk') {
    const { course, setting } = playable.item
    return course ? `${setting} (${course})` : setting
  }
  return playable.item.setting
}

function parseVoiceKey(key: string): { gender: 'male' | 'female'; young: boolean } {
  const k = key.toLowerCase()
  const female = k.includes('female') || k.includes('woman') || k === 'student'
  return {
    gender: female ? 'female' : 'male',
    young: k.includes('young'),
  }
}

function voiceGender(voice: SpeechSynthesisVoice): 'male' | 'female' | 'unknown' {
  const name = voice.name.toLowerCase()
  if (
    /female|woman|zira|samantha|susan|hazel|karen|moira|tessa|fiona|victoria|aria|jenny|sara|linda|heather|catherine/.test(
      name,
    )
  ) {
    return 'female'
  }
  if (
    /male|man|david|mark|daniel|george|fred|ryan|guy|tony|ravi|aaron|andrew|james|thomas|richard/.test(
      name,
    )
  ) {
    return 'male'
  }
  return 'unknown'
}

function scoreEnglishVoice(
  voice: SpeechSynthesisVoice,
  gender: 'male' | 'female',
): number {
  const lang = voice.lang.toLowerCase()
  let score = 0
  if (!lang.startsWith('en')) return -100
  score += 20
  if (lang.includes('us')) score += 6
  else if (lang.includes('gb') || lang.includes('uk')) score += 4
  const guessed = voiceGender(voice)
  if (guessed === gender) score += 12
  else if (guessed !== 'unknown') score -= 8
  if (voice.localService) score += 2
  if (/google|microsoft|natural/i.test(voice.name)) score += 3
  return score
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  voiceKey: string,
  used: Set<string>,
): SpeechSynthesisVoice | null {
  const { gender } = parseVoiceKey(voiceKey)
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  const ranked = [...english].sort(
    (a, b) => scoreEnglishVoice(b, gender) - scoreEnglishVoice(a, gender),
  )
  const unused = ranked.find((voice) => !used.has(voice.voiceURI))
  return unused ?? ranked[0] ?? null
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([])
  }
  const existing = window.speechSynthesis.getVoices()
  if (existing.length > 0) return Promise.resolve(existing)
  return new Promise((resolve) => {
    const finish = () => resolve(window.speechSynthesis.getVoices())
    window.speechSynthesis.addEventListener('voiceschanged', finish, { once: true })
    window.setTimeout(finish, 600)
  })
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const id = window.setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

function speakOne(
  text: string,
  voiceKey: string,
  chosen: SpeechSynthesisVoice | null,
  signal?: AbortSignal,
  pitchAdjust = 0,
): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed) return Promise.resolve()

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    if (!('speechSynthesis' in window)) {
      const ms = Math.max(1500, trimmed.split(/\s+/).length * 420)
      void wait(ms, signal).then(resolve, reject)
      return
    }

    const utter = new SpeechSynthesisUtterance(trimmed)
    utter.lang = chosen?.lang || 'en-US'
    utter.rate = 0.94
    const { young } = parseVoiceKey(voiceKey)
    utter.pitch = Math.min(2, Math.max(0.5, (young ? 1.12 : 1) + pitchAdjust))
    if (chosen) utter.voice = chosen

    const wordCount = trimmed.split(/\s+/).length
    const fallbackMs = Math.max(2500, wordCount * 520)
    let settled = false
    const settle = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }
    const onAbort = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      window.speechSynthesis.cancel()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = window.setTimeout(settle, fallbackMs)
    signal?.addEventListener('abort', onAbort, { once: true })
    utter.onend = settle
    utter.onerror = settle
    window.speechSynthesis.speak(utter)
  })
}

/**
 * Queue every line/heard_line with the matching TTS voice.
 * Speaker names/roles are never spoken — only the line text, back-to-back.
 */
export async function playAudio(
  item:
    | ListeningPlayable
    | ListenAndChooseItem
    | ConversationItem
    | AnnouncementItem
    | AcademicTalkItem,
  signal?: AbortSignal,
): Promise<void> {
  const playable = toPlayable(item)
  const lines = utterancesForItem(playable).filter((line) => line.text.trim())
  if (lines.length === 0) return

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }

  const voices = await loadVoices()
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const keepAlive =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.setInterval(() => {
          if (window.speechSynthesis.speaking) window.speechSynthesis.resume()
        }, 8000)
      : 0

  const slotVoice = new Map<string, SpeechSynthesisVoice | null>()
  const usedUris = new Set<string>()

  try {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i]
      if (!line) continue
      if (!slotVoice.has(line.slot)) {
        const picked = pickVoice(voices, line.voice, usedUris)
        if (picked) usedUris.add(picked.voiceURI)
        slotVoice.set(line.slot, picked)
      }
      const slotIndex = [...slotVoice.keys()].indexOf(line.slot)
      const pitchAdjust = slotIndex <= 0 ? 0 : slotIndex % 2 === 1 ? -0.1 : 0.06
      await speakOne(
        line.text,
        line.voice,
        slotVoice.get(line.slot) ?? null,
        signal,
        pitchAdjust,
      )
      if (i < lines.length - 1) await wait(TURN_GAP_MS, signal)
    }
  } finally {
    if (keepAlive) window.clearInterval(keepAlive)
  }
}

export function cancelAudio(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

function isPlayable(
  item:
    | ListeningPlayable
    | ListenAndChooseItem
    | ConversationItem
    | AnnouncementItem
    | AcademicTalkItem,
): item is ListeningPlayable {
  return 'kind' in item && 'item' in item
}

function toPlayable(
  item:
    | ListeningPlayable
    | ListenAndChooseItem
    | ConversationItem
    | AnnouncementItem
    | AcademicTalkItem,
): ListeningPlayable {
  if (isPlayable(item)) return item
  if ('heard_line' in item) return { kind: 'listen_and_choose', item }
  if ('speakers' in item) return { kind: 'listen_to_a_conversation', item }
  if ('text' in item && 'speaker' in item) {
    return { kind: 'listen_to_an_announcement', item }
  }
  return { kind: 'listen_to_an_academic_talk', item }
}
