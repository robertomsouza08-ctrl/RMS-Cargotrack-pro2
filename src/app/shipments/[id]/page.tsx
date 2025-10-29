import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../lib/prisma'
import { redirect } from 'next/navigation'

export default async function ShipmentDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession()
  const isAuthed = !!session

  const s = await prisma.shipment.findUnique({ where: { id: params.id } })
  if (!s) {
    return (
      <div style={{maxWidth:680, margin:'0 auto'}}>
        <p><Link href="/" style={{color:'#fff', fontWeight:600}}>← Voltar</Link></p>
        <div style={{background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
          <h1>Shipment não encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <div style={{maxWidth:680, margin:'0 auto'}}>
      <p><Link href="/" style={{color:'#fff', fontWeight:600}}>← Voltar</Link></p>

      <div style={{background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12, padding:16, boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
        <h1 style={{marginTop:0}}>{s.code}</h1>
        <div style={{display:'grid', gap:8, marginBottom:16}}>
          <p><strong>Origem:</strong> {s.origin}</p>
          <p><strong>Destino:</strong> {s.destination}</p>
          <p><strong>Status:</strong> <span style={{color: s.status === 'DELIVERED' ? '#10b981' : s.status === 'CHECKED_IN' ? '#f59e0b' : '#3b82f6', fontWeight:700}}>{s.status}</span></p>
          {s.eta && <p><strong>ETA:</strong> {new Date(s.eta).toLocaleString('pt-BR')}</p>}
        </div>

        {isAuthed ? (
          <form action={updateStatus} style={{display:'flex', gap:8, alignItems:'center', marginTop:16}}>
            <input type="hidden" name="id" value={s.id} />
            <select name="status" defaultValue={s.status} style={{padding:8, border:'1px solid #cbd5e1', borderRadius:8}}>
              <option value="IN_TRANSIT">Em trânsito</option>
              <option value="CHECKED_IN">Conferido</option>
              <option value="DELIVERED">Entregue</option>
            </select>
            <button type="submit" style={{background:'#17A2A4', color:'#0B1B3B', fontWeight:700, padding:'6px 10px', borderRadius:8, border:'none', cursor:'pointer'}}>Salvar status</button>
          </form>
        ) : (
          <div style={{marginTop:16, padding:12, background:'#f9fafb', borderRadius:8}}>
            <strong>Entre para alterar o status.</strong> <a href="/signin" style={{color:'#17A2A4'}}>Entrar</a>
          </div>
        )}
      </div>
    </div>
  )
}

async function updateStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const status = (formData.get('status') as string) || ''
  if (!id || !status) return

  await prisma.shipment.update({ 
    where: { id }, 
    data: { status } 
  })

  redirect(`/shipments/${id}`)
}
