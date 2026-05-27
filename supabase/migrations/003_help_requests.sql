create table if not exists public.help_requests (
  id bigint primary key,
  "fullName" text not null,
  email text not null,
  notes text not null,
  "createdAt" timestamptz not null default now()
);

alter table public.help_requests enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='help_requests' and policyname='help_requests_rw') then
    create policy help_requests_rw on public.help_requests for all to anon, authenticated using (true) with check (true);
  end if;
end$$;
