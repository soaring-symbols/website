<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-semibold">SVG Checker</span>
        <USelect v-model="type" :items="typeOptions" class="w-32" />
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <UFileUpload
        v-model="file"
        accept="image/svg+xml,.svg"
        icon="hugeicons:upload-04"
        label="Drop SVG here or click to upload"
        :description="`Expected viewBox: 0 0 ${expectedSize} ${expectedSize}`"
        :preview="false"
        class="w-full"
      />

      <!-- Preview + results side by side -->
      <div v-if="checks.length" class="grid grid-cols-2 gap-6">
        <!-- Preview -->
        <div
          class="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-8 min-h-40"
        >
          <NuxtImg
            v-if="file"
            :src="previewUrl"
            :alt="type + ' preview'"
            class="object-contain w-full h-auto"
          />
        </div>

        <!-- Checks -->
        <div class="flex flex-col gap-3">
          <ul class="flex flex-col gap-2">
            <li
              v-for="check in checks"
              :key="check.label"
              class="flex items-start gap-2 text-sm"
            >
              <UIcon
                :name="
                  check.pass
                    ? 'hugeicons:checkmark-circle-02'
                    : 'hugeicons:cancel-circle'
                "
                class="size-4 mt-0.5 shrink-0"
                :class="check.pass ? 'text-green-500' : 'text-red-500'"
              />
              <div>
                <span class="font-medium">{{ check.label }}</span>
                <span class="block text-gray-400 font-mono text-xs mt-0.5">{{
                  check.detail
                }}</span>
              </div>
            </li>
          </ul>

          <UBadge
            :color="allPass ? 'success' : 'error'"
            variant="subtle"
            class="self-start mt-auto"
          >
            {{
              allPass
                ? 'All checks passed'
                : `${failCount} check${failCount > 1 ? 's' : ''} failed`
            }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const typeOptions = [
  { label: 'Logo', value: 'logo' },
  { label: 'Icon', value: 'icon' },
]

const type = ref('logo')
const expectedSize = computed(() => (type.value === 'logo' ? '64' : '24'))

const file = ref(null)
const svgContent = ref(null)
const svgBBox = ref(null)
const previewUrl = ref(null)

watch(type, () => {
  file.value = null
  svgContent.value = null
  svgBBox.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
})

watch(file, (newFile, oldFile) => {
  if (oldFile) URL.revokeObjectURL(previewUrl.value)
  if (!newFile) {
    svgContent.value = null
    svgBBox.value = null
    previewUrl.value = null
    return
  }
  previewUrl.value = URL.createObjectURL(newFile)
  const reader = new FileReader()
  reader.onload = (e) => {
    svgContent.value = e.target.result
  }
  reader.readAsText(newFile)
})

watch(svgContent, async () => {
  svgBBox.value = null
  if (!svgContent.value || !import.meta.client) return
  await nextTick()
  if (!parsedSvg.value) return
  svgBBox.value = computeSvgBBox(parsedSvg.value)
})

const parsedSvg = computed(() => {
  if (!svgContent.value || !import.meta.client) return null
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')
  return doc.querySelector('svg')
})

const checks = computed(() => {
  if (!parsedSvg.value) return []
  return runSvgValidations(parsedSvg.value, type.value, svgBBox.value)
})

const allPass = computed(() => checks.value.every((c) => c.pass))
const failCount = computed(() => checks.value.filter((c) => !c.pass).length)
</script>
