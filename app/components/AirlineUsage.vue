<template>
  <!-- Ways to use one airline's marks and data in code: the npm package, a
       CDN link and the site's API, each line ready to copy -->
  <UsageTabs :tabs="tabs" />
</template>

<script setup>
const props = defineProps({
  airline: { type: Object, required: true },
})

const { site } = useRuntimeConfig().public

// Codes are unique among active airlines only, so a defunct one is looked
// up by its slug, which never changes hands. A brand flying under its
// parent's codes is looked up by one it doesn't share (TAI for Avianca El
// Salvador), else by its slug (Hawaiian Airlines), since a shared code
// finds the parent.
const key = computed(() => {
  const { iata, icao, slug, defunct } = props.airline
  if (defunct) return slug
  const parent = airlineBySlug(props.airline.parent)
  const own = (field) => props.airline[field] !== parent?.[field]

  return (own('iata') && iata) || (own('icao') && icao) || slug
})

const tabs = computed(() => {
  const airline = props.airline
  const variant = firstVariant(airline) ?? 'logo'
  const history = markHistory(airline)
  const older = history[0]
  const olderVariant = older && firstVariant(airline, older)
  const assetFile = assetPath(airline, variant)
  const api = `${site.homepage}/api/airlines/${key.value}`
  // Monochrome marks take a color in the image API; the icon reads best small
  const mono = ['icon-mono', 'logo-mono', 'tail-mono'].find((v) =>
    hasAsset(airline, v),
  )
  const brand = brandColor(airline).replace('#', '')

  return [
    {
      id: 'npm',
      label: 'npm',
      items: [
        { label: 'Install', code: 'npm install soaring-symbols' },
        {
          label: 'Look it up',
          code: `import { getAirline, getAssetPath } from 'soaring-symbols'\n\ngetAirline('${key.value}')`,
          result: usageComment(lookupResult(airline)),
        },
        {
          label: 'Path to a file',
          code: `getAssetPath('${key.value}', '${variant}')`,
          result: `// '${packagePath(airline, variant)}'`,
        },
        olderVariant && {
          label: `An older ${olderVariant}`,
          code: `getAssetPath('${key.value}', '${olderVariant}', { since: ${older.since} })`,
          result: `// '${packagePath(airline, olderVariant, older)}'`,
        },
      ].filter(Boolean),
    },
    {
      id: 'cdn',
      label: 'CDN',
      items: [
        { label: 'jsDelivr', code: cdnUrl(airline, variant) },
        {
          label: 'unpkg',
          code: `https://unpkg.com/soaring-symbols/dist/airlines/${assetFile}`,
        },
        {
          label: 'HTML',
          code: `<img src="${cdnUrl(airline, variant)}" alt="${airline.name} ${variant}" height="48">`,
        },
      ],
    },
    usageCssTab(
      `${airline.slug}-${variant}`,
      cdnUrl(airline, variant),
      mono && {
        className: `${airline.slug}-${mono}`,
        url: cdnUrl(airline, mono),
      },
    ),
    {
      id: 'api',
      label: 'API',
      items: [
        {
          label: 'Data and file links, as JSON',
          code: api,
          result: usageComment(
            [
              '{',
              `  "name": "${airline.name}",`,
              '  …,',
              '  "links": {',
              `    "${variant}": "${site.homepage}/…/${variant}.svg",`,
              '    …',
              '  }',
              '}',
            ].join('\n'),
          ),
        },
        {
          label: 'A PNG, for apps that can’t render SVG',
          code: `${api}/${variant}.png?size=256`,
        },
        hasAsset(airline, 'logo') && {
          label: 'A logo cropped to its drawing, to fill a wide box',
          code: `${api}/logo.svg?viewbox=auto`,
        },
        mono && {
          label: 'A monochrome mark in any color',
          code: `${api}/${mono}.svg?color=${brand}`,
        },
      ].filter(Boolean),
    },
  ]
})

// What getAirline() returns, cut to the fields worth showing
function lookupResult(airline) {
  const q = usageQuote
  const fields = [
    ['name', q(airline.name)],
    airline.iata && ['iata', q(airline.iata)],
    airline.icao && ['icao', q(airline.icao)],
    airline.callsign && ['callsign', q(airline.callsign)],
    ['country', q(airline.country)],
    airline.alliance && ['alliance', q(airline.alliance)],
    airline.defunct && ['defunct', 'true'],
    airline.branding?.primary_color && [
      'branding',
      `{ primary_color: ${q(airline.branding.primary_color)}, … }`,
    ],
    [
      'assets',
      `{ ${MARK_TYPES.filter((t) => airline.assets[t.variant])
        .map((t) =>
          /-/.test(t.variant) ? `'${t.variant}': {…}` : `${t.variant}: {…}`,
        )
        .join(', ')} }`,
    ],
  ].filter(Boolean)

  return ['{', ...fields.map(([k, v]) => `  ${k}: ${v},`), '  …', '}'].join(
    '\n',
  )
}
</script>
