import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pageUrl, resolveSeo, structuredData, type PageSeo } from './site'

function setMarker(marker: string, value: string) {
  const el = document.head.querySelector<HTMLElement>(`[data-seo="${marker}"]`)
  if (!el) return
  if (el.tagName === 'TITLE' || el.tagName === 'SCRIPT') {
    el.textContent = value
    return
  }
  if (el.hasAttribute('href')) el.setAttribute('href', value)
  else el.setAttribute('content', value)
}

export function applySeo(page: PageSeo) {
  document.title = page.title
  setMarker('title', page.title)
  setMarker('description', page.description)
  setMarker('og:title', page.title)
  setMarker('og:description', page.description)
  setMarker('og:url', pageUrl(page.path))
  setMarker('twitter:title', page.title)
  setMarker('twitter:description', page.description)
  setMarker('robots', page.index ? 'index,follow' : 'noindex,nofollow')
  setMarker('canonical', pageUrl(page.path))
  setMarker('jsonld', structuredData(page))
}

export default function Seo() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    applySeo(resolveSeo(pathname))
  }, [pathname])

  return null
}
