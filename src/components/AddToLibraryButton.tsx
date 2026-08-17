"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { addExistingToLibrary } from "@/lib/actions/library";

export default function AddToLibraryButton({ bookId, isLoggedIn }: { bookId: string; isLoggedIn: boolean }) {
  const [state, setState] = useState<"idle" | "busy" | "added" | "already">("idle");

  if (!isLoggedIn) {
    return <Link href="/login" style={btn}>Zaloguj się, aby dodać</Link>;
  }

  const add = async () => {
    setState("busy");
    try {
      const r = await addExistingToLibrary(bookId);
      setState(r.already ? "already" : "added");
    } catch {
      setState("idle");
      alert("Nie udało się dodać książki.");
    }
  };

  if (state === "added") return <span style={{ ...btn, background: "#2E6B4F" }}><Check size={16} /> Dodano do biblioteki</span>;
  if (state === "already") return <span style={{ ...btn, background: "#5A5B50" }}><Check size={16} /> Masz już tę książkę</span>;

  return (
    <button onClick={add} disabled={state === "busy"} style={{ ...btn, opacity: state === "busy" ? 0.6 : 1, border: "none", cursor: "pointer" }}>
      <Plus size={16} /> {state === "busy" ? "…" : "Dodaj do mojej biblioteki"}
    </button>
  );
}

const btn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8, background: "#B0472A", color: "#fff",
  fontSize: 15, fontWeight: 600, padding: "12px 20px", borderRadius: 9, textDecoration: "none",
};
