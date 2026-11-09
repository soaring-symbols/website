<template>
  <!-- Decoration only: a plane that flies into the hero, loops, turns back
       and leaves, a different flight each time. Hidden from screen readers
       and from anyone who asks for less motion -->
  <div ref="sky" class="hero-sky" aria-hidden="true">
    <canvas ref="canvas" />
  </div>
</template>

<script setup>
// Seen from above, nose along +x, about 36 units long
const PLANE_PATH =
  'M16 0c0-1.4-1.5-2.2-4-2.2H4L-4-17h-4l4 14.8h-10l-4-5.8h-2.5l2 6-1 1v2l1 1-2 6h2.5l4-5.8h10L-8 17h4L4 2.2h8c2.5 0 4-.8 4-2.2zM-2.5-9.6h5v2.4h-5zM-2.5 7.2h5v2.4h-5z'
const SCALE = 1.2
// Where the engines sit on the plane, so the contrails start there
const ENGINE = { x: -3, y: 8.4 }
// Seconds a contrail lasts, and how far it spreads as it fades (px)
const TRAIL_LIFE = 2
const TRAIL_SPREAD = 7
// How quickly the plane eases into and out of a turn, and into a bank
const TURN_EASE = 2.6
const BANK_EASE = 3.5
// How far past the edge the plane may go before the flight ends (px)
const MARGIN = 90
// The tallest band the plane flies in (px)
const FIELD_HEIGHT = 760
// What a flight does on its way across, in order
const PLANS = [
  ['loop', 'turn'],
  ['turn', 'loop'],
  ['loop', 'turn', 'loop'],
  ['turn', 'loop', 'loop'],
]

const sky = ref()
const canvas = ref()

let ctx
let plane
let width = 0
let height = 0
// The band the plane flies in: the top of the hero, so on a phone, where the
// hero runs far below the fold, it stays on screen
let field = 0
let frame = 0
let last = 0
let clock = 0
let visible = true
let flight = null
let wait = 1
let colors = null
let colorsAge = Infinity
const trail = []
let resizeObserver
let intersectionObserver

const rand = (min, max) => min + Math.random() * (max - min)
const clamp = (n, min, max) => Math.min(Math.max(n, min), max)
const angleTo = (from, to) =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from))
// The share of the gap closed in dt, the same at any frame rate
const ease = (rate, dt) => 1 - Math.exp(-rate * dt)

function loopRadius() {
  return clamp(Math.min(width, field) * 0.11, 38, 85)
}

function cruiseSpeed() {
  return clamp(width * 0.13, 120, 200)
}

// A new flight: in from one side, diagonally, with a few manoeuvres to
// fly on the way
function takeOff() {
  const fromLeft = Math.random() < 0.5
  const y = rand(0.3, 0.85) * field
  const toY = rand(0.15, 0.7) * field
  // Never steeper than 35°, so it stays a crossing, not a climb
  const limit = (35 * Math.PI) / 180
  const climb = clamp(Math.atan2(toY - y, width), -limit, limit)

  flight = {
    x: fromLeft ? -MARGIN / 2 : width + MARGIN / 2,
    y,
    heading: fromLeft ? climb : Math.PI - climb,
    turnRate: 0,
    speed: cruiseSpeed(),
    bank: 0,
    age: 0,
    phase: rand(0, Math.PI * 2),
    plan: [...PLANS[Math.floor(Math.random() * PLANS.length)]],
    manoeuvre: null,
    straight: 0,
    nextLoop: rand(0.25, 0.45) * width,
  }
}

// Turn towards the middle of the hero, so a loop or a turn never runs
// off the top or bottom
function turnSide(f) {
  const side = Math.sign(Math.cos(f.heading)) || 1

  return side * (f.y < field / 2 ? 1 : -1)
}

