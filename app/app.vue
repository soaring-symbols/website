<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
const config = useRuntimeConfig()

const { name, description, homepage } = config.public.site

const route = useRoute()

// The live address of this page, without its query string, so filtered
// lists and preview deployments point search engines at one URL
const canonical = computed(() => new URL(route.path, homepage).href)

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  link: [
    // Browsers that read SVG take the sharp one; the rest fall back to .ico
    { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'canonical', href: canonical },
  ],
})

useSeoMeta({
  titleTemplate: (chunk) => {
    return chunk ? `${chunk} - ${name}` : name
  },
  description,
  ogType: 'website',
  ogUrl: canonical,
  ogSiteName: name,
  ogTitle: name,
  ogDescription: description,
  twitterCard: 'summary_large_image',
  twitterTitle: name,
  twitterDescription: description,
})
</script>
