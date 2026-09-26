import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import type { Dashboard, Job, LedgerEntry, Spool, SpoolDetail, SpoolLocation } from "./types";
import {
  IDLE_SNAPSHOT,
  demoStartSnapshot,
  fetchCloudSnapshot,
  isTaskFailed,
  isTaskFinished,
  parsePrinterLive,
  snapshotFromMqtt,
  taskGrams,
  tickDemo,
  type CloudTask,
  type PrinterSnapshot,
  type SyncEvent,
} from "./printer";
import {
  drainLanEvents,
  ensureLanMqtt,
  lanStatus,
  pushLanEvents,
  stopLanMqtt,
} from "./lan-mqtt";

// Load .env file natively in Node 20+
try {
  process.loadEnvFile(".env");
} catch (e) {
  // Ignore if .env doesn't exist
}

// Printer credentials are loaded from environment variables (.env file).
// Copy .env.example to .env and fill in your values. See README.md for details.
const STATIC_LAN_CREDS = {
  host: process.env.BAMBU_LAN_HOST || "",
  serial: process.env.BAMBU_SERIAL || "",
  accessCode: process.env.BAMBU_ACCESS_CODE || "",
};

const STATIC_CLOUD_TOKEN = process.env.BAMBU_CLOUD_TOKEN || "";
const STATIC_REGION = process.env.BAMBU_REGION || "global";

import fs from "fs";

function iso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

async function backupSpools(sql: any) {
  try {
    const spools = await sql`select * from spools`;
    fs.writeFileSync("spools_backup.json", JSON.stringify(spools));
  } catch (e) {}
}

function num(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "bigint") return Number(value);
  return 0;
}

type SpoolRow = {
  id: number;
  brand: string;
  material: string;
  color_name: string;
  color_hex: string;
  empty_spool_g: number;
  initial_g: number;
  remaining_g: number;
  price_cents_per_kg: number | null;
  location: string;
  low_g: number;
  notes: string;
  last_weighed_at: unknown;
  created_at: unknown;
  updated_at: unknown;
};

type JobRow = {
  id: number;
  spool_id: number;
  title: string;
  slicer_g: number;
  actual_g: number | null;
  deducted_g: number;
  status: string;
  progress: number;
  started_at: unknown;
  finished_at: unknown;
  created_at: unknown;
  bambu_task_id: string | null;
  source: string;
  spool_brand: string;
  spool_material: string;
  spool_color_name: string;
  spool_color_hex: string;
};

type LedgerRow = {
  id: number;
  spool_id: number;
  job_id: number | null;
  kind: string;
  grams: number;
  remaining_after: number;
  note: string;
  created_at: unknown;
};

function mapSpool(row: SpoolRow): Spool {
  return {
    id: num(row.id),
    brand: row.brand,
    material: row.material,
    colorName: row.color_name,
    colorHex: row.color_hex,
    emptySpoolG: num(row.empty_spool_g),
    initialG: num(row.initial_g),
    remainingG: num(row.remaining_g),
    priceCentsPerKg: row.price_cents_per_kg == null ? null : num(row.price_cents_per_kg),
    location: row.location as SpoolLocation,
    lowG: num(row.low_g),
    notes: row.notes ?? "",
    lastWeighedAt: iso(row.last_weighed_at),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    updatedAt: iso(row.updated_at) ?? new Date().toISOString(),
  };
}

function mapJob(row: JobRow): Job {
  return {
    id: num(row.id),
    spoolId: num(row.spool_id),
    title: row.title,
    slicerG: num(row.slicer_g),
    actualG: row.actual_g == null ? null : num(row.actual_g),
    deductedG: num(row.deducted_g),
    status: row.status as Job["status"],
    progress: num(row.progress),
    startedAt: iso(row.started_at),
    finishedAt: iso(row.finished_at),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    bambuTaskId: row.bambu_task_id ?? null,
    source: row.source || "manual",
    spoolBrand: row.spool_brand,
    spoolMaterial: row.spool_material,
    spoolColorName: row.spool_color_name,
    spoolColorHex: row.spool_color_hex,
  };
}

