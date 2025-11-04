
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Função para calcular ponto intermediário entre duas coordenadas
function interpolate(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  progress: number
) {
  return {
    lat: start.lat + (end.lat - start.lat) * progress,
    lng: start.lng + (end.lng - start.lng) * progress,
  };
}

// Adiciona pequena variação aleatória (simula GPS real)
function addNoise(coord: { lat: number; lng: number }, meters: number = 20) {
  const latOffset = (Math.random() - 0.5) * (meters / 111000); // ~111km por grau
  const lngOffset = (Math.random() - 0.5) * (meters / 111000);
  return {
    lat: coord.lat + latOffset,
    lng: coord.lng + lngOffset,
  };
}

async function simulateMovement() {
  console.log("🚚 Iniciando simulação de movimento em tempo real...");
  console.log("⏱️  Atualizando posições a cada 10 segundos");
  console.log("🛑 Pressione Ctrl+C para parar\n");

  let iteration = 0;

  const interval = setInterval(async () => {
    try {
      iteration++;
      console.log(`\n📍 Iteração ${iteration} - ${new Date().toLocaleTimeString("pt-BR")}`);

      // Busca todas as entregas EM_TRANSITO
      const deliveries = await prisma.delivery.findMany({
        where: { status: "EM_TRANSITO" },
        include: {
          trackingDevice: {
            include: {
              locationPings: {
                orderBy: { timestamp: "desc" },
                take: 2, // Pega as 2 últimas posições
              },
            },
          },
        },
      });

      if (deliveries.length === 0) {
        console.log("   ⚠️  Nenhuma entrega EM_TRANSITO encontrada");
        return;
      }

      for (const delivery of deliveries) {
        const device = delivery.trackingDevice;
        if (!device || !device.isActive) continue;

        const pings = device.locationPings;
        if (pings.length === 0) continue;

        const lastPing = pings[0];
        const previousPing = pings[1] || lastPing;

        // Calcula direção do movimento (baseado nas 2 últimas posições)
        const direction = {
          lat: lastPing.lat - previousPing.lat,
          lng: lastPing.lng - previousPing.lng,
        };

        // Se não há movimento, cria um movimento aleatório pequeno
        if (Math.abs(direction.lat) < 0.0001 && Math.abs(direction.lng) < 0.0001) {
          direction.lat = (Math.random() - 0.5) * 0.002;
          direction.lng = (Math.random() - 0.5) * 0.002;
        }

        // Nova posição: continua na mesma direção com pequena variação
        const speed = 0.3 + Math.random() * 0.4; // Velocidade variável
        let newPosition = {
          lat: lastPing.lat + direction.lat * speed,
          lng: lastPing.lng + direction.lng * speed,
        };

        // Adiciona ruído GPS (simula imprecisão real)
        newPosition = addNoise(newPosition, 15);

        // Cria novo ping
        const newPing = await prisma.locationPing.create({
          data: {
            deviceId: device.id,
            lat: newPosition.lat,
            lng: newPosition.lng,
            accuracy: 10 + Math.random() * 15, // 10-25 metros
            source: "simulation",
            timestamp: new Date(),
          },
        });

        console.log(
          `   ✅ ${delivery.trackingCode}: (${newPing.lat.toFixed(6)}, ${newPing.lng.toFixed(6)})`
        );

        // Limita histórico a 50 pings por dispositivo (evita crescimento infinito)
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
            where: {
              id: { in: oldPings.map((p) => p.id) },
            },
          });

          console.log(`   🗑️  Removidos ${oldPings.length} pings antigos`);
        }
      }

      console.log(`\n📊 Total: ${deliveries.length} entregas atualizadas`);
    } catch (error) {
      console.error("❌ Erro na simulação:", error);
    }
  }, 10000); // A cada 10 segundos

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n\n🛑 Parando simulação...");
    clearInterval(interval);
    await prisma.$disconnect();
    console.log("✅ Simulação encerrada");
    process.exit(0);
  });
}

simulateMovement().catch((e) => {
  console.error("❌ Erro fatal:", e);
  process.exit(1);
});
