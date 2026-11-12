<template>
  <!-- Ways to use one airline's marks and data in code: the npm package, a
       CDN link and the site's API, each line ready to copy -->
  <div class="overflow-hidden rounded-xl bg-board text-flap-ink">
    <div
      class="flex gap-1 border-b border-white/10 px-2 pt-2"
      role="tablist"
      aria-label="How to use it"
    >
      <button
        v-for="tab in tabs"
        :id="`usage-tab-${tab.id}`"
        :key="tab.id"
        type="button"
        role="tab"
        class="-mb-px cursor-pointer border-b-2 px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-signal-500"
        :class="
          tab.id === current
            ? 'border-signal-500 text-flap-ink'
            : 'border-transparent text-flap-ink/55 hover:text-flap-ink'
        "
        :aria-selected="tab.id === current"
        :aria-controls="`usage-panel-${tab.id}`"
        @click="current = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div
      :id="`usage-panel-${current}`"
      role="tabpanel"
      :aria-labelledby="`usage-tab-${current}`"
      class="flex flex-col divide-y divide-white/10"
    >
      <div
        v-for="item in activeTab.items"
        :key="item.label"
        class="flex flex-col gap-1.5 py-4 ps-5 pe-3"
      >
        <p class="text-xs font-semibold text-flap-ink/55">{{ item.label }}</p>
        <div class="flex items-start gap-3">
          <pre
            class="min-w-0 flex-1 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]"
          ><code>{{ item.code }}<template v-if="item.result">
<span class="text-flap-ink/50">{{ item.result }}</span></template></code></pre>
          <UButton
            :icon="
              copied === item.code ? 'solar:check-linear' : 'solar:copy-linear'
            "
            :aria-label="
              copied === item.code
                ? 'Copied'
                : `Copy ${item.label.toLowerCase()}`
            "
            variant="ghost"
            size="sm"
            class="-mt-1 shrink-0 text-flap-ink hover:bg-white/10"
            @click="copy(item.code)"
          />
        </div>
      </div>
    </div>
  </div>
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
          result: comment(lookupResult(airline)),
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
          code: `https://unpkg.com/soaring-symbols/dist/assets/${assetFile}`,
        },
        {
          label: 'HTML',
          code: `<img src="${cdnUrl(airline, variant)}" alt="${airline.name} ${variant}" height="48">`,
        },
      ],
    },
    {
      id: 'api',
      label: 'API',
      items: [
        {
          label: 'Data and file links, as JSON',
          code: api,
          result: comment(
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
        mono && {
          label: 'A monochrome mark in any color',
          code: `${api}/${mono}.svg?color=${brand}`,
        },
      ].filter(Boolean),
    },
  ]
})

const current = ref('npm')
const activeTab = computed(() => tabs.value.find((t) => t.id === current.value))

// What getAirline() returns, cut to the fields worth showing
function lookupResult(airline) {
  const q = (value) => `'${String(value).replace(/'/g, "\\'")}'`
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
        .map((t) => `${t.variant}: {…}`)
        .join(', ')} }`,
    ],
  ].filter(Boolean)

  return ['{', ...fields.map(([k, v]) => `  ${k}: ${v},`), '  …', '}'].join(
    '\n',
  )
}

function comment(text) {
  return text
    .split('\n')
    .map((line) => `// ${line}`)
    .join('\n')
}

const copied = ref(null)

async function copy(code) {
  await navigator.clipboard.writeText(code)
  copied.value = code
  setTimeout(() => {
    if (copied.value === code) copied.value = null
  }, 1500)
}
</script>
