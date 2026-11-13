<template>
  <div ref="track" class="flight-path" aria-hidden="true">
    <div class="trail" :style="{ height: `${y}px` }" />
    <span
      class="plane"
      :class="{ climbing: heading === 'up' }"
      :style="{ transform: `translate(-50%, calc(${y}px - 50%))` }"
    >
      <!-- Solar has no aircraft, only paper planes -->
      <UIcon name="carbon:plane" class="size-5" />
    </span>
  </div>
</template>

<script setup>
// The indicator for UChangelogVersions (its #indicator slot): a plane that
// waits at a release's dot while it is read and flies down the line to the
// next one as that release reaches the reading line, leaving a trail. It
// faces the way the page scrolls.

// Where the eye reads, as a share of the viewport height from the top
const READING_LINE = 0.35
// How much of the way to the next dot the plane flies over, at most in pixels
const FLIGHT_SHARE = 0.4
const FLIGHT_MAX = 200

const track = ref(null)
const y = ref(0)
const heading = ref('down')

// Ease in and out, so the plane leaves and lands gently
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

// The dots' centers, from the top of the track
function dotCenters(trackTop) {
  const root = track.value?.parentElement?.parentElement
  if (!root) return []

  return [...root.querySelectorAll('[data-slot="dot"]')].map((dot) => {
    const rect = dot.getBoundingClientRect()
    return rect.top + rect.height / 2 - trackTop
  })
}

function update() {
  const el = track.value
  if (!el) return

  const trackTop = el.getBoundingClientRect().top
  const dots = dotCenters(trackTop)
  if (!dots.length) return

  const reading = window.innerHeight * READING_LINE - trackTop
  let next = dots[0]

  if (reading >= dots.at(-1)) {
    next = dots.at(-1)
  } else if (reading > dots[0]) {
    const i = dots.findIndex((dot) => dot > reading) - 1
    const from = dots[i]
    const to = dots[i + 1]
    const flight = Math.min((to - from) * FLIGHT_SHARE, FLIGHT_MAX)
    const t = Math.min(Math.max((reading - (to - flight)) / flight, 0), 1)
    next = from + (to - from) * ease(t)
  }

  if (next !== y.value) heading.value = next > y.value ? 'down' : 'up'
  y.value = next
}

let frame = 0
let observer
function schedule() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(update)
}

onMounted(() => {
  update()
  // The dots move when fonts load or the releases are read again
  observer = new ResizeObserver(schedule)
  observer.observe(track.value.parentElement.parentElement)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
})
</script>

<style scoped>
.flight-path {
  position: absolute;
  inset: 0;
}

.trail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: var(--ui-primary);
}

.plane {
  position: absolute;
  top: 0;
  left: 50%;
  display: grid;
  place-items: center;
  padding: 0.25rem;
  border-radius: 9999px;
  /* Hides the line where the plane is */
  background: var(--ui-bg);
  color: var(--ui-primary);
  will-change: transform;
}

/* The icon points up: turn it to fly down the timeline */
.plane > :deep(*) {
  rotate: 180deg;
  transition: rotate 300ms ease;
}

.plane.climbing > :deep(*) {
  rotate: 0deg;
}

@media (prefers-reduced-motion: reduce) {
  .plane > :deep(*) {
    transition: none;
  }
}
</style>
