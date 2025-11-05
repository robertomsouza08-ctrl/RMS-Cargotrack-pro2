
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSeed() {
  try {
    // Verifica se as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('Delivery', 'TrackingDevice', 'LocationPing')
    `;

    if (!tables || tables.length < 3) {
      console.log("⚠️  Tabelas não encontradas. Execute 'prisma migrate deploy' primeiro.");
      process.exit(1);
    }

    // Verifica se já existem usuários
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;

    if (userCount && userCount[0]?.count > 0) {
      console.log("✅ Banco de dados já possui usuários, seed ignorado.");
    } else {
      console.log("⚠️  Banco de dados vazio, execute o seed de usuários se necessário.");
    }
  } catch (error) {
    console.error("❌ Erro ao verificar banco:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeed();
