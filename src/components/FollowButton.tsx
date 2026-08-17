"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, UserCheck } from "lucide-react";
import { followUser, unfollowUser } from "@/lib/actions/profile";

export default function FollowButton({
  targetId, initialFollowing, isLoggedIn,
}: {
  targetId: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  if (!isLoggedIn) {
    return <Link href="/login" style={btnPrimary}>Zaloguj się, aby obserwować</Link>;
  }

  const toggle = async () => {
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      if (next) await followUser(targetId);
      else await unfollowUser(targetId);
    } catch {
      setFollowing(!next);
    } finally {
      setBusy(false);
    }
  };

  return following ? (
    <button onClick={toggle} disabled={busy} style={btnGhost}>
      <UserCheck size={16} /> Obserwujesz
    </button>
  ) : (
    <button onClick={toggle} disabled={busy} style={btnPrimary}>
      <UserPlus size={16} /> Obserwuj
    </button>
  );
}

const btnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, background: "#B0472A", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none" };
const btnGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#17251F", border: "1px solid #C7C0AC", padding: "10px 20px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" };
