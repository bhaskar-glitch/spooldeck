import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as CircleAlert, a as TriangleAlert, c as Radio, d as Play, i as Unplug, n as Wifi, p as Pause, s as Scale, v as Check } from "../_libs/lucide-react.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as relativeTime, C as getDashboard, M as syncA1, N as unloadSpool, S as formatGrams, a as Route$4, b as failJob, c as Label, d as Dialog, f as DialogContent, g as cn, h as DialogTitle, j as startJob, k as queryClient, l as Input, m as DialogHeader, o as REGION_KEY, p as DialogDescription, s as Button, u as Textarea, x as finishJob, y as demoSendPrint } from "./router-B_mUKbDm.mjs";
import { t as Badge } from "./badge-Blcwo5fN.mjs";
import { r as WeighSpoolDialog, t as Numpad } from "./weigh-dialog-NfE6t-Bm.mjs";
import { n as parseSlicerUsage, r as remainingPct, t as metersFromGrams } from "./math-CXpBxIaG.mjs";
import { t as SpoolReel } from "./spool-reel-C0RHVy7g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-5O7lLYna.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StartJobDialog({ open, onOpenChange, remainingG }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [grams, setGrams] = (0, import_react.useState)("48");
	const [paste, setPaste] = (0, import_react.useState)("");
	const mutation = useMutation({
		mutationFn: () => startJob({ data: {
			title: title.trim() || "Untitled print",
			slicerG: Number(grams) || 0
		} }),
		onSuccess: () => {
			toast.success("Print logged — remaining drops when the A1 reports done");
			queryClient.invalidateQueries();
			onOpenChange(false);
			setTitle("");
		},
		onError: (err) => toast.error(err.message)
	});
	function applyPaste() {
		const parsed = parseSlicerUsage(paste);
		if (parsed == null) {
			toast.error("No gram value found — paste ‘Filament used: 36.8g’ from Bambu Studio");
			return;
		}
		setGrams(String(parsed));
		toast.success(`Captured ${parsed} g from slicer`);
	}
	const g = Number(grams) || 0;
	const enough = g > 0 && g <= remainingG;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Start a print" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Fallback if Studio is not linked. Copy grams from Bambu Studio (Prepare tab, filament used). Linked prints open themselves." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "job-title",
							children: "Job name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "job-title",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							placeholder: "Toolhead cover"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Slicer grams" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-end justify-between rounded-lg bg-elevated px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-4xl tabular-nums tracking-tight",
									children: grams || "0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted",
									children: "g"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: enough ? "text-xs text-ok" : "text-xs text-danger",
								children: g === 0 ? "Enter grams from the slicer" : enough ? `${remainingG - g} g will remain after this print` : `Need ${g} g — only ${remainingG} g on the holder`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Numpad, {
						value: grams,
						onChange: setGrams
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "paste",
								children: "Or paste Studio output"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "paste",
								value: paste,
								onChange: (e) => setPaste(e.target.value),
								placeholder: "Filament used: 1.62 m / 48.30 g"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: applyPaste,
								children: "Read grams from paste"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						className: "w-full",
						disabled: !enough || mutation.isPending,
						onClick: () => mutation.mutate(),
						children: mutation.isPending ? "Starting…" : "Start on loaded spool"
					})
				]
			})]
		})
	});
}
function FinishJobDialog({ open, onOpenChange, job, mode }) {
	const [actual, setActual] = (0, import_react.useState)("");
	const [progress, setProgress] = (0, import_react.useState)("40");
	const finishMut = useMutation({
		mutationFn: () => {
			if (!job) throw new Error("No print");
			return finishJob({ data: {
				id: job.id,
				actualG: actual ? Number(actual) : null
			} });
		},
		onSuccess: (res) => {
			toast.success(`Deducted ${res.deducted} g · ${res.remaining} g left`);
			queryClient.invalidateQueries();
			onOpenChange(false);
			setActual("");
		},
		onError: (err) => toast.error(err.message)
	});
	const failMut = useMutation({
		mutationFn: () => {
			if (!job) throw new Error("No print");
			return failJob({ data: {
				id: job.id,
				progress: Number(progress) || 0,
				actualG: actual ? Number(actual) : null
			} });
		},
		onSuccess: (res) => {
			toast.success(`Failed print · deducted ${res.deducted} g`);
			queryClient.invalidateQueries();
			onOpenChange(false);
			setActual("");
		},
		onError: (err) => toast.error(err.message)
	});
	if (!job) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: mode === "finish" ? "Finish print" : "Mark as failed" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: mode === "finish" ? `Slicer said ${job.slicerG} g. Leave the scale blank to auto-deduct that, or weigh the part for a precision correction.` : "Deducts a fraction of the slicer grams based on how far the print got — or weigh the failed part." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-elevated px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: job.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-2xl tabular-nums",
						children: [job.slicerG, " g slicer"]
					})]
				}),
				mode === "fail" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "pct",
						children: "Percent completed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "pct",
						inputMode: "numeric",
						value: progress,
						onChange: (e) => setProgress(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "actual",
							children: "Weigh the print (optional)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "actual",
							inputMode: "numeric",
							value: actual,
							onChange: (e) => setActual(e.target.value),
							placeholder: "Leave empty to use slicer grams"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: "Kitchen scale the finished part. If you skip this, remaining still updates from the slicer estimate."
						})
					]
				}),
				mode === "finish" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "lg",
					disabled: finishMut.isPending,
					onClick: () => finishMut.mutate(),
					children: finishMut.isPending ? "Saving…" : actual ? `Deduct ${actual} g` : `Deduct ${job.slicerG} g`
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "lg",
					variant: "danger",
					disabled: failMut.isPending,
					onClick: () => failMut.mutate(),
					children: failMut.isPending ? "Saving…" : "Record failed print"
				})
			]
		})] })
	});
}
function stateLabel(state) {
	if (state === "running" || state === "prepare") return "printing";
	if (state === "paused") return "paused";
	if (state === "finish") return "finished";
	if (state === "failed") return "failed";
	return "idle";
}
function stateTone(state) {
	if (state === "running" || state === "prepare") return "print";
	if (state === "finish") return "ok";
	if (state === "failed") return "danger";
	if (state === "paused") return "warn";
	return "neutral";
}
function PrinterPanel({ printer, onOpenLink }) {
	const live = printer.state === "running" || printer.state === "prepare";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-line bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-subtle uppercase",
						children: "A1 link"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-lg font-semibold",
						children: printer.deviceName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [printer.source === "cloud" ? "Bambu Cloud" : "Live demo LAN", " · external holder"]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onOpenLink,
					className: "flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-fg",
					children: [printer.online ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative flex size-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute inline-flex size-full rounded-full opacity-60", live ? "animate-ping bg-ok" : "bg-ok") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex size-2 rounded-full bg-ok" })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-3.5" }), printer.online ? "online" : "offline"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: stateTone(printer.state),
						children: stateLabel(printer.state)
					}),
					live && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-sm tabular-nums text-muted",
						suppressHydrationWarning: true,
						children: [printer.percent, "%"]
					}),
					printer.slicerG > 0 && live && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-subtle",
						children: [
							"Studio ",
							printer.slicerG,
							" g"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-3 gap-3 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-subtle",
						children: "Nozzle"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "mt-1 font-mono text-sm tabular-nums",
						suppressHydrationWarning: true,
						children: [
							Math.round(printer.nozzle),
							printer.nozzleTarget ? `/${Math.round(printer.nozzleTarget)}` : "",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: "°"
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-subtle",
						children: "Bed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "mt-1 font-mono text-sm tabular-nums",
						suppressHydrationWarning: true,
						children: [
							Math.round(printer.bed),
							printer.bedTarget ? `/${Math.round(printer.bedTarget)}` : "",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: "°"
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-subtle",
						children: "Layer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 font-mono text-sm tabular-nums",
						suppressHydrationWarning: true,
						children: printer.layers ? `${printer.layer}/${printer.layers}` : "—"
					})] })
				]
			}),
			(printer.trayType || printer.jobTitle) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm text-muted",
				suppressHydrationWarning: true,
				children: [
					printer.trayType ? `External tray ${printer.trayType}` : "External tray",
					printer.jobTitle ? ` · ${printer.jobTitle}` : "",
					printer.remainingMin > 0 ? ` · ${printer.remainingMin} min left` : ""
				]
			}),
			printer.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-danger",
				children: printer.error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onOpenLink,
				className: "mt-4 inline-flex items-center gap-1.5 text-xs text-subtle hover:text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }), "Printer connection"]
			})
		]
	});
}
var DEMO_JOBS = [
	{
		title: "Benchy",
		slicerG: 42
	},
	{
		title: "Cable clip ×4",
		slicerG: 18
	},
	{
		title: "Gridfinity scoop",
		slicerG: 37
	}
];
function announce(events, seen) {
	for (const event of events) {
		const key = `${event.type}:${event.message}`;
		if (seen.has(key)) continue;
		seen.add(key);
		if (event.type === "link_error" || event.type === "need_spool") toast.error(event.message);
		else toast.success(event.message);
	}
}
function Deck() {
	const initial = Route$4.useLoaderData();
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard(),
		initialData: initial,
		staleTime: Infinity
	});
	const [startOpen, setStartOpen] = (0, import_react.useState)(false);
	const [finishMode, setFinishMode] = (0, import_react.useState)(null);
	const [weighOpen, setWeighOpen] = (0, import_react.useState)(false);
	const [live, setLive] = (0, import_react.useState)(false);
	const [creds, setCreds] = (0, import_react.useState)({ region: "global" });
	const seenEvents = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		const start = window.setTimeout(() => setLive(true), 300);
		function readCreds() {
			const token = window.localStorage.getItem("spooldeck.bambuToken") ?? void 0;
			const region = window.localStorage.getItem(REGION_KEY);
			setCreds({
				token,
				region: region === "cn" ? "cn" : "global"
			});
		}
		readCreds();
		window.addEventListener("spooldeck:creds-changed", readCreds);
		return () => {
			window.clearTimeout(start);
			window.removeEventListener("spooldeck:creds-changed", readCreds);
		};
	}, []);
	useQuery({
		queryKey: [
			"sync-a1",
			creds.token ? "cloud" : "demo",
			creds.region
		],
		queryFn: async () => {
			const res = await syncA1({ data: {
				token: creds.token,
				region: creds.region
			} });
			announce(res.events, seenEvents.current);
			queryClient.setQueryData(["dashboard"], res.dashboard);
			if (res.events.length > 0) {
				queryClient.invalidateQueries({ queryKey: ["jobs"] });
				queryClient.invalidateQueries({ queryKey: ["spools"] });
			}
			return res;
		},
		enabled: live,
		refetchInterval: 4e3
	});
	const unload = useMutation({
		mutationFn: () => unloadSpool(),
		onSuccess: () => {
			toast.success("Spool moved back to the shelf");
			queryClient.invalidateQueries();
		},
		onError: (err) => toast.error(err.message)
	});
	const sendDemo = useMutation({
		mutationFn: (job) => demoSendPrint({ data: job }),
		onSuccess: (res) => {
			announce(res.events, seenEvents.current);
			queryClient.setQueryData(["dashboard"], res.dashboard);
		},
		onError: (err) => toast.error(err.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-72 animate-pulse rounded-2xl bg-card" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-xl bg-card" })]
	});
	if (isError || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: error instanceof Error ? error.message : "Could not load deck"
	});
	const loaded = data.loaded;
	const printing = data.printing;
	const printer = data.printer;
	const pct = loaded ? remainingPct(loaded.remainingG, loaded.initialG) : 0;
	const meters = loaded ? metersFromGrams(loaded.remainingG, loaded.material) : 0;
	const low = loaded ? loaded.remainingG <= loaded.lowG : false;
	const enoughForJob = printing && loaded ? loaded.remainingG >= printing.slicerG : true;
	const listening = printer.state === "running" || printer.state === "prepare" || printer.state === "paused";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-start",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-card p-5 sm:p-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-widest text-subtle uppercase",
								children: "External holder"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 text-2xl font-semibold tracking-tight sm:text-3xl",
								children: loaded ? `${loaded.colorName}` : "Nothing loaded"
							}),
							loaded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									loaded.brand,
									" ",
									loaded.material
								]
							})
						] }), printing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "print",
							children: "printing"
						}) : loaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "ok",
							children: "idle"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "empty holder" })]
					}),
					loaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpoolReel, {
							color: loaded.colorHex,
							remaining: loaded.remainingG,
							initial: loaded.initialG,
							size: 200
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full text-center sm:text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-6xl leading-none font-medium tracking-tight tabular-nums sm:text-7xl",
									suppressHydrationWarning: true,
									children: loaded.remainingG
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-muted",
									children: [
										"grams remaining · ",
										meters.toFixed(1),
										" m"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 h-1.5 overflow-hidden rounded-full bg-elevated",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full",
										style: {
											width: `${pct}%`,
											backgroundColor: low ? "var(--color-warn)" : loaded.colorHex
										}
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs text-subtle",
									children: [
										"Last scale check ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											suppressHydrationWarning: true,
											children: relativeTime(loaded.lastWeighedAt)
										}),
										" · empty spool ",
										loaded.emptySpoolG,
										" g"
									]
								}),
								low && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 flex items-center justify-center gap-2 text-sm text-warn sm:justify-start",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
										"Below ",
										loaded.lowG,
										" g — weigh before a long print"
									]
								})
							]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 rounded-xl border border-dashed border-line px-5 py-10 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: "Load a spool from inventory onto the A1 holder."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/spools",
								children: "Open spools"
							})
						})]
					}),
					loaded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "lg",
								className: "col-span-2 sm:col-span-2",
								disabled: !loaded || !!printing,
								onClick: () => setStartOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), listening ? "Manual job" : "Start print"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "lg",
								variant: "outline",
								onClick: () => setWeighOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "size-4" }), "Weigh"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "lg",
								variant: "ghost",
								disabled: unload.isPending || !!printing,
								onClick: () => unload.mutate(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unplug, { className: "size-4" }), "Unload"]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrinterPanel, {
						printer,
						onOpenLink: () => window.dispatchEvent(new Event("spooldeck:open-link"))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-xl border border-line bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-widest text-subtle uppercase",
							children: "Current job"
						}), printing && loaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xl font-semibold",
									children: printing.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted",
									children: [
										"Studio ",
										formatGrams(printing.slicerG),
										" · ",
										printing.source === "a1" ? "from A1" : "manual",
										" ·",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											suppressHydrationWarning: true,
											children: relativeTime(printing.startedAt)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 h-2 overflow-hidden rounded-full bg-elevated",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-primary transition-[width] duration-500",
										style: { width: `${Math.max(4, printing.progress)}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 font-mono text-sm tabular-nums text-muted",
									suppressHydrationWarning: true,
									children: [
										printing.progress,
										"% · ",
										enoughForJob ? "enough filament" : "not enough filament"
									]
								}),
								!enoughForJob && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 flex items-center gap-2 text-sm text-danger",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }),
										"Slicer needs ",
										printing.slicerG,
										" g, holder has ",
										loaded.remainingG,
										" g"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-subtle",
									children: "Finish is automatic when the A1 reports done. Override below if you stopped it by hand."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "lg",
										variant: "outline",
										onClick: () => setFinishMode("finish"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), "Force finish"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "lg",
										variant: "ghost",
										onClick: () => setFinishMode("fail"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }), "Failed"]
									})]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Listening for a job from Bambu Studio. Send a print to the A1 — or fire the demo below."
							}), printer.source === "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: DEMO_JOBS.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "subtle",
									disabled: sendDemo.isPending || !loaded,
									onClick: () => sendDemo.mutate(job),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }),
										job.title,
										" · ",
										job.slicerG,
										" g"
									]
								}, job.title))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-xl border border-line bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-widest text-subtle uppercase",
									children: "Workshop"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/jobs",
									className: "text-xs text-muted hover:text-fg",
									children: "All jobs"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-4 grid grid-cols-3 gap-3 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-subtle",
										children: "Used 7d"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
										className: "mt-1 font-mono text-lg tabular-nums",
										suppressHydrationWarning: true,
										children: [data.used7d, " g"]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-subtle",
										children: "Spools"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 font-mono text-lg tabular-nums",
										suppressHydrationWarning: true,
										children: data.spoolCount
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-subtle",
										children: "On hand"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
										className: "mt-1 font-mono text-lg tabular-nums",
										suppressHydrationWarning: true,
										children: [data.remainingTotal, " g"]
									})] })
								]
							}),
							data.lowSpools.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 space-y-2 border-t border-line pt-3",
								children: data.lowSpools.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-warn",
										children: [
											s.colorName,
											" · ",
											s.material
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono tabular-nums text-muted",
										children: [s.remainingG, " g"]
									})]
								}, s.id))
							}),
							data.recentJobs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 space-y-2 border-t border-line pt-3",
								children: data.recentJobs.slice(0, 5).map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between gap-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-muted",
										children: job.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "shrink-0 font-mono tabular-nums text-subtle",
										children: job.status === "printing" ? `${job.progress}%` : job.deductedG ? `−${job.deductedG} g` : job.status
									})]
								}, job.id))
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartJobDialog, {
				open: startOpen,
				onOpenChange: setStartOpen,
				remainingG: loaded?.remainingG ?? 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinishJobDialog, {
				open: finishMode !== null,
				onOpenChange: (v) => {
					if (!v) setFinishMode(null);
				},
				job: printing,
				mode: finishMode ?? "finish"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeighSpoolDialog, {
				open: weighOpen,
				onOpenChange: setWeighOpen,
				spool: loaded
			})
		]
	});
}
//#endregion
export { Deck as component };
