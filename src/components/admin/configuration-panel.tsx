"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveOrganizationAction, savePoolSettingsAction, saveUserAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { ROLE_LABELS } from "@/lib/constants";
import type { Organization, OrganizationFormValue, Pool, Profile, UserFormValue } from "@/lib/types";

interface ConfigurationPanelProps {
  pools: Pool[];
  organizations: Organization[];
  profiles: Profile[];
}

export function ConfigurationPanel({ pools, organizations, profiles }: ConfigurationPanelProps) {
  const router = useRouter();
  const [organizationForm, setOrganizationForm] = useState<OrganizationFormValue>({
    id: "",
    name: "",
    type: "academia",
    active: true
  });
  const [userForm, setUserForm] = useState<UserFormValue>({
    id: "",
    email: "",
    name: "",
    role: "staff",
    active: true,
    password: ""
  });
  const [messages, setMessages] = useState<Record<string, string | null>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function submitOrganization() {
    setBusyKey("organization");
    const result = await saveOrganizationAction({
      id: organizationForm.id || undefined,
      name: organizationForm.name,
      type: organizationForm.type,
      active: organizationForm.active
    });
    setMessages((current) => ({ ...current, organization: result.success ?? result.error ?? null }));
    setBusyKey(null);
    if (result.success) {
      setOrganizationForm({ id: "", name: "", type: "academia", active: true });
      router.refresh();
    }
  }

  async function submitUser() {
    setBusyKey("user");
    const result = await saveUserAction({
      id: userForm.id || undefined,
      email: userForm.email,
      name: userForm.name,
      role: userForm.role,
      active: userForm.active,
      password: userForm.password || undefined
    });
    setMessages((current) => ({ ...current, user: result.success ?? result.error ?? null }));
    setBusyKey(null);
    if (result.success) {
      setUserForm({ id: "", email: "", name: "", role: "staff", active: true, password: "" });
      router.refresh();
    }
  }

  async function submitPool(pool: Pool) {
    setBusyKey(pool.id);
    const result = await savePoolSettingsAction({
      id: pool.id,
      name: pool.name,
      laneCount: pool.laneCount,
      startHour: pool.startHour,
      endHour: pool.endHour
    });
    setMessages((current) => ({ ...current, [pool.id]: result.success ?? result.error ?? null }));
    setBusyKey(null);
    if (result.success) {
      router.refresh();
    }
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="grid gap-4 rounded-[30px]">
          <div>
            <p className="text-sm font-semibold text-surf">Catálogo</p>
            <h3 className="text-xl font-black text-ink">Organizaciones</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nombre">
              <Input value={organizationForm.name} onChange={(event) => setOrganizationForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Tipo">
              <Select value={organizationForm.type} onChange={(event) => setOrganizationForm((current) => ({ ...current, type: event.target.value as OrganizationFormValue["type"] }))}>
                <option value="academia">Academia</option>
                <option value="club">Club</option>
                <option value="seleccionados">Seleccionados</option>
              </Select>
            </Field>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={organizationForm.active} onChange={(event) => setOrganizationForm((current) => ({ ...current, active: event.target.checked }))} />
            Organización activa
          </label>
          <div className="flex gap-3">
            <Button type="button" onClick={() => void submitOrganization()} disabled={busyKey === "organization"}>
              {busyKey === "organization" ? "Guardando..." : organizationForm.id ? "Actualizar" : "Crear organización"}
            </Button>
            {organizationForm.id ? (
              <Button type="button" variant="secondary" onClick={() => setOrganizationForm({ id: "", name: "", type: "academia", active: true })}>
                Limpiar
              </Button>
            ) : null}
          </div>
          {messages.organization ? <p className="text-sm text-slate-600">{messages.organization}</p> : null}
          <div className="grid gap-3">
            {organizations.map((organization) => (
              <button
                key={organization.id}
                type="button"
                onClick={() => setOrganizationForm({ ...organization })}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left"
              >
                <div>
                  <p className="font-semibold text-slate-800">{organization.name}</p>
                  <p className="text-sm text-slate-500">{organization.type}</p>
                </div>
                <Badge className={organization.active ? "bg-emerald-100 text-emerald-900 ring-emerald-200" : "bg-slate-200 text-slate-700 ring-slate-300"}>
                  {organization.active ? "Activa" : "Inactiva"}
                </Badge>
              </button>
            ))}
          </div>
        </Card>

        <Card className="grid gap-4 rounded-[30px]">
          <div>
            <p className="text-sm font-semibold text-surf">Seguridad</p>
            <h3 className="text-xl font-black text-ink">Usuarios</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nombre">
              <Input value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Correo">
              <Input type="email" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} />
            </Field>
            <Field label="Rol">
              <Select value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as UserFormValue["role"] }))}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </Select>
            </Field>
            <Field label="Contraseña" hint="Obligatoria al crear. Opcional al editar.">
              <Input type="password" value={userForm.password ?? ""} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} />
            </Field>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={userForm.active} onChange={(event) => setUserForm((current) => ({ ...current, active: event.target.checked }))} />
            Usuario activo
          </label>
          <div className="flex gap-3">
            <Button type="button" onClick={() => void submitUser()} disabled={busyKey === "user"}>
              {busyKey === "user" ? "Guardando..." : userForm.id ? "Actualizar usuario" : "Crear usuario"}
            </Button>
            {userForm.id ? (
              <Button type="button" variant="secondary" onClick={() => setUserForm({ id: "", email: "", name: "", role: "staff", active: true, password: "" })}>
                Limpiar
              </Button>
            ) : null}
          </div>
          {messages.user ? <p className="text-sm text-slate-600">{messages.user}</p> : null}
          <div className="grid gap-3">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => setUserForm({ ...profile, password: "" })}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left"
              >
                <div>
                  <p className="font-semibold text-slate-800">{profile.name}</p>
                  <p className="text-sm text-slate-500">{profile.email}</p>
                </div>
                <Badge className={profile.active ? "bg-blue-100 text-blue-900 ring-blue-200" : "bg-slate-200 text-slate-700 ring-slate-300"}>
                  {ROLE_LABELS[profile.role]}
                </Badge>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {pools.map((pool) => (
          <PoolSettingsCard key={pool.id} pool={pool} onSave={submitPool} busy={busyKey === pool.id} message={messages[pool.id]} />
        ))}
      </div>
    </section>
  );
}

function PoolSettingsCard({ pool, onSave, busy, message }: { pool: Pool; onSave: (pool: Pool) => Promise<void>; busy: boolean; message?: string | null; }) {
  const [draft, setDraft] = useState(pool);

  return (
    <Card className="grid gap-4 rounded-[30px]">
      <div>
        <p className="text-sm font-semibold text-surf">Parámetros operativos</p>
        <h3 className="text-xl font-black text-ink">{pool.name}</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nombre visible">
          <Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
        </Field>
        <Field label="Cantidad de carriles">
          <Input type="number" min={1} max={12} value={draft.laneCount} onChange={(event) => setDraft((current) => ({ ...current, laneCount: Number(event.target.value || 1) }))} />
        </Field>
        <Field label="Hora inicial">
          <Input type="time" value={draft.startHour} onChange={(event) => setDraft((current) => ({ ...current, startHour: event.target.value }))} />
        </Field>
        <Field label="Hora final">
          <Input type="time" value={draft.endHour} onChange={(event) => setDraft((current) => ({ ...current, endHour: event.target.value }))} />
        </Field>
      </div>
      <Button type="button" onClick={() => void onSave(draft)} disabled={busy}>
        {busy ? "Guardando..." : "Guardar piscina"}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </Card>
  );
}
