
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deliveries = await prisma.$queryRaw<Array<{
      id: string;
      trackingCode: string;
      origin: string;
      destination: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      originLat: number | null;
      originLng: number | null;
      destinationLat: number | null;
      destinationLng: number | null;
      deviceId: string | null;
      lastLat: number | null;
      lastLng: number | null;
      lastTimestamp: Date | null;
    }>>`
      SELECT 
        d.id,
        d."trackingCode",
        d.origin,
        d.destination,
        d.status,
        d."createdAt",
        d."updatedAt",
        d."originLat",
        d."originLng",
        d."destinationLat",
        d."destinationLng",
        td.id as "deviceId",
        lp.lat as "lastLat",
        lp.lng as "lastLng",
        lp.timestamp as "lastTimestamp"
      FROM "Delivery" d
      LEFT JOIN "TrackingDevice" td ON td."deliveryId" = d.id
      LEFT JOIN LATERAL (
        SELECT lat, lng, timestamp
        FROM "LocationPing"
        WHERE "deviceId" = td.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) lp ON true
      WHERE d.status = 'EM_TRANSITO'
      ORDER BY d."createdAt" DESC
    `;

    // Formata a resposta
    const formattedDeliveries = deliveries.map(d => ({
      id: d.id,
      trackingCode: d.trackingCode,
      origin: d.origin,
      destination: d.destination,
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      originLat: d.originLat,
      originLng: d.originLng,
      destinationLat: d.destinationLat,
      destinationLng: d.destinationLng,
      trackingDevice: d.deviceId ? {
        id: d.deviceId,
        lastPing: d.lastLat && d.lastLng ? {
          lat: d.lastLat,
          lng: d.lastLng,
          timestamp: d.lastTimestamp,
        } : null,
      } : null,
    }));

    return NextResponse.json(formattedDeliveries);
  } catch (error) {
    console.error("Erro ao buscar entregas ativas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar entregas" },
      { status: 500 }
    );
  }
}
