<template>
  <div class="flex flex-col min-h-screen">
    <UHeader title="Soaring Symbols" to="/">
      <template #right>
        <UButton
          to="/browse"
          label="Browse"
          icon="hugeicons:airplane-01"
          variant="ghost"
          color="neutral"
        />
        <UButton
          to="/validate"
          label="Validate"
          icon="hugeicons:checkmark-circle-02"
          variant="ghost"
          color="neutral"
        />
        <UButton
          to="https://github.com/anhthang/soaring-symbols"
          target="_blank"
          icon="hugeicons:github"
          variant="ghost"
          color="neutral"
          aria-label="GitHub"
        />
        <UColorModeButton />
      </template>
    </UHeader>

    <main class="flex-1">
      <slot />
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

<script setup>
</script>
