create type public.app_role as enum ('admin', 'magazzino', 'tecnico', 'readonly');
create type public.modem_status as enum ('giacente','assegnato','installato','da_riconsegnare','riconsegnato','guasto','scaricato');

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'readonly',
  created_at timestamptz not null default now()
);

create table public.technicians (
  id bigserial primary key,
  code text unique,
  full_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.modem_models (
  id bigserial primary key,
  sap_code text not null unique,
  model_name text not null,
  provider text not null,
  created_at timestamptz not null default now()
);

create table public.modems (
  id bigserial primary key,
  serial text not null unique,
  model_id bigint not null references public.modem_models(id),
  current_status public.modem_status not null default 'giacente',
  assigned_technician_id bigint references public.technicians(id),
  account_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modem_movements (
  id bigserial primary key,
  modem_id bigint not null references public.modems(id) on delete cascade,
  movement_at timestamptz not null default now(),
  user_id uuid references auth.users(id),
  technician_id bigint references public.technicians(id),
  from_status public.modem_status,
  to_status public.modem_status not null,
  account_reference text,
  note text
);

create index modems_status_idx on public.modems(current_status);
create index modems_model_idx on public.modems(model_id);
create index movements_modem_date_idx on public.modem_movements(modem_id, movement_at desc);

alter table public.user_profiles enable row level security;
alter table public.technicians enable row level security;
alter table public.modem_models enable row level security;
alter table public.modems enable row level security;
alter table public.modem_movements enable row level security;
