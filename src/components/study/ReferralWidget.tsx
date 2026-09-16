import { useEffect, useState } from 'react'
import { Copy, Gift } from 'lucide-react'
import { fetchMyReferral } from '../../utils/adminPanelApi'

export default function ReferralWidget() {
  const [code, setCode] = useState('')
  const [invited, setInvited] = useState(0)
  const [converted, setConverted] = useState(0)
  const [credits, setCredits] = useState(0)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchMyReferral()
      .then((data) => {
        if (cancelled) return
        setCode(data.referralCode)
        setInvited(data.invited)
        setConverted(data.converted)
        setCredits(data.creditsEarned)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load referral')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const link = code
    ? `${window.location.origin}/signup?ref=${encodeURIComponent(code)}`
    : ''

  const copy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setError('Could not copy — select the link manually')
    }
  }

  return (
    <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Gift className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
            Your referral link
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Invite friends — you&apos;ve invited {invited}
            {converted ? `, ${converted} joined` : ''}. Credits earned:{' '}
            {credits}.
          </p>

          {error ? (
            <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
          ) : null}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="block min-w-0 flex-1 truncate rounded-xl border border-indigo-100 bg-white px-3 py-2 text-[11px] text-slate-700 sm:text-xs">
              {loading ? 'Loading…' : link || 'No link yet'}
            </code>
            <button
              type="button"
              disabled={!link}
              onClick={() => void copy()}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
