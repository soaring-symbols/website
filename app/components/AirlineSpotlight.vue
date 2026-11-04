<template>
  <article class="flex flex-col gap-5">
    <div
      class="flex aspect-[2/1] items-center justify-center overflow-hidden rounded-xl bg-white p-8 sm:p-10"
      :style="{ backgroundImage: tint }"
    >
      <img
        :src="assetUrl(airline, 'logo')"
        :alt="`${airline.name} logo`"
        class="size-full object-contain"
      />
    </div>

    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <component
          :is="headingTag"
          class="text-2xl font-extrabold tracking-tight text-highlighted text-balance"
        >
          {{ airline.name }}
        </component>
        <p v-if="airline.branding?.tagline" class="mt-1 text-muted">
          “{{ airline.branding.tagline }}”
        </p>
      </div>
      <div
        v-if="hasAsset(airline, 'icon')"
        class="grid size-16 shrink-0 place-items-center rounded-lg bg-white p-3"
        :style="{ backgroundImage: tint }"
      >
        <img
          :src="assetUrl(airline, 'icon')"
          :alt="`${airline.name} icon`"
          class="size-full object-contain"
        />
      </div>
    </div>

    <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
      <div>
        <dt class="text-muted">Country</dt>
        <dd class="font-semibold text-highlighted">
          {{ countryFlag(airline.country) }} {{ countryName(airline.country) }}
        </dd>
      </div>
      <div>
        <dt class="text-muted">IATA and ICAO codes</dt>
        <dd class="font-semibold text-highlighted">
          {{ airline.iata }} and {{ airline.icao }}
        </dd>
      </div>
      <div>
        <dt class="text-muted">Alliance</dt>
        <dd class="font-semibold text-highlighted">
          {{ airline.alliance ?? 'None' }}
        </dd>
      </div>
      <div v-if="airline.website">
        <dt class="text-muted">Website</dt>
        <dd class="truncate font-semibold">
          <a
            :href="airline.website"
            target="_blank"
            rel="noopener"
            class="text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
          >
            {{ cleanUrl(airline.website) }}
          </a>
        </dd>
      </div>
    </dl>

    <div v-if="colors.length" class="flex flex-col gap-2">
      <p class="text-sm text-muted">Brand colors, click to copy</p>
      <ul class="flex flex-wrap gap-2">
        <li v-for="color in colors" :key="color">
          <button
            type="button"
            class="flex cursor-pointer items-center gap-2 rounded-full bg-elevated py-1 ps-1 pe-3 text-xs font-semibold text-highlighted hover:bg-accented focus-visible:outline-2 focus-visible:outline-primary"
            @click="copy(color)"
          >
            <span
              class="size-5 rounded-full ring-1 ring-black/10 ring-inset dark:ring-white/25"
              :style="{ backgroundColor: color }"
            />
            {{ color.toUpperCase() }}
          </button>
        </li>
      </ul>
    </div>

    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="download in downloads"
        :key="download.variant"
        :to="assetUrl(airline, download.variant)"
        external
        :download="`${airline.slug}-${download.variant}.svg`"
        :label="download.label"
        icon="hugeicons:download-04"
        :variant="download.variant === 'logo' ? 'solid' : 'outline'"
        :class="download.variant === 'logo' ? 'btn-signal' : undefined"
        :ui="{ label: 'block' }"
      />
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  airline: { type: Object, required: true },
  headingTag: { type: String, default: 'h2' },
})

const toast = useToast()

// A faint wash of the airline's own color behind its marks
const tint = computed(() => brandTint(props.airline))

const colors = computed(() => {
  const c = props.airline.branding?.colors
  return [
    ...new Set(
      [...(c?.logo ?? []), ...(c?.icon ?? [])].map((x) => x.toLowerCase()),
    ),
  ]
})

const downloads = computed(() =>
  [
    { variant: 'logo', label: 'Download logo' },
    { variant: 'icon', label: 'Download icon' },
    { variant: 'tail', label: 'Download tail' },
  ].filter((d) => hasAsset(props.airline, d.variant)),
)

async function copy(color) {
  await navigator.clipboard.writeText(color)
  toast.add({ title: `Copied ${color.toUpperCase()}`, duration: 1500 })
}
</script>
