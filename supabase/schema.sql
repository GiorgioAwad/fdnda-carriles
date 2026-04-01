create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('staff', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pools (
  id text primary key,
  type text not null unique check (type in ('50m', '25m')),
  name text not null,
  lane_count integer not null check (lane_count between 1 and 12),
  start_hour time not null,
  end_hour time not null
);

create table if not exists public.lanes (
  id text primary key,
  pool_id text not null references public.pools (id) on delete cascade,
  number integer not null check (number > 0),
  label text not null,
  active boolean not null default true,
  unique (pool_id, number)
);

create table if not exists public.organizations (
  id text primary key,
  name text not null,
  type text not null check (type in ('academia', 'club', 'seleccionados')),
  active boolean not null default true
);

create table if not exists public.lane_assignments (
  id text primary key,
  date date not null,
  hour time not null,
  pool_id text not null references public.pools (id) on delete cascade,
  lane_id text not null references public.lanes (id) on delete cascade,
  lane_number integer not null check (lane_number > 0),
  category text not null check (category in ('academia', 'club', 'seleccionados', 'libre')),
  organization_id text references public.organizations (id) on delete set null,
  swimmer_count integer not null default 0 check (swimmer_count between 0 and 99),
  notes text not null default '',
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (date, hour, pool_id, lane_id)
);

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = uid and role = 'admin' and active = true
  );
$$;

alter table public.profiles enable row level security;
alter table public.pools enable row level security;
alter table public.lanes enable row level security;
alter table public.organizations enable row level security;
alter table public.lane_assignments enable row level security;

do $$ begin
  create policy "profiles_select_authenticated" on public.profiles
    for select using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "profiles_admin_write" on public.profiles
    for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "catalogs_select_authenticated" on public.pools
    for select using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "catalogs_admin_write_pools" on public.pools
    for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "catalogs_select_authenticated_lanes" on public.lanes
    for select using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "catalogs_admin_write_lanes" on public.lanes
    for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "catalogs_select_authenticated_orgs" on public.organizations
    for select using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "catalogs_admin_write_orgs" on public.organizations
    for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "assignments_select_authenticated" on public.lane_assignments
    for select using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "assignments_staff_write" on public.lane_assignments
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.lane_assignments;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'La publicacion supabase_realtime no existe todavia. Activa Realtime en el proyecto y vuelve a ejecutar este bloque.';
end $$;

insert into public.pools (id, type, name, lane_count, start_hour, end_hour)
values
  ('pool_50', '50m', 'Piscina Olímpica 50m', 8, '05:00', '22:00'),
  ('pool_25', '25m', 'Piscina Técnica 25m', 8, '05:00', '22:00')
on conflict (id) do update
set name = excluded.name,
    lane_count = excluded.lane_count,
    start_hour = excluded.start_hour,
    end_hour = excluded.end_hour;

insert into public.organizations (id, name, type, active)
values
  ('org_a1', 'Academia Tritones', 'academia', true),
  ('org_a2', 'Academia Delfines', 'academia', true),
  ('org_c1', 'Club Acuático Lima', 'club', true),
  ('org_c2', 'Club Pacífico', 'club', true),
  ('org_s1', 'Selección Mayor', 'seleccionados', true)
on conflict (id) do nothing;

insert into public.lanes (id, pool_id, number, label, active)
select 'lane_50_' || gs::text, 'pool_50', gs, 'Carril ' || gs::text, true
from generate_series(1, 8) gs
on conflict (id) do nothing;

insert into public.lanes (id, pool_id, number, label, active)
select 'lane_25_' || gs::text, 'pool_25', gs, 'Carril ' || gs::text, true
from generate_series(1, 8) gs
on conflict (id) do nothing;
