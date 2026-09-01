/**
 * A brewery with high or medium availability can be reserved outright. One with
 * low availability is waitlisted instead: the user joins, holds a place in
 * line, and can leave at any point until the table is ready.
 */
export type Reservation =
  | { kind: 'reserving' }
  | { kind: 'reserved' }
  | { kind: 'inLine'; position: number; start: number }
  | { kind: 'ready' }

export type ReservationsById = Record<string, Reservation>

/** How long the faked reserve request appears to take. */
export const RESERVE_DELAY_MS = 900

/** How often a waitlist place advances. In production this would be pushed. */
export const WAITLIST_TICK_MS = 1600

export const WAITLIST_START_POSITION = 7

export function waitlistProgress(reservation: {
  position: number
  start: number
}): number {
  return Math.round((1 - reservation.position / reservation.start) * 100)
}
