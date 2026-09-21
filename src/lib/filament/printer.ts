export type PrinterState =
  | "idle"
  | "prepare"
  | "running"
  | "paused"
  | "finish"
  | "failed";

export type PrinterSnapshot = {
  source: "demo" | "cloud" | "lan";
  online: boolean;
  state: PrinterState;
  percent: number;
  remainingMin: number;
  layer: number;
  layers: number;
  nozzle: number;
  nozzleTarget: number;
  bed: number;
  bedTarget: number;
  speed: number;
  jobTitle: string;
  slicerG: number;
  taskId: string | null;
  trayType: string;
  trayColor: string;
  deviceName: string;
  error: string | null;
};

export type SyncEvent = {
  type: "auto_start" | "auto_finish" | "auto_fail" | "imported" | "need_spool" | "link_error";
  message: string;
  grams?: number;
};

export const IDLE_SNAPSHOT: PrinterSnapshot = {
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
  speed: 2,
  jobTitle: "",
  slicerG: 0,
  taskId: null,
  trayType: "",
  trayColor: "",
  deviceName: "Bambu Lab A1",
  error: null,
};

type CloudDevice = {
  dev_id?: string;
  name?: string;
  online?: boolean;
  print_status?: string;
  dev_model_name?: string;
  dev_product_name?: string;
  print_job?: string;
};

type CloudTask = {
  id?: string | number;
  title?: string;
  status?: number | string;
  weight?: number | string;
  startTime?: string;
  endTime?: string;
  deviceId?: string;
  amsDetailMapping?: { weight?: number | string; filamentType?: string }[];
};

function asNum(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parsePrinterLive(raw: string | null): PrinterSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PrinterSnapshot;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...IDLE_SNAPSHOT, ...parsed };
  } catch {
    return null;
  }
}

export function mapPrintStatus(status: string | undefined): PrinterState {
  const s = (status ?? "").toUpperCase();
  if (["RUNNING", "ACTIVE", "PRINTING", "WORKING"].includes(s)) return "running";
  if (["PREPARE", "PREPARING", "SLICING"].includes(s)) return "prepare";
  if (["PAUSE", "PAUSED"].includes(s)) return "paused";
  if (["FINISH", "FINISHED", "SUCCESS", "COMPLETED"].includes(s)) return "finish";
  if (["FAILED", "FAIL", "ERROR"].includes(s)) return "failed";
  return "idle";
}

export function tickDemo(
  prev: PrinterSnapshot | null,
  printing: { title: string; slicerG: number; progress: number; taskId: string | null } | null,
  tray: { type: string; color: string },
): PrinterSnapshot {
  const base: PrinterSnapshot = {
    ...(prev ?? IDLE_SNAPSHOT),
    source: "demo",
    online: true,
    deviceName: "Bambu Lab A1",
    trayType: tray.type,
    trayColor: tray.color,
    error: null,
  };

  const sameJob =
    Boolean(printing) &&
    (base.state === "running" || base.state === "prepare" || base.state === "paused") &&
    (printing!.taskId && base.taskId
      ? printing!.taskId === base.taskId
      : printing!.title === base.jobTitle);

  if (printing && !sameJob) {
    const pct = Math.max(1, printing.progress);
    return {
      ...base,
      state: "running",
      percent: pct,
      remainingMin: Math.max(1, Math.round(((100 - pct) / 100) * Math.max(8, printing.slicerG))),
      layer: Math.round((pct / 100) * 180),
      layers: 180,
      nozzle: 220,
      nozzleTarget: 220,
      bed: 60,
      bedTarget: 60,
      jobTitle: printing.title,
      slicerG: printing.slicerG,
      taskId: printing.taskId ?? "demo-live",
    };
  }

  if (base.state === "running" || base.state === "prepare") {
    const nextPct = Math.min(100, base.percent + 6);
    if (nextPct >= 100) {
      return {
        ...base,
        state: "finish",
        percent: 100,
        remainingMin: 0,
        layer: base.layers || 180,
        nozzle: 180,
        nozzleTarget: 0,
      };
    }
    return {
      ...base,
      state: "running",
      percent: nextPct,
      remainingMin: Math.max(0, base.remainingMin - 1),
      layer: Math.min(base.layers || 180, base.layer + 8),
      nozzle: 220,
      nozzleTarget: 220,
      bed: 60,
      bedTarget: 60,
    };
  }

  if (base.state === "finish" || base.state === "failed") {
    if (!printing) {
      return {
        ...IDLE_SNAPSHOT,
        trayType: tray.type,
        trayColor: tray.color,
      };
    }
    return base;
  }

  return {
    ...IDLE_SNAPSHOT,
    trayType: tray.type,
    trayColor: tray.color,
    nozzle: 24,
    bed: 22,
  };
}

export function demoStartSnapshot(
  title: string,
  slicerG: number,
  taskId: string,
  tray: { type: string; color: string },
): PrinterSnapshot {
  return {
    source: "demo",
    online: true,
    state: "running",
    percent: 2,
    remainingMin: Math.max(6, Math.round(slicerG * 0.7)),
    layer: 1,
    layers: Math.max(40, slicerG * 3),
    nozzle: 220,
    nozzleTarget: 220,
    bed: 60,
    bedTarget: 60,
    speed: 2,
    jobTitle: title,
    slicerG,
    taskId,
    trayType: tray.type,
    trayColor: tray.color,
    deviceName: "Bambu Lab A1",
    error: null,
  };
}

