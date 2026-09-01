/**
 * Seat availability is not in the Open Brewery DB response — the API has no
 * such field. We seed it from a hash of the brewery id so that a given brewery
 * always shows the same availability across renders, filters and page loads,
 * which a random seed would not. In production this would come from the venue.
 */
export const SEAT_LEVELS = ['high', 'medium', 'low'] as const

export type SeatLevel = (typeof SEAT_LEVELS)[number]

export const SEAT_LABELS: Record<SeatLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

/** Number of filled bars in the three-bar availability meter. */
export const SEAT_BARS: Record<SeatLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

function hash(id: string): number {
  let value = 2166136261
  for (let index = 0; index < id.length; index += 1) {
    value ^= id.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return Math.abs(value)
}

export function seatLevelFor(id: string): SeatLevel {
  const bucket = hash(id) % 100
  if (bucket < 45) return 'high'
  if (bucket < 80) return 'medium'
  return 'low'
}

export function seatLabelFor(level: SeatLevel): string {
  return `${SEAT_LABELS[level]} availability`
}
