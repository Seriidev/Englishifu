/**
 * Plays prompt audio once. Supports:
 * - real URL (mp3/ogg/wav)
 * - `tts:` prefix → Web Speech API using provided text
 */
export function playPromptAudio(
  audioUrl: string,
  speakText: string,
): Promise<void> {
  if (audioUrl.startsWith('tts:') || audioUrl === '') {
    return speakWithTts(speakText)
  }
  return playHtmlAudio(audioUrl)
}

function playHtmlAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    audio.preload = 'auto'
    const cleanup = () => {
      audio.onended = null
      audio.onerror = null
    }
    audio.onended = () => {
      cleanup()
      resolve()
    }
    audio.onerror = () => {
      cleanup()
      reject(new Error(`Failed to play audio: ${url}`))
    }
    void audio.play().catch(reject)
  })
}

function speakWithTts(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      // Fallback timing estimate ~140 wpm
      const ms = Math.max(1500, text.split(/\s+/).length * 420)
      globalThis.setTimeout(() => resolve(), ms)
      return
    }

    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.92
    utter.pitch = 1
    utter.lang = 'en-US'

    const voices = window.speechSynthesis.getVoices()
    const english = voices.find(
      (v) => v.lang.startsWith('en') && /US|GB|UK/i.test(v.lang),
    )
    if (english) utter.voice = english

    utter.onend = () => resolve()
    utter.onerror = () => resolve()
    window.speechSynthesis.speak(utter)
  })
}

export function cancelPromptAudio(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
