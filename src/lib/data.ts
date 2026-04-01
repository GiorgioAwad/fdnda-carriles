import "server-only";

import { generateId, isoNow, normalizeDateValue, normalizeTimeValue } from "@/lib/utils";
import { buildDashboardMetrics } from "@/lib/reports";
import { hasDatabaseEnv } from "@/lib/env";
import { getNeonSql } from "@/lib/neon";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import {
  findLocalProfileByEmail,
  listLocalProfiles,
  readLocalStore,
  upsertLocalProfile,
  writeLocalStore
} from "@/lib/store";
import type {
  DashboardFilters,
  Lane,
  LaneAssignment,
  LaneAssignmentFormValue,
  Organization,
  OrganizationFormValue,
  Pool,
  PoolBoard,
  PoolSettingsValue,
  Profile,
  SessionUser,
  UserFormValue
} from "@/lib/types";

type DbRow = Record<string, unknown>;

interface ProfileRecord extends Profile {
  passwordHash: string;
}

function getDatabase() {
  const sql = getNeonSql();
  if (!sql) {
    throw new Error("Configura DATABASE_URL para conectar la aplicacion a Neon.");
  }

  return sql;
}

function mapDbProfile(row: DbRow): Profile {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    role: row.role === "admin" ? "admin" : "staff",
    active: Boolean(row.active),
    createdAt: String(row.created_at ?? isoNow())
  };
}

function mapDbProfileRecord(row: DbRow): ProfileRecord {
  return {
    ...mapDbProfile(row),
    passwordHash: String(row.password_hash ?? "")
  };
}

function mapDbPool(row: DbRow): Pool {
  return {
    id: String(row.id),
    type: row.type === "25m" ? "25m" : "50m",
    name: String(row.name),
    laneCount: Number(row.lane_count),
    startHour: String(row.start_hour),
    endHour: String(row.end_hour)
  };
}

function mapDbLane(row: DbRow): Lane {
  return {
    id: String(row.id),
    poolId: String(row.pool_id),
    number: Number(row.number),
    label: String(row.label),
    active: Boolean(row.active)
  };
}

function mapDbOrganization(row: DbRow): Organization {
  return {
    id: String(row.id),
    name: String(row.name),
    type:
      row.type === "club" ? "club" : row.type === "seleccionados" ? "seleccionados" : "academia",
    active: Boolean(row.active)
  };
}

function mapDbAssignment(row: DbRow): LaneAssignment {
  return {
    id: String(row.id),
    date: normalizeDateValue(row.date as string | Date | null | undefined),
    hour: normalizeTimeValue(row.hour as string | Date | null | undefined),
    poolId: String(row.pool_id),
    laneId: String(row.lane_id),
    laneNumber: Number(row.lane_number),
    category:
      row.category === "club"
        ? "club"
        : row.category === "seleccionados"
          ? "seleccionados"
          : row.category === "libre"
            ? "libre"
            : "academia",
    organizationId: row.organization_id ? String(row.organization_id) : null,
    swimmerCount: Number(row.swimmer_count),
    notes: String(row.notes ?? ""),
    createdBy: String(row.created_by),
    updatedBy: String(row.updated_by),
    createdAt: String(row.created_at ?? isoNow()),
    updatedAt: String(row.updated_at ?? isoNow())
  };
}

async function readDbProfileByEmail(email: string) {
  const sql = getDatabase();
  const rows = (await sql`
    select id, email, name, role, active, created_at, password_hash
    from profiles
    where lower(email) = lower(${email})
    limit 1
  `) as DbRow[];

  return rows[0] ? mapDbProfileRecord(rows[0]) : null;
}

async function readDbProfileById(id: string) {
  const sql = getDatabase();
  const rows = (await sql`
    select id, email, name, role, active, created_at, password_hash
    from profiles
    where id = ${id}
    limit 1
  `) as DbRow[];

  return rows[0] ? mapDbProfileRecord(rows[0]) : null;
}

