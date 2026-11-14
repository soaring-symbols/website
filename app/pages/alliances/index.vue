<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader :title="meta.title" :description="meta.description" />

    <ul class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="item in items" :key="item.alliance.slug">
        <ULink
          :to="`/alliances/${item.alliance.slug}`"
          class="group flex h-full items-center gap-4 rounded-xl bg-surface p-4 transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span
            class="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-white p-3"
            :style="{ backgroundImage: brandTint(item.alliance) }"
          >
            <AllianceMark
              :alliance="item.alliance"
              decorative
              class="size-full"
            />
          </span>
          <span class="flex min-w-0 flex-col gap-1">
            <span class="font-bold text-highlighted">
              {{ item.alliance.name }}
            </span>
            <span class="text-sm text-muted">{{ item.summary }}</span>
            <UBadge
              v-if="item.disbanded"
              :label="item.disbanded"
              color="neutral"
              variant="subtle"
              size="sm"
              class="w-fit"
            />
          </span>
        </ULink>
      </li>
    </ul>
  </div>
</template>

<script setup>
const { airlines } = useAirlines()
const { alliances } = useAlliances()

const meta = {
  title: 'Alliances',
  description:
    'The airline alliances in the collection, with their marks and the airlines in the collection that fly in them, past members included.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

defineOgImage('Site', { title: meta.title, description: meta.description })

// By name, as the catalog lists them, disbanded ones among the rest; a line
// under each name says when it was founded and how many of its airlines the
// collection has, counted as on the alliance's page
const items = alliances.map((alliance) => ({
  alliance,
  disbanded: disbandedLabel(alliance),
  summary: [operatingYears(alliance), collectionCount(alliance, airlines)]
    .filter(Boolean)
    .join(' · '),
}))
</script>
