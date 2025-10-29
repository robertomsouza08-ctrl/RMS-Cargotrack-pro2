
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { CreateForm } from './components/CreateForm'

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

  // TODO: substitua abaixo pelo seu carregamento atual de dados (ex: via prisma/fetch)
  // const { data, total } = await fetchShipments({ q, status, sortBy, sortDir })

  return (
    <div>
      <h1 style={{margin:'8px 0'}}>Visão Geral</h1>

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
        <button type="submit" style={{padding:'8px 12px', border:'1px solid #cbd5e1', borderRadius:8, background:'#fff'}}>Filtrar</button>
      </form>

      {isAuthed ? (
        <CreateForm action={createAction} />
      ) : (
        <div style={{padding:12, background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12, margin:'16px 0'}}>
          <strong>Precisa estar autenticado para criar shipments.</strong> <a href="/signin" style={{color:'#17A2A4'}}>Entrar</a>
        </div>
      )}

      {/* TODO: Renderize sua lista/tabela aqui */}
    </div>
  )
}

async function createAction(formData: FormData) {
  'use server'
  // TODO: sua lógica atual de criação via prisma permanece aqui
}
