<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader
      :title="meta.title"
      :description="meta.description"
      :links="[
        {
          label: 'Brand repository',
          icon: 'simple-icons:github',
          to: BRAND_REPO_URL,
          target: '_blank',
          ui: { label: 'block' },
        },
      ]"
    />

    <UPageSection
      id="logos"
      title="Logos"
      description="Two split-flap tiles reading SS, like a departure board, beside the name or above it. Each comes in color, in one color, and for dark backgrounds."
      :ui="logosUi"
    >
      <template #links>
        <UTooltip :text="`${files.length} files in one zip`">
          <UButton
            label="Download all"
            icon="solar:download-square-linear"
            variant="subtle"
            :loading="busy"
            :ui="{ label: 'block' }"
            @click="downloadAll"
          />
        </UTooltip>
      </template>

      <div class="flex flex-col gap-3">
        <div
          class="hidden gap-6 text-sm font-semibold text-muted lg:grid lg:grid-cols-[10rem_repeat(3,minmax(0,1fr))]"
          aria-hidden="true"
        >
          <span />
          <span v-for="kind in KINDS" :key="kind">
            {{ BRAND_KIND_LABELS[kind] }}
          </span>
        </div>

        <div class="flex flex-col gap-10 lg:gap-6">
          <section
            v-for="row in brandRows"
            :key="row.id"
            class="grid gap-4 sm:grid-cols-3 lg:grid-cols-[10rem_repeat(3,minmax(0,1fr))] lg:gap-6"
          >
            <div class="sm:col-span-3 lg:col-span-1 lg:pt-2">
              <h3 class="font-bold text-highlighted">{{ row.label }}</h3>
              <p class="mt-1 text-sm text-pretty text-muted">
                {{ row.description }}
              </p>
            </div>

            <div
              v-for="kind in KINDS"
              :key="kind"
              class="flex flex-col gap-4 rounded-xl bg-surface p-4"
            >
              <!-- As on an airline's page: the dark file on a dark ground in
                   either theme, the others on the light ground they are drawn
                   for, a logo's tile taller than the icon's -->
              <div
                class="flex items-center justify-center overflow-hidden rounded-lg p-6"
                :class="[
                  kind === 'dark' ? 'bg-tile-dark' : 'bg-tile',
                  row.id.startsWith('logo') ? 'aspect-[4/3]' : 'aspect-[5/2]',
                ]"
              >
                <img
                  :src="fileUrl(row.files[kind])"
                  :alt="`Soaring Symbols ${row.label.toLowerCase()} ${BRAND_KIND_LABELS[kind].toLowerCase()}`"
                  loading="lazy"
                  class="size-full object-contain"
                />
              </div>

              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-semibold text-highlighted lg:sr-only">
                    {{ BRAND_KIND_LABELS[kind] }}
                  </p>
                  <p class="truncate font-mono text-xs text-muted">
                    {{ row.files[kind] }}
                  </p>
                </div>
                <UButton
                  :to="fileUrl(row.files[kind])"
                  external
                  :download="`soaring-symbols-${row.files[kind]}`"
                  icon="solar:download-linear"
                  variant="outline"
                  :aria-label="`Download ${row.files[kind]}`"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </UPageSection>

    <UPageSection
      id="colors"
      title="Colors"
      description="Signal yellow is the one accent; the rest are the board and its flaps."
      :ui="sectionUi"
    >
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="color in brandColors"
          :key="color.hex"
          class="flex items-center gap-4 rounded-xl bg-surface p-4"
        >
          <span
            class="size-14 shrink-0 rounded-lg"
            :class="color.light && 'ring-1 ring-default ring-inset'"
            :style="{ backgroundColor: color.hex }"
          />
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-highlighted">{{ color.name }}</p>
            <p class="text-sm text-pretty text-muted">{{ color.use }}</p>
          </div>
          <UButton
            :label="color.hex"
            variant="ghost"
            color="neutral"
            class="font-mono"
            :aria-label="`Copy ${color.name}, ${color.hex}`"
            @click="copyHex(color)"
          />
        </li>
      </ul>
    </UPageSection>

    <UPageSection id="typeface" title="Typeface" :ui="sectionUi">
      <template #description>
        The name is set in
        <ULink
          to="https://fonts.google.com/specimen/Overpass"
          target="_blank"
          class="font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
          >Overpass</ULink
        >
        ExtraBold, which descends from Highway Gothic, the lettering of road and
        airport signs. The logos carry it as outlines, so they need no font.
      </template>

      <div class="rounded-xl bg-surface p-6 sm:p-8">
        <p
          class="text-4xl font-extrabold tracking-tight text-highlighted sm:text-6xl"
        >
          Soaring Symbols
        </p>
        <p class="mt-4 text-lg text-muted">
          ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz · 0123456789
        </p>
      </div>
    </UPageSection>

    <UPageSection id="usage" title="Using the mark" :ui="sectionUi">
      <template #description>
        All rights to the Soaring Symbols name and mark are reserved. You may
        show them unchanged to refer or link to the project and its
        integrations, in an article, a talk or a list of tools.
      </template>

      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="list in USAGE"
          :key="list.title"
          class="rounded-xl bg-surface p-6"
        >
          <h3 class="flex items-center gap-2 font-bold text-highlighted">
            <UIcon :name="list.icon" class="size-5" :class="list.iconClass" />
            <span class="cap-center">{{ list.title }}</span>
          </h3>
          <ul class="mt-4 flex flex-col gap-2 text-sm text-muted">
            <li v-for="item in list.items" :key="item" class="text-pretty">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <p class="text-sm text-pretty text-muted">
        This page covers the project's own mark. The airline logos in the
        collection belong to their airlines; read the
        <ULink
          :to="DISCLAIMER_URL"
          target="_blank"
          class="underline underline-offset-2 hover:text-highlighted"
          >disclaimer</ULink
        >
        before using them.
      </p>
    </UPageSection>
  </div>
