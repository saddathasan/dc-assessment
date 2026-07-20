// Root of the file-based route tree (D-008): a bare outlet — page chrome
// (nav/footer) belongs to Sections, not the router shell.
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => <Outlet />,
})