function mapLedger(row: LedgerRow): LedgerEntry {
  return {
    id: num(row.id),
    spoolId: num(row.spool_id),
    jobId: row.job_id == null ? null : num(row.job_id),
    kind: row.kind as LedgerEntry["kind"],
    grams: num(row.grams),
    remainingAfter: num(row.remaining_after),
    note: row.note ?? "",
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

const JOB_SELECT = `
  select j.id, j.spool_id, j.title, j.slicer_g, j.actual_g, j.deducted_g, j.status, j.progress,
         j.started_at, j.finished_at, j.created_at, j.bambu_task_id, j.source,
         s.brand as spool_brand, s.material as spool_material,
         s.color_name as spool_color_name, s.color_hex as spool_color_hex
  from jobs j
  join spools s on s.id = j.spool_id
`;

async function writeLedger(
  sql: Awaited<ReturnType<typeof getSql>>,
  args: {
    spoolId: number;
    jobId: number | null;
    kind: string;
    grams: number;
    remainingAfter: number;
    note: string;
  },
) {
  await sql`
    insert into ledger (spool_id, job_id, kind, grams, remaining_after, note)
    values (${args.spoolId}, ${args.jobId}, ${args.kind}, ${args.grams}, ${args.remainingAfter}, ${args.note})
  `;
}

async function applyRemaining(
  sql: Awaited<ReturnType<typeof getSql>>,
  spoolId: number,
  remaining: number,
) {
  const next = Math.max(0, Math.round(remaining));
  const location = next <= 5 ? "empty" : undefined;
  if (location) {
    await sql`
      update spools
      set remaining_g = ${next}, location = ${location}, updated_at = now()
      where id = ${spoolId}
    `;
  } else {
    await sql`
      update spools
      set remaining_g = ${next}, updated_at = now()
      where id = ${spoolId}
    `;
  }
  return next;
}

async function readPrinterLive(sql: Awaited<ReturnType<typeof getSql>>): Promise<PrinterSnapshot> {
  const rows = await sql<{ value: string }>`select value from settings where key = 'printer_live'`;
  return parsePrinterLive(rows[0]?.value ?? null) ?? { ...IDLE_SNAPSHOT };
}

async function writePrinterLive(
  sql: Awaited<ReturnType<typeof getSql>>,
  snap: PrinterSnapshot,
) {
  const value = JSON.stringify(snap);
  await sql`
    insert into settings (key, value) values ('printer_live', ${value})
    on conflict (key) do update set value = excluded.value
  `;
}

async function buildDashboard(sql: Awaited<ReturnType<typeof getSql>>): Promise<Dashboard> {
  const loadedRows = await sql<SpoolRow>`select * from spools where location = 'loaded' order by updated_at desc limit 1`;
  const printingRows = await sql.query<JobRow>(
    `${JOB_SELECT} where j.status = 'printing' order by j.started_at desc limit 1`,
  );
  const recentRows = await sql.query<JobRow>(
    `${JOB_SELECT} order by coalesce(j.finished_at, j.started_at, j.created_at) desc limit 8`,
  );
  const lowRows = await sql<SpoolRow>`
    select * from spools
    where location <> 'archived' and remaining_g <= low_g
    order by remaining_g asc
  `;
  const usedRows = await sql<{ used: number }>`
    select coalesce(sum(deducted_g), 0) as used
    from jobs
    where status in ('completed', 'failed')
      and finished_at >= now() - interval '7 days'
  `;
  const countRows = await sql<{ n: number; remaining: number }>`
    select count(*)::int as n, coalesce(sum(remaining_g), 0)::int as remaining
    from spools
    where location <> 'archived'
  `;
  const settingRows = await sql<{ value: string }>`select value from settings where key = 'printer_name'`;
  const printer = await readPrinterLive(sql);
  return {
    printerName: settingRows[0]?.value ?? "Bambu Lab A1",
    loaded: loadedRows[0] ? mapSpool(loadedRows[0]) : null,
    printing: printingRows[0] ? mapJob(printingRows[0]) : null,
    recentJobs: recentRows.map(mapJob),
    lowSpools: lowRows.map(mapSpool),
    used7d: num(usedRows[0]?.used),
    spoolCount: num(countRows[0]?.n),
    remainingTotal: num(countRows[0]?.remaining),
    printer,
  };
}

export const getDashboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<Dashboard> => {
    const sql = await getSql();
    return buildDashboard(sql);
  },
);

export const listSpools = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<SpoolRow>`
    select * from spools
    where location <> 'archived'
    order by
      case location when 'loaded' then 0 when 'shelf' then 1 when 'empty' then 2 else 3 end,
      remaining_g asc
  `;
  return rows.map(mapSpool);
});

