import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { CreateForm } from './components/CreateForm'
import { prisma } from '../lib/prisma'
import { redirect } from 'next/navigation'

export default async function Home({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; sortBy?: string; sortDir?: string }
}) {
  const q = searchParams?.q || ''
  const status = searchParams?.status || ''
  const sortBy = searchParams?.sortBy || 'createdAt'
  const sortDir = searchParams?.sortDir === 'asc' ? 'asc' : 'desc'

  const session = await getServerSession()
  const isAuthed = !!session

  const where: any = {}
  if (q) {
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { origin: { contains: q, mode: 'insensitive' } },
      { destination: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (status) {
    where.status = status
  }

  const shipments = await prisma.shipment.findMany({
    where,
    orderBy: { [sortBy]: sortDir },
  })

  return (
    <div>
      <h1 style={{margin:'8px 0', color:'#fff'}}>Visão Geral</h1>

      <form action="/" method="get" style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:16}}>
        <input name="q" placeholder="Buscar por código, origem, destino" defaultValue={q} style={{flex:'1 1 320px', padding:8, border:'1px solid #cbd5e1', borderRadius:8}} />
        <select name="status" defaultValue={status} style={{padding:8, border:'1px solid #cbd5e1', borderRadius:8}}>
          <option value="">Todos</option>
          <option value="IN_TRANSIT">Em trânsito</option>
          <option value="CHECKED_IN">Conferido</option>
          <option value="DELIVERED">Entregue</option>
        </select>
        <select name="sortBy" defaultValue={sortBy} style={{padding:8, border:'1px solid #cbd5e1', borderRadius:8}}>
          <option value="createdAt">Criação</option>
          <option value="eta">ETA</option>
          <option value="status">Status</option>
        </select>
        <select name="sortDir" defaultValue={sortDir} style={{padding:8, border:'1px solid #cbd5e1', borderRadius:8}}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <button type="submit" style={{padding:'8px 12px', border:'1px solid #cbd5e1', borderRadius:8, background:'#fff', cursor:'pointer'}}>Filtrar</button>
      </form>

      {isAuthed ? (
        <CreateForm action={createAction} />
      ) : (
        <div style={{padding:12, background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12, margin:'16px 0'}}>
          <strong>Precisa estar autenticado para criar shipments.</strong> <a href="/signin" style={{color:'#17A2A4'}}>Entrar</a>
        </div>
      )}

      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12}}>
          <thead>
            <tr style={{background:'#f9fafb', borderBottom:'1px solid #e5e7eb'}}>
              <th style={{padding:12, textAlign:'left'}}>Código</th>
              <th style={{padding:12, textAlign:'left'}}>Origem</th>
              <th style={{padding:12, textAlign:'left'}}>Destino</th>
              <th style={{padding:12, textAlign:'left'}}>Status</th>
              <th style={{padding:12, textAlign:'left'}}>ETA</th>
              <th style={{padding:12, textAlign:'left'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:12}}>{s.code}</td>
                <td style={{padding:12}}>{s.origin}</td>
                <td style={{padding:12}}>{s.destination}</td>
                <td style={{padding:12}}>
                  <span style={{color: s.status === 'DELIVERED' ? '#10b981' : s.status === 'CHECKED_IN' ? '#f59e0b' : '#3b82f6', fontWeight:700}}>
                    {s.status}
                  </span>
                </td>
                <td style={{padding:12}}>{s.eta ? new Date(s.eta).toLocaleString('pt-BR') : '-'}</td>
                <td style={{padding:12}}>
                  <Link href={`/shipments/${s.id}`} style={{color:'#17A2A4', fontWeight:600}}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

async function createAction(formData: FormData) {
  'use server'
  const code = formData.get('code') as string
  const origin = formData.get('origin') as string
  const destination = formData.get('destination') as string
  const eta = formData.get('eta') as string

  await prisma.shipment.create({
    data: {
      code,
      origin,
      destination,
      eta: eta ? new Date(eta) : null,
      status: 'IN_TRANSIT',
    },
  })

  redirect('/')
}
