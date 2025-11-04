
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Adiciona ruído GPS
function addNoise(coord: { lat: number; lng: number }, meters: number = 20) {
  const latOffset = (Math.random() - 0.5) * (meters / 111000);
  const lngOffset = (Math.random() - 0.5) * (meters / 111000);
  return {
    lat: coord.lat + latOffset,
    lng: coord.lng + lngOffset,
  };
}

export async function GET(request: Request) {
  try {
    // Segurança: verifica token de autorização (opcional)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secret-key";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

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

    let updated = 0;

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

      await prisma.locationPing.create({
        data: {
          deviceId: device.id,
          lat: newPosition.lat,
          lng: newPosition.lng,
          accuracy: 10 + Math.random() * 15,
          source: "cron-simulation",
          timestamp: new Date(),
        },
      });

      updated++;

      // Limita histórico
      const totalPings = await prisma.locationPing.count({
        where: { deviceId: device.id },
      });

      if (totalPings > 50) {
        const oldPings = await prisma.locationPing.findMany({
          where: { deviceId: device.id },
          orderBy: { timestamp: "asc" },
          take: totalPings - 50,
        });

        await prisma.locationPing.deleteMany({
          where: { id: { in: oldPings.map((p) => p.id) } },
        });
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro na simulação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
