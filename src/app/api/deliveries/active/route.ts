
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        status: "EM_TRANSITO",
      },
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
      orderBy: { createdAt: "desc" },
    });

    const formatted = deliveries.map((d) => {
      const lastPing = d.trackingDevice?.locationPings?.[0];
      return {
        id: d.id,
        trackingCode: d.trackingCode,
        origin: d.origin || "Origem não informada",
        destination: d.destination || "Destino não informado",
        status: d.status,
        currentLat: lastPing?.lat,
        currentLng: lastPing?.lng,
        lastUpdate: lastPing?.timestamp?.toISOString(),
      };
    });

    return NextResponse.json({ deliveries: formatted });
  } catch (error) {
    console.error("Erro ao buscar entregas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
