export type CatalogItem = {
  brand: string;
  material: string;
  colorName: string;
  colorHex: string;
  emptySpoolG: number;
  initialG: number;
  priceCentsPerKg: number;
};

export const CATALOG: CatalogItem[] = [
  { brand: "Bambu Lab", material: "PLA", colorName: "Jade White", colorHex: "#F4F1E8", emptySpoolG: 250, initialG: 1000, priceCentsPerKg: 2499 },
  { brand: "Bambu Lab", material: "PLA", colorName: "Black", colorHex: "#1A1A1A", emptySpoolG: 250, initialG: 1000, priceCentsPerKg: 2499 },
  { brand: "Bambu Lab", material: "PLA", colorName: "Red", colorHex: "#C12E1F", emptySpoolG: 250, initialG: 1000, priceCentsPerKg: 2499 },
  { brand: "Bambu Lab", material: "PLA", colorName: "Blue", colorHex: "#0A2A7A", emptySpoolG: 250, initialG: 1000, priceCentsPerKg: 2499 },
  { brand: "Bambu Lab", material: "PLA", colorName: "Orange", colorHex: "#E85D04", emptySpoolG: 250, initialG: 1000, priceCentsPerKg: 2499 },
  { brand: "Bambu Lab", material: "PLA", colorName: "Green", colorHex: "#1F8A4D", emptySpoolG: 250, initialG: 1000, priceCentsPerKg: 2499 },
  { brand: "Bambu Lab", material: "PLA", colorName: "Grey", colorHex: "#8E9089", emptySpoolG: 250, initialG: 1000, priceCentsPerKg: 2499 },
  { brand: "Bambu Lab", material: "PETG HF", colorName: "Black", colorHex: "#1A1A1A", emptySpoolG: 250, initialG: 1000, priceCentsPerKg: 2799 },
  { brand: "Bambu Lab", material: "PETG HF", colorName: "Forest Green", colorHex: "#1F6B4A", emptySpoolG: 250, initialG: 1000, priceCentsPerKg: 2799 },
  { brand: "Bambu Lab", material: "PETG HF", colorName: "Orange", colorHex: "#E85D04", emptySpoolG: 250, initialG: 1000, priceCentsPerKg: 2799 },
  { brand: "eSUN", material: "PLA+", colorName: "Grey", colorHex: "#8A8F98", emptySpoolG: 160, initialG: 1000, priceCentsPerKg: 1899 },
  { brand: "eSUN", material: "PLA+", colorName: "Black", colorHex: "#1A1A1A", emptySpoolG: 160, initialG: 1000, priceCentsPerKg: 1899 },
  { brand: "Polymaker", material: "PETG", colorName: "Cotton White", colorHex: "#F7F4EE", emptySpoolG: 180, initialG: 1000, priceCentsPerKg: 2299 },
  { brand: "Polymaker", material: "PLA", colorName: "PolyLite Black", colorHex: "#141414", emptySpoolG: 180, initialG: 1000, priceCentsPerKg: 2199 },
];

export const MATERIALS = ["PLA", "PLA+", "PETG", "PETG HF", "ABS", "ASA", "TPU", "PA", "PC"] as const;

export const EMPTY_SPOOL_PRESETS = [
  { label: "Bambu 1 kg", g: 250 },
  { label: "Plastic generic", g: 200 },
  { label: "Cardboard generic", g: 160 },
  { label: "Refill cardboard", g: 140 },
] as const;
