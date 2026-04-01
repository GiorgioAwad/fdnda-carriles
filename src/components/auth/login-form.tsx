"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import { signInAction, type ActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="h-12 w-full gap-2 text-base" disabled={pending}>
      <LogIn size={18} />
      {pending ? "Ingresando..." : "Ingresar al panel"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <Card className="w-full max-w-xl rounded-[32px] p-6 md:p-8">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-ink text-white shadow-float">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-ink">Ingreso seguro</h2>
          <p className="mt-1 text-sm text-slate-600">
            Usa tus credenciales para entrar al panel staff o admin.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-8 grid gap-4">
        <Field label="Correo">
          <Input name="email" type="email" autoComplete="email" placeholder="tu@piscina.com" required />
        </Field>
        <Field label="Contraseña">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </Field>
        {state.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        ) : null}
        <SubmitButton />
      </form>
    </Card>
  );
}
