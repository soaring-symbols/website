<template>
  <!-- Decoration only: a dotted globe that turns slowly, with planes flying
       between its airports. Hidden from screen readers; anyone who asks for
       less motion gets the globe standing still, without planes. The page
       gives it its size -->
  <div ref="sky" class="hero-globe" aria-hidden="true">
    <canvas ref="canvas" />
  </div>
</template>

<script setup>
import { AIRPORTS } from '~/data/airports'
import { LAND_DOTS, LAND_STEP } from '~/data/land-dots'

// Seen from above, nose along +x, about 36 units long
const PLANE_PATH =
  'M16 0c0-1.4-1.5-2.2-4-2.2H4L-4-17h-4l4 14.8h-10l-4-5.8h-2.5l2 6-1 1v2l1 1-2 6h2.5l4-5.8h10L-8 17h4L4 2.2h8c2.5 0 4-.8 4-2.2zM-2.5-9.6h5v2.4h-5zM-2.5 7.2h5v2.4h-5z'
const RAD = Math.PI / 180
// Where the globe starts (over Vietnam), how far it is tilted towards us,
// and how fast it turns, in degrees and degrees a second
const START_LON = 108
const TILT = 18
const SPIN = 2.4
// How many flights at once, and seconds between take-offs
const MAX_FLIGHTS = 3
const GAP = [0.8, 2.2]
// Shortest and longest route, in degrees of arc
const ROUTE = [16, 70]
// Seconds a finished route takes to fade
const LANDED = 1.4
// Shades the dots are drawn in, from the limb to the middle
const SHADES = 6

const sky = ref()
const canvas = ref()
const colorMode = useColorMode()

let ctx
let plane
let dots
let airports
let width = 0
let height = 0
let globe = { x: 0, y: 0, r: 0 }
let view = { lon: START_LON, c: [], e: [], n: [] }
let frame = 0
let last = 0
let visible = true
let still = false
let wait = 0.4
let colors = null
let colorsAge = Infinity
const flights = []
let resizeObserver
let intersectionObserver

const rand = (min, max) => min + Math.random() * (max - min)
const clamp = (n, min, max) => Math.min(Math.max(n, min), max)
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

function toVector(lat, lon) {
  const cosLat = Math.cos(lat * RAD)

  return [
    cosLat * Math.cos(lon * RAD),
    cosLat * Math.sin(lon * RAD),
    Math.sin(lat * RAD),
  ]
}

// The land dots as unit vectors, unpacked from one bit per dot of the grid
// that scripts/land-dots.mjs walks
function readDots() {
  const bytes = Uint8Array.from(atob(LAND_DOTS), (ch) => ch.charCodeAt(0))
  const out = []
  let i = 0
  const rows = Math.round(180 / LAND_STEP)
  for (let r = 0; r < rows; r++) {
    const lat = 90 - (r + 0.5) * LAND_STEP
    const cols = Math.max(
      1,
      Math.round((360 / LAND_STEP) * Math.cos(lat * RAD)),
    )
    for (let c = 0; c < cols; c++, i++) {
      if (bytes[i >> 3] & (128 >> (i & 7))) {
        out.push(...toVector(lat, -180 + ((c + 0.5) * 360) / cols))
      }
    }
  }

  return Float32Array.from(out)
}

// The axes of the screen for a globe turned to `lon`: c points at us,
// e to the right, n up
function turn(lon) {
  const lat = TILT * RAD
  const l = lon * RAD
  view = {
    lon,
    c: [
      Math.cos(lat) * Math.cos(l),
      Math.cos(lat) * Math.sin(l),
      Math.sin(lat),
    ],
    e: [-Math.sin(l), Math.cos(l), 0],
    n: [
      -Math.sin(lat) * Math.cos(l),
      -Math.sin(lat) * Math.sin(l),
      Math.cos(lat),
    ],
  }
}

// Where a point lands on screen, and whether the globe hides it
function project(v) {
  const x = dot3(v, view.e)
  const y = dot3(v, view.n)
  const z = dot3(v, view.c)

  return {
    x: globe.x + x * globe.r,
    y: globe.y - y * globe.r,
    z,
    shown: z > 0 || x * x + y * y > 1,
  }
}

// How squarely a point faces us once the globe has turned to `lon`
function facing(v, lon) {
  const lat = TILT * RAD

  return (
    Math.cos(lat) * (v[0] * Math.cos(lon * RAD) + v[1] * Math.sin(lon * RAD)) +
    Math.sin(lat) * v[2]
  )
}

function slerp(a, b, angle, u) {
  const s = Math.sin(angle)
  const ka = Math.sin((1 - u) * angle) / s
  const kb = Math.sin(u * angle) / s

  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb]
}

// Where a flight is at `u` of the way: on the great circle between its
// airports, lifted most halfway along
function along(f, u) {
  const p = slerp(f.from.v, f.to.v, f.angle, u)
  const lift = 1 + f.height * Math.sin(Math.PI * u)

  return [p[0] * lift, p[1] * lift, p[2] * lift]
}

