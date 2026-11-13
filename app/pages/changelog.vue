<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader
      :title="meta.title"
      :description="meta.description"
      :links="[
        {
          label: 'Releases on GitHub',
          icon: 'simple-icons:github',
          to: RELEASES_URL,
          target: '_blank',
          color: 'neutral',
          variant: 'outline',
          ui: { label: 'block cap-center' },
        },
        {
          label: 'RSS feed',
          icon: 'solar:rss-linear',
          to: RELEASES_FEED_URL,
          target: '_blank',
          color: 'neutral',
          variant: 'outline',
          ui: { label: 'block cap-center' },
        },
      ]"
    />

    <UChangelogVersions
      v-if="releases?.length"
      class="py-12 sm:py-16"
      :ui="{ indicator: 'overflow-visible' }"
    >
      <template #indicator>
        <FlightPathIndicator />
      </template>

      <UChangelogVersion
        v-for="(release, index) in releases"
        :id="release.tag"
        :key="release.tag"
        :title="release.tag"
        :date="release.date"
        :badge="
          index === 0
            ? {
                label: 'Latest',
                color: 'primary',
                variant: 'subtle',
                ui: { label: 'cap-center' },
              }
            : undefined
        "
        :ui="{
          container: 'max-w-2xl',
          date: 'cap-center',
          title: 'font-mono',
        }"
      >
        <template #body>
          <!-- GitHub renders and sanitizes the notes -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="release-notes mt-4" v-html="release.html" />
        </template>

        <template #footer>
          <ULink
            :to="release.url"
            target="_blank"
            class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-highlighted"
          >
            <UIcon name="simple-icons:github" class="size-4" />
            <span class="cap-center">{{ release.tag }} on GitHub</span>
          </ULink>
        </template>
      </UChangelogVersion>
    </UChangelogVersions>

    <UEmpty
      v-else
      class="my-16"
      icon="solar:document-text-linear"
      title="The releases couldn't be loaded"
      description="GitHub didn't answer just now. Every release and its notes are on GitHub."
      :actions="[
        {
          label: 'Open the releases',
          icon: 'simple-icons:github',
          to: RELEASES_URL,
          target: '_blank',
        },
      ]"
    />
  </div>
</template>

<script setup>
const meta = {
  title: 'Changelog',
  description:
    'What each release of the soaring-symbols package brought: new airlines and marks, data and fixes. Every release reaches the CDN, the API and the apps; follow the feed to hear about the next one.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

defineOgImage('Site', { title: meta.title, description: meta.description })

const releases = useReleases()
</script>

<style scoped>
/* The notes are GitHub's HTML, so they are styled here rather than with
   utility classes */
.release-notes {
  color: var(--ui-text);
  line-height: 1.7;
}

.release-notes :deep(h2),
.release-notes :deep(h3) {
  margin: 1.5rem 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ui-text-highlighted);
}

.release-notes :deep(> :first-child) {
  margin-top: 0;
}

.release-notes :deep(p) {
  margin: 0.75rem 0;
}

.release-notes :deep(ul) {
  margin: 0.5rem 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.release-notes :deep(li) {
  margin: 0.25rem 0;
  padding-left: 0.25rem;
}

.release-notes :deep(li::marker) {
  color: var(--ui-text-dimmed);
}

.release-notes :deep(a) {
  font-weight: 600;
  color: var(--ui-text-highlighted);
  text-decoration: underline;
  text-decoration-color: var(--ui-primary);
  text-underline-offset: 3px;
}

.release-notes :deep(a:hover) {
  text-decoration-thickness: 2px;
}

.release-notes :deep(code),
.release-notes :deep(tt) {
  font-family: var(--font-mono);
  font-size: 0.875em;
}

.release-notes :deep(code) {
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  border: 1px solid var(--ui-border-muted);
  background: var(--ui-bg-muted);
}

.release-notes :deep(strong) {
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
</style>
