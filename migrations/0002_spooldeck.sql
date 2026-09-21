-- SpoolDeck: A1 external-spool inventory, print jobs, and remaining-weight ledger.
create table if not exists spools (
  id serial primary key,
  brand text not null,
  material text not null,
  color_name text not null,
  color_hex text not null,
  empty_spool_g integer not null default 250,
  initial_g integer not null default 1000,
  remaining_g integer not null,
  price_cents_per_kg integer,
  location text not null default 'shelf',
  low_g integer not null default 80,
  notes text not null default '',
  last_weighed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jobs (
  id serial primary key,
  spool_id integer not null references spools(id),
  title text not null,
  slicer_g integer not null,
  actual_g integer,
  deducted_g integer not null default 0,
  status text not null default 'queued',
  progress integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists ledger (
  id serial primary key,
  spool_id integer not null references spools(id),
  job_id integer references jobs(id),
  kind text not null,
  grams integer not null,
  remaining_after integer not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value text not null
);

create index if not exists jobs_spool_id_idx on jobs (spool_id);
create index if not exists jobs_status_idx on jobs (status);
create index if not exists ledger_spool_id_idx on ledger (spool_id);
create index if not exists spools_location_idx on spools (location);

insert into settings (key, value) values
  ('printer_name', 'Bambu Lab A1'),
  ('holder', 'external')
on conflict (key) do nothing;
