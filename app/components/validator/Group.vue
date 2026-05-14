<template>
  <UAccordion
    v-model="defaultOpenGroups"
    :items="accordionItems"
    type="multiple"
  >
    <template #body="{ item }">
      <UPageList>
        <li
          v-for="check in item.checks"
          :key="check.label"
          class="flex items-start justify-between gap-4 px-4 py-2.5 text-sm"
        >
          <div class="flex items-start gap-2">
            <UIcon
              :name="
                check.pass
                  ? 'hugeicons:checkmark-circle-02'
                  : 'hugeicons:cancel-circle'
              "
              class="size-4 mt-0.5 shrink-0"
              :class="check.pass ? 'text-success' : 'text-error'"
            />
            <span class="text-default">{{ check.label }}</span>
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

const defaultOpenGroups = computed(() =>
  props.groups
    .filter((g) => !g.checks.every((c) => c.pass))
    .map((g) => g.title),
)

const accordionItems = computed(() =>
  props.groups.map((g) => ({
    label: g.title,
    value: g.title,
    checks: g.checks,
  })),
)
</script>