export const getSpoolDetail = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }): Promise<SpoolDetail> => {
    const sql = await getSql();
    const spoolRows = await sql<SpoolRow>`select * from spools where id = ${data.id} limit 1`;
    if (!spoolRows[0]) throw new Error("Spool not found");
    const jobs = await sql.query<JobRow>(
      `${JOB_SELECT} where j.spool_id = $1 order by j.created_at desc`,
      [data.id],
    );
    const ledger = await sql<LedgerRow>`
      select * from ledger where spool_id = ${data.id} order by created_at desc limit 40
    `;
    const used = await sql<{ used: number }>`
      select coalesce(sum(deducted_g), 0) as used from jobs where spool_id = ${data.id}
    `;
    return {
      spool: mapSpool(spoolRows[0]),
      jobs: jobs.map(mapJob),
      ledger: ledger.map(mapLedger),
      usedTotal: num(used[0]?.used),
    };
  });

export const listJobs = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql.query<JobRow>(
    `${JOB_SELECT} order by coalesce(j.finished_at, j.started_at, j.created_at) desc limit 60`,
  );
  return rows.map(mapJob);
});

export const createSpool = createServerFn({ method: "POST" })
  .validator(
    z.object({
      brand: z.string().min(1).max(80),
      material: z.string().min(1).max(40),
      colorName: z.string().min(1).max(60),
      colorHex: z.string().regex(/^#?[0-9A-Fa-f]{6}$/),
      emptySpoolG: z.number().int().min(0).max(800),
      initialG: z.number().int().min(1).max(5000),
      remainingG: z.number().int().min(0).max(5000),
      priceCentsPerKg: z.number().int().min(0).max(200000).nullable(),
      notes: z.string().max(240).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const hex = data.colorHex.startsWith("#") ? data.colorHex : `#${data.colorHex}`;
    const remaining = Math.min(data.remainingG, data.initialG);
    const location = remaining <= 5 ? "empty" : "shelf";
    const rows = await sql<{ id: number }>`
      insert into spools (
        brand, material, color_name, color_hex, empty_spool_g, initial_g,
        remaining_g, price_cents_per_kg, location, notes
      ) values (
        ${data.brand}, ${data.material}, ${data.colorName}, ${hex.toUpperCase()},
        ${data.emptySpoolG}, ${data.initialG}, ${remaining}, ${data.priceCentsPerKg},
        ${location}, ${data.notes ?? ""}
      )
      returning id
    `;
    const id = num(rows[0]?.id);
    await writeLedger(sql, {
      spoolId: id,
      jobId: null,
      kind: "create",
      grams: remaining,
      remainingAfter: remaining,
      note: `${data.brand} ${data.material} ${data.colorName}`,
    });
    await backupSpools(sql);
    return { id };
  });

export const bulkCreateSpools = createServerFn({ method: "POST" })
  .validator(
    z.array(
      z.object({
        brand: z.string().min(1).max(80),
        material: z.string().min(1).max(40),
        colorName: z.string().min(1).max(60),
        colorHex: z.string().regex(/^#?[0-9A-Fa-f]{6}$/),
        emptySpoolG: z.number().int().min(0).max(800),
        initialG: z.number().int().min(1).max(5000),
        remainingG: z.number().int().min(0).max(5000),
      })
    )
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    let count = 0;
    for (const item of data) {
      const hex = item.colorHex.startsWith("#") ? item.colorHex : `#${item.colorHex}`;
      const remaining = Math.min(item.remainingG, item.initialG);
      const location = remaining <= 5 ? "empty" : "shelf";
      const rows = await sql<{ id: number }>`
        insert into spools (
          brand, material, color_name, color_hex, empty_spool_g, initial_g,
          remaining_g, price_cents_per_kg, location, notes
        ) values (
          ${item.brand}, ${item.material}, ${item.colorName}, ${hex.toUpperCase()},
          ${item.emptySpoolG}, ${item.initialG}, ${remaining}, null,
          ${location}, ''
        )
        returning id
      `;
      const id = num(rows[0]?.id);
      await writeLedger(sql, {
        spoolId: id,
        jobId: null,
        kind: "create",
        grams: remaining,
        remainingAfter: remaining,
        note: `Bulk added ${item.brand} ${item.material} ${item.colorName}`,
      });
      count++;
    }
    return { count };
  });

export const updateSpool = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().int().positive(),
      brand: z.string().min(1).max(80),
      material: z.string().min(1).max(40),
      colorName: z.string().min(1).max(60),
      colorHex: z.string().regex(/^#?[0-9A-Fa-f]{6}$/),
      emptySpoolG: z.number().int().min(0).max(800),
      initialG: z.number().int().min(1).max(5000),
      remainingG: z.number().int().min(0).max(5000),
      notes: z.string().max(240).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<SpoolRow>`select * from spools where id = ${data.id} limit 1`;
    if (!rows[0]) throw new Error("Spool not found");
    const prev = rows[0];
    const hex = (data.colorHex.startsWith("#") ? data.colorHex : `#${data.colorHex}`).toUpperCase();
    const remaining = Math.min(data.remainingG, data.initialG);
    let location = prev.location;
    if (location === "loaded") {
      location = remaining <= 5 ? "empty" : "loaded";
    } else {
      location = remaining <= 5 ? "empty" : "shelf";
    }
    await sql`
      update spools set
        brand = ${data.brand},
        material = ${data.material},
        color_name = ${data.colorName},
        color_hex = ${hex},
        empty_spool_g = ${data.emptySpoolG},
        initial_g = ${data.initialG},
        remaining_g = ${remaining},
        location = ${location},
        notes = ${data.notes ?? prev.notes ?? ""},
        updated_at = now()
      where id = ${data.id}
    `;
    const delta = remaining - num(prev.remaining_g);
    if (delta !== 0) {
      await writeLedger(sql, {
        spoolId: data.id,
        jobId: null,
        kind: "adjust",
        grams: delta,
        remainingAfter: remaining,
        note: "Edited remaining grams",
      });
    }
    return { ok: true as const };
  });

export const deleteSpool = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<SpoolRow>`select * from spools where id = ${data.id} limit 1`;
    if (!rows[0]) throw new Error("Spool not found");
    const printing = await sql<{ id: number }>`
      select id from jobs where spool_id = ${data.id} and status = 'printing' limit 1
    `;
    if (printing[0]) throw new Error("Finish or fail the current print before deleting this spool");
    await sql`delete from ledger where spool_id = ${data.id}`;
    await sql`delete from jobs where spool_id = ${data.id}`;
    await sql`delete from spools where id = ${data.id}`;
    return { ok: true as const };
  });

