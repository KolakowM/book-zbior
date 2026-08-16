import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/components/AppNav";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Cała część aplikacji wymaga zalogowania.
  if (!user) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "#ECE7DA" }}>
      <AppNav />
      <main>{children}</main>
    </div>
  );
}