function pickDevice(devices: CloudDevice[]): CloudDevice | null {
  if (!devices.length) return null;
  const a1 = devices.find((d) => {
    const blob = `${d.dev_product_name ?? ""} ${d.dev_model_name ?? ""} ${d.name ?? ""}`;
    return /a1/i.test(blob);
  });
  return a1 ?? devices[0];
}

export function taskGrams(task: CloudTask): number {
  const mapped = task.amsDetailMapping?.[0]?.weight;
  const fromMap = Math.round(asNum(mapped));
  if (fromMap > 0) return fromMap;
  return Math.max(1, Math.round(asNum(task.weight)));
}

export async function fetchCloudSnapshot(
  token: string,
  region: "global" | "cn",
): Promise<{ snapshot: PrinterSnapshot; recent: CloudTask[] }> {
  const base = region === "cn" ? "https://api.bambulab.cn" : "https://api.bambulab.com";
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  const bindRes = await fetch(`${base}/v1/iot-service/api/user/bind`, {
    headers,
    signal: AbortSignal.timeout(8000),
  });
  if (bindRes.status === 401 || bindRes.status === 403) {
    throw new Error("Bambu token rejected — paste a fresh access token from Bambu Handy / Studio");
  }
  if (!bindRes.ok) {
    throw new Error(`Bambu Cloud returned ${bindRes.status}`);
  }
  const bindJson = (await bindRes.json()) as { devices?: CloudDevice[] };
  const device = pickDevice(bindJson.devices ?? []);
  if (!device) {
    throw new Error("No printer on this Bambu account");
  }

  let recent: CloudTask[] = [];
  try {
    const q = new URLSearchParams({ limit: "12" });
    if (device.dev_id) q.set("deviceId", device.dev_id);
    const taskRes = await fetch(`${base}/v1/user-service/my/tasks?${q.toString()}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (taskRes.ok) {
      const taskJson = (await taskRes.json()) as { hits?: CloudTask[]; data?: { hits?: CloudTask[] } };
      recent = taskJson.hits ?? taskJson.data?.hits ?? [];
    }
  } catch {
    recent = [];
  }

  const state = mapPrintStatus(device.print_status);
  const current =
    recent.find((t) => {
      const st = t.status;
      return st === 1 || st === "printing" || st === "RUNNING";
    }) ?? (state === "running" || state === "prepare" ? recent[0] : undefined);

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
      speed: 2,
      jobTitle: title,
      slicerG: grams,
      taskId: current?.id != null ? String(current.id) : device.print_job ? String(device.print_job) : null,
      trayType: filament,
      trayColor: "",
      deviceName: device.name || device.dev_product_name || "Bambu Lab A1",
      error: null,
    },
    recent,
  };
}

export function isTaskFinished(task: CloudTask) {
  const st = task.status;
  return st === 2 || st === "finished" || st === "FINISH" || st === "completed";
}

export function isTaskFailed(task: CloudTask) {
  const st = task.status;
  return st === 3 || st === "failed" || st === "FAILED" || st === "aborted";
}

export function snapshotFromMqtt(prev: PrinterSnapshot, print: Record<string, unknown>): PrinterSnapshot {
  const vt = (print.vt_tray ?? null) as
    | { tray_type?: string; tray_color?: string }
    | null;
  const rawColor = String(vt?.tray_color ?? "").replace(/^#/, "");
  const hex = rawColor.length >= 6 ? `#${rawColor.slice(0, 6)}` : "";
  const file = String(print.subtask_name ?? print.gcode_file ?? "");
  const title = file ? file.replace(/^.*[/\\]/, "").replace(/\.gcode.*$/i, "").replace(/\.3mf$/i, "") : prev.jobTitle;
  const task =
    print.task_id != null && String(print.task_id) !== "0"
      ? String(print.task_id)
      : print.subtask_id != null && String(print.subtask_id) !== "0"
        ? String(print.subtask_id)
        : prev.taskId;
  
  const nextState = print.gcode_state != null ? mapPrintStatus(String(print.gcode_state)) : prev.state;

  return {
    source: "lan",
    online: true,
    state: nextState,
    percent: print.mc_percent != null ? Math.max(0, Math.min(100, Math.round(asNum(print.mc_percent)))) : prev.percent,
    remainingMin: print.mc_remaining_time != null ? Math.max(0, Math.round(asNum(print.mc_remaining_time))) : prev.remainingMin,
    layer: print.layer_num != null ? Math.round(asNum(print.layer_num)) : prev.layer,
    layers: print.total_layer_num != null ? Math.round(asNum(print.total_layer_num)) : prev.layers,
    nozzle: print.nozzle_temper != null ? asNum(print.nozzle_temper) : prev.nozzle,
    nozzleTarget: print.nozzle_target_temper != null ? asNum(print.nozzle_target_temper) : prev.nozzleTarget,
    bed: print.bed_temper != null ? asNum(print.bed_temper) : prev.bed,
    bedTarget: print.bed_target_temper != null ? asNum(print.bed_target_temper) : prev.bedTarget,
    speed: print.spd_lvl != null ? asNum(print.spd_lvl) : prev.speed,
    jobTitle: title,
    slicerG: prev.slicerG,
    taskId: task,
    trayType: String(vt?.tray_type ?? prev.trayType),
    trayColor: hex || prev.trayColor,
    deviceName: "Bambu Lab A1",
    error: null,
  };
}

export type { CloudTask };
