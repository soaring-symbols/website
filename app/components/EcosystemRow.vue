<template>
  <!-- One entry of ~/data/ecosystem, the same in every group: its name and
       main action on one line, its description under it, then whatever it
       has of a snippet, details and examples, all on the name's left edge.
       An entry with none of those is just shorter -->
  <li :id="entry.id" class="scroll-mt-24 py-8 first:pt-0 last:pb-0">
    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <h3
        class="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-semibold text-highlighted"
      >
        <EcosystemPictogram :icon="entry.icon" />
        <span class="cap-center">{{ entry.name }}</span>
        <UBadge
          v-if="entry.status"
          :label="entry.status"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </h3>
      <UButton
        v-if="entry.link"
        :to="entry.link.to"
        target="_blank"
        :label="entry.link.label"
        trailing-icon="solar:arrow-right-up-linear"
        variant="outline"
        class="sm:ms-13 md:ms-0"
        :ui="{ label: 'block' }"
      />
    </div>

    <!-- Everything under the name shares one width, so every block ends on
         the same line: wide enough that a line of config rarely wraps and
         the row doesn't look empty on the right, capped so a description
         stays easy to read on a wide screen -->
    <div class="mt-3 flex max-w-5xl flex-col gap-5 sm:ps-13">
      <p class="text-toned">{{ entry.description }}</p>
      <!-- The snippet, its copy button inside the box at the end of the
           line -->
      <div
        v-if="entry.snippet"
        class="flex w-full items-center rounded-md border border-accented bg-elevated"
      >
        <code
          class="min-w-0 flex-1 overflow-x-auto px-3 py-2 font-mono text-xs whitespace-nowrap text-highlighted"
          >{{ entry.snippet.code }}</code
        >
        <UButton
          :icon="copied ? 'solar:check-linear' : 'solar:copy-linear'"
          :aria-label="copied ? 'Copied' : entry.snippet.label"
          color="neutral"
          variant="ghost"
          size="sm"
          class="me-1 shrink-0"
          @click="copy(entry.snippet.code)"
        />
      </div>
      <!-- One width for the terms in every entry, room for the longest
           (icon, tail, logo-stacked), so the explanations line up down the
           page; a longer term wraps -->
      <dl
        v-if="entry.details?.length"
        class="grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-[13rem_minmax(0,1fr)]"
      >
        <template v-for="detail in entry.details" :key="detail.term">
          <dt class="pt-0.5">
            <code
              class="rounded bg-accented/60 box-decoration-clone px-1.5 py-0.5 font-mono text-xs text-highlighted"
              >{{ detail.term }}</code
            >
          </dt>
          <dd class="mb-1.5 text-toned sm:mb-0">{{ detail.text }}</dd>
        </template>
      </dl>
      <UsageTabs v-if="entry.examples?.length" :tabs="entry.examples" />
    </div>
  </li>
</template>

<script setup>
defineProps({
  // An entry of ~/data/ecosystem
  entry: { type: Object, required: true },
})

// The copy button shows a check for a moment, as in the usage tabs
const copied = ref(false)
const copyText = useCopy()

async function copy(code) {
  if (!(await copyText(code))) return
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>
