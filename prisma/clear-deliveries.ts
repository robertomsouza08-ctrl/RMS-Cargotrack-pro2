
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Limpando entregas de teste...");

  // Deleta na ordem correta (devido às foreign keys)
  const deletedPings = await prisma.locationPing.deleteMany({
    where: {
      source: "seed",
    },
  });
  console.log(`   ✅ ${deletedPings.count} pings deletados`);

  const deletedDevices = await prisma.trackingDevice.deleteMany({
    where: {
      deviceIdentifier: {
        startsWith: "DEVICE-RMS-",
      },
    },
  });
  console.log(`   ✅ ${deletedDevices.count} dispositivos deletados`);

  const deletedDeliveries = await prisma.delivery.deleteMany({
    where: {
      trackingCode: {
        startsWith: "RMS-",
      },
    },
  });
  console.log(`   ✅ ${deletedDeliveries.count} entregas deletadas`);

  console.log("\n✅ Limpeza concluída!");
}

main()
  .catch((e) => {
    console.error("❌ Erro na limpeza:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
