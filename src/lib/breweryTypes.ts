/**
 * The seven brewery types the design provides a label, icon and tooltip for.
 * Open Brewery DB also returns `closed`, `planning` and `bar`, which are
 * excluded from results entirely — none of them can seat a customer tonight.
 */
export const BREWERY_TYPE_KEYS = [
  'micro',
  'nano',
  'regional',
  'brewpub',
  'large',
  'contract',
  'proprietor',
] as const

export type BreweryType = (typeof BREWERY_TYPE_KEYS)[number]

export const BREWERY_TYPES: Record<BreweryType, { label: string; help: string }> = {
  micro: {
    label: 'Micro',
    help: 'Under 15,000 barrels a year, with most of its beer sold off-site.',
  },
  nano: {
    label: 'Nano',
    help: 'Very small batch — a few barrels at a time, usually one or two brewers.',
  },
  regional: {
    label: 'Regional',
    help: '15,000 to 6 million barrels a year, distributed across several states.',
  },
  brewpub: {
    label: 'Brewpub',
    help: 'A restaurant-brewery that sells at least 25% of its beer on-site.',
  },
  large: {
    label: 'Large',
    help: 'Over 6 million barrels a year, with national distribution.',
  },
  contract: {
    label: 'Contract',
    help: 'Brews under contract for other brands rather than its own label.',
  },
  proprietor: {
    label: 'Proprietor',
    help: 'Owns the recipe and brand but rents brewing capacity elsewhere.',
  },
}

export function isBreweryType(value: string | null): value is BreweryType {
  return BREWERY_TYPE_KEYS.includes(value as BreweryType)
}
