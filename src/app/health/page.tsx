
import React from 'react'
import { getBaseUrl } from '../lib/baseUrl'

async function getHealth(){
  const base = getBaseUrl()
  try {
    const res = await fetch(`${base}/api/health`, { cache: 'no-store' })
    if (!res.ok) {
      console.error('Falha ao carregar health:', res.status, await res.text())
      return { status: 'error', code: res.status }
    }
    return res.json()
  } catch (e) {
    console.error('Erro ao buscar health:', e)
    return { status: 'error', message: 'fetch failed' }
  }
}

export default async function Health(){
  const data = await getHealth()
  return <pre style={{background:'#f7f7f7', padding:12, border:'1px solid #eee'}}>{JSON.stringify(data, null, 2)}</pre>
}
