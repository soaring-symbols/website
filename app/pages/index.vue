<template>
  <div>
    <!-- Hero: what this is, a way in, and the board -->
    <section class="pt-6 pb-16 sm:pt-12 lg:pb-24">
      <div
        class="grid items-center gap-12 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-14"
      >
        <div>
          <h1
            class="text-4xl font-extrabold tracking-tight text-highlighted text-balance sm:text-6xl sm:leading-[1.05]"
          >
            Airline logos and icons, drawn as clean SVG.
          </h1>
          <p class="mt-5 text-lg text-toned text-pretty">
            Soaring Symbols collects the logos, icons and brand colors of
            {{ stats.total }} airlines from {{ stats.countries }} countries.
            Browse them, download them, or install the whole set from npm.
          </p>

          <form
            class="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            role="search"
            @submit.prevent="search"
          >
            <UInput
              v-model="query"
              size="xl"
              icon="hugeicons:search-01"
              placeholder="Name, code or callsign"
              aria-label="Find an airline"
              class="flex-1"
              :ui="{ base: 'bg-surface' }"
            />
            <UButton
              type="submit"
              size="xl"
              label="Find airline"
              class="btn-signal justify-center"
              :ui="{ label: 'block' }"
            />
          </form>
        </div>

        <DepartureBoard v-model:selected="selectedSlug" :airlines="airlines" />
      </div>

      <div class="mt-8 rounded-xl bg-surface p-5 sm:p-6" aria-live="polite">
        <AirlineSpotlight v-if="selected" :airline="selected" steady />
      </div>
    </section>

    <!-- The whole collection at a glance -->
    <UPageSection>
      <!-- A page header, so the link sits on the title row -->
      <template #header>
        <UPageHeader
          :as="{ title: 'h2' }"
          :title="`${withIcons.length} icons, one canvas`"
          description="Every icon is drawn on the same 24×24 grid and keeps the airline’s official colors, so a row of them lines up wherever you use it."
          :links="[
            {
              to: '/browse',
              label: 'Browse all airlines',
              trailingIcon: 'hugeicons:arrow-right-02',
              size: 'lg',
              ui: { label: 'block' },
            },
          ]"
          :ui="{ title: 'text-3xl sm:text-3xl', description: 'text-base' }"
        />
      </template>

      <ul class="icon-wall">
        <li v-for="airline in withIcons" :key="airline.slug">
          <!-- The name on hover or keyboard focus, right away -->
          <UTooltip :text="airline.name" :delay-duration="0">
            <NuxtLink
              :to="`/airlines/${airline.slug}`"
              class="grid aspect-square place-items-center rounded-lg bg-white p-3 hover:bg-slate-100 dark:bg-slate-300 dark:hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <img
                :src="assetUrl(airline, 'icon')"
                :alt="airline.name"
                loading="lazy"
                class="size-full object-contain"
              />
            </NuxtLink>
          </UTooltip>
        </li>
      </ul>
    </UPageSection>

    <!-- For developers -->
    <UPageSection
      id="use"
      title="Use them in your project"
      description="The npm package ships every SVG with its airline’s codes, callsign, country, alliance, hubs, founding year and brand colors. Look an airline up by IATA code, ICAO code or name."
      orientation="horizontal"
      :ui="{ body: 'mt-6' }"
    >
      <template #body>
        <div class="rounded-lg bg-board text-flap-ink">
          <div
            class="flex gap-1 border-b border-white/10 px-2 pt-2"
            role="group"
            aria-label="Package manager"
          >
            <button
              v-for="manager in packageManagers"
              :key="manager.name"
              type="button"
              class="-mb-px cursor-pointer border-b-2 px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-signal-500"
              :class="
                manager.name === packageManager
                  ? 'border-signal-500 text-flap-ink'
                  : 'border-transparent text-flap-ink/55 hover:text-flap-ink'
              "
              :aria-pressed="manager.name === packageManager"
              @click="packageManager = manager.name"
            >
              {{ manager.name }}
            </button>
          </div>
          <div class="flex items-center justify-between gap-3 py-2 ps-4 pe-2">
            <code class="truncate font-mono text-sm">{{ installCommand }}</code>
            <UButton
              :icon="copied ? 'hugeicons:tick-02' : 'hugeicons:copy-01'"
              :aria-label="copied ? 'Copied' : 'Copy install command'"
              variant="ghost"
              class="text-flap-ink hover:bg-white/10"
              @click="copyInstall"
            />
          </div>
        </div>

        <ul class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <li v-for="link in packageLinks" :key="link.to">
            <ULink
              :to="link.to"
              target="_blank"
              class="inline-flex items-center gap-1.5 text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
            >
              <UIcon :name="link.icon" class="size-4" />
              {{ link.label }}
            </ULink>
          </li>
        </ul>
      </template>

      <pre
        class="overflow-x-auto rounded-xl bg-board p-5 font-mono text-[0.8125rem] leading-relaxed text-flap-ink"
      ><code><span class="text-flap-ink/50">import</span> { getAirline, getAssetPath } <span class="text-flap-ink/50">from</span> 'soaring-symbols'

