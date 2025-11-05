
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get("trackingCode");

    if (!trackingCode) {
      return NextResponse.json(
        { error: "Código de rastreamento não fornecido" },
        { status: 400 }
      );
    }

    // Busca a entrega e o dispositivo
    const delivery = await prisma.$queryRaw<Array<{
      id: string;
      trackingCode: string;
      deviceId: string | null;
    }>>`
      SELECT 
        d.id,
        d."trackingCode",
        td.id as "deviceId"
      FROM "Delivery" d
      LEFT JOIN "TrackingDevice" td ON td."deliveryId" = d.id
      WHERE d."trackingCode" = ${trackingCode}
      LIMIT 1
    `;

    if (!delivery || delivery.length === 0) {
      return NextResponse.json(
        { error: "Entrega não encontrada" },
        { status: 404 }
      );
    }

    const deviceId = delivery[0].deviceId;

    if (!deviceId) {
      return NextResponse.json([]);
    }

    // Busca o histórico de pings
    const pings = await prisma.$queryRaw<Array<{
      id: string;
      lat: number;
      lng: number;
      timestamp: Date;
      source: string;
    }>>`
      SELECT id, lat, lng, timestamp, source
      FROM "LocationPing"
      WHERE "deviceId" = ${deviceId}
      ORDER BY timestamp ASC
    `;

    return NextResponse.json(pings);
  } catch (error) {
    console.error("Erro ao buscar histórico de localização:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}
