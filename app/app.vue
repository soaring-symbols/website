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

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

useSeoMeta({
  titleTemplate: (chunk) => {
    return chunk ? `${chunk} - ${name}` : name
  },
  description,
  ogType: 'website',
  ogUrl: homepage,
  ogTitle: name,
  ogDescription: description,
  twitterCard: 'summary_large_image',
  twitterTitle: name,
  twitterDescription: description,
})
</script>
