"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Konto utworzone. Jeśli włączone jest potwierdzanie e-maila, sprawdź skrzynkę. W innym wypadku możesz się zalogować.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/biblioteka");
        router.refresh();
      }
    } catch (e: any) {
      setMsg(e.message ?? "Coś poszło nie tak.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={h1}>{mode === "login" ? "Zaloguj się" : "Załóż konto"}</h1>
        <p style={sub}>Twój księgozbiór, recenzje i wymiana książek w jednym miejscu.</p>

        <label style={label}>E-mail</label>
        <input style={field} type="email" value={email}
               onChange={(e) => setEmail(e.target.value)} placeholder="ty@example.com" />

        <label style={label}>Hasło</label>
        <input style={field} type="password" value={password}
               onChange={(e) => setPassword(e.target.value)} placeholder="min. 6 znaków" />

        {msg && <p style={message}>{msg}</p>}

        <button style={{ ...primary, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={submit}>
          {busy ? "…" : mode === "login" ? "Zaloguj się" : "Utwórz konto"}
        </button>

        <button style={switchBtn}
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(null); }}>
          {mode === "login" ? "Nie masz konta? Zarejestruj się" : "Masz już konto? Zaloguj się"}
        </button>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#153A2C", padding: 20 };
const card: React.CSSProperties = { width: "100%", maxWidth: 390, background: "#ECE7DA", borderRadius: 18, padding: "30px 26px" };
const h1: React.CSSProperties = { fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, margin: "0 0 6px", color: "#17251F" };
const sub: React.CSSProperties = { fontSize: 14, color: "#5A5B50", margin: "0 0 22px", lineHeight: 1.5 };
const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#5A5B50", margin: "0 0 6px" };
const field: React.CSSProperties = { width: "100%", border: "1px solid #DAD4C2", background: "#F3EFE4", borderRadius: 9, padding: 12, fontSize: 15, marginBottom: 14, outline: "none", color: "#17251F" };
const message: React.CSSProperties = { fontSize: 13, color: "#7A2F16", background: "#F0E2DC", border: "1px solid #E3C7BC", borderRadius: 8, padding: 10, margin: "0 0 14px", lineHeight: 1.5 };
const primary: React.CSSProperties = { width: "100%", background: "#B0472A", color: "#fff", border: "none", padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" };
const switchBtn: React.CSSProperties = { width: "100%", background: "none", border: "none", color: "#5A5B50", fontSize: 13, marginTop: 14, cursor: "pointer" };