</template>

<script setup>
import {
  BRAND_KIND_LABELS,
  BRAND_REPO_URL,
  brandColors,
  brandRows,
} from '~/data/brand'

const meta = {
  title: 'Brand',
  description:
    'The Soaring Symbols logos, colors and typeface, for articles, talks and links to the project.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

defineOgImage('Site', { title: meta.title, description: meta.description })

const KINDS = ['color', 'mono', 'dark']

const toast = useToast()

const fileUrl = (file) => `/brand/${file}`

const sectionUi = { container: 'px-0 sm:px-0 lg:px-0 py-12 sm:py-16 lg:py-16' }

// As the Files section of an airline's page: Download all on the title's
// line, at the right, and after the description on a phone
const logosUi = {
  ...sectionUi,
  wrapper: 'relative',
  title: 'sm:pe-56',
  footer: 'mt-5 sm:absolute sm:end-0 sm:top-0 sm:mt-0',
  links: 'justify-start',
}

const files = brandRows.flatMap((row) => KINDS.map((kind) => row.files[kind]))

const busy = ref(false)

// The files in one zip, laid out as soaring-symbols-brand/<file>
async function downloadAll() {
  busy.value = true

  try {
    // Loaded on the first click: no other part of the page needs it
    const [{ zipSync, strToU8 }, contents] = await Promise.all([
      import('fflate'),
      Promise.all(
        files.map(async (file) => {
          const response = await fetch(fileUrl(file))
          if (!response.ok) throw new Error(`${file}: ${response.status}`)

          return response.text()
        }),
      ),
    ])

    const zip = zipSync(
      Object.fromEntries(
        files.map((file, i) => [
          `soaring-symbols-brand/${file}`,
          strToU8(contents[i]),
        ]),
      ),
    )

    const link = document.createElement('a')
    link.href = URL.createObjectURL(
      new Blob([zip], { type: 'application/zip' }),
    )
    link.download = 'soaring-symbols-brand.zip'
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    toast.add({ title: 'The download failed', color: 'error' })
  } finally {
    busy.value = false
  }
}

const USAGE = [
  {
    title: 'Do',
    icon: 'solar:check-circle-linear',
    iconClass: 'text-success',
    items: [
      'Use the files as they are, the color logo on light backgrounds and the dark one on dark.',
      'Use the monochrome logo where only one color prints, in black or white.',
      'Leave clear space around the mark, at least the width of one tile.',
      'Link the logo to soaringsymbols.org or the GitHub repository.',
    ],
  },
  {
    title: "Don't",
    icon: 'solar:close-circle-linear',
    iconClass: 'text-error',
    items: [
      'Recolor, stretch, rotate or redraw the mark, or add effects to it.',
      'Set the name in another typeface, or rearrange the mark and the name.',
      'Use the mark in your own product or logo, or to suggest the project endorses you.',
      'Put the color logo on a busy photo or a dark background.',
    ],
  },
]

const copy = useCopy()

async function copyHex(color) {
  if (!(await copy(color.hex))) return
  toast.add({ title: `Copied ${color.name}, ${color.hex}`, duration: 1500 })
}
</script>
