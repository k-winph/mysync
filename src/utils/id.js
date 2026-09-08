// Generate a unique id. crypto.randomUUID is available in all modern browsers
// and in the PWA context. Fallback kept for very old environments.
export function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}
