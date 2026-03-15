import { PI_1M } from "./pi-data";

export function computePiDigits(count: number): string {
  return PI_1M.slice(0, count);
}

export interface SearchResult {
  format: string;
  pattern: string;
  position: number | null;
  found: boolean;
}

export interface PiSearchResponse {
  results: SearchResult[];
  searchedDigits: number;
  bestMatch: SearchResult | null;
  piContext: string | null;
  contextDigits: string | null;  // raw Pi slice around match (no brackets)
  contextStart: number;          // global Pi position where contextDigits begins
}

export function searchPiDigits(
  piString: string,
  dob: string
): PiSearchResponse {
  const date = new Date(dob + "T00:00:00");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());
  const yearShort = year.slice(2);

  const formats = [
    { pattern: `${month}${day}`, format: "MMDD" },
    { pattern: `${day}${month}`, format: "DDMM" },
    { pattern: `${month}${day}${year}`, format: "MMDDYYYY" },
    { pattern: `${day}${month}${year}`, format: "DDMMYYYY" },
    { pattern: `${year}${month}${day}`, format: "YYYYMMDD" },
    { pattern: `${month}${day}${yearShort}`, format: "MMDDYY" },
  ];

  const results: SearchResult[] = formats.map(({ pattern, format }) => {
    const index = piString.indexOf(pattern);
    return {
      format,
      pattern,
      position: index !== -1 ? index : null,
      found: index !== -1,
    };
  });

  // Best match = earliest found position
  const found = results.filter((r) => r.found);
  found.sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
  const bestMatch = found.length > 0 ? found[0] : null;

  // Generate context around best match
  let piContext: string | null = null;
  let contextDigits: string | null = null;
  let contextStart = 0;

  if (bestMatch && bestMatch.position !== null) {
    const pos = bestMatch.position;
    const RADIUS = 120; // digits on each side for the animation approach window

    contextStart = Math.max(0, pos - RADIUS);
    const contextEnd = Math.min(piString.length, pos + bestMatch.pattern.length + RADIUS);

    // Raw slice for SDAZ animation
    contextDigits = piString.slice(contextStart, contextEnd);

    // Bracketed display string for static tape
    const before = piString.slice(contextStart, pos);
    const match = piString.slice(pos, pos + bestMatch.pattern.length);
    const after = piString.slice(pos + bestMatch.pattern.length, contextEnd);
    piContext = `...${before}[${match}]${after}...`;
  }

  return {
    results,
    searchedDigits: piString.length,
    bestMatch,
    piContext,
    contextDigits,
    contextStart,
  };
}
