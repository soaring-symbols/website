<template>
  <!-- Every entry of the page on one small board, each a link down to its
       row: the groups stacked and split by a rule, their entries in a grid
       of names, so a long list of apps only adds rows of four (two on
       tablets, one on phones) -->
  <nav
    aria-label="On this page"
    class="divide-y divide-white/10 rounded-xl bg-board p-2 text-flap-ink"
  >
    <section
      v-for="group in groups"
      :key="group.id"
      :aria-label="group.title"
      class="py-2 first:pt-0 last:pb-0"
    >
      <p class="px-3 pt-2 pb-1 text-sm font-semibold text-flap-ink/55">
        {{ group.title }}
      </p>
      <ul class="grid sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="entry in group.entries" :key="entry.id" class="min-w-0">
          <NuxtLink
            :to="`#${entry.id}`"
            class="flex h-full items-start gap-2.5 rounded-md px-3 py-2 leading-6 hover:bg-flap focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal-500"
          >
            <!-- Level with the first line, as a long name wraps rather than
                 being cut off -->
            <UIcon
              :name="entry.icon"
              class="mt-1 size-4 shrink-0 text-signal-500"
            />
            <span class="cap-center font-semibold">
              {{ entry.name }}
              <span
                v-if="entry.status"
                class="ms-1.5 text-xs font-normal text-flap-ink/55"
              >
                {{ entry.status }}
              </span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </nav>
</template>

<script setup>
defineProps({
  // [{ id, title, entries: [entry of ~/data/ecosystem] }]
  groups: { type: Array, required: true },
})
</script>
