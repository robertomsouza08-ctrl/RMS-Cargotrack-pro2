
import React from 'react'
import { getBaseUrl } from './lib/baseUrl'

type Shipment = { id: string; code: string; origin: string; destination: string; status: string; eta?: string }

async function getShipments(): Promise<Shipment[]> {
  const base = getBaseUrl()
  try {
    const res = await fetch(`${base}/api/shipments`, { cache: 'no-store' })
    if (!res.ok) {
      console.error('Falha ao carregar shipments:', res.status, await res.text())
      return []
    }
    return res.json()
  } catch (e) {
    console.error('Erro ao buscar shipments:', e)
    return []
  }
}

export default async function Home() {
  const shipments = await getShipments()
  return (
    <div>
      <h1 style={{margin:'8px 0'}}>Visão Geral</h1>
      <p style={{color:'#555'}}>Versão simplificada: 1 serviço (UI + API) sem configs extras.</p>
      {shipments.length === 0 ? (
        <p style={{color:'#a00'}}>Nenhum shipment retornado. Verifique /api/shipments e os logs.</p>
      ) : (
        <ul>
          {shipments.map(s => (
            <li key={s.id}>
              <strong>{s.code}</strong> — {s.origin} → {s.destination} — <em>{s.status}</em>{s.eta ? ` — ETA: ${new Date(s.eta).toLocaleDateString('pt-BR')}` : ''}
            </li>
          ))}
        </ul>
      )}
      <p style={{marginTop:12}}><a href="/health">Ver Health</a></p>
    </div>
  )
}
