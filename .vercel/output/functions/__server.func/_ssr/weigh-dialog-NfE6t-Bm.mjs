import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { g as Delete } from "../_libs/lucide-react.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as weighPrint, I as weighSpool, d as Dialog, f as DialogContent, g as cn, h as DialogTitle, k as queryClient, m as DialogHeader, p as DialogDescription, s as Button } from "./router-B_mUKbDm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/weigh-dialog-NfE6t-Bm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEYS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"00",
	"0",
	"del"
];
function Numpad({ value, onChange, max = 4 }) {
	function press(key) {
		if (key === "del") {
			onChange(value.slice(0, -1));
			return;
		}
		if (value.length >= max) return;
		if (key === "00") {
			onChange((value + "00").slice(0, max).replace(/^0+(?=\d)/, ""));
			return;
		}
		if (value === "0") onChange(key);
		else onChange(value + key);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-2",
		children: KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => press(key),
			className: cn("flex h-14 items-center justify-center rounded-md bg-elevated font-mono text-xl font-medium text-fg transition-colors duration-150 hover:bg-line", key === "del" && "text-muted"),
			children: key === "del" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delete, { className: "size-5" }) : key
		}, key))
	});
}
function WeighSpoolDialog({ open, onOpenChange, spool }) {
	const [scale, setScale] = (0, import_react.useState)("");
	const mutation = useMutation({
		mutationFn: () => {
			if (!spool) throw new Error("No spool");
			return weighSpool({ data: {
				id: spool.id,
				scaleG: Number(scale) || 0
			} });
		},
		onSuccess: (res) => {
			const sign = res.delta >= 0 ? "+" : "";
			toast.success(`Remaining set to ${res.remaining} g (${sign}${res.delta} g)`);
			queryClient.invalidateQueries();
			onOpenChange(false);
			setScale("");
		},
		onError: (err) => toast.error(err.message)
	});
	if (!spool) return null;
	const scaleN = Number(scale) || 0;
	const filament = Math.max(0, scaleN - spool.emptySpoolG);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Weigh the spool" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				"Put the whole roll on a kitchen scale. Empty ",
				spool.brand,
				" spool is ",
				spool.emptySpoolG,
				" g — that gets subtracted automatically."
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-end justify-between rounded-lg bg-elevated px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-4xl tabular-nums",
					children: scale || "0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: "g on scale"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-3 text-sm text-muted",
				children: ["Filament remaining: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-fg tabular-nums",
					children: [filament, " g"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Numpad, {
				value: scale,
				onChange: setScale,
				max: 4
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4 w-full",
				size: "lg",
				disabled: scaleN < spool.emptySpoolG || mutation.isPending,
				onClick: () => mutation.mutate(),
				children: mutation.isPending ? "Saving…" : "Set remaining from scale"
			})
		] })
	});
}
function WeighPrintDialog({ open, onOpenChange, job }) {
	const [grams, setGrams] = (0, import_react.useState)("");
	const mutation = useMutation({
		mutationFn: () => {
			if (!job) throw new Error("No print");
			return weighPrint({ data: {
				jobId: job.id,
				actualG: Number(grams) || 0
			} });
		},
		onSuccess: (res) => {
			toast.success(res.delta === 0 ? "Weight matches the deduction" : `Corrected remaining by ${res.delta > 0 ? "+" : ""}${res.delta} g`);
			queryClient.invalidateQueries();
			onOpenChange(false);
			setGrams("");
		},
		onError: (err) => toast.error(err.message)
	});
	if (!job) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Weigh finished print" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				job.title,
				" was booked at ",
				job.deductedG,
				" g. Weighing the part overwrites that with the true mass."
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-end justify-between rounded-lg bg-elevated px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-4xl tabular-nums",
					children: grams || "0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: "g"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Numpad, {
				value: grams,
				onChange: setGrams,
				max: 4
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4 w-full",
				size: "lg",
				disabled: !grams || mutation.isPending,
				onClick: () => mutation.mutate(),
				children: mutation.isPending ? "Saving…" : "Correct remaining"
			})
		] })
	});
}
//#endregion
export { WeighPrintDialog as n, WeighSpoolDialog as r, Numpad as t };
