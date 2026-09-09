// PIN hashing. We never store the PIN itself — only a SHA-256 hash (with a
// fixed app prefix). NOTE: a client-side PIN is a casual privacy lock, not real
// security — the data still lives in localStorage on this device. It keeps
// over-the-shoulder / shared-phone snooping out, nothing more.
export async function hashPin(pin) {
  const data = new TextEncoder().encode('mysync-pin:' + pin)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** True if the entered PIN matches the stored hash. */
export async function verifyPin(pin, hash) {
  if (!hash) return false
  return (await hashPin(pin)) === hash
}
