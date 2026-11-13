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
// stands in for the dot of the release being read and flies down the line to
// the next one as that release nears the reading line, leaving a trail. It
// faces the way it flies.

// Where the eye reads, as a share of the viewport height from the top
const READING_LINE = 0.35
// The share of the scroll between two dots the flight takes: the rest of the
// way, the plane waits at the release being read
const FLIGHT_SHARE = 0.7
// How quickly the plane catches up with the scroll, in milliseconds: it
// glides rather than jumping when the page moves fast
const GLIDE = 280
// How close to a dot the plane is parked on it, in pixels
const PARKED = 2

const track = ref(null)
const y = ref(0)
const heading = ref('down')

let target = 0
let dots = []

// Ease in and out, so the plane leaves and lands gently
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Where the plane should be for the current scroll
function measure() {
  const el = track.value
  const root = el?.parentElement?.parentElement
  if (!root) return

  const trackTop = el.getBoundingClientRect().top
  dots = [...root.querySelectorAll('[data-slot="dot"]')].map((dot) => {
    const rect = dot.getBoundingClientRect()
    return { el: dot, y: rect.top + rect.height / 2 - trackTop }
  })
  if (!dots.length) return

  const reading = window.innerHeight * READING_LINE - trackTop
  const first = dots[0].y
  const last = dots.at(-1).y

  if (reading <= first) {
    target = first
  } else if (reading >= last) {
    target = last
  } else {
    const i = dots.findIndex((dot) => dot.y > reading) - 1
    const from = dots[i].y
    const to = dots[i + 1].y
    const flight = (to - from) * FLIGHT_SHARE
    const t = Math.min(Math.max((reading - (to - flight)) / flight, 0), 1)
    target = from + (to - from) * ease(t)
  }
}

// The plane takes the place of the dot it is parked on
function park() {
  for (const dot of dots) {
    dot.el.style.transition = 'opacity 150ms'
    dot.el.style.opacity = Math.abs(dot.y - y.value) < PARKED ? '0' : ''
  }
}

let frame = 0
let last = 0
let observer

function step(now) {
  const dt = last ? now - last : 16
  last = now

  const gap = target - y.value
  if (Math.abs(gap) < 0.25 || reducedMotion()) {
    y.value = target
  } else {
    heading.value = gap > 0 ? 'down' : 'up'
    y.value += gap * (1 - Math.exp(-dt / GLIDE))
  }
  park()

  frame = y.value === target ? 0 : requestAnimationFrame(step)
  if (!frame) last = 0
}

function update() {
  measure()
  if (!frame) frame = requestAnimationFrame(step)
}

onMounted(() => {
  measure()
  y.value = target
  park()
  // The dots move when fonts load or the releases are read again
  observer = new ResizeObserver(update)
  observer.observe(track.value.parentElement.parentElement)
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  window.removeEventListener('scroll', update)
  window.removeEventListener('resize', update)
  for (const dot of dots) dot.el.style.opacity = ''
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
