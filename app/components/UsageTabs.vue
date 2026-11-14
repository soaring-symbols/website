<template>
  <!-- Lines of code in tabs, each with a copy button: the shell of an
       airline's or an alliance's ways to use its marks and data -->
  <div class="overflow-hidden rounded-xl bg-board text-flap-ink">
    <div
      class="flex gap-1 border-b border-white/10 px-2 pt-2"
      role="tablist"
      aria-label="How to use it"
    >
      <button
        v-for="tab in tabs"
        :id="`usage-tab-${tab.id}`"
        :key="tab.id"
        type="button"
        role="tab"
        class="-mb-px cursor-pointer border-b-2 px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-signal-500"
        :class="
          tab.id === current
            ? 'border-signal-500 text-flap-ink'
            : 'border-transparent text-flap-ink/55 hover:text-flap-ink'
        "
        :aria-selected="tab.id === current"
        :aria-controls="`usage-panel-${tab.id}`"
        @click="current = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div
      :id="`usage-panel-${current}`"
      role="tabpanel"
      :aria-labelledby="`usage-tab-${current}`"
      class="flex flex-col divide-y divide-white/10"
    >
      <div
        v-for="item in activeTab.items"
        :key="item.label"
        class="flex flex-col gap-1.5 py-4 ps-5 pe-3"
      >
        <p class="text-xs font-semibold text-flap-ink/55">{{ item.label }}</p>
        <div class="flex items-start gap-3">
          <pre
            class="min-w-0 flex-1 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]"
          ><code>{{ item.code }}<template v-if="item.result">
<span class="text-flap-ink/50">{{ item.result }}</span></template></code></pre>
          <UButton
            :icon="
              copied === item.code ? 'solar:check-linear' : 'solar:copy-linear'
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
  </div>
</template>

<script setup>
const props = defineProps({
  // [{ id, label, items: [{ label, code, result? }] }]
  tabs: { type: Array, required: true },
})

const current = ref(props.tabs[0]?.id)
const activeTab = computed(
  () => props.tabs.find((t) => t.id === current.value) ?? props.tabs[0],
)

const copied = ref(null)

async function copy(code) {
  await navigator.clipboard.writeText(code)
  copied.value = code
  setTimeout(() => {
    if (copied.value === code) copied.value = null
  }, 1500)
}
</script>
