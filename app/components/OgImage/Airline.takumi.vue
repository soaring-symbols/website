<script setup lang="ts">
// Social card for an airline page: its logo on a wash of its own color,
// beside its name and codes. Rendered once per airline at build time.
const {
  name = 'Vietnam Airlines',
  codes = ['VN', 'HVN'],
  country = 'Vietnam',
  logo = '/airlines/vietnam-airlines/logo.svg',
  color = '#d99e09',
} = defineProps<{
  name?: string
  codes?: string[]
  country?: string
  logo?: string
  color?: string
}>()
</script>

<template>
  <div
    class="flex h-full w-full font-sans flex-row items-stretch"
    :style="{ backgroundColor: '#1f242b', color: '#ecebe4' }"
  >
    <div
      class="flex w-[560px] items-center justify-center p-16"
      :style="{ backgroundColor: '#ffffff' }"
    >
      <div
        class="flex h-full w-full items-center justify-center rounded-3xl p-10"
        :style="{ backgroundColor: `${color}1f` }"
      >
        <img :src="logo" width="360" height="360" class="h-[360px] w-[360px]" />
      </div>
    </div>

    <div class="flex flex-1 flex-col justify-between p-16">
      <div class="flex flex-row items-center">
        <div
          class="h-6 w-6 rounded-full"
          :style="{ backgroundColor: '#ffc20e' }"
        />
        <span class="ml-4 text-3xl font-bold">Soaring Symbols</span>
      </div>

      <div class="flex flex-col">
        <span class="text-7xl leading-tight font-extrabold">{{ name }}</span>
        <div
          class="mt-6 flex flex-row items-center text-4xl"
          :style="{ color: '#ecebe4b3' }"
        >
          <template v-for="(code, i) in codes" :key="code">
            <div
              v-if="i > 0"
              class="mx-5 h-2 w-2 rounded-full"
              :style="{ backgroundColor: '#ecebe4b3' }"
            />
            <span>{{ code }}</span>
          </template>
        </div>
        <span class="mt-2 text-4xl" :style="{ color: '#ecebe4b3' }">
          {{ country }}
        </span>
      </div>

      <div class="flex flex-row">
        <div
          class="h-3 w-40 rounded-full"
          :style="{ backgroundColor: color }"
        />
      </div>
    </div>
  </div>
</template>
