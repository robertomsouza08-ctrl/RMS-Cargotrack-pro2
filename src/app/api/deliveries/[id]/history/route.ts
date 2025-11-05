
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deliveryId = params.id;

    // Busca o dispositivo da entrega
    const device = await prisma.$queryRaw<Array<{id: string}>>`
      SELECT td.id
      FROM "TrackingDevice" td
      WHERE td."deliveryId" = ${deliveryId}
      LIMIT 1
    `;

    if (!device || device.length === 0) {
      return NextResponse.json(
        { error: "Dispositivo não encontrado" },
        { status: 404 }
      );
    }

    const deviceId = device[0].id;

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
      ORDER BY timestamp DESC
      LIMIT 100
    `;

    return NextResponse.json(pings);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}
