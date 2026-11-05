<template>
  <UApp>
    <NuxtLayout>
      <UError
        :error="error"
        redirect="/browse"
        :clear="{
          label: 'Browse all airlines',
          size: 'lg',
          class: 'btn-signal',
          ui: { label: 'block' },
        }"
      />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
// Rendered in place of app.vue for unknown pages and airlines, inside the
// site's own layout. Without it Nuxt's built-in page renders only in the
// browser, so the server sends an empty shell and hydration fails.
const props = defineProps({
  error: { type: Object, required: true },
})

const { name } = useRuntimeConfig().public.site

useSeoMeta({
  title: () =>
    `${props.error.statusMessage || 'Something went wrong'} - ${name}`,
  robots: 'noindex',
})
</script>