export const loadSpool = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const target = await sql<SpoolRow>`select * from spools where id = ${data.id} limit 1`;
    if (!target[0]) throw new Error("Spool not found");
    if (num(target[0].remaining_g) <= 5) throw new Error("This spool is empty");
    const printing = await sql<{ id: number }>`select id from jobs where status = 'printing' limit 1`;
    if (printing[0]) throw new Error("Finish or fail the current print before swapping spools");
    await sql`update spools set location = 'shelf', updated_at = now() where location = 'loaded'`;
    await sql`update spools set location = 'loaded', updated_at = now() where id = ${data.id}`;
    await writeLedger(sql, {
      spoolId: data.id,
      jobId: null,
      kind: "load",
      grams: 0,
      remainingAfter: num(target[0].remaining_g),
      note: "Loaded on A1 external holder",
    });
    return { ok: true as const };
  });

export const unloadSpool = createServerFn({ method: "POST" }).handler(async () => {
  const sql = await getSql();
  const printing = await sql<{ id: number }>`select id from jobs where status = 'printing' limit 1`;
  if (printing[0]) throw new Error("Finish or fail the current print before unloading");
  const loaded = await sql<SpoolRow>`select * from spools where location = 'loaded'`;
  for (const row of loaded) {
    const nextLoc = num(row.remaining_g) <= 5 ? "empty" : "shelf";
    await sql`update spools set location = ${nextLoc}, updated_at = now() where id = ${row.id}`;
    await writeLedger(sql, {
      spoolId: num(row.id),
      jobId: null,
      kind: "unload",
      grams: 0,
      remainingAfter: num(row.remaining_g),
      note: "Removed from A1 holder",
    });
  }
  return { ok: true as const };
});

