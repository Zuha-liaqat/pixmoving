import { useEffect } from 'react'

function getButtonLabel(button) {
  const explicit = button.getAttribute('data-analytics-label') || button.getAttribute('aria-label')
  if (explicit && explicit.trim()) return explicit.trim()

  const text = button.textContent.replace(/\s+/g, ' ').trim()
  if (text) return text.slice(0, 60)

  return button.getAttribute('title') || button.id || button.name || 'unnamed button'
}

export default function useButtonClickTracking() {
  useEffect(() => {
    function handleClick(event) {
      const button = event.target.closest('button, [role="button"]')
      if (!button || button.disabled) return
      if (typeof window.gtag !== 'function') return

      const params = {
        button_name: getButtonLabel(button),
        page_path: window.location.pathname,
        page_location: window.location.href,
      }

      window.gtag('event', 'button_click', params)

      const keyEventName = button.getAttribute('data-analytics-event')
      if (keyEventName) {
        window.gtag('event', keyEventName, params)
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])
}
