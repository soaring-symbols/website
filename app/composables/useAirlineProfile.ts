import type { Airline } from 'soaring-symbols'
import type { MaybeRefOrGetter } from 'vue'

// Colors shown before the rest are asked for: gradient-heavy logos list
// dozens of stops
const COLOR_LIMIT = 6

// What an airline's profile shows beyond its own fields, shared by the
// Browse slideover's spotlight and the hero on the airline's page: a
// summary of its history, the airlines it relates to, and its brand colors
export function useAirlineProfile(source: MaybeRefOrGetter<Airline>) {
  const airline = computed(() => toValue(source))
  const toast = useToast()
  const route = useRoute()

  // What it was before, in a few words for a link to the History section
  // on its page, e.g. '3 earlier names · 2 alliances' for LATAM Airlines
  // Brasil; '' when it has none. A former item without a name is a change
  // of codes alone (Hawaiian Airlines).
  const historySummary = computed(() => {
    const items = formerIdentities(airline.value)
    const names = items.filter((item) => item.name).length
    const plural = (n: number, word: string) =>
      n ? `${n} ${word}${n > 1 ? 's' : ''}` : ''

    return [
      plural(names, 'earlier name'),
      plural(items.length - names, 'code change'),
      plural(airline.value.alliance_history?.length ?? 0, 'alliance'),
      plural(markHistory(airline.value).length, 'earlier logo'),
    ]
      .filter(Boolean)
      .join(' · ')
  })

  // The History section sits on the airline's page, at the canonical URL
  // with its trailing slash, so the link never goes through a redirect.
  // Already on that page, it scrolls there smoothly instead of navigating,
  // and only updates the hash.
  const historyLink = computed(() => `/airlines/${airline.value.slug}/#history`)

  function scrollToHistory(event: MouseEvent) {
    const onOwnPage = route.params.slug === airline.value.slug
    const section = onOwnPage && document.getElementById('history')
    if (!section) return
    event.preventDefault()
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(history.state, '', '#history')
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
    historySummary,
    historyLink,
    scrollToHistory,
    related,
    colors,
    shownColors,
    hiddenCount,
    showAllColors,
    copyColor,
    COLOR_LIMIT,
  }
}
