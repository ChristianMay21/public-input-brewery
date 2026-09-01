import citiesData from '@/data/us-cities.json'

export type City = {
  city: string
  state: string
  lat: number
  lng: number
}

/** The 1,000 largest US cities, ordered by population descending. */
const CITIES = citiesData as City[]

export const DEFAULT_CITY: City =
  CITIES.find(function isSanDiego(city) {
    return city.city === 'San Diego'
  }) ?? CITIES[0]

export function formatCity(city: City): string {
  return `${city.city}, ${city.state}`
}

/**
 * Prefix matches rank above interior matches, and within each group the source
 * ordering (population descending) decides — so "port" offers Portland before
 * Port St. Lucie, and "san" offers San Antonio before San Bernardino.
 */
export function searchCities(query: string, limit = 6): City[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []

  const prefixed: City[] = []
  const contained: City[] = []

  for (const city of CITIES) {
    const name = city.city.toLowerCase()
    const full = formatCity(city).toLowerCase()

    if (name.startsWith(needle) || full.startsWith(needle)) {
      prefixed.push(city)
    } else if (full.includes(needle)) {
      contained.push(city)
    }

    if (prefixed.length >= limit) break
  }

  return [...prefixed, ...contained].slice(0, limit)
}
