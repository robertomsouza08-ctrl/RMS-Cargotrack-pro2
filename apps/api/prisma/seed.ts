
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  // Minimal seed for shipments
  await prisma.shipment.createMany({ data: [
    { code: 'CTP-001', origin: 'São Paulo', destination: 'Rio de Janeiro', status: 'in_transit', eta: new Date(Date.now()+3*86400000) },
    { code: 'CTP-002', origin: 'Campinas', destination: 'Curitiba', status: 'checked_in', eta: new Date(Date.now()+2*86400000) },
    { code: 'CTP-003', origin: 'Santos', destination: 'Belo Horizonte', status: 'delivered', eta: new Date(Date.now()-2*86400000) },
  ]});
}

main().finally(()=>prisma.$disconnect());
