import { NextResponse } from "next/server";
import { searchBooksByTitle } from "@/lib/nationallibrary";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchBooksByTitle(q);
  return NextResponse.json({ results });
}
