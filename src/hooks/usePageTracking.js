import { useEffect } from 'react'
import { useLocation, matchPath } from 'react-router-dom'

const PAGE_TITLES = [
  { path: '/', title: 'Login' },
  { path: '/dashboard', title: 'Dashboard' },
  { path: '/create-post', title: 'Create Post' },
  { path: '/themes', title: 'Themes' },
  { path: '/library', title: 'Library' },
  { path: '/approval-queue', title: 'Approval Queue' },
  { path: '/approval-queue/:id/edit', title: 'Edit Content' },
  { path: '/calendar', title: 'Calendar' },
  { path: '/notifications', title: 'Notifications' },
  { path: '/integrations', title: 'Integrations' },
  { path: '/notification-channels', title: 'Notification Channels' },
  { path: '/planner', title: 'Planner' },
  { path: '/settings', title: 'Settings' },
]

function getPageTitle(pathname) {
  const match = PAGE_TITLES.find((entry) => matchPath({ path: entry.path, end: true }, pathname))
  return match ? match.title : 'Financial Market'
}

export default function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    const pageTitle = getPageTitle(location.pathname)
    document.title = `${pageTitle} | Financial Market`

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_path: location.pathname + location.search,
        page_location: window.location.href,
      })
    }
  }, [location])
}
