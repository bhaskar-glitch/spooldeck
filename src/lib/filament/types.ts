import type { PrinterSnapshot, SyncEvent } from "./printer";

export type { PrinterSnapshot, SyncEvent };

export type SpoolLocation = "shelf" | "loaded" | "empty" | "archived";
export type JobStatus = "queued" | "printing" | "completed" | "failed" | "cancelled";
export type LedgerKind =
  | "create"
  | "load"
  | "unload"
  | "deduct"
  | "weigh_print"
  | "weigh_spool"
  | "adjust";

export type Spool = {
  id: number;
  brand: string;
  material: string;
  colorName: string;
  colorHex: string;
  emptySpoolG: number;
  initialG: number;
  remainingG: number;
  priceCentsPerKg: number | null;
  location: SpoolLocation;
  lowG: number;
  notes: string;
  lastWeighedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Job = {
  id: number;
  spoolId: number;
  title: string;
  slicerG: number;
  actualG: number | null;
  deductedG: number;
  status: JobStatus;
  progress: number;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  bambuTaskId: string | null;
  source: string;
  spoolBrand: string;
  spoolMaterial: string;
  spoolColorName: string;
  spoolColorHex: string;
};

export type LedgerEntry = {
  id: number;
  spoolId: number;
  jobId: number | null;
  kind: LedgerKind;
  grams: number;
  remainingAfter: number;
  note: string;
  createdAt: string;
};

export type Dashboard = {
  printerName: string;
  loaded: Spool | null;
  printing: Job | null;
  recentJobs: Job[];
  lowSpools: Spool[];
  used7d: number;
  spoolCount: number;
  remainingTotal: number;
  printer: PrinterSnapshot;
};

export type SpoolDetail = {
  spool: Spool;
  jobs: Job[];
  ledger: LedgerEntry[];
  usedTotal: number;
};
