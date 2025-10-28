
import React from 'react'
import { getBaseUrl } from '../../lib/baseUrl'
import Link from 'next/link'
type Shipment = { id:string; code:string; origin:string; destination:string; status:string; eta?: string | null }

function StatusBadge({ status }: { status: Shipment['status'] }){
  const map: Record<string, {bg:string,color:string,label:string}> = {
    IN_TRANSIT: { bg:'#E6F7F7', color:'#0B7779', label:'Em trânsito' },
    CHECKED_IN:  { bg:'#FFF6E0', color:'#8A6A00', label:'Check-in' },
    DELIVERED:   { bg:'#EAF7EA', color:'#2E7D32', label:'Entregue' },
  }
  const s = map[status] || { bg:'#EEE', color:'#555', label:String(status) }
  return <span style={{background:s.bg, color:s.color, padding:'4px 8px', borderRadius:12, fontSize:12, fontWeight:600}}>{s.label}</span>
}

async function getShipment(id: string){
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/shipments/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json() as Promise<Shipment>
}

export default async function ShipmentDetail({ params }: { params: { id: string } }){
  const s = await getShipment(params.id)
  if (!s) return (
    <div>
      <p style={{color:'#a00'}}>Shipment não encontrado.</p>
      <p><Link href="/">← Voltar</Link></p>
    </div>
  )
  return (
    <div style={{maxWidth:680, margin:'0 auto'}}>
      <p><Link href="/">← Voltar</Link></p>
      <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16, boxShadow:'0 1px 2px rgba(0,0,0,0.03)'}}>
        <h1 style={{marginTop:0}}>{s.code}</h1>
        <div style={{margin:'8px 0'}}><StatusBadge status={s.status} /></div>
        <div style={{color:'#334155'}}><strong>Origem:</strong> {s.origin}</div>
        <div style={{color:'#334155'}}><strong>Destino:</strong> {s.destination}</div>
        {s.eta && <div style={{color:'#334155'}}><strong>ETA:</strong> {new Date(s.eta).toLocaleDateString('pt-BR')}</div>}
      </div>
    </div>
  )
}
