import AvailabilityMeter from '@/components/AvailabilityMeter/AvailabilityMeter'
import BreweryTypeIcon from '@/components/BreweryTypeIcon/BreweryTypeIcon'
import ReserveControl from '@/components/ReserveControl/ReserveControl'
import type { Brewery } from '@/lib/breweries'
import { BREWERY_TYPES } from '@/lib/breweryTypes'
import { formatMiles } from '@/lib/distance'
import type { Reservation } from '@/lib/reservations'
import styles from './BreweryRow.module.scss'

type BreweryRowProps = {
  brewery: Brewery
  distance: number
  isHighlighted: boolean
  onHover: (id: string | null) => void
  onOpenReservation: (brewery: Brewery) => void
  reservation: Reservation | undefined
  rowRef: (element: HTMLLIElement | null) => void
}

export default function BreweryRow({
  brewery,
  distance,
  isHighlighted,
  onHover,
  onOpenReservation,
  reservation,
  rowRef,
}: BreweryRowProps) {
  function handleEnter() {
    onHover(brewery.id)
  }

  function handleLeave() {
    onHover(null)
  }

  function handleOpen() {
    onOpenReservation(brewery)
  }

  return (
    <li
      className={styles.row}
      data-highlighted={isHighlighted}
      onBlur={handleLeave}
      onFocus={handleEnter}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      ref={rowRef}
    >
      <div className={styles.details}>
        <p className={styles.badges}>
          <span className={styles.type}>
            <BreweryTypeIcon size={12} type={brewery.type} />
            {BREWERY_TYPES[brewery.type].label}
          </span>
          <span className={styles.distance}>{formatMiles(distance)}</span>
        </p>
        <h3 className={styles.name}>{brewery.name}</h3>
        <p className={styles.address}>{brewery.address}</p>
        {brewery.phone ? <p className={styles.phone}>{brewery.phone}</p> : null}
      </div>

      <div className={styles.reservation}>
        <AvailabilityMeter seats={brewery.seats} />
        <ReserveControl
          breweryName={brewery.name}
          isWaitlist={brewery.seats === 'low'}
          onOpen={handleOpen}
          reservation={reservation}
        />
      </div>
    </li>
  )
}
