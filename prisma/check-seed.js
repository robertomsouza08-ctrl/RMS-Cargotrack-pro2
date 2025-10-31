// prisma/check-seed.js
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    console.log("🌱 Nenhum usuário encontrado — executando seed...");
    execSync("npm run prisma:seed", { stdio: "inherit" });
  } else {
    console.log("✅ Banco de dados já possui usuários, seed ignorado.");
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
