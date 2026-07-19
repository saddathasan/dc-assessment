// Hero video modal (note 1:510 — popup design is ours): native <dialog> in the top
// layer (D-010), media switched by the content payload's provider union (D-018).
// Mounted only while open, like the hamburger overlay; the caller unmounts on close.
import { useEffect, useRef, useState } from 'react'
import type { VideoSource } from '@metatech/shared'

interface VideoModalProps {
  video: VideoSource
  /** Fires after the exit transition completes; the caller unmounts the modal. */
  onClose: () => void
}

/** Modal video player: showModal lifecycle, scroll lock, sentinel focus trap, Esc via cancel. */
export function VideoModal({ video, onClose }: VideoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const mediaRef = useRef<HTMLIFrameElement | HTMLVideoElement | null>(null)
  const [closing, setClosing] = useState(false)

  // Open lifecycle: top-layer modal + scroll lock (the top layer doesn't lock the
  // page), focus starting on the close button; unmount hands focus back to the
  // play button that opened us.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    dialogRef.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
      opener?.focus()
    }
  }, [])

  // Esc arrives as the dialog's cancelable `cancel` event; swallowing the instant
  // native close routes it through the transition-aware path below. Attached by
  // hand because `cancel` doesn't bubble to React's delegated root.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onCancel = (event: Event) => {
      event.preventDefault()
      setClosing(true)
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [])

  // Safari drops the exit transition when close() fires in the same frame (D-010):
  // hold the dialog open until its own opacity transition ends. With no effective
  // transition (reduced motion), close synchronously; the timeout is only a safety
  // net for a lost transitionend.
  useEffect(() => {
    if (!closing) return
    const dialog = dialogRef.current
    const finish = () => {
      dialog?.close()
      onClose()
    }
    if (!dialog || !(parseFloat(getComputedStyle(dialog).transitionDuration) > 0)) {
      finish()
      return
    }
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === dialog && event.propertyName === 'opacity') finish()
    }
    dialog.addEventListener('transitionend', onTransitionEnd)
    const fallback = window.setTimeout(finish, 250)
    return () => {
      dialog.removeEventListener('transitionend', onTransitionEnd)
      window.clearTimeout(fallback)
    }
  }, [closing, onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-label="MetaTech video"
      data-closing={closing || undefined}
      // Clicks whose target is the dialog itself hit the backdrop area, not the panel.
      onClick={(event) => {
        if (event.target === dialogRef.current) setClosing(true)
      }}
      className="m-auto w-[min(1200px,calc(100vw-40px))] bg-transparent p-0 backdrop:bg-[rgba(3,32,25,0.85)] data-closing:opacity-0 motion-safe:animate-menu-in motion-safe:transition-opacity motion-safe:duration-200"
    >
      {/* Sentinels wrap the tab order manually: keydown traps can't see inside the
          YouTube iframe, so focus leaving either end is caught and redirected (D-018). */}
      <div
        data-testid="video-trap-start"
        tabIndex={0}
        aria-hidden="true"
        onFocus={() => mediaRef.current?.focus()}
      />
      <div className="flex justify-end pb-2.5">
        <button
          ref={closeRef}
          type="button"
          aria-label="Close video"
          onClick={() => setClosing(true)}
          className="flex h-10 w-10 items-center justify-center rounded-card transition-colors hover:bg-[rgba(255,255,255,0.25)]"
        >
          {/* Same 14px round-cap cross as the hamburger overlay's close icon. */}
          <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="aspect-video overflow-hidden rounded-bar bg-black">
        {video.provider === 'youtube' ? (
          <iframe
            ref={(el) => {
              mediaRef.current = el
            }}
            // The play button was an explicit request to watch, so autoplay is expected.
            src={`${video.src}${video.src.includes('?') ? '&' : '?'}autoplay=1`}
            title="MetaTech video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <video
            ref={(el) => {
              mediaRef.current = el
            }}
            src={video.src}
            aria-label="MetaTech video"
            controls
            autoPlay
            className="h-full w-full"
          />
        )}
      </div>
      <div
        data-testid="video-trap-end"
        tabIndex={0}
        aria-hidden="true"
        onFocus={() => closeRef.current?.focus()}
      />
    </dialog>
  )
}
