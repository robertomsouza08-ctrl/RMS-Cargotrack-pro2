import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.shipment.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@rmscargotrack.com',
      password: hashedPassword,
      role: 'ADMIN',
    }
  })

  await prisma.shipment.createMany({
    data: [
      { code: 'SHP001', origin: 'São Paulo', destination: 'Rio de Janeiro', status: 'IN_TRANSIT' },
      { code: 'SHP002', origin: 'Curitiba', destination: 'Florianópolis', status: 'CHECKED_IN' },
      { code: 'SHP003', origin: 'Belo Horizonte', destination: 'Salvador', status: 'DELIVERED' },
    ],
  })

  console.log('✅ Seed completed')
  console.log('📧 Admin: admin@rmscargotrack.com')
  console.log('🔑 Senha: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
