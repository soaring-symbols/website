import type { AirlineMeta } from '~/types/airline'
import airlinesData from '#airlines-data'

const airlines = airlinesData as unknown as AirlineMeta[]

export function useRandomAirline() {
  // useState keeps server/client in sync to avoid hydration mismatch
  const featured = useState<AirlineMeta>('featured-airline', () => airlines[0]!)

  function refresh() {
    const current = featured.value.slug
    let next: AirlineMeta
    do {
      next = airlines[Math.floor(Math.random() * airlines.length)]!
    } while (next.slug === current)
    featured.value = next
  }

  // Randomize on client only, after hydration; then auto-rotate every 30 seconds
  onMounted(() => {
    refresh()
    const timer = setInterval(refresh, 30_000)
    onUnmounted(() => clearInterval(timer))
  })

  const stats = {
    total: airlines.length,
    countries: new Set(airlines.map((a) => a.country)).size,
    alliances: new Set(
      airlines.filter((a) => a.alliance).map((a) => a.alliance!),
    ).size,
    assets: airlines.length * 2,
  }

  return {
    featured: readonly(featured),
    total: airlines.length,
    refresh,
    stats,
  }
}
