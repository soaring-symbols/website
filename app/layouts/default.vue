<template>
  <div class="flex min-h-screen flex-col">
    <UHeader to="/" :ui="{ root: 'bg-default/85 backdrop-blur' }">
      <template #title>
        <span class="flex items-center gap-2.5">
          <FlapText text="SS" :length="2" class="brand-mark" />
          <span
            class="cap-center text-lg font-extrabold tracking-tight text-highlighted"
          >
            Soaring Symbols
          </span>
        </span>
      </template>

      <UNavigationMenu :items="nav" variant="link" />

      <template #right>
        <GitHubStarsButton username="soaring-symbols" repo="soaring-symbols" />
        <UColorModeButton />
      </template>

      <template #body>
        <UNavigationMenu
          :items="mobileNav"
          orientation="vertical"
          class="-mx-3"
          :ui="{
            list: 'flex flex-col gap-1',
            link: 'gap-3 px-3 py-3 text-base before:inset-0 before:rounded-lg',
            linkLeadingIcon: 'size-6',
          }"
        />
      </template>
    </UHeader>

    <main class="flex-1">
      <UContainer>
        <slot />
      </UContainer>
    </main>

    <footer class="border-t border-default">
      <UContainer
        class="flex flex-col gap-6 py-10 text-sm text-muted md:flex-row md:justify-between"
      >
        <p class="text-pretty">
          Logos and icons are shown for reference. The trademarks belong to
          their airlines; Soaring Symbols claims no ownership of them.
        </p>
        <p class="shrink-0">© {{ year }} Soaring Symbols</p>
      </UContainer>
    </footer>
  </div>
</template>

<script setup>
const year = new Date().getFullYear()

const route = useRoute()

// Browse opens the two halves of the collection, airlines and alliances,
// and stays lit on any page of either
const nav = computed(() => [
  {
    label: 'Browse',
    icon: 'solar:plane-linear',
    active: /^\/(browse|airlines|alliances)(\/|$)/.test(route.path),
    children: [
      {
        label: 'Airlines',
        description: 'Search every airline by name, code or callsign.',
        to: '/browse',
        icon: 'solar:plane-linear',
      },
      {
        label: 'Alliances',
        description: 'oneworld, SkyTeam, Star Alliance and the rest.',
        to: '/alliances',
        icon: 'solar:users-group-rounded-linear',
      },
    ],
  },
  { label: 'Validate', to: '/validate', icon: 'solar:check-circle-linear' },
  { label: 'Ecosystem', to: '/ecosystem', icon: 'solar:widget-add-linear' },
  { label: 'Changelog', to: '/changelog', icon: 'solar:history-linear' },
])

// The phone menu has room for every page, so Browse's two halves are
// listed in its place rather than folded behind another tap
const mobileNav = computed(() =>
  nav.value.flatMap(({ children, ...item }) =>
    children ? children.map(({ description, ...child }) => child) : [item],
  ),
)
</script>

<style scoped>
.brand-mark {
  --flap: 1.1rem;
}

/* Dark flaps vanish into the dark header, so dark mode sets them on the
   signal-yellow tile of the favicon. A ring, not padding, keeps the title
   from shifting when the theme changes */
.dark .brand-mark {
  /* The yellow already sets the flaps apart: keep the favicon's colors */
  --color-flap: #2b3139;
  --flap-edge: transparent;
  border-radius: 3px;
  background: var(--color-signal-500);
  box-shadow: 0 0 0 3px var(--color-signal-500);
}
</style>
