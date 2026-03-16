import { NextRequest, NextResponse } from "next/server";
import { computePiDigits, searchPiDigits } from "@/lib/piCompute";
import { searchPiViaApi } from "@/lib/piSearch";

const piString = computePiDigits(2_000_000);

function get8DigitPatterns(dob: string) {
  const date = new Date(dob + "T00:00:00");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());
  return [
    { pattern: `${month}${day}${year}`, format: "MMDDYYYY" },
    { pattern: `${day}${month}${year}`, format: "DDMMYYYY" },
    { pattern: `${year}${month}${day}`, format: "YYYYMMDD" },
  ];
}

export async function GET(request: NextRequest) {
  const dob = request.nextUrl.searchParams.get("dob");
  if (!dob) return NextResponse.json({ error: "dob required" }, { status: 400 });

  const date = new Date(dob + "T00:00:00");
  if (isNaN(date.getTime()) || date > new Date()) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  // Step 1: local 2M digit search (instant)
  let result = searchPiDigits(piString, dob);

  // Step 2: if no 8-digit match locally, extend search via API
  const has8Digit = result.bestMatch && result.bestMatch.pattern.length >= 8;
  if (!has8Digit) {
    try {
      const deadline = Date.now() + 7500;
      const { match, searchedTo } = await searchPiViaApi(
        get8DigitPatterns(dob),
        2_000_000,
        deadline
      );

      if (match) {
        result = {
          ...result,
          bestMatch: { format: match.format, pattern: match.pattern, position: match.position, found: true },
          searchedDigits: searchedTo,
          piContext: match.piContext,
          contextDigits: match.contextDigits,
          contextStart: match.contextStart,
          results: result.results.map((r) =>
            r.format === match.format ? { ...r, position: match.position, found: true } : r
          ),
        };
      } else {
        result = { ...result, searchedDigits: searchedTo };
      }
    } catch {
      // API unavailable — return local result as-is
    }
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
