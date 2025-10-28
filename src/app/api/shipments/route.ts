
import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { ShipmentStatus } from '@prisma/client'
import { readJson } from '@/app/lib/request'

export async function GET(req: Request){
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.toLowerCase() || ''
  const status = searchParams.get('status')?.toUpperCase() as keyof typeof ShipmentStatus | undefined

  const where:any = {}
  if (q) {
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { origin: { contains: q, mode: 'insensitive' } },
      { destination: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (status && ShipmentStatus[status]) {
    where.status = ShipmentStatus[status]
  }

  const data = await prisma.shipment.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}

export async function POST(req: Request){
  const body = await readJson(req)
  if (!body) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  const { code, origin, destination, status, eta } = body
  if (!code || !origin || !destination) {
    return NextResponse.json({ error: 'code, origin e destination são obrigatórios' }, { status: 400 })
  }
  try {
    const created = await prisma.shipment.create({
      data: {
        code,
        origin,
        destination,
        status: status && ShipmentStatus[status] ? ShipmentStatus[status] : ShipmentStatus.IN_TRANSIT,
        eta: eta ? new Date(eta) : null,
      }
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e:any) {
    return NextResponse.json({ error: 'Falha ao criar shipment', detail: e?.message }, { status: 400 })
  }
}
