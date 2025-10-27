
import React from 'react'

export default async function Health(){
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const res = await fetch(`${api}/health`, { cache: 'no-store' })
  const data = await res.json()
  return (
    <pre style={{padding:16}}>{JSON.stringify(data, null, 2)}</pre>
  )
}