function startManoeuvre(f) {
  const r = loopRadius()
  const next = f.plan[0]
  const cos = Math.cos(f.heading)
  // Room left before the edge the plane is heading for
  const ahead = cos > 0 ? width - f.x : f.x

  if (next === 'loop') {
    const inside = f.x > width * 0.15 && f.x < width * 0.85
    if (inside && f.straight > f.nextLoop) {
      return { radius: r, total: Math.PI * 2 }
    }
  } else if (next === 'turn' && ahead < r * 1.5 + 30) {
    // Turn back once the far edge is about a turn away
    return { radius: r * 1.5, total: Math.PI }
  }

  return null
}

// The turn rate the plane is steering for
function steer(f, dt) {
  if (!f.manoeuvre && f.plan.length) {
    f.manoeuvre = startManoeuvre(f)
    if (f.manoeuvre) {
      f.manoeuvre.side = turnSide(f)
      f.manoeuvre.turned = 0
    }
  }

  if (f.manoeuvre) {
    const m = f.manoeuvre
    m.turned += Math.abs(f.turnRate) * dt
    // Let go early by what the plane still turns while it levels out
    if (m.turned >= m.total - Math.abs(f.turnRate) / TURN_EASE) {
      f.manoeuvre = null
      f.plan.shift()
      f.straight = 0
      f.nextLoop = rand(0.2, 0.4) * width

      return 0
    }

    return (m.side * f.speed) / m.radius
  }

  // A slow weave, so a straight leg never looks ruled
  let target = 0.14 * Math.sin(f.age * 0.8 + f.phase)
  // Level out near the top and bottom
  const climbing = Math.sin(f.heading)
  if (
    (f.y < field * 0.1 && climbing < 0) ||
    (f.y > field * 0.9 && climbing > 0)
  ) {
    const level = Math.cos(f.heading) >= 0 ? 0 : Math.PI
    target += clamp(angleTo(f.heading, level) * 2, -1.2, 1.2)
  }

  return target
}

// Wings look shorter as the plane banks into a turn
function wingSpan(f) {
  return 1 - 0.4 * Math.abs(f.bank)
}

function fly(dt) {
  const f = flight
  const target = steer(f, dt)
  f.turnRate += (target - f.turnRate) * ease(TURN_EASE, dt)
  f.heading += f.turnRate * dt
  // A little slower through a turn, a little faster out of it
  const goal = cruiseSpeed() * (f.manoeuvre ? 0.85 : 1)
  f.speed += (goal - f.speed) * ease(1.5, dt)
  f.x += Math.cos(f.heading) * f.speed * dt
  f.y += Math.sin(f.heading) * f.speed * dt
  if (!f.manoeuvre) f.straight += f.speed * dt
  f.age += dt

  const bank = clamp((f.turnRate * loopRadius()) / f.speed, -1, 1)
  f.bank += (bank - f.bank) * ease(BANK_EASE, dt)

  // One point behind each engine, and the way it drifts as it spreads
  const cos = Math.cos(f.heading)
  const sin = Math.sin(f.heading)
  const span = ENGINE.y * SCALE * wingSpan(f)
  const bx = f.x + cos * ENGINE.x * SCALE
  const by = f.y + sin * ENGINE.x * SCALE
  trail.push({
    t: clock,
    x1: bx - sin * span,
    y1: by + cos * span,
    x2: bx + sin * span,
    y2: by - cos * span,
    nx: -sin,
    ny: cos,
  })

  const out =
    f.x < -MARGIN ||
    f.x > width + MARGIN ||
    f.y < -MARGIN ||
    f.y > height + MARGIN
  if ((out && f.age > 2) || f.age > 90) {
    flight = null
    wait = rand(2.5, 5)
  }
}

function readColors() {
  const style = getComputedStyle(canvas.value)
  const dark = document.documentElement.classList.contains('dark')
  colors = {
    plane: style.color,
    halo: style.borderTopColor,
    trail: style.outlineColor,
    shadow: dark ? 'rgb(0 0 0 / 0.45)' : 'rgb(15 23 42 / 0.13)',
    trailAlpha: dark ? 0.32 : 0.4,
  }
  colorsAge = 0
}