export const startJob = createServerFn({ method: "POST" })
  .validator(
    z.object({
      title: z.string().min(1).max(120),
      slicerG: z.number().int().min(1).max(5000),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const loaded = await sql<SpoolRow>`select * from spools where location = 'loaded' limit 1`;
    if (!loaded[0]) throw new Error("Load a spool on the A1 first");
    const existing = await sql<{ id: number }>`select id from jobs where status = 'printing' limit 1`;
    if (existing[0]) throw new Error("A print is already running");
    const remaining = num(loaded[0].remaining_g);
    if (data.slicerG > remaining) {
      throw new Error(`Only ${remaining} g left — slicer asks for ${data.slicerG} g`);
    }
    const rows = await sql<{ id: number }>`
      insert into jobs (spool_id, title, slicer_g, status, progress, started_at, source)
      values (${loaded[0].id}, ${data.title}, ${data.slicerG}, 'printing', 1, now(), 'manual')
      returning id
    `;
    return { id: num(rows[0]?.id), remaining };
  });

export const finishJob = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number(),
      actualG: z.number().int().min(0).max(5000).nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const jobs = await sql.query<JobRow>(`${JOB_SELECT} where j.id = $1 limit 1`, [data.id]);
    const job = jobs[0];
    if (!job) throw new Error("Print not found");
    if (job.status !== "printing" && job.status !== "queued") {
      throw new Error("This print is already closed");
    }
    const spoolRows = await sql<SpoolRow>`select * from spools where id = ${job.spool_id} limit 1`;
    const spool = spoolRows[0];
    if (!spool) throw new Error("Spool missing");
    const deduct = data.actualG == null ? num(job.slicer_g) : data.actualG;
    const remaining = Math.max(0, num(spool.remaining_g) - deduct);
    await sql`
      update jobs
      set status = 'completed', progress = 100, actual_g = ${data.actualG},
          deducted_g = ${deduct}, finished_at = now()
      where id = ${data.id}
    `;
    await applyRemaining(sql, num(spool.id), remaining);
    await writeLedger(sql, {
      spoolId: num(spool.id),
      jobId: data.id,
      kind: "deduct",
      grams: -deduct,
      remainingAfter: remaining,
      note:
        data.actualG == null
          ? `Slicer estimate ${num(job.slicer_g)} g`
          : `Weighed print ${data.actualG} g (slicer ${num(job.slicer_g)} g)`,
    });
    await writePrinterLive(sql, {
      ...IDLE_SNAPSHOT,
      trayType: spool.material,
      trayColor: spool.color_hex,
    });
    return { remaining, deducted: deduct };
  });

export const failJob = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number(),
      progress: z.number().int().min(0).max(100),
      actualG: z.number().int().min(0).max(5000).nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const jobs = await sql.query<JobRow>(`${JOB_SELECT} where j.id = $1 limit 1`, [data.id]);
    const job = jobs[0];
    if (!job) throw new Error("Print not found");
    if (job.status !== "printing" && job.status !== "queued") {
      throw new Error("This print is already closed");
    }
    const spoolRows = await sql<SpoolRow>`select * from spools where id = ${job.spool_id} limit 1`;
    const spool = spoolRows[0];
    if (!spool) throw new Error("Spool missing");
    const deduct =
      data.actualG == null
        ? Math.round((num(job.slicer_g) * data.progress) / 100)
        : data.actualG;
    const remaining = Math.max(0, num(spool.remaining_g) - deduct);
    await sql`
      update jobs
      set status = 'failed', progress = ${data.progress}, actual_g = ${data.actualG},
          deducted_g = ${deduct}, finished_at = now()
      where id = ${data.id}
    `;
    await applyRemaining(sql, num(spool.id), remaining);
    await writeLedger(sql, {
      spoolId: num(spool.id),
      jobId: data.id,
      kind: "deduct",
      grams: -deduct,
      remainingAfter: remaining,
      note: `Failed at ${data.progress}% — deducted ${deduct} g`,
    });
    await writePrinterLive(sql, {
      ...IDLE_SNAPSHOT,
      trayType: spool.material,
      trayColor: spool.color_hex,
    });
    return { remaining, deducted: deduct };
  });

export const weighSpool = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number(),
      scaleG: z.number().int().min(0).max(8000),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<SpoolRow>`select * from spools where id = ${data.id} limit 1`;
    if (!rows[0]) throw new Error("Spool not found");
    const empty = num(rows[0].empty_spool_g);
    const filament = Math.max(0, data.scaleG - empty);
    const prev = num(rows[0].remaining_g);
    const location = filament <= 5 ? "empty" : rows[0].location === "loaded" ? "loaded" : "shelf";
    await sql`
      update spools
      set remaining_g = ${filament}, location = ${location}, last_weighed_at = now(), updated_at = now()
      where id = ${data.id}
    `;
    await writeLedger(sql, {
      spoolId: data.id,
      jobId: null,
      kind: "weigh_spool",
      grams: filament - prev,
      remainingAfter: filament,
      note: `Scale ${data.scaleG} g − empty ${empty} g`,
    });
    return { remaining: filament, delta: filament - prev };
  });

