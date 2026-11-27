<template>
  <!-- One row per mark of an airline or an alliance: its color file, its
       monochrome one and the one for dark backgrounds, side by side, so every
       row is full whichever marks it has -->
  <div class="flex flex-col gap-3">
    <div
      class="hidden gap-6 text-sm font-semibold text-muted lg:grid lg:grid-cols-[8rem_repeat(3,minmax(0,1fr))]"
      aria-hidden="true"
    >
      <span />
      <span>Color</span>
      <span>Monochrome</span>
      <span>Dark background</span>
    </div>

    <div class="flex flex-col gap-10 lg:gap-6">
      <section
        v-for="row in rows"
        :key="row.variant"
        class="grid gap-4 sm:grid-cols-3 lg:grid-cols-[8rem_repeat(3,minmax(0,1fr))] lg:gap-6"
      >
        <component
          :is="mark ? 'h4' : 'h3'"
          class="font-bold text-highlighted sm:col-span-3 lg:col-span-1 lg:pt-2"
        >
          {{ row.label }}
        </component>

        <template v-for="file in row.files" :key="file.kind">
          <div
            v-if="file.variant"
            class="flex flex-col gap-4 rounded-xl bg-surface p-4"
          >
            <!-- The dark file on a dark ground in either theme, the others
                 on the light ground they are drawn for. A logo, wide or
                 stacked, is a name in a square viewBox, so its tile is
                 taller than an icon's to let the name read -->
            <div
              class="relative flex items-center justify-center overflow-hidden rounded-lg p-6"
              :class="[
                file.kind === 'dark' ? 'bg-tile-dark' : 'bg-tile',
                row.variant.startsWith('logo')
                  ? 'aspect-[4/3]'
                  : 'aspect-[5/2]',
              ]"
              :style="{ backgroundImage: tint }"
            >
              <img
                :src="previewSrc(file.variant)"
                :alt="`${entry.name} ${file.kind} ${row.label.toLowerCase()}${mark ? ` introduced in ${mark.since}` : ''}`"
                loading="lazy"
                class="size-full object-contain"
              />

              <!-- A monochrome file in any color, from the corner of its
                   preview: the preview, the copies and the downloads all
                   take it -->
              <UPopover v-if="file.kind === 'mono'" :content="{ align: 'end' }">
                <!-- A palette until a color is picked, then that color -->
                <UButton
                  :icon="
                    colorOf(file.variant) ? undefined : 'solar:pallete-2-linear'
                  "
                  variant="outline"
                  size="sm"
                  square
                  class="absolute top-2 right-2"
                  :aria-label="`Pick a color for ${fileName(file.variant)}`"
                >
                  <template v-if="colorOf(file.variant)" #leading>
                    <span
                      class="m-0.5 size-4 shrink-0 rounded-full ring ring-default"
                      :style="{ background: colorOf(file.variant) }"
                    />
                  </template>
                </UButton>

                <template #content>
                  <div class="flex w-56 flex-col gap-3 p-3">
                    <UColorPicker
                      :model-value="pickerColor(file.variant)"
                      class="mx-auto"
                      @update:model-value="pick(file.variant, $event)"
                    />
                    <UInput
                      :model-value="colors[file.variant] ?? ''"
                      placeholder="currentColor"
                      class="font-mono"
                      aria-label="Hex color"
                      @update:model-value="setColor(file.variant, $event)"
                    />
                    <div class="flex gap-2">
                      <UButton
                        label="Brand color"
                        size="sm"
                        variant="subtle"
                        class="flex-1 justify-center"
                        :ui="{ label: 'block' }"
                        @click="setColor(file.variant, brandColor(entry))"
                      />
                      <UButton
                        label="currentColor"
                        size="sm"
                        variant="ghost"
                        class="flex-1 justify-center"
                        :ui="{ label: 'block' }"
                        :disabled="!colorOf(file.variant)"
                        @click="setColor(file.variant, '')"
                      />
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>

            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-highlighted lg:sr-only">
                  {{ KIND_LABELS[file.kind] }}
                </p>
                <p class="truncate font-mono text-xs text-muted">
                  {{ fileName(file.variant) }}
                </p>
              </div>
              <div class="flex shrink-0 gap-1">
                <!-- The SVG in one click, every other way in the menu -->
                <UFieldGroup>
                  <UButton
                    :to="downloadHref(file.variant)"
                    external
                    :download="svgName(file.variant)"
                    label="SVG"
                    icon="solar:download-minimalistic-linear"
                    variant="subtle"
                    :ui="{ label: 'block' }"
                    :aria-label="`Download ${fileName(file.variant)}`"
                  />
                  <!-- The chevron turns while the menu is open -->
                  <UDropdownMenu
                    :items="menuItems(file.variant)"
                    :content="{ align: 'end' }"
                  >
                    <UButton
                      icon="solar:alt-arrow-down-linear"
                      variant="subtle"
                      square
                      :ui="{
                        leadingIcon:
                          'transition-transform duration-200 [[data-state=open]>&]:rotate-180',
                      }"
                      :aria-label="`More ways to get ${fileName(file.variant)}`"
                    />
                  </UDropdownMenu>
                </UFieldGroup>
              </div>
            </div>
          </div>

          <!-- A missing file, or the whole mark, asks for a contribution -->
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-accented p-6 text-center text-sm text-muted"
            :class="file.kind === 'none' && 'min-h-40 sm:col-span-3'"
          >
            <p>{{ file.missing }}</p>
            <ULink
              :to="CONTRIBUTING_URL"
              target="_blank"
              class="font-semibold text-highlighted underline decoration-accented underline-offset-4 hover:decoration-current"
            >
              Contribute one
            </ULink>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
