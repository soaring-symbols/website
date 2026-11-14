<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader :title="meta.title" :description="meta.description" />

    <ul class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="item in items" :key="item.alliance.slug">
        <ULink
          :to="`/alliances/${item.alliance.slug}`"
          class="group flex h-full flex-col rounded-xl bg-surface transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
        >
          <!-- Who it is: its mark, its name and slogan, and its years -->
          <span class="flex gap-4 p-4">
            <span
              class="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-tile p-3"
              :style="{ backgroundImage: brandTint(item.alliance) }"
            >
              <AllianceMark
                :alliance="item.alliance"
                decorative
                class="size-full"
              />
            </span>
            <span class="flex min-w-0 flex-col gap-2">
              <span>
                <span class="block font-bold text-highlighted">
                  {{ item.alliance.name }}
                </span>
                <span
                  v-if="item.alliance.branding?.tagline"
                  class="block text-sm text-muted text-pretty"
                >
                  “{{ item.alliance.branding.tagline }}”
                </span>
              </span>
              <span class="flex flex-wrap gap-1.5 text-xs">
                <span v-if="item.years" :class="chipClass">
                  <span class="cap-center">{{ item.years }}</span>
                </span>
                <span v-if="item.disbanded" :class="chipClass">
                  <span class="cap-center">{{ item.disbanded }}</span>
                </span>
              </span>
            </span>
          </span>

          <!-- A boarding pass's tear line: a dashed perforation and a notch
               cut into each side in the page's own color -->
          <span class="relative mt-auto h-5 shrink-0" aria-hidden="true">
            <span
              class="absolute inset-x-6 top-1/2 -translate-y-1/2 border-t border-dashed border-accented/70 dark:border-white/20"
            />
            <span
              class="absolute top-0 -left-2.5 size-5 rounded-full bg-(--ui-bg)"
            />
            <span
              class="absolute top-0 -right-2.5 size-5 rounded-full bg-(--ui-bg)"
            />
          </span>

          <!-- The stub: its airlines in the collection, a few by their icon
               and the rest counted, with what they are in words beside them -->
          <span class="flex items-center px-4 pt-2 pb-4">
            <span class="flex -space-x-2" aria-hidden="true">
              <span
                v-for="airline in item.avatars"
                :key="airline.slug"
                class="grid size-8 place-items-center overflow-hidden rounded-full bg-tile p-1 ring-2 ring-surface transition-colors group-hover:ring-(--ui-bg-elevated) inset-ring inset-ring-black/10 dark:inset-ring-white/15"
                :style="{ backgroundImage: brandTint(airline) }"
              >
                <img
                  :src="assetUrl(airline, airline.avatar)"
                  alt=""
                  loading="lazy"
                  class="size-full object-contain"
                />
              </span>
              <span
                v-if="item.more"
                class="grid h-8 min-w-8 place-items-center rounded-full bg-accented px-1.5 text-xs font-semibold text-highlighted ring-2 ring-surface transition-colors group-hover:ring-(--ui-bg-elevated)"
              >
                <span class="cap-center">+{{ item.more }}</span>
              </span>
            </span>
            <span class="ms-auto ps-3 text-xs whitespace-nowrap text-muted">
              {{ item.count }}
            </span>
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

// By name, as the catalog lists them, disbanded ones among the rest. Each
// card shows its years and a few of its airlines in the collection, those
// with an icon first since a logo reads poorly in a small circle, then how
// many more there are.
const AVATARS = 5

const items = alliances.map((alliance) => {
  const members = collectionAirlines(alliance, airlines)
  const withMark = members
    .map((airline) => ({
      ...airline,
      avatar: hasAsset(airline, 'icon') ? 'icon' : firstVariant(airline),
    }))
    .filter((airline) => airline.avatar)
  const avatars = [
    ...withMark.filter((a) => a.avatar === 'icon'),
    ...withMark.filter((a) => a.avatar !== 'icon'),
  ].slice(0, AVATARS)

  return {
    alliance,
    years: alliance.defunct
      ? operatingYears(alliance)
      : alliance.founded && `Since ${alliance.founded}`,
    disbanded: alliance.defunct && 'Disbanded',
    count: alliance.defunct
      ? `${members.length} flew in it`
      : `${members.length} in the collection`,
    avatars,
    more: members.length - avatars.length,
  }
})

const chipClass =
  'flex items-center rounded-full bg-accented/70 px-2.5 py-0.5 font-semibold text-highlighted dark:bg-white/10'
</script>
