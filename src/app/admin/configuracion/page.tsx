import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { ConfigurationPanel } from "@/components/admin/configuration-panel";
import { getBootstrapData, readOrganizations, readPools, listProfiles } from "@/lib/data";
import { requireSession } from "@/lib/session";

export default async function AdminConfigurationPage() {
  const session = await requireSession("admin");
  const { pools, organizations, profiles } = await getBootstrapData(session);
  const freshPools = await readPools();
  const freshOrganizations = await readOrganizations();
  const freshProfiles = await listProfiles();

  return (
    <AppShell
      session={session}
      currentPath="/admin/configuracion"
      title="Configuración"
      description="Gestiona usuarios, organizaciones y parámetros operativos de las piscinas sin salir del panel admin."
      actions={<Badge className="bg-emerald-100 text-emerald-900 ring-emerald-200">Gestión total</Badge>}
    >
      <ConfigurationPanel
        pools={freshPools.length ? freshPools : pools}
        organizations={freshOrganizations.length ? freshOrganizations : organizations}
        profiles={freshProfiles.length ? freshProfiles : profiles}
      />
    </AppShell>
  );
}
