import airlines from '#airlines-data'

// Every page worth indexing: the site's own pages and one per airline.
// Prerendered with the rest of the site, so it always matches the package.
export default defineEventHandler((event) => {
  const { homepage } = useRuntimeConfig(event).public.site
  const paths = [
    '/',
    '/browse',
    '/validate',
    ...(airlines as { slug: string }[]).map(
      (airline) => `/airlines/${airline.slug}`,
    ),
  ]

  const urls = paths
    .map((path) => `  <url><loc>${new URL(path, homepage).href}</loc></url>`)
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
})
