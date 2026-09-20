import { promises as fs } from "fs";
import path from "path";
import { seedStore } from "@/lib/data/seed";
import type { CmsStore } from "@/lib/types";

const DATA_PATH = path.join(process.cwd(), ".data", "cms.json");

async function ensureFile() {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify(seedStore, null, 2), "utf8");
  }
}

export async function readStore(): Promise<CmsStore> {
  await ensureFile();
  const raw = await fs.readFile(DATA_PATH, "utf8");
  try {
    return JSON.parse(raw) as CmsStore;
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify(seedStore, null, 2), "utf8");
    return structuredClone(seedStore);
  }
}

export async function writeStore(store: CmsStore) {
  await ensureFile();
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function mutateStore(mutator: (store: CmsStore) => void) {
  const store = await readStore();
  mutator(store);
  await writeStore(store);
  return store;
}
