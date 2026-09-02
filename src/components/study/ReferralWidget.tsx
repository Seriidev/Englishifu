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

  useEffect(() => {
    void fetchMyReferral()
      .then((data) => {
        setCode(data.referralCode)
        setInvited(data.invited)
        setConverted(data.converted)
        setCredits(data.creditsEarned)
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Could not load referral'),
      )
  }, [])

  if (error && !code) return null

  const link = `${window.location.origin}/signup?ref=${encodeURIComponent(code)}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Gift className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">
            Invite friends
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            You&apos;ve invited {invited} friends, {credits} credits earned
            {converted ? ` · ${converted} converted` : ''}. Credits become
            lesson discounts later.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
              {code ? link : 'Loading…'}
            </code>
            <button
              type="button"
              disabled={!code}
              onClick={() => void copy()}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
