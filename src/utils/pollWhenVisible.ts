/** Run `fn` on an interval only while the tab is visible. */
export function pollWhenVisible(fn: () => void, ms: number): () => void {
  const tick = () => {
    if (document.visibilityState === 'visible') fn()
  }
  const interval = window.setInterval(tick, ms)
  const onVisible = () => {
    if (document.visibilityState === 'visible') fn()
  }
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    window.clearInterval(interval)
    document.removeEventListener('visibilitychange', onVisible)
  }
}
