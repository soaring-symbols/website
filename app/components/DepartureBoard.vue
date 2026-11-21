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
        <span class="col-sep" />
        <span class="col-name">Airline</span>
        <span class="col-sep" />
        <span class="col-country">Country</span>
        <span class="col-sep" />
        <span class="col-status">Status</span>
      </div>

      <ul class="board-rows">
        <li v-for="(airline, i) in rows" :key="i">
          <button
            type="button"
            class="board-row"
            :aria-pressed="airline.slug === selected"
            :class="{ cancelled: airline.defunct }"
            :aria-label="`${airline.name}, ${countryName(airline.country)}, ${statuses[i]}`"
            @click="pick(airline)"
          >
            <!-- A blank flap between columns, as on a real board, so the
                 row is one unbroken strip -->
            <FlapText class="col-iata" :text="airline.iata ?? ''" :length="2" />
            <FlapText class="col-sep" text="" :length="1" aria-hidden="true" />
            <FlapText class="col-name" :text="airline.name" :length="22" />
            <FlapText class="col-sep" text="" :length="1" aria-hidden="true" />
            <FlapText class="col-country" :text="airline.country" :length="2" />
            <FlapText class="col-sep" text="" :length="1" aria-hidden="true" />
            <FlapText class="col-status" :text="statuses[i]" :length="8" />
          </button>
        </li>
      </ul>

      <div class="board-foot">
        <span class="cap-center">Pick a row to see its marks.</span>
        <!-- The board is dark in either theme, so the button keeps its
             lettering and a light hover rather than the page's -->
        <UButton
          v-if="canRotate"
          :icon="paused ? 'solar:play-linear' : 'solar:pause-linear'"
          :label="paused ? 'Resume' : 'Pause'"
          :aria-label="paused ? 'Resume the board' : 'Pause the board'"
          variant="ghost"
          size="sm"
          class="text-flap-ink hover:bg-white/8 hover:text-flap-ink focus-visible:outline-signal-500 active:bg-white/8"
          :ui="{ label: 'block' }"
          @click="paused = !paused"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  airlines: { type: Array, required: true },
})

// An airline that no longer flies stays on the board, cancelled, as its
// marks are still in the collection. One still flying is on time or, now
// and then, boarding, drawn when it comes onto the board and kept there
function statusOf(airline) {
  if (airline.defunct) return 'Canceled'
  return Math.random() < 0.3 ? 'Boarding' : 'On time'
}

// Slug of the airline shown next to the board
const selected = defineModel('selected', { type: String })

// A fixed first board so the server and client render the same rows. The
// page starts with the first one selected: setting it from here would land
// before the page renders on the server but after it hydrates in the
// browser, and the two would disagree
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

// Fixed for the opening rows too, so the server and client agree
const statuses = ref(
  rows.value.map((a, i) =>
    a.defunct ? 'Canceled' : i % 3 === 1 ? 'Boarding' : 'On time',
  ),
)

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
  statuses.value[slot] = statusOf(next)
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

/* 37 flaps (3 of them blank between the columns), 36 flap gaps and the
   row padding across the width */
.board-body {
  --flap-gap: 2px;
  --flap: clamp(
    0.8rem,
    calc((100cqi - 0.75rem - 36 * var(--flap-gap)) / 37),
    2.25rem
  );
}

.board-head,
.board-row {
  display: grid;
  grid-template-columns: repeat(7, auto);
  justify-content: start;
  column-gap: var(--flap-gap);
}

.board-head {
  padding: 0 0.375rem 0.5rem;
  font-size: 0.75rem;
  color: var(--color-signal-500);
}

.board-head .col-sep {
  width: var(--flap);
}

.board-head .col-name {
  width: calc(22 * var(--flap) + 21 * var(--flap-gap));
}

.board-head .col-iata {
  width: calc(2 * var(--flap) + var(--flap-gap));
}

.board-head .col-country {
  width: calc(2 * var(--flap) + var(--flap-gap));
}

/* Statuses in the colors departure boards use: green for a flight going
   ahead, red for one that is not */
.board-row .col-status {
  --color-flap-ink: var(--ui-success);
}

.board-row.cancelled .col-status {
  --color-flap-ink: var(--ui-error);
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

/* Narrow boards drop the country and status columns and shorten the
   name, which turns red for a cancelled airline instead */
@container (width < 34rem) {
  .board-body {
    --flap: calc((100cqi - 0.75rem - 16 * var(--flap-gap)) / 17);
  }

  /* Three tracks, so the hidden columns leave no empty gaps behind */
  .board-head,
  .board-row {
    grid-template-columns: repeat(3, auto);
  }

  .board-head .col-country,
  .board-row .col-country,
  .board-head .col-status,
  .board-row .col-status,
  .board-head .col-name ~ .col-sep,
  .board-row .col-name ~ .col-sep {
    display: none;
  }

  .board-head .col-name {
    width: auto;
  }

  .board-row .col-name :deep(.flap:nth-child(n + 15)) {
    display: none;
  }

  .board-row.cancelled .col-name {
    --color-flap-ink: var(--ui-error);
  }
}
</style>
