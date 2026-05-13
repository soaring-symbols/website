<template>
  <UPage>
    <template #left>
      <UPageAside>
        <div class="flex flex-col gap-6">
          <!-- Search -->
          <UInput
            v-model="search"
            placeholder="Search airlines..."
            icon="hugeicons:search-01"
            size="md"
          />

          <!-- Flag Carrier filter -->
          <UCheckbox
            v-model="flagCarrierOnly"
            label="Flag Carriers only"
          />

          <!-- Alliance filter -->
          <div class="flex flex-col gap-2">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">Alliance</p>
            <div class="flex flex-col gap-2">
              <UCheckbox
                v-for="alliance in allianceOptions"
                :key="alliance.value"
                :label="alliance.label"
                :model-value="selectedAlliances.includes(alliance.value)"
                @update:model-value="(v) => toggleAlliance(alliance.value, v)"
              />
            </div>
          </div>

          <!-- Reset -->
          <UButton
            v-if="search || selectedAlliances.length || flagCarrierOnly"
            label="Reset filters"
            variant="ghost"
            color="neutral"
            icon="hugeicons:cancel-01"
            size="sm"
            @click="resetFilters"
          />
        </div>
      </UPageAside>
    </template>

    <!-- Results -->
    <div class="flex flex-col gap-6 py-6">
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ filtered.length }} of {{ total }} airlines
        </p>
      </div>

      <div v-if="filtered.length" class="flex flex-col">
        <AirlineCard
          v-for="airline in filtered"
          :key="airline.slug"
          :airline="airline"
        />
      </div>

      <div v-else class="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <UIcon name="hugeicons:airplane-mode" class="size-12" />
        <p class="text-sm">No airlines found</p>
      </div>
    </div>
  </UPage>
</template>

<script setup>
import airlinesData from '#airlines-data'

const airlines = airlinesData

const search = ref('')
const selectedAlliances = ref([])
const flagCarrierOnly = ref(false)

const allianceOptions = [
  ...[...new Set(airlines.map((a) => a.alliance).filter(Boolean))].sort().map((a) => ({ value: a, label: a })),
  { value: '__none__', label: 'No Alliance' },
]
const total = airlines.length

const filtered = computed(() => {
  let list = airlines

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.iata?.toLowerCase().includes(q) ||
        a.icao?.toLowerCase().includes(q),
    )
  }

  if (flagCarrierOnly.value) {
    list = list.filter((a) => a.flag_carrier)
  }

  if (selectedAlliances.value.length) {
    list = list.filter((a) =>
      selectedAlliances.value.includes(a.alliance ?? '__none__')
    )
  }

  return list
})

function toggleAlliance(alliance, checked) {
  if (checked) {
    selectedAlliances.value = [...selectedAlliances.value, alliance]
  } else {
    selectedAlliances.value = selectedAlliances.value.filter((a) => a !== alliance)
  }
}

function resetFilters() {
  search.value = ''
  selectedAlliances.value = []
  flagCarrierOnly.value = false
}
</script>
