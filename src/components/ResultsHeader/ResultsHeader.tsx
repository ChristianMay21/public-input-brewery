import ViewToggle, { type ResultsView } from '@/components/ViewToggle/ViewToggle'
import styles from './ResultsHeader.module.scss'

type ResultsHeaderProps = {
  count: number
  location: string
  onViewChange: (view: ResultsView) => void
  view: ResultsView
}

export default function ResultsHeader({
  count,
  location,
  onViewChange,
  view,
}: ResultsHeaderProps) {
  return (
    <div className={styles.header}>
      <p className={styles.summary}>
        <strong className={styles.count}>{count}</strong>
        {` ${count === 1 ? 'brewery' : 'breweries'} near ${location}`}
      </p>
      <p className={styles.sort}>Sorted by distance</p>
      <div className={styles.view}>
        <ViewToggle onChange={onViewChange} view={view} />
      </div>
    </div>
  )
}
