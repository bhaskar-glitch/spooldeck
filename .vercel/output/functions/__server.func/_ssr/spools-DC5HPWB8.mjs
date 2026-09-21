import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { u as Plus } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { D as listSpools, S as formatGrams, T as isLightHex, g as cn, r as Route$1, s as Button } from "./router-B_mUKbDm.mjs";
import { t as Badge } from "./badge-Blcwo5fN.mjs";
import { r as remainingPct } from "./math-CXpBxIaG.mjs";
import { t as AddSpoolDialog } from "./add-spool-dialog-DDvdI2zV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/spools-DC5HPWB8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SpoolCard({ spool }) {
	const pct = remainingPct(spool.remainingG, spool.initialG);
	const low = spool.remainingG <= spool.lowG;
	const locationTone = spool.location === "loaded" ? "print" : spool.location === "empty" ? "danger" : "neutral";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/spools/$id",
		params: { id: String(spool.id) },
		className: "flex flex-col rounded-xl border border-line bg-card p-4 transition-[border-color,background-color] duration-150 hover:border-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("size-10 rounded-full border", isLightHex(spool.colorHex) ? "border-line" : "border-transparent"),
						style: { backgroundColor: spool.colorHex }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium leading-tight",
						children: spool.colorName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							spool.brand,
							" · ",
							spool.material
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: low && spool.location !== "empty" ? "warn" : locationTone,
					children: spool.location === "loaded" ? "on A1" : spool.location
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-2xl tabular-nums tracking-tight",
					children: formatGrams(spool.remainingG)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-subtle",
					children: [
						Math.round(pct),
						"% of ",
						spool.initialG,
						" g"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 h-1.5 overflow-hidden rounded-full bg-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full rounded-full",
					style: {
						width: `${pct}%`,
						backgroundColor: low ? "var(--color-warn)" : spool.colorHex
					}
				})
			})
		]
	});
}
function SpoolsPage() {
	const initial = Route$1.useLoaderData();
	const { data, isLoading } = useQuery({
		queryKey: ["spools"],
		queryFn: () => listSpools(),
		initialData: initial
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const spools = data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5 flex items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Spools"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Shelf inventory for the A1 external holder."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add"]
			})]
		}),
		isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-36 animate-pulse rounded-xl bg-card" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-36 animate-pulse rounded-xl bg-card" })]
		}) : spools.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-dashed border-line px-5 py-12 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Shelf is empty. Add the rolls you actually own."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-4",
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add spool"]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2",
			children: spools.map((spool) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpoolCard, { spool }, spool.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddSpoolDialog, {
			open,
			onOpenChange: setOpen
		})
	] });
}
//#endregion
export { SpoolsPage as component };
