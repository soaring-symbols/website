<template>
  <!-- One entry of ~/data/ecosystem, the same in every group: its name and
       main action on one line, and under it the entry in two columns -->
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
        <!-- Made outside the project: who made it, with a link to them -->
        <UBadge
          v-if="entry.author"
          label="Community"
          color="neutral"
          variant="outline"
          size="sm"
        />
        <span
          v-if="entry.author"
          class="cap-center text-sm font-normal text-muted"
        >
          by
          <ULink
            :to="entry.author.to"
            target="_blank"
            class="text-toned underline decoration-accented underline-offset-4 hover:decoration-current"
            >{{ entry.author.name }}</ULink
          >
        </span>
      </h3>
      <!-- The main action, and the source on GitHub beside it for an app
           the main link takes to a store -->
      <div class="flex items-center gap-2">
        <UButton
          v-if="entry.link"
          :to="entry.link.to"
          target="_blank"
          :label="entry.link.label"
          trailing-icon="solar:arrow-right-up-linear"
          variant="outline"
          :ui="{ label: 'block' }"
        />
        <UTooltip
          v-if="entry.source"
          text="Source on GitHub"
          :delay-duration="0"
        >
          <UButton
            :to="entry.source"
            target="_blank"
            icon="simple-icons:github"
            color="neutral"
            variant="outline"
            square
            :aria-label="`${entry.name} source on GitHub`"
          />
        </UTooltip>
      </div>
    </div>

    <!-- Under the name, as a short reference: what it is and the line to
         copy on the left, every path and option on the right. The
         columns keep their widths in every entry, so the left ones line up
         down the page and an entry with nothing on the right is just
         shorter. One column on phones and tablets -->
    <div
      class="mt-4 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12"
    >
      <div class="flex min-w-0 flex-col gap-4">
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
      </div>

      <!-- One width for the terms in every entry, room for the longest
           (icon, tail, logo-stacked), so the explanations line up down the
           page; a longer term wraps -->
      <dl
        v-if="entry.details?.length"
        class="grid content-start gap-x-6 gap-y-2.5 text-sm sm:grid-cols-[13rem_minmax(0,1fr)]"
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

      <!-- Examples are config to paste, too wide for a column: under both,
           so a line rarely wraps -->
      <UsageTabs
        v-if="entry.examples?.length"
        :tabs="entry.examples"
        class="lg:col-span-2"
      />
    </div>
  </li>
</template>

<script setup>
defineProps({
  // An entry of ~/data/ecosystem
  entry: { type: Object, required: true },
})

// The copy button shows a check for a moment, as in the usage tabs
const { copy, copied } = useCopy()
</script>
