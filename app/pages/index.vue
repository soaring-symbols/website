<template>
  <div>
    <!-- Hero -->
    <UPageSection
      headline="Airline Branding Archive"
      title="Soaring Symbols"
      :description="`A curated collection of airline branding — logos, icons, and tail designs from ${total} airlines across the globe, all in SVG format.`"
      :links="[{ label: 'Browse Airlines', to: '/browse', icon: 'hugeicons:airplane-01', trailingIcon: 'hugeicons:arrow-right-01' }]"
    />

    <!-- Featured Airline -->
    <Transition name="fade" mode="out-in">
      <AirlineFeature :key="featured.slug" :airline="featured" />
    </Transition>
  </div>
</template>

<script setup>
const { featured, total } = useRandomAirline()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
