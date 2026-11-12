import type { Airline } from 'soaring-symbols'
import type { MaybeRefOrGetter } from 'vue'

// Colors shown before the rest are asked for: gradient-heavy logos list
// dozens of stops
const COLOR_LIMIT = 6
// Former names and codes shown beside the airline; the rest are a link away
const FORMER_LIMIT = 2

// What an airline's profile shows beyond its own fields, shared by the
// Browse slideover's spotlight and the hero on the airline's page: its
// former identities, the airlines it relates to, and its brand colors
export function useAirlineProfile(source: MaybeRefOrGetter<Airline>) {
  const airline = computed(() => toValue(source))
  const toast = useToast()
  const route = useRoute()

  // One label per former identity: its name, or the codes that changed when
  // the name stayed, e.g. ['HAL / HAWAIIAN', 'HA'] for Hawaiian Airlines
  const allFormer = computed(() =>
    formerIdentities(airline.value).map(
      ({ name, iata, icao, callsign }) =>
        name ?? [iata, icao, callsign].filter(Boolean).join(' / '),
    ),
  )
  // The latest ones, newest first; the table on the airline's page lists
  // them all, and formerMore says how many more it holds
  const former = computed(() => allFormer.value.slice(-FORMER_LIMIT).reverse())
  const formerMore = computed(
    () => allFormer.value.length - former.value.length,
  )

  // The table of former names and codes sits on the airline's page, at the
  // canonical URL with its trailing slash, so the link never goes through a
  // redirect. Already on that page, it scrolls there smoothly instead of
  // navigating, and only updates the hash.
  const formerLink = computed(() => `/airlines/${airline.value.slug}/#former`)

  function scrollToFormer(event: MouseEvent) {
    const onOwnPage = route.params.slug === airline.value.slug
    const table = onOwnPage && document.getElementById('former')
    if (!table) return
    event.preventDefault()
    table.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(history.state, '', '#former')
  }

  // Links to other airlines, one row per relation it has
  const related = computed(() => {
    const parent = airlineBySlug(airline.value.parent)
    const successor = successorOf(airline.value)

    return [
      { label: 'Part of', airlines: parent ? [parent] : [] },
      { label: 'Subsidiaries', airlines: subsidiariesOf(airline.value) },
      {
        label: 'Former subsidiaries',
        airlines: subsidiariesOf(airline.value, { defunct: true }),
      },
      { label: 'Succeeded by', airlines: successor ? [successor] : [] },
      { label: 'Preceded by', airlines: predecessorsOf(airline.value) },
    ].filter((row) => row.airlines.length)
  })

  const colors = computed(() => {
    const { logo, icon } = airline.value.assets

    return [...new Set([...(logo?.colors ?? []), ...(icon?.colors ?? [])])]
  })

  const showAllColors = ref(false)
  watch(
    () => airline.value.slug,
    () => (showAllColors.value = false),
  )
  const shownColors = computed(() =>
    showAllColors.value ? colors.value : colors.value.slice(0, COLOR_LIMIT),
  )
  const hiddenCount = computed(
    () => colors.value.length - shownColors.value.length,
  )

  async function copyColor(color: string) {
    await navigator.clipboard.writeText(color)
    toast.add({ title: `Copied ${color.toUpperCase()}`, duration: 1500 })
  }

  return {
    former,
    formerMore,
    formerLink,
    scrollToFormer,
    related,
    colors,
    shownColors,
    hiddenCount,
    showAllColors,
    copyColor,
    COLOR_LIMIT,
  }
}
