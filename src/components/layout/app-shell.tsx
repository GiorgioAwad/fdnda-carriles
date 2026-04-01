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
    <main className="min-h-screen px-3 py-3 md:px-4 md:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1820px] overflow-hidden rounded-[28px] border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-xl">
        <aside className="relative hidden w-[280px] flex-col justify-between overflow-hidden border-r border-slate-800 bg-ink px-6 py-6 text-slate-100 lg:flex">
          <div className="sidebar-wave pointer-events-none absolute inset-x-0 bottom-0 h-32" />

          <div className="relative grid gap-8">
            <div className="grid gap-4">
              <Badge className="w-fit bg-white/10 text-white ring-white/15">Piscina</Badge>
              <div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white">Control de<br />Carriles</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Operación por hora para staff y supervisión completa para admin.
                </p>
              </div>
            </div>

            <nav className="grid gap-1.5">
              {links.map((link) => {
                const Icon = link.icon;
                const active = currentPath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-white text-ink shadow-sm"
                        : "text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1"
                    }`}
                  >
                    <Icon size={18} className={active ? "" : "transition-transform duration-200 group-hover:scale-110"} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-surf/30 to-surf/10 text-white ring-1 ring-white/10">
                <ShieldCheck size={22} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{session.name}</p>
                <p className="text-xs text-slate-400">{ROLE_LABELS[session.role]}</p>
              </div>
            </div>
            <form action={signOutAction} className="mt-4">
              <Button type="submit" variant="secondary" className="w-full gap-2 bg-white text-ink hover:bg-slate-100">
                <LogOut size={15} />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-md md:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-surf">Centro acuático</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink md:text-3xl">{title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6 lg:px-8 lg:py-6">{children}</div>
        </section>
      </div>
    </main>
  );
}