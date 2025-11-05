
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const routes = [
  {
    trackingCode: "RMS2024001",
    origin: "São Paulo, SP",
    destination: "Rio de Janeiro, RJ",
    originLat: -23.5505,
    originLng: -46.6333,
    destinationLat: -22.9068,
    destinationLng: -43.1729,
    status: "EM_TRANSITO",
  },
  {
    trackingCode: "RMS2024002",
    origin: "Belo Horizonte, MG",
    destination: "Brasília, DF",
    originLat: -19.9167,
    originLng: -43.9345,
    destinationLat: -15.7939,
    destinationLng: -47.8828,
    status: "EM_TRANSITO",
  },
  {
    trackingCode: "RMS2024003",
    origin: "Curitiba, PR",
    destination: "Florianópolis, SC",
    originLat: -25.4284,
    originLng: -49.2733,
    destinationLat: -27.5954,
    destinationLng: -48.5480,
    status: "EM_TRANSITO",
  },
  {
    trackingCode: "RMS2024004",
    origin: "Porto Alegre, RS",
    destination: "São Paulo, SP",
    originLat: -30.0346,
    originLng: -51.2177,
    destinationLat: -23.5505,
    destinationLng: -46.6333,
    status: "EM_TRANSITO",
  },
  {
    trackingCode: "RMS2024005",
    origin: "Salvador, BA",
    destination: "Recife, PE",
    originLat: -12.9714,
    originLng: -38.5014,
    destinationLat: -8.0476,
    destinationLng: -34.8770,
    status: "EM_TRANSITO",
  },
];

function interpolateRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  steps: number = 10
) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    points.push({
      lat: originLat + (destLat - originLat) * ratio,
      lng: originLng + (destLng - originLng) * ratio,
    });
  }
  return points;
}

async function seedDeliveries() {
  console.log("🌱 Criando entregas de teste...");

  try {
    for (const routeData of routes) {
      // Verifica se já existe usando SQL Raw
      const existing = await prisma.$queryRaw<Array<{id: string}>>`
        SELECT id FROM "Delivery" WHERE "trackingCode" = ${routeData.trackingCode}
      `;

      if (existing.length > 0) {
        console.log(`⏭️  ${routeData.trackingCode} já existe, pulando...`);
        continue;
      }

      // Cria a entrega
      const deliveryResult = await prisma.$queryRaw<Array<{id: string}>>`
        INSERT INTO "Delivery" (
          id, "trackingCode", origin, destination, 
          "originLat", "originLng", "destinationLat", "destinationLng",
          status, "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(),
          ${routeData.trackingCode},
          ${routeData.origin},
          ${routeData.destination},
          ${routeData.originLat},
          ${routeData.originLng},
          ${routeData.destinationLat},
          ${routeData.destinationLng},
          ${routeData.status},
          NOW(),
          NOW()
        )
        RETURNING id
      `;

      const deliveryId = deliveryResult[0]?.id;
      if (!deliveryId) {
        console.error(`❌ Erro ao criar entrega ${routeData.trackingCode}`);
        continue;
      }

      // Cria o dispositivo de rastreamento
      const deviceResult = await prisma.$queryRaw<Array<{id: string}>>`
        INSERT INTO "TrackingDevice" (
          id, "deviceId", "deliveryId", "isActive", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(),
          ${`DEVICE-${routeData.trackingCode}`},
          ${deliveryId},
          true,
          NOW(),
          NOW()
        )
        RETURNING id
      `;

      const deviceDbId = deviceResult[0]?.id;
      if (!deviceDbId) {
        console.error(`❌ Erro ao criar dispositivo para ${routeData.trackingCode}`);
        continue;
      }

      // Gera pontos da rota
      const routePoints = interpolateRoute(
        routeData.originLat,
        routeData.originLng,
        routeData.destinationLat,
        routeData.destinationLng,
        10
      );

      // Cria os pings de localização (apenas os primeiros 3 pontos)
      for (let i = 0; i < Math.min(3, routePoints.length); i++) {
        const point = routePoints[i];
        const timestamp = new Date(Date.now() - (routePoints.length - i) * 3600000);

        await prisma.$executeRaw`
          INSERT INTO "LocationPing" (
            id, "deviceId", lat, lng, source, timestamp
          )
          VALUES (
            gen_random_uuid(),
            ${deviceDbId},
            ${point.lat},
            ${point.lng},
            'seed',
            ${timestamp}
          )
        `;
      }

      console.log(`✅ ${routeData.trackingCode} criado com sucesso!`);
    }

    console.log("🎉 Seed de entregas concluído!");
  } catch (error) {
    console.error("❌ Erro ao criar entregas:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDeliveries();
