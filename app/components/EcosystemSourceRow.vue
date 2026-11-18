<template>
  <!-- One way to load the files: what it is and a URL to copy on the left,
       every path and option it takes on the right, as a short reference -->
  <li
    :id="entry.id"
    class="grid scroll-mt-24 gap-6 py-8 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12"
  >
    <div class="flex min-w-0 flex-col items-start gap-3">
      <h3
        class="flex items-center gap-2.5 text-lg font-semibold text-highlighted"
      >
        <UIcon :name="entry.icon" class="size-5 shrink-0 text-primary" />
        <span class="cap-center">{{ entry.name }}</span>
      </h3>
      <p class="text-toned">{{ entry.description }}</p>
      <div class="flex w-full min-w-0 items-center gap-2">
        <code
          class="min-w-0 flex-1 overflow-x-auto rounded-md border border-accented bg-elevated px-3 py-2 font-mono text-xs whitespace-nowrap text-highlighted"
          >{{ entry.snippet.code }}</code
        >
        <UButton
          icon="solar:copy-linear"
          :aria-label="entry.snippet.label"
          color="neutral"
          variant="outline"
          @click="copy"
        />
      </div>
    </div>

    <dl
      v-if="entry.details?.length"
      class="grid content-start gap-x-4 gap-y-2.5 text-sm sm:grid-cols-[auto_minmax(0,1fr)]"
    >
      <template v-for="detail in entry.details" :key="detail.term">
        <dt class="pt-0.5">
          <code
            class="rounded bg-accented/60 px-1.5 py-0.5 font-mono text-xs whitespace-nowrap text-highlighted"
            >{{ detail.term }}</code
          >
        </dt>
        <dd class="mb-1.5 text-toned sm:mb-0">{{ detail.text }}</dd>
      </template>
    </dl>
  </li>
</template>

<script setup>
const props = defineProps({
  // A Files and APIs entry of ~/data/ecosystem, with a snippet to copy
  entry: { type: Object, required: true },
})

const toast = useToast()

async function copy() {
  await navigator.clipboard.writeText(props.entry.snippet.code)
  toast.add({ title: 'Copied', duration: 1500 })
}
</script>
