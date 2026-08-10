import type { ReactNode } from 'react'
import { GraduationCap } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

function SocialIcon({ label, children }: { label: string; children: ReactNode }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
    >
      {children}
    </a>
  )
}

export default function Footer() {
  const { t } = useLanguage()

  const columns = [
    {
      title: t('footer.support'),
      links: ['Help Center', 'Contact Support', 'Pricing Plans', 'Student Guide'],
    },
    {
      title: t('footer.about'),
      links: ['Our Story', 'Careers', 'Partners', 'Blog'],
    },
    {
      title: t('footer.faq'),
      links: ['Getting Started', 'TOEFL Prep', 'Tutor Matching', 'Payments'],
    },
  ]

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-xl font-bold">Englishcore</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              {t('footer.tagline')}
            </p>
            <div className="mt-6 flex gap-3">
              <SocialIcon label="Telegram">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M21.5 3.5 2.8 10.7c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4.9 1 .9.5 0 .7-.2 1-.6l2.3-2.4 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5zM8.9 13.7l9.6-6.1c.4-.2.8 0 .5.3l-7.8 7.1-.3 3.2-1.9-4.5z" />
                </svg>
              </SocialIcon>
              <SocialIcon label="Instagram">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11.2 1.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                </svg>
              </SocialIcon>
              <SocialIcon label="TikTok">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M16.5 3c.4 2.4 1.8 4.1 4 4.5v3.1c-1.4 0-2.7-.4-4-1.1v5.6c0 3.8-2.9 6.4-6.6 6.4S3 18.9 3 15.1c0-3.7 2.8-6.3 6.4-6.3.4 0 .8 0 1.2.1v3.3c-.4-.2-.8-.3-1.2-.3-1.9 0-3.3 1.4-3.3 3.3S7.5 18.5 9.4 18.5s3.1-1.4 3.1-3.3V3h4z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-bold tracking-wide uppercase text-white">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-white/60 transition hover:text-white"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          © 2026 Englishcore. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
