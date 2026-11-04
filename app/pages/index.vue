<template>
  <div>
    <!-- Hero: what this is, a way in, and the board -->
    <section class="pt-6 pb-16 sm:pt-12 lg:pb-24">
      <div class="max-w-3xl">
        <h1
          class="text-4xl font-extrabold tracking-tight text-highlighted text-balance sm:text-6xl sm:leading-[1.05]"
        >
          Airline logos and icons, drawn as clean SVG.
        </h1>
        <p class="mt-5 max-w-2xl text-lg text-toned text-pretty">
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
            placeholder="Airline name, IATA or ICAO code"
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

      <div
        class="mt-12 grid items-start gap-8 lg:mt-16 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
      >
        <DepartureBoard v-model:selected="selectedSlug" :airlines="airlines" />
        <div class="rounded-xl bg-surface p-5 sm:p-6" aria-live="polite">
          <AirlineSpotlight v-if="selected" :airline="selected" />
        </div>
      </div>
    </section>

    <!-- The whole collection at a glance -->
    <section class="border-t border-default py-16 lg:py-24">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div class="max-w-2xl">
          <h2
            class="text-3xl font-extrabold tracking-tight text-highlighted text-balance"
          >
            {{ withIcons.length }} icons, one canvas
          </h2>
          <p class="mt-3 text-toned text-pretty">
            Every icon is drawn on the same 24×24 grid and keeps the airline’s
            official colors, so a row of them lines up wherever you use it.
          </p>
        </div>
        <UButton
          to="/browse"
          label="Browse all airlines"
          variant="outline"
          size="lg"
          :ui="{ label: 'block' }"
        />
      </div>

      <ul class="icon-wall mt-10">
        <li v-for="airline in withIcons" :key="airline.slug">
          <NuxtLink
            :to="{ path: '/browse', query: { q: airline.iata } }"
            :title="airline.name"
            class="grid aspect-square place-items-center rounded-lg bg-white p-3 hover:bg-slate-100 dark:bg-slate-100 dark:hover:bg-white focus-visible:outline-2 focus-visible:outline-primary"
          >
            <img
              :src="assetUrl(airline, 'icon')"
              :alt="airline.name"
              loading="lazy"
              class="size-full object-contain"
            />
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- For developers -->
    <section
      id="use"
      class="grid items-start gap-10 border-t border-default py-16 lg:grid-cols-2 lg:py-24"
    >
      <div class="max-w-xl">
        <h2
          class="text-3xl font-extrabold tracking-tight text-highlighted text-balance"
        >
          Use them in your project
        </h2>
        <p class="mt-3 text-toned text-pretty">
          The npm package ships every SVG with its airline’s codes, country,
          alliance and brand colors. Look an airline up by IATA code, ICAO code
          or name.
        </p>

        <div
          class="mt-6 flex items-center justify-between gap-3 rounded-lg bg-board py-2 ps-4 pe-2 text-flap-ink"
        >
          <code class="truncate font-mono text-sm">{{ installCommand }}</code>
          <UButton
            :icon="copied ? 'hugeicons:tick-02' : 'hugeicons:copy-01'"
            :aria-label="copied ? 'Copied' : 'Copy install command'"
            variant="ghost"
            class="text-flap-ink hover:bg-white/10"
            @click="copyInstall"
          />
        </div>

        <ul class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <li v-for="link in ecosystem" :key="link.to">
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
      </div>

      <pre
        class="overflow-x-auto rounded-xl bg-board p-5 font-mono text-[0.8125rem] leading-relaxed text-flap-ink"
      ><code><span class="text-flap-ink/50">import</span> { getAirline, getAssets } <span class="text-flap-ink/50">from</span> 'soaring-symbols'

getAirline('VN')
<span class="text-flap-ink/50">// {
//   name: 'Vietnam Airlines',
//   iata: 'VN',
//   icao: 'HVN',
//   country: 'VN',
//   alliance: 'SkyTeam',
//   branding: { primary_color: '#d99e09', ... }
// }</span>

getAssets('VN').logo.color
<span class="text-flap-ink/50">// 'assets/vietnam-airlines/logo.svg'</span></code></pre>
    </section>

    <!-- Contributing -->
    <section class="border-t border-default py-16 lg:py-24">
      <div class="max-w-2xl">
        <h2
          class="text-3xl font-extrabold tracking-tight text-highlighted text-balance"
        >
          Add an airline
        </h2>
        <p class="mt-3 text-toned text-pretty">
          Missing a carrier, or spotted an outdated logo? Contributions go
          through GitHub in three steps.
        </p>
      </div>

      <ol class="mt-10 grid gap-8 md:grid-cols-3">
        <li v-for="(step, i) in steps" :key="step.title" class="flex gap-4">
          <FlapText :text="String(i + 1)" :length="1" class="step-number" />
          <div>
            <h3 class="font-bold text-highlighted">{{ step.title }}</h3>
            <p class="mt-1 text-sm text-toned">{{ step.description }}</p>
            <ULink
              :to="step.to"
              :target="step.external ? '_blank' : undefined"
              class="mt-3 inline-block text-sm font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
            >
              {{ step.action }}
            </ULink>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup>
const { airlines, stats } = useAirlines()

const withIcons = airlines.filter((a) => hasAsset(a, 'icon'))

const selectedSlug = ref()
const selected = computed(() =>
  airlines.find((a) => a.slug === selectedSlug.value),
)

const query = ref('')

function search() {
  const q = query.value.trim()
  navigateTo({ path: '/browse', query: q ? { q } : {} })
}

const installCommand = 'npm install soaring-symbols'
const copied = ref(false)

async function copyInstall() {
  await navigator.clipboard.writeText(installCommand)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

const ecosystem = [
  {
    label: 'npm package',
    icon: 'hugeicons:package',
    to: 'https://www.npmjs.com/package/soaring-symbols',
  },
  {
    label: 'Raycast extension',
    icon: 'hugeicons:command',
    to: 'https://www.raycast.com/anhthang/soaring-symbols',
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
    to: 'https://github.com/soaring-symbols/soaring-symbols/blob/main/CONTRIBUTING.md',
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
  flex-shrink: 0;
}
</style>
