<template>
  <UAccordion v-model="openGroups" :items="accordionItems" type="multiple">
    <template #body="{ item }">
      <UPageList>
        <li
          v-for="check in item.checks"
          :key="check.label"
          class="flex items-start justify-between gap-4 px-4 py-2.5 text-sm"
        >
          <div class="flex items-start gap-2">
            <UIcon
              :name="statusIcon(check)"
              class="size-4 mt-0.5 shrink-0"
              :class="statusColor(check)"
            />
            <span class="text-default">{{ check.label }}</span>
            <UBadge
              v-if="check.level === 'warning'"
              label="Warning"
              color="warning"
              variant="subtle"
              size="sm"
            />
          </div>
          <span
            class="text-muted font-mono text-xs text-right shrink-0 max-w-[50%] truncate"
            :title="check.detail"
          >
            {{ check.detail }}
          </span>
        </li>
      </UPageList>
    </template>
  </UAccordion>
</template>

<script setup>
const props = defineProps({
  groups: Array,
})

// A failed warning is advice, not an error, as in `lint-svg.js --check`
const isWarning = (check) => !check.pass && check.level === 'warning'

const statusIcon = (check) => {
  if (check.pass) return 'hugeicons:checkmark-circle-02'
  return isWarning(check) ? 'hugeicons:alert-circle' : 'hugeicons:cancel-circle'
}

const statusColor = (check) => {
  if (check.pass) return 'text-success'
  return isWarning(check) ? 'text-warning' : 'text-error'
}

const failingTitles = (groups) =>
  groups.filter((g) => !g.checks.every((c) => c.pass)).map((g) => g.title)

const openGroups = ref(failingTitles(props.groups))

watch(
  () => props.groups,
  (newGroups) => {
    openGroups.value = failingTitles(newGroups)
  },
)

const accordionItems = computed(() =>
  props.groups.map((g) => ({
    label: g.title,
    value: g.title,
    checks: g.checks,
  })),
)
</script>
