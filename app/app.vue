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
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
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