export const weighPrint = createServerFn({ method: "POST" })
  .validator(
    z.object({
      jobId: z.number(),
      actualG: z.number().int().min(0).max(5000),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const jobs = await sql.query<JobRow>(`${JOB_SELECT} where j.id = $1 limit 1`, [data.jobId]);
    const job = jobs[0];
    if (!job) throw new Error("Print not found");
    if (job.status !== "completed" && job.status !== "failed") {
      throw new Error("Finish the print first, then weigh it");
    }
    const already = num(job.deducted_g);
    const delta = already - data.actualG;
    const spoolRows = await sql<SpoolRow>`select * from spools where id = ${job.spool_id} limit 1`;
    if (!spoolRows[0]) throw new Error("Spool missing");
    const remaining = Math.max(0, num(spoolRows[0].remaining_g) + delta);
    await sql`
      update jobs set actual_g = ${data.actualG}, deducted_g = ${data.actualG} where id = ${data.jobId}
    `;
    await applyRemaining(sql, num(job.spool_id), remaining);
    if (delta !== 0) {
      await writeLedger(sql, {
        spoolId: num(job.spool_id),
        jobId: data.jobId,
        kind: "weigh_print",
        grams: delta,
        remainingAfter: remaining,
        note: `Corrected ${already} g → ${data.actualG} g`,
      });
    }
    return { remaining, delta };
  });

async function openLinkedPrint(
  sql: Awaited<ReturnType<typeof getSql>>,
  args: { spoolId: number; title: string; slicerG: number; taskId: string; source: string },
) {
  const existing = await sql<{ id: number }>`
    select id from jobs where bambu_task_id = ${args.taskId} limit 1
  `;
  if (existing[0]) return num(existing[0].id);
  const rows = await sql<{ id: number }>`
    insert into jobs (spool_id, title, slicer_g, status, progress, started_at, bambu_task_id, source)
    values (${args.spoolId}, ${args.title}, ${args.slicerG}, 'printing', 1, now(), ${args.taskId}, ${args.source})
    returning id
  `;
  return num(rows[0]?.id);
}

async function closeLinkedPrint(
  sql: Awaited<ReturnType<typeof getSql>>,
  job: JobRow,
  kind: "completed" | "failed",
  grams: number,
  progress: number,
  note: string,
) {
  if (job.status !== "printing" && job.status !== "queued") return num(job.deducted_g);
  const spoolRows = await sql<SpoolRow>`select * from spools where id = ${job.spool_id} limit 1`;
  if (!spoolRows[0]) return 0;
  const deduct = Math.max(0, Math.round(grams));
  const remaining = Math.max(0, num(spoolRows[0].remaining_g) - deduct);
  await sql`
    update jobs
    set status = ${kind}, progress = ${progress}, deducted_g = ${deduct}, finished_at = now()
    where id = ${job.id}
  `;
  await applyRemaining(sql, num(spoolRows[0].id), remaining);
  await writeLedger(sql, {
    spoolId: num(spoolRows[0].id),
    jobId: num(job.id),
    kind: "deduct",
    grams: -deduct,
    remainingAfter: remaining,
    note,
  });
  return deduct;
}

async function ingestSnapshot(
  sql: Awaited<ReturnType<typeof getSql>>,
  snap: PrinterSnapshot,
  recent: CloudTask[],
): Promise<SyncEvent[]> {
  const events: SyncEvent[] = [];
  const loadedRows = await sql<SpoolRow>`select * from spools where location = 'loaded' limit 1`;
  const loaded = loadedRows[0] ? mapSpool(loadedRows[0]) : null;
  const printingRows = await sql.query<JobRow>(
    `${JOB_SELECT} where j.status = 'printing' order by j.started_at desc limit 1`,
  );
  const printing = printingRows[0];
  const live = snap.state === "running" || snap.state === "prepare" || snap.state === "paused";

  if (live) {
    if (!loaded) {
      events.push({
        type: "need_spool",
        message: `A1 is printing “${snap.jobTitle || "a job"}” — load the spool on the holder so remaining can be tracked.`,
      });
    } else if (!printing) {
      const grams = Math.max(1, snap.slicerG);
      if (grams > loaded.remainingG) {
        events.push({
          type: "need_spool",
          message: `Studio wants ${grams} g — only ${loaded.remainingG} g on ${loaded.colorName}.`,
        });
      } else {
        const taskId = snap.taskId ?? `live-${Date.now()}`;
        await openLinkedPrint(sql, {
          spoolId: loaded.id,
          title: snap.jobTitle || "A1 print",
          slicerG: grams,
          taskId,
          source: "a1",
        });
        events.push({
          type: "auto_start",
          message: `A1 started “${snap.jobTitle || "print"}” · ${grams} g will deduct on finish.`,
          grams,
        });
      }
    } else {
      await sql`
        update jobs set progress = ${Math.max(1, Math.min(99, snap.percent))} where id = ${printing.id}
      `;
    }
  } else if (snap.state === "finish" && printing) {
    const grams = snap.slicerG > 0 ? snap.slicerG : num(printing.slicer_g);
    const deducted = await closeLinkedPrint(
      sql,
      printing,
      "completed",
      grams,
      100,
      `A1 finished — booked ${grams} g from Studio`,
    );
    events.push({
      type: "auto_finish",
      message: `A1 finished “${printing.title}” · deducted ${deducted} g automatically.`,
      grams: deducted,
    });
  } else if (snap.state === "failed" && printing) {
    const pct = Math.max(1, Math.min(99, snap.percent || num(printing.progress)));
    const grams = Math.round((num(printing.slicer_g) * pct) / 100);
    const deducted = await closeLinkedPrint(
      sql,
      printing,
      "failed",
      grams,
      pct,
      `A1 failed at ${pct}% — booked ${grams} g`,
    );
    events.push({
      type: "auto_fail",
      message: `A1 failed “${printing.title}” at ${pct}% · deducted ${deducted} g.`,
      grams: deducted,
    });
  }

  const cutoff = Date.now() - 45 * 60 * 1000;
  for (const task of recent) {
    const id = task.id != null ? String(task.id) : "";
    if (!id) continue;
    const end = task.endTime ? new Date(task.endTime).getTime() : 0;
    if (end && end < cutoff) continue;
    const finished = isTaskFinished(task);
    const failed = isTaskFailed(task);
    if (!finished && !failed) continue;
    const seen = await sql<{ id: number }>`select id from jobs where bambu_task_id = ${id} limit 1`;
    if (seen[0]) continue;
    if (!loaded) continue;
    const grams = taskGrams(task);
    const title = task.title || "A1 print";
    const jobId = await openLinkedPrint(sql, {
      spoolId: loaded.id,
      title,
      slicerG: grams,
      taskId: id,
      source: "a1",
    });
    const jobRows = await sql.query<JobRow>(`${JOB_SELECT} where j.id = $1 limit 1`, [jobId]);
    if (!jobRows[0]) continue;
    const deducted = await closeLinkedPrint(
      sql,
      jobRows[0],
      failed ? "failed" : "completed",
      grams,
      failed ? 50 : 100,
      `Imported from Bambu Cloud · ${grams} g`,
    );
    events.push({
      type: "imported",
      message: `Caught “${title}” from the A1 · deducted ${deducted} g.`,
      grams: deducted,
    });
  }

  return events;
}

export const syncA1 = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string().max(4000).optional(),
      region: z.enum(["global", "cn"]).optional(),
      lan: z
        .object({
          host: z.string(),
          serial: z.string(),
          accessCode: z.string(),
        })
        .optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ dashboard: Dashboard; events: SyncEvent[] }> => {
    const sql = await getSql();
    const events: SyncEvent[] = [];
    const loadedRows = await sql<SpoolRow>`select * from spools where location = 'loaded' limit 1`;
    const tray = {
      type: loadedRows[0]?.material ?? "",
      color: loadedRows[0]?.color_hex ?? "",
    };
    const printingRows = await sql.query<JobRow>(
      `${JOB_SELECT} where j.status = 'printing' order by j.started_at desc limit 1`,
    );
    const printing = printingRows[0]
      ? {
          title: printingRows[0].title,
          slicerG: num(printingRows[0].slicer_g),
          progress: num(printingRows[0].progress),
          taskId: printingRows[0].bambu_task_id,
        }
      : null;

    const token = data.token?.trim();
    let snap: PrinterSnapshot;
    let recent: CloudTask[] = [];

    const lanConfig = STATIC_LAN_CREDS.host ? STATIC_LAN_CREDS : data.lan;
    
    if (lanConfig) {
      ensureLanMqtt(lanConfig, (print) => {
        getSql()
          .then(async (s) => {
            const prev = await readPrinterLive(s);
            const newSnap = snapshotFromMqtt(prev, print);
            if (!newSnap.trayType) {
              newSnap.trayType = tray.type;
              newSnap.trayColor = tray.color;
            }
            const evs = await ingestSnapshot(s, newSnap, []);
            await writePrinterLive(s, newSnap);
            if (evs.length > 0) pushLanEvents(evs);
          })
          .catch(() => {});
      });

      const st = lanStatus();
      if (!st.connected) {
        snap = await readPrinterLive(sql);
        snap = { ...snap, online: false, source: "lan", error: st.error || "Connecting..." };
      } else {
        snap = await readPrinterLive(sql);
        snap = { ...snap, source: "lan", error: null };
      }
      events.push(...drainLanEvents());
      await sql`
        insert into settings (key, value) values ('link_mode', 'lan')
        on conflict (key) do update set value = excluded.value
      `;
      
      const activeToken = STATIC_CLOUD_TOKEN || data.token?.trim();
      if (activeToken && printing && printing.slicerG === 1) {
        try {
          const cloud = await fetchCloudSnapshot(activeToken, STATIC_REGION as "global" | "cn");
          if (cloud.snapshot.slicerG > 1) {
             await sql`update jobs set slicer_g = ${cloud.snapshot.slicerG} where status = 'printing'`;
          }
        } catch {}
      }
    } else if (token) {
      stopLanMqtt();
      try {
        const cloud = await fetchCloudSnapshot(token, data.region ?? "global");
        snap = cloud.snapshot;
        if (!snap.trayType) {
          snap = { ...snap, trayType: tray.type, trayColor: tray.color };
        }
        recent = cloud.recent;
        await sql`
          insert into settings (key, value) values ('link_mode', 'cloud')
          on conflict (key) do update set value = excluded.value
        `;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Bambu Cloud unreachable";
        events.push({ type: "link_error", message });
        snap = await readPrinterLive(sql);
        snap = { ...snap, error: message, online: false, source: "cloud" };
      }
    } else {
      stopLanMqtt();
      const prev = await readPrinterLive(sql);
      snap = tickDemo(prev, printing, tray);
      await sql`
        insert into settings (key, value) values ('link_mode', 'demo')
        on conflict (key) do update set value = excluded.value
      `;
    }

    const ingested = await ingestSnapshot(sql, snap, recent);
    events.push(...ingested);
    await writePrinterLive(sql, snap);
    const dashboard = await buildDashboard(sql);
    return { dashboard, events };
  });

