
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, lat, lng } = body;

    if (!deviceId || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Verifica se o dispositivo existe
    const device = await prisma.$queryRaw<Array<{id: string}>>`
      SELECT id FROM "TrackingDevice"
      WHERE "deviceId" = ${deviceId} AND "isActive" = true
      LIMIT 1
    `;

    if (!device || device.length === 0) {
      return NextResponse.json(
        { error: "Dispositivo não encontrado ou inativo" },
        { status: 404 }
      );
    }

    const deviceDbId = device[0].id;

    // Cria o ping
    await prisma.$executeRaw`
      INSERT INTO "LocationPing" (id, "deviceId", lat, lng, source, timestamp)
      VALUES (gen_random_uuid(), ${deviceDbId}, ${lat}, ${lng}, 'gps', NOW())
    `;

    return NextResponse.json({
      success: true,
      message: "Localização registrada",
    });
  } catch (error) {
    console.error("Erro ao registrar localização:", error);
    return NextResponse.json(
      { error: "Erro ao registrar localização" },
      { status: 500 }
    );
  }
}
