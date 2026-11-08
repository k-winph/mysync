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

// --- Daily "log your spending" reminder -------------------------------------
// Two layers (see the daily-reminder effect in App.jsx):
//  1. an on-open nudge (always reliable) handled by the caller, and
//  2. this best-effort SCHEDULED local notification via the Notification
//     Triggers API, which fires at the set time even when the app is closed —
//     but only on browsers that support it (installed Chrome/Android), and
//     silently does nothing elsewhere (iOS, unsupported browsers).

const DAILY_TAG = 'mysync-daily-reminder'

// True when the browser can schedule a notification for a future time.
export function scheduledNotificationsSupported() {
  try {
    return (
      'Notification' in window &&
      'showTrigger' in Notification.prototype &&
      typeof TimestampTrigger !== 'undefined'
    )
  } catch {
    return false
  }
}

async function swRegistration() {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.getRegistration()
  } catch {
    return null
  }
}

// Cancel any pending (not-yet-fired) scheduled daily reminder.
export async function cancelDailyReminder() {
  const reg = await swRegistration()
  if (!reg || !reg.getNotifications) return
  try {
    const pending = await reg.getNotifications({ tag: DAILY_TAG, includeTriggered: false })
    pending.forEach((n) => n.close())
  } catch {
    /* ignore */
  }
}

// (Re)schedule the next daily reminder. `hhmm` is 'HH:MM'. When `skipToday` is
// true (already logged today), the next fire is tomorrow. No-op — beyond
// clearing any pending one — on browsers without Notification Triggers.
export async function scheduleDailyReminder({ hhmm = '21:00', skipToday = false, title, body }) {
  if (notificationPermission() !== 'granted') return
  const reg = await swRegistration()
  if (!reg || !reg.showNotification) return
  await cancelDailyReminder()
  if (!scheduledNotificationsSupported()) return
  const [h, m] = hhmm.split(':').map(Number)
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0, 0, 0)
  if (skipToday || next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1)
  try {
    await reg.showNotification(title, {
      tag: DAILY_TAG,
      body,
      icon: '/mysync/icon-192.png',
      badge: '/mysync/icon-192.png',
      // eslint-disable-next-line no-undef
      showTrigger: new TimestampTrigger(next.getTime()),
      data: { url: '/mysync/?quickadd=1' },
    })
  } catch {
    /* ignore */
  }
}
