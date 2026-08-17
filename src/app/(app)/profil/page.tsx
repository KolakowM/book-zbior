import Link from "next/link";
import type { CSSProperties } from "react";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProfileEditor from "@/components/ProfileEditor";

export const dynamic = "force-dynamic";

const INK = "#17251F";
const GREEN = "#153A2C";
const BONE2 = "#F3EFE4";
const MUTED = "#5A5B50";
const LINE = "#DAD4C2";
const OCHRE = "#C0871B";

export default async function ProfilPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, city, bio")
    .eq("id", user!.id)
    .maybeSingle();

  const p = profile as any;
  const initials = (p?.display_name || p?.username || "?").slice(0, 2).toUpperCase();

  const [{ count: books }, { count: read }, { count: reviews }, { count: followers }, { count: following }] = await Promise.all([
    supabase.from("user_library").select("*", { count: "exact", head: true }),
    supabase.from("user_library").select("*", { count: "exact", head: true }).eq("reading_status", "read"),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user!.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user!.id),
  ]);

  return (
    <div style={wrap}>
      <div style={hero}>
        <div style={avatar}>{initials}</div>
        <h1 style={name}>{p?.display_name || p?.username}</h1>
        <p style={handle}>@{p?.username}{p?.city ? ` · ${p.city}` : ""}</p>
        {p?.bio && <p style={bio}>{p.bio}</p>}
        <ProfileEditor initial={{ display_name: p?.display_name || "", city: p?.city || "", bio: p?.bio || "" }} />
        {p?.username && (
          <Link href={`/u/${p.username}`} style={publicLink}>
            <ExternalLink size={14} /> Zobacz swój profil publiczny
          </Link>
        )}
      </div>

      <div style={statsRow}>
        <Stat n={books ?? 0} l="na półce" />
        <Stat n={read ?? 0} l="przeczytane" />
        <Stat n={reviews ?? 0} l="recenzje" />
        <Stat n={followers ?? 0} l="obserwujący" />
        <Stat n={following ?? 0} l="obserwowani" />
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div style={stat}>
      <div style={statN}>{n}</div>
      <div style={statL}>{l}</div>
    </div>
  );
}

const wrap: CSSProperties = { maxWidth: 720, margin: "0 auto", padding: "40px 20px 120px" };
const hero: CSSProperties = { textAlign: "center" };
const avatar: CSSProperties = { width: 84, height: 84, borderRadius: "50%", background: GREEN, color: "#fff", fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, display: "grid", placeItems: "center", margin: "0 auto 16px" };
const name: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, color: INK, margin: 0 };
const handle: CSSProperties = { fontSize: 14, color: MUTED, marginTop: 5 };
const bio: CSSProperties = { fontSize: 15, color: "#3A4A42", margin: "14px auto 0", maxWidth: 440, lineHeight: 1.55 };
const publicLink: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, fontSize: 14, fontWeight: 600, color: OCHRE, textDecoration: "none" };
const statsRow: CSSProperties = { display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 28, marginTop: 34, padding: "22px 16px", background: BONE2, border: "1px solid " + LINE, borderRadius: 16 };
const stat: CSSProperties = { textAlign: "center" };
const statN: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: INK };
const statL: CSSProperties = { fontSize: 12, color: MUTED, marginTop: 3 };
