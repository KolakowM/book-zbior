import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeftRight, Inbox, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProposalActions from "@/components/ProposalActions";

export const dynamic = "force-dynamic";

const INK = "#17251F";
const BONE2 = "#F3EFE4";
const MUTED = "#5A5B50";
const LINE = "#DAD4C2";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Oczekuje", color: "#7A5B00", bg: "#F3E7C8" },
  accepted: { label: "Zaakceptowana", color: "#1D4A38", bg: "#D8E8DF" },
  rejected: { label: "Odrzucona", color: "#7A2F16", bg: "#F0E2DC" },
  cancelled: { label: "Anulowana", color: "#5A5B50", bg: "#E6E1D3" },
  completed: { label: "Zakończona", color: "#1D4A38", bg: "#D8E8DF" },
};

function Badge({ status }: { status: string }) {
  const s = STATUS[status] || STATUS.pending;
  return <span style={{ fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, padding: "4px 10px", borderRadius: 999 }}>{s.label}</span>;
}

export default async function WymianyPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Moje oferty → ich propozycje (otrzymane)
  const { data: myListings } = await supabase.from("listings").select("id").eq("user_id", user!.id);
  const myIds = (myListings ?? []).map((l: any) => l.id);

  let received: any[] = [];
  if (myIds.length) {
    const { data } = await supabase
      .from("exchange_proposals")
      .select("id, status, created_at, requester:profiles(username, display_name), listing:listings(book:book_catalog(title, author))")
      .in("listing_id", myIds)
      .order("created_at", { ascending: false });
    received = data ?? [];
  }

  const { data: sentData } = await supabase
    .from("exchange_proposals")
    .select("id, status, created_at, listing:listings(book:book_catalog(title, author), owner:profiles(username, display_name))")
    .eq("requester_id", user!.id)
    .order("created_at", { ascending: false });
  const sent = sentData ?? [];

  return (
    <div style={wrap}>
      <div style={head}>
        <div style={titleRow}><ArrowLeftRight size={26} color="#B0472A" /><h1 style={title}>Wymiany</h1></div>
        <p style={sub}>Propozycje wymiany — te, które dostałeś, i te, które wysłałeś.</p>
      </div>

      <section>
        <h2 style={secH}><Inbox size={18} /> Otrzymane</h2>
        {received.length === 0 ? (
          <p style={emptyText}>Nikt jeszcze nie zaproponował wymiany na Twoje książki.</p>
        ) : (
          <div style={list}>
            {received.map((p: any) => (
              <div key={p.id} style={row}>
                <div style={{ flex: 1 }}>
                  <div style={bookTitle}>{p.listing?.book?.title || "—"}</div>
                  <div style={bookMeta}>{p.listing?.book?.author}</div>
                  <div style={fromText}>
                    od {p.requester ? <Link href={`/u/${p.requester.username}`} style={userLink}>@{p.requester.username}</Link> : "—"}
                  </div>
                </div>
                <div style={rightCol}>
                  <Badge status={p.status} />
                  {p.status === "pending" && <ProposalActions id={p.id} kind="received" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 40 }}>
        <h2 style={secH}><Send size={18} /> Wysłane</h2>
        {sent.length === 0 ? (
          <p style={emptyText}>Nie wysłałeś jeszcze żadnej propozycji. Zajrzyj na <Link href="/gielda" style={userLink}>giełdę</Link>.</p>
        ) : (
          <div style={list}>
            {sent.map((p: any) => (
              <div key={p.id} style={row}>
                <div style={{ flex: 1 }}>
                  <div style={bookTitle}>{p.listing?.book?.title || "—"}</div>
                  <div style={bookMeta}>{p.listing?.book?.author}</div>
                  <div style={fromText}>
                    do {p.listing?.owner ? <Link href={`/u/${p.listing.owner.username}`} style={userLink}>@{p.listing.owner.username}</Link> : "—"}
                  </div>
                </div>
                <div style={rightCol}>
                  <Badge status={p.status} />
                  {p.status === "pending" && <ProposalActions id={p.id} kind="sent" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const wrap: CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "40px 20px 120px" };
const head: CSSProperties = { marginBottom: 26 };
const titleRow: CSSProperties = { display: "flex", alignItems: "center", gap: 12 };
const title: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, color: INK, margin: 0 };
const sub: CSSProperties = { fontSize: 16, color: MUTED, marginTop: 10 };
const secH: CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: INK, margin: "0 0 16px" };
const list: CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const row: CSSProperties = { display: "flex", alignItems: "center", gap: 16, background: BONE2, border: "1px solid " + LINE, borderRadius: 14, padding: 16 };
const bookTitle: CSSProperties = { fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: INK };
const bookMeta: CSSProperties = { fontSize: 13, color: MUTED, marginTop: 2 };
const fromText: CSSProperties = { fontSize: 13, color: MUTED, marginTop: 6 };
const userLink: CSSProperties = { color: "#B0472A", fontWeight: 600, textDecoration: "none" };
const rightCol: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 };
const emptyText: CSSProperties = { fontSize: 15, color: MUTED };
