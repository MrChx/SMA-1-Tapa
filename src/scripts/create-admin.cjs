require("dotenv").config({ quiet: true });

const { Client } = require("pg");
const bcrypt = require("bcryptjs");

function printUsage() {
  console.log("Pemakaian:");
  console.log('  npm run admin:create -- --email="admin@sekolah.sch.id" --name="Administrator" --password="PasswordBaru123"');
  console.log("");
  console.log("Catatan:");
  console.log("  - Jalankan `npm install` terlebih dahulu.");
  console.log("  - Jalankan `npm run db:push` terlebih dahulu agar tabel Prisma dibuat.");
}

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : "";
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printUsage();
    return;
  }

  const email = getArg("email").trim();
  const name = getArg("name").trim() || "Administrator";
  const password = getArg("password");
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL belum diisi di file .env");
    process.exitCode = 1;
    return;
  }

  if (!email || !password) {
    console.error("ERROR: --email dan --password wajib diisi.");
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (password.length < 6) {
    console.error("ERROR: password minimal 6 karakter.");
    process.exitCode = 1;
    return;
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();

    const passwordHash = await bcrypt.hash(password, 10);
    const id = `admin_${Date.now()}`;

    await client.query(
      `
        INSERT INTO "Admin" ("id", "email", "passwordHash", "name", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT ("email")
        DO UPDATE SET
          "passwordHash" = EXCLUDED."passwordHash",
          "name" = EXCLUDED."name",
          "updatedAt" = NOW()
      `,
      [id, email, passwordHash, name]
    );

    console.log(`SUCCESS: admin ${email} berhasil dibuat atau diperbarui.`);
  } catch (error) {
    if (error && error.code === "42P01") {
      console.error('ERROR: tabel "Admin" belum ada. Jalankan `npm run db:push` terlebih dahulu.');
    } else {
      console.error("ERROR:", error instanceof Error ? error.message : error);
    }
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
