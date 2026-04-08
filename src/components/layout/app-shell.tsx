import type { Route } from "next";
import Link from "next/link";
import { Waves, Activity, ChartColumn, SlidersHorizontal, ShieldCheck, LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import type { SessionUser } from "@/lib/types";

interface AppShellProps {
  session: SessionUser;
  title: string;
  description: string;
  currentPath: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

interface NavLink {
  href: Route;
  label: string;
  icon: typeof Waves;
}

export function AppShell({ session, title, description, currentPath, children, actions }: AppShellProps) {
  const links: NavLink[] =
    session.role === "admin"
      ? [
          { href: "/admin", label: "Panel en vivo", icon: Activity },
          { href: "/admin/reportes", label: "Reportes", icon: ChartColumn },
          { href: "/admin/configuracion", label: "Configuración", icon: SlidersHorizontal }
        ]
      : [{ href: "/staff", label: "Operación", icon: Waves }];

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="mx-auto flex h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] max-w-[1800px] overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] backdrop-blur-2xl ring-1 ring-black/5">
        <aside className="relative hidden w-[300px] flex-col justify-between overflow-hidden border-r border-slate-200/50 bg-gradient-to-b from-white/80 to-slate-50/80 px-6 py-8 text-slate-800 lg:flex shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
          <div className="absolute inset-0 bg-noise opacity-[0.015] mix-blend-overlay"></div>
          
          <div className="relative grid gap-10">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-surf to-ocean text-white shadow-lg shadow-surf/30">
                  <Waves size={20} strokeWidth={2.5} />
                </div>
                <Badge className="bg-sky-100 text-sky-700 ring-sky-200/50 font-bold tracking-wide">Piscina</Badge>
              </div>
              <div>
                <h1 className="text-[28px] font-black leading-[1.1] tracking-tight text-slate-900">Control de<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-surf to-ocean">Carriles</span></h1>
                <p className="mt-3 text-[13px] font-medium leading-relaxed text-slate-500">
                  Operación por hora para staff y supervisión completa para admin.
                </p>
              </div>
            </div>

            <nav className="grid gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                const active = currentPath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-[15px] font-bold transition-all duration-300 ${
                      active
                        ? "bg-white text-surf shadow-[0_4px_20px_-4px_rgba(15,139,168,0.15)] ring-1 ring-slate-200/50"
                        : "text-slate-500 hover:bg-white/50 hover:text-slate-900 hover:shadow-sm"
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? "text-surf" : "transition-transform duration-300 group-hover:scale-110 group-hover:text-ocean"} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="relative rounded-2xl border border-slate-200/60 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-white/80 hover:shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
                <ShieldCheck size={20} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-slate-900">{session.name}</p>
                <p className="text-[13px] font-medium text-slate-500">{ROLE_LABELS[session.role]}</p>
              </div>
            </div>
            <form action={signOutAction} className="mt-5">
              <Button type="submit" variant="ghost" className="w-full gap-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900">
                <LogOut size={16} strokeWidth={2.5} />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-slate-50/30">
          <header className="sticky top-0 z-20 border-b border-slate-200/50 bg-white/40 px-6 py-6 backdrop-blur-2xl md:px-10 lg:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Centro acuático en vivo</p>
                </div>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-[32px]">{title}</h2>
                <p className="mt-2 text-[15px] font-medium text-slate-500">{description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 lg:py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}