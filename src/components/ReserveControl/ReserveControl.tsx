import { Check } from '@untitled-ui/icons-react'
import type { Reservation } from '@/lib/reservations'
import styles from './ReserveControl.module.scss'

type ReserveControlProps = {
  breweryName: string
  isWaitlist: boolean
  onOpen: () => void
  reservation: Reservation | undefined
}

export default function ReserveControl({
  breweryName,
  isWaitlist,
  onOpen,
  reservation,
}: ReserveControlProps) {
  if (reservation?.kind === 'reserving') {
    return (
      <span className={styles.control} data-state="reserving">
        <span className={styles.spinner} />
        Reserving
      </span>
    )
  }

  if (reservation?.kind === 'reserved') {
    return (
      <span className={styles.control} data-state="reserved">
        <Check aria-hidden="true" height={14} width={14} />
        Reserved
      </span>
    )
  }

  if (reservation?.kind === 'ready') {
    return (
      <button
        className={styles.control}
        data-state="ready"
        onClick={onOpen}
        type="button"
      >
        <Check aria-hidden="true" height={14} width={14} />
        Table ready
      </button>
    )
  }

  if (reservation?.kind === 'inLine') {
    return (
      <button
        aria-label={`You are number ${reservation.position} in line at ${breweryName}. Open waitlist`}
        className={styles.control}
        data-state="in-line"
        onClick={onOpen}
        type="button"
      >
        {`In line · #${reservation.position}`}
      </button>
    )
  }

  return (
    <button
      aria-label={`${isWaitlist ? 'Join waitlist' : 'Reserve table'} at ${breweryName}`}
      className={styles.control}
      data-state="idle"
      onClick={onOpen}
      type="button"
    >
      {isWaitlist ? 'Join waitlist' : 'Reserve table'}
    </button>
  )
}
