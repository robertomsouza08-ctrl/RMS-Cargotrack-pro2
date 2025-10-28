
import React from 'react'
import { getBaseUrl } from './lib/baseUrl'
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

async function getShipments(searchParams: { q?: string; status?: string }): Promise<Shipment[]> {
  const base = getBaseUrl()
  const qs = new URLSearchParams()
  if (searchParams.q) qs.set('q', searchParams.q)
  if (searchParams.status) qs.set('status', searchParams.status)
  const url = `${base}/api/shipments${qs.toString() ? `?${qs.toString()}` : ''}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function Home({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const shipments = await getShipments(searchParams)
  const q = searchParams.q || ''
  const status = searchParams.status || ''

  return (
    <div>
      <h1 style={{margin:'8px 0'}}>Visão Geral</h1>
      <form action="/" method="get" style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:16}}>
        <input name="q" placeholder="Buscar por código, origem, destino" defaultValue={q} style={{flex:'1 1 320px', padding:8, border:'1px solid #cbd5e1', borderRadius:8}} />
        <select name="status" defaultValue={status} style={{padding:8, border:'1px solid #cbd5e1', borderRadius:8}}>
          <option value="">Todos</option>
          <option value="IN_TRANSIT">Em trânsito</option>
          <option value="CHECKED_IN">Check-in</option>
          <option value="DELIVERED">Entregue</option>
        </select>
        <button type="submit" style={{background:'#0B1B3B', color:'#fff', padding:'8px 12px', borderRadius:8, border:'none'}}>Aplicar</button>
      </form>

      <CreateForm />

      {shipments.length === 0 ? (
        <p style={{color:'#a00'}}>Nenhum shipment encontrado.</p>
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
                <div style={{marginTop:8, fontSize:12, color: etaColor(s.eta)}}>ETA: {new Date(s.eta).toLocaleDateString('pt-BR')}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function etaColor(iso: string){
  const d = new Date(iso)
  const today = new Date()
  const dd = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const de = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = (de.getTime() - dd.getTime())/86400000
  if (diff < 0) return '#b91c1c' // atrasado
  if (diff === 0) return '#b45309' // hoje
  return '#065f46' // no prazo
}

function CreateForm(){
  return (
    <form action={createAction} style={{display:'flex', gap:8, flexWrap:'wrap', margin:'16px 0', padding:12, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12}}>
      <input name="code" placeholder="Código" required style={fieldStyle} />
      <input name="origin" placeholder="Origem" required style={fieldStyle} />
      <input name="destination" placeholder="Destino" required style={fieldStyle} />
      <select name="status" defaultValue="IN_TRANSIT" style={fieldStyle}>
        <option value="IN_TRANSIT">Em trânsito</option>
        <option value="CHECKED_IN">Check-in</option>
        <option value="DELIVERED">Entregue</option>
      </select>
      <input type="date" name="eta" style={fieldStyle} />
      <button type="submit" style={{background:'#17A2A4', color:'#0B1B3B', padding:'8px 12px', borderRadius:8, border:'none', fontWeight:700}}>Criar</button>
    </form>
  )
}

const fieldStyle = { padding:'8px 10px', border:'1px solid #cbd5e1', borderRadius:8 } as React.CSSProperties

async function createAction(formData: FormData){
  'use server'
  const base = getBaseUrl()
  const payload:any = {
    code: String(formData.get('code') || ''),
    origin: String(formData.get('origin') || ''),
    destination: String(formData.get('destination') || ''),
    status: String(formData.get('status') || 'IN_TRANSIT'),
  }
  const eta = formData.get('eta') as string | null
  if (eta) payload.eta = new Date(eta).toISOString()
  await fetch(`${base}/api/shipments`, { method:'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(payload) })
}