async function readProfiles() {
  if (!hasDatabaseEnv) {
    return listLocalProfiles();
  }

  const sql = getDatabase();
  const rows = (await sql`
    select id, email, name, role, active, created_at
    from profiles
    order by name
  `) as DbRow[];

  return rows.map(mapDbProfile);
}

export async function readPools() {
  if (!hasDatabaseEnv) {
    const store = await readLocalStore();
    return store.pools;
  }

  const sql = getDatabase();
  const rows = (await sql`
    select id, type, name, lane_count, start_hour, end_hour
    from pools
    order by type
  `) as DbRow[];

  return rows.map(mapDbPool);
}

async function readLanes() {
  if (!hasDatabaseEnv) {
    const store = await readLocalStore();
    return store.lanes;
  }

  const sql = getDatabase();
  const rows = (await sql`
    select id, pool_id, number, label, active
    from lanes
    order by pool_id, number
  `) as DbRow[];

  return rows.map(mapDbLane);
}

export async function readOrganizations() {
  if (!hasDatabaseEnv) {
    const store = await readLocalStore();
    return store.organizations;
  }

  const sql = getDatabase();
  const rows = (await sql`
    select id, name, type, active
    from organizations
    order by name
  `) as DbRow[];

  return rows.map(mapDbOrganization);
}

async function readAssignments() {
  if (!hasDatabaseEnv) {
    const store = await readLocalStore();
    return store.laneAssignments;
  }

  const sql = getDatabase();
  const rows = (await sql`
    select
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
    from lane_assignments
  `) as DbRow[];

  return rows.map(mapDbAssignment);
}

export async function authenticateUser(email: string, password: string) {
  if (!hasDatabaseEnv) {
    const profile = await findLocalProfileByEmail(email);
    if (!profile || !profile.active || profile.password !== password) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role
    } satisfies SessionUser;
  }

  const profile = await readDbProfileByEmail(email);
  if (!profile || !profile.active) {
    return null;
  }

  const passwordOk = await verifyPassword(password, profile.passwordHash);
  if (!passwordOk) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role
  } satisfies SessionUser;
}

export async function signOutRemoteSession() {
  return;
}

export async function getBootstrapData(session: SessionUser) {
  const [pools, organizations, profiles] = await Promise.all([
    readPools(),
    readOrganizations(),
    readProfiles()
  ]);

  return {
    session,
    pools,
    organizations,
    profiles
  };
}

export async function getPoolBoard(date: string, hour: string, poolId: string): Promise<PoolBoard> {
  const [pools, lanes, organizations, assignments] = await Promise.all([
    readPools(),
    readLanes(),
    readOrganizations(),
    readAssignments()
  ]);

  const pool = pools.find((entry) => entry.id === poolId);
  if (!pool) {
    throw new Error("Piscina no encontrada.");
  }

  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]));
  const poolLanes = lanes
    .filter((lane) => lane.poolId === poolId && lane.active)
    .sort((left, right) => left.number - right.number);
  const assignmentIndex = new Map(
    assignments
      .filter((assignment) => assignment.date === date && assignment.hour === hour && assignment.poolId === poolId)
      .map((assignment) => [assignment.laneId, assignment])
  );

  const boardLanes = poolLanes.map((lane) => {
    const assignment = assignmentIndex.get(lane.id);
    return {
      laneId: lane.id,
      laneNumber: lane.number,
      laneLabel: lane.label,
      category: assignment?.category ?? "libre",
      organizationId: assignment?.organizationId ?? null,
      organizationName: assignment?.organizationId
        ? organizationById.get(assignment.organizationId)?.name ?? null
        : null,
      swimmerCount: assignment?.swimmerCount ?? 0,
      notes: assignment?.notes ?? ""
    };
  });

  return {
    pool,
    lanes: boardLanes,
    totals: {
      swimmers: boardLanes.reduce((sum, lane) => sum + lane.swimmerCount, 0),
      byCategory: {
        academia: boardLanes
          .filter((lane) => lane.category === "academia")
          .reduce((sum, lane) => sum + lane.swimmerCount, 0),
        club: boardLanes.filter((lane) => lane.category === "club").reduce((sum, lane) => sum + lane.swimmerCount, 0),
        seleccionados: boardLanes
          .filter((lane) => lane.category === "seleccionados")
          .reduce((sum, lane) => sum + lane.swimmerCount, 0),
        libre: boardLanes.filter((lane) => lane.category === "libre").reduce((sum, lane) => sum + lane.swimmerCount, 0)
      }
    }
  };
}

