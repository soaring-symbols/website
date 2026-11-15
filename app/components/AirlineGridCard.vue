<template>
  <!-- A boarding pass: the airline's logo on the pass, and past the tear
       line the stub with its code, name and where it flies from -->
  <button
    type="button"
    class="group flex w-full cursor-pointer flex-col rounded-xl bg-surface text-left transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
    @click="$emit('open', airline)"
  >
    <span class="block p-3 pb-0">
      <span
        class="flex aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-lg bg-tile p-6 sm:aspect-[4/3]"
        :style="{ backgroundImage: brandTint(airline) }"
      >
        <img
          :src="assetUrl(airline, 'logo')"
          :alt="`${airline.name} logo`"
          loading="lazy"
          class="size-full object-contain"
        />
      </span>
    </span>

    <!-- The tear line: a dashed perforation and a notch cut into each side
         in the page's own color, as on the alliance cards -->
    <span class="relative h-5 shrink-0" aria-hidden="true">
      <span
        class="absolute inset-x-6 top-1/2 -translate-y-1/2 border-t border-dashed border-accented/70 dark:border-white/20"
      />
      <span class="absolute top-0 -left-2.5 size-5 rounded-full bg-(--ui-bg)" />
      <span
        class="absolute top-0 -right-2.5 size-5 rounded-full bg-(--ui-bg)"
      />
    </span>

    <!-- The stub: its code and name, and where it flies from (and that it
         no longer does) in the chips the airline and alliance pages use -->
    <span class="flex items-center gap-3 px-3 pb-3">
      <FlapText :text="airline.iata ?? ''" :length="2" class="code" />
      <span class="flex min-w-0 flex-col gap-2">
        <h2 class="truncate font-bold text-highlighted">
          {{ airline.name }}
        </h2>
        <span class="flex flex-wrap gap-1.5 text-xs">
          <span :class="chipClass">
            <CountryFlag :iso="airline.country" />
            <span class="cap-center truncate">{{
              countryName(airline.country)
            }}</span>
          </span>
          <span v-if="airline.defunct" :class="chipClass">
            <UIcon
              name="solar:forbidden-circle-bold-duotone"
              class="size-3.5 text-muted"
            />
            <span class="cap-center">{{ ceasedLabel(airline) }}</span>
          </span>
        </span>
      </span>
    </span>
  </button>
</template>

<script setup>
defineProps({
  airline: { type: Object, required: true },
})

defineEmits(['open'])

const chipClass =
  'flex min-w-0 items-center gap-1 rounded-full bg-accented/70 px-2.5 py-0.5 font-semibold text-highlighted dark:bg-white/10'
</script>

<style scoped>
.code {
  --flap: 1.15rem;
  flex-shrink: 0;
}
</style>
