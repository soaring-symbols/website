<template>
  <div class="flex flex-col gap-4">
    <UCard
      :class="
        allPass ? 'bg-success/10 ring-success/30' : 'bg-error/10 ring-error/30'
      "
    >
      <UUser
        v-if="allPass"
        name="SVG Valid"
        :description="'No issues found. This SVG meets the contribution guidelines.'"
        :avatar="{
          icon: 'hugeicons:checkmark-circle-02',
          ui: {
            root: 'bg-transparent',
            icon: 'text-4xl text-success',
          },
        }"
        size="2xl"
        :ui="{
          name: 'font-bold text-success',
          description: 'text-sm text-muted',
        }"
      />
      <UUser
        v-else
        name="Issues Found"
        :description="`${passed}/${total} checks passed. Fix the ${total - passed} issue${total - passed > 1 ? 's' : ''} below to meet contribution guidelines.`"
        :avatar="{
          icon: 'hugeicons:cancel-circle',
          ui: {
            root: 'bg-transparent',
            icon: 'text-4xl text-error',
          },
        }"
        size="2xl"
        :ui="{
          name: 'font-bold text-error',
          description: 'text-sm text-muted',
        }"
      />
    </UCard>

    <UCard :ui="{ body: 'p-0' }">
      <ValidatorGroup :groups="groups" />
    </UCard>
  </div>
</template>

<script setup>
defineProps({
  groups: Array,
  allPass: Boolean,
  total: Number,
  passed: Number,
})
</script>