// The files of one set of marks of an airline or, with `source`
// 'alliances', an alliance: its current ones, or with `mark` (an entry of
// markHistory()) an older set, headed by its year
const props = defineProps({
  entry: { type: Object, required: true },
  source: { type: String, default: 'airlines' },
  mark: { type: Object, default: undefined },
})

const tint = brandTint(props.entry)

const KIND_LABELS = {
  color: 'Color',
  mono: 'Monochrome',
  dark: 'Dark background',
}
const { types, asked } = MARK_SOURCES[props.source]

// The mark types the source asks for always get a row, so each page lists
// the same rows and asks for what is missing; the others, and every type of
// an older set, only when there is a file. A slot is empty (variant null)
// when that file is not shipped yet.
const rows = types.flatMap(({ variant, label }) => {
  const name = label.toLowerCase()
  const has = (v) => hasAsset(props.entry, v, props.mark)
  const color = has(variant) ? variant : null
  const mono = has(`${variant}-mono`) ? `${variant}-mono` : null
  const dark = has(`${variant}-dark`) ? `${variant}-dark` : null

  if (!color && !mono) {
    // With neither file, one placeholder spans the row
    return props.mark || !asked.includes(variant)
      ? []
      : [
          {
            variant,
            label,
            files: [
              { kind: 'none', variant: null, missing: `No ${name} yet.` },
            ],
          },
        ]
  }

  return [
    {
      variant,
      label,
      files: [
        { kind: 'color', variant: color, missing: `No color ${name} yet.` },
        { kind: 'mono', variant: mono, missing: `No monochrome ${name} yet.` },
        {
          kind: 'dark',
          variant: dark,
          // The package makes one from a monochrome file
          missing: `No ${name} for dark backgrounds yet: it needs a monochrome ${name}.`,
        },
      ],
    },
  ]
})

// The path under the entry's folder, e.g. 'history/1984/logo.svg'
function fileName(variant) {
  return assetPath(props.entry, variant, props.mark).slice(
    props.entry.slug.length + 1,
  )
}

const toast = useToast()

const { copy } = useCopy()

// The color picked for each monochrome file, as typed: only a full hex
// color applies
const colors = reactive({})

function colorOf(variant) {
  const value = colors[variant]
  return /^#[0-9a-f]{6}$/i.test(value ?? '') ? value.toLowerCase() : undefined
}

function setColor(variant, value) {
  colors[variant] = value?.toLowerCase() ?? ''
  // The preview keeps the file as is if the fetch fails
  if (colorOf(variant)) loadSource(variant).catch(() => {})
}

