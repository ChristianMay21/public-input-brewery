'use client'

import { ArrowRight } from '@untitled-ui/icons-react'
import type { RefObject } from 'react'
import BreweryRow from '@/components/BreweryRow/BreweryRow'
import type { Brewery } from '@/lib/breweries'
import type { ReservationsById } from '@/lib/reservations'
import styles from './BreweryList.module.scss'

const SKELETON_ROWS = [0, 1, 2, 3, 4]

type BreweryListProps = {
  breweries: Brewery[]
  distances: Map<string, number>
  error: string | null
  hasAnyBreweries: boolean
  highlightedId: string | null
  isLoading: boolean
  listRef: RefObject<HTMLDivElement | null>
  onCancelReservation: (brewery: Brewery) => void
  onHover: (id: string | null) => void
  onNextPage: () => void
  onOpenReservation: (brewery: Brewery) => void
  onRetry: () => void
  page: number
  pageCount: number
  registerRow: (id: string, element: HTMLLIElement | null) => void
  reservations: ReservationsById
}

export default function BreweryList({
  breweries,
  distances,
  error,
  hasAnyBreweries,
  highlightedId,
  isLoading,
  listRef,
  onCancelReservation,
  onHover,
  onNextPage,
  onOpenReservation,
  onRetry,
  page,
  pageCount,
  registerRow,
  reservations,
}: BreweryListProps) {
  if (isLoading) {
    return (
      <div className={styles.list} data-state="loading">
        <p className={styles.loadingLabel} role="status">
          Loading breweries…
        </p>
        {SKELETON_ROWS.map(function renderSkeleton(index) {
          return (
            <div className={styles.skeleton} key={index}>
              <span className={styles.skeletonBadge} />
              <span className={styles.skeletonName} />
              <span className={styles.skeletonLine} />
            </div>
          )
        })}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.list} data-state="error">
        <div className={styles.notice} role="alert">
          <p className={styles.noticeTitle}>We could not load breweries</p>
          <p className={styles.noticeBody}>{error}</p>
          <button className={styles.retry} onClick={onRetry} type="button">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.list} data-state="ready" ref={listRef}>
      {breweries.length === 0 ? (
        <div className={styles.notice}>
          <p className={styles.noticeTitle}>
            {hasAnyBreweries ? 'No breweries match those filters' : 'No breweries here yet'}
          </p>
          <p className={styles.noticeBody}>
            {hasAnyBreweries
              ? 'Try widening the distance or clearing a filter.'
              : 'Open Brewery DB has no breweries listed for this city. Try another one.'}
          </p>
        </div>
      ) : (
        <ul className={styles.rows}>
          {breweries.map(function renderRow(brewery) {
            return (
              <BreweryRow
                brewery={brewery}
                distance={distances.get(brewery.id) ?? 0}
                isHighlighted={highlightedId === brewery.id}
                key={brewery.id}
                onCancelReservation={onCancelReservation}
                onHover={onHover}
                onOpenReservation={onOpenReservation}
                reservation={reservations[brewery.id]}
                rowRef={function setRef(element) {
                  registerRow(brewery.id, element)
                }}
              />
            )
          })}
        </ul>
      )}

      <div className={styles.pagination}>
        <span className={styles.pageLabel}>
          {breweries.length > 0 ? `Page ${page + 1} of ${pageCount}` : ''}
        </span>
        {page + 1 < pageCount ? (
          <button className={styles.next} onClick={onNextPage} type="button">
            Next page
            <ArrowRight aria-hidden="true" height={15} width={15} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
