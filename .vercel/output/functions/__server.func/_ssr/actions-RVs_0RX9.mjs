import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, r as number, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-RVs_0RX9.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_spooldeck_default = "-- SpoolDeck: A1 external-spool inventory, print jobs, and remaining-weight ledger.\ncreate table if not exists spools (\n  id serial primary key,\n  brand text not null,\n  material text not null,\n  color_name text not null,\n  color_hex text not null,\n  empty_spool_g integer not null default 250,\n  initial_g integer not null default 1000,\n  remaining_g integer not null,\n  price_cents_per_kg integer,\n  location text not null default 'shelf',\n  low_g integer not null default 80,\n  notes text not null default '',\n  last_weighed_at timestamptz,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists jobs (\n  id serial primary key,\n  spool_id integer not null references spools(id),\n  title text not null,\n  slicer_g integer not null,\n  actual_g integer,\n  deducted_g integer not null default 0,\n  status text not null default 'queued',\n  progress integer not null default 0,\n  started_at timestamptz,\n  finished_at timestamptz,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists ledger (\n  id serial primary key,\n  spool_id integer not null references spools(id),\n  job_id integer references jobs(id),\n  kind text not null,\n  grams integer not null,\n  remaining_after integer not null,\n  note text not null default '',\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists settings (\n  key text primary key,\n  value text not null\n);\n\ncreate index if not exists jobs_spool_id_idx on jobs (spool_id);\ncreate index if not exists jobs_status_idx on jobs (status);\ncreate index if not exists ledger_spool_id_idx on ledger (spool_id);\ncreate index if not exists spools_location_idx on spools (location);\n\ninsert into settings (key, value) values\n  ('printer_name', 'Bambu Lab A1'),\n  ('holder', 'external')\non conflict (key) do nothing;\n";
var _0003_a1_link_default = "-- A1 network link: idempotent print ids + live printer snapshot (no secrets).\nalter table jobs add column if not exists bambu_task_id text;\nalter table jobs add column if not exists source text not null default 'manual';\n\ncreate unique index if not exists jobs_bambu_task_id_uidx\n  on jobs (bambu_task_id)\n  where bambu_task_id is not null;\n\ninsert into settings (key, value) values\n  ('link_mode', 'demo'),\n  (\n    'printer_live',\n    '{\"source\":\"demo\",\"online\":true,\"state\":\"idle\",\"percent\":0,\"remainingMin\":0,\"layer\":0,\"layers\":0,\"nozzle\":24,\"nozzleTarget\":0,\"bed\":22,\"bedTarget\":0,\"jobTitle\":\"\",\"slicerG\":0,\"taskId\":null,\"trayType\":\"\",\"trayColor\":\"\",\"deviceName\":\"Bambu Lab A1\",\"error\":null}'\n  )\non conflict (key) do nothing;\n";
var _0004_empty_shelf_default = "-- Drop starter demo inventory so the workshop shelf is empty.\n-- Order matters: ledger → jobs → spools (FKs).\ndelete from ledger;\ndelete from jobs;\ndelete from spools;\n\nselect setval('spools_id_seq', 1, false);\nselect setval('jobs_id_seq', 1, false);\nselect setval('ledger_id_seq', 1, false);\n\ninsert into settings (key, value) values\n  ('link_mode', 'demo'),\n  (\n    'printer_live',\n    '{\"source\":\"demo\",\"online\":true,\"state\":\"idle\",\"percent\":0,\"remainingMin\":0,\"layer\":0,\"layers\":0,\"nozzle\":24,\"nozzleTarget\":0,\"bed\":22,\"bedTarget\":0,\"jobTitle\":\"\",\"slicerG\":0,\"taskId\":null,\"trayType\":\"\",\"trayColor\":\"\",\"deviceName\":\"Bambu Lab A1\",\"error\":null}'\n  )\non conflict (key) do update set value = excluded.value;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_spooldeck.sql": _0002_spooldeck_default,
			"/migrations/0003_a1_link.sql": _0003_a1_link_default,
			"/migrations/0004_empty_shelf.sql": _0004_empty_shelf_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var IDLE_SNAPSHOT = {
	source: "demo",
	online: true,
	state: "idle",
	percent: 0,
	remainingMin: 0,
	layer: 0,
	layers: 0,
	nozzle: 24,
	nozzleTarget: 0,
	bed: 22,
	bedTarget: 0,
	jobTitle: "",
	slicerG: 0,
	taskId: null,
	trayType: "",
	trayColor: "",
	deviceName: "Bambu Lab A1",
	error: null
};
function asNum(value, fallback = 0) {
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : fallback;
}
function parsePrinterLive(raw) {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return null;
		return {
			...IDLE_SNAPSHOT,
			...parsed
		};
	} catch {
		return null;
	}
}
function mapPrintStatus(status) {
	const s = (status ?? "").toUpperCase();
	if ([
		"RUNNING",
		"ACTIVE",
		"PRINTING",
		"WORKING"
	].includes(s)) return "running";
	if ([
		"PREPARE",
		"PREPARING",
		"SLICING"
	].includes(s)) return "prepare";
	if (["PAUSE", "PAUSED"].includes(s)) return "paused";
	if ([
		"FINISH",
		"FINISHED",
		"SUCCESS",
		"COMPLETED"
	].includes(s)) return "finish";
	if ([
		"FAILED",
		"FAIL",
		"ERROR"
	].includes(s)) return "failed";
	return "idle";
}
function tickDemo(prev, printing, tray) {
	const base = {
		...prev ?? IDLE_SNAPSHOT,
		source: "demo",
		online: true,
		deviceName: "Bambu Lab A1",
		trayType: tray.type,
		trayColor: tray.color,
		error: null
	};
	const sameJob = Boolean(printing) && (base.state === "running" || base.state === "prepare" || base.state === "paused") && (printing.taskId && base.taskId ? printing.taskId === base.taskId : printing.title === base.jobTitle);
	if (printing && !sameJob) {
		const pct = Math.max(1, printing.progress);
		return {
			...base,
			state: "running",
			percent: pct,
			remainingMin: Math.max(1, Math.round((100 - pct) / 100 * Math.max(8, printing.slicerG))),
			layer: Math.round(pct / 100 * 180),
			layers: 180,
			nozzle: 220,
			nozzleTarget: 220,
			bed: 60,
			bedTarget: 60,
			jobTitle: printing.title,
			slicerG: printing.slicerG,
			taskId: printing.taskId ?? "demo-live"
		};
	}
	if (base.state === "running" || base.state === "prepare") {
		const nextPct = Math.min(100, base.percent + 6);
		if (nextPct >= 100) return {
			...base,
			state: "finish",
			percent: 100,
			remainingMin: 0,
			layer: base.layers || 180,
			nozzle: 180,
			nozzleTarget: 0
		};
		return {
			...base,
			state: "running",
			percent: nextPct,
			remainingMin: Math.max(0, base.remainingMin - 1),
			layer: Math.min(base.layers || 180, base.layer + 8),
			nozzle: 220,
			nozzleTarget: 220,
			bed: 60,
			bedTarget: 60
		};
	}
	if (base.state === "finish" || base.state === "failed") {
		if (!printing) return {
			...IDLE_SNAPSHOT,
			trayType: tray.type,
			trayColor: tray.color
		};
		return base;
	}
	return {
		...IDLE_SNAPSHOT,
		trayType: tray.type,
		trayColor: tray.color,
		nozzle: 24,
		bed: 22
	};
}
function demoStartSnapshot(title, slicerG, taskId, tray) {
	return {
		source: "demo",
		online: true,
		state: "running",
		percent: 2,
		remainingMin: Math.max(6, Math.round(slicerG * .7)),
		layer: 1,
		layers: Math.max(40, slicerG * 3),
		nozzle: 220,
		nozzleTarget: 220,
		bed: 60,
		bedTarget: 60,
		jobTitle: title,
		slicerG,
		taskId,
		trayType: tray.type,
		trayColor: tray.color,
		deviceName: "Bambu Lab A1",
		error: null
	};
}
function pickDevice(devices) {
	if (!devices.length) return null;
	return devices.find((d) => {
		const blob = `${d.dev_product_name ?? ""} ${d.dev_model_name ?? ""} ${d.name ?? ""}`;
		return /a1/i.test(blob);
	}) ?? devices[0];
}
function taskGrams(task) {
	const mapped = task.amsDetailMapping?.[0]?.weight;
	const fromMap = Math.round(asNum(mapped));
	if (fromMap > 0) return fromMap;
	return Math.max(1, Math.round(asNum(task.weight)));
}
async function fetchCloudSnapshot(token, region) {
	const base = region === "cn" ? "https://api.bambulab.cn" : "https://api.bambulab.com";
	const headers = {
		Authorization: `Bearer ${token}`,
		Accept: "application/json"
	};
	const bindRes = await fetch(`${base}/v1/iot-service/api/user/bind`, {
		headers,
		signal: AbortSignal.timeout(8e3)
	});
	if (bindRes.status === 401 || bindRes.status === 403) throw new Error("Bambu token rejected — paste a fresh access token from Bambu Handy / Studio");
	if (!bindRes.ok) throw new Error(`Bambu Cloud returned ${bindRes.status}`);
	const device = pickDevice((await bindRes.json()).devices ?? []);
	if (!device) throw new Error("No printer on this Bambu account");
	let recent = [];
	try {
		const q = new URLSearchParams({ limit: "12" });
		if (device.dev_id) q.set("deviceId", device.dev_id);
		const taskRes = await fetch(`${base}/v1/user-service/my/tasks?${q.toString()}`, {
			headers,
			signal: AbortSignal.timeout(8e3)
		});
		if (taskRes.ok) {
			const taskJson = await taskRes.json();
			recent = taskJson.hits ?? taskJson.data?.hits ?? [];
		}
	} catch {
		recent = [];
	}
	const state = mapPrintStatus(device.print_status);
	const current = recent.find((t) => {
		const st = t.status;
		return st === 1 || st === "printing" || st === "RUNNING";
	}) ?? (state === "running" || state === "prepare" ? recent[0] : void 0);
	const title = current?.title ?? "";
	const grams = current ? taskGrams(current) : 0;
	const filament = current?.amsDetailMapping?.[0]?.filamentType ?? "";
	return {
		snapshot: {
			source: "cloud",
			online: Boolean(device.online),
			state,
			percent: state === "finish" ? 100 : state === "idle" ? 0 : 1,
			remainingMin: 0,
			layer: 0,
			layers: 0,
			nozzle: 0,
			nozzleTarget: 0,
			bed: 0,
			bedTarget: 0,
			jobTitle: title,
			slicerG: grams,
			taskId: current?.id != null ? String(current.id) : device.print_job ? String(device.print_job) : null,
			trayType: filament,
			trayColor: "",
			deviceName: device.name || device.dev_product_name || "Bambu Lab A1",
			error: null
		},
		recent
	};
}
function isTaskFinished(task) {
	const st = task.status;
	return st === 2 || st === "finished" || st === "FINISH" || st === "completed";
}
function isTaskFailed(task) {
	const st = task.status;
	return st === 3 || st === "failed" || st === "FAILED" || st === "aborted";
}
function iso(value) {
	if (value == null) return null;
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	return String(value);
}
function num(value) {
	if (typeof value === "number") return value;
	if (typeof value === "string") return Number(value);
	if (typeof value === "bigint") return Number(value);
	return 0;
}
function mapSpool(row) {
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
		location: row.location,
		lowG: num(row.low_g),
		notes: row.notes ?? "",
		lastWeighedAt: iso(row.last_weighed_at),
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString(),
		updatedAt: iso(row.updated_at) ?? (/* @__PURE__ */ new Date()).toISOString()
	};
}
function mapJob(row) {
	return {
		id: num(row.id),
		spoolId: num(row.spool_id),
		title: row.title,
		slicerG: num(row.slicer_g),
		actualG: row.actual_g == null ? null : num(row.actual_g),
		deductedG: num(row.deducted_g),
		status: row.status,
		progress: num(row.progress),
		startedAt: iso(row.started_at),
		finishedAt: iso(row.finished_at),
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString(),
		bambuTaskId: row.bambu_task_id ?? null,
		source: row.source || "manual",
		spoolBrand: row.spool_brand,
		spoolMaterial: row.spool_material,
		spoolColorName: row.spool_color_name,
		spoolColorHex: row.spool_color_hex
	};
}
function mapLedger(row) {
	return {
		id: num(row.id),
		spoolId: num(row.spool_id),
		jobId: row.job_id == null ? null : num(row.job_id),
		kind: row.kind,
		grams: num(row.grams),
		remainingAfter: num(row.remaining_after),
		note: row.note ?? "",
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString()
	};
}
var JOB_SELECT = `
  select j.id, j.spool_id, j.title, j.slicer_g, j.actual_g, j.deducted_g, j.status, j.progress,
         j.started_at, j.finished_at, j.created_at, j.bambu_task_id, j.source,
         s.brand as spool_brand, s.material as spool_material,
         s.color_name as spool_color_name, s.color_hex as spool_color_hex
  from jobs j
  join spools s on s.id = j.spool_id
`;
async function writeLedger(sql, args) {
	await sql`
    insert into ledger (spool_id, job_id, kind, grams, remaining_after, note)
    values (${args.spoolId}, ${args.jobId}, ${args.kind}, ${args.grams}, ${args.remainingAfter}, ${args.note})
  `;
}
async function applyRemaining(sql, spoolId, remaining) {
	const next = Math.max(0, Math.round(remaining));
	const location = next <= 5 ? "empty" : void 0;
	if (location) await sql`
      update spools
      set remaining_g = ${next}, location = ${location}, updated_at = now()
      where id = ${spoolId}
    `;
	else await sql`
      update spools
      set remaining_g = ${next}, updated_at = now()
      where id = ${spoolId}
    `;
	return next;
}
async function readPrinterLive(sql) {
	return parsePrinterLive((await sql`select value from settings where key = 'printer_live'`)[0]?.value ?? null) ?? { ...IDLE_SNAPSHOT };
}
async function writePrinterLive(sql, snap) {
	await sql`
    insert into settings (key, value) values ('printer_live', ${JSON.stringify(snap)})
    on conflict (key) do update set value = excluded.value
  `;
}
async function buildDashboard(sql) {
	const loadedRows = await sql`select * from spools where location = 'loaded' order by updated_at desc limit 1`;
	const printingRows = await sql.query(`${JOB_SELECT} where j.status = 'printing' order by j.started_at desc limit 1`);
	const recentRows = await sql.query(`${JOB_SELECT} order by coalesce(j.finished_at, j.started_at, j.created_at) desc limit 8`);
	const lowRows = await sql`
    select * from spools
    where location <> 'archived' and remaining_g <= low_g
    order by remaining_g asc
  `;
	const usedRows = await sql`
    select coalesce(sum(deducted_g), 0) as used
    from jobs
    where status in ('completed', 'failed')
      and finished_at >= now() - interval '7 days'
  `;
	const countRows = await sql`
    select count(*)::int as n, coalesce(sum(remaining_g), 0)::int as remaining
    from spools
    where location <> 'archived'
  `;
	const settingRows = await sql`select value from settings where key = 'printer_name'`;
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
		printer
	};
}
var getDashboard_createServerFn_handler = createServerRpc({
	id: "e57397ab9b580d551e45a204bb51a638c619efe4ae28e910ee5b42763a8c3cf8",
	name: "getDashboard",
	filename: "src/lib/filament/actions.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).handler(getDashboard_createServerFn_handler, async () => {
	return buildDashboard(await getSql());
});
var listSpools_createServerFn_handler = createServerRpc({
	id: "e663737e7a3b04ffc09085b1f9a82f6d0d81837111b7a0f495ee0da00f6c5c0e",
	name: "listSpools",
	filename: "src/lib/filament/actions.ts"
}, (opts) => listSpools.__executeServer(opts));
var listSpools = createServerFn({ method: "GET" }).handler(listSpools_createServerFn_handler, async () => {
	return (await (await getSql())`
    select * from spools
    where location <> 'archived'
    order by
      case location when 'loaded' then 0 when 'shelf' then 1 when 'empty' then 2 else 3 end,
      remaining_g asc
  `).map(mapSpool);
});
var getSpoolDetail_createServerFn_handler = createServerRpc({
	id: "193c8ee1a66bbb7eb958fc7cfd6d09b0a1e4e02ab5e24e59f4834fb589662f7c",
	name: "getSpoolDetail",
	filename: "src/lib/filament/actions.ts"
}, (opts) => getSpoolDetail.__executeServer(opts));
var getSpoolDetail = createServerFn({ method: "POST" }).validator(object({ id: number() })).handler(getSpoolDetail_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const spoolRows = await sql`select * from spools where id = ${data.id} limit 1`;
	if (!spoolRows[0]) throw new Error("Spool not found");
	const jobs = await sql.query(`${JOB_SELECT} where j.spool_id = $1 order by j.created_at desc`, [data.id]);
	const ledger = await sql`
      select * from ledger where spool_id = ${data.id} order by created_at desc limit 40
    `;
	const used = await sql`
      select coalesce(sum(deducted_g), 0) as used from jobs where spool_id = ${data.id}
    `;
	return {
		spool: mapSpool(spoolRows[0]),
		jobs: jobs.map(mapJob),
		ledger: ledger.map(mapLedger),
		usedTotal: num(used[0]?.used)
	};
});
var listJobs_createServerFn_handler = createServerRpc({
	id: "8f723864edfaa598e1d9038a2739c6bb0de295ae545c9fe4c3a4777c4d5facae",
	name: "listJobs",
	filename: "src/lib/filament/actions.ts"
}, (opts) => listJobs.__executeServer(opts));
var listJobs = createServerFn({ method: "GET" }).handler(listJobs_createServerFn_handler, async () => {
	return (await (await getSql()).query(`${JOB_SELECT} order by coalesce(j.finished_at, j.started_at, j.created_at) desc limit 60`)).map(mapJob);
});
var createSpool_createServerFn_handler = createServerRpc({
	id: "8752685ca0d0e7eaeb2497c6abcddce40ec6b043a75cd3d5bf48f54953d9d4c5",
	name: "createSpool",
	filename: "src/lib/filament/actions.ts"
}, (opts) => createSpool.__executeServer(opts));
var createSpool = createServerFn({ method: "POST" }).validator(object({
	brand: string().min(1).max(80),
	material: string().min(1).max(40),
	colorName: string().min(1).max(60),
	colorHex: string().regex(/^#?[0-9A-Fa-f]{6}$/),
	emptySpoolG: number().int().min(0).max(800),
	initialG: number().int().min(1).max(5e3),
	remainingG: number().int().min(0).max(5e3),
	priceCentsPerKg: number().int().min(0).max(2e5).nullable(),
	notes: string().max(240).optional()
})).handler(createSpool_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const hex = data.colorHex.startsWith("#") ? data.colorHex : `#${data.colorHex}`;
	const remaining = Math.min(data.remainingG, data.initialG);
	const location = remaining <= 5 ? "empty" : "shelf";
	const id = num((await sql`
      insert into spools (
        brand, material, color_name, color_hex, empty_spool_g, initial_g,
        remaining_g, price_cents_per_kg, location, notes
      ) values (
        ${data.brand}, ${data.material}, ${data.colorName}, ${hex.toUpperCase()},
        ${data.emptySpoolG}, ${data.initialG}, ${remaining}, ${data.priceCentsPerKg},
        ${location}, ${data.notes ?? ""}
      )
      returning id
    `)[0]?.id);
	await writeLedger(sql, {
		spoolId: id,
		jobId: null,
		kind: "create",
		grams: remaining,
		remainingAfter: remaining,
		note: `${data.brand} ${data.material} ${data.colorName}`
	});
	return { id };
});
var updateSpool_createServerFn_handler = createServerRpc({
	id: "c36c478b4ba476bcfca795d8b49a57a7d10f62f01429e35125c2b04e28da1a45",
	name: "updateSpool",
	filename: "src/lib/filament/actions.ts"
}, (opts) => updateSpool.__executeServer(opts));
var updateSpool = createServerFn({ method: "POST" }).validator(object({
	id: number().int().positive(),
	brand: string().min(1).max(80),
	material: string().min(1).max(40),
	colorName: string().min(1).max(60),
	colorHex: string().regex(/^#?[0-9A-Fa-f]{6}$/),
	emptySpoolG: number().int().min(0).max(800),
	initialG: number().int().min(1).max(5e3),
	remainingG: number().int().min(0).max(5e3),
	notes: string().max(240).optional()
})).handler(updateSpool_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const rows = await sql`select * from spools where id = ${data.id} limit 1`;
	if (!rows[0]) throw new Error("Spool not found");
	const prev = rows[0];
	const hex = (data.colorHex.startsWith("#") ? data.colorHex : `#${data.colorHex}`).toUpperCase();
	const remaining = Math.min(data.remainingG, data.initialG);
	let location = prev.location;
	if (location === "loaded") location = remaining <= 5 ? "empty" : "loaded";
	else location = remaining <= 5 ? "empty" : "shelf";
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
	if (delta !== 0) await writeLedger(sql, {
		spoolId: data.id,
		jobId: null,
		kind: "adjust",
		grams: delta,
		remainingAfter: remaining,
		note: "Edited remaining grams"
	});
	return { ok: true };
});
var deleteSpool_createServerFn_handler = createServerRpc({
	id: "7fdd2276636b035a013994eb5d1f6cfdbf8df41a0a8442b734682ea10a6eff0c",
	name: "deleteSpool",
	filename: "src/lib/filament/actions.ts"
}, (opts) => deleteSpool.__executeServer(opts));
var deleteSpool = createServerFn({ method: "POST" }).validator(object({ id: number().int().positive() })).handler(deleteSpool_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if (!(await sql`select * from spools where id = ${data.id} limit 1`)[0]) throw new Error("Spool not found");
	if ((await sql`
      select id from jobs where spool_id = ${data.id} and status = 'printing' limit 1
    `)[0]) throw new Error("Finish or fail the current print before deleting this spool");
	await sql`delete from ledger where spool_id = ${data.id}`;
	await sql`delete from jobs where spool_id = ${data.id}`;
	await sql`delete from spools where id = ${data.id}`;
	return { ok: true };
});
var loadSpool_createServerFn_handler = createServerRpc({
	id: "23c9e5a6000855398bdfc030885dace3f8e32a425c3dcb155db01c96e2fbd2a3",
	name: "loadSpool",
	filename: "src/lib/filament/actions.ts"
}, (opts) => loadSpool.__executeServer(opts));
var loadSpool = createServerFn({ method: "POST" }).validator(object({ id: number() })).handler(loadSpool_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const target = await sql`select * from spools where id = ${data.id} limit 1`;
	if (!target[0]) throw new Error("Spool not found");
	if (num(target[0].remaining_g) <= 5) throw new Error("This spool is empty");
	if ((await sql`select id from jobs where status = 'printing' limit 1`)[0]) throw new Error("Finish or fail the current print before swapping spools");
	await sql`update spools set location = 'shelf', updated_at = now() where location = 'loaded'`;
	await sql`update spools set location = 'loaded', updated_at = now() where id = ${data.id}`;
	await writeLedger(sql, {
		spoolId: data.id,
		jobId: null,
		kind: "load",
		grams: 0,
		remainingAfter: num(target[0].remaining_g),
		note: "Loaded on A1 external holder"
	});
	return { ok: true };
});
var unloadSpool_createServerFn_handler = createServerRpc({
	id: "fc3302f0f95f79d12110ad9f8e78be5fbd59be8730a05423a500e21ac23726f1",
	name: "unloadSpool",
	filename: "src/lib/filament/actions.ts"
}, (opts) => unloadSpool.__executeServer(opts));
var unloadSpool = createServerFn({ method: "POST" }).handler(unloadSpool_createServerFn_handler, async () => {
	const sql = await getSql();
	if ((await sql`select id from jobs where status = 'printing' limit 1`)[0]) throw new Error("Finish or fail the current print before unloading");
	const loaded = await sql`select * from spools where location = 'loaded'`;
	for (const row of loaded) {
		await sql`update spools set location = ${num(row.remaining_g) <= 5 ? "empty" : "shelf"}, updated_at = now() where id = ${row.id}`;
		await writeLedger(sql, {
			spoolId: num(row.id),
			jobId: null,
			kind: "unload",
			grams: 0,
			remainingAfter: num(row.remaining_g),
			note: "Removed from A1 holder"
		});
	}
	return { ok: true };
});
var startJob_createServerFn_handler = createServerRpc({
	id: "5584368dad75ec2093b2b475af544c3f4dbf5ceae29fb66b469b0606ae4a820b",
	name: "startJob",
	filename: "src/lib/filament/actions.ts"
}, (opts) => startJob.__executeServer(opts));
var startJob = createServerFn({ method: "POST" }).validator(object({
	title: string().min(1).max(120),
	slicerG: number().int().min(1).max(5e3)
})).handler(startJob_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const loaded = await sql`select * from spools where location = 'loaded' limit 1`;
	if (!loaded[0]) throw new Error("Load a spool on the A1 first");
	if ((await sql`select id from jobs where status = 'printing' limit 1`)[0]) throw new Error("A print is already running");
	const remaining = num(loaded[0].remaining_g);
	if (data.slicerG > remaining) throw new Error(`Only ${remaining} g left — slicer asks for ${data.slicerG} g`);
	return {
		id: num((await sql`
      insert into jobs (spool_id, title, slicer_g, status, progress, started_at, source)
      values (${loaded[0].id}, ${data.title}, ${data.slicerG}, 'printing', 1, now(), 'manual')
      returning id
    `)[0]?.id),
		remaining
	};
});
var finishJob_createServerFn_handler = createServerRpc({
	id: "c3a59bff8adf2452f04a20d5365ff00c9d9644e90cc54fa17f3d397995b498ca",
	name: "finishJob",
	filename: "src/lib/filament/actions.ts"
}, (opts) => finishJob.__executeServer(opts));
var finishJob = createServerFn({ method: "POST" }).validator(object({
	id: number(),
	actualG: number().int().min(0).max(5e3).nullable()
})).handler(finishJob_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const job = (await sql.query(`${JOB_SELECT} where j.id = $1 limit 1`, [data.id]))[0];
	if (!job) throw new Error("Print not found");
	if (job.status !== "printing" && job.status !== "queued") throw new Error("This print is already closed");
	const spool = (await sql`select * from spools where id = ${job.spool_id} limit 1`)[0];
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
		note: data.actualG == null ? `Slicer estimate ${num(job.slicer_g)} g` : `Weighed print ${data.actualG} g (slicer ${num(job.slicer_g)} g)`
	});
	await writePrinterLive(sql, {
		...IDLE_SNAPSHOT,
		trayType: spool.material,
		trayColor: spool.color_hex
	});
	return {
		remaining,
		deducted: deduct
	};
});
var failJob_createServerFn_handler = createServerRpc({
	id: "947d70bb4660010731724fba4faf2c73d209afd66c3f225dff175cb2c5d7b4e5",
	name: "failJob",
	filename: "src/lib/filament/actions.ts"
}, (opts) => failJob.__executeServer(opts));
var failJob = createServerFn({ method: "POST" }).validator(object({
	id: number(),
	progress: number().int().min(0).max(100),
	actualG: number().int().min(0).max(5e3).nullable()
})).handler(failJob_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const job = (await sql.query(`${JOB_SELECT} where j.id = $1 limit 1`, [data.id]))[0];
	if (!job) throw new Error("Print not found");
	if (job.status !== "printing" && job.status !== "queued") throw new Error("This print is already closed");
	const spool = (await sql`select * from spools where id = ${job.spool_id} limit 1`)[0];
	if (!spool) throw new Error("Spool missing");
	const deduct = data.actualG == null ? Math.round(num(job.slicer_g) * data.progress / 100) : data.actualG;
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
		note: `Failed at ${data.progress}% — deducted ${deduct} g`
	});
	await writePrinterLive(sql, {
		...IDLE_SNAPSHOT,
		trayType: spool.material,
		trayColor: spool.color_hex
	});
	return {
		remaining,
		deducted: deduct
	};
});
var weighSpool_createServerFn_handler = createServerRpc({
	id: "651ffe47a7c5a8ccf1c5ecbcba9412509eae2f0647d41631276156c9334af0af",
	name: "weighSpool",
	filename: "src/lib/filament/actions.ts"
}, (opts) => weighSpool.__executeServer(opts));
var weighSpool = createServerFn({ method: "POST" }).validator(object({
	id: number(),
	scaleG: number().int().min(0).max(8e3)
})).handler(weighSpool_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const rows = await sql`select * from spools where id = ${data.id} limit 1`;
	if (!rows[0]) throw new Error("Spool not found");
	const empty = num(rows[0].empty_spool_g);
	const filament = Math.max(0, data.scaleG - empty);
	const prev = num(rows[0].remaining_g);
	await sql`
      update spools
      set remaining_g = ${filament}, location = ${filament <= 5 ? "empty" : rows[0].location === "loaded" ? "loaded" : "shelf"}, last_weighed_at = now(), updated_at = now()
      where id = ${data.id}
    `;
	await writeLedger(sql, {
		spoolId: data.id,
		jobId: null,
		kind: "weigh_spool",
		grams: filament - prev,
		remainingAfter: filament,
		note: `Scale ${data.scaleG} g − empty ${empty} g`
	});
	return {
		remaining: filament,
		delta: filament - prev
	};
});
var weighPrint_createServerFn_handler = createServerRpc({
	id: "17343cf3d275fdc1ab8170e04df300d9f97cd2acc0c61753a9355f7200d5a43d",
	name: "weighPrint",
	filename: "src/lib/filament/actions.ts"
}, (opts) => weighPrint.__executeServer(opts));
var weighPrint = createServerFn({ method: "POST" }).validator(object({
	jobId: number(),
	actualG: number().int().min(0).max(5e3)
})).handler(weighPrint_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const job = (await sql.query(`${JOB_SELECT} where j.id = $1 limit 1`, [data.jobId]))[0];
	if (!job) throw new Error("Print not found");
	if (job.status !== "completed" && job.status !== "failed") throw new Error("Finish the print first, then weigh it");
	const already = num(job.deducted_g);
	const delta = already - data.actualG;
	const spoolRows = await sql`select * from spools where id = ${job.spool_id} limit 1`;
	if (!spoolRows[0]) throw new Error("Spool missing");
	const remaining = Math.max(0, num(spoolRows[0].remaining_g) + delta);
	await sql`
      update jobs set actual_g = ${data.actualG}, deducted_g = ${data.actualG} where id = ${data.jobId}
    `;
	await applyRemaining(sql, num(job.spool_id), remaining);
	if (delta !== 0) await writeLedger(sql, {
		spoolId: num(job.spool_id),
		jobId: data.jobId,
		kind: "weigh_print",
		grams: delta,
		remainingAfter: remaining,
		note: `Corrected ${already} g → ${data.actualG} g`
	});
	return {
		remaining,
		delta
	};
});
async function openLinkedPrint(sql, args) {
	const existing = await sql`
    select id from jobs where bambu_task_id = ${args.taskId} limit 1
  `;
	if (existing[0]) return num(existing[0].id);
	return num((await sql`
    insert into jobs (spool_id, title, slicer_g, status, progress, started_at, bambu_task_id, source)
    values (${args.spoolId}, ${args.title}, ${args.slicerG}, 'printing', 1, now(), ${args.taskId}, ${args.source})
    returning id
  `)[0]?.id);
}
async function closeLinkedPrint(sql, job, kind, grams, progress, note) {
	if (job.status !== "printing" && job.status !== "queued") return num(job.deducted_g);
	const spoolRows = await sql`select * from spools where id = ${job.spool_id} limit 1`;
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
		note
	});
	return deduct;
}
async function ingestSnapshot(sql, snap, recent) {
	const events = [];
	const loadedRows = await sql`select * from spools where location = 'loaded' limit 1`;
	const loaded = loadedRows[0] ? mapSpool(loadedRows[0]) : null;
	const printing = (await sql.query(`${JOB_SELECT} where j.status = 'printing' order by j.started_at desc limit 1`))[0];
	if (snap.state === "running" || snap.state === "prepare" || snap.state === "paused") {
		if (!loaded) events.push({
			type: "need_spool",
			message: `A1 is printing “${snap.jobTitle || "a job"}” — load the spool on the holder so remaining can be tracked.`
		});
		else if (!printing) {
			const grams = Math.max(1, snap.slicerG);
			if (grams > loaded.remainingG) events.push({
				type: "need_spool",
				message: `Studio wants ${grams} g — only ${loaded.remainingG} g on ${loaded.colorName}.`
			});
			else {
				const taskId = snap.taskId ?? `live-${Date.now()}`;
				await openLinkedPrint(sql, {
					spoolId: loaded.id,
					title: snap.jobTitle || "A1 print",
					slicerG: grams,
					taskId,
					source: "a1"
				});
				events.push({
					type: "auto_start",
					message: `A1 started “${snap.jobTitle || "print"}” · ${grams} g will deduct on finish.`,
					grams
				});
			}
		} else await sql`
        update jobs set progress = ${Math.max(1, Math.min(99, snap.percent))} where id = ${printing.id}
      `;
	} else if (snap.state === "finish" && printing) {
		const grams = snap.slicerG > 0 ? snap.slicerG : num(printing.slicer_g);
		const deducted = await closeLinkedPrint(sql, printing, "completed", grams, 100, `A1 finished — booked ${grams} g from Studio`);
		events.push({
			type: "auto_finish",
			message: `A1 finished “${printing.title}” · deducted ${deducted} g automatically.`,
			grams: deducted
		});
	} else if (snap.state === "failed" && printing) {
		const pct = Math.max(1, Math.min(99, snap.percent || num(printing.progress)));
		const grams = Math.round(num(printing.slicer_g) * pct / 100);
		const deducted = await closeLinkedPrint(sql, printing, "failed", grams, pct, `A1 failed at ${pct}% — booked ${grams} g`);
		events.push({
			type: "auto_fail",
			message: `A1 failed “${printing.title}” at ${pct}% · deducted ${deducted} g.`,
			grams: deducted
		});
	}
	const cutoff = Date.now() - 27e5;
	for (const task of recent) {
		const id = task.id != null ? String(task.id) : "";
		if (!id) continue;
		const end = task.endTime ? new Date(task.endTime).getTime() : 0;
		if (end && end < cutoff) continue;
		const finished = isTaskFinished(task);
		const failed = isTaskFailed(task);
		if (!finished && !failed) continue;
		if ((await sql`select id from jobs where bambu_task_id = ${id} limit 1`)[0]) continue;
		if (!loaded) continue;
		const grams = taskGrams(task);
		const title = task.title || "A1 print";
		const jobId = await openLinkedPrint(sql, {
			spoolId: loaded.id,
			title,
			slicerG: grams,
			taskId: id,
			source: "a1"
		});
		const jobRows = await sql.query(`${JOB_SELECT} where j.id = $1 limit 1`, [jobId]);
		if (!jobRows[0]) continue;
		const deducted = await closeLinkedPrint(sql, jobRows[0], failed ? "failed" : "completed", grams, failed ? 50 : 100, `Imported from Bambu Cloud · ${grams} g`);
		events.push({
			type: "imported",
			message: `Caught “${title}” from the A1 · deducted ${deducted} g.`,
			grams: deducted
		});
	}
	return events;
}
var syncA1_createServerFn_handler = createServerRpc({
	id: "ae39d2bac0fa6e4bdfdc685bbeeb9f6ff0ff2bae0d5cf62de78ef71b7fa60346",
	name: "syncA1",
	filename: "src/lib/filament/actions.ts"
}, (opts) => syncA1.__executeServer(opts));
var syncA1 = createServerFn({ method: "POST" }).validator(object({
	token: string().max(4e3).optional(),
	region: _enum(["global", "cn"]).optional()
})).handler(syncA1_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const events = [];
	const loadedRows = await sql`select * from spools where location = 'loaded' limit 1`;
	const tray = {
		type: loadedRows[0]?.material ?? "",
		color: loadedRows[0]?.color_hex ?? ""
	};
	const printingRows = await sql.query(`${JOB_SELECT} where j.status = 'printing' order by j.started_at desc limit 1`);
	const printing = printingRows[0] ? {
		title: printingRows[0].title,
		slicerG: num(printingRows[0].slicer_g),
		progress: num(printingRows[0].progress),
		taskId: printingRows[0].bambu_task_id
	} : null;
	const token = data.token?.trim();
	let snap;
	let recent = [];
	if (token) try {
		const cloud = await fetchCloudSnapshot(token, data.region ?? "global");
		snap = cloud.snapshot;
		if (!snap.trayType) snap = {
			...snap,
			trayType: tray.type,
			trayColor: tray.color
		};
		recent = cloud.recent;
		await sql`
          insert into settings (key, value) values ('link_mode', 'cloud')
          on conflict (key) do update set value = excluded.value
        `;
	} catch (err) {
		const message = err instanceof Error ? err.message : "Bambu Cloud unreachable";
		events.push({
			type: "link_error",
			message
		});
		snap = await readPrinterLive(sql);
		snap = {
			...snap,
			error: message,
			online: false,
			source: "cloud"
		};
	}
	else {
		snap = tickDemo(await readPrinterLive(sql), printing, tray);
		await sql`
        insert into settings (key, value) values ('link_mode', 'demo')
        on conflict (key) do update set value = excluded.value
      `;
	}
	const ingested = await ingestSnapshot(sql, snap, recent);
	events.push(...ingested);
	await writePrinterLive(sql, snap);
	return {
		dashboard: await buildDashboard(sql),
		events
	};
});
var demoSendPrint_createServerFn_handler = createServerRpc({
	id: "e1201d1a50df5bf768127ae58e43714b30c915f3943b72858b75ddfcace815f6",
	name: "demoSendPrint",
	filename: "src/lib/filament/actions.ts"
}, (opts) => demoSendPrint.__executeServer(opts));
var demoSendPrint = createServerFn({ method: "POST" }).validator(object({
	title: string().min(1).max(120),
	slicerG: number().int().min(1).max(5e3)
})).handler(demoSendPrint_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const loadedRows = await sql`select * from spools where location = 'loaded' limit 1`;
	if (!loadedRows[0]) throw new Error("Load a spool on the A1 first");
	if ((await sql`select id from jobs where status = 'printing' limit 1`)[0]) throw new Error("A print is already running");
	const remaining = num(loadedRows[0].remaining_g);
	if (data.slicerG > remaining) throw new Error(`Only ${remaining} g left — slicer asks for ${data.slicerG} g`);
	const taskId = `demo-${Date.now()}`;
	await openLinkedPrint(sql, {
		spoolId: num(loadedRows[0].id),
		title: data.title,
		slicerG: data.slicerG,
		taskId,
		source: "a1"
	});
	await writePrinterLive(sql, demoStartSnapshot(data.title, data.slicerG, taskId, {
		type: loadedRows[0].material,
		color: loadedRows[0].color_hex
	}));
	const events = [{
		type: "auto_start",
		message: `Studio sent “${data.title}” to the A1 · ${data.slicerG} g reserved.`,
		grams: data.slicerG
	}];
	return {
		dashboard: await buildDashboard(sql),
		events
	};
});
//#endregion
export { createSpool_createServerFn_handler, deleteSpool_createServerFn_handler, demoSendPrint_createServerFn_handler, failJob_createServerFn_handler, finishJob_createServerFn_handler, getDashboard_createServerFn_handler, getSpoolDetail_createServerFn_handler, listJobs_createServerFn_handler, listSpools_createServerFn_handler, loadSpool_createServerFn_handler, startJob_createServerFn_handler, syncA1_createServerFn_handler, unloadSpool_createServerFn_handler, updateSpool_createServerFn_handler, weighPrint_createServerFn_handler, weighSpool_createServerFn_handler };
