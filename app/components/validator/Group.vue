<template>
  <UAccordion v-model="openGroups" :items="accordionItems" type="multiple">
    <!-- The group's worst result, so a closed group still shows it -->
    <template #leading="{ item }">
      <UIcon
        :name="statusIcon(item.status)"
        class="size-4 shrink-0"
        :class="statusColor(item.status)"
      />
    </template>
    <template #default="{ item }">
      <span class="flex items-center gap-2">
        {{ item.label }}
        <UBadge
          v-if="item.errors"
          :label="`${item.errors} issue${item.errors > 1 ? 's' : ''}`"
          color="error"
          variant="subtle"
          size="sm"
        />
        <UBadge
          v-if="item.warnings"
          :label="`${item.warnings} warning${item.warnings > 1 ? 's' : ''}`"
          color="warning"
          variant="subtle"
          size="sm"
        />
      </span>
    </template>
    <template #body="{ item }">
      <UPageList>
        <li
          v-for="check in item.checks"
          :key="check.label"
          class="flex items-start justify-between gap-4 px-4 py-2.5 text-sm"
        >
          <div class="flex items-start gap-2">
            <UIcon
              :name="statusIcon(checkStatus(check))"
              class="size-4 mt-0.5 shrink-0"
              :class="statusColor(checkStatus(check))"
            />
            <span class="text-default">{{ check.label }}</span>
            <UBadge
              v-if="checkStatus(check) === 'warning'"
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
const checkStatus = (check) => {
  if (check.pass) return 'pass'
  return isWarning(check) ? 'warning' : 'error'
}

const STATUS_ICONS = {
  pass: 'hugeicons:checkmark-circle-02',
  warning: 'hugeicons:alert-circle',
  error: 'hugeicons:cancel-circle',
}
const STATUS_COLORS = {
  pass: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
}
const statusIcon = (status) => STATUS_ICONS[status]
const statusColor = (status) => STATUS_COLORS[status]

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
  props.groups.map((g) => {
    const statuses = g.checks.map(checkStatus)
    const errors = statuses.filter((s) => s === 'error').length
    const warnings = statuses.filter((s) => s === 'warning').length
    return {
      label: g.title,
      value: g.title,
      checks: g.checks,
      errors,
      warnings,
      status: errors ? 'error' : warnings ? 'warning' : 'pass',
    }
  }),
)
</script>
