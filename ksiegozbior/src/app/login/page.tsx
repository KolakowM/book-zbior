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
        // Profil zakłada trigger w bazie (supabase/02_profile_trigger.sql).
        setMsg(
          "Konto utworzone. Jeśli włączone jest potwierdzanie e-maila, sprawdź skrzynkę. W innym wypadku możesz się zalogować."
        );
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
        <div style={eyebrow}>KSIĘGOZBIÓR</div>
        <h1 style={h1}>{mode === "login" ? "Zaloguj się" : "Załóż konto"}</h1>

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

const wrap: React.CSSProperties = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#1E2233", padding: 20 };
const card: React.CSSProperties = { width: "100%", maxWidth: 380, background: "#F2ECDD", borderRadius: 20, padding: "28px 24px" };
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: 2.5, color: "#B4632A", fontWeight: 600 };
const h1: React.CSSProperties = { fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, margin: "4px 0 20px", color: "#1E2233" };
const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#5A5240", margin: "0 0 6px" };
const field: React.CSSProperties = { width: "100%", border: "1px solid #D3C9B4", background: "#FAF6EC", borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 14, outline: "none", color: "#1E2233" };
const message: React.CSSProperties = { fontSize: 13, color: "#7A5B00", background: "#FBF3DA", border: "1px solid #E9D9A6", borderRadius: 8, padding: 10, margin: "0 0 14px" };
const primary: React.CSSProperties = { width: "100%", background: "#B4632A", color: "#fff", border: "none", padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" };
const switchBtn: React.CSSProperties = { width: "100%", background: "none", border: "none", color: "#5A5240", fontSize: 13, marginTop: 14, cursor: "pointer" };
