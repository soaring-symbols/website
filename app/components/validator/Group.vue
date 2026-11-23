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
          class="list-none px-4 py-2.5 text-sm"
        >
          <!-- One line: the label and what can fix it never wrap, so the
               detail gives way and is cut short (in full on hover). The
               icon's color says whether it failed or only warns. -->
          <div class="flex items-center justify-between gap-4">
            <div class="flex shrink-0 items-center gap-2">
              <UIcon
                :name="statusIcon(checkStatus(check))"
                class="size-4 shrink-0"
                :class="statusColor(checkStatus(check))"
              />
              <span class="cap-center text-default whitespace-nowrap">{{
                check.label
              }}</span>
              <!-- What the Fix SVG button can do about it -->
              <UBadge
                v-if="!check.pass"
                v-bind="fixBadge(check)"
                variant="outline"
                size="sm"
              />
            </div>
            <span
              class="min-w-12 flex-1 truncate text-right font-mono text-xs text-muted"
              :title="check.detail"
            >
              {{ check.detail }}
            </span>
          </div>
          <!-- What to try, for a check the website flags on its own -->
          <div v-if="check.hint" class="mt-1 pl-6 text-xs text-muted">
            <p>{{ check.hint }}</p>
            <div
              v-for="command in check.commands"
              :key="command.label"
              class="mt-1.5 flex items-center gap-2 rounded-md bg-elevated py-1 pr-1 pl-2.5"
            >
              <span class="shrink-0 text-dimmed">{{ command.label }}</span>
              <code class="min-w-0 flex-1 break-all font-mono text-default">{{
                command.code
              }}</code>
              <UButton
                :icon="
                  copied === command.code
                    ? 'solar:check-linear'
                    : 'solar:copy-linear'
                "
                :aria-label="
                  copied === command.code ? 'Copied' : 'Copy the command'
                "
                color="neutral"
                variant="ghost"
                size="xs"
                @click="copy(command.code)"
              />
            </div>
          </div>
        </li>
      </UPageList>
    </template>
  </UAccordion>
</template>

<script setup>
const props = defineProps({
  groups: { type: Array, required: true },
})

// The command last copied shows a check for a moment
const { copy, copied } = useCopy()

// A failed warning is advice, not an error, as in `lint-svg.js --check`

const checkStatus = (check) => {
  if (check.pass) return 'pass'
  return isWarning(check) ? 'warning' : 'error'
}

const STATUS_ICONS = {
  pass: 'solar:check-circle-linear',
  warning: 'solar:danger-circle-linear',
  error: 'solar:close-circle-linear',
}
const STATUS_COLORS = {
  pass: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
}
// The package's `fixable`: fixed by Fix SVG, fixed once an option is given,
// or left for the editor
const FIX_BADGES = {
  true: {
    label: 'Auto-fix',
    icon: 'solar:magic-stick-3-linear',
    color: 'primary',
    title: 'Fix SVG fixes this',
  },
  mergePaths: {
    label: 'Fix with Merge paths',
    icon: 'solar:magic-stick-3-linear',
    color: 'primary',
    title: 'Fix SVG fixes this when Merge paths is ticked',
  },
  fillColor: {
    label: 'Fix with a color',
    icon: 'solar:paint-bucket-linear',
    color: 'primary',
    title: 'Fix SVG fixes this once you pick the color to draw it in',
  },
  false: {
    label: 'Fix in editor',
    icon: 'solar:pen-linear',
    color: 'neutral',
    title: "Fix SVG can't fix this: change it in your editor",
  },
}

// A check the website flags with commands to run (a near miss at too few
// decimals) is fixed by optimizing the original again, not in an editor.
// Its `fixable` stays false, so the page offers no Fix SVG for it.
const REOPTIMIZE_BADGE = {
  label: 'Re-optimize',
  icon: 'solar:refresh-linear',
  color: 'neutral',
  title:
    "Fix SVG can't fix this: optimize the original again with a command below",
}
const fixBadge = (check) =>
  check.commands?.length ? REOPTIMIZE_BADGE : FIX_BADGES[String(check.fixable)]

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