// Without a color the picker shows black, as the <img> draws currentColor.
// It sends back the value it is given whenever that changes, so a black
// it was shown, not picked, leaves the file in currentColor
function pickerColor(variant) {
  return colorOf(variant) ?? '#000000'
}

function pick(variant, value) {
  if (value?.toLowerCase() !== pickerColor(variant)) setColor(variant, value)
}

// Each file's source, fetched the first time something needs it
const sources = reactive({})
// A failed fetch is forgotten, so the next try fetches again
const pending = new Map()

function loadSource(variant) {
  if (!pending.has(variant)) {
    const url = assetUrl(props.entry, variant, props.mark, props.source)
    pending.set(
      variant,
      $fetch(url, { responseType: 'text' })
        .then((svg) => (sources[variant] = svg))
        .catch((error) => {
          pending.delete(variant)
          throw error
        }),
    )
  }

  return pending.get(variant)
}

// The file as it is, or in the color picked for it
async function svgOf(variant) {
  return tintSvg(await loadSource(variant), colorOf(variant))
}

// A picked color shows once the source is in; until then, the file as is
function tinted(variant) {
  const color = colorOf(variant)
  return color && sources[variant]
    ? svgToDataUri(tintSvg(sources[variant], color))
    : undefined
}

function previewSrc(variant) {
  return (
    tinted(variant) ?? assetUrl(props.entry, variant, props.mark, props.source)
  )
}

function downloadHref(variant) {
  return (
    tinted(variant) ?? assetUrl(props.entry, variant, props.mark, props.source)
  )
}

// 'korean-air-icon-mono.svg', or with a color 'korean-air-icon-mono-c8102e.svg'
function nameOf(variant, extension) {
  const color = colorOf(variant)?.slice(1)
  return downloadName(props.entry, variant, props.mark).replace(
    /\.svg$/,
    `${color ? `-${color}` : ''}.${extension}`,
  )
}

function svgName(variant) {
  return nameOf(variant, 'svg')
}

const PNG_WIDTHS = [64, 128, 256, 512, 1024]

function menuItems(variant) {
  return [
    [
      {
        label: 'Copy SVG',
        icon: 'solar:code-linear',
        onSelect: () => copySource(variant, (svg) => svg, 'the SVG'),
      },
      {
        label: 'Copy JSX',
        icon: 'solar:code-square-linear',
        onSelect: () => copySource(variant, svgToJsx, 'the JSX'),
      },
      {
        label: 'Copy data URI',
        icon: 'solar:paperclip-linear',
        onSelect: () => copySource(variant, svgToDataUri, 'the data URI'),
      },
      {
        // jsDelivr serves the file as shipped, without a picked color
        label: 'Copy CDN link',
        icon: 'solar:link-linear',
        onSelect: () => copyCdnUrl(variant),
      },
    ],
    [
      {
        label: 'Download PNG',
        icon: 'solar:gallery-download-linear',
        children: PNG_WIDTHS.map((width) => ({
          label: `${width} px`,
          onSelect: () => downloadPng(variant, width),
        })),
      },
    ],
  ]
}

function failed(title) {
  toast.add({
    title,
    description: 'Check your connection and try again.',
    color: 'error',
    icon: 'solar:danger-triangle-linear',
  })
}

async function copySource(variant, format, what) {
  let text
  try {
    text = format(await svgOf(variant))
  } catch {
    return failed('Couldn’t load the file')
  }
  if (await copy(text)) {
    toast.add({ title: `Copied ${what}`, duration: 1500 })
  }
}

async function downloadPng(variant, width) {
  try {
    saveBlob(
      await svgToPng(await svgOf(variant), width),
      nameOf(variant, 'png'),
    )
  } catch {
    failed('Couldn’t make the PNG')
  }
}

async function copyCdnUrl(variant) {
  if (!(await copy(cdnUrl(props.entry, variant, props.mark, props.source)))) {
    return
  }
  toast.add({ title: 'Copied the CDN link', duration: 1500 })
}
</script>
