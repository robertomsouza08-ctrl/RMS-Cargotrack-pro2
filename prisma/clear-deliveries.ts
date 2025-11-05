
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDeliveries() {
  console.log("🗑️  Limpando entregas de teste...");

  try {
    // Deleta na ordem correta (devido às foreign keys)

    // Primeiro: deleta os pings de localização
    const deletedPings = await prisma.$executeRaw`
      DELETE FROM "LocationPing" 
      WHERE "deviceId" IN (
        SELECT "id" FROM "TrackingDevice" 
        WHERE "deliveryId" IN (
          SELECT "id" FROM "Delivery" 
          WHERE "trackingCode" LIKE 'RMS%'
        )
      )
    `;

    // Segundo: deleta os dispositivos
    const deletedDevices = await prisma.$executeRaw`
      DELETE FROM "TrackingDevice" 
      WHERE "deliveryId" IN (
        SELECT "id" FROM "Delivery" 
        WHERE "trackingCode" LIKE 'RMS%'
      )
    `;

    // Terceiro: deleta as entregas
    const deletedDeliveries = await prisma.$executeRaw`
      DELETE FROM "Delivery" 
      WHERE "trackingCode" LIKE 'RMS%'
    `;

    console.log(`✅ ${deletedPings} pings deletados`);
    console.log(`✅ ${deletedDevices} dispositivos deletados`);
    console.log(`✅ ${deletedDeliveries} entregas deletadas`);
    console.log("🎉 Limpeza concluída!");
  } catch (error) {
    console.error("❌ Erro ao limpar entregas:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearDeliveries();
