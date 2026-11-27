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
          ui: { label: 'block' },
        },
        {
          icon: 'solar:rss-linear',
          to: RELEASES_FEED_URL,
          target: '_blank',
          color: 'neutral',
          variant: 'outline',
          square: true,
          'aria-label': 'RSS feed',
          title: 'RSS feed',
        },
      ]"
    />

    <!-- The package's releases, or what changed around it: the two have
         their own schedules, so neither is filed under the other -->
    <UTabs
      v-model="tab"
      :items="tabs"
      :content="false"
      variant="link"
      class="mt-8 w-full"
    />

    <UChangelogVersions
      v-if="tab === 'ecosystem' || releases?.length"
      class="py-12 sm:py-16"
      :ui="{ indicator: 'overflow-visible z-10' }"
    >
      <template #indicator>
        <FlightPathIndicator />
      </template>

      <!-- One version per day: a day with one change names its app in the
           title, a day with more lists them, an app to a line -->
      <template v-if="tab === 'ecosystem'">
        <UChangelogVersion
          v-for="day in days"
          :id="day.date"
          :key="day.date"
          :date="day.date"
          :ui="{ container: 'max-w-2xl' }"
        >
          <template #title>
            <ULink
              v-if="day.only"
              :to="day.only.to"
              class="inline-flex items-center gap-2 text-highlighted hover:text-primary"
            >
              <UIcon :name="day.only.icon" class="size-5 shrink-0" />
              <span class="cap-center">{{ day.only.name }}</span>
            </ULink>
            <template v-else>{{ day.title }}</template>
          </template>

          <template v-if="day.only" #description>
            <CodeText :text="day.only.text" />
          </template>

          <template v-else #body>
            <ul class="mt-4 flex flex-col gap-3">
              <li
                v-for="(change, index) in day.changes"
                :key="index"
                class="flex gap-2.5 text-muted"
              >
                <UIcon
                  :name="change.icon"
                  class="mt-[0.2em] size-4 shrink-0 text-highlighted"
                />
                <p>
                  <ULink
                    :to="change.to"
                    class="font-semibold text-highlighted hover:text-primary"
                    >{{ change.name }}</ULink>:
                  <CodeText :text="change.text" />
                </p>
              </li>
            </ul>
          </template>
        </UChangelogVersion>
      </template>

      <template v-else>
        <UChangelogVersion
          v-for="(release, index) in releases"
          :id="release.tag"
          :key="release.tag"
          :title="release.tag"
          :date="release.date"
          :description="release.summary || undefined"
          :authors="authors"
          :badge="
            index === 0
              ? {
                  label: 'Latest',
                  color: 'primary',
                  variant: 'subtle',
                }
              : undefined
          "
          :ui="{
            container: 'max-w-2xl',
            title: 'font-mono',
          }"
        >
          <template #body>
            <!-- GitHub renders and sanitizes the notes -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="release-notes mt-4" v-html="release.html" />
          </template>
        </UChangelogVersion>
      </template>
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
import { ecosystemChanges } from '~/data/ecosystem-changelog'

const meta = {
  title: 'Changelog',
  description:
    'What each release of the soaring-symbols package brought, new airlines and marks, data and fixes, and what changed around it: the website, its API and the apps.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

defineOgImage('Site', { title: meta.title, description: meta.description })

const route = useRoute()
const router = useRouter()

const tabs = [
  { label: 'Package', value: 'package', icon: 'simple-icons:npm' },
  { label: 'Ecosystem', value: 'ecosystem', icon: 'solar:widget-linear' },
]

// Kept in the URL (?tab=ecosystem), so a link can open either tab
const tab = computed({
  get: () => (route.query.tab === 'ecosystem' ? 'ecosystem' : 'package'),
  set: (value) =>
    router.replace({
      query: { ...route.query, tab: value === 'package' ? undefined : value },
    }),
})

// The releases, read again in the browser only once the Package tab shows
const releases = useReleases(() => tab.value === 'package')

// The changes grouped by day, newest first as the data lists them: a day
// with one change shows it alone, a day with several is titled with their
// apps, each named once
const listFormat = new Intl.ListFormat('en', { type: 'conjunction' })

const byDate = new Map()
for (const change of ecosystemChanges) {
  if (!byDate.has(change.date)) byDate.set(change.date, [])
  byDate.get(change.date).push(change)
}

const days = [...byDate].map(([date, changes]) =>
  changes.length === 1
    ? { date, only: changes[0] }
    : {
        date,
        title: listFormat.format([...new Set(changes.map((c) => c.name))]),
        changes,
      },
)

// Who makes the releases: the maintainer, with Claude Code
const authors = [
  {
    name: 'Anh Thang',
    description: '@anhthang',
    avatar: { src: 'https://github.com/anhthang.png?size=64', loading: 'lazy' },
    to: 'https://github.com/anhthang',
    target: '_blank',
    ui: { wrapper: 'cap-center' },
  },
  {
    name: 'Claude',
    description: 'Claude Code',
    avatar: { icon: 'simple-icons:claude', ui: { icon: 'text-[#d97757]' } },
    to: 'https://claude.com/claude-code',
    target: '_blank',
    ui: { wrapper: 'cap-center' },
  },
]
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