// A new flight between two airports that face us for all of it
function takeOff() {
  const busy = new Set(flights.flatMap((f) => [f.from.code, f.to.code]))
  for (let tries = 0; tries < 60; tries++) {
    const from = airports[Math.floor(Math.random() * airports.length)]
    const to = airports[Math.floor(Math.random() * airports.length)]
    if (from === to || busy.has(from.code) || busy.has(to.code)) continue
    const angle = Math.acos(clamp(dot3(from.v, to.v), -1, 1))
    if (angle < ROUTE[0] * RAD || angle > ROUTE[1] * RAD) continue
    const duration = 2.6 + angle * 5
    const end = view.lon - SPIN * (duration + LANDED)
    const seen = (v) => facing(v, view.lon) > 0.3 && facing(v, end) > 0.3
    if (!seen(from.v) || !seen(to.v)) continue

    flights.push({
      from,
      to,
      angle,
      duration,
      height: 0.03 + angle * 0.09,
      t: 0,
      landed: 0,
    })

    return
  }
}

function readColors() {
  const style = getComputedStyle(canvas.value)
  const dark = document.documentElement.classList.contains('dark')
  const read = (name) => style.getPropertyValue(name).trim()
  colors = {
    land: read('--globe-land'),
    sea: read('--globe-sea'),
    rim: read('--globe-rim'),
    airport: read('--globe-airport'),
    route: read('--globe-route'),
    plane: read('--globe-plane'),
    halo: read('--globe-halo'),
    label: read('--globe-label'),
    shadow: dark ? 'rgb(0 0 0 / 0.5)' : 'rgb(15 23 42 / 0.18)',
    landAlpha: dark ? 0.55 : 0.5,
    dark,
    font: `600 11px ${getComputedStyle(document.documentElement).getPropertyValue('--font-mono') || 'ui-monospace, monospace'}`,
  }
  colorsAge = 0
}

