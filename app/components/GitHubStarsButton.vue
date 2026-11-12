<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener"
    class="stars-button inline-flex h-8 items-center gap-2 rounded-md border border-default px-2.5 text-sm font-semibold text-highlighted transition-colors hover:bg-elevated"
    :aria-label="label"
    :aria-busy="loading"
  >
    <UIcon name="simple-icons:github" class="size-4 shrink-0" />

    <template v-if="stars !== null">
      <span class="digits cap-center tabular-nums" aria-hidden="true">
        <template v-for="(char, i) in chars" :key="i">
          <span v-if="/\d/.test(char)" class="digit">
            <span
              class="digit-strip"
              :style="{ transform: `translateY(-${Number(char) * 10}%)` }"
            >
              <span v-for="n in 10" :key="n">{{ n - 1 }}</span>
            </span>
          </span>
          <span v-else>{{ char }}</span>
        </template>
      </span>

      <span class="star" :class="{ done: progress === 1 }" aria-hidden="true">
        <UIcon
          name="solar:star-linear"
          class="size-4 text-muted transition-opacity"
          :class="{ 'opacity-0': progress === 1 }"
        />
        <span
          class="star-fill"
          :style="{ clipPath: `inset(${(1 - progress) * 100}% 0 0 0)` }"
        >
          <UIcon name="solar:star-bold" class="size-4" />
        </span>
        <span v-if="progress === 1" class="particles">
          <span
            v-for="n in 6"
            :key="n"
            class="particle"
            :style="{ '--angle': `${n * 60 - 30}deg` }"
          />
        </span>
      </span>
    </template>
  </a>
</template>

<script setup>
const props = defineProps({
  username: { type: String, required: true },
  repo: { type: String, required: true },
  // Milliseconds the count-up takes
  duration: { type: Number, default: 1200 },
})

const url = computed(() => `https://github.com/${props.username}/${props.repo}`)

const stars = ref(null)
const current = ref(0)
const loading = ref(true)

const progress = computed(() =>
  stars.value ? Math.min(current.value / stars.value, 1) : 0,
)

const label = computed(() =>
  stars.value === null
    ? 'Soaring Symbols on GitHub'
    : `Soaring Symbols on GitHub, ${stars.value} stars`,
)

function format(n) {
  if (n < 1000) return String(n)
  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
}

// Pad with zeros to the final width so the button keeps its size while
// counting, the way an odometer starts at 000
const chars = computed(() => {
  const target = format(stars.value ?? 0)
  const text = format(current.value)
  return text.padStart(target.length, '0').split('')
})

let frame = 0

function countUp(target) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    current.value = target
    return
  }
  const start = performance.now()
  const step = (now) => {
    const t = Math.min((now - start) / props.duration, 1)
    // Ease out, so the last digits settle slowly
    current.value = Math.round(target * (1 - (1 - t) ** 3))
    if (t < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

// The pages are prerendered, so the count is fetched in the browser to stay
// current; a session cache spares GitHub's 60-requests-an-hour limit
onMounted(async () => {
  const key = `github-stars:${props.username}/${props.repo}`
  try {
    let count = Number(sessionStorage.getItem(key)) || null
    if (count === null) {
      const data = await $fetch(
        `https://api.github.com/repos/${props.username}/${props.repo}`,
      )
      count = data.stargazers_count
      try {
        sessionStorage.setItem(key, String(count))
      } catch {}
    }
    stars.value = count
    countUp(count)
  } catch {
    // Without a count the button stays a plain GitHub link
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<style scoped>
.digits {
  display: inline-flex;
  line-height: 1;
}

.digit {
  display: inline-block;
  height: 1em;
  overflow: hidden;
}

.digit-strip {
  display: flex;
  flex-direction: column;
  transition: transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.digit-strip > span {
  height: 1em;
  text-align: center;
}

.star {
  position: relative;
  display: inline-flex;
}

.star-fill {
  position: absolute;
  inset: 0;
  display: inline-flex;
  color: var(--color-signal-500);
}

.star.done {
  animation: pop 0.35s ease-out;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  margin: -2px;
  border-radius: 9999px;
  background: var(--color-signal-500);
  opacity: 0;
  animation: burst 0.6s ease-out;
}

@keyframes pop {
  50% {
    transform: scale(1.3);
  }
}

@keyframes burst {
  0% {
    opacity: 1;
    transform: rotate(var(--angle)) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateY(-14px) scale(0.4);
  }
}

.stars-button:active {
  transform: scale(0.97);
}

.stars-button {
  transition-property: color, background-color, transform;
}

@media (prefers-reduced-motion: reduce) {
  .digit-strip,
  .star.done,
  .particle {
    animation: none;
    transition: none;
  }

  .particle {
    display: none;
  }
}
</style>
