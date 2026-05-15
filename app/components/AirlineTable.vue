<template>
  <UTable :data="airlines" :columns="columns">
    <template #name-cell="{ row }">
      <UUser
        :name="row.original.name"
        :description="cleanUrl(row.original.website)"
        size="xl"
      >
        <template #avatar>
          <div class="rounded-lg aspect-square h-8 w-8">
            <img
              :src="`/airlines/${row.original.slug}/icon.svg`"
              :alt="`${row.original.name} Icon`"
              class="h-8 w-8"
              @error="$event.target.style.display = 'none'"
            />
          </div>
        </template>
      </UUser>
    </template>

    <template #alliance-cell="{ row }">
      <UBadge v-if="row.original.alliance">
        {{ row.original.alliance }}
      </UBadge>
    </template>
  </UTable>
</template>

<script setup>
defineProps({
  airlines: {
    type: Array,
    required: true,
  },
})

const columns = [
  {
    accessorKey: 'name',
    header: 'Airline',
  },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ row }) =>
      `${countryFlag(row.original.country)} ${countryName(row.original.country)}`,
  },
  {
    accessorKey: 'iata',
    header: 'IATA',
  },
  {
    accessorKey: 'icao',
    header: 'ICAO',
  },
  {
    accessorKey: 'alliance',
    header: 'Alliance',
  },
]

function cleanUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
</script>
