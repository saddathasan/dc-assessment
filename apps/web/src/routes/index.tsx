import { createFileRoute } from '@tanstack/react-router'
import { TokenDemo } from '../components/TokenDemo'

export const Route = createFileRoute('/')({
  component: TokenDemo,
})
