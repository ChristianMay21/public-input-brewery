'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BreweryList from '@/components/BreweryList/BreweryList'
import BreweryMap from '@/components/BreweryMap/BreweryMap'
import { DEFAULT_DISTANCE } from '@/components/DistanceFilter/DistanceFilter'
import FilterBar, { type FilterPanel } from '@/components/FilterBar/FilterBar'
import ResultsHeader from '@/components/ResultsHeader/ResultsHeader'
import SearchBar from '@/components/SearchBar/SearchBar'
import type { ResultsView } from '@/components/ViewToggle/ViewToggle'
import WaitlistDialog from '@/components/WaitlistDialog/WaitlistDialog'
import type { SeatLevel } from '@/lib/availability'
import { type Brewery, fetchBreweries } from '@/lib/breweries'
import type { BreweryType } from '@/lib/breweryTypes'
import { type City, DEFAULT_CITY, formatCity } from '@/lib/cities'
import { distanceInMiles } from '@/lib/distance'
import {
  RESERVE_DELAY_MS,
  type ReservationsById,
  WAITLIST_START_POSITION,
  WAITLIST_TICK_MS,
} from '@/lib/reservations'
import styles from './BrewerySearch.module.scss'

const PAGE_SIZE = 5

function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter(function isOther(other) {
        return other !== value
      })
    : [...values, value]
}

