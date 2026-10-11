export const SITE_ORIGIN = 'https://englishcore.vercel.app'
export const SITE_NAME = 'Englishcore'

export type PageSeo = {
  path: string
  title: string
  description: string
  index: boolean
  priority: string
}

const BRAND_DESCRIPTION =
  'TOEFL Preparation for reading, listening, speaking, and essay writing. Practice online and study with tutors on Englishcore.'

export const INDEXABLE_PAGES: PageSeo[] = [
  {
    path: '/',
    title: 'TOEFL Preparation & Essay Practice | Englishcore',
    description:
      'TOEFL Preparation for reading, listening, speaking, and essay writing. Practice online, take a placement test, and study with tutors on Englishcore.',
    index: true,
    priority: '1.0',
  },
  {
    path: '/toefl',
    title: 'TOEFL Preparation Practice Hub | Englishcore',
    description:
      'Free TOEFL Preparation: reading, listening, speaking, and essay writing in the current exam format, plus a full practice test.',
    index: true,
    priority: '0.9',
  },
  {
    path: '/writing',
    title: 'TOEFL Preparation Essay & Writing Practice | Englishcore',
    description:
      'Essay preparation for TOEFL Preparation writing: build a sentence, write an email, and practice academic discussion essays with scoring.',
    index: true,
    priority: '0.9',
  },
  {
    path: '/reading',
    title: 'TOEFL Preparation Reading Practice | Englishcore',
    description:
      'TOEFL Preparation reading preparation with complete-the-words, daily-life texts, and short academic passages in exam format.',
    index: true,
    priority: '0.8',
  },
  {
    path: '/listening',
    title: 'TOEFL Preparation Listening Practice | Englishcore',
    description:
      'TOEFL Preparation listening preparation with short replies, conversations, announcements, and academic talks.',
    index: true,
    priority: '0.8',
  },
  {
    path: '/listening/library',
    title: 'TOEFL Preparation Listening Practice Library | Englishcore',
    description:
      'Choose a TOEFL Preparation listening practice set and train for conversations, announcements, and lectures.',
    index: true,
    priority: '0.7',
  },
  {
    path: '/speaking',
    title: 'TOEFL Preparation Speaking Practice | Englishcore',
    description:
      'TOEFL Preparation speaking preparation in the 2026 format: Listen and Repeat plus interview questions, timed like the exam.',
    index: true,
    priority: '0.8',
  },
  {
    path: '/placement',
    title: 'Free English Placement Test | Englishcore',
    description:
      'Take a free English placement test, see your CEFR level, then continue TOEFL Preparation and essay preparation on Englishcore.',
    index: true,
    priority: '0.7',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Englishcore',
    description:
      'How Englishcore collects, uses, and stores account, lesson, and practice information.',
    index: true,
    priority: '0.3',
  },
  {
    path: '/full-test',
    title: 'Full TOEFL Preparation Practice Test | Englishcore',
    description:
      'Sit a full TOEFL Preparation practice test covering reading, listening, speaking, and essay writing in one session.',
    index: true,
    priority: '0.8',
  },
]

const PRIVATE_PREFIXES = [
  '/admin',
  '/study',
  '/api',
  '/login',
  '/signup',
  '/forgot-password',
  '/profile',
  '/dashboard',
  '/results',
  '/tutor',
  '/start',
]

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/+$/, '')
}

export function pageUrl(path: string): string {
  if (path === '/') return `${SITE_ORIGIN}/`
  return `${SITE_ORIGIN}${path}`
}

export function resolveSeo(pathname: string): PageSeo {
  const path = normalizePath(pathname)
  const exact = INDEXABLE_PAGES.find((page) => page.path === path)
  if (exact) return exact

  if (path.startsWith('/listening/practice/')) {
    return {
      path,
      title: 'TOEFL Preparation Listening Practice | Englishcore',
      description:
        'TOEFL Preparation listening practice item from the Englishcore library.',
      index: false,
      priority: '0.1',
    }
  }

  if (PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return {
      path,
      title: 'Englishcore',
      description: BRAND_DESCRIPTION,
      index: false,
      priority: '0.1',
    }
  }

  return {
    path,
    title: 'Englishcore',
    description: BRAND_DESCRIPTION,
    index: false,
    priority: '0.1',
  }
}

export function robotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Allow: /tutor/profile/',
    'Disallow: /admin',
    'Disallow: /study',
    'Disallow: /api/',
    'Disallow: /login',
    'Disallow: /signup',
    'Disallow: /forgot-password',
    'Disallow: /profile',
    'Disallow: /dashboard',
    'Disallow: /results',
    'Disallow: /start',
    'Disallow: /listening/practice',
    'Disallow: /seo/',
    'Disallow: /tutor/',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n')
}

export function sitemapXml(): string {
  const lastmod = new Date().toISOString().slice(0, 10)
  const urls = INDEXABLE_PAGES.map(
    (page) => `  <url>
    <loc>${pageUrl(page.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

export function structuredData(page: PageSeo): string {
  const url = pageUrl(page.path)
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      url: SITE_ORIGIN,
      email: 'support@englishcore.com',
      description: BRAND_DESCRIPTION,
      sameAs: [
        'https://t.me/englishcore',
        'https://instagram.com/englishcore',
        'https://tiktok.com/@englishcore',
      ],
    },
    {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_ORIGIN}/`,
    },
  ]

  if (page.index) {
    graph.push({
      '@type': 'Course',
      name: page.title.replace(` | ${SITE_NAME}`, ''),
      description: page.description,
      url,
      inLanguage: 'en',
      educationalLevel: 'TOEFL Preparation',
      teaches: 'TOEFL Preparation and essay writing',
      provider: {
        '@type': 'EducationalOrganization',
        name: SITE_NAME,
        url: SITE_ORIGIN,
      },
    })
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  }).replace(/</g, '\\u003c')
}

function replaceAttr(html: string, marker: string, attr: 'content' | 'href', value: string): string {
  const pattern = new RegExp(
    `(<[^>]*data-seo="${marker}"[^>]*\\s${attr}=")[^"]*(")`,
  )
  return html.replace(pattern, (_match, start: string, end: string) => {
    return `${start}${escapeAttr(value)}${end}`
  })
}

export const APP_SHELL_SEO: PageSeo = {
  path: '/',
  title: 'Englishcore',
  description: BRAND_DESCRIPTION,
  index: false,
  priority: '0.1',
}

export function renderSeoHtml(html: string, page: PageSeo): string {
  let next = html
  next = next.replace(
    /(<title\s[^>]*data-seo="title"[^>]*>)[\s\S]*?(<\/title>)/,
    `$1${escapeAttr(page.title)}$2`,
  )
  next = replaceAttr(next, 'description', 'content', page.description)
  next = replaceAttr(next, 'og:title', 'content', page.title)
  next = replaceAttr(next, 'og:description', 'content', page.description)
  next = replaceAttr(next, 'og:url', 'content', pageUrl(page.path))
  next = replaceAttr(next, 'twitter:title', 'content', page.title)
  next = replaceAttr(next, 'twitter:description', 'content', page.description)
  next = replaceAttr(
    next,
    'robots',
    'content',
    page.index ? 'index,follow' : 'noindex,nofollow',
  )
  next = replaceAttr(next, 'canonical', 'href', pageUrl(page.path))
  next = next.replace(
    /(<script\s[^>]*data-seo="jsonld"[^>]*>)[\s\S]*?(<\/script>)/,
    `$1${structuredData(page)}$2`,
  )
  return next
}

export function homeSeo(): PageSeo {
  return INDEXABLE_PAGES[0]
}
