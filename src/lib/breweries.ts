import { seatLevelFor, type SeatLevel } from './availability'
import { isBreweryType, type BreweryType } from './breweryTypes'
import type { City } from './cities'
import { abbreviateState } from './stateAbbreviations'

const API_ROOT = 'https://api.openbrewerydb.org/v1/breweries'

/**
 * The API caps `per_page` at 200. Every city in our list sits comfortably under
 * that (San Diego, the largest brewery scene we target, returns 91), so one
 * request gets the complete set and every filter can then run client-side.
 * That matters because the API cannot express what the design asks for:
 * `by_type` accepts a single value rather than a multi-select, there is no
 * radius or negation parameter, and seat availability does not exist at all.
 */
const PER_PAGE = 200

type BreweryResponse = {
  id: string
  name: string
  brewery_type: string | null
  street: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  phone: string | null
  website_url: string | null
  latitude: string | number | null
  longitude: string | number | null
}

export type Brewery = {
  id: string
  name: string
  type: BreweryType
  address: string
  phone: string
  websiteUrl: string | null
  lat: number
  lng: number
  seats: SeatLevel
}

function toNumber(value: string | number | null): number | null {
  if (value === null) return null
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** "6195782311" reads as a phone number; "(619) 578-2311" reads as a business. */
function formatPhone(phone: string | null): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return formatPhone(digits.slice(1))
  if (digits.length !== 10) return phone
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function formatAddress(brewery: BreweryResponse): string {
  const cityState = [brewery.city, abbreviateState(brewery.state)].filter(Boolean).join(', ')
  const postal = brewery.postal_code?.split('-')[0] ?? ''
  return [brewery.street, `${cityState} ${postal}`.trim()].filter(Boolean).join(', ')
}

function normalize(brewery: BreweryResponse): Brewery | null {
  const lat = toNumber(brewery.latitude)
  const lng = toNumber(brewery.longitude)

  // Every result gets a map pin, so one without coordinates cannot be shown.
  if (lat === null || lng === null) return null
  if (!isBreweryType(brewery.brewery_type)) return null

  return {
    id: brewery.id,
    name: brewery.name,
    type: brewery.brewery_type,
    address: formatAddress(brewery),
    phone: formatPhone(brewery.phone),
    websiteUrl: brewery.website_url,
    lat,
    lng,
    seats: seatLevelFor(brewery.id),
  }
}

export function breweriesUrl(city: City): string {
  const params = new URLSearchParams({
    by_city: city.city.toLowerCase().replace(/\s+/g, '_'),
    by_dist: `${city.lat},${city.lng}`,
    per_page: String(PER_PAGE),
  })
  return `${API_ROOT}?${params}`
}

export async function fetchBreweries(city: City, signal?: AbortSignal): Promise<Brewery[]> {
  const response = await fetch(breweriesUrl(city), { signal })

  if (!response.ok) {
    throw new Error(`Open Brewery DB responded with ${response.status}`)
  }

  const payload: unknown = await response.json()

  if (!Array.isArray(payload)) {
    throw new Error('Open Brewery DB returned an unexpected response')
  }

  // `by_dist` has already ordered these nearest-first; normalize preserves it.
  return payload
    .map(function normalizeOne(brewery) {
      return normalize(brewery as BreweryResponse)
    })
    .filter(function isPresent(brewery): brewery is Brewery {
      return brewery !== null
    })
}
