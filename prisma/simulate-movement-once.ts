
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
        trackingDevice: {
          include: {
            locationPings: {
              orderBy: { timestamp: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (deliveries.length === 0) {
      console.log("⚠️  Nenhuma entrega em trânsito encontrada");
      return;
    }

    for (const delivery of deliveries) {
      if (!delivery.trackingDevice) continue;

      const lastPing = delivery.trackingDevice.locationPings[0];
      if (!lastPing) continue;

      const newPos = moveTowards(
        lastPing.lat,
        lastPing.lng,
        delivery.destinationLat || lastPing.lat,
        delivery.destinationLng || lastPing.lng,
        0.002
      );

      await prisma.locationPing.create({
        data: {
          deviceId: delivery.trackingDevice.id,
          lat: newPos.lat,
          lng: newPos.lng,
          source: "simulation",
        },
      });

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
