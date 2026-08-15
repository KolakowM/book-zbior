import type { ReadingStatus } from "./types";

export const STATUSES: Record<
  ReadingStatus,
  { label: string; spine: string; dot: string }
> = {
  reading:      { label: "W trakcie",       spine: "#B4632A", dot: "#B4632A" },
  read:         { label: "Przeczytana",     spine: "#2F5D50", dot: "#2F5D50" },
  want_to_read: { label: "Do przeczytania", spine: "#8A6D3B", dot: "#8A6D3B" },
  abandoned:    { label: "Porzucona",       spine: "#7A5A5A", dot: "#7A5A5A" },
};

export const STATUS_KEYS = Object.keys(STATUSES) as ReadingStatus[];

// Kolory okładek dla ręcznie dodanych książek bez grafiki.
export const COVER_COLORS = [
  "#3D4A6B", "#6B3A3A", "#4A5D3A", "#5C4A6B",
  "#2F5D50", "#7A4A2A", "#5A6470", "#8A6D3B",
];
