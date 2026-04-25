import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const config = await prisma.siteConfig.findMany();
    console.log("SUCCESS:", config);
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  }
}
main();
