<template>
  <!-- Ways to use one alliance's marks and data in code: the npm package, a
       CDN link and the site's API, each line ready to copy. Lines about a
       file wait until the collection has a mark. -->
  <UsageTabs :tabs="tabs" />
</template>

<script setup>
const props = defineProps({
  alliance: { type: Object, required: true },
})

const { site } = useRuntimeConfig().public

const tabs = computed(() => {
  const alliance = props.alliance
  const { slug } = alliance
  const variant = allianceMark(alliance)
  const api = `${site.homepage}/api/alliances/${slug}`
  const mono = MARK_SOURCES.alliances.types
    .map((t) => `${t.variant}-mono`)
    .find((v) => hasAsset(alliance, v))
  const brand = brandColor(alliance).replace('#', '')

  return [
    {
      id: 'npm',
      label: 'npm',
      items: [
        { label: 'Install', code: 'npm install soaring-symbols' },
        {
          label: 'Look it up',
          code: `import { ${variant ? 'getAlliance, getAllianceAssetPath' : 'getAlliance'} } from 'soaring-symbols'\n\ngetAlliance('${slug}')`,
          result: usageComment(lookupResult(alliance)),
        },
        variant && {
          label: 'Path to a file',
          code: `getAllianceAssetPath('${slug}', '${variant}')`,
          result: `// '${packagePath(alliance, variant, undefined, 'alliances')}'`,
        },
      ].filter(Boolean),
    },
    variant && {
      id: 'cdn',
      label: 'CDN',
      items: [
        { label: 'jsDelivr', code: allianceCdnUrl(alliance, variant) },
        {
          label: 'unpkg',
          code: `https://unpkg.com/soaring-symbols/dist/alliances/${assetPath(alliance, variant)}`,
        },
        {
          label: 'HTML',
          code: `<img src="${allianceCdnUrl(alliance, variant)}" alt="${alliance.name}" height="48">`,
        },
      ],
    },
    {
      id: 'api',
      label: 'API',
      items: [
        {
          label: variant ? 'Data and file links, as JSON' : 'Data, as JSON',
          code: api,
          result: usageComment(
            [
              '{',
              `  "name": "${alliance.name}",`,
              '  …,',
              '  "links": {',
              variant
                ? `    "${variant}": "${site.homepage}/…/${variant}.svg",`
                : `    "page": "${site.homepage}/alliances/${slug}"`,
              ...(variant ? ['    …'] : []),
              '  }',
              '}',
            ].join('\n'),
          ),
        },
        variant && {
          label: 'A PNG, for apps that can’t render SVG',
          code: `${api}/${variant}.png?size=256`,
        },
        mono && {
          label: 'A monochrome mark in any color',
          code: `${api}/${mono}.svg?color=${brand}`,
        },
      ].filter(Boolean),
    },
  ].filter(Boolean)
})

// What getAlliance() returns, cut to the fields worth showing
function lookupResult(alliance) {
  const q = usageQuote
  const marks = MARK_SOURCES.alliances.types.filter(
    (t) => alliance.assets[t.variant],
  )
  const fields = [
    ['name', q(alliance.name)],
    ['slug', q(alliance.slug)],
    alliance.founded && ['founded', alliance.founded],
    alliance.defunct && ['defunct', 'true'],
    alliance.ceased && ['ceased', alliance.ceased],
    alliance.branding?.primary_color && [
      'branding',
      `{ primary_color: ${q(alliance.branding.primary_color)}, … }`,
    ],
    [
      'assets',
      marks.length
        ? `{ ${marks.map((t) => `${t.variant}: {…}`).join(', ')} }`
        : '{}',
    ],
  ].filter(Boolean)

  return ['{', ...fields.map(([k, v]) => `  ${k}: ${v},`), '  …', '}'].join(
    '\n',
  )
}
</script>
