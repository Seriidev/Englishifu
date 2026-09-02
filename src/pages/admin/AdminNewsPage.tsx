import { useEffect, useState, type FormEvent } from 'react'
import {
  deleteAdminNews,
  fetchAdminNews,
  fileToDataUrl,
  saveAdminNews,
  type AdminNewsPost,
} from '../../utils/adminPanelApi'

const empty = {
  title: '',
  body: '',
  cover_image_url: '',
  is_published: false,
}

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<AdminNewsPost[]>([])
  const [editing, setEditing] = useState<Partial<AdminNewsPost>>(empty)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setPosts(await fetchAdminNews())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing.title?.trim() || !editing.body?.trim()) return
    setSaving(true)
    setError(null)
    try {
      await saveAdminNews(
        {
          title: editing.title.trim(),
          body: editing.body,
          cover_image_url: editing.cover_image_url || '',
          is_published: Boolean(editing.is_published),
        },
        editing.id,
      )
      setEditing(empty)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900">News</h1>
      <p className="mt-1 text-sm text-slate-500">
        Markdown-friendly textarea. Published posts appear on the student
        dashboard.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="mt-6 grid gap-4 lg:grid-cols-2"
      >
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <input
            required
            placeholder="Title"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={editing.title ?? ''}
            onChange={(e) => setEditing((s) => ({ ...s, title: e.target.value }))}
          />
          <textarea
            required
            rows={10}
            placeholder="Body (markdown)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={editing.body ?? ''}
            onChange={(e) => setEditing((s) => ({ ...s, body: e.target.value }))}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              void fileToDataUrl(file).then((url) =>
                setEditing((s) => ({ ...s, cover_image_url: url })),
              )
            }}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(editing.is_published)}
              onChange={(e) =>
                setEditing((s) => ({ ...s, is_published: e.target.checked }))
              }
            />
            Published
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              {editing.id ? 'Save post' : 'Create post'}
            </button>
            {editing.id ? (
              <button
                type="button"
                onClick={() => setEditing(empty)}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Preview
          </p>
          <h2 className="mt-2 text-lg font-bold">{editing.title || 'Untitled'}</h2>
          <div className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
            {editing.body || 'Nothing to preview yet.'}
          </div>
        </div>
      </form>
      <ul className="mt-6 space-y-2">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-semibold">{post.title}</p>
              <p className="text-xs text-slate-500">
                {post.is_published ? 'Published' : 'Draft'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-sm font-semibold text-indigo-600"
                onClick={() => setEditing(post)}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-sm font-semibold text-red-600"
                onClick={() => {
                  void deleteAdminNews(post.id).then(load)
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
