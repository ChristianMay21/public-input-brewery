import type { BreweryType } from '@/lib/breweryTypes'

/**
 * Untitled UI has no tank, flask or pint glyph, so the seven brewery types use
 * the shapes drawn for the design handoff, in the same 24px / round-cap style
 * as the rest of the icon set.
 */
const TYPE_PATHS: Record<BreweryType, string[]> = {
  micro: ['M7.5 3.5h9v10.6L12 19.2 7.5 14.1V3.5Z'],
  nano: ['M9.4 3.5h5.2', 'M10.2 3.5v5L7 17a2 2 0 0 0 1.9 2.7h6.2A2 2 0 0 0 17 17l-3.2-8.5v-5'],
  regional: [
    'M3.6 6.2h4.2v6.4L5.7 15 3.6 12.6V6.2Z',
    'M9.9 6.2h4.2v6.4L12 15l-2.1-2.4V6.2Z',
    'M16.2 6.2h4.2v6.4L18.3 15l-2.1-2.4V6.2Z',
    'M3 19.5h18',
  ],
  brewpub: ['M7.6 4.4h8.2l-.9 15.2H8.5L7.6 4.4Z', 'M16 7.6h2.9v4.6h-3.2'],
  large: ['M3.4 20V10.6l5 3.4v-3.4l5 3.4v-3.4l5 3.4V20', 'M2.6 20h18.8', 'M18.4 8h2.8v3.2'],
  contract: [
    'M13.8 3.6H7.6A1.6 1.6 0 0 0 6 5.2v13.6a1.6 1.6 0 0 0 1.6 1.6h8.8a1.6 1.6 0 0 0 1.6-1.6V7.8l-4.2-4.2Z',
    'M13.8 3.6v4.4h4.2',
    'M9.4 14.2l2 2 3.4-3.9',
  ],
  proprietor: [
    'M12 14.4a5.2 5.2 0 1 0 0-10.4 5.2 5.2 0 0 0 0 10.4Z',
    'M8.6 13.4 7 20.6l5-2.6 5 2.6-1.6-7.2',
  ],
}

type BreweryTypeIconProps = {
  type: BreweryType
  size: number
}

export default function BreweryTypeIcon({ type, size }: BreweryTypeIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      viewBox="0 0 24 24"
      width={size}
    >
      {TYPE_PATHS[type].map(function renderPath(path) {
        return <path d={path} key={path} />
      })}
    </svg>
  )
}
