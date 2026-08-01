export function smoothScrollTo(href: string): void {
  const id = href.replace(/^#/, '')
  if (!id) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const el = document.getElementById(id)
  if (!el) return

  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Slow ease-in-out scroll to top (native smooth is too fast). */
export function slowScrollToTop(durationMs = 1400): void {
  const startY = window.scrollY
  if (startY <= 0) return

  const startTime = performance.now()
  // Scale duration a bit with distance, but keep a calm floor/ceiling
  const duration = Math.min(
    2200,
    Math.max(durationMs, Math.round(startY * 0.7)),
  )

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1)
    window.scrollTo(0, startY * (1 - easeInOutCubic(progress)))
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}
