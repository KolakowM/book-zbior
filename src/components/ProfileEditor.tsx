"use client";

import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";

const INK = "#17251F";
const MUTED = "#5A5B50";
const LINE = "#DAD4C2";
const GREEN = "#153A2C";

export default function ProfileEditor({
  initial,
}: {
  initial: { display_name: string; city: string; bio: string };
}) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(initial.display_name);
  const [city, setCity] = useState(initial.city);
  const [bio, setBio] = useState(initial.bio);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile({
        display_name: displayName.trim() || null,
        city: city.trim() || null,
        bio: bio.trim() || null,
      });
      setEditing(false);
    } catch {
      alert("Nie udało się zapisać profilu.");
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <button style={editBtn} onClick={() => setEditing(true)}>
        <Pencil size={14} /> Edytuj profil
      </button>
    );
  }

  return (
    <div style={form}>
      <label style={label}>Nazwa wyświetlana</label>
      <input style={field} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="np. Maja Kowalczyk" />

      <label style={label}>Miasto</label>
      <input style={field} value={city} onChange={(e) => setCity(e.target.value)} placeholder="np. Kraków" />

      <label style={label}>O mnie</label>
      <textarea style={{ ...field, minHeight: 80, resize: "vertical" }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Kilka słów o Tobie i Twoich czytelniczych upodobaniach…" />

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button style={saveBtn} onClick={save} disabled={busy}><Check size={15} /> {busy ? "…" : "Zapisz"}</button>
        <button style={cancelBtn} onClick={() => setEditing(false)}>Anuluj</button>
      </div>
    </div>
  );
}

const editBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", border: "1px solid " + LINE, color: INK, padding: "9px 16px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const form: React.CSSProperties = { marginTop: 20, textAlign: "left", maxWidth: 420, marginLeft: "auto", marginRight: "auto", background: "#F3EFE4", border: "1px solid " + LINE, borderRadius: 14, padding: 18 };
const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: MUTED, margin: "0 0 6px" };
const field: React.CSSProperties = { width: "100%", border: "1px solid " + LINE, background: "#ECE7DA", borderRadius: 9, padding: 11, fontSize: 14, color: INK, marginBottom: 14, outline: "none", fontFamily: "var(--font-body)" };
const saveBtn: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, background: GREEN, color: "#fff", border: "none", padding: "11px 18px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const cancelBtn: React.CSSProperties = { background: "transparent", border: "1px solid " + LINE, color: MUTED, padding: "11px 18px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" };
