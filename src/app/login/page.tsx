import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { DEMO_CREDENTIALS } from "@/lib/constants";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/staff");
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto grid min-h-[92vh] max-w-7xl overflow-hidden rounded-[36px] border border-white/60 bg-white/70 shadow-float backdrop-blur xl:grid-cols-[1.2fr_0.8fr]">
        <section className="pool-surface relative flex min-h-[420px] flex-col justify-between overflow-hidden p-8 text-white md:p-10">
          <div className="absolute inset-0 bg-slate-950/26" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/46 via-sky-900/26 to-cyan-400/12" />
          <div className="absolute inset-0 bg-pool-grid bg-[length:56px_56px] opacity-14" />
          <div className="relative z-10 grid gap-4">
            <span className="inline-flex w-fit rounded-full bg-slate-950/28 px-4 py-1 text-sm font-semibold tracking-wide text-white ring-1 ring-white/35 shadow-lg shadow-slate-950/15">
              Control de Carriles
            </span>
            <div className="grid gap-3">
              <h1 className="max-w-xl text-4xl font-black leading-tight text-white drop-shadow-[0_10px_24px_rgba(2,6,23,0.42)] md:text-6xl">
                Operación clara para la piscina, sin perder el pulso del día.
              </h1>
              <p className="max-w-2xl text-base text-white/92 drop-shadow-[0_4px_14px_rgba(2,6,23,0.28)] md:text-lg">
                Staff carga por hora lo que sucede en cada carril. Admin supervisa la ocupación en vivo,
                detecta horas pico y ajusta operación desde un panel ordenado y táctil.
              </p>
            </div>
          </div>
          <div className="relative z-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/22 bg-slate-950/16 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
              <p className="text-sm font-semibold text-white/80">Credenciales demo staff</p>
              <p className="mt-2 text-sm">{DEMO_CREDENTIALS.staff.email}</p>
              <p className="text-sm">{DEMO_CREDENTIALS.staff.password}</p>
            </div>
            <div className="rounded-[28px] border border-white/22 bg-slate-950/16 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
              <p className="text-sm font-semibold text-white/80">Credenciales demo admin</p>
              <p className="mt-2 text-sm">{DEMO_CREDENTIALS.admin.email}</p>
              <p className="text-sm">{DEMO_CREDENTIALS.admin.password}</p>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center p-6 md:p-10">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}