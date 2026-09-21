import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as relativeTime, E as listJobs, i as Route$2, s as Button } from "./router-B_mUKbDm.mjs";
import { t as Badge } from "./badge-Blcwo5fN.mjs";
import { n as WeighPrintDialog } from "./weigh-dialog-NfE6t-Bm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs-C0sAZj0K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toneFor(status) {
	if (status === "completed") return "ok";
	if (status === "failed") return "danger";
	if (status === "printing") return "print";
	return "neutral";
}
function JobsPage() {
	const initial = Route$2.useLoaderData();
	const { data, isLoading } = useQuery({
		queryKey: ["jobs"],
		queryFn: () => listJobs(),
		initialData: initial
	});
	const [weighJob, setWeighJob] = (0, import_react.useState)(null);
	const jobs = data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Jobs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Every print the A1 finishes is booked automatically. Weigh a finished part later if you want the ledger exact."
			})]
		}),
		isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-card" }) : jobs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-subtle",
			children: "No prints logged yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-line overflow-hidden rounded-xl border border-line bg-card",
			children: jobs.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 size-3 shrink-0 rounded-full border border-line",
						style: { backgroundColor: job.spoolColorHex }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: job.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								job.spoolColorName,
								" · ",
								job.spoolMaterial
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									suppressHydrationWarning: true,
									children: relativeTime(job.finishedAt ?? job.startedAt)
								}),
								" ",
								"· ",
								job.source === "a1" ? "A1" : "manual",
								" · slicer ",
								job.slicerG,
								" g",
								job.actualG != null ? ` · scale ${job.actualG} g` : ""
							]
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 sm:flex-col sm:items-end",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: toneFor(job.status),
								children: job.status
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-sm tabular-nums",
								children: job.status === "printing" ? `${job.progress}%` : `−${job.deductedG} g`
							})]
						}),
						(job.status === "completed" || job.status === "failed") && job.actualG == null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setWeighJob(job),
							children: "Weigh print"
						}),
						job.status === "printing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								children: "Open deck"
							})
						})
					]
				})]
			}, job.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeighPrintDialog, {
			open: weighJob !== null,
			onOpenChange: (v) => {
				if (!v) setWeighJob(null);
			},
			job: weighJob
		})
	] });
}
//#endregion
export { JobsPage as component };
