import { List, Map01 } from '@untitled-ui/icons-react'
import styles from './ViewToggle.module.scss'

export type ResultsView = 'list' | 'map'

type ViewToggleProps = {
  onChange: (view: ResultsView) => void
  view: ResultsView
}

export default function ViewToggle({ onChange, view }: ViewToggleProps) {
  return (
    <div className={styles.toggle} role="group">
      <button
        aria-pressed={view === 'list'}
        className={styles.option}
        data-selected={view === 'list'}
        onClick={function showList() {
          onChange('list')
        }}
        type="button"
      >
        <List aria-hidden="true" height={14} width={14} />
        List
      </button>
      <button
        aria-pressed={view === 'map'}
        className={styles.option}
        data-selected={view === 'map'}
        onClick={function showMap() {
          onChange('map')
        }}
        type="button"
      >
        <Map01 aria-hidden="true" height={14} width={14} />
        Map
      </button>
    </div>
  )
}
