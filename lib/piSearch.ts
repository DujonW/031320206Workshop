// api.pi.delivery: position 0 = first digit after the decimal ('1' in 3.14159...)
// Our piString has '3' at index 0, so: apiPosition = ourPosition - 1
const PI_API = "https://api.pi.delivery/v1/pi";
const CHUNK = 1000;
const CONCURRENCY = 100;
const API_OFFSET = 1;

async function fetchChunk(apiStart: number): Promise<string | null> {
  try {
    const res = await fetch(
      `${PI_API}?start=${apiStart}&numberOfDigits=${CHUNK}&radix=10`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json.content === "string" ? json.content : null;
  } catch {
    return null;
  }
}

export interface ApiMatch {
  format: string;
  pattern: string;
  position: number;
  piContext: string;
  contextDigits: string;
  contextStart: number;
}

export async function searchPiViaApi(
  patterns: { pattern: string; format: string }[],
  fromPos: number,
  deadlineMs: number
): Promise<{ match: ApiMatch | null; searchedTo: number }> {
  const overlap = Math.max(...patterns.map((p) => p.pattern.length)) - 1;
  let cursor = fromPos;
  let tail = "";

  while (Date.now() < deadlineMs) {
    const chunks = await Promise.all(
      Array.from({ length: CONCURRENCY }, (_, i) =>
        fetchChunk(cursor - API_OFFSET + i * CHUNK)
      )
    );

    // Stop at first failed chunk to maintain contiguous coverage
    const valid: string[] = [];
    for (const c of chunks) {
      if (c === null) break;
      valid.push(c);
    }
    if (valid.length === 0) break;

    const block = tail + valid.join("");

    for (const { pattern, format } of patterns) {
      const idx = block.indexOf(pattern);
      if (idx !== -1) {
        const position = cursor - tail.length + idx;
        const searchedTo = cursor + valid.join("").length;

        // Fetch surrounding context in parallel
        const RADIUS = 120;
        const ctxStart = Math.max(0, position - RADIUS);
        const ctxNeeded = position + pattern.length + RADIUS - ctxStart;
        const ctxChunkCount = Math.ceil(ctxNeeded / CHUNK) + 1;
        const ctxChunks = await Promise.all(
          Array.from({ length: ctxChunkCount }, (_, i) =>
            fetchChunk(ctxStart - API_OFFSET + i * CHUNK)
          )
        );
        const ctxRaw = ctxChunks.filter(Boolean).join("").slice(0, ctxNeeded);
        const relPos = position - ctxStart;
        const piContext = `...${ctxRaw.slice(0, relPos)}[${ctxRaw.slice(relPos, relPos + pattern.length)}]${ctxRaw.slice(relPos + pattern.length)}...`;

        return {
          match: { format, pattern, position, piContext, contextDigits: ctxRaw, contextStart: ctxStart },
          searchedTo,
        };
      }
    }

    tail = block.slice(-overlap);
    cursor += valid.length * CHUNK;
    if (valid.length < CONCURRENCY) break;
  }

  return { match: null, searchedTo: cursor };
}
