// Local notifications. No backend/push server — we can only notify while the
// app is open (foreground), so callers fire these on app open. Prefer the
// service worker registration so notifications also work for the installed PWA.

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission() {
  return notificationsSupported() ? Notification.permission : 'unsupported'
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export async function showNotification(title, options = {}) {
  if (notificationPermission() !== 'granted') return
  const opts = { icon: '/mysync/icon-192.png', badge: '/mysync/icon-192.png', ...options }
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg && reg.showNotification) {
        reg.showNotification(title, opts)
        return
      }
    }
  } catch {
    /* fall through to the plain Notification */
  }
  try {
    new Notification(title, opts)
  } catch {
    /* ignore */
  }
}
