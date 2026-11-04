<template>
  <div
    class="board"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focusin="hovering = true"
    @focusout="hovering = false"
  >
    <div class="board-body">
      <div class="board-head" aria-hidden="true">
        <span class="col-iata">IATA</span>
        <span class="col-name">Airline</span>
        <span class="col-icao">ICAO</span>
        <span class="col-country">Country</span>
      </div>

      <ul class="board-rows">
        <li v-for="(airline, i) in rows" :key="i">
          <button
            type="button"
            class="board-row"
            :aria-pressed="airline.slug === selected"
            :aria-label="`${airline.name}, ${countryName(airline.country)}`"
            @click="pick(airline)"
          >
            <FlapText class="col-iata" :text="airline.iata ?? ''" :length="2" />
            <FlapText class="col-name" :text="airline.name" :length="18" />
            <FlapText class="col-icao" :text="airline.icao ?? ''" :length="3" />
            <FlapText
              class="col-country"
              :text="airline.country.split(',')[0]"
              :length="2"
            />
          </button>
        </li>
      </ul>

      <div class="board-foot">
        <span>Pick a row to see its logo, icon and colors.</span>
        <button
          v-if="canRotate"
          type="button"
          class="board-toggle"
          @click="paused = !paused"
        >
          <UIcon
            :name="paused ? 'hugeicons:play' : 'hugeicons:pause'"
            class="size-3.5"
          />
          {{ paused ? 'Resume board' : 'Pause board' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  airlines: { type: Array, required: true },
})

// Slug of the airline shown next to the board
const selected = defineModel('selected', { type: String })

// A fixed first board so the server and client render the same rows
const OPENING = [
  'vietnam-airlines',
  'lufthansa',
  'qantas',
  'air-canada',
  'singapore-airlines',
  'aeromexico',
]

const rows = ref(
  OPENING.map((slug) => props.airlines.find((a) => a.slug === slug)).filter(
    Boolean,
  ),
)
selected.value ??= rows.value[0]?.slug

const hovering = ref(false)
const paused = ref(false)
const canRotate = ref(false)
// Once someone picks a row, the board stops choosing for them
const pinned = ref(false)

function pick(airline) {
  selected.value = airline.slug
  pinned.value = true
}

// Swap one row for an airline not on the board; it becomes the one shown,
// unless a row has been picked
function rotate() {
  if (hovering.value || paused.value) return
  const onBoard = new Set(rows.value.map((a) => a.slug))
  const pool = props.airlines.filter((a) => !onBoard.has(a.slug))
  const next = pool[Math.floor(Math.random() * pool.length)]
  const slots = rows.value
    .map((a, i) => i)
    .filter((i) => rows.value[i].slug !== selected.value || !pinned.value)
  const slot = slots[Math.floor(Math.random() * slots.length)]
  rows.value[slot] = next
  if (!pinned.value) selected.value = next.slug
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  canRotate.value = true
  const timer = setInterval(rotate, 4500)
  onBeforeUnmount(() => clearInterval(timer))
})
</script>

<style scoped>
.board {
  container-type: inline-size;
  border-radius: 0.75rem;
  background: var(--color-board);
  padding: 0.75rem 1rem 0.875rem;
  color: var(--color-flap-ink);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.06),
    0 24px 48px -24px rgb(15 23 42 / 0.45);
}

:global(.dark) .board {
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.08),
    0 24px 48px -24px rgb(0 0 0 / 0.6);
}

/* 25 flaps, 21 flap gaps, 3 column gaps and the row padding across the width */
.board-body {
  --flap-gap: 2px;
  --flap: clamp(
    0.8rem,
    calc((100cqi - 0.75rem - 2.25rem - 21 * var(--flap-gap)) / 25),
    1.6rem
  );
}

.board-head,
.board-row {
  display: grid;
  grid-template-columns: auto auto auto auto;
  justify-content: start;
  column-gap: 0.75rem;
}

.board-head {
  padding: 0 0.375rem 0.5rem;
  font-size: 0.75rem;
  color: rgb(236 235 228 / 0.55);
}

.board-head .col-name {
  width: calc(18 * var(--flap) + 17 * var(--flap-gap));
}

.board-head .col-iata {
  width: calc(2 * var(--flap) + var(--flap-gap));
}

.board-head .col-icao {
  width: calc(3 * var(--flap) + 2 * var(--flap-gap));
}

.board-rows {
  display: grid;
  gap: 0.25rem;
}

.board-row {
  position: relative;
  width: 100%;
  padding: 0.25rem 0.375rem;
  border-radius: 0.375rem;
  cursor: pointer;
  text-align: left;
}

.board-row:hover {
  background: rgb(255 255 255 / 0.05);
}

.board-row:focus-visible {
  outline: 2px solid var(--color-signal-500);
  outline-offset: 1px;
}

/* The row being shown gets the wayfinding yellow, like a gate now boarding */
.board-row[aria-pressed='true'] {
  background: rgb(255 194 14 / 0.12);
  box-shadow: inset 3px 0 0 var(--color-signal-500);
}

.board-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.75rem 0.375rem 0;
  font-size: 0.8125rem;
  color: rgb(236 235 228 / 0.6);
}

.board-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: var(--color-flap-ink);
  cursor: pointer;
}

.board-toggle:hover {
  background: rgb(255 255 255 / 0.08);
}

.board-toggle:focus-visible {
  outline: 2px solid var(--color-signal-500);
}

/* Narrow boards drop the ICAO and country columns and shorten the name */
@container (width < 34rem) {
  .board-body {
    --flap: calc((100cqi - 1.5rem - 14 * var(--flap-gap)) / 16);
  }

  .board-head .col-icao,
  .board-head .col-country,
  .board-row .col-icao,
  .board-row .col-country {
    display: none;
  }

  .board-head .col-name {
    width: auto;
  }

  .board-row .col-name :deep(.flap:nth-child(n + 15)) {
    display: none;
  }
}
</style>
