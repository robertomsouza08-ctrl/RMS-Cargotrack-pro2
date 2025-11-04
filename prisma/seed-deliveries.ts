
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Coordenadas de exemplo (São Paulo e região)
const routes = [
  {
    trackingCode: "RMS-SP-001",
    origin: "São Paulo - Centro",
    destination: "Guarulhos - Aeroporto",
    status: "EM_TRANSITO",
    route: [
      { lat: -23.5505, lng: -46.6333 }, // Centro SP
      { lat: -23.5489, lng: -46.6388 },
      { lat: -23.5401, lng: -46.6395 },
      { lat: -23.5298, lng: -46.6289 },
      { lat: -23.5105, lng: -46.6178 },
      { lat: -23.4956, lng: -46.6089 },
      { lat: -23.4356, lng: -46.4731 }, // Aeroporto Guarulhos
    ],
  },
  {
    trackingCode: "RMS-SP-002",
    origin: "Santos - Porto",
    destination: "São Paulo - Vila Mariana",
    status: "EM_TRANSITO",
    route: [
      { lat: -23.9608, lng: -46.3335 }, // Porto de Santos
      { lat: -23.9456, lng: -46.3289 },
      { lat: -23.8789, lng: -46.3567 },
      { lat: -23.7956, lng: -46.4123 },
      { lat: -23.6889, lng: -46.5012 },
      { lat: -23.5945, lng: -46.6334 }, // Vila Mariana
    ],
  },
  {
    trackingCode: "RMS-SP-003",
    origin: "Campinas - Centro",
    destination: "São Paulo - Pinheiros",
    status: "EM_TRANSITO",
    route: [
      { lat: -22.9056, lng: -47.0608 }, // Campinas
      { lat: -22.9234, lng: -47.0456 },
      { lat: -23.0123, lng: -46.9234 },
      { lat: -23.1456, lng: -46.8123 },
      { lat: -23.3234, lng: -46.7456 },
      { lat: -23.5645, lng: -46.6912 }, // Pinheiros
    ],
  },
  {
    trackingCode: "RMS-RJ-001",
    origin: "Rio de Janeiro - Centro",
    destination: "Niterói - Centro",
    status: "EM_TRANSITO",
    route: [
      { lat: -22.9068, lng: -43.1729 }, // Centro RJ
      { lat: -22.9035, lng: -43.1765 },
      { lat: -22.8968, lng: -43.1812 },
      { lat: -22.8834, lng: -43.1034 }, // Niterói
    ],
  },
  {
    trackingCode: "RMS-SP-004",
    origin: "São Paulo - Itaquera",
    destination: "São Paulo - Morumbi",
    status: "EM_TRANSITO",
    route: [
      { lat: -23.5401, lng: -46.4556 }, // Itaquera
      { lat: -23.5456, lng: -46.5123 },
      { lat: -23.5512, lng: -46.5789 },
      { lat: -23.5634, lng: -46.6234 },
      { lat: -23.6234, lng: -46.6989 }, // Morumbi
    ],
  },
];

async function main() {
  console.log("🚀 Iniciando seed de entregas...");

  for (const routeData of routes) {
    console.log(`\n📦 Criando entrega: ${routeData.trackingCode}`);

    // Verifica se já existe
    const existing = await prisma.delivery.findUnique({
      where: { trackingCode: routeData.trackingCode },
    });

    if (existing) {
      console.log(`   ⚠️  Entrega ${routeData.trackingCode} já existe, pulando...`);
      continue;
    }

    // Cria a entrega
    const delivery = await prisma.delivery.create({
      data: {
        trackingCode: routeData.trackingCode,
        origin: routeData.origin,
        destination: routeData.destination,
        status: routeData.status,
      },
    });

    console.log(`   ✅ Entrega criada: ${delivery.id}`);

    // Cria o dispositivo de rastreamento
    const device = await prisma.trackingDevice.create({
      data: {
        deliveryId: delivery.id,
        deviceIdentifier: `DEVICE-${routeData.trackingCode}`,
        isActive: true,
      },
    });

    console.log(`   ✅ Dispositivo criado: ${device.id}`);

    // Cria os pings de localização (simulando trajeto)
    const now = new Date();
    const pings = routeData.route.map((coord, index) => {
      // Cada ping é 5 minutos depois do anterior
      const timestamp = new Date(now.getTime() - (routeData.route.length - index - 1) * 5 * 60 * 1000);
      return {
        deviceId: device.id,
        lat: coord.lat,
        lng: coord.lng,
        accuracy: Math.random() * 20 + 10, // 10-30 metros
        source: "seed",
        timestamp,
      };
    });

    await prisma.locationPing.createMany({
      data: pings,
    });

    console.log(`   ✅ ${pings.length} pings de localização criados`);
  }

  console.log("\n✅ Seed de entregas concluído!");
  console.log(`\n📊 Resumo:`);
  console.log(`   - ${routes.length} entregas criadas`);
  console.log(`   - ${routes.reduce((acc, r) => acc + r.route.length, 0)} pings de localização`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