export async function saveHourAssignments(
  date: string,
  hour: string,
  poolId: string,
  assignments: LaneAssignmentFormValue[],
  actor: SessionUser
) {
  const now = isoNow();
  const persistedAssignments = assignments.filter(
    (assignment) =>
      assignment.swimmerCount > 0 ||
      assignment.notes.trim().length > 0 ||
      Boolean(assignment.organizationId) ||
      assignment.category !== "libre"
  );

  if (!hasDatabaseEnv) {
    const laneIds = assignments.map((assignment) => assignment.laneId);
    const store = await readLocalStore();
    const remaining = store.laneAssignments.filter(
      (assignment) =>
        !(assignment.date === date && assignment.hour === hour && assignment.poolId === poolId && laneIds.includes(assignment.laneId))
    );

    const saved = persistedAssignments.map((assignment) => ({
      id: generateId("asg"),
      date,
      hour,
      poolId,
      laneId: assignment.laneId,
      laneNumber: assignment.laneNumber,
      category: assignment.category,
      organizationId: assignment.organizationId,
      swimmerCount: assignment.swimmerCount,
      notes: assignment.notes,
      createdBy: actor.id,
      updatedBy: actor.id,
      createdAt: now,
      updatedAt: now
    }));

    await writeLocalStore({
      ...store,
      laneAssignments: [...remaining, ...saved]
    });
    return;
  }

  const sql = getDatabase();
  await sql.transaction((txn) => {
    const queries = [
      txn`delete from lane_assignments where date = ${date} and hour = ${hour} and pool_id = ${poolId}`
    ];

    for (const assignment of persistedAssignments) {
      queries.push(txn`
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
          ${generateId("asg")},
          ${date},
          ${hour},
          ${poolId},
          ${assignment.laneId},
          ${assignment.laneNumber},
          ${assignment.category},
          ${assignment.organizationId},
          ${assignment.swimmerCount},
          ${assignment.notes},
          ${actor.id},
          ${actor.id},
          ${now},
          ${now}
        )
      `);
    }

    return queries;
  });
}

export async function getDashboard(filters: DashboardFilters) {
  const [pools, organizations, assignments] = await Promise.all([
    readPools(),
    readOrganizations(),
    readAssignments()
  ]);

  return buildDashboardMetrics(assignments, pools, organizations, filters);
}

export async function listProfiles() {
  return readProfiles();
}

export async function saveOrganization(value: OrganizationFormValue) {
  if (!hasDatabaseEnv) {
    const store = await readLocalStore();
    const organizations = [...store.organizations];
    const nextOrganization = {
      id: value.id ?? generateId("org"),
      name: value.name,
      type: value.type,
      active: value.active
    };
    const existingIndex = organizations.findIndex((organization) => organization.id === nextOrganization.id);
    if (existingIndex >= 0) {
      organizations[existingIndex] = nextOrganization;
    } else {
      organizations.push(nextOrganization);
    }
    await writeLocalStore({
      ...store,
      organizations
    });
    return;
  }

  const sql = getDatabase();
  const organizationId = value.id ?? generateId("org");
  await sql`
    insert into organizations (id, name, type, active)
    values (${organizationId}, ${value.name}, ${value.type}, ${value.active})
    on conflict (id) do update
    set name = excluded.name,
        type = excluded.type,
        active = excluded.active
  `;
}

