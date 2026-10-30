import { promises as fs } from "node:fs";
import path from "node:path";
import type { Status } from "./form";

export interface Application {
  id: string;
  role: "Helper";
  status: Status;
  adminNote: string;
  createdAt: string;
  fullName: string; age: number; city: string; occupation: string; discord: string;
  impartialityCommitment: string; ruleKnowledge: string; motivation: string; selfDescription: string;
  characterName: string; steamName: string; gameId: string; serverHours: number; serverTenure: string; dailyHours: number;
  sanctions: string; inGameAssets: string; reputationHistory: string; staffConflicts: string;
  improvementPlan: string; helperResponsibilities: string; recordingSetup: string; friendScenario: string;
}

/**
 * Pe Netlify datele stau în Netlify Blobs (configurat automat, fără variabile).
 * Local (npm run dev) se folosește fișierul .data/applications.json.
 */
const onNetlify = Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || process.env.DEPLOY_ID);
const FILE = path.join(process.cwd(), ".data", "applications.json");

async function blobs() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "applications", consistency: "strong" });
}
async function readFile(): Promise<Application[]> {
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return []; }
}
async function writeFile(all: Application[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}

export async function listApplications(): Promise<Application[]> {
  let all: Application[];
  if (onNetlify) {
    const store = await blobs();
    const { blobs: items } = await store.list();
    const rows = await Promise.all(items.map((b) => store.get(b.key, { type: "json" }) as Promise<Application | null>));
    all = rows.filter((r): r is Application => Boolean(r));
  } else all = await readFile();
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getApplication(id: string): Promise<Application | null> {
  if (onNetlify) return ((await (await blobs()).get(id, { type: "json" })) as Application | null) ?? null;
  return (await readFile()).find((a) => a.id === id) ?? null;
}

export async function saveApplication(app: Application): Promise<void> {
  if (onNetlify) return void (await (await blobs()).setJSON(app.id, app));
  const all = await readFile();
  const i = all.findIndex((a) => a.id === app.id);
  if (i >= 0) all[i] = app; else all.push(app);
  await writeFile(all);
}
