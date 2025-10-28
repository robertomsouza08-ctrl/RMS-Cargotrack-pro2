
import React from 'react'

async function getHealth(){
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  const res = await fetch(`${base}/api/health`, { cache: 'no-store' })
  return res.json()
}

export default async function Health(){
  const data = await getHealth()
  return <pre style={{background:'#f7f7f7', padding:12, border:'1px solid #eee'}}>{JSON.stringify(data, null, 2)}</pre>
}
