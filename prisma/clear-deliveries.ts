
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDeliveries() {
  console.log("🗑️  Limpando entregas de teste...");

  try {
    // Deleta na ordem correta (devido às foreign keys)
    const deletedPings = await prisma.locationPing.deleteMany({
      where: {
        source: "seed",
      },
    });

    const deletedDevices = await prisma.trackingDevice.deleteMany({
      where: {
        delivery: {
          trackingCode: {
            startsWith: "RMS",
          },
        },
      },
    });

    const deletedDeliveries = await prisma.delivery.deleteMany({
      where: {
        trackingCode: {
          startsWith: "RMS",
        },
      },
    });

    console.log(`✅ ${deletedPings.count} pings deletados`);
    console.log(`✅ ${deletedDevices.count} dispositivos deletados`);
    console.log(`✅ ${deletedDeliveries.count} entregas deletadas`);
    console.log("🎉 Limpeza concluída!");
  } catch (error) {
    console.error("❌ Erro ao limpar entregas:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearDeliveries();