function drawGlobe() {
  const { x, y, r } = globe

  if (colors.dark) {
    // The sea, with a faint rim of atmosphere around it
    const glow = ctx.createRadialGradient(x, y, r * 0.92, x, y, r * 1.12)
    glow.addColorStop(0, colors.rim)
    glow.addColorStop(1, 'transparent')
    ctx.globalAlpha = 0.5
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, r * 1.12, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.fillStyle = colors.sea
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // On a light page the sea lifts off it like a card: a soft shadow
    // below and a hairline edge, no grey haze around it
    ctx.save()
    ctx.shadowColor = 'rgb(15 23 42 / 0.08)'
    ctx.shadowBlur = r * 0.3
    ctx.shadowOffsetY = r * 0.08
    ctx.fillStyle = colors.sea
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    ctx.strokeStyle = colors.rim
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // The land, one path per shade so the whole globe takes a few fills
  const size = clamp(r * LAND_STEP * RAD * 0.42, 1.2, 3)
  const half = size / 2
  const shades = Array.from({ length: SHADES }, () => new Path2D())
  const { c, e, n } = view
  for (let i = 0; i < dots.length; i += 3) {
    const z = dots[i] * c[0] + dots[i + 1] * c[1] + dots[i + 2] * c[2]
    if (z <= 0) continue
    const sx =
      x + (dots[i] * e[0] + dots[i + 1] * e[1] + dots[i + 2] * e[2]) * r
    const sy =
      y - (dots[i] * n[0] + dots[i + 1] * n[1] + dots[i + 2] * n[2]) * r
    shades[Math.min(SHADES - 1, Math.floor(z * SHADES))].rect(
      sx - half,
      sy - half,
      size,
      size,
    )
  }
  ctx.fillStyle = colors.land
  shades.forEach((shade, i) => {
    ctx.globalAlpha = colors.landAlpha * (0.2 + (0.8 * (i + 1)) / SHADES)
    ctx.fill(shade)
  })
  ctx.globalAlpha = 1
}

function drawAirports() {
  const active = new Set(flights.flatMap((f) => [f.from.code, f.to.code]))
  ctx.fillStyle = colors.airport
  for (const a of airports) {
    if (active.has(a.code)) continue
    const p = project(a.v)
    if (p.z <= 0.05) continue
    ctx.globalAlpha = 0.35 + 0.5 * p.z
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

// The route flown so far, brighter towards the plane, and the rest of it
// faint and dashed
function drawRoute(f, u, fade) {
  const STEPS = 48
  const points = []
  for (let i = 0; i <= STEPS; i++) points.push(project(along(f, i / STEPS)))
  ctx.strokeStyle = colors.route
  ctx.lineCap = 'round'
  ctx.lineWidth = 1.6
  const reached = u * STEPS
  for (let i = 0; i < STEPS; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (!a.shown || !b.shown) continue
    const flown = i < reached
    if (flown) {
      ctx.setLineDash([])
      ctx.globalAlpha = fade * (0.25 + 0.7 * (i / Math.max(reached, 1)))
    } else {
      ctx.setLineDash([2, 4])
      ctx.globalAlpha = fade * 0.3
    }
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  ctx.setLineDash([])
  ctx.globalAlpha = 1
}

function drawEndpoint(airport, fade, pulse) {
  const p = project(airport.v)
  if (p.z <= 0) return
  ctx.globalAlpha = fade
  ctx.fillStyle = colors.route
  ctx.beginPath()
  ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
  ctx.fill()
  // A ring that spreads out once the plane is in
  if (pulse > 0) {
    ctx.strokeStyle = colors.route
    ctx.lineWidth = 1.5
    ctx.globalAlpha = fade * (1 - pulse)
    ctx.beginPath()
    ctx.arc(p.x, p.y, 3 + pulse * 14, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = fade
  ctx.font = colors.font
  ctx.textAlign = 'center'
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.strokeStyle = colors.sea
  ctx.strokeText(airport.code, p.x, p.y - 9)
  ctx.fillStyle = colors.label
  ctx.fillText(airport.code, p.x, p.y - 9)
  ctx.globalAlpha = 1
}

function drawPlane(f, u) {
  const here = along(f, u)
  const p = project(here)
  if (!p.shown) return
  // Pointing the way the route runs on screen
  const ahead = project(along(f, Math.min(u + 0.01, 1)))
  const behind = project(along(f, Math.max(u - 0.01, 0)))
  const heading = Math.atan2(ahead.y - behind.y, ahead.x - behind.x)
  // Bigger as it climbs, as if nearer
  const lift = Math.sin(Math.PI * u)
  const scale = 0.42 + 0.22 * lift

  // Its shadow on the ground below
  const ground = project(slerp(f.from.v, f.to.v, f.angle, u))
  if (ground.z > 0) {
    ctx.save()
    ctx.translate(ground.x, ground.y)
    ctx.rotate(heading)
    ctx.scale(scale * 0.9, scale * 0.9)
    ctx.fillStyle = colors.shadow
    ctx.globalAlpha = 0.4 + 0.6 * lift
    ctx.fill(plane)
    ctx.restore()
    ctx.globalAlpha = 1
  }

  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(heading)
  ctx.scale(scale, scale)
  ctx.lineWidth = 2.5 / scale
  ctx.lineJoin = 'round'
  ctx.strokeStyle = colors.halo
  ctx.stroke(plane)
  ctx.fillStyle = colors.plane
  ctx.fill(plane)
  ctx.restore()
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  drawGlobe()
  drawAirports()
  for (const f of flights) {
    // Slow off the ground and onto it, quick in the middle
    const u = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(f.t / f.duration, 1))
    const fade = 1 - f.landed / LANDED
    drawRoute(f, u, fade)
    drawEndpoint(f.from, fade, 0)
    drawEndpoint(f.to, fade, f.landed ? Math.min(f.landed / 0.8, 1) : 0)
    if (!f.landed) drawPlane(f, u)
  }
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
  last = now
  colorsAge += dt
  if (colorsAge > 0.5) readColors()

  turn(view.lon - SPIN * dt)
  for (const f of flights) {
    if (f.t < f.duration) f.t += dt
    else f.landed += dt
  }
  for (let i = flights.length - 1; i >= 0; i--) {
    if (flights[i].landed >= LANDED) flights.splice(i, 1)
  }
  if (flights.length < MAX_FLIGHTS && (wait -= dt) <= 0) {
    takeOff()
    wait = rand(...GAP)
  }

  draw()
  frame = visible ? requestAnimationFrame(tick) : 0
}

function start() {
  if (still) {
    draw()
  } else if (!frame) {
    last = 0
    frame = requestAnimationFrame(tick)
  }
}

// The globe fills its box, with room around it for the planes' climb and
// the airport codes
function resize() {
  const rect = sky.value.getBoundingClientRect()
  width = rect.width
  height = rect.height
  globe = {
    x: width / 2,
    y: height / 2,
    r: Math.max(Math.min(width, height) * 0.42, 60),
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.value.width = Math.round(width * dpr)
  canvas.value.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (still) draw()
}

watch(
  () => colorMode.value,
  () =>
    nextTick(() => {
      if (!ctx) return
      readColors()
      if (still) draw()
    }),
)

onMounted(() => {
  still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ctx = canvas.value.getContext('2d')
  plane = new Path2D(PLANE_PATH)
  dots = readDots()
  airports = AIRPORTS.map(([code, lat, lon]) => ({
    code,
    v: toVector(lat, lon),
  }))
  turn(START_LON)
  readColors()
  resize()
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
.hero-globe {
  position: relative;
  pointer-events: none;
}

/* The canvas reads its colors from these, so they follow the color mode */
canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  --globe-land: var(--ui-text-muted);
  --globe-sea: var(--ui-bg);
  --globe-rim: var(--ui-border);
  --globe-airport: var(--ui-text-dimmed);
  --globe-route: var(--color-signal-600);
  --globe-plane: var(--color-signal-500);
  --globe-halo: var(--color-signal-700);
  --globe-label: var(--ui-text-highlighted);
}

:global(.dark .hero-globe canvas) {
  --globe-sea: var(--ui-bg-muted);
  --globe-rim: var(--ui-border-accented);
  --globe-route: var(--color-signal-500);
  --globe-halo: var(--ui-bg);
}
</style>
