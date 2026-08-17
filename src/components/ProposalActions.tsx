"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { updateProposal } from "@/lib/actions/exchange";

export default function ProposalActions({ id, kind }: { id: string; kind: "received" | "sent" }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const act = async (status: "accepted" | "rejected" | "cancelled") => {
    setBusy(true);
    try {
      await updateProposal(id, status);
      setDone(status);
    } catch {
      alert("Nie udało się zaktualizować.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    const label = done === "accepted" ? "Zaakceptowano" : done === "rejected" ? "Odrzucono" : "Anulowano";
    return <span style={{ fontSize: 13, color: "#5A5B50", fontWeight: 600 }}>{label}</span>;
  }

  if (kind === "received") {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => act("accepted")} disabled={busy} style={accept}><Check size={14} /> Akceptuj</button>
        <button onClick={() => act("rejected")} disabled={busy} style={reject}><X size={14} /> Odrzuć</button>
      </div>
    );
  }
  return <button onClick={() => act("cancelled")} disabled={busy} style={reject}>Anuluj</button>;
}

const accept: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, background: "#2E6B4F", color: "#fff", border: "none", padding: "8px 13px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const reject: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", color: "#5A5B50", border: "1px solid #C7C0AC", padding: "8px 13px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" };
