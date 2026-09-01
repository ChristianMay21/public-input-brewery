'use client'

import { Check, XClose } from '@untitled-ui/icons-react'
import { Dialog } from 'radix-ui'
import type { Brewery } from '@/lib/breweries'
import { type Reservation, waitlistProgress } from '@/lib/reservations'
import styles from './WaitlistDialog.module.scss'

type WaitlistDialogProps = {
  brewery: Brewery | null
  onClose: () => void
  onJoin: () => void
  onLeave: () => void
  reservation: Reservation | undefined
}

export default function WaitlistDialog({
  brewery,
  onClose,
  onJoin,
  onLeave,
  reservation,
}: WaitlistDialogProps) {
  const step = reservation?.kind === 'inLine' || reservation?.kind === 'ready' ? reservation.kind : 'intro'

  function handleOpenChange(open: boolean) {
    if (!open) onClose()
  }

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={brewery !== null}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.card} data-step={step}>
          <div className={styles.header}>
            <div className={styles.heading}>
              <p className={styles.kicker}>Waitlist</p>
              <Dialog.Title className={styles.name}>{brewery?.name ?? ''}</Dialog.Title>
            </div>
            <Dialog.Close aria-label="Close" className={styles.close}>
              <XClose aria-hidden="true" height={15} width={15} />
            </Dialog.Close>
          </div>

          {step === 'intro' ? (
            <div className={styles.body}>
              <Dialog.Description className={styles.copy}>
                Seats are limited right now, so reservations are handled as a waitlist. Join it
                and we&rsquo;ll hold your place in line.
              </Dialog.Description>
              <button className={styles.primary} onClick={onJoin} type="button">
                Join the waitlist
              </button>
            </div>
          ) : null}

          {step === 'inLine' && reservation?.kind === 'inLine' ? (
            <div className={styles.body}>
              <p className={styles.position}>
                <span className={styles.positionNumber}>{`#${reservation.position}`}</span>
                <span className={styles.positionLabel}>in line</span>
              </p>
              <Dialog.Description className={styles.copy}>
                We will text you when your table is close. You can leave the waitlist any time.
              </Dialog.Description>
              <div
                aria-label="Waitlist progress"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={waitlistProgress(reservation)}
                className={styles.progress}
                role="progressbar"
              >
                <span
                  className={styles.progressFill}
                  style={{ width: `${waitlistProgress(reservation)}%` }}
                />
              </div>
              <button className={styles.secondary} onClick={onLeave} type="button">
                Leave the waitlist
              </button>
            </div>
          ) : null}

          {step === 'ready' ? (
            <div className={styles.body}>
              <span className={styles.readyMark}>
                <Check aria-hidden="true" height={24} width={24} />
              </span>
              <p className={styles.readyHeading}>Your spot is ready</p>
              <Dialog.Description className={styles.copy}>
                {`Head to the host stand at ${brewery?.name ?? ''} within the next 10 minutes.`}
              </Dialog.Description>
              <button className={styles.primary} onClick={onClose} type="button">
                Got it
              </button>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
