import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { computePiDigits, searchPiDigits } from "@/lib/piCompute";

const PI_DIGITS_COUNT = 50_000;

const getCachedPiDigits = unstable_cache(
  async () => {
    return computePiDigits(PI_DIGITS_COUNT);
  },
  ["pi-digits-50k"],
  { revalidate: false }
);

export async function GET(request: NextRequest) {
  const dob = request.nextUrl.searchParams.get("dob");

  if (!dob) {
    return NextResponse.json({ error: "dob parameter required (YYYY-MM-DD)" }, { status: 400 });
  }

  // Validate date
  const date = new Date(dob + "T00:00:00");
  if (isNaN(date.getTime()) || date > new Date()) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const piString = await getCachedPiDigits();
  const result = searchPiDigits(piString, dob);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
