-- Tabelle realmente usate dal frontend React
create table if not exists public.inventory_rows (
  id bigint primary key,
  serial text not null,
  model text not null default '',
  sap text not null default '',
  status text not null,
  "assignedTo" text not null default '-',
  provenance text not null default 'SIELTE',
  notes text not null default '',
  "createdAt" date not null,
  "attachmentName" text,
  "attachmentUrl" text,
  "attachmentNames" text[] not null default '{}',
  "attachmentUrls" text[] not null default '{}'
);

create table if not exists public.movements_log (
  id bigint primary key,
  date text not null,
  time text not null,
  "user" text not null,
  serial text not null,
  sap text not null,
  status text not null,
  provenance text not null,
  action text not null,
  technician text not null default '-',
  notes text not null default '',
  "attachmentName" text,
  "attachmentUrl" text,
  "attachmentNames" text[] not null default '{}',
  "attachmentUrls" text[] not null default '{}'
);

create table if not exists public.users_registry (
  id bigint primary key,
  "firstName" text not null,
  "lastName" text not null,
  role text not null,
  "jobRole" text,
  locked boolean not null default false,
  email text,
  password text
);

create table if not exists public.sap_catalog (
  id bigint primary key,
  "sapCode" text not null unique,
  "modelName" text not null,
  provider text not null default 'FW'
);

create table if not exists public.companies_registry (
  id bigint primary key,
  name text not null unique
);

alter table public.inventory_rows enable row level security;
alter table public.movements_log enable row level security;
alter table public.users_registry enable row level security;
alter table public.sap_catalog enable row level security;
alter table public.companies_registry enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='inventory_rows' and policyname='inventory_rows_rw') then
    create policy inventory_rows_rw on public.inventory_rows for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='movements_log' and policyname='movements_log_rw') then
    create policy movements_log_rw on public.movements_log for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='users_registry' and policyname='users_registry_rw') then
    create policy users_registry_rw on public.users_registry for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='sap_catalog' and policyname='sap_catalog_rw') then
    create policy sap_catalog_rw on public.sap_catalog for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='companies_registry' and policyname='companies_registry_rw') then
    create policy companies_registry_rw on public.companies_registry for all to anon, authenticated using (true) with check (true);
  end if;
end$$;
