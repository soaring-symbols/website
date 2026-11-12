<template>
  <div class="flex flex-col gap-4">
    <UCard
      :class="
        allPass ? 'bg-success/10 ring-success/30' : 'bg-error/10 ring-error/30'
      "
    >
      <UUser
        v-if="allPass"
        name="Meets the guidelines"
        :description="
          warnings
            ? `${fileName} passes every check, with ${warnings} warning${warnings > 1 ? 's' : ''} worth a look.`
            : `${fileName} passes every check.`
        "
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
        name="Issues found"
        :description="`${fileName} passes ${passed} of ${total} checks. Fix the ${total - passed} issue${total - passed > 1 ? 's' : ''} below to meet the contribution guidelines.`"
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
const props = defineProps({
  groups: Array,
  // The file the checks ran on
  fileName: { type: String, default: 'This SVG' },
})

// Warnings never fail an SVG, so the counts cover errors only
const checks = computed(() => props.groups.flatMap((g) => g.checks))
const errors = computed(() => checks.value.filter((c) => !isWarning(c)))
const total = computed(() => errors.value.length)
const passed = computed(() => errors.value.filter((c) => c.pass).length)
const allPass = computed(() => passed.value === total.value)
const warnings = computed(
  () => checks.value.filter((c) => isWarning(c) && !c.pass).length,
)
</script>
