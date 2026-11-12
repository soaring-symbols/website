<template>
  <!-- The stub torn off the departure board: the airline picked on it, its
       marks, its codes and the way to its page. One height for every
       airline, so the page below does not jump as the board turns -->
  <article class="pass @container">
    <header class="pass-head">
      <div
        class="grid size-14 shrink-0 place-items-center rounded-lg bg-white p-2.5"
        :style="{ backgroundImage: tint }"
      >
        <img
          v-if="hasAsset(airline, 'icon')"
          :src="assetUrl(airline, 'icon')"
          :alt="`${airline.name} icon`"
          class="size-full object-contain"
        />
        <span v-else class="font-mono text-lg font-bold text-neutral-800">
          {{ airline.iata ?? airline.icao }}
        </span>
      </div>
      <div class="min-w-0">
        <p class="pass-label">Now showing</p>
        <h2
          class="truncate text-xl font-extrabold tracking-tight text-highlighted"
        >
          {{ airline.name }}
        </h2>
        <p class="flex min-h-5 items-center gap-2 text-sm text-muted">
          <CeasedBadge :airline="airline" />
          <span v-if="airline.branding?.tagline" class="truncate">
            “{{ airline.branding.tagline }}”
          </span>
        </p>
      </div>
    </header>

    <!-- Where the stub tears off -->
    <div class="pass-tear" aria-hidden="true" />

    <div class="pass-body">
      <div class="pass-main">
        <div
          class="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white p-3"
          :style="{ backgroundImage: tint }"
        >
          <img
            :src="assetUrl(airline, 'logo')"
            :alt="`${airline.name} logo`"
            class="size-full object-contain"
          />
        </div>

        <dl class="pass-codes">
          <div>
            <dt class="pass-label">IATA</dt>
            <dd class="pass-value">{{ airline.iata ?? '—' }}</dd>
          </div>
          <div>
            <dt class="pass-label">ICAO</dt>
            <dd class="pass-value">{{ airline.icao ?? '—' }}</dd>
          </div>
          <div class="min-w-0">
            <dt class="pass-label">Country</dt>
            <dd class="pass-value flex items-center gap-1.5">
              <CountryFlags :iso="airline.country" />
              <span class="truncate">{{ countryName(airline.country) }}</span>
            </dd>
          </div>
          <div class="min-w-0">
            <dt class="pass-label">Alliance</dt>
            <dd class="pass-value truncate">
              {{ airline.alliance ?? 'None' }}
            </dd>
          </div>
        </dl>
      </div>

      <UButton
        :to="`/airlines/${airline.slug}`"
        size="lg"
        label="View logos and details"
        trailing-icon="hugeicons:arrow-right-02"
        class="btn-signal w-full justify-center"
        :ui="{ label: 'block' }"
      />
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  airline: { type: Object, required: true },
})

// A faint wash of the airline's own color behind its marks
const tint = computed(() => brandTint(props.airline))
</script>

<style scoped>
/* A boarding pass: a notch on each side where the stub tears off, cut out
   of the card so the page shows through */
.pass {
  --notch: 0.7rem;
  --tear: 6.25rem;
  display: flex;
  flex-direction: column;
  border-radius: 0.75rem;
  background: var(--surface);
  mask:
    radial-gradient(
        circle var(--notch) at 0 var(--tear),
        transparent 98%,
        #000 100%
      )
      left / 51% 100% no-repeat,
    radial-gradient(
        circle var(--notch) at 100% var(--tear),
        transparent 98%,
        #000 100%
      )
      right / 51% 100% no-repeat;
}

.pass-head {
  display: flex;
  height: var(--tear);
  flex-shrink: 0;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
}

.pass-tear {
  margin: 0 calc(var(--notch) + 0.5rem);
  border-top: 2px dashed var(--ui-border-accented);
}

.pass-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem 1.5rem;
}

/* The logo, square like its canvas, beside the codes */
.pass-main {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  align-items: center;
  gap: 1.25rem;
}

.pass-codes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.875rem 1.25rem;
}

.pass-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
}

.pass-value {
  margin-top: 0.125rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

/* On a phone the country and alliance take a row each, so their names fit */
.pass-codes > :nth-child(n + 3) {
  grid-column: 1 / -1;
}

@container (width >= 26rem) {
  .pass-main {
    grid-template-columns: 9rem minmax(0, 1fr);
  }

  .pass-codes > :nth-child(n + 3) {
    grid-column: auto;
  }
}
</style>
