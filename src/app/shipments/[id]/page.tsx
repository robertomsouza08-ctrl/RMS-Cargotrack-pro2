import { getServerSession } from 'next-auth'

import React from 'react'
import { getBaseUrl } from '../../lib/baseUrl'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'

const ShipmentMap = dynamic(() => import('../../components/ShipmentMap'), { ssr: false })

type Shipment = { 
  id:string; code:string; origin:string; destination:string; status:string; eta?: string | null;
  originLat?: number | null; originLng?: number | null; destLat?: number | null; destLng?: number | null;
}

function StatusBadge({ status }: { status: string }){
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
    <div style={{background:'rgba(255,255,255,0.95)', padding:16, borderRadius:12}}>
      <p style={{color:'#a00'}}>Shipment não encontrado.</p>
      <p><Link href="/">← Voltar</Link></p>
    </div>
  )

  const hasCoords = s.originLat && s.originLng && s.destLat && s.destLng

  const session = await getServerSession()
  const isAuthed = !!session
  const session = await getServerSession()
  const isAuthed = !!session
  return (
    <div style={{maxWidth:680, margin:'0 auto'}}>
      <p><Link href="/" style={{color:'#0B1B3B', fontWeight:600}}>← Voltar</Link></p>
      <div style={{background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12, padding:16, boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
        <h1 style={{marginTop:0}}>{s.code}</h1>
        <div style={{margin:'8px 0'}}><StatusBadge status={s.status} /></div>
        <div style={{color:'#334155', marginTop:8}}><strong>Origem:</strong> {s.origin}</div>
        <div style={{color:'#334155'}}><strong>Destino:</strong> {s.destination}</div>
        {s.eta && <div style={{color:'#334155'}}><strong>ETA:</strong> {new Date(s.eta).toLocaleDateString('pt-BR')}</div>}

        {hasCoords ? (
          <div style={{marginTop:16}}>
            <h3 style={{marginBottom:8}}>Mapa da Rota</h3>
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <ShipmentMap 
              origin={{ name: s.origin, lat: s.originLat!, lng: s.originLng! }}
              destination={{ name: s.destination, lat: s.destLat!, lng: s.destLng! }}
              status={s.status}
            />
          </div>
        ) : (
          <div style={{marginTop:16, padding:12, background:'#f9fafb', borderRadius:8, color:'#64748b'}}>
            📍 Coordenadas não disponíveis para este shipment.
          </div>
        )}

        {isAuthed ? (<form action={updateStatus} style={{marginTop:16, padding:12, background:'#f9fafb', borderRadius:8}}>
          <input type="hidden" name="id" value={s.id} />
          <label style={{display:'block', marginBottom:4, fontWeight:600}}>Alterar status:</label>
          <select name="status" defaultValue={s.status} style={{padding:8, border:'1px solid #cbd5e1', borderRadius:8, marginRight:8}}>
            <option value="IN_TRANSIT">Em trânsito</option>
            <option value="CHECKED_IN">Check-in</option>
            <option value="DELIVERED">Entregue</option>
          </select>
          <button type="submit" style={{background:'#17A2A4', color:'#fff', padding:'8px 12px', borderRadius:8, border:'none', fontWeight:700, cursor:'pointer'}}>Salvar</button>
        </form>) : (<div style={{marginTop:16, padding:12, background:'#f9fafb', borderRadius:8}}><strong>Entre para alterar o status.</strong> <a href='/signin' style={{color:'#17A2A4'}}>Entrar</a></div>)
      </div>
    </div>
  )
}

async function updateStatus(formData: FormData){
  'use server'
  const base = getBaseUrl()
  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '')
  await fetch(`${base}/api/shipments/${id}`, { method:'PATCH', headers: { 'content-type':'application/json' }, body: JSON.stringify({ status }) })
  redirect(`/shipments/${id}`)
}
