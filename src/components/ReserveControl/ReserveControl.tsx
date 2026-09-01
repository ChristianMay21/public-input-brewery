import { Check } from '@untitled-ui/icons-react'
import type { Reservation } from '@/lib/reservations'
import styles from './ReserveControl.module.scss'

type ReserveControlProps = {
  breweryName: string
  isWaitlist: boolean
  onCancel: () => void
  onOpen: () => void
  reservation: Reservation | undefined
}

export default function ReserveControl({
  breweryName,
  isWaitlist,
  onCancel,
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
      <button
        aria-label={`Cancel reservation at ${breweryName}`}
        className={styles.control}
        data-state="reserved"
        onClick={onCancel}
        type="button"
      >
        <Check aria-hidden="true" height={14} width={14} />
        Cancel reservation
      </button>
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
        aria-label={`Leave waitlist at ${breweryName}. You are number ${reservation.position} in line.`}
        className={styles.control}
        data-state="in-line"
        onClick={onCancel}
        type="button"
      >
        {`Leave waitlist · #${reservation.position}`}
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
