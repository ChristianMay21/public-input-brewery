'use client'

import { MarkerPin01, SearchLg } from '@untitled-ui/icons-react'
import { type ChangeEvent, type FocusEvent, type KeyboardEvent, useMemo, useState } from 'react'
import CitySuggestions from '@/components/CitySuggestions/CitySuggestions'
import { type City, formatCity, searchCities } from '@/lib/cities'
import styles from './SearchBar.module.scss'

const SUGGESTIONS_ID = 'city-suggestions'

type SearchBarProps = {
  city: City
  onCityChange: (city: City) => void
  onQueryChange: (query: string) => void
  onSubmit: () => void
  query: string
}

export default function SearchBar({
  city,
  onCityChange,
  onQueryChange,
  onSubmit,
  query,
}: SearchBarProps) {
  const [locationText, setLocationText] = useState(formatCity(city))
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // Below the mobile breakpoint the location field only exists while focus is
  // somewhere inside the search group.
  const [isGroupFocused, setIsGroupFocused] = useState(false)

  const suggestions = useMemo(
    function findCities() {
      return isEditingLocation ? searchCities(locationText) : []
    },
    [isEditingLocation, locationText],
  )

  function commitCity(next: City) {
    onCityChange(next)
    setLocationText(formatCity(next))
    setIsEditingLocation(false)
    setActiveIndex(0)
  }

  function handleLocationChange(event: ChangeEvent<HTMLInputElement>) {
    setLocationText(event.target.value)
    setIsEditingLocation(true)
    setActiveIndex(0)
  }

  function handleLocationKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((activeIndex + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((activeIndex - 1 + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      commitCity(suggestions[activeIndex])
    } else if (event.key === 'Escape') {
      setIsEditingLocation(false)
      setLocationText(formatCity(city))
    }
  }

  function handleLocationBlur() {
    setIsEditingLocation(false)
    setLocationText(formatCity(city))
  }

  function handleGroupFocus() {
    setIsGroupFocused(true)
  }

  function handleGroupBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsGroupFocused(false)
  }

  function handleQueryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') onSubmit()
  }

  return (
    <div
      className={styles.group}
      data-location-open={isGroupFocused}
      onBlur={handleGroupBlur}
      onFocus={handleGroupFocus}
      onMouseDown={handleGroupFocus}
    >
      <div className={styles.primary}>
        <SearchLg aria-hidden="true" className={styles.icon} height={19} width={19} />
        <input
          aria-label="Search breweries"
          className={styles.input}
          onChange={function handleChange(event) {
            onQueryChange(event.target.value)
          }}
          onKeyDown={handleQueryKeyDown}
          placeholder="Brewery, beer style, or name"
          type="search"
          value={query}
        />
      </div>

      <span className={styles.divider} />

      <div className={styles.location}>
        <MarkerPin01 aria-hidden="true" className={styles.icon} height={19} width={19} />
        <input
          aria-activedescendant={
            suggestions.length > 0 ? `${SUGGESTIONS_ID}-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          aria-controls={SUGGESTIONS_ID}
          aria-expanded={suggestions.length > 0}
          aria-label="Search location"
          autoComplete="off"
          className={styles.input}
          onBlur={handleLocationBlur}
          onChange={handleLocationChange}
          onKeyDown={handleLocationKeyDown}
          placeholder="City or ZIP"
          role="combobox"
          type="text"
          value={locationText}
        />
        <CitySuggestions
          activeIndex={activeIndex}
          cities={suggestions}
          listId={SUGGESTIONS_ID}
          onSelect={commitCity}
        />
      </div>

      <button className={styles.submit} onClick={onSubmit} type="button">
        Search
      </button>
    </div>
  )
}
