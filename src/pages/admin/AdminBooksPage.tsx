import { useEffect, useState, type FormEvent } from 'react'
import { Star } from 'lucide-react'
import {
  deleteAdminLibraryBook,
  fetchAdminLibraryBooks,
  fileToDataUrl,
  saveAdminLibraryBook,
  type AdminLibraryBook,
} from '../../utils/adminPanelApi'
import {
  LIBRARY_LEVEL_OPTIONS,
  LIBRARY_TOPIC_OPTIONS,
  libraryLevelLabel,
  libraryTopicLabel,
} from '../../data/libraryMeta'
import { adminBtn, adminMuted, adminPageTitle } from './adminUi'

const empty = {
  title: '',
  author: '',
  category: 'literature',
  level: 'A2',
  rating: 4.5,
  minutes: 10,
  description: '',
  cover_image_url: '',
  cover_headline: '',
  pdf_url: '',
  pdf_file_name: '',
  is_published: true,
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<AdminLibraryBook[]>([])
  const [editing, setEditing] = useState<Partial<AdminLibraryBook>>(empty)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setBooks(await fetchAdminLibraryBooks())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing.title?.trim() || !editing.author?.trim()) return
    if (!editing.id && !editing.cover_image_url) {
      setError('Upload a cover image')
      return
    }
    if (!editing.id && !editing.pdf_url) {
      setError('Upload the book as a PDF')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await saveAdminLibraryBook(
        {
          title: editing.title.trim(),
          author: editing.author.trim(),
          category: editing.category || 'literature',
          level: editing.level || 'A2',
          rating: Number(editing.rating || 0),
          minutes: Number(editing.minutes || 10),
          description: editing.description || '',
          coverImageUrl: editing.cover_image_url || null,
          coverHeadline: editing.cover_headline || null,
          pdfUrl: editing.pdf_url || null,
          pdfFileName: editing.pdf_file_name || null,
          isPublished: editing.is_published !== false,
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
      <h1 className={adminPageTitle}>Books</h1>
      <p className={`mt-1 ${adminMuted}`}>
        Upload a cover image and the book PDF. The student Library stays empty
        until you add a book here.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
      >
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold">
            {editing.id ? 'Edit book' : 'Add book'}
          </p>
          <label className="block text-sm font-medium">
            Title
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={editing.title ?? ''}
              onChange={(e) => setEditing((s) => ({ ...s, title: e.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium">
            Author
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={editing.author ?? ''}
              onChange={(e) => setEditing((s) => ({ ...s, author: e.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium">
            Cover
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (!file.type.startsWith('image/')) {
                  setError('Please upload a PNG, JPG, or WebP cover')
                  return
                }
                void fileToDataUrl(file).then((url) =>
                  setEditing((s) => ({ ...s, cover_image_url: url })),
                )
              }}
            />
          </label>
          {editing.cover_image_url ? (
            <img
              src={editing.cover_image_url}
              alt=""
              className="h-28 w-full rounded-lg object-cover"
            />
          ) : null}
          <label className="block text-sm font-medium">
            Book PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="mt-1 block w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const isPdf =
                  file.type === 'application/pdf' ||
                  file.name.toLowerCase().endsWith('.pdf')
                if (!isPdf) {
                  setError('Please upload a PDF file')
                  return
                }
                if (file.size > 8 * 1024 * 1024) {
                  setError('PDF must be under 8MB')
                  return
                }
                setError(null)
                void fileToDataUrl(file).then((url) =>
                  setEditing((s) => ({
                    ...s,
                    pdf_url: url,
                    pdf_file_name: file.name,
                  })),
                )
              }}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              This is the actual book students open. Max 8MB.
            </span>
          </label>
          {editing.pdf_file_name || editing.pdf_url ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              PDF ready:{' '}
              <span className="font-medium">
                {editing.pdf_file_name || 'book.pdf'}
              </span>
            </p>
          ) : null}
          <label className="block text-sm font-medium">
            Rating (0–5)
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={editing.rating ?? 0}
              onChange={(e) =>
                setEditing((s) => ({ ...s, rating: Number(e.target.value) }))
              }
            />
          </label>
          <label className="block text-sm font-medium">
            Level
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={editing.level ?? 'A2'}
              onChange={(e) => setEditing((s) => ({ ...s, level: e.target.value }))}
            >
              {LIBRARY_LEVEL_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Topic
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={editing.category ?? 'literature'}
              onChange={(e) =>
                setEditing((s) => ({ ...s, category: e.target.value }))
              }
            >
              {LIBRARY_TOPIC_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Description
            <textarea
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={editing.description ?? ''}
              onChange={(e) =>
                setEditing((s) => ({ ...s, description: e.target.value }))
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.is_published !== false}
              onChange={(e) =>
                setEditing((s) => ({ ...s, is_published: e.target.checked }))
              }
            />
            Published on Library
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={adminBtn}>
              {saving ? 'Saving…' : editing.id ? 'Save book' : 'Add book'}
            </button>
            {editing.id ? (
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
                onClick={() => setEditing(empty)}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Cover</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">PDF</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt=""
                        className="h-14 w-12 rounded object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No cover</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{book.title}</p>
                    <p className="text-xs text-slate-400">{book.author}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {Number(book.rating || 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{libraryLevelLabel(book.level)}</td>
                  <td className="px-4 py-3">{libraryTopicLabel(book.category)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {book.pdf_file_name || (book.pdf_url ? 'Uploaded' : 'Missing')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="mr-3 text-sm font-semibold text-indigo-700"
                      onClick={() => setEditing(book)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-red-600"
                      onClick={() => {
                        void deleteAdminLibraryBook(book.id).then(load)
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {books.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No books yet. Add a cover, rating, level, topic, and PDF.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  )
}
