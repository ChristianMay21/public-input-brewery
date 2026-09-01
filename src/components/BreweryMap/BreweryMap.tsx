'use client'

import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { seatLabelFor } from '@/lib/availability'
import type { Brewery } from '@/lib/breweries'
import { BREWERY_TYPES } from '@/lib/breweryTypes'
import type { City } from '@/lib/cities'
import { formatMiles } from '@/lib/distance'
import styles from './BreweryMap.module.scss'

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

// Required by the OpenStreetMap tile usage policy.
const ATTRIBUTION = '© OpenStreetMap contributors'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, function replaceChar(char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char] ?? char
  })
}

function tooltipHtml(brewery: Brewery, distance: number): string {
  return `
    <div class="${styles.tooltipBody}">
      <span class="${styles.tooltipName}">${escapeHtml(brewery.name)}</span>
      <span class="${styles.tooltipMeta}">${escapeHtml(
        brewery.address.split(',')[0],
      )} · ${formatMiles(distance)}</span>
      <span class="${styles.tooltipTags}">
        <span class="${styles.tooltipType}">${BREWERY_TYPES[brewery.type].label}</span>
        <span class="${styles.tooltipSeats}" data-seats="${brewery.seats}">
          <span class="${styles.tooltipDot}"></span>${seatLabelFor(brewery.seats)}
        </span>
      </span>
    </div>
  `
}

type BreweryMapProps = {
  breweries: Brewery[]
  distances: Map<string, number>
  highlightedId: string | null
  isHidden: boolean
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
  origin: City
}

export default function BreweryMap({
  breweries,
  distances,
  highlightedId,
  isHidden,
  onHover,
  onSelect,
  origin,
}: BreweryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef(new Map<string, Marker>())
  const fittedResultsKey = useRef<string | null>(null)

  // Leaflet is imported asynchronously, so the effects that draw into the map
  // need to know when it actually exists rather than racing its creation.
  const [isReady, setIsReady] = useState(false)

  const resultsKey = useMemo(
    function identifyResults() {
      return `${origin.city},${origin.state}:${breweries
        .map(function toId(brewery) {
          return brewery.id
        })
        .join('|')}`
    },
    [breweries, origin],
  )

  // Leaflet reads `window` on import, so it is only pulled in on the client.
  useEffect(function createMap() {
    let map: LeafletMap | null = null

    void import('leaflet').then(function initialise({ default: L }) {
      if (!containerRef.current || mapRef.current) return

      map = L.map(containerRef.current, { attributionControl: true, zoomControl: false })
      map.setView([origin.lat, origin.lng], 13)
      L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map)
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      map.invalidateSize()
      mapRef.current = map
      setIsReady(true)
    })

    return function destroyMap() {
      map?.remove()
      mapRef.current = null
      markersRef.current.clear()
      setIsReady(false)
    }
    // The map instance is created once; later origin changes re-fit the bounds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    function drawMarkers() {
      const map = mapRef.current
      if (!map) return

      let cancelled = false

      void import('leaflet').then(function draw({ default: L }) {
        if (cancelled) return

        markersRef.current.forEach(function removeMarker(marker) {
          marker.remove()
        })
        markersRef.current.clear()

        breweries.forEach(function addMarker(brewery) {
          const icon = L.divIcon({
            className: '',
            html: `<span class="${styles.pin}" data-seats="${brewery.seats}"><span class="${styles.pinDot}"></span></span>`,
            iconAnchor: [11, 11],
            iconSize: [22, 22],
          })

          const marker = L.marker([brewery.lat, brewery.lng], { icon, riseOnHover: true })
          marker.addTo(map)
          marker.bindTooltip(tooltipHtml(brewery, distances.get(brewery.id) ?? 0), {
            className: styles.tooltip,
            direction: 'top',
            offset: [0, -12],
            opacity: 1,
          })
          marker.on('mouseover', function highlight() {
            onHover(brewery.id)
          })
          marker.on('mouseout', function clearHighlight() {
            onHover(null)
          })
          marker.on('click', function select() {
            onSelect(brewery.id)
          })

          markersRef.current.set(brewery.id, marker)
        })

        if (fittedResultsKey.current !== resultsKey) {
          fittedResultsKey.current = resultsKey

          if (breweries.length > 1) {
            map.fitBounds(
              breweries.map(function toLatLng(brewery) {
                return [brewery.lat, brewery.lng] as [number, number]
              }),
              { padding: [46, 46], maxZoom: 14 },
            )
          } else if (breweries.length === 1) {
            map.setView([breweries[0].lat, breweries[0].lng], 14)
          } else {
            map.setView([origin.lat, origin.lng], 13)
          }
        }
      })

      return function cancel() {
        cancelled = true
      }
    },
    [breweries, distances, isReady, onHover, onSelect, origin, resultsKey],
  )

  useEffect(
    function focusHighlightedPin() {
      const map = mapRef.current
      if (!map) return

      markersRef.current.forEach(function setActive(marker, id) {
        const element = marker.getElement()?.firstElementChild as HTMLElement | null
        if (element) element.dataset.active = String(id === highlightedId)
        if (id !== highlightedId) marker.closeTooltip()
      })

      if (!highlightedId) return

      const marker = markersRef.current.get(highlightedId)
      if (!marker) return

      marker.openTooltip()
    },
    [highlightedId, isReady],
  )

  // Leaflet measures its container once, at creation. That happens before the
  // sticky panel has settled, and again at zero size whenever the mobile
  // toggle hides the map, so every resize has to be handed back to it.
  useEffect(function trackContainerSize() {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(function remeasure() {
      mapRef.current?.invalidateSize()
    })
    observer.observe(container)

    return function disconnect() {
      observer.disconnect()
    }
  }, [])

  useEffect(
    function resizeAfterReveal() {
      if (isHidden) return

      const timer = window.setTimeout(function invalidate() {
        mapRef.current?.invalidateSize()
      }, 60)

      return function clear() {
        window.clearTimeout(timer)
      }
    },
    [isHidden],
  )

  return <div aria-label="Map of nearby breweries" className={styles.map} ref={containerRef} />
}
