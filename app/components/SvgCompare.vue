<template>
  <div class="flex flex-col gap-4">
    <UCard>
      <div class="flex flex-wrap items-center gap-3">
        <p class="text-sm text-muted">
          Upload two versions of an SVG, e.g. before and after optimizing, to
          check that they still render the same.
        </p>

        <div class="flex items-center gap-2 ms-auto">
          <UButton
            label="Swap"
            icon="hugeicons:arrow-data-transfer-horizontal"
            :disabled="!before.file.value && !after.file.value"
            @click="swap"
          />
          <UButton
            label="Clear"
            icon="hugeicons:delete-02"
            :disabled="!before.file.value && !after.file.value"
            @click="clear"
          />
        </div>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <CompareSide label="Before" :svg="before" />
      <CompareSide label="After" color="primary" :svg="after" />
    </div>

    <CompareResult
      v-if="before.content.value && after.content.value"
      :before="before"
      :after="after"
    />
  </div>
</template>

<script setup>
const before = useSvgFile()
const after = useSvgFile()

function swap() {
  const file = before.file.value
  before.file.value = after.file.value
  after.file.value = file
}

function clear() {
  before.file.value = null
  after.file.value = null
}
</script>
