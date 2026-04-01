import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  Lane,
  LaneAssignment,
  Organization,
  Pool,
  Profile
} from "@/lib/types";

const STORE_PATH = path.join(process.cwd(), "data", "demo-db.json");

interface LocalProfileRecord extends Profile {
  password: string;
}

export interface LocalStore {
  profiles: LocalProfileRecord[];
  pools: Pool[];
  lanes: Lane[];
  organizations: Organization[];
  laneAssignments: LaneAssignment[];
}

export async function readLocalStore(): Promise<LocalStore> {
  const content = await fs.readFile(STORE_PATH, "utf-8");
  return JSON.parse(content) as LocalStore;
}

export async function writeLocalStore(store: LocalStore) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

export async function listLocalProfiles() {
  const store = await readLocalStore();
  return store.profiles.map((profile) => ({
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    active: profile.active,
    createdAt: profile.createdAt
  }));
}

export async function findLocalProfileByEmail(email: string) {
  const store = await readLocalStore();
  return store.profiles.find((profile) => profile.email.toLowerCase() === email.toLowerCase());
}

export async function upsertLocalProfile(nextProfile: LocalProfileRecord) {
  const store = await readLocalStore();
  const profiles = [...store.profiles];
  const existingIndex = profiles.findIndex((profile) => profile.id === nextProfile.id);
  if (existingIndex >= 0) {
    profiles[existingIndex] = nextProfile;
  } else {
    profiles.push(nextProfile);
  }
  await writeLocalStore({
    ...store,
    profiles
  });
}
