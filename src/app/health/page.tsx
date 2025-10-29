
import React from 'react'
import { getBaseUrl } from '../lib/baseUrl'

async function getHealth(){
  const base = getBaseUrl()
  try {
    const res = await fetch(`${base}/api/health`, { cache: 'no-store' })
    if (!res.ok) {
      return { status: 'error', code: res.status }
    }
    return res.json()
  } catch (e) {
    return { status: 'error', message: 'fetch failed' }
  }
}

export default async function Health(){
  const data = await getHealth()
  return (
    <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
      <h1 style={{marginTop:0}}>Health</h1>
      <pre style={{background:'#0b1b3b', color:'#bfe3e4', padding:12, borderRadius:8}}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
