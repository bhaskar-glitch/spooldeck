const DENSITY: Record<string, number> = {
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
  PC: 1.2,
};

const DIAMETER_MM = 1.75;

export function gramsPerMeter(material: string) {
  const key = Object.keys(DENSITY).find(
    (k) => k.toLowerCase() === material.toLowerCase(),
  );
  const density = key ? DENSITY[key] : 1.24;
  const rCm = DIAMETER_MM / 2 / 10;
  const cm3PerM = Math.PI * rCm * rCm * 100;
  return cm3PerM * density;
}

export function metersFromGrams(grams: number, material: string) {
  return grams / gramsPerMeter(material);
}

export function remainingPct(remaining: number, initial: number) {
  if (initial <= 0) return 0;
  return Math.max(0, Math.min(100, (remaining / initial) * 100));
}

export function parseSlicerUsage(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const asNumber = Number(trimmed.replace(",", "."));
  if (Number.isFinite(asNumber) && asNumber > 0) return Math.round(asNumber);

  const labeled = [
    ...trimmed.matchAll(
      /(?:filament(?:\s+used)?|model|weight|usage)[^\d]{0,16}(\d+(?:[.,]\d+)?)\s*g/gi,
    ),
  ];
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

export function printsRemaining(remainingG: number, jobG: number) {
  if (jobG <= 0) return 0;
  return Math.floor(remainingG / jobG);
}
