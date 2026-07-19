// Interaction contract for the Hero video modal (MS-3, TDD-first): native <dialog>
// open/close/focus lifecycle, the content-driven provider union (D-018), and the
// sentinel focus trap the YouTube iframe requires. Visual checks live in tests/fidelity/.
import { useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { VideoSource } from '@metatech/shared'
import { VideoModal } from './VideoModal'

/** Mirrors apps/api/src/data/hero.json's video payload (D-023 YouTube placeholder). */
const youtubeVideo: VideoSource = {
  provider: 'youtube',
  src: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
}

/** The self-hosted alternative D-018 keeps one content change away. */
const fileVideo: VideoSource = { provider: 'file', src: '/videos/metatech.mp4' }

/** Stand-in for the Hero: a play trigger owning the modal's mounted-while-open state. */
function Harness({ video }: { video: VideoSource }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Play the MetaTech video
      </button>
      {open && <VideoModal video={video} onClose={() => setOpen(false)} />}
    </>
  )
}

async function openModal(video: VideoSource) {
  const user = userEvent.setup()
  render(<Harness video={video} />)
  await user.click(screen.getByRole('button', { name: 'Play the MetaTech video' }))
  return { user, dialog: screen.getByRole('dialog') }
}

/**
 * With no CSS in happy-dom the dialog's transition duration computes to 0, so the
 * component takes its reduced-motion path and every close settles synchronously —
 * closed, unmounted, focus and scroll restored — before this assertion runs.
 */
function expectClosed() {
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
}

afterEach(() => {
  document.body.style.overflow = ''
})

describe('VideoModal lifecycle', () => {
  it('opens as a modal dialog, locks scroll, and starts focus on the close button', async () => {
    const { dialog } = await openModal(youtubeVideo)

    expect(dialog).toBeInTheDocument()
    expect((dialog as HTMLDialogElement).open).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(screen.getByRole('button', { name: /close video/i })).toHaveFocus()
  })

  it('closes from the close button, unlocks scroll, and returns focus to the trigger', async () => {
    const { user } = await openModal(youtubeVideo)

    await user.click(screen.getByRole('button', { name: /close video/i }))
    expectClosed()
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(screen.getByRole('button', { name: 'Play the MetaTech video' })).toHaveFocus()
  })

  it('closes on the dialog cancel event (Esc) and returns focus to the trigger', async () => {
    const { dialog } = await openModal(youtubeVideo)

    // Browsers turn Esc into a cancelable `cancel` on the open <dialog>; the real
    // keypress is exercised in the Playwright fidelity spec.
    act(() => {
      dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
    })
    expectClosed()
    expect(screen.getByRole('button', { name: 'Play the MetaTech video' })).toHaveFocus()
  })

  it('closes when the backdrop (the dialog surface itself) is clicked', async () => {
    const { user, dialog } = await openModal(youtubeVideo)

    await user.click(dialog)
    expectClosed()
  })
})

describe('Provider union (D-018)', () => {
  it('renders a YouTube iframe with autoplay for the youtube provider', async () => {
    await openModal(youtubeVideo)

    const iframe = screen.getByTitle('MetaTech video')
    expect(iframe.tagName).toBe('IFRAME')
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/aqz-KE-bpKQ?autoplay=1')
    expect(document.querySelector('video')).not.toBeInTheDocument()
  })

  it('renders a native <video> for the file provider', async () => {
    await openModal(fileVideo)

    const video = document.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', '/videos/metatech.mp4')
    expect(video).toHaveAttribute('controls')
    expect(document.querySelector('iframe')).not.toBeInTheDocument()
  })
})

describe('Focus trap', () => {
  it('wraps forward: focus leaving the media redirects to the close button', async () => {
    await openModal(youtubeVideo)

    // Tabbing out of the embedded player lands on the end sentinel — the manual
    // trap the iframe needs because keydown handlers cannot see inside it (D-018).
    screen.getByTestId('video-trap-end').focus()
    expect(screen.getByRole('button', { name: /close video/i })).toHaveFocus()
  })

  it('wraps backward: Shift+Tab off the close button redirects into the media', async () => {
    await openModal(youtubeVideo)

    screen.getByTestId('video-trap-start').focus()
    expect(screen.getByTitle('MetaTech video')).toHaveFocus()
  })

  it('wraps around the native video for the file provider too', async () => {
    await openModal(fileVideo)

    screen.getByTestId('video-trap-start').focus()
    expect(document.querySelector('video')).toHaveFocus()
  })
})
