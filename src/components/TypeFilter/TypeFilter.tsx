import BreweryTypeIcon from '@/components/BreweryTypeIcon/BreweryTypeIcon'
import { BREWERY_TYPE_KEYS, BREWERY_TYPES, type BreweryType } from '@/lib/breweryTypes'
import styles from './TypeFilter.module.scss'

type TypeFilterProps = {
  availableTypes: Set<BreweryType>
  onToggle: (type: BreweryType) => void
  selected: BreweryType[]
}

export default function TypeFilter({ availableTypes, onToggle, selected }: TypeFilterProps) {
  return (
    <div aria-labelledby="type-filter-label" className={styles.panel} role="group">
      <p className={styles.legend} id="type-filter-label">
        Brewery type
      </p>
      <div className={styles.options}>
        {BREWERY_TYPE_KEYS.map(function renderOption(type) {
          const { help, label } = BREWERY_TYPES[type]
          const isSelected = selected.includes(type)

          // Types with no breweries in this city stay focusable rather than
          // truly disabled, so their tooltip still explains what they mean.
          const isEmpty = !availableTypes.has(type)

          return (
            <div className={styles.option} key={type}>
              <button
                aria-describedby={`type-help-${type}`}
                aria-disabled={isEmpty}
                aria-pressed={isSelected}
                className={styles.tile}
                data-empty={isEmpty}
                data-selected={isSelected}
                onClick={function toggle() {
                  if (!isEmpty) onToggle(type)
                }}
                type="button"
              >
                <BreweryTypeIcon size={17} type={type} />
                {label}
              </button>
              <span className={styles.tooltip} id={`type-help-${type}`} role="tooltip">
                <span className={styles.tooltipTitle}>{label}</span>
                {isEmpty ? `${help} No ${label.toLowerCase()} breweries here.` : help}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
