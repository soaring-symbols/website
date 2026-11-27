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

      <!-- Each dropdown takes its content's width (Browse's is set below,
           Ecosystem's grows with its columns) and opens centered under its
           own trigger, as content-orientation="vertical" places it, rather
           than across the menu: the content's width sets the viewport's -->
      <UNavigationMenu
        :items="nav"
        variant="link"
        :ui="{
          viewportWrapper: 'justify-start',
          viewport:
            'shrink-0 sm:w-(--reka-navigation-menu-viewport-width) left-(--reka-navigation-menu-viewport-left)',
          content: 'sm:w-auto',
        }"
      >
        <!-- Ecosystem lists every entry under its group's name, so each app
             is one click from any page; a long group wraps into more
             columns (ecosystemMenu) rather than running off the screen -->
        <template #ecosystem-content="{ ui }">
          <div class="flex w-max gap-x-4 p-2">
            <div v-for="group in ecosystemMenu" :key="group.id">
              <NavigationMenuLink as-child>
                <ULink
                  :to="`/ecosystem#${group.id}`"
                  class="block px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted hover:text-highlighted"
                >
                  {{ group.title }}
                </ULink>
              </NavigationMenuLink>
              <div class="flex gap-x-1">
                <ul
                  v-for="(column, i) in group.columns"
                  :key="i"
                  class="min-w-40"
                >
                  <li v-for="entry in column" :key="entry.id">
                    <NavigationMenuLink
                      as-child
                      :active="at('/ecosystem', `#${entry.id}`)"
                    >
                      <ULink
                        :to="`/ecosystem#${entry.id}`"
                        :class="
                          ui.childLink({
                            active: at('/ecosystem', `#${entry.id}`),
                          })
                        "
                      >
                        <UIcon
                          :name="entry.icon"
                          :class="
                            ui.childLinkIcon({
                              active: at('/ecosystem', `#${entry.id}`),
                            })
                          "
                        />
                        <span
                          :class="
                            ui.childLinkLabel({
                              active: at('/ecosystem', `#${entry.id}`),
                            })
                          "
                        >
                          {{ entry.name }}
                        </span>
                      </ULink>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
      </UNavigationMenu>

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

    <!-- Whose the marks are and the pages the header has no room for, then
         the copyright and the project's GitHub and npm on one row -->
    <UFooter
      :ui="{
        root: 'border-t border-default',
        top: 'pt-8 pb-0 lg:pt-8 lg:pb-0',
        container:
          'flex items-center justify-between gap-x-3 py-6 text-sm text-muted lg:py-6',
        left: 'order-1 mt-0 flex-1 justify-start lg:mt-0',
        center: 'hidden',
        right: 'order-2 flex-none justify-end',
      }"
    >
      <template #top>
        <UContainer>
          <p class="max-w-3xl text-sm text-pretty text-muted">
            Logos and icons are shown for reference. The trademarks belong to
            their airlines; Soaring Symbols claims no ownership of them. Read
            the
            <ULink
              :to="DISCLAIMER_URL"
              target="_blank"
              class="underline underline-offset-2 hover:text-highlighted"
              >disclaimer</ULink
            >
            before using them.
          </p>
          <nav class="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <ULink
              v-for="link in footerLinks"
              :key="link.label"
              :to="link.to"
              :target="link.target"
              class="hover:text-highlighted"
            >
              {{ link.label }}
            </ULink>
          </nav>
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

    <!-- Opened with ⌘K or from the home page's search button -->
    <SiteSearch />
  </div>
</template>

<script setup>
import { NavigationMenuLink } from 'reka-ui'
import { ecosystemEntries, ecosystemGroups } from '~/data/ecosystem'

const year = new Date().getFullYear()

const route = useRoute()

// Whether the current page is under one of the given paths, e.g. /alliances
// for /alliances/skyteam
const under = (...paths) =>
  paths.some((p) => route.path === p || route.path.startsWith(`${p}/`))

// Whether the current page is the given section of a page, e.g.
// /ecosystem#data. The router matches links without their hash, so two
// sections of one page would both be lit otherwise
const at = (path, hash) => route.path === path && route.hash === hash

// Browse opens the two halves of the collection, airlines and alliances, and
// Ecosystem its two groups (on phones; the header lists every entry, from
// ecosystemMenu); each stays lit on any page below it
const nav = computed(() => [
  {
    label: 'Browse',
    icon: 'solar:plane-linear',
    active: under('/airlines', '/alliances'),
    // Its two pages side by side, with room for their descriptions
    ui: { childList: 'w-120' },
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
    slot: 'ecosystem',
    active: under('/ecosystem'),
    children: [
      {
        label: 'Files and APIs',
        description: 'CDN links and a JSON and image API.',
        to: '/ecosystem#data',
        icon: 'solar:code-square-linear',
        active: at('/ecosystem', '#data'),
      },
      {
        label: 'Apps and plugins',
        description: 'Raycast, Figma and more.',
        to: '/ecosystem#apps',
        icon: 'solar:widget-add-linear',
        active: at('/ecosystem', '#apps'),
      },
    ],
  },
  { label: 'Changelog', to: '/changelog', icon: 'solar:history-linear' },
])

// The header's Ecosystem menu: each group with its entries, in the order the
// ecosystem page lists them, split into columns of at most MENU_ROWS, as even
// as they divide, so the menu grows wider rather than taller
const MENU_ROWS = 8
const ecosystemMenu = ecosystemGroups.map((group) => {
  const entries = ecosystemEntries(group.id)
  const count = Math.ceil(entries.length / MENU_ROWS)
  const rows = Math.ceil(entries.length / count)

  return {
    ...group,
    columns: Array.from({ length: count }, (_, i) =>
      entries.slice(i * rows, (i + 1) * rows),
    ),
  }
})

// The phone menu is a tree like a docs sidebar: each section shows its pages
// beneath it, open, with a line down the side, so every page is one tap away
// and the current one is marked on that line. The header's dropdown widths
// (ui) and Ecosystem's columns (slot) stay out of it
const mobileNav = computed(() =>
  nav.value.map(({ children, ui, slot, ...item }) => ({
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
// Pages the header has no room for; the rest are a click away up there
const footerLinks = [
  { label: 'Brand', to: '/brand' },
  { label: 'Contributing', to: CONTRIBUTING_URL, target: '_blank' },
  {
    label: 'Sponsor',
    to: 'https://github.com/sponsors/soaring-symbols',
    target: '_blank',
  },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
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
</style>
