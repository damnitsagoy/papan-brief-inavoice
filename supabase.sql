-- jalankan sekali di supabase: SQL Editor → New query → paste → Run

create table if not exists public.brief_status (
  slot text primary key,
  status smallint not null default 0 check (status between 0 and 5),
  updated_at timestamptz not null default now()
);

-- tabel cuma bisa diakses lewat server vercel (service role), bukan langsung dari browser
alter table public.brief_status enable row level security;

-- status awal per 26 nov 2026
insert into public.brief_status (slot, status) values
  ('2026-12-02', 1),
  ('2026-12-04', 2),
  ('2026-12-09', 2),
  ('2026-12-11', 2),
  ('2026-12-14', 2),
  ('2026-12-24', 2),
  ('2026-12-25', 2)
on conflict (slot) do nothing;
