
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const cities = [
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'Brasília', lat: -15.8267, lng: -47.9218 },
  { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345 },
  { name: 'Curitiba', lat: -25.4284, lng: -49.2733 },
  { name: 'Porto Alegre', lat: -30.0346, lng: -51.2177 },
  { name: 'Salvador', lat: -12.9714, lng: -38.5014 },
  { name: 'Fortaleza', lat: -3.7172, lng: -38.5433 },
]

const statuses = ['IN_TRANSIT', 'CHECKED_IN', 'DELIVERED']

async function main() {
  console.log('Seeding database...')

  // Clear existing
  await prisma.shipment.deleteMany()

  // Create 20 shipments with coordinates
  for (let i = 1; i <= 20; i++) {
    const origin = cities[Math.floor(Math.random() * cities.length)]
    let dest = cities[Math.floor(Math.random() * cities.length)]
    while (dest.name === origin.name) {
      dest = cities[Math.floor(Math.random() * cities.length)]
    }

    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const daysAhead = Math.floor(Math.random() * 10) - 2
    const eta = new Date()
    eta.setDate(eta.getDate() + daysAhead)

    await prisma.shipment.create({
      data: {
        code: `SHIP-${String(i).padStart(4, '0')}`,
        origin: origin.name,
        destination: dest.name,
        status,
        eta,
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: dest.lat,
        destLng: dest.lng,
      }
    })
  }

  console.log('Seeded 20 shipments with coordinates')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
