"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticateUser,
  saveHourAssignments,
  saveMultiDayAssignments,
  saveOrganization,
  savePoolSettings,
  saveUser,
  signOutRemoteSession
} from "@/lib/data";
import { clearSession, requireSession, setSession } from "@/lib/session";
import {
  hourAssignmentsSchema,
  multiDayAssignmentsSchema,
  organizationSchema,
  poolSettingsSchema,
  signInSchema,
  userSchema
} from "@/lib/validation";
import type {
  LaneAssignmentFormValue,
  OrganizationFormValue,
  PoolSettingsValue,
  UserFormValue
} from "@/lib/types";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function signInAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No se pudo iniciar sesión." };
  }

  const session = await authenticateUser(parsed.data.email, parsed.data.password);
  if (!session) {
    return { error: "Credenciales inválidas o usuario inactivo." };
  }

  await setSession(session);
  redirect(session.role === "admin" ? "/admin" : "/staff");
}

export async function signOutAction() {
  await signOutRemoteSession();
  await clearSession();
  redirect("/login");
}

export async function saveAssignmentsAction(input: {
  date: string;
  hour: string;
  poolId: string;
  assignments: LaneAssignmentFormValue[];
}): Promise<ActionState> {
  const session = await requireSession();
  const parsed = hourAssignmentsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No se pudo guardar el bloque." };
  }

  try {
    await saveHourAssignments(parsed.data.date, parsed.data.hour, parsed.data.poolId, parsed.data.assignments, session);
    revalidatePath("/staff");
    revalidatePath("/admin");
    revalidatePath("/admin/reportes");
    return { success: "Bloque horario guardado." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo guardar el bloque." };
  }
}

export async function saveMultiDayAssignmentsAction(input: {
  startDate: string;
  endDate: string;
  hours: string[];
  poolId: string;
  assignments: LaneAssignmentFormValue[];
}): Promise<ActionState> {
  const session = await requireSession();
  const parsed = multiDayAssignmentsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No se pudo guardar el bloque." };
  }

  try {
    await saveMultiDayAssignments(
      parsed.data.startDate,
      parsed.data.endDate,
      parsed.data.hours,
      parsed.data.poolId,
      parsed.data.assignments,
      session
    );
    revalidatePath("/staff");
    revalidatePath("/admin");
    revalidatePath("/admin/reportes");
    const start = new Date(parsed.data.startDate);
    const end = new Date(parsed.data.endDate);
    const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    const hourCount = parsed.data.hours.length;
    return { success: `Bloque guardado para ${days} dia(s), ${hourCount} hora(s) y ${days * hourCount} bloque(s).` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo guardar el bloque." };
  }
}

export async function saveOrganizationAction(input: OrganizationFormValue): Promise<ActionState> {
  await requireSession("admin");
  const parsed = organizationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No se pudo guardar la organización." };
  }

  try {
    await saveOrganization(parsed.data);
    revalidatePath("/admin/configuracion");
    revalidatePath("/admin/reportes");
    return { success: "Organización guardada." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo guardar la organización." };
  }
}

export async function savePoolSettingsAction(input: PoolSettingsValue): Promise<ActionState> {
  await requireSession("admin");
  const parsed = poolSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No se pudo guardar la piscina." };
  }

  try {
    await savePoolSettings(parsed.data);
    revalidatePath("/staff");
    revalidatePath("/admin");
    revalidatePath("/admin/configuracion");
    return { success: "Configuración de piscina actualizada." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar la piscina." };
  }
}

export async function saveUserAction(input: UserFormValue): Promise<ActionState> {
  await requireSession("admin");
  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No se pudo guardar el usuario." };
  }

  try {
    await saveUser(parsed.data);
    revalidatePath("/admin/configuracion");
    return { success: "Usuario guardado." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo guardar el usuario." };
  }
}
