<template>
  <span class="flap-text" :aria-label="text">
    <span v-for="(char, i) in chars" :key="i" class="flap" aria-hidden="true">
      <span :key="ticks[i]" class="flap-face">{{ char }}</span>
    </span>
  </span>
</template>

<script setup>
const props = defineProps({
  text: { type: String, required: true },
  // Number of flaps; longer text is cut off, shorter text padded with blanks
  length: { type: Number, required: true },
})

// Split-flap sets only carry plain capitals, digits and a little punctuation
const DRUM = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.&'

function toFlaps(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .padEnd(props.length)
    .slice(0, props.length)
    .split('')
}

const chars = ref(toFlaps(props.text))
const ticks = ref(chars.value.map(() => 0))

let timers = []
let reduceMotion = false

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

onBeforeUnmount(() => timers.forEach(clearTimeout))

// Spin each changed flap through a few letters before it lands, left to right
watch(
  () => props.text,
  (text) => {
    timers.forEach(clearTimeout)
    timers = []
    const target = toFlaps(text)

    if (reduceMotion) {
      chars.value = target
      return
    }

    target.forEach((goal, i) => {
      if (chars.value[i] === goal) return
      const spins = 3 + ((i * 7) % 5)
      for (let step = 0; step <= spins; step++) {
        timers.push(
          setTimeout(
            () => {
              chars.value[i] =
                step === spins
                  ? goal
                  : DRUM[Math.floor(Math.random() * DRUM.length)]
              ticks.value[i]++
            },
            i * 28 + step * 70,
          ),
        )
      }
    })
  },
)
</script>

<style scoped>
.flap-text {
  display: inline-flex;
  gap: var(--flap-gap, 2px);
}

.flap {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: var(--flap, 1.25rem);
  height: calc(var(--flap, 1.25rem) * 1.4);
  border-radius: 2px;
  background: linear-gradient(
    to bottom,
    var(--color-flap) 0 50%,
    color-mix(in srgb, var(--color-flap), black 12%) 50% 100%
  );
  color: var(--color-flap-ink);
  font-size: calc(var(--flap, 1.25rem) * 0.82);
  font-weight: 800;
  line-height: 1;
  overflow: hidden;
}

/* The hinge across the middle of every flap */
.flap::after {
  content: '';
  position: absolute;
  inset: calc(50% - 0.5px) 0 auto;
  height: 1px;
  background: color-mix(in srgb, var(--color-board), black 40%);
}

.flap-face {
  padding-top: 0.12em;
  animation: flip 70ms ease-in;
}

@keyframes flip {
  from {
    transform: scaleY(0.15);
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flap-face {
    animation: none;
  }
}
</style>
