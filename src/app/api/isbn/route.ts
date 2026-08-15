import { NextResponse } from "next/server";
import { fetchBookByIsbn } from "@/lib/openlibrary";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn") ?? "";

  const book = await fetchBookByIsbn(isbn);
  if (!book) {
    return NextResponse.json({ found: false });
  }
  return NextResponse.json({ found: true, book });
}
