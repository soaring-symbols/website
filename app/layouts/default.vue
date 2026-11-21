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
        <!-- The header's buttons share the stars button's light border.
             Sponsor is an icon in GitHub's own pink heart, which reads on
             both themes, leaving the label to the disclaimer, so who owns
             the marks is in sight on every page. Phones have no room beside
             the title, so their menu lists both instead. The labelled
             button leads; Sponsor sits by GitHub, where it is hosted -->
        <UButton
          class="hidden sm:inline-flex"
          :to="DISCLAIMER_URL"
          target="_blank"
          label="Disclaimer"
          icon="solar:justice-scale-linear"
          variant="outline"
          aria-label="Read the disclaimer on who owns the marks"
          :ui="{ base: 'ring-default' }"
        />
        <GitHubStarsButton username="soaring-symbols" repo="soaring-symbols" />
        <UTooltip text="Sponsor" :delay-duration="0">
          <UButton
            class="hidden sm:inline-flex"
            to="https://github.com/sponsors/soaring-symbols"
            target="_blank"
            icon="solar:heart-linear"
            variant="outline"
            aria-label="Sponsor Soaring Symbols on GitHub"
            :ui="{ base: 'ring-default', leadingIcon: 'text-pink-500' }"
          />
        </UTooltip>
        <ColorModeMenu />
      </template>

      <template #body>
        <UNavigationMenu
          :items="mobileNav"
          orientation="vertical"
          highlight
          class="-mx-2.5"
          :ui="{ link: 'py-2', childLink: 'py-2' }"
        />

        <USeparator class="my-4" />

        <UNavigationMenu
          :items="mobileLinks"
          orientation="vertical"
          class="-mx-2.5"
          :ui="{ link: 'py-2' }"
        />
      </template>
    </UHeader>

    <main class="flex-1">
      <UContainer>
        <slot />
      </UContainer>
    </main>

    <UFooter
      :ui="{
        root: 'border-t border-default',
        top: 'border-b border-default',
        // The copyright at the left and the links at the right, on one row
        // at every width
        container:
          'flex items-center justify-between gap-x-3 py-6 text-sm text-muted lg:py-4',
        left: 'order-1 mt-0 flex-1 justify-start lg:mt-0',
        center: 'hidden',
        right: 'order-2 flex-none justify-end',
      }"
    >
      <template #top>
        <UContainer>
          <!-- Two columns of links on a phone, so the list stays short -->
          <UFooterColumns
            :columns="footerColumns"
            :ui="{
              center:
                'grid grid-flow-row grid-cols-2 gap-8 lg:grid-cols-3 xl:col-span-2',
            }"
          >
            <!-- The name as the header sets it, then what the marks are and
                 whose they are -->
            <template #left>
              <ULink to="/" class="inline-flex items-center gap-2.5">
                <FlapText text="SS" :length="2" class="brand-mark" />
                <span
                  class="cap-center text-lg font-extrabold tracking-tight text-highlighted"
                >
                  Soaring Symbols
                </span>
              </ULink>
              <p class="mt-4 max-w-sm text-sm text-pretty text-muted">
                Logos and icons are shown for reference. The trademarks belong
                to their airlines; Soaring Symbols claims no ownership of them.
                Read the
                <ULink
                  :to="DISCLAIMER_URL"
                  target="_blank"
                  class="underline underline-offset-2 hover:text-highlighted"
                  >disclaimer</ULink
                >
                before using them.
              </p>
            </template>
          </UFooterColumns>
        </UContainer>
      </template>

      <template #left>
        <p>© {{ year }} Soaring Symbols</p>
      </template>

      <template #right>
        <UButton
          v-for="link in footerIcons"
          :key="link.label"
          :icon="link.icon"
          :to="link.to"
          target="_blank"
          color="neutral"
          variant="ghost"
          :aria-label="link.label"
        />
      </template>
    </UFooter>
  </div>
</template>

<script setup>
const year = new Date().getFullYear()

const route = useRoute()

// Whether the current page is under one of the given paths, e.g. /alliances
// for /alliances/skyteam
const under = (...paths) =>
  paths.some((p) => route.path === p || route.path.startsWith(`${p}/`))

