"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticateUser,
  saveHourAssignments,
  saveOrganization,
  savePoolSettings,
  saveUser,
  signOutRemoteSession
} from "@/lib/data";
import { clearSession, requireSession, setSession } from "@/lib/session";
import {
  hourAssignmentsSchema,
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
