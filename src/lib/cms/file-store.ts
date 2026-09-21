import { promises as fs } from "fs";
import path from "path";
import { seedStore } from "@/lib/data/seed";
import type { CmsStore } from "@/lib/types";

const DATA_PATH = path.join(process.cwd(), ".data", "cms.json");

function cloneSeed(): CmsStore {
  return structuredClone(seedStore);
}

async function readFromDisk(): Promise<CmsStore | null> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as CmsStore;
  } catch {
    return null;
  }
}

export async function readStore(): Promise<CmsStore> {
  const fromDisk = await readFromDisk();
  if (fromDisk) return fromDisk;
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(seedStore, null, 2), "utf8");
  } catch {
    // Vercel and other serverless hosts cannot persist `.data/cms.json`.
  }
  return cloneSeed();
}

export async function writeStore(store: CmsStore) {
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Ignore persistence failures on read-only hosts; Supabase is the source of truth in production.
  }
}

export async function mutateStore(mutator: (store: CmsStore) => void) {
  const store = await readStore();
  mutator(store);
  await writeStore(store);
  return store;
}
