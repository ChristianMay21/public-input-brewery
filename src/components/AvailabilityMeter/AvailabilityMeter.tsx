import { SEAT_BARS, seatLabelFor, type SeatLevel } from '@/lib/availability'
import styles from './AvailabilityMeter.module.scss'

const BARS = [0, 1, 2]

type AvailabilityMeterProps = {
  seats: SeatLevel
}

export default function AvailabilityMeter({ seats }: AvailabilityMeterProps) {
  const filled = SEAT_BARS[seats]

  return (
    <div className={styles.meter} data-seats={seats}>
      <span className={styles.bars}>
        {BARS.map(function renderBar(index) {
          return <span className={styles.bar} data-filled={index < filled} key={index} />
        })}
      </span>
      <span className={styles.label}>{seatLabelFor(seats)}</span>
    </div>
  )
}
