import type { ReadingStatus } from "./types";

// Statusy w nowej palecie (rdza / zieleń / ochra / stonowany).
export const STATUSES: Record<
  ReadingStatus,
  { label: string; spine: string; dot: string }
> = {
  reading:      { label: "W trakcie",       spine: "#B0472A", dot: "#B0472A" },
  read:         { label: "Przeczytana",     spine: "#2E6B4F", dot: "#2E6B4F" },
  want_to_read: { label: "Do przeczytania", spine: "#C0871B", dot: "#C0871B" },
  abandoned:    { label: "Porzucona",       spine: "#7A7566", dot: "#7A7566" },
};

export const STATUS_KEYS = Object.keys(STATUSES) as ReadingStatus[];

// Kolory grzbietów dla ręcznie dodanych książek bez okładki.
export const COVER_COLORS = [
  "#153A2C", "#B0472A", "#2E6B4F", "#7A4A2A",
  "#3D4A6B", "#8A3050", "#5A6470", "#C0871B",
];
