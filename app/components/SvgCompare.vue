<template>
  <div class="flex flex-col gap-4">
    <UCard>
      <div class="flex flex-wrap items-center gap-3">
        <p class="text-sm text-muted">
          Upload two versions of an asset, e.g. before and after optimizing, or
          a PNG reference and its vectorized SVG, to check that they still look
          the same.
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
      <CompareSide label="Before" :image="before" />
      <CompareSide label="After" color="primary" :image="after" />
    </div>

    <CompareResult
      v-if="before.ready.value && after.ready.value"
      :before="before"
      :after="after"
    />
  </div>
</template>

<script setup>
const before = useImageFile()
const after = useImageFile()

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
