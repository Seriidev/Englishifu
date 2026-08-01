import { useCallback, useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'requesting' | 'ready' | 'recording' | 'error'

export type MicrophoneAvailability =
  | 'available'
  | 'insecure-context'
  | 'unsupported'

export interface AudioRecorderControls {
  status: RecorderStatus
  error: string | null
  isRecording: boolean
  /** Request mic permission early (before first task). */
  prepare: () => Promise<boolean>
  start: () => Promise<void>
  stop: () => Promise<Blob | null>
  release: () => void
}

export function getMicrophoneAvailabilityStatus(): MicrophoneAvailability {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return 'insecure-context'
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'unsupported'
  }
  return 'available'
}

export function microphoneAvailabilityMessage(
  status: MicrophoneAvailability,
): string | null {
  if (status === 'insecure-context') {
    return 'This page must be loaded over HTTPS to access your microphone. Please make sure the URL starts with https:// and reload the page.'
  }
  if (status === 'unsupported') {
    return 'Your browser does not support microphone recording. Please try an updated version of Chrome, Firefox, Safari, or Edge.'
  }
  return null
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ]
  return candidates.find((t) => MediaRecorder.isTypeSupported(t))
}

/**
 * MediaRecorder wrapper with Safari-friendly mimeType fallback.
 * Blobs are kept in memory for MVP (no upload yet).
 */
export function useAudioRecorder(): AudioRecorderControls {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const mimeRef = useRef<string | undefined>(undefined)

  const release = useCallback(() => {
    recorderRef.current = null
    chunksRef.current = []
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setStatus('idle')
  }, [])

  const prepare = useCallback(async (): Promise<boolean> => {
    setError(null)
    setStatus('requesting')
    try {
      const availability = getMicrophoneAvailabilityStatus()
      const availabilityError = microphoneAvailabilityMessage(availability)
      if (availabilityError) {
        throw new Error(availabilityError)
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      mimeRef.current = pickMimeType()
      setStatus('ready')
      return true
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Microphone permission denied.'
      setError(message)
      setStatus('error')
      return false
    }
  }, [])

  const start = useCallback(async (): Promise<void> => {
    setError(null)
    if (!streamRef.current) {
      const ok = await prepare()
      if (!ok || !streamRef.current) return
    }

    chunksRef.current = []
    const mimeType = mimeRef.current
    const recorder = mimeType
      ? new MediaRecorder(streamRef.current, { mimeType })
      : new MediaRecorder(streamRef.current)

    recorderRef.current = recorder
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.start(250)
    setStatus('recording')
  }, [prepare])

  const stop = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      setStatus(streamRef.current ? 'ready' : 'idle')
      return null
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const type = mimeRef.current ?? 'audio/webm'
        const blob =
          chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type })
            : null
        chunksRef.current = []
        recorderRef.current = null
        setStatus(streamRef.current ? 'ready' : 'idle')
        resolve(blob)
      }
      try {
        recorder.stop()
      } catch {
        setStatus(streamRef.current ? 'ready' : 'idle')
        resolve(null)
      }
    })
  }, [])

  return {
    status,
    error,
    isRecording: status === 'recording',
    prepare,
    start,
    stop,
    release,
  }
}
