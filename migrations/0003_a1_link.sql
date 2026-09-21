-- A1 network link: idempotent print ids + live printer snapshot (no secrets).
alter table jobs add column if not exists bambu_task_id text;
alter table jobs add column if not exists source text not null default 'manual';

create unique index if not exists jobs_bambu_task_id_uidx
  on jobs (bambu_task_id)
  where bambu_task_id is not null;

insert into settings (key, value) values
  ('link_mode', 'demo'),
  (
    'printer_live',
    '{"source":"demo","online":true,"state":"idle","percent":0,"remainingMin":0,"layer":0,"layers":0,"nozzle":24,"nozzleTarget":0,"bed":22,"bedTarget":0,"jobTitle":"","slicerG":0,"taskId":null,"trayType":"","trayColor":"","deviceName":"Bambu Lab A1","error":null}'
  )
on conflict (key) do nothing;
