
import { headers } from 'next/headers'

// Resolve a base URL absoluta para fetch server-side
export function getBaseUrl() {
  // 1) Preferir NEXT_PUBLIC_BASE_URL se definida
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')
  }
  // 2) Derivar de x-forwarded headers (Railway/Proxies)
  const h = headers()
  const proto = h.get('x-forwarded-proto') || 'https'
  const host = h.get('x-forwarded-host') || h.get('host')
  if (host) return `${proto}://${host}`
  // 3) Fallback local
  return 'http://localhost:3000'
}
