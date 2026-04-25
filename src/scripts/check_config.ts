import { prisma } from "../lib/prisma";

async function main() {
  const configs = await prisma.siteConfig.findMany();
  console.log("Current Site Configs:");
  console.log(JSON.stringify(configs, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
