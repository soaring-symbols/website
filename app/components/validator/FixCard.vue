<template>
  <UCard v-if="result || needed">
    <!-- Before a fix: what it does -->
    <div v-if="!result" class="flex flex-wrap items-center gap-3">
      <UIcon name="hugeicons:magic-wand-01" class="size-5 text-primary" />
      <div class="flex-1 min-w-48">
        <p class="font-medium text-sm">Fix what the linter can</p>
        <p class="text-xs text-muted">
          Runs <code>lint-svg.js --fix</code> in your browser, then checks the
          result again. Geometry and anything else it can't fix stay for your
          editor.
        </p>
      </div>
      <!-- A color file with no color of its own: the one it is drawn in -->
      <UFormField
        v-if="needsColor"
        label="Color"
        :error="fillColor && !validColor ? 'Six-digit hex' : undefined"
        :ui="{ label: 'text-xs' }"
      >
        <UInput
          v-model="fillColor"
          placeholder="#rrggbb"
          class="w-36 font-mono"
          :ui="{ leading: 'ps-1.5' }"
        >
          <template #leading>
            <input
              type="color"
              aria-label="Pick the color"
              :value="validColor ? fillColor : '#000000'"
              class="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
              @input="fillColor = $event.target.value"
            />
          </template>
        </UInput>
      </UFormField>
      <UCheckbox
        v-if="canMerge"
        v-model="mergePaths"
        label="Merge paths"
        description="Experimental"
        :ui="{ description: 'text-xs' }"
      />
      <UButton
        label="Fix SVG"
        :ui="{ label: 'block' }"
        icon="hugeicons:magic-wand-01"
        :loading="fixing"
        :disabled="needsName"
        @click="fix"
      />
      <p v-if="needsColor" class="basis-full text-xs text-warning">
        This color file has no color of its own. Pick the color to draw it in,
        or set Variant to Mono if it is the monochrome version.
      </p>
      <p v-if="needsName" class="basis-full text-xs text-warning">
        The file has no &lt;title&gt;: pick the airline above first, so the fix
        can add it.
      </p>
    </div>

    <!-- After a fix: what changed, and what to do with it -->
    <div v-else class="flex flex-col gap-3">
      <div class="flex flex-wrap items-start gap-3">
        <UIcon
          :name="
            result.fixed
              ? 'hugeicons:checkmark-circle-02'
              : 'hugeicons:information-circle'
          "
          class="size-5 shrink-0"
          :class="result.fixed ? 'text-success' : 'text-info'"
        />
        <div class="flex-1 min-w-48">
          <p class="font-medium text-sm">
            {{
              result.fixed
                ? `Fixed ${original.name}`
                : 'Nothing the linter can fix'
            }}
          </p>
          <p v-if="!result.fixed" class="text-xs text-muted">
            What is left needs your editor.
          </p>
          <p v-else class="text-xs text-muted">
            The checks below are for the fixed file. Download it as
            <code>{{ fileName }}</code> and put it in your pull request<template
              v-if="repoPath"
            >
              at <code>{{ repoPath }}</code></template
            >.
          </p>
        </div>
        <div v-if="result.fixed" class="flex flex-wrap gap-2">
          <UButton
            label="Download"
            :ui="{ label: 'block' }"
            icon="hugeicons:download-04"
            :title="`Save as ${fileName}`"
            @click="download(fileName)"
          />
          <UButton
            label="Compare with original"
            :ui="{ label: 'block' }"
            icon="hugeicons:git-compare"
            color="neutral"
            variant="outline"
            @click="$emit('compare', original)"
          />
          <UButton
            label="Undo"
            :ui="{ label: 'block' }"
            icon="hugeicons:undo-02"
            color="neutral"
            variant="ghost"
            @click="undo"
          />
        </div>
        <UButton
          v-else
          icon="hugeicons:cancel-01"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Dismiss"
          @click="reset"
        />
      </div>

      <ul
        v-if="result.fixed && fixedList.length"
        class="text-xs text-muted list-disc ps-9 flex flex-col gap-1"
      >
        <li v-for="item in fixedList" :key="item.text">
          {{ item.text
          }}<span v-if="item.count > 1" class="text-dimmed">
            ×{{ item.count }}</span
          >
        </li>
      </ul>
    </div>

    <UAlert
      v-if="error"
      class="mt-3"
      color="error"
      icon="hugeicons:cancel-circle"
      title="Could not fix the SVG"
      :description="error"
    />
  </UCard>
</template>

<script setup>
const props = defineProps({
  // useSvgFix() of the uploaded SVG, kept by the page
  state: { type: Object, required: true },
  type: { type: String, required: true },
  // What <title> should hold, and whether it is a catalog name
  airlineName: { type: String, default: null },
  isCatalogName: Boolean,
  // A warning --merge-paths could clear, so offer it
  canMerge: Boolean,
  // Some check fails, so there may be something to fix
  needed: Boolean,
  // The file has a <title> whose text the fix can keep
  hasTitle: Boolean,
  // The name the repo expects (logo.svg, icon-mono.svg...): the fix checks
  // by it, and the download takes it
  fileName: { type: String, required: true },
  // A color file with no color of its own, so it needs one to be filled
  needsColor: Boolean,
})

defineEmits(['compare'])

const {
  fixing,
  error,
  mergePaths,
  fillColor,
  original,
  result,
  undo,
  reset,
  download,
} = props.state

const validColor = computed(() => /^#[0-9a-f]{6}$/i.test(fillColor.value ?? ''))

// Where the fixed file goes in a pull request: assets/<slug>/<fileName>
const { airlines } = useAirlines()
const repoPath = computed(() => {
  if (!props.airlineName) return null
  const slug =
    airlines.find((a) => a.name === props.airlineName)?.slug ??
    airlineSlug(props.airlineName)
  return `assets/${slug}/${props.fileName}`
})

// A missing <title> is added with the airline's name, so one is needed
const needsName = computed(() => !props.hasTitle && !props.airlineName)

// What the fix reported, a repeated line (one per path) shown once
const fixedList = computed(() => {
  const counts = new Map()
  for (const issue of result.value?.issues ?? [])
    counts.set(issue, (counts.get(issue) ?? 0) + 1)
  return [...counts].map(([text, count]) => ({ text, count }))
})

function fix() {
  props.state.fix({
    fileName: props.fileName,
    type: props.type,
    fillColor:
      props.needsColor && validColor.value
        ? fillColor.value.toLowerCase()
        : undefined,
    airlineName: props.airlineName ?? undefined,
    isCatalogName: props.isCatalogName,
  })
}
</script>
