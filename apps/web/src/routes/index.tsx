// The '/' route — the landing page is the app's only page (D-008).
import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '../components/LandingPage'

export const Route = createFileRoute('/')({
  component: LandingPage,
})
