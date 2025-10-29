import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.shipment.deleteMany()
  await prisma.shipment.createMany({
    data: [
      { code: 'SHP001', origin: 'São Paulo', destination: 'Rio de Janeiro', status: 'IN_TRANSIT' },
      { code: 'SHP002', origin: 'Curitiba', destination: 'Florianópolis', status: 'CHECKED_IN' },
      { code: 'SHP003', origin: 'Belo Horizonte', destination: 'Salvador', status: 'DELIVERED' },
    ],
  })
  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