function drawTrail() {
  while (trail.length && clock - trail[0].t > TRAIL_LIFE) trail.shift()
  if (trail.length < 2) return
  ctx.strokeStyle = colors.trail
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // Drawn in short runs, each a little fainter and wider than the one
  // after it, so the fade needs no stroke per point and shows no beads
  const RUN = 5
  for (const side of [1, -1]) {
    for (let start = 0; start < trail.length - 1; start += RUN) {
      const end = Math.min(start + RUN, trail.length - 1)
      const age = (clock - trail[Math.floor((start + end) / 2)].t) / TRAIL_LIFE
      ctx.globalAlpha = colors.trailAlpha * (1 - age) ** 2
      ctx.lineWidth = 1.2 + age * 3
      ctx.beginPath()
      for (let i = start; i <= end; i++) {
        const p = trail[i]
        const spread = ((clock - p.t) / TRAIL_LIFE) * TRAIL_SPREAD * side
        const x = (side > 0 ? p.x1 : p.x2) + p.nx * spread
        const y = (side > 0 ? p.y1 : p.y2) + p.ny * spread
        if (i === start) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
}

function drawPlane(f) {
  const span = wingSpan(f)
  // Its shadow on the page below, sliding out as the plane banks
  ctx.save()
  ctx.translate(f.x + 14 + f.bank * 4, f.y + 20)
  ctx.rotate(f.heading)
  ctx.scale(SCALE * 0.92, SCALE * 0.92 * span)
  ctx.fillStyle = colors.shadow
  ctx.fill(plane)
  ctx.restore()

  ctx.save()
  ctx.translate(f.x, f.y)
  ctx.rotate(f.heading)
  ctx.scale(SCALE, SCALE * span)
  // An outline keeps the yellow readable on a light page
  ctx.lineWidth = 2.5 / SCALE
  ctx.lineJoin = 'round'
  ctx.strokeStyle = colors.halo
  ctx.stroke(plane)
  ctx.fillStyle = colors.plane
  ctx.fill(plane)
  ctx.restore()
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
  last = now
  clock += dt
  colorsAge += dt
  if (colorsAge > 0.5) readColors()

  if (flight) {
    fly(dt)
  } else if ((wait -= dt) <= 0) {
    takeOff()
  }

  ctx.clearRect(0, 0, width, height)
  drawTrail()
  if (flight) drawPlane(flight)

  frame = visible ? requestAnimationFrame(tick) : 0
}

function start() {
  if (!frame) {
    last = 0
    frame = requestAnimationFrame(tick)
  }
}

function resize() {
  const rect = sky.value.getBoundingClientRect()
  width = rect.width
  height = rect.height
  field = Math.min(height, FIELD_HEIGHT)
  // Sharp on high-density screens, without a huge canvas on phones
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.value.width = Math.round(width * dpr)
  canvas.value.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  ctx = canvas.value.getContext('2d')
  plane = new Path2D(PLANE_PATH)
  resize()
  readColors()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(sky.value)
  // Stop drawing while the hero is scrolled out of view
  intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) start()
  })
  intersectionObserver.observe(sky.value)
  start()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
})
</script>

<style scoped>
.hero-sky {
  position: absolute;
  inset: 0;
  z-index: 10;
  overflow: hidden;
  pointer-events: none;
}

/* The canvas reads its colors from these, so they follow the color mode */
canvas {
  display: block;
  width: 100%;
  height: 100%;
  /* The plane in signal yellow, outlined in a darker shade on a light page
     and in the page color on a dark one */
  color: var(--color-signal-500);
  border-color: var(--color-signal-700);
  outline-color: var(--ui-text-dimmed);
}

:global(.dark .hero-sky canvas) {
  border-color: var(--ui-bg);
}

@media (prefers-reduced-motion: reduce) {
  .hero-sky {
    display: none;
  }
}
</style>
