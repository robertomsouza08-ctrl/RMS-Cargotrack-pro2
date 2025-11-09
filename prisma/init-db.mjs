
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log("🔍 Verificando estrutura do banco...");

    // Verifica se as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'Account', 'Session', 'VerificationToken', 'Delivery', 'TrackingDevice', 'LocationPing')
    `;

    console.log(`📊 Tabelas encontradas: ${tables.length}/7`);

    if (tables.length < 7) {
      console.log("⚠️  Algumas tabelas estão faltando. Criando...");

      // Cria cada tabela separadamente
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT UNIQUE NOT NULL,
          "emailVerified" TIMESTAMP,
          image TEXT,
          password TEXT,
          role TEXT DEFAULT 'USER',
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Account" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL,
          type TEXT NOT NULL,
          provider TEXT NOT NULL,
          "providerAccountId" TEXT NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at INTEGER,
          token_type TEXT,
          scope TEXT,
          id_token TEXT,
          session_state TEXT,
          CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Session" (
          id TEXT PRIMARY KEY,
          "sessionToken" TEXT UNIQUE NOT NULL,
          "userId" TEXT NOT NULL,
          expires TIMESTAMP NOT NULL,
          CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "VerificationToken" (
          identifier TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires TIMESTAMP NOT NULL,
          PRIMARY KEY (identifier, token)
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Delivery" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "trackingCode" TEXT UNIQUE NOT NULL,
          origin TEXT NOT NULL,
          destination TEXT NOT NULL,
          status TEXT DEFAULT 'PENDENTE',
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "originLat" DOUBLE PRECISION,
          "originLng" DOUBLE PRECISION,
          "destinationLat" DOUBLE PRECISION,
          "destinationLng" DOUBLE PRECISION
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "TrackingDevice" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "deviceId" TEXT UNIQUE NOT NULL,
          "deliveryId" TEXT NOT NULL,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "TrackingDevice_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"(id) ON DELETE CASCADE
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "LocationPing" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "deviceId" TEXT NOT NULL,
          lat DOUBLE PRECISION NOT NULL,
          lng DOUBLE PRECISION NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          source TEXT DEFAULT 'gps',
          CONSTRAINT "LocationPing_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "TrackingDevice"(id) ON DELETE CASCADE
        )
      `);

      // Cria índices
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TrackingDevice_deliveryId_idx" ON "TrackingDevice"("deliveryId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "LocationPing_deviceId_idx" ON "LocationPing"("deviceId")`);

      console.log("✅ Tabelas criadas com sucesso!");
    } else {
      console.log("✅ Todas as tabelas já existem!");
    }

    // Verifica se já existem usuários
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;

    if (userCount && userCount[0]?.count > 0) {
      console.log("✅ Banco já possui usuários.");
    } else {
      console.log("⚠️  Banco vazio, você pode criar usuários pelo painel admin.");
    }

    // Verifica se já existem entregas
    const deliveryCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Delivery"`;

    if (deliveryCount && deliveryCount[0]?.count > 0) {
      console.log(`✅ Banco já possui ${deliveryCount[0].count} entregas.`);
    } else {
      console.log("🌱 Criando entregas de teste...");

      // Cria 5 entregas de teste
      const deliveries = [
        {
          trackingCode: 'RMS2024001',
          origin: 'São Paulo, SP',
          destination: 'Rio de Janeiro, RJ',
          status: 'EM_TRANSITO',
          originLat: -23.5505,
          originLng: -46.6333,
          destinationLat: -22.9068,
          destinationLng: -43.1729,
        },
        {
          trackingCode: 'RMS2024002',
          origin: 'Belo Horizonte, MG',
          destination: 'Brasília, DF',
          status: 'EM_TRANSITO',
          originLat: -19.9167,
          originLng: -43.9345,
          destinationLat: -15.7939,
          destinationLng: -47.8828,
        },
        {
          trackingCode: 'RMS2024003',
          origin: 'Curitiba, PR',
          destination: 'Porto Alegre, RS',
          status: 'EM_TRANSITO',
          originLat: -25.4284,
          originLng: -49.2733,
          destinationLat: -30.0346,
          destinationLng: -51.2177,
        },
        {
          trackingCode: 'RMS2024004',
          origin: 'Salvador, BA',
          destination: 'Recife, PE',
          status: 'EM_TRANSITO',
          originLat: -12.9714,
          originLng: -38.5014,
          destinationLat: -8.0476,
          destinationLng: -34.8770,
        },
        {
          trackingCode: 'RMS2024005',
          origin: 'Fortaleza, CE',
          destination: 'Manaus, AM',
          status: 'EM_TRANSITO',
          originLat: -3.7172,
          originLng: -38.5433,
          destinationLat: -3.1190,
          destinationLng: -60.0217,
        },
      ];

      for (const delivery of deliveries) {
        try {
          // Cria a entrega
          await prisma.$executeRaw`
            INSERT INTO "Delivery" (id, "trackingCode", origin, destination, status, "originLat", "originLng", "destinationLat", "destinationLng")
            VALUES (gen_random_uuid()::text, ${delivery.trackingCode}, ${delivery.origin}, ${delivery.destination}, ${delivery.status}, ${delivery.originLat}, ${delivery.originLng}, ${delivery.destinationLat}, ${delivery.destinationLng})
            ON CONFLICT ("trackingCode") DO NOTHING
          `;

          // Busca o ID da entrega
          const result = await prisma.$queryRaw`
            SELECT id FROM "Delivery" WHERE "trackingCode" = ${delivery.trackingCode}
          `;

          if (result && result[0]) {
            const deliveryId = result[0].id;
            const deviceId = `DEVICE-${delivery.trackingCode}`;

            // Cria o dispositivo
            await prisma.$executeRaw`
              INSERT INTO "TrackingDevice" (id, "deviceId", "deliveryId", "isActive")
              VALUES (gen_random_uuid()::text, ${deviceId}, ${deliveryId}, true)
              ON CONFLICT ("deviceId") DO NOTHING
            `;

            // Busca o ID do dispositivo
            const deviceResult = await prisma.$queryRaw`
              SELECT id FROM "TrackingDevice" WHERE "deviceId" = ${deviceId}
            `;

            if (deviceResult && deviceResult[0]) {
              const trackingDeviceId = deviceResult[0].id;

              // Cria posição inicial
              await prisma.$executeRaw`
                INSERT INTO "LocationPing" (id, "deviceId", lat, lng, source)
                VALUES (gen_random_uuid()::text, ${trackingDeviceId}, ${delivery.originLat}, ${delivery.originLng}, 'gps')
              `;

              console.log(`✅ ${delivery.trackingCode} criado com sucesso!`);
            }
          }
        } catch (err) {
          console.log(`⚠️  ${delivery.trackingCode} já existe ou erro ao criar.`);
        }
      }

      console.log("🎉 Entregas de teste criadas!");
    }

    console.log("✅ Inicialização do banco concluída!");
  } catch (error) {
    console.error("❌ Erro ao inicializar banco:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();
