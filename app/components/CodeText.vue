<template>
  <!-- Text with code in backticks, shown as inline code -->
  <template v-for="(part, i) in parts" :key="i">
    <code
      v-if="part.code"
      class="rounded border border-muted bg-muted px-1.5 py-0.5 font-mono text-[0.875em]"
    >
      {{ part.text }}
    </code>
    <template v-else>{{ part.text }}</template>
  </template>
</template>

<script setup>
const props = defineProps({ text: { type: String, required: true } })

// Every other part between backticks is code
const parts = computed(() =>
  props.text
    .split('`')
    .map((text, i) => ({ text, code: i % 2 === 1 }))
    .filter((part) => part.text),
)
</script>
