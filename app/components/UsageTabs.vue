<template>
  <!-- Lines of code in tabs, each with a copy button: the shell of an
       airline's or an alliance's ways to use its marks and data -->
  <div class="overflow-hidden rounded-xl bg-board text-flap-ink">
    <UTabs
      v-model="current"
      :items="items"
      variant="link"
      aria-label="How to use it"
      :ui="BOARD_TABS_UI"
    >
      <template #content="{ item: tab }">
        <div class="flex flex-col divide-y divide-white/10">
          <div
            v-for="item in tab.items"
            :key="item.label"
            class="flex flex-col gap-1.5 py-4 ps-5 pe-3"
          >
            <p class="text-xs font-semibold text-flap-ink/55">
              {{ item.label }}
            </p>
            <div class="flex items-start gap-3">
              <pre
                class="min-w-0 flex-1 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]"
              ><code>{{ item.code }}<template v-if="item.result">
<span class="text-flap-ink/50">{{ item.result }}</span></template></code></pre>
              <UButton
                :icon="
                  copied === item.code
                    ? 'solar:check-linear'
                    : 'solar:copy-linear'
                "
                :aria-label="
                  copied === item.code
                    ? 'Copied'
                    : `Copy ${item.label.toLowerCase()}`
                "
                variant="ghost"
                size="sm"
                class="-mt-1 shrink-0 text-flap-ink hover:bg-white/10"
                @click="copy(item.code)"
              />
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup>
const props = defineProps({
  // [{ id, label, items: [{ label, code, result? }] }]
  tabs: { type: Array, required: true },
})

const current = ref(props.tabs[0]?.id)
const items = computed(() =>
  props.tabs.map((tab) => ({ ...tab, value: tab.id })),
)

// The code last copied shows a check for a moment
const { copy, copied } = useCopy()
</script>
