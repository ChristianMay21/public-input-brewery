'use client'

import { ChevronDown, FilterLines } from '@untitled-ui/icons-react'
import AvailabilityFilter from '@/components/AvailabilityFilter/AvailabilityFilter'
import DistanceFilter, { DEFAULT_DISTANCE } from '@/components/DistanceFilter/DistanceFilter'
import TypeFilter from '@/components/TypeFilter/TypeFilter'
import type { SeatLevel } from '@/lib/availability'
import type { BreweryType } from '@/lib/breweryTypes'
import styles from './FilterBar.module.scss'

export type FilterPanel = 'distance' | 'seats' | 'types'

type FilterBarProps = {
  availableTypes: Set<BreweryType>
  distance: number
  isDirty: boolean
  onClear: () => void
  onDistanceChange: (distance: number) => void
  onToggleOpenPanel: (panel: FilterPanel) => void
  onToggleSeat: (level: SeatLevel) => void
  onToggleType: (type: BreweryType) => void
  openPanel: FilterPanel | null
  seats: SeatLevel[]
  types: BreweryType[]
}

export default function FilterBar({
  availableTypes,
  distance,
  isDirty,
  onClear,
  onDistanceChange,
  onToggleOpenPanel,
  onToggleSeat,
  onToggleType,
  openPanel,
  seats,
  types,
}: FilterBarProps) {
  const chips: { active: boolean; label: string; panel: FilterPanel }[] = [
    {
      active: openPanel === 'distance' || distance !== DEFAULT_DISTANCE,
      label: `Within ${distance} mi`,
      panel: 'distance',
    },
    {
      active: openPanel === 'seats' || seats.length > 0,
      label: seats.length > 0 ? `Availability · ${seats.length}` : 'Availability',
      panel: 'seats',
    },
    {
      active: openPanel === 'types' || types.length > 0,
      label: types.length > 0 ? `Brewery type · ${types.length}` : 'Brewery type',
      panel: 'types',
    },
  ]

  return (
    <div className={styles.filters}>
      <div className={styles.chips}>
        <span className={styles.heading}>
          <FilterLines aria-hidden="true" height={15} width={15} />
          Filters
        </span>

        {chips.map(function renderChip({ active, label, panel }) {
          return (
            <button
              aria-expanded={openPanel === panel}
              className={styles.chip}
              data-active={active}
              key={panel}
              onClick={function toggle() {
                onToggleOpenPanel(panel)
              }}
              type="button"
            >
              {label}
              <ChevronDown aria-hidden="true" height={13} width={13} />
            </button>
          )
        })}

        {isDirty ? (
          <button className={styles.clear} onClick={onClear} type="button">
            Clear all
          </button>
        ) : null}
      </div>

      {openPanel === 'distance' ? (
        <DistanceFilter distance={distance} onChange={onDistanceChange} />
      ) : null}
      {openPanel === 'seats' ? (
        <AvailabilityFilter onToggle={onToggleSeat} selected={seats} />
      ) : null}
      {openPanel === 'types' ? (
        <TypeFilter availableTypes={availableTypes} onToggle={onToggleType} selected={types} />
      ) : null}
    </div>
  )
}
