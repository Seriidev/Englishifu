import { useEffect, useId, useState } from 'react'
import { ImageIcon, X } from 'lucide-react'
import type { ToeflNewsItem } from '../../../types/studyPlace'

interface ToeflNewsCardProps {
  news: ToeflNewsItem | ToeflNewsItem[]
}

export default function ToeflNewsCard({ news }: ToeflNewsCardProps) {
  const items = Array.isArray(news) ? news : [news]
  const [openId, setOpenId] = useState<string | null>(null)
  const titleId = useId()
  const openItem = items.find((n) => n.id === openId) ?? null

  useEffect(() => {
    if (!openItem) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [openItem])

  return (
    <section>
      <h2 className="text-base font-bold text-slate-900">
        News about TOEFL
      </h2>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {item.excerpt}
            </p>
            <button
              type="button"
              onClick={() => setOpenId(item.id)}
              className="mt-3 inline-block text-sm font-semibold text-[#0B1B3D] hover:underline"
            >
              See more
            </button>
          </article>
        ))}
      </div>

      {openItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close news"
            onClick={() => setOpenId(null)}
          />
          <div className="relative z-10 flex max-h-[min(90vh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="absolute top-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            <div className="shrink-0">
              {openItem.imageUrl ? (
                <img
                  src={openItem.imageUrl}
                  alt={openItem.imageAlt ?? openItem.title}
                  className="h-48 w-full object-cover sm:h-56"
                />
              ) : (
                <div
                  className="flex h-48 w-full flex-col items-center justify-center gap-2 bg-slate-100 sm:h-56"
                  aria-hidden
                >
                  <ImageIcon className="h-10 w-10 text-slate-300" />
                  <p className="text-xs font-medium text-slate-400">
                    News image
                  </p>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <h3
                id={titleId}
                className="pr-8 text-lg font-bold text-slate-900"
              >
                {openItem.title}
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-500">
                {openItem.body.split(/\n\n+/).map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