export const demoSendPrint = createServerFn({ method: "POST" })
  .validator(
    z.object({
      title: z.string().min(1).max(120),
      slicerG: z.number().int().min(1).max(5000),
    }),
  )
  .handler(async ({ data }): Promise<{ dashboard: Dashboard; events: SyncEvent[] }> => {
    const sql = await getSql();
    const loadedRows = await sql<SpoolRow>`select * from spools where location = 'loaded' limit 1`;
    if (!loadedRows[0]) throw new Error("Load a spool on the A1 first");
    const existing = await sql<{ id: number }>`select id from jobs where status = 'printing' limit 1`;
    if (existing[0]) throw new Error("A print is already running");
    const remaining = num(loadedRows[0].remaining_g);
    if (data.slicerG > remaining) {
      throw new Error(`Only ${remaining} g left — slicer asks for ${data.slicerG} g`);
    }
    const taskId = `demo-${Date.now()}`;
    await openLinkedPrint(sql, {
      spoolId: num(loadedRows[0].id),
      title: data.title,
      slicerG: data.slicerG,
      taskId,
      source: "a1",
    });
    const snap = demoStartSnapshot(data.title, data.slicerG, taskId, {
      type: loadedRows[0].material,
      color: loadedRows[0].color_hex,
    });
    await writePrinterLive(sql, snap);
    const events: SyncEvent[] = [
      {
        type: "auto_start",
        message: `Studio sent “${data.title}” to the A1 · ${data.slicerG} g reserved.`,
        grams: data.slicerG,
      },
    ];
    return { dashboard: await buildDashboard(sql), events };
  });

