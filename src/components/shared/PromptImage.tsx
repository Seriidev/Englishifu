import { useEffect, useState } from 'react'

const FALLBACK =
  'https://placehold.co/600x400/e8efff/4f7cff?text=Image+unavailable'

interface PromptImageProps {
  src: string
  alt: string
  className?: string
}

/** Image with graceful fallback when the URL fails to load. */
export default function PromptImage({ src, alt, className }: PromptImageProps) {
  const [current, setCurrent] = useState(src)

  useEffect(() => {
    setCurrent(src)
  }, [src])

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (current !== FALLBACK) setCurrent(FALLBACK)
      }}
    />
  )
}
