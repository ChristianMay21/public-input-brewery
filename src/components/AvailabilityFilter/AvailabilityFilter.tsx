import { SEAT_LABELS, SEAT_LEVELS, type SeatLevel } from '@/lib/availability'
import styles from './AvailabilityFilter.module.scss'

type AvailabilityFilterProps = {
  onToggle: (level: SeatLevel) => void
  selected: SeatLevel[]
}

export default function AvailabilityFilter({ onToggle, selected }: AvailabilityFilterProps) {
  return (
    <div aria-labelledby="seats-filter-label" className={styles.panel} role="group">
      <p className={styles.legend} id="seats-filter-label">
        Seat availability
      </p>
      <div className={styles.options}>
        {SEAT_LEVELS.map(function renderOption(level) {
          const isSelected = selected.includes(level)

          return (
            <button
              aria-pressed={isSelected}
              className={styles.option}
              data-seats={level}
              data-selected={isSelected}
              key={level}
              onClick={function toggle() {
                onToggle(level)
              }}
              type="button"
            >
              <span className={styles.dot} />
              {SEAT_LABELS[level]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
