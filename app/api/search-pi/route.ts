import { NextRequest, NextResponse } from "next/server";
import { computePiDigits, searchPiDigits } from "@/lib/piCompute";

const piString = computePiDigits(1_000_000);

export async function GET(request: NextRequest) {
  const dob = request.nextUrl.searchParams.get("dob");

  if (!dob) {
    return NextResponse.json({ error: "dob parameter required (YYYY-MM-DD)" }, { status: 400 });
  }

  const date = new Date(dob + "T00:00:00");
  if (isNaN(date.getTime()) || date > new Date()) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const result = searchPiDigits(piString, dob);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
