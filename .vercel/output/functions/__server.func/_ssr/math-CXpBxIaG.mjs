//#region node_modules/.nitro/vite/services/ssr/assets/math-CXpBxIaG.js
var DENSITY = {
	PLA: 1.24,
	"PLA+": 1.24,
	"PLA Basic": 1.24,
	"PLA Matte": 1.32,
	PETG: 1.27,
	"PETG HF": 1.27,
	ABS: 1.04,
	ASA: 1.07,
	TPU: 1.21,
	PA: 1.14,
	PC: 1.2
};
var DIAMETER_MM = 1.75;
function gramsPerMeter(material) {
	const key = Object.keys(DENSITY).find((k) => k.toLowerCase() === material.toLowerCase());
	const density = key ? DENSITY[key] : 1.24;
	const rCm = DIAMETER_MM / 2 / 10;
	return Math.PI * rCm * rCm * 100 * density;
}
function metersFromGrams(grams, material) {
	return grams / gramsPerMeter(material);
}
function remainingPct(remaining, initial) {
	if (initial <= 0) return 0;
	return Math.max(0, Math.min(100, remaining / initial * 100));
}
function parseSlicerUsage(text) {
	const trimmed = text.trim();
	if (!trimmed) return null;
	const asNumber = Number(trimmed.replace(",", "."));
	if (Number.isFinite(asNumber) && asNumber > 0) return Math.round(asNumber);
	const labeled = [...trimmed.matchAll(/(?:filament(?:\s+used)?|model|weight|usage)[^\d]{0,16}(\d+(?:[.,]\d+)?)\s*g/gi)];
	if (labeled.length) {
		const last = labeled[labeled.length - 1][1].replace(",", ".");
		return Math.round(parseFloat(last));
	}
	const grams = [...trimmed.matchAll(/(\d+(?:[.,]\d+)?)\s*g(?:ram)?s?\b/gi)];
	if (grams.length) {
		const last = grams[grams.length - 1][1].replace(",", ".");
		return Math.round(parseFloat(last));
	}
	return null;
}
//#endregion
export { parseSlicerUsage as n, remainingPct as r, metersFromGrams as t };
