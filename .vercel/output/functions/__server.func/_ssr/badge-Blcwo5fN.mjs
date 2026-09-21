import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { g as cn } from "./router-B_mUKbDm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-Blcwo5fN.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "neutral", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide", tone === "neutral" && "bg-elevated text-muted", tone === "ok" && "bg-ok/15 text-ok", tone === "warn" && "bg-warn/15 text-warn", tone === "danger" && "bg-danger/15 text-danger", tone === "print" && "bg-primary/12 text-primary", className),
		...props
	});
}
//#endregion
export { Badge as t };
