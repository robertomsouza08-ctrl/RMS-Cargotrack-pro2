
import React from 'react'

type Shipment = { id: string; code: string; origin: string; destination: string; status: string; eta?: string }

async function getShipments(): Promise<Shipment[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  const res = await fetch(`${base}/api/shipments`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Falha ao carregar shipments')
  return res.json()
}

export default async function Home() {
  const shipments = await getShipments()
  return (
    <div>
      <h1 style={{margin:'8px 0'}}>Visão Geral</h1>
      <p style={{color:'#555'}}>Versão simplificada: 1 serviço (UI + API) sem configs extras.</p>
      <ul>
        {shipments.map(s => (
          <li key={s.id}>
            <strong>{s.code}</strong> — {s.origin} → {s.destination} — <em>{s.status}</em>{s.eta ? ` — ETA: ${new Date(s.eta).toLocaleDateString('pt-BR')}` : ''}
          </li>
        ))}
      </ul>
      <p style={{marginTop:12}}><a href="/health">Ver Health</a></p>
    </div>
  )
}
