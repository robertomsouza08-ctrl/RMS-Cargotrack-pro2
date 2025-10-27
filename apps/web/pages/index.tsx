
import React from 'react'

type Shipment = { id: string; code: string; origin: string; destination: string; status: string; eta: string }

export default async function Home(){
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const res = await fetch(`${api}/shipments`, { cache: 'no-store' })
  const shipments: Shipment[] = await res.json()
  return (
    <div style={{padding:20}}>
      <h1>RMS CargoTrack Pro</h1>
      <p>API: {api}</p>
      <ul>
        {shipments.map(s => (
          <li key={s.id}>{s.code} — {s.origin} → {s.destination} — {s.status}</li>
        ))}
      </ul>
      <p><a href="/health">Health</a></p>
    </div>
  )
}
