<template>
  <UTable
    :data="airlines"
    :columns="columns"
    class="rounded-xl bg-surface"
    :ui="{ tr: 'cursor-pointer', td: 'py-3' }"
    @select="(_, row) => $emit('open', row.original)"
  >
    <template #name-cell="{ row }">
      <div class="flex items-center gap-3">
        <div class="grid size-9 shrink-0 place-items-center">
          <img
            v-if="hasAsset(row.original, 'icon')"
            :src="assetUrl(row.original, 'icon')"
            alt=""
            loading="lazy"
            class="size-8 object-contain"
          />
        </div>
        <div class="min-w-0">
          <button
            type="button"
            class="cursor-pointer font-bold text-highlighted hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            @click.stop="$emit('open', row.original)"
          >
            {{ row.original.name }}
          </button>
          <p v-if="row.original.website" class="text-xs text-muted">
            {{ cleanUrl(row.original.website) }}
          </p>
        </div>
      </div>
    </template>

    <template #iata-cell="{ row }">
      <FlapText :text="row.original.iata ?? ''" :length="2" class="code" />
    </template>
  </UTable>
</template>

<script setup>
defineProps({
  airlines: { type: Array, required: true },
})

defineEmits(['open'])

const columns = [
  { accessorKey: 'iata', header: 'IATA' },
  { accessorKey: 'name', header: 'Airline' },
  { accessorKey: 'icao', header: 'ICAO' },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ row }) =>
      `${countryFlag(row.original.country)} ${countryName(row.original.country)}`,
  },
  {
    accessorKey: 'alliance',
    header: 'Alliance',
    cell: ({ row }) => row.original.alliance ?? '',
  },
]
</script>

<style scoped>
.code {
  --flap: 1rem;
}
</style>
