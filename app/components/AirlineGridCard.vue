<template>
  <button
    type="button"
    class="group flex w-full cursor-pointer flex-col gap-3 rounded-xl p-2 text-left hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary"
    @click="$emit('open', airline)"
  >
    <div
      class="flex aspect-[2/1] w-full sm:aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-white p-6"
      :style="{ backgroundImage: brandTint(airline) }"
    >
      <img
        :src="assetUrl(airline, 'logo')"
        :alt="`${airline.name} logo`"
        loading="lazy"
        class="size-full object-contain"
      />
    </div>

    <div class="flex items-start gap-3 px-1 pb-1">
      <FlapText :text="airline.iata ?? ''" :length="2" class="code" />
      <div class="min-w-0">
        <h2 class="truncate font-bold text-highlighted">{{ airline.name }}</h2>
        <p class="flex items-center gap-1.5 text-sm text-muted">
          <CountryFlags :iso="airline.country" />
          <span class="min-w-0 truncate">{{
            [countryName(airline.country), airline.alliance]
              .filter(Boolean)
              .join(', ')
          }}</span>
        </p>
      </div>
    </div>
  </button>
</template>

<script setup>
defineProps({
  airline: { type: Object, required: true },
})

defineEmits(['open'])
</script>

<style scoped>
.code {
  --flap: 1.15rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}
</style>
