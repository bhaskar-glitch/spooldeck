import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay$1, c as Slot, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, n as literal, o as union, r as number, t as _enum } from "../_libs/zod.mjs";
import { a as TriangleAlert, h as History, l as Printer, m as Layers, t as X, y as BookOpen } from "../_libs/lucide-react.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-CX7pxyb-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function isLightHex(hex) {
	const c = hex.replace("#", "");
	if (c.length < 6) return false;
	const r = parseInt(c.slice(0, 2), 16);
	const g = parseInt(c.slice(2, 4), 16);
	const b = parseInt(c.slice(4, 6), 16);
	return .2126 * r + .7152 * g + .0722 * b > 168;
}
function formatGrams(g) {
	return `${Math.round(g).toLocaleString()} g`;
}
function relativeTime(iso) {
	if (!iso) return "never";
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return "never";
	const delta = Date.now() - then;
	const min = Math.round(delta / 6e4);
	if (min < 1) return "just now";
	if (min < 60) return `${min}m ago`;
	const hr = Math.round(min / 60);
	if (hr < 24) return `${hr}h ago`;
	const day = Math.round(hr / 24);
	if (day < 14) return `${day}d ago`;
	return new Date(iso).toLocaleDateString();
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[opacity,transform,background-color] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:opacity-90",
			outline: "border border-line bg-transparent text-fg hover:bg-elevated",
			ghost: "text-fg hover:bg-elevated",
			danger: "bg-danger text-fg hover:opacity-90",
			subtle: "bg-elevated text-fg hover:bg-line"
		},
		size: {
			default: "h-11 px-4 text-sm",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5 text-base",
			xl: "h-14 px-6 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-bg/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed inset-x-3 top-auto bottom-3 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 flex size-11 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 pr-10", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-xl font-semibold tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("mt-1 text-sm text-muted", className),
		...props
	});
}
var queryClient = new QueryClient({ defaultOptions: { queries: {
	staleTime: 4e3,
	refetchOnWindowFocus: true
} } });
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getDashboard = createServerFn({ method: "GET" }).handler(createSsrRpc("e57397ab9b580d551e45a204bb51a638c619efe4ae28e910ee5b42763a8c3cf8"));
var listSpools = createServerFn({ method: "GET" }).handler(createSsrRpc("e663737e7a3b04ffc09085b1f9a82f6d0d81837111b7a0f495ee0da00f6c5c0e"));
var getSpoolDetail = createServerFn({ method: "POST" }).validator(object({ id: number() })).handler(createSsrRpc("193c8ee1a66bbb7eb958fc7cfd6d09b0a1e4e02ab5e24e59f4834fb589662f7c"));
var listJobs = createServerFn({ method: "GET" }).handler(createSsrRpc("8f723864edfaa598e1d9038a2739c6bb0de295ae545c9fe4c3a4777c4d5facae"));
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
})).handler(createSsrRpc("8752685ca0d0e7eaeb2497c6abcddce40ec6b043a75cd3d5bf48f54953d9d4c5"));
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
})).handler(createSsrRpc("c36c478b4ba476bcfca795d8b49a57a7d10f62f01429e35125c2b04e28da1a45"));
var deleteSpool = createServerFn({ method: "POST" }).validator(object({ id: number().int().positive() })).handler(createSsrRpc("7fdd2276636b035a013994eb5d1f6cfdbf8df41a0a8442b734682ea10a6eff0c"));
var loadSpool = createServerFn({ method: "POST" }).validator(object({ id: number() })).handler(createSsrRpc("23c9e5a6000855398bdfc030885dace3f8e32a425c3dcb155db01c96e2fbd2a3"));
var unloadSpool = createServerFn({ method: "POST" }).handler(createSsrRpc("fc3302f0f95f79d12110ad9f8e78be5fbd59be8730a05423a500e21ac23726f1"));
var startJob = createServerFn({ method: "POST" }).validator(object({
	title: string().min(1).max(120),
	slicerG: number().int().min(1).max(5e3)
})).handler(createSsrRpc("5584368dad75ec2093b2b475af544c3f4dbf5ceae29fb66b469b0606ae4a820b"));
var finishJob = createServerFn({ method: "POST" }).validator(object({
	id: number(),
	actualG: number().int().min(0).max(5e3).nullable()
})).handler(createSsrRpc("c3a59bff8adf2452f04a20d5365ff00c9d9644e90cc54fa17f3d397995b498ca"));
var failJob = createServerFn({ method: "POST" }).validator(object({
	id: number(),
	progress: number().int().min(0).max(100),
	actualG: number().int().min(0).max(5e3).nullable()
})).handler(createSsrRpc("947d70bb4660010731724fba4faf2c73d209afd66c3f225dff175cb2c5d7b4e5"));
var weighSpool = createServerFn({ method: "POST" }).validator(object({
	id: number(),
	scaleG: number().int().min(0).max(8e3)
})).handler(createSsrRpc("651ffe47a7c5a8ccf1c5ecbcba9412509eae2f0647d41631276156c9334af0af"));
var weighPrint = createServerFn({ method: "POST" }).validator(object({
	jobId: number(),
	actualG: number().int().min(0).max(5e3)
})).handler(createSsrRpc("17343cf3d275fdc1ab8170e04df300d9f97cd2acc0c61753a9355f7200d5a43d"));
var syncA1 = createServerFn({ method: "POST" }).validator(object({
	token: string().max(4e3).optional(),
	region: _enum(["global", "cn"]).optional()
})).handler(createSsrRpc("ae39d2bac0fa6e4bdfdc685bbeeb9f6ff0ff2bae0d5cf62de78ef71b7fa60346"));
var demoSendPrint = createServerFn({ method: "POST" }).validator(object({
	title: string().min(1).max(120),
	slicerG: number().int().min(1).max(5e3)
})).handler(createSsrRpc("e1201d1a50df5bf768127ae58e43714b30c915f3943b72858b75ddfcace815f6"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-B_mUKbDm.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-12 w-full rounded-md border border-line bg-elevated px-3 text-base text-fg placeholder:text-subtle", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70", "disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full rounded-md border border-line bg-elevated px-3 py-2 text-base text-fg placeholder:text-subtle", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-muted", className),
		...props
	});
}
var TOKEN_KEY = "spooldeck.bambuToken";
var REGION_KEY = "spooldeck.bambuRegion";
function LinkDialog({ open, onOpenChange }) {
	const [token, setToken] = (0, import_react.useState)("");
	const [region, setRegion] = (0, import_react.useState)("global");
	(0, import_react.useEffect)(() => {
		if (!open || typeof window === "undefined") return;
		setToken(window.localStorage.getItem("spooldeck.bambuToken") ?? "");
		const stored = window.localStorage.getItem(REGION_KEY);
		if (stored === "cn" || stored === "global") setRegion(stored);
	}, [open]);
	function save() {
		const trimmed = token.trim();
		if (trimmed) {
			window.localStorage.setItem(TOKEN_KEY, trimmed);
			window.localStorage.setItem(REGION_KEY, region);
			toast.success("A1 will sync from Bambu Cloud while this tablet is open");
		} else {
			window.localStorage.removeItem(TOKEN_KEY);
			toast.success("Using the live A1 demo on this tablet");
		}
		window.dispatchEvent(new Event("spooldeck:creds-changed"));
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Connect the A1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "The A1 never reports remaining grams. It does report print start, progress, finish, and Studio weight. SpoolDeck listens and books filament on the loaded spool." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mb-4 space-y-2 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "1. Load the roll that is physically on the holder." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "2. Send a print from Bambu Studio as usual." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3. Leave this page open on the tablet — finish deducts automatically." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "4. Weigh the part or spool only if you want the ledger exact." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Region" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: ["global", "cn"].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setRegion(r),
								className: cn("h-11 flex-1 rounded-md border text-sm", region === r ? "border-primary bg-primary text-primary-fg" : "border-line text-muted"),
								children: r === "global" ? "Global" : "China"
							}, r))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "token",
								children: "Bambu access token (optional)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "token",
								type: "password",
								autoComplete: "off",
								value: token,
								onChange: (e) => setToken(e.target.value),
								placeholder: "Leave empty for the live demo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: "Stored only on this tablet, never in the workshop database. Paste the account token Bambu Handy / Studio uses. LAN access code on the printer is MQTT-only and cannot be reached from a hosted page — Cloud is the path that works with a spare tablet."
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5 w-full",
					size: "lg",
					onClick: save,
					children: token.trim() ? "Listen to my A1" : "Keep live demo"
				})
			]
		})
	});
}
var NAV = [
	{
		to: "/",
		label: "Deck",
		icon: Printer
	},
	{
		to: "/spools",
		label: "Spools",
		icon: Layers
	},
	{
		to: "/jobs",
		label: "Jobs",
		icon: History
	},
	{
		to: "/guide",
		label: "Guide",
		icon: BookOpen
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [linkOpen, setLinkOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const open = () => setLinkOpen(true);
		window.addEventListener("spooldeck:open-link", open);
		return () => window.removeEventListener("spooldeck:open-link", open);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/92 px-4 py-3 backdrop-blur-sm sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-lg font-semibold tracking-tight",
						children: "SpoolDeck"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden text-xs tracking-wide text-subtle sm:inline",
						children: "A1 · external holder"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setLinkOpen(true),
					className: "rounded-full border border-line px-2.5 py-1 font-mono text-xs text-muted hover:text-fg",
					children: "Bambu Lab A1"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pt-7",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mx-auto grid max-w-6xl grid-cols-4",
					children: NAV.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium", active ? "text-fg" : "text-subtle hover:text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								strokeWidth: active ? 2.2 : 1.8
							}), item.label]
						}) }, item.to);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkDialog, {
				open: linkOpen,
				onOpenChange: setLinkOpen
			})
		]
	});
}
var styles_default = "/assets/styles-CkbkXEbU.css";
var APP_NAME = "SpoolDeck";
var Route$5 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Tablet filament tracker for Bambu Lab A1 — auto-deduct slicer grams, optional scale for precision."
			},
			{
				name: "theme-color",
				content: "#0c0c0d"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
				client: queryClient,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
					theme: "dark",
					position: "top-center",
					toastOptions: { classNames: { toast: "bg-elevated text-fg border-line" } }
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$4 = () => import("./routes-5O7lLYna.mjs");
var Route$4 = createFileRoute("/")({
	loader: () => getDashboard(),
	staleTime: 3e4,
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./guide-CZFCZCxd.mjs");
var Route$3 = createFileRoute("/guide")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./jobs-C0sAZj0K.mjs");
var Route$2 = createFileRoute("/jobs")({
	loader: () => listJobs(),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./spools-DC5HPWB8.mjs");
var Route$1 = createFileRoute("/spools")({
	loader: () => listSpools(),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./spools_._id-GpoEUgBe.mjs");
var Route = createFileRoute("/spools_/$id")({
	loader: ({ params }) => getSpoolDetail({ data: { id: Number(params.id) } }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	GuideRoute: Route$3.update({
		id: "/guide",
		path: "/guide",
		getParentRoute: () => Route$5
	}),
	JobsRoute: Route$2.update({
		id: "/jobs",
		path: "/jobs",
		getParentRoute: () => Route$5
	}),
	SpoolsRoute: Route$1.update({
		id: "/spools",
		path: "/spools",
		getParentRoute: () => Route$5
	}),
	SpoolsIdRoute: Route.update({
		id: "/spools_/$id",
		path: "/spools/$id",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { relativeTime as A, getDashboard as C, listSpools as D, listJobs as E, weighPrint as F, weighSpool as I, syncA1 as M, unloadSpool as N, loadSpool as O, updateSpool as P, formatGrams as S, isLightHex as T, createSpool as _, Route$4 as a, failJob as b, Label as c, Dialog as d, DialogContent as f, cn as g, DialogTitle as h, Route$2 as i, startJob as j, queryClient as k, Input as l, DialogHeader as m, Route as n, REGION_KEY as o, DialogDescription as p, Route$1 as r, Button as s, router_exports as t, Textarea as u, deleteSpool as v, getSpoolDetail as w, finishJob as x, demoSendPrint as y };
