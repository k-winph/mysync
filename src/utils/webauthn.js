// Biometric unlock via WebAuthn platform authenticator (fingerprint / Face /
// Windows Hello). No server: we register a credential on this device and, to
// unlock, run a get() ceremony with userVerification required. A successful
// ceremony (the OS biometric prompt passing) is our unlock gate. This is a
// local convenience on top of the PIN, not server-verified authentication.

function bufToB64url(buf) {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlToBuf(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = str.length % 4 ? 4 - (str.length % 4) : 0
  str += '='.repeat(pad)
  const bin = atob(str)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

export function webauthnSupported() {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential
}

/** True if this device has a usable platform biometric authenticator. */
export async function biometricAvailable() {
  if (!webauthnSupported()) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

/** Register a platform credential; returns its id (base64url) to store, or throws. */
export async function registerBiometric() {
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = crypto.getRandomValues(new Uint8Array(16))
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'MySync' }, // rp.id defaults to the current domain
      user: { id: userId, name: 'mysync', displayName: 'MySync user' },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'none',
    },
  })
  if (!cred) throw new Error('NO_CRED')
  return bufToB64url(cred.rawId)
}

/** Run the biometric ceremony for a stored credential id. Returns true on success. */
export async function verifyBiometric(credId) {
  if (!credId) return false
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ type: 'public-key', id: b64urlToBuf(credId), transports: ['internal'] }],
      userVerification: 'required',
      timeout: 60000,
    },
  })
  return !!assertion
}
