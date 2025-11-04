
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Adiciona pequena variação aleatória (simula GPS real)
function addNoise(coord: { lat: number; lng: number }, meters: number = 20) {
  const latOffset = (Math.random() - 0.5) * (meters / 111000);
  const lngOffset = (Math.random() - 0.5) * (meters / 111000);
  return {
    lat: coord.lat + latOffset,
    lng: coord.lng + lngOffset,
  };
}

async function main() {
  console.log("🚚 Atualizando posições das entregas (execução única)...");

  const deliveries = await prisma.delivery.findMany({
    where: { status: "EM_TRANSITO" },
    include: {
      trackingDevice: {
        include: {
          locationPings: {
            orderBy: { timestamp: "desc" },
            take: 2,
          },
        },
      },
    },
  });

  if (deliveries.length === 0) {
    console.log("⚠️  Nenhuma entrega EM_TRANSITO encontrada");
    return;
  }

  for (const delivery of deliveries) {
    const device = delivery.trackingDevice;
    if (!device || !device.isActive) continue;

    const pings = device.locationPings;
    if (pings.length === 0) continue;

    const lastPing = pings[0];
    const previousPing = pings[1] || lastPing;

    const direction = {
      lat: lastPing.lat - previousPing.lat,
      lng: lastPing.lng - previousPing.lng,
    };

    if (Math.abs(direction.lat) < 0.0001 && Math.abs(direction.lng) < 0.0001) {
      direction.lat = (Math.random() - 0.5) * 0.002;
      direction.lng = (Math.random() - 0.5) * 0.002;
    }

    const speed = 0.3 + Math.random() * 0.4;
    let newPosition = {
      lat: lastPing.lat + direction.lat * speed,
      lng: lastPing.lng + direction.lng * speed,
    };

    newPosition = addNoise(newPosition, 15);

    const newPing = await prisma.locationPing.create({
      data: {
        deviceId: device.id,
        lat: newPosition.lat,
        lng: newPosition.lng,
        accuracy: 10 + Math.random() * 15,
        source: "simulation",
        timestamp: new Date(),
      },
    });

    console.log(
      `✅ ${delivery.trackingCode}: (${newPing.lat.toFixed(6)}, ${newPing.lng.toFixed(6)})`
    );
  }

  console.log(`\n✅ ${deliveries.length} entregas atualizadas`);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
