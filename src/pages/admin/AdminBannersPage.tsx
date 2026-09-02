import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, X } from 'lucide-react'
import {
  deleteAdminBanner,
  fetchAdminBanners,
  fileToDataUrl,
  reorderAdminBanners,
  saveAdminBanner,
  type AdminBanner,
} from '../../utils/adminPanelApi'
import {
  adminBtn,
  adminBtnGhost,
  adminCard,
  adminMuted,
  adminPageTitle,
} from './adminUi'

const POSTER_HINT = 'Recommended size: 1200 × 400 px'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [poster, setPoster] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setError(null)
    try {
      setBanners(await fetchAdminBanners())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload a PNG, JPG, or WebP poster')
      return
    }
    setError(null)
    setPoster(await fileToDataUrl(file))
  }

  const publish = async () => {
    if (!poster) return
    setSaving(true)
    setError(null)
    try {
      await saveAdminBanner({
        title: 'Poster',
        image_url: poster,
        is_active: true,
        display_order: banners.length,
      })
      setPoster(null)
      setDrawerOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (banner: AdminBanner) => {
    try {
      await saveAdminBanner(
        {
          title: banner.title || 'Poster',
          image_url: banner.image_url,
          is_active: !banner.is_active,
        },
        banner.id,
      )
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const onDrop = async (targetId: number) => {
    if (dragId == null || dragId === targetId) return
    const next = [...banners]
    const from = next.findIndex((b) => b.id === dragId)
    const to = next.findIndex((b) => b.id === targetId)
    if (from < 0 || to < 0) return
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved!)
    setBanners(next)
    setDragId(null)
    try {
      await reorderAdminBanners(next.map((b) => b.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reorder failed')
      await load()
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={adminPageTitle}>Banners</h1>
          <p className={`mt-1.5 ${adminMuted}`}>
            Upload a Photoshop poster. It shows as-is on the student dashboard.
          </p>
        </div>
        <button type="button" className={adminBtn} onClick={() => setDrawerOpen(true)}>
          New banner
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      <ul className="mt-8 space-y-3">
        {banners.map((banner) => (
          <li
            key={banner.id}
            draggable
            onDragStart={() => setDragId(banner.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => void onDrop(banner.id)}
            className={`${adminCard} flex cursor-grab items-center gap-4 p-3`}
          >
            {banner.image_url ? (
              <img
                src={banner.image_url}
                alt=""
                className="h-16 w-40 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-16 w-40 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-400">
                No poster
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">Poster</p>
              <p className="text-xs text-zinc-400">Drag to reorder · {POSTER_HINT}</p>
            </div>
            <button
              type="button"
              onClick={() => void toggleActive(banner)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                banner.is_active
                  ? 'bg-zinc-900 text-white'
                  : 'border border-zinc-200 bg-white text-zinc-500'
              }`}
            >
              {banner.is_active ? 'Active' : 'Inactive'}
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
              aria-label="Delete banner"
              onClick={() => {
                void deleteAdminBanner(banner.id).then(load)
              }}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </li>
        ))}
        {banners.length === 0 ? (
          <li className={`${adminCard} px-4 py-14 text-center text-sm text-zinc-400`}>
            No posters yet. Upload one from Photoshop.
          </li>
        ) : null}
      </ul>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/20">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close"
            onClick={() => {
              setDrawerOpen(false)
              setPoster(null)
            }}
          />
          <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <h2 className="text-base font-semibold text-zinc-900">New banner</h2>
              <button
                type="button"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
                onClick={() => {
                  setDrawerOpen(false)
                  setPoster(null)
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
                Upload banner poster
              </p>
              <p className="mt-1 text-sm text-zinc-500">{POSTER_HINT}</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  void onFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  void onFile(e.dataTransfer.files[0])
                }}
                className="mt-4 flex min-h-44 w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center transition hover:border-zinc-400 hover:bg-zinc-100"
              >
                {poster ? (
                  <img
                    src={poster}
                    alt="Poster preview"
                    className="max-h-40 w-full rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
                    <p className="mt-3 text-sm font-medium text-zinc-700">
                      Drag and drop or click to upload
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">PNG, JPG, WebP</p>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-4">
              <button
                type="button"
                className={adminBtnGhost}
                onClick={() => {
                  setDrawerOpen(false)
                  setPoster(null)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!poster || saving}
                className={adminBtn}
                onClick={() => void publish()}
              >
                {saving ? 'Saving…' : 'Publish'}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