export default function BrewerySearch() {
  const [city, setCity] = useState<City>(DEFAULT_CITY)
  const [query, setQuery] = useState('')
  const [breweries, setBreweries] = useState<Brewery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [distance, setDistance] = useState(DEFAULT_DISTANCE)
  const [seats, setSeats] = useState<SeatLevel[]>([])
  const [types, setTypes] = useState<BreweryType[]>([])
  const [openPanel, setOpenPanel] = useState<FilterPanel | null>(null)

  const [page, setPage] = useState(0)
  const [view, setView] = useState<ResultsView>('list')
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const [reservations, setReservations] = useState<ReservationsById>({})
  const [dialogId, setDialogId] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef(new Map<string, HTMLLIElement>())
  const reserveTimers = useRef(new Set<number>())

  useEffect(
    function loadBreweries() {
      const controller = new AbortController()
      setIsLoading(true)
      setError(null)

      fetchBreweries(city, controller.signal)
        .then(function show(results) {
          setBreweries(results)
          setIsLoading(false)
        })
        .catch(function fail(cause: unknown) {
          if (controller.signal.aborted) return
          setError(cause instanceof Error ? cause.message : 'Something went wrong.')
          setBreweries([])
          setIsLoading(false)
        })

      return function abort() {
        controller.abort()
      }
    },
    [city, reloadToken],
  )

  useEffect(function clearReserveTimersOnUnmount() {
    const timers = reserveTimers.current
    return function clearAll() {
      timers.forEach(function clearOne(timer) {
        window.clearTimeout(timer)
      })
      timers.clear()
    }
  }, [])

  const hasWaitlist = Object.values(reservations).some(function isInLine(reservation) {
    return reservation.kind === 'inLine'
  })

  // A waitlist place keeps advancing whether or not its dialog is open, so the
  // position shown on the result row stays current.
  useEffect(
    function advanceWaitlists() {
      if (!hasWaitlist) return

      const timer = window.setInterval(function tick() {
        setReservations(function advance(current) {
          const next: ReservationsById = {}

          for (const [id, reservation] of Object.entries(current)) {
            if (reservation.kind !== 'inLine') {
              next[id] = reservation
            } else if (reservation.position <= 1) {
              next[id] = { kind: 'ready' }
            } else {
              next[id] = { ...reservation, position: reservation.position - 1 }
            }
          }

          return next
        })
      }, WAITLIST_TICK_MS)

      return function stop() {
        window.clearInterval(timer)
      }
    },
    [hasWaitlist],
  )

  const distances = useMemo(
    function measureFromCity() {
      return new Map(
        breweries.map(function measure(brewery) {
          return [brewery.id, distanceInMiles(city, brewery)] as const
        }),
      )
    },
    [breweries, city],
  )

  const availableTypes = useMemo(
    function collectTypes() {
      return new Set(
        breweries.map(function toType(brewery) {
          return brewery.type
        }),
      )
    },
    [breweries],
  )

  const filtered = useMemo(
    function applyFilters() {
      const needle = query.trim().toLowerCase()

      return breweries.filter(function matches(brewery) {
        if (needle && !brewery.name.toLowerCase().includes(needle)) return false
        if ((distances.get(brewery.id) ?? 0) > distance) return false
        if (seats.length > 0 && !seats.includes(brewery.seats)) return false
        if (types.length > 0 && !types.includes(brewery.type)) return false
        return true
      })
    },
    [breweries, distance, distances, query, seats, types],
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageResults = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const isDirty =
    query !== '' || distance !== DEFAULT_DISTANCE || seats.length > 0 || types.length > 0

  function resetToFirstPage() {
    setPage(0)
    setHighlightedId(null)
  }

  function handleQueryChange(next: string) {
    setQuery(next)
    resetToFirstPage()
  }

  function handleCityChange(next: City) {
    setCity(next)
    resetToFirstPage()
  }

  function handleDistanceChange(next: number) {
    setDistance(next)
    resetToFirstPage()
  }

  function handleToggleSeat(level: SeatLevel) {
    setSeats(toggle(seats, level))
    resetToFirstPage()
  }

  function handleToggleType(type: BreweryType) {
    setTypes(toggle(types, type))
    resetToFirstPage()
  }

  function handleTogglePanel(panel: FilterPanel) {
    setOpenPanel(openPanel === panel ? null : panel)
  }

  function handleClearFilters() {
    setQuery('')
    setDistance(DEFAULT_DISTANCE)
    setSeats([])
    setTypes([])
    setOpenPanel(null)
    resetToFirstPage()
  }

  function handleSubmit() {
    setOpenPanel(null)
    resetToFirstPage()
  }

  function handleNextPage() {
    setPage(safePage + 1)
    setHighlightedId(null)
    listRef.current?.scrollTo({ behavior: 'smooth', top: 0 })
  }

  function handleRetry() {
    setReloadToken(reloadToken + 1)
  }

  function registerRow(id: string, element: HTMLLIElement | null) {
    if (element) rowRefs.current.set(id, element)
    else rowRefs.current.delete(id)
  }

  const handleHover = useCallback(function highlight(id: string | null) {
    setHighlightedId(id)
  }, [])

  // Clicking a pin brings its row into view. The list container is scrolled
  // directly rather than through scrollIntoView, which would move the page.
  const handleSelectPin = useCallback(function selectPin(id: string) {
    setView('list')
    setHighlightedId(id)

    window.setTimeout(function scrollRow() {
      const row = rowRefs.current.get(id)
      const container = listRef.current
      if (!row || !container) return

      container.scrollTo({
        behavior: 'smooth',
        top: Math.max(0, row.offsetTop - container.offsetTop - 8),
      })
    }, 40)
  }, [])

  function handleOpenReservation(brewery: Brewery) {
    const existing = reservations[brewery.id]

    if (existing?.kind === 'inLine' || existing?.kind === 'ready') {
      setDialogId(brewery.id)
      return
    }

    if (existing) return

    if (brewery.seats === 'low') {
      setDialogId(brewery.id)
      return
    }

    setReservations({ ...reservations, [brewery.id]: { kind: 'reserving' } })

    const timer = window.setTimeout(function confirmReservation() {
      reserveTimers.current.delete(timer)
      setReservations(function markReserved(current) {
        return { ...current, [brewery.id]: { kind: 'reserved' } }
      })
    }, RESERVE_DELAY_MS)

    reserveTimers.current.add(timer)
  }

  function handleJoinWaitlist() {
    if (!dialogId) return

    setReservations({
      ...reservations,
      [dialogId]: {
        kind: 'inLine',
        position: WAITLIST_START_POSITION,
        start: WAITLIST_START_POSITION,
      },
    })
  }

  function handleLeaveWaitlist() {
    if (!dialogId) return

    const next = { ...reservations }
    delete next[dialogId]
    setReservations(next)
    setDialogId(null)
  }

  function handleCloseDialog() {
    setDialogId(null)
  }

  const dialogBrewery =
    breweries.find(function isDialogBrewery(brewery) {
      return brewery.id === dialogId
    }) ?? null

  return (
    <div className={styles.page} data-view={view}>
      <div className={styles.content}>
        <h1 className={styles.title}>Find a seat tonight</h1>
        <p className={styles.subtitle}>
          Search breweries near you and reserve a spot before you go.
        </p>

        <SearchBar
          city={city}
          onCityChange={handleCityChange}
          onQueryChange={handleQueryChange}
          onSubmit={handleSubmit}
          query={query}
        />

        <FilterBar
          availableTypes={availableTypes}
          distance={distance}
          isDirty={isDirty}
          onClear={handleClearFilters}
          onDistanceChange={handleDistanceChange}
          onToggleOpenPanel={handleTogglePanel}
          onToggleSeat={handleToggleSeat}
          onToggleType={handleToggleType}
          openPanel={openPanel}
          seats={seats}
          types={types}
        />

        <ResultsHeader
          count={filtered.length}
          location={formatCity(city)}
          onViewChange={setView}
          view={view}
        />

        <div className={styles.split}>
          <div className={styles.listPane}>
            <BreweryList
              breweries={pageResults}
              distances={distances}
              error={error}
              hasAnyBreweries={breweries.length > 0}
              highlightedId={highlightedId}
              isLoading={isLoading}
              listRef={listRef}
              onHover={handleHover}
              onNextPage={handleNextPage}
              onOpenReservation={handleOpenReservation}
              onRetry={handleRetry}
              page={safePage}
              pageCount={pageCount}
              registerRow={registerRow}
              reservations={reservations}
            />
          </div>

          <div className={styles.mapPane}>
            <BreweryMap
              breweries={pageResults}
              distances={distances}
              highlightedId={highlightedId}
              isHidden={view === 'list'}
              onHover={handleHover}
              onSelect={handleSelectPin}
              origin={city}
            />
          </div>
        </div>
      </div>

      <WaitlistDialog
        brewery={dialogBrewery}
        onClose={handleCloseDialog}
        onJoin={handleJoinWaitlist}
        onLeave={handleLeaveWaitlist}
        reservation={dialogId ? reservations[dialogId] : undefined}
      />
    </div>
  )
}
