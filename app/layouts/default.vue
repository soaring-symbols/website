<template>
  <div class="flex flex-col min-h-screen">
    <UHeader title="Soaring Symbols" to="/">
      <template #right>
        <UButton
          to="/browse"
          label="Browse"
          icon="hugeicons:airplane-01"
          variant="ghost"
        />
        <UButton
          to="/validate"
          label="Validate"
          icon="hugeicons:checkmark-circle-02"
          variant="ghost"
        />
        <UButton
          to="https://github.com/soaring-symbols/soaring-symbols"
          target="_blank"
          icon="hugeicons:github"
          variant="ghost"
          aria-label="GitHub"
        />
        <UColorModeButton />
      </template>
    </UHeader>

    <main class="flex-1">
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </main>

    <UFooter>
      <template #left>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          © {{ new Date().getFullYear() }} Soaring Symbols
        </p>
      </template>
    </UFooter>
  </div>
</template>
