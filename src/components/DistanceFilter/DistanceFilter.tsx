import type { ChangeEvent } from 'react'
import styles from './DistanceFilter.module.scss'

export const MIN_DISTANCE = 0.5
export const MAX_DISTANCE = 10
export const DEFAULT_DISTANCE = 5

type DistanceFilterProps = {
  distance: number
  onChange: (distance: number) => void
}

export default function DistanceFilter({ distance, onChange }: DistanceFilterProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(Number.parseFloat(event.target.value))
  }

  return (
    <div className={styles.panel}>
      <div className={styles.heading}>
        <label className={styles.label} htmlFor="distance-filter">
          Distance
        </label>
        <span className={styles.value}>{`${distance} mi`}</span>
      </div>
      <input
        className={styles.slider}
        id="distance-filter"
        max={MAX_DISTANCE}
        min={MIN_DISTANCE}
        onChange={handleChange}
        step={0.5}
        type="range"
        value={distance}
      />
      <div className={styles.ticks}>
        <span>0.5 mi</span>
        <span>5 mi</span>
        <span>10 mi</span>
      </div>
    </div>
  )
}