export async function savePoolSettings(value: PoolSettingsValue) {
  if (!hasDatabaseEnv) {
    const store = await readLocalStore();
    const pools = store.pools.map((pool) =>
      pool.id === value.id
        ? {
            ...pool,
            name: value.name,
            laneCount: value.laneCount,
            startHour: value.startHour,
            endHour: value.endHour
          }
        : pool
    );

    const existingLanes = store.lanes.filter((lane) => lane.poolId === value.id);
    const nextLanes = Array.from({ length: value.laneCount }, (_, index) => {
      const number = index + 1;
      return (
        existingLanes.find((lane) => lane.number === number) ?? {
          id: generateId("lane"),
          poolId: value.id,
          number,
          label: `Carril ${number}`,
          active: true
        }
      );
    }).map((lane) => ({ ...lane, active: true }));

    const lanes = [...store.lanes.filter((lane) => lane.poolId !== value.id), ...nextLanes];

    await writeLocalStore({
      ...store,
      pools,
      lanes
    });
    return;
  }

  const sql = getDatabase();
  const existingRows = (await sql`
    select id, pool_id, number, label, active
    from lanes
    where pool_id = ${value.id}
  `) as DbRow[];
  const existingLanes = existingRows.map(mapDbLane);

  const activePayload = Array.from({ length: value.laneCount }, (_, index) => {
    const number = index + 1;
    const lane = existingLanes.find((item) => item.number === number);
    return {
      id: lane?.id ?? generateId("lane"),
      poolId: value.id,
      number,
      label: lane?.label ?? `Carril ${number}`,
      active: true
    };
  });

  const inactivePayload = existingLanes
    .filter((lane) => lane.number > value.laneCount)
    .map((lane) => ({
      id: lane.id,
      poolId: value.id,
      number: lane.number,
      label: lane.label,
      active: false
    }));

  await sql.transaction((txn) => {
    const queries = [
      txn`
        update pools
        set name = ${value.name},
            lane_count = ${value.laneCount},
            start_hour = ${value.startHour},
            end_hour = ${value.endHour}
        where id = ${value.id}
      `
    ];

    for (const lane of [...activePayload, ...inactivePayload]) {
      queries.push(txn`
        insert into lanes (id, pool_id, number, label, active)
        values (${lane.id}, ${lane.poolId}, ${lane.number}, ${lane.label}, ${lane.active})
        on conflict (id) do update
        set pool_id = excluded.pool_id,
            number = excluded.number,
            label = excluded.label,
            active = excluded.active
      `);
    }

    return queries;
  });
}

export async function saveUser(value: UserFormValue) {
  if (!hasDatabaseEnv) {
    const store = await readLocalStore();
    const existingById = value.id ? store.profiles.find((profile) => profile.id === value.id) : null;
    await upsertLocalProfile({
      id: value.id ?? generateId("profile"),
      email: value.email,
      name: value.name,
      role: value.role,
      active: value.active,
      createdAt: existingById?.createdAt ?? isoNow(),
      password: value.password ?? existingById?.password ?? "changeme123"
    });
    return;
  }

  const existingProfile = value.id
    ? await readDbProfileById(value.id)
    : await readDbProfileByEmail(value.email);

  const userId = existingProfile?.id ?? value.id ?? generateId("profile");
  const createdAt = existingProfile?.createdAt ?? isoNow();
  const passwordHash = value.password
    ? await hashPassword(value.password)
    : existingProfile?.passwordHash ?? (await hashPassword("changeme123"));

  const sql = getDatabase();
  await sql`
    insert into profiles (id, email, name, role, active, password_hash, created_at)
    values (${userId}, ${value.email}, ${value.name}, ${value.role}, ${value.active}, ${passwordHash}, ${createdAt})
    on conflict (id) do update
    set email = excluded.email,
        name = excluded.name,
        role = excluded.role,
        active = excluded.active,
        password_hash = excluded.password_hash,
        created_at = excluded.created_at
  `;
}
