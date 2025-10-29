
import Link from 'next/link'
import { getServerSession } from 'next-auth'

export default async function ShipmentDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession()
  const isAuthed = !!session

  // TODO: carregar shipment existente
  // const s = await prisma.shipment.findUnique({ where: { id: params.id } })
  // if (!s) notFound()

  return (
    <div style={{maxWidth:680, margin:'0 auto'}}>
      <p><Link href="/" style={{color:'#0B1B3B', fontWeight:600}}>← Voltar</Link></p>

      <div style={{background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12, padding:16, boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
        <h1 style={{marginTop:0}}>Detalhe do Shipment</h1>
        {/* TODO: detalhes existentes */}

        {isAuthed ? (
          <form action={updateStatus} style={{display:'flex', gap:8, alignItems:'center', marginTop:16}}>
            {/* seus inputs/selects */}
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

// async function updateStatus(formData: FormData) {
//   'use server'
//   // TODO: sua lógica de update via prisma
// }
