import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { T as isLightHex } from "./router-B_mUKbDm.mjs";
import { r as remainingPct } from "./math-CXpBxIaG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/spool-reel-C0RHVy7g.js
var import_jsx_runtime = require_jsx_runtime();
function SpoolReel({ color, remaining, initial, size = 220 }) {
	const pct = remainingPct(remaining, initial);
	const stroke = isLightHex(color) ? "rgba(12,12,13,0.35)" : "rgba(243,241,236,0.22)";
	const rOuter = 46;
	const rInner = 16;
	const rFil = 31;
	const circ = 2 * Math.PI * rFil;
	const dash = pct / 100 * circ;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 100 100",
		className: "drop-shadow-sm",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: rOuter,
				fill: "#1c1c1f",
				stroke: "#2a2a2e",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: "42",
				fill: "none",
				stroke: "#2a2a2e",
				strokeWidth: "6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: rFil,
				fill: "none",
				stroke: color,
				strokeWidth: "14",
				strokeLinecap: "butt",
				strokeDasharray: `${dash} ${circ}`,
				transform: "rotate(-90 50 50)",
				opacity: pct > 0 ? 1 : .15
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: "42",
				fill: "none",
				stroke,
				strokeWidth: "0.6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: rInner,
				fill: "#141416",
				stroke: "#2a2a2e",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: "6",
				fill: "#0c0c0d",
				stroke: "#d7dce4",
				strokeWidth: "1.1"
			}),
			[
				0,
				60,
				120,
				180,
				240,
				300
			].map((deg) => {
				const rad = (deg - 90) * Math.PI / 180;
				const x1 = 50 + Math.cos(rad) * 20;
				const y1 = 50 + Math.sin(rad) * 20;
				const x2 = 50 + Math.cos(rad) * 24;
				const y2 = 50 + Math.sin(rad) * 24;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1,
					y1,
					x2,
					y2,
					stroke: "#6a6965",
					strokeWidth: "1.2",
					strokeLinecap: "round"
				}, deg);
			})
		]
	});
}
//#endregion
export { SpoolReel as t };
