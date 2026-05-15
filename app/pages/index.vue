<template>
  <UDashboardPanel>
    <UPageSection
      headline="Airline Branding Archive"
      title="Soaring Symbols"
      :description="`A curated collection of airline branding — logos, icons, and tail designs from ${stats.total} airlines across the globe, all in SVG format.`"
      :links="[
        {
          label: 'Browse Airlines',
          to: '/browse',
          icon: 'hugeicons:airplane-01',
          trailingIcon: 'hugeicons:arrow-right-01',
          color: 'primary',
        },
      ]"
    />

    <UPageSection>
      <div class="flex flex-row gap-12 mx-auto">
        <UUser
          v-for="stat in statItems"
          :key="stat.label"
          :name="stat.value"
          :description="stat.label"
          :avatar="{
            icon: stat.icon,
            ui: {
              icon: 'text-primary',
            },
          }"
          size="xl"
          class="flex items-center gap-3"
        />
      </div>
    </UPageSection>

    <Transition name="fade" mode="out-in">
      <AirlineFeature
        :key="featured.slug"
        :airline="featured"
        headline="Featured Airline"
      />
    </Transition>
  </UDashboardPanel>
</template>

<script setup>
const { featured, stats } = useRandomAirline()

const statItems = [
  { icon: 'hugeicons:airplane-01', value: stats.total, label: 'Airlines' },
  { icon: 'hugeicons:global', value: stats.countries, label: 'Countries' },
  { icon: 'hugeicons:star', value: stats.alliances, label: 'Alliances' },
  {
    icon: 'hugeicons:paint-brush-01',
    value: stats.assets,
    label: 'Brand Assets',
  },
]
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
