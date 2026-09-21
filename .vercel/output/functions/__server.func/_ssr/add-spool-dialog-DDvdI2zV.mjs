import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as updateSpool, T as isLightHex, _ as createSpool, c as Label, d as Dialog, f as DialogContent, g as cn, h as DialogTitle, k as queryClient, l as Input, m as DialogHeader, p as DialogDescription, s as Button } from "./router-B_mUKbDm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/add-spool-dialog-DDvdI2zV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATALOG = [
	{
		brand: "Bambu Lab",
		material: "PLA",
		colorName: "Jade White",
		colorHex: "#F4F1E8",
		emptySpoolG: 250,
		initialG: 1e3,
		priceCentsPerKg: 2499
	},
	{
		brand: "Bambu Lab",
		material: "PLA",
		colorName: "Black",
		colorHex: "#1A1A1A",
		emptySpoolG: 250,
		initialG: 1e3,
		priceCentsPerKg: 2499
	},
	{
		brand: "Bambu Lab",
		material: "PLA",
		colorName: "Red",
		colorHex: "#C12E1F",
		emptySpoolG: 250,
		initialG: 1e3,
		priceCentsPerKg: 2499
	},
	{
		brand: "Bambu Lab",
		material: "PLA",
		colorName: "Blue",
		colorHex: "#0A2A7A",
		emptySpoolG: 250,
		initialG: 1e3,
		priceCentsPerKg: 2499
	},
	{
		brand: "Bambu Lab",
		material: "PLA",
		colorName: "Orange",
		colorHex: "#E85D04",
		emptySpoolG: 250,
		initialG: 1e3,
		priceCentsPerKg: 2499
	},
	{
		brand: "Bambu Lab",
		material: "PLA",
		colorName: "Green",
		colorHex: "#1F8A4D",
		emptySpoolG: 250,
		initialG: 1e3,
		priceCentsPerKg: 2499
	},
	{
		brand: "Bambu Lab",
		material: "PLA",
		colorName: "Grey",
		colorHex: "#8E9089",
		emptySpoolG: 250,
		initialG: 1e3,
		priceCentsPerKg: 2499
	},
	{
		brand: "Bambu Lab",
		material: "PETG HF",
		colorName: "Black",
		colorHex: "#1A1A1A",
		emptySpoolG: 250,
		initialG: 1e3,
		priceCentsPerKg: 2799
	},
	{
		brand: "Bambu Lab",
		material: "PETG HF",
		colorName: "Forest Green",
		colorHex: "#1F6B4A",
		emptySpoolG: 250,
		initialG: 1e3,
		priceCentsPerKg: 2799
	},
	{
		brand: "Bambu Lab",
		material: "PETG HF",
		colorName: "Orange",
		colorHex: "#E85D04",
		emptySpoolG: 250,
		initialG: 1e3,
		priceCentsPerKg: 2799
	},
	{
		brand: "eSUN",
		material: "PLA+",
		colorName: "Grey",
		colorHex: "#8A8F98",
		emptySpoolG: 160,
		initialG: 1e3,
		priceCentsPerKg: 1899
	},
	{
		brand: "eSUN",
		material: "PLA+",
		colorName: "Black",
		colorHex: "#1A1A1A",
		emptySpoolG: 160,
		initialG: 1e3,
		priceCentsPerKg: 1899
	},
	{
		brand: "Polymaker",
		material: "PETG",
		colorName: "Cotton White",
		colorHex: "#F7F4EE",
		emptySpoolG: 180,
		initialG: 1e3,
		priceCentsPerKg: 2299
	},
	{
		brand: "Polymaker",
		material: "PLA",
		colorName: "PolyLite Black",
		colorHex: "#141414",
		emptySpoolG: 180,
		initialG: 1e3,
		priceCentsPerKg: 2199
	}
];
var MATERIALS = [
	"PLA",
	"PLA+",
	"PETG",
	"PETG HF",
	"ABS",
	"ASA",
	"TPU",
	"PA",
	"PC"
];
var EMPTY_SPOOL_PRESETS = [
	{
		label: "Bambu 1 kg",
		g: 250
	},
	{
		label: "Plastic generic",
		g: 200
	},
	{
		label: "Cardboard generic",
		g: 160
	},
	{
		label: "Refill cardboard",
		g: 140
	}
];
function AddSpoolDialog({ open, onOpenChange, spool }) {
	const editing = Boolean(spool);
	const [brand, setBrand] = (0, import_react.useState)("Bambu Lab");
	const [material, setMaterial] = (0, import_react.useState)("PLA");
	const [colorName, setColorName] = (0, import_react.useState)("");
	const [colorHex, setColorHex] = (0, import_react.useState)("#F4F1E8");
	const [emptyG, setEmptyG] = (0, import_react.useState)("250");
	const [initialG, setInitialG] = (0, import_react.useState)("1000");
	const [remainingG, setRemainingG] = (0, import_react.useState)("1000");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		if (spool) {
			setBrand(spool.brand);
			setMaterial(spool.material);
			setColorName(spool.colorName);
			setColorHex(spool.colorHex.toLowerCase());
			setEmptyG(String(spool.emptySpoolG));
			setInitialG(String(spool.initialG));
			setRemainingG(String(spool.remainingG));
			return;
		}
		setBrand("Bambu Lab");
		setMaterial("PLA");
		setColorName("");
		setColorHex("#F4F1E8");
		setEmptyG("250");
		setInitialG("1000");
		setRemainingG("1000");
	}, [open, spool]);
	const mutation = useMutation({
		mutationFn: async () => {
			const payload = {
				brand: brand.trim(),
				material,
				colorName: colorName.trim(),
				colorHex,
				emptySpoolG: Number(emptyG) || 250,
				initialG: Number(initialG) || 1e3,
				remainingG: Number(remainingG) || 0,
				notes: spool?.notes
			};
			if (spool) {
				await updateSpool({ data: {
					id: spool.id,
					...payload
				} });
				return;
			}
			await createSpool({ data: {
				...payload,
				priceCentsPerKg: null
			} });
		},
		onSuccess: () => {
			toast.success(editing ? "Spool updated" : "Spool added to the shelf");
			queryClient.invalidateQueries();
			onOpenChange(false);
		},
		onError: (err) => toast.error(err.message)
	});
	function pickCatalog(i) {
		setBrand(i.brand);
		setMaterial(i.material);
		setColorName(i.colorName);
		setColorHex(i.colorHex);
		setEmptyG(String(i.emptySpoolG));
		setInitialG(String(i.initialG));
		if (!editing) setRemainingG(String(i.initialG));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Edit spool" : "Add a spool" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: editing ? "Change colour, material, or remaining grams. Remaining edits book as an adjustment." : "Pick a Bambu colour or enter a third-party spool. Remaining starts at the full roll unless you type a weighed value." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 flex gap-2 overflow-x-auto pb-1",
					children: CATALOG.slice(0, 10).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => pickCatalog(item),
						className: "flex shrink-0 flex-col items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("size-9 rounded-full border", isLightHex(item.colorHex) ? "border-line" : "border-transparent"),
							style: { backgroundColor: item.colorHex }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "max-w-14 truncate text-xs text-subtle",
							children: item.colorName
						})]
					}, `${item.brand}-${item.material}-${item.colorName}`))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "brand",
								children: "Brand"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "brand",
								value: brand,
								onChange: (e) => setBrand(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "material",
								children: "Material"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: "material",
								value: material,
								onChange: (e) => setMaterial(e.target.value),
								className: "h-12 rounded-md border border-line bg-elevated px-3 text-base text-fg",
								children: [material, ...MATERIALS.filter((m) => m !== material)].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: m,
									children: m
								}, m))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "color",
								children: "Colour name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "color",
								value: colorName,
								onChange: (e) => setColorName(e.target.value),
								placeholder: "Jade White"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "hex",
								children: "Colour"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "hex",
									type: "color",
									value: colorHex,
									onChange: (e) => setColorHex(e.target.value),
									className: "h-12 w-14 cursor-pointer rounded-md border border-line bg-elevated p-1"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: colorHex,
									onChange: (e) => setColorHex(e.target.value),
									className: "font-mono"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Empty spool (g)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5",
									children: EMPTY_SPOOL_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setEmptyG(String(p.g)),
										className: cn("h-9 rounded-full border px-3 text-xs", emptyG === String(p.g) ? "border-primary bg-primary text-primary-fg" : "border-line text-muted"),
										children: p.label
									}, p.g))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "numeric",
									value: emptyG,
									onChange: (e) => setEmptyG(e.target.value)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "init",
								children: "Filament on the roll (g)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "init",
								inputMode: "numeric",
								value: initialG,
								onChange: (e) => setInitialG(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5 sm:col-span-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "remain",
									children: "Remaining now (g)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "remain",
									inputMode: "numeric",
									value: remainingG,
									onChange: (e) => setRemainingG(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-subtle",
									children: "New sealed roll: same as full weight. Partial roll: weigh spool, subtract empty spool, enter the difference."
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5 w-full",
					size: "lg",
					disabled: !colorName.trim() || mutation.isPending,
					onClick: () => mutation.mutate(),
					children: mutation.isPending ? "Saving…" : editing ? "Save changes" : "Add to shelf"
				})
			]
		})
	});
}
//#endregion
export { AddSpoolDialog as t };