// --- Background Sync Worker ---
// This ensures the backend connects to the printer and processes print finishes
// even if the user never opens the web UI on their tablet.
let backgroundSyncTimer: NodeJS.Timeout | null = null;

function startBackgroundSync() {
  if (backgroundSyncTimer) return;
  if (!STATIC_LAN_CREDS.host && !STATIC_LAN_CREDS.serial) return;
  
  const tick = () => {
    ensureLanMqtt(STATIC_LAN_CREDS, (print) => {
      getSql()
        .then(async (s) => {
          const prev = await readPrinterLive(s);
          const newSnap = snapshotFromMqtt(prev, print);
          
          if (!newSnap.trayType) {
            // Needed to build accurate history logs if printer snapshot misses it
            const loadedRows = await s<SpoolRow>`select * from spools where location = 'loaded' limit 1`;
            newSnap.trayType = loadedRows[0]?.material ?? "";
            newSnap.trayColor = loadedRows[0]?.color_hex ?? "";
          }

          const evs = await ingestSnapshot(s, newSnap, []);
          await writePrinterLive(s, newSnap);
          
          if (evs.length > 0) {
            pushLanEvents(evs);
            await backupSpools(s); // Backup immediately after any deduction
          }
        })
        .catch((e) => console.error("Background sync error:", e));
    });
  };

  // Run immediately, then every 10 seconds
  tick();
  backgroundSyncTimer = setInterval(tick, 10000);
}

// Start immediately on server load if in Node environment
if (typeof window === "undefined") {
  startBackgroundSync();
}

