
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function moveTowards(
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  stepSize: number = 0.001
) {
  const latDiff = targetLat - currentLat;
  const lngDiff = targetLng - currentLng;
  const distance = Math.sqrt(latDiff ** 2 + lngDiff ** 2);

  if (distance < stepSize) {
    return { lat: targetLat, lng: targetLng, arrived: true };
  }

  const ratio = stepSize / distance;
  return {
    lat: currentLat + latDiff * ratio,
    lng: currentLng + lngDiff * ratio,
    arrived: false,
  };
}

async function simulateMovement() {
  console.log("🚚 Simulando movimento das entregas...");

  try {
    // Busca entregas em trânsito com seus dispositivos
    const deliveries = await prisma.$queryRaw<Array<{
      id: string;
      trackingCode: string;
      destinationLat: number | null;
      destinationLng: number | null;
      deviceId: string;
    }>>`
      SELECT 
        d.id, 
        d."trackingCode", 
        d."destinationLat", 
        d."destinationLng",
        td.id as "deviceId"
      FROM "Delivery" d
      LEFT JOIN "TrackingDevice" td ON td."deliveryId" = d.id
      WHERE d.status = 'EM_TRANSITO'
    `;

    if (deliveries.length === 0) {
      console.log("⚠️  Nenhuma entrega em trânsito encontrada");
      return;
    }

    for (const delivery of deliveries) {
      if (!delivery.deviceId) continue;

      // Busca o último ping
      const lastPing = await prisma.$queryRaw<Array<{lat: number, lng: number}>>`
        SELECT lat, lng FROM "LocationPing"
        WHERE "deviceId" = ${delivery.deviceId}
        ORDER BY timestamp DESC
        LIMIT 1
      `;

      if (!lastPing || lastPing.length === 0) continue;

      const newPos = moveTowards(
        lastPing[0].lat,
        lastPing[0].lng,
        delivery.destinationLat || lastPing[0].lat,
        delivery.destinationLng || lastPing[0].lng,
        0.002
      );

      // Cria novo ping
      await prisma.$executeRaw`
        INSERT INTO "LocationPing" (id, "deviceId", lat, lng, source, timestamp)
        VALUES (gen_random_uuid(), ${delivery.deviceId}, ${newPos.lat}, ${newPos.lng}, 'simulation', NOW())
      `;

      console.log(`✅ ${delivery.trackingCode}: (${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)})`);

      if (newPos.arrived) {
        await prisma.$executeRaw`
          UPDATE "Delivery" 
          SET status = 'ENTREGUE', "updatedAt" = NOW()
          WHERE id = ${delivery.id}
        `;
        console.log(`🎉 ${delivery.trackingCode} chegou ao destino!`);
      }
    }

    console.log("✅ Simulação concluída!");
  } catch (error) {
    console.error("❌ Erro na simulação:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executa continuamente a cada 10 segundos
async function runContinuously() {
  while (true) {
    await simulateMovement();
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}

runContinuously();
