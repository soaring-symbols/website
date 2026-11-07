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

      <UNavigationMenu
        :items="nav"
        variant="link"
        :ui="{ linkLabel: 'cap-center' }"
      />

      <template #right>
        <UButton
          to="https://github.com/soaring-symbols/soaring-symbols"
          target="_blank"
          icon="hugeicons:github"
          variant="ghost"
          aria-label="Soaring Symbols on GitHub"
        />
        <UColorModeButton />
      </template>

      <template #body>
        <UNavigationMenu
          :items="nav"
          orientation="vertical"
          class="-mx-3"
          :ui="{
            list: 'flex flex-col gap-1',
            link: 'gap-3 px-3 py-3 text-base before:inset-0 before:rounded-lg',
            linkLeadingIcon: 'size-6',
            linkLabel: 'cap-center',
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

const nav = [
  { label: 'Browse', to: '/browse', icon: 'hugeicons:airplane-01' },
  { label: 'Validate', to: '/validate', icon: 'hugeicons:checkmark-circle-02' },
  { label: 'Ecosystem', to: '/ecosystem', icon: 'hugeicons:puzzle' },
]
</script>

<style scoped>
.brand-mark {
  --flap: 1.1rem;
}
</style>
