
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

async function simulateMovementOnce() {
  console.log("🚚 Atualizando posições das entregas...");

  try {
    const deliveries = await prisma.delivery.findMany({
      where: { status: "EM_TRANSITO" },
      include: {
        trackingDevice: true,
      },
    });

    if (deliveries.length === 0) {
      console.log("⚠️  Nenhuma entrega em trânsito encontrada");
      return;
    }

    for (const delivery of deliveries) {
      if (!delivery.trackingDevice) continue;

      // Busca o último ping
      const lastPing = await prisma.$queryRaw<Array<{lat: number, lng: number}>>`
        SELECT lat, lng FROM "LocationPing"
        WHERE "deviceId" = ${delivery.trackingDevice.id}
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
        INSERT INTO "LocationPing" ("deviceId", lat, lng, source, timestamp)
        VALUES (${delivery.trackingDevice.id}, ${newPos.lat}, ${newPos.lng}, 'simulation', NOW())
      `;

      console.log(`✅ ${delivery.trackingCode}: (${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)})`);

      if (newPos.arrived) {
        await prisma.delivery.update({
          where: { id: delivery.id },
          data: { status: "ENTREGUE" },
        });
        console.log(`🎉 ${delivery.trackingCode} chegou ao destino!`);
      }
    }

    console.log("✅ Atualização concluída!");
  } catch (error) {
    console.error("❌ Erro na atualização:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

simulateMovementOnce();