// Browse opens the two halves of the collection, airlines and alliances, and
// Ecosystem its two groups; each stays lit on any page below it
const nav = computed(() => [
  {
    label: 'Browse',
    icon: 'solar:plane-linear',
    active: under('/airlines', '/alliances'),
    children: [
      {
        label: 'Airlines',
        description: 'Search every airline by name, code or callsign.',
        to: '/airlines',
        icon: 'solar:plane-linear',
        active: under('/airlines'),
      },
      {
        label: 'Alliances',
        description: 'oneworld, SkyTeam, Star Alliance and the rest.',
        to: '/alliances',
        icon: 'solar:users-group-rounded-linear',
        active: under('/alliances'),
      },
    ],
  },
  { label: 'Validate', to: '/validate', icon: 'solar:check-circle-linear' },
  {
    label: 'Ecosystem',
    to: '/ecosystem',
    icon: 'solar:widget-add-linear',
    active: under('/ecosystem'),
    children: [
      {
        label: 'Files and APIs',
        description: 'CDN links and a JSON and image API.',
        to: '/ecosystem#data',
        icon: 'solar:code-square-linear',
      },
      {
        label: 'Apps and plugins',
        description: 'Raycast, Figma and more.',
        to: '/ecosystem#apps',
        icon: 'solar:widget-add-linear',
      },
    ],
  },
  { label: 'Changelog', to: '/changelog', icon: 'solar:history-linear' },
])

// The phone menu is a tree like a docs sidebar: each section shows its pages
// beneath it, open, with a line down the side, so every page is one tap away
// and the current one is marked on that line
const mobileNav = computed(() =>
  nav.value.map(({ children, ...item }) => ({
    ...item,
    defaultOpen: true,
    // Its pages drop their descriptions and icons: the line says they belong
    // to the section above
    ...(children && {
      children: children.map(({ description, icon, ...child }) => child),
    }),
  })),
)

// Links off the site, set apart below the pages. The header's Sponsor and
// Disclaimer buttons have no room on phones, so they are listed here
// The footer lists every page by what it is for, and the places the project
// lives off the site
const footerColumns = [
  {
    label: 'Collection',
    children: [
      { label: 'Airlines', to: '/airlines' },
      { label: 'Alliances', to: '/alliances' },
      { label: 'Validate', to: '/validate' },
      { label: 'Changelog', to: '/changelog' },
    ],
  },
  {
    label: 'Use the marks',
    children: [
      { label: 'Files and APIs', to: '/ecosystem#data' },
      { label: 'Apps and plugins', to: '/ecosystem#apps' },
      {
        label: 'npm package',
        to: 'https://www.npmjs.com/package/soaring-symbols',
        target: '_blank',
      },
    ],
  },
  {
    label: 'Project',
    children: [
      { label: 'Brand', to: '/brand' },
      { label: 'Disclaimer', to: DISCLAIMER_URL, target: '_blank' },
      {
        label: 'Contributing',
        to: CONTRIBUTING_URL,
        target: '_blank',
      },
      {
        label: 'Sponsor',
        to: 'https://github.com/sponsors/soaring-symbols',
        target: '_blank',
      },
    ],
  },
]

const footerIcons = [
  {
    label: 'Soaring Symbols on GitHub',
    icon: 'simple-icons:github',
    to: 'https://github.com/soaring-symbols/soaring-symbols',
  },
  {
    label: 'soaring-symbols on npm',
    icon: 'simple-icons:npm',
    to: 'https://www.npmjs.com/package/soaring-symbols',
  },
]

const mobileLinks = [
  {
    label: 'Disclaimer',
    to: DISCLAIMER_URL,
    target: '_blank',
    icon: 'solar:justice-scale-linear',
  },
  {
    label: 'GitHub',
    to: 'https://github.com/soaring-symbols/soaring-symbols',
    target: '_blank',
    icon: 'simple-icons:github',
  },
  {
    label: 'Sponsor',
    to: 'https://github.com/sponsors/soaring-symbols',
    target: '_blank',
    icon: 'solar:heart-linear',
  },
]
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
