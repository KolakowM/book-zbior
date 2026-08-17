"use client";

import { useState } from "react";
import Link from "next/link";
import { Repeat, Check } from "lucide-react";
import { proposeExchange } from "@/lib/actions/exchange";

export default function ProposeExchangeButton({ listingId, isLoggedIn }: { listingId: string; isLoggedIn: boolean }) {
  const [state, setState] = useState<"idle" | "busy" | "sent" | "already">("idle");

  if (!isLoggedIn) return <Link href="/login" style={btn}>Zaloguj się</Link>;

  const send = async () => {
    setState("busy");
    try {
      const r = await proposeExchange(listingId);
      setState(r.already ? "already" : "sent");
    } catch {
      setState("idle");
      alert("Nie udało się wysłać propozycji.");
    }
  };

  if (state === "sent") return <span style={{ ...btn, background: "#2E6B4F", cursor: "default" }}><Check size={15} /> Wysłano</span>;
  if (state === "already") return <span style={{ ...btn, background: "#5A5B50", cursor: "default" }}><Check size={15} /> Już wysłana</span>;

  return (
    <button onClick={send} disabled={state === "busy"} style={{ ...btn, border: "none", cursor: "pointer", opacity: state === "busy" ? 0.6 : 1 }}>
      <Repeat size={15} /> {state === "busy" ? "…" : "Zaproponuj wymianę"}
    </button>
  );
}

const btn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, background: "#B0472A", color: "#fff", fontSize: 13.5, fontWeight: 600, padding: "9px 14px", borderRadius: 8, textDecoration: "none" };
