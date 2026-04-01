import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));
const includeAssignments = args.has("--include-assignments");

await loadEnvFile(path.join(rootDir, ".env.local"));
await loadEnvFile(path.join(rootDir, ".env"));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Falta DATABASE_URL. Crea .env.local antes de ejecutar este script.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const demoStore = JSON.parse(await fs.readFile(path.join(rootDir, "data", "demo-db.json"), "utf8"));

for (const profile of demoStore.profiles) {
  const passwordHash = hashPassword(profile.password);
  await sql`
    insert into profiles (id, email, name, role, active, password_hash, created_at)
    values (${profile.id}, ${profile.email}, ${profile.name}, ${profile.role}, ${profile.active}, ${passwordHash}, ${profile.createdAt})
    on conflict (id) do update
    set email = excluded.email,
        name = excluded.name,
        role = excluded.role,
        active = excluded.active,
        password_hash = excluded.password_hash,
        created_at = excluded.created_at
  `;
}

for (const pool of demoStore.pools) {
  await sql`
    insert into pools (id, type, name, lane_count, start_hour, end_hour)
    values (${pool.id}, ${pool.type}, ${pool.name}, ${pool.laneCount}, ${pool.startHour}, ${pool.endHour})
    on conflict (id) do update
    set type = excluded.type,
        name = excluded.name,
        lane_count = excluded.lane_count,
        start_hour = excluded.start_hour,
        end_hour = excluded.end_hour
  `;
}

for (const lane of demoStore.lanes) {
  await sql`
    insert into lanes (id, pool_id, number, label, active)
    values (${lane.id}, ${lane.poolId}, ${lane.number}, ${lane.label}, ${lane.active})
    on conflict (id) do update
    set pool_id = excluded.pool_id,
        number = excluded.number,
        label = excluded.label,
        active = excluded.active
  `;
}

for (const organization of demoStore.organizations) {
  await sql`
    insert into organizations (id, name, type, active)
    values (${organization.id}, ${organization.name}, ${organization.type}, ${organization.active})
    on conflict (id) do update
    set name = excluded.name,
        type = excluded.type,
        active = excluded.active
  `;
}

if (includeAssignments) {
  for (const assignment of demoStore.laneAssignments) {
    await sql`
      insert into lane_assignments (
        id,
        date,
        hour,
        pool_id,
        lane_id,
        lane_number,
        category,
        organization_id,
        swimmer_count,
        notes,
        created_by,
        updated_by,
        created_at,
        updated_at
      )
      values (
        ${assignment.id},
        ${assignment.date},
        ${assignment.hour},
        ${assignment.poolId},
        ${assignment.laneId},
        ${assignment.laneNumber},
        ${assignment.category},
        ${assignment.organizationId},
        ${assignment.swimmerCount},
        ${assignment.notes},
        ${assignment.createdBy},
        ${assignment.updatedBy},
        ${assignment.createdAt},
        ${assignment.updatedAt}
      )
      on conflict (id) do update
      set date = excluded.date,
          hour = excluded.hour,
          pool_id = excluded.pool_id,
          lane_id = excluded.lane_id,
          lane_number = excluded.lane_number,
          category = excluded.category,
          organization_id = excluded.organization_id,
          swimmer_count = excluded.swimmer_count,
          notes = excluded.notes,
          created_by = excluded.created_by,
          updated_by = excluded.updated_by,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at
    `;
  }
}

console.log("Neon sincronizado correctamente.");
console.log(`Usuarios demo: ${demoStore.profiles.map((profile) => profile.email).join(", ")}`);
if (includeAssignments) {
  console.log(`Asignaciones demo sincronizadas: ${demoStore.laneAssignments.length}`);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

async function loadEnvFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = stripWrappingQuotes(value);
      }
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
