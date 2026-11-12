<template>
  <!-- One ticket: the departure board (the slot) and, past a perforation,
       the stub for the airline picked on it, with its marks, its codes and
       the way to its page. The stub keeps one height for every airline, so
       the page below does not jump as the board turns -->
  <article class="ticket">
    <div class="ticket-board">
      <slot />
    </div>

    <div class="pass @container" aria-live="polite">
      <!-- Where the stub tears off -->
      <div class="pass-tear" aria-hidden="true" />

      <header class="pass-head">
        <p class="pass-label">Now showing</p>
        <h2 class="pass-name">{{ airline.name }}</h2>
        <!-- The badge in its dark look, on the board's colors in any mode -->
        <p class="pass-tagline">
          <span class="dark contents"><CeasedBadge :airline="airline" /></span>
          <span v-if="airline.branding?.tagline" class="truncate">
            “{{ airline.branding.tagline }}”
          </span>
        </p>
      </header>

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
          label="View logos and details"
          trailing-icon="solar:arrow-right-linear"
          class="btn-signal w-full justify-center"
          :ui="{ label: 'block' }"
        />
      </div>
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
/* The board and the stub side by side on a wide screen, one above the
   other on a narrow one, in one card with rounded corners and the board's
   colors in either mode */
.ticket {
  --notch: 0.75rem;
  /* How far into the stub the perforation runs */
  --tear: 1rem;
  --ink-muted: rgb(236 235 228 / 0.55);
  display: grid;
  overflow: hidden;
  border-radius: 0.75rem;
  color: var(--color-flap-ink);
  box-shadow: 0 24px 48px -24px rgb(15 23 42 / 0.35);
}

:global(.dark) .ticket {
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.06),
    0 24px 48px -24px rgb(0 0 0 / 0.6);
}

/* The board gives up its own card: the ticket rounds the corners */
.ticket-board :deep(.board) {
  height: 100%;
  border-radius: 0;
  box-shadow: none;
}

/* The stub, with a notch cut at each end of its perforation, so whatever
   lies behind the ticket (the page, the globe) shows through */
.pass {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--color-board);
  mask:
    radial-gradient(
      circle var(--notch) at 0 var(--tear),
      transparent 96%,
      #000 100%
    ),
    radial-gradient(
      circle var(--notch) at 100% var(--tear),
      transparent 96%,
      #000 100%
    );
  mask-composite: intersect;
}

/* The perforation, just inside the edge the stub shares with the board */
.pass-tear {
  position: absolute;
  top: var(--tear);
  right: 0;
  left: 0;
  border-top: 2px dashed rgb(236 235 228 / 0.22);
}

.pass-head {
  min-width: 0;
  padding: calc(var(--tear) + 1.25rem) 1.5rem 0;
}

.pass-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem 1.5rem;
}

/* Tailwind's xl: the stub moves beside the board, the perforation to its
   left edge and the notches to the top and bottom */
@media (min-width: 1280px) {
  .ticket {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  }

  .pass {
    mask:
      radial-gradient(
        circle var(--notch) at var(--tear) 0,
        transparent 96%,
        #000 100%
      ),
      radial-gradient(
        circle var(--notch) at var(--tear) 100%,
        transparent 96%,
        #000 100%
      );
    mask-composite: intersect;
  }

  .pass-tear {
    top: 0;
    right: auto;
    bottom: 0;
    left: var(--tear);
    border-top: 0;
    border-left: 2px dashed rgb(236 235 228 / 0.22);
  }

  .pass-head,
  .pass-body {
    padding-left: calc(var(--tear) + 1.5rem);
  }

  /* "Now showing" on the line of the board's column headings, and the
     button centred on the line of its footer, both padded as the board is */
  .pass-head {
    padding-top: 0.75rem;
  }

  .pass-body {
    padding-bottom: 0.75rem;
  }
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

/* Set like the board's column headings */
.pass-label {
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.pass-name {
  overflow: hidden;
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Kept even without a tagline, so every airline's stub is as tall */
.pass-tagline {
  display: flex;
  min-height: 1.25rem;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--ink-muted);
}

.pass-value {
  margin-top: 0.125rem;
  font-weight: 600;
}

/* The country and alliance take a row each, so long names fit */
.pass-codes > :nth-child(n + 3) {
  grid-column: 1 / -1;
}

@container (width >= 26rem) {
  .pass-main {
    grid-template-columns: 9rem minmax(0, 1fr);
  }
}
</style>
