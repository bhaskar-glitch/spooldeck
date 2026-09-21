import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as ArrowLeft, f as Pencil, o as Trash2, r as Upload, s as Scale } from "../_libs/lucide-react.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as relativeTime, O as loadSpool, S as formatGrams, d as Dialog, f as DialogContent, h as DialogTitle, k as queryClient, m as DialogHeader, n as Route, p as DialogDescription, s as Button, v as deleteSpool, w as getSpoolDetail } from "./router-B_mUKbDm.mjs";
import { t as Badge } from "./badge-Blcwo5fN.mjs";
import { r as WeighSpoolDialog } from "./weigh-dialog-NfE6t-Bm.mjs";
import { r as remainingPct, t as metersFromGrams } from "./math-CXpBxIaG.mjs";
import { t as SpoolReel } from "./spool-reel-C0RHVy7g.mjs";
import { t as AddSpoolDialog } from "./add-spool-dialog-DDvdI2zV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/spools_._id-GpoEUgBe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SpoolDetailPage() {
	const { id } = Route.useParams();
	const spoolId = Number(id);
	const navigate = useNavigate();
	const initial = Route.useLoaderData();
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["spool", spoolId],
		queryFn: () => getSpoolDetail({ data: { id: spoolId } }),
		enabled: Number.isFinite(spoolId),
		initialData: initial
	});
	const [weighOpen, setWeighOpen] = (0, import_react.useState)(false);
	const [editOpen, setEditOpen] = (0, import_react.useState)(false);
	const [deleteOpen, setDeleteOpen] = (0, import_react.useState)(false);
	const load = useMutation({
		mutationFn: () => loadSpool({ data: { id: spoolId } }),
		onSuccess: () => {
			toast.success("Loaded on the A1 holder");
			queryClient.invalidateQueries();
		},
		onError: (err) => toast.error(err.message)
	});
	const remove = useMutation({
		mutationFn: () => deleteSpool({ data: { id: spoolId } }),
		onSuccess: () => {
			toast.success("Spool removed");
			queryClient.invalidateQueries();
			setDeleteOpen(false);
			navigate({ to: "/spools" });
		},
		onError: (err) => toast.error(err.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-80 animate-pulse rounded-2xl bg-card" });
	if (isError || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: error instanceof Error ? error.message : "Spool not found"
	});
	const { spool, jobs, ledger, usedTotal } = data;
	const pct = remainingPct(spool.remainingG, spool.initialG);
	const meters = metersFromGrams(spool.remainingG, spool.material);
	const printingHere = jobs.some((job) => job.status === "printing");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/spools",
				className: "inline-flex items-center gap-1 text-sm text-muted hover:text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "All spools"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "rounded-2xl border border-line bg-card p-5 sm:p-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-6 sm:flex-row sm:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpoolReel, {
						color: spool.colorHex,
						remaining: spool.remainingG,
						initial: spool.initialG,
						size: 180
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-2xl font-semibold tracking-tight",
									children: spool.colorName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: spool.location === "loaded" ? "print" : spool.location === "empty" ? "danger" : spool.remainingG <= spool.lowG ? "warn" : "neutral",
									children: spool.location === "loaded" ? "on A1" : spool.location
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									spool.brand,
									" · ",
									spool.material
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 font-mono text-5xl tracking-tight tabular-nums",
								children: spool.remainingG
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									"grams · ",
									meters.toFixed(1),
									" m · ",
									Math.round(pct),
									"% of ",
									spool.initialG,
									" g"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-subtle",
								children: [
									"Used on record ",
									formatGrams(usedTotal),
									" · last weighed",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										suppressHydrationWarning: true,
										children: relativeTime(spool.lastWeighedAt)
									})
								]
							}),
							spool.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: spool.notes
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										disabled: spool.location === "loaded" || spool.location === "empty" || load.isPending,
										onClick: () => load.mutate(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), "Load on A1"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => setWeighOpen(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "size-4" }), "Weigh spool"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => setEditOpen(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Edit"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										onClick: () => setDeleteOpen(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete"]
									})
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-sm font-medium tracking-wide text-muted uppercase",
				children: "Prints on this roll"
			}), jobs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-subtle",
				children: "No prints yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-line overflow-hidden rounded-xl border border-line bg-card",
				children: jobs.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: job.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-subtle",
						children: [
							job.status,
							" · slicer ",
							job.slicerG,
							" g",
							job.actualG != null ? ` · weighed ${job.actualG} g` : ""
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-sm tabular-nums text-muted",
						children: [
							"−",
							job.deductedG,
							" g"
						]
					})]
				}, job.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-sm font-medium tracking-wide text-muted uppercase",
				children: "Ledger"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: ledger.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline justify-between gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: [entry.kind.replace("_", " "), entry.note ? ` · ${entry.note}` : ""]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 font-mono tabular-nums text-subtle",
						children: [
							entry.grams > 0 ? "+" : "",
							entry.grams,
							" → ",
							entry.remainingAfter,
							" g"
						]
					})]
				}, entry.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeighSpoolDialog, {
				open: weighOpen,
				onOpenChange: setWeighOpen,
				spool
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddSpoolDialog, {
				open: editOpen,
				onOpenChange: setEditOpen,
				spool
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: deleteOpen,
				onOpenChange: setDeleteOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
					"Delete ",
					spool.colorName,
					"?"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: printingHere ? "This roll is on a running print. Finish or fail that job first." : jobs.length > 0 ? `Removes this roll and ${jobs.length} print${jobs.length === 1 ? "" : "s"} logged against it. That cannot be undone.` : "Removes this roll from the shelf. That cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setDeleteOpen(false),
						children: "Keep"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						disabled: printingHere || remove.isPending,
						onClick: () => remove.mutate(),
						children: remove.isPending ? "Deleting…" : "Delete"
					})]
				})] })
			})
		]
	});
}
//#endregion
export { SpoolDetailPage as component };
