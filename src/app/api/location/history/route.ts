
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get("trackingCode");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!trackingCode) {
      return NextResponse.json({ error: "trackingCode obrigatório" }, { status: 400 });
    }

    const delivery = await prisma.delivery.findUnique({
      where: { trackingCode },
      include: {
        trackingDevice: {
          include: {
            locationPings: {
              orderBy: { timestamp: "desc" },
              take: limit,
            },
          },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Entrega não encontrada" }, { status: 404 });
    }

    const pings = delivery.trackingDevice?.locationPings?.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      timestamp: p.timestamp.toISOString(),
    })) || [];

    return NextResponse.json({ pings });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