getAirline('VN')
<span class="text-flap-ink/50">// {
//   name: 'Vietnam Airlines',
//   iata: 'VN',
//   icao: 'HVN',
//   country: 'VN',
//   alliance: 'SkyTeam',
//   branding: { primary_color: '#d99e09', ... }
// }</span>

getAssetPath('VN', 'logo')
<span class="text-flap-ink/50">// 'soaring-symbols/assets/vietnam-airlines/logo.svg'</span></code></pre>
    </UPageSection>

    <!-- Other tools that ship the same marks, in full on /ecosystem -->
    <UPageSection id="ecosystem">
      <template #header>
        <UPageHeader
          :as="{ title: 'h2' }"
          title="Ecosystem"
          description="The same marks, ready in the tools you already use: files on a CDN, a JSON and image API, and apps and plugins."
          :links="[
            {
              to: '/ecosystem',
              label: 'See the ecosystem',
              trailingIcon: 'hugeicons:arrow-right-02',
              size: 'lg',
              ui: { label: 'block' },
            },
          ]"
          :ui="{ title: 'text-3xl sm:text-3xl', description: 'text-base' }"
        />
      </template>

      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <li v-for="entry in ecosystem" :key="entry.id">
          <NuxtLink
            :to="`/ecosystem#${entry.id}`"
            class="flex h-full items-center gap-3 rounded-lg bg-surface p-4 ring ring-default hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
          >
            <UIcon :name="entry.icon" class="size-6 shrink-0 text-primary" />
            <span class="flex flex-col gap-1">
              <span class="font-semibold text-highlighted">{{
                entry.name
              }}</span>
              <span v-if="entry.inDevelopment" class="text-xs text-muted">
                In development
              </span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </UPageSection>

    <!-- Contributing -->
    <UPageSection
      title="Add an airline"
      description="Missing a carrier, or spotted an outdated logo? Contributions go through GitHub in three steps."
    >
      <template #features>
        <UPageFeature
          v-for="(step, i) in steps"
          :key="step.title"
          as="li"
          :title="step.title"
          orientation="horizontal"
          :ui="{ leading: 'size-auto bg-transparent' }"
        >
          <template #leading>
            <FlapText :text="String(i + 1)" :length="1" class="step-number" />
          </template>
          <template #description>
            <p>{{ step.description }}</p>
            <ULink
              :to="step.to"
              :target="step.external ? '_blank' : undefined"
              class="mt-3 inline-block font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
            >
              {{ step.action }}
            </ULink>
          </template>
        </UPageFeature>
      </template>
    </UPageSection>
  </div>
</template>

<script setup>
import { ecosystem } from '~/data/ecosystem'

const { airlines, stats } = useAirlines()

defineOgImage('Site')

// One tile per drawn icon: an airline flying another's marks (a subsidiary
// using its parent's logo) would only repeat that icon
const withIcons = airlines.filter((a) => !a.marks && hasAsset(a, 'icon'))

// The first row of the departure board, set here so the spotlight renders
// the same on the server and in the browser
const selectedSlug = ref('vietnam-airlines')
const selected = computed(() =>
  airlines.find((a) => a.slug === selectedSlug.value),
)

const query = ref('')

function search() {
  const q = query.value.trim()
  navigateTo({ path: '/browse', query: q ? { q } : {} })
}

const packageManagers = [
  { name: 'npm', command: 'npm install soaring-symbols' },
  { name: 'yarn', command: 'yarn add soaring-symbols' },
  { name: 'pnpm', command: 'pnpm add soaring-symbols' },
  { name: 'bun', command: 'bun add soaring-symbols' },
]
const packageManager = ref('npm')
const installCommand = computed(
  () => packageManagers.find((m) => m.name === packageManager.value).command,
)
const copied = ref(false)

async function copyInstall() {
  await navigator.clipboard.writeText(installCommand.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

const packageLinks = [
  {
    label: 'npm package',
    icon: 'hugeicons:package',
    to: 'https://www.npmjs.com/package/soaring-symbols',
  },
  {
    label: 'Source on GitHub',
    icon: 'hugeicons:github',
    to: 'https://github.com/soaring-symbols/soaring-symbols',
  },
]

const steps = [
  {
    title: 'Draw the SVG',
    description:
      'Trace the logo on a 64×64 canvas and the icon on 24×24, using the official colors.',
    action: 'Read the guidelines',
    to: CONTRIBUTING_URL,
    external: true,
  },
  {
    title: 'Check it',
    description:
      'The validator flags transforms, stray scripts and artwork that does not fill the canvas.',
    action: 'Open the validator',
    to: '/validate',
  },
  {
    title: 'Open a pull request',
    description:
      'Add the files and the airline’s details. A maintainer reviews it before release.',
    action: 'Go to GitHub',
    to: 'https://github.com/soaring-symbols/soaring-symbols/pulls',
    external: true,
  },
]
</script>

<style scoped>
.icon-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(3.5rem, 1fr));
  gap: 0.5rem;
}

.step-number {
  --flap: 2rem;
}
</style>
