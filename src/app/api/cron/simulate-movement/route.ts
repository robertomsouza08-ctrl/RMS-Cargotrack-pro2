
import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  try {
    // Verifica o token de autenticação (opcional, mas recomendado)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json({
        success: true,
        message: "Nenhuma entrega em trânsito",
        updated: 0,
      });
    }

    let updated = 0;
    const results = [];

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
        VALUES (gen_random_uuid(), ${delivery.deviceId}, ${newPos.lat}, ${newPos.lng}, 'cron', NOW())
      `;

      updated++;
      results.push({
        trackingCode: delivery.trackingCode,
        position: { lat: newPos.lat, lng: newPos.lng },
        arrived: newPos.arrived,
      });

      if (newPos.arrived) {
        await prisma.$executeRaw`
          UPDATE "Delivery" 
          SET status = 'ENTREGUE', "updatedAt" = NOW()
          WHERE id = ${delivery.id}
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updated} entregas atualizadas`,
      updated,
      results,
    });
  } catch (error) {
    console.error("Erro ao simular movimento:", error);
    return NextResponse.json(
      { error: "Erro ao simular movimento" },
      { status: 500 }
    );
  }
}
