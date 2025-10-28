
import React from 'react'
import { getBaseUrl } from './lib/baseUrl'
import Link from 'next/link'

type Shipment = { id: string; code: string; origin: string; destination: string; status: string; eta?: string }

function StatusBadge({ status }: { status: string }){
  const map: Record<string, {bg:string,color:string,label:string}> = {
    in_transit: { bg:'#E6F7F7', color:'#0B7779', label:'Em trânsito' },
    checked_in:  { bg:'#FFF6E0', color:'#8A6A00', label:'Check-in' },
    delivered:   { bg:'#EAF7EA', color:'#2E7D32', label:'Entregue' },
  }
  const s = map[status] || { bg:'#EEE', color:'#555', label:status }
  return <span style={{background:s.bg, color:s.color, padding:'4px 8px', borderRadius:12, fontSize:12, fontWeight:600}}>{s.label}</span>
}

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
      <p style={{color:'#555'}}>Painel simplificado com cards e badges. Clique para ver detalhes.</p>
      {shipments.length === 0 ? (
        <p style={{color:'#a00'}}>Nenhum shipment retornado. Verifique /api/shipments e os logs.</p>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16}}>
          {shipments.map(s => (
            <Link key={s.id} href={`/shipments/${s.id}`} style={{
              display:'block', background:'#fff', border:'1px solid #e5e7eb', borderRadius:12,
              padding:16, boxShadow:'0 1px 2px rgba(0,0,0,0.03)', textDecoration:'none', color:'#0B1B3B'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                <strong>{s.code}</strong>
                <StatusBadge status={s.status} />
              </div>
              <div style={{color:'#334155'}}>{s.origin} → {s.destination}</div>
              {s.eta && (
                <div style={{marginTop:8, fontSize:12, color:'#475569'}}>ETA: {new Date(s.eta).toLocaleDateString('pt-BR')}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
