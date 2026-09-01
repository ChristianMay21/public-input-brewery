import { type City, formatCity } from '@/lib/cities'
import styles from './CitySuggestions.module.scss'

type CitySuggestionsProps = {
  activeIndex: number
  cities: City[]
  listId: string
  onSelect: (city: City) => void
}

export default function CitySuggestions({
  activeIndex,
  cities,
  listId,
  onSelect,
}: CitySuggestionsProps) {
  if (cities.length === 0) return null

  return (
    <ul className={styles.suggestions} id={listId} role="listbox">
      {cities.map(function renderCity(city, index) {
        return (
          <li
            aria-selected={index === activeIndex}
            className={styles.suggestion}
            data-active={index === activeIndex}
            id={`${listId}-${index}`}
            key={formatCity(city)}
            // Runs before the input's blur, so the field is still focused.
            onMouseDown={function select(event) {
              event.preventDefault()
              onSelect(city)
            }}
            role="option"
          >
            <span className={styles.city}>{city.city}</span>
            <span className={styles.state}>{city.state}</span>
          </li>
        )
      })}
    </ul>
  )
}
