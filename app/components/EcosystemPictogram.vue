<template>
  <!-- A brand icon on a square of the departure board, as the page features
       show theirs (app.config.ts): its lettering in light mode, signal yellow
       in dark mode -->
  <span
    class="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-board text-flap-ink dark:text-signal-500"
    aria-hidden="true"
  >
    <UIcon :name="icon" class="size-5" />
  </span>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
})
</script>
