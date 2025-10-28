
import { PrismaClient, ShipmentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main(){
  const count = await prisma.shipment.count()
  if (count > 0) return
  await prisma.shipment.createMany({
    data: [
      { code: 'CTP-001', origin: 'São Paulo', destination: 'Rio de Janeiro', status: ShipmentStatus.IN_TRANSIT, eta: new Date(Date.now()+3*86400000) },
      { code: 'CTP-002', origin: 'Campinas', destination: 'Curitiba', status: ShipmentStatus.CHECKED_IN, eta: new Date(Date.now()+2*86400000) },
      { code: 'CTP-003', origin: 'Santos', destination: 'Belo Horizonte', status: ShipmentStatus.DELIVERED, eta: new Date(Date.now()-2*86400000) },
    ]
  })
}

main().finally(async () => { await prisma.$disconnect() })
