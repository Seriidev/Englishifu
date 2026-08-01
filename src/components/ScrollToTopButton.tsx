import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { slowScrollToTop } from '../utils/scroll'

const SHOW_AFTER_PX = 400

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => slowScrollToTop(1600)}
      className={`fixed right-4 bottom-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:bg-brand-dark sm:right-6 sm:bottom-6 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  )
}
