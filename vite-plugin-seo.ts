import fs from 'node:fs'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'
import {
  APP_SHELL_SEO,
  INDEXABLE_PAGES,
  homeSeo,
  renderSeoHtml,
  robotsTxt,
  sitemapXml,
} from './src/seo/site.ts'

function seoFile(pagePath: string): string {
  if (pagePath === '/') return 'seo/home.html'
  return `seo${pagePath}.html`
}

function serveText(
  res: Connect.ServerResponse,
  body: string,
  contentType: string,
) {
  res.statusCode = 200
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.end(body)
}

function attachDevRoutes(middlewares: Connect.Server) {
  middlewares.use((req, res, next) => {
    const url = req.url?.split('?')[0]
    if (url === '/robots.txt') {
      serveText(res, robotsTxt(), 'text/plain; charset=utf-8')
      return
    }
    if (url === '/sitemap.xml') {
      serveText(res, sitemapXml(), 'application/xml; charset=utf-8')
      return
    }
    next()
  })
}

export function seoPlugin(): Plugin {
  return {
    name: 'englishcore-seo',
    transformIndexHtml(html) {
      return renderSeoHtml(html, homeSeo())
    },
    configureServer(server) {
      attachDevRoutes(server.middlewares)
    },
    configurePreviewServer(server) {
      attachDevRoutes(server.middlewares)
    },
    writeBundle(options) {
      const dir = options.dir
      if (!dir) return
      const indexPath = path.join(dir, 'index.html')
      if (!fs.existsSync(indexPath)) return
      const homepageHtml = fs.readFileSync(indexPath, 'utf8')

      for (const page of INDEXABLE_PAGES) {
        if (page.path === '/') continue
        const rel = seoFile(page.path)
        const out = path.join(dir, rel)
        fs.mkdirSync(path.dirname(out), { recursive: true })
        fs.writeFileSync(out, renderSeoHtml(homepageHtml, page))
      }

      const shellPath = path.join(dir, 'seo', 'shell.html')
      fs.mkdirSync(path.dirname(shellPath), { recursive: true })
      fs.writeFileSync(shellPath, renderSeoHtml(homepageHtml, APP_SHELL_SEO))
      fs.writeFileSync(path.join(dir, 'robots.txt'), robotsTxt())
      fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemapXml())
    },
  }
}
