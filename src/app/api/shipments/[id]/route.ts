
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { readJson } from '../../../lib/request'

const ALLOWED = new Set(['IN_TRANSIT','CHECKED_IN','DELIVERED'])

export async function GET(_: Request, { params }: { params: { id: string } }){
  const found = await prisma.shipment.findUnique({ where: { id: params.id } })
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(found)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }){
  const body = await readJson(req)
  if (!body) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  const { code, origin, destination, status, eta } = body
  try {
    const updated = await prisma.shipment.update({
      where: { id: params.id },
      data: {
        ...(code ? { code } : {}),
        ...(origin ? { origin } : {}),
        ...(destination ? { destination } : {}),
        ...(typeof status === 'string' && ALLOWED.has(status.toUpperCase()) ? { status: status.toUpperCase() } : {}),
        ...(eta !== undefined ? { eta: eta ? new Date(eta) : null } : {}),
      }
    })
    return NextResponse.json(updated)
  } catch (e:any) {
    return NextResponse.json({ error: 'Falha ao atualizar', detail: e?.message }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }){
  try {
    await prisma.shipment.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: 'Falha ao excluir', detail: e?.message }, { status: 400 })
  }
}
