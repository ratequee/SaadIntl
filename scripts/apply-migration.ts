import { readFileSync } from "fs";
import path from "path";

function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

async function main() {
  loadEnv();
  const file = process.argv[2];
  if (!file) throw new Error("Pass a SQL file path.");
  const sql = readFileSync(path.join(process.cwd(), file), "utf8");
  const password = process.env.DB_PASSWORD?.trim() || "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const ref = new URL(url).hostname.split(".")[0];
  const encoded = encodeURIComponent(password);
  const { Client } = await import("pg");
  const hosts = [
    `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-me-central-1.pooler.supabase.com:6543/postgres`,
  ];
  let lastError: unknown;
  for (const connectionString of hosts) {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query(sql);
      await client.end();
      console.log("Migration applied.");
      return;
    } catch (error) {
      lastError = error;
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }
  throw lastError;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
