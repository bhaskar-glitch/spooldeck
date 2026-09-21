-- Drop starter demo inventory so the workshop shelf is empty.
-- Order matters: ledger → jobs → spools (FKs).
delete from ledger;
delete from jobs;
delete from spools;

select setval('spools_id_seq', 1, false);
select setval('jobs_id_seq', 1, false);
select setval('ledger_id_seq', 1, false);

insert into settings (key, value) values
  ('link_mode', 'demo'),
  (
    'printer_live',
    '{"source":"demo","online":true,"state":"idle","percent":0,"remainingMin":0,"layer":0,"layers":0,"nozzle":24,"nozzleTarget":0,"bed":22,"bedTarget":0,"jobTitle":"","slicerG":0,"taskId":null,"trayType":"","trayColor":"","deviceName":"Bambu Lab A1","error":null}'
  )
on conflict (key) do update set value = excluded.value;
