"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * Speed-Dependent Automatic Zooming (SDAZ) Pi Scanner
 *
 * A stream of Pi digits flows left-to-right past a fixed center cursor.
 * Phase 1 (fast): zoomed out — many small digits blur past, blue-tinted.
 * Phase 2 (approach): SDAZ kicks in — as speed drops, zoom increases
 *   (fewer, larger digits fill the screen), color shifts blue→gold.
 * Final: stream halts, matched digits glow in orange with a pulse.
 */

// First 300 digits of Pi — used as the repeating fast-scan visual backdrop
const PI_PREFIX =
  "31415926535897932384626433832795028841971693993751" +
  "05820974944592307816406286208998628034825342117067" +
  "98214808651328230664709384460955058223172535940812" +
  "84811174502841027019385211055596446229489549303819" +
  "64428810975665933446128475648233786783165271201909" +
  "14564856692346034861045432664821339360726024914127";

// Easing: covers 85% of distance in first 60% of time, decelerates for last 40%
function getProgress(t: number): number {
  const PIVOT = 0.6;
  if (t <= PIVOT) {
    return (t / PIVOT) * 0.85;
  }
  const tSlow = (t - PIVOT) / (1 - PIVOT);
  const eased = 1 - Math.pow(1 - tSlow, 3.5); // aggressive ease-out
  return 0.85 + eased * 0.15;
}

interface PiScanAnimationProps {
  targetPosition: number;
  pattern: string;
  format: string;
  contextDigits: string; // raw Pi digits slice around match
  contextStart: number;  // global Pi position where contextDigits begins
}

const CANVAS_W = 800;
const CANVAS_H = 180;
const ANIM_MS = 5800;

// Layout bounds
const MIN_FONT = 10;    // zoomed out (fast)
const MAX_FONT = 52;    // zoomed in (slow/found)

export default function PiScanAnimation({
  targetPosition,
  pattern,
  format,
  contextDigits,
  contextStart,
}: PiScanAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanLabel, setScanLabel] = useState("SCANNING");
  const [posDisplay, setPosDisplay] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // HiDPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const W = CANVAS_W;
    const H = CANVAS_H;
    const el = canvas; // stable non-null reference for closures

    function getDigit(globalPos: number): string {
      if (globalPos >= contextStart && globalPos < contextStart + contextDigits.length) {
        return contextDigits[globalPos - contextStart];
      }
      const idx = Math.abs(Math.round(globalPos));
      return PI_PREFIX[idx % PI_PREFIX.length];
    }

    const startTime = performance.now();
    let animId: number;

    function render(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / ANIM_MS, 1);
      const progress = getProgress(t);
      const currentPos = progress * targetPosition;

      // Speed factor: 1 = full speed, 0 = stopped
      const speedFactor =
        t <= 0.6
          ? 1
          : Math.pow(1 - (t - 0.6) / 0.4, 2.2);

      // SDAZ: zoom inversely proportional to speed
      const zoom = 1 - speedFactor;           // 0=zoomed-out, 1=zoomed-in
      const fontSize = MIN_FONT + (MAX_FONT - MIN_FONT) * zoom;
      const charW = fontSize * 0.62;

      // ─── clear ────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      // ─── background ───────────────────────────────────────────────────────
      ctx.fillStyle = "#0A0E2C";
      ctx.fillRect(0, 0, W, H);

      // Subtle vignette (darken edges so focus stays center)
      const vig = ctx.createLinearGradient(0, 0, W, 0);
      vig.addColorStop(0, "rgba(10,14,44,0.85)");
      vig.addColorStop(0.15, "rgba(10,14,44,0)");
      vig.addColorStop(0.85, "rgba(10,14,44,0)");
      vig.addColorStop(1, "rgba(10,14,44,0.85)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // ─── digits ───────────────────────────────────────────────────────────
      const cx = W / 2;
      const cy = H / 2;
      const halfVisible = Math.ceil((W / 2) / charW) + 2;

      // Colour interpolation: blue (fast) → gold (slow/found)
      const r = Math.round(94  + (255 - 94)  * zoom);
      const g = Math.round(146 + (213 - 146) * zoom);
      const b = Math.round(243 + (79  - 243) * zoom);
      const baseColor = `rgb(${r},${g},${b})`;

      ctx.textBaseline = "middle";
      ctx.font = `${fontSize}px "Courier New", Courier, monospace`;

      const centerIdx = Math.floor(currentPos);
      const subPixelOffset = (currentPos - centerIdx) * charW; // fractional digit offset

      for (let di = -halfVisible; di <= halfVisible; di++) {
        const globalIdx = centerIdx + di;
        if (globalIdx < 0) continue;

        const x = cx + di * charW - subPixelOffset;
        if (x < -charW * 3 || x > W + charW * 3) continue;

        const distFromCenter = Math.abs(x - cx) / (W / 2);

        const isMatchDigit =
          t > 0.92 &&
          globalIdx >= targetPosition &&
          globalIdx < targetPosition + pattern.length;

        if (isMatchDigit) {
          // Orange background box
          const fadeIn = Math.min(1, (t - 0.92) / 0.08);
          ctx.fillStyle = `rgba(255, 111, 0, ${fadeIn * 0.25})`;
          ctx.fillRect(x - charW * 0.55, cy - fontSize * 0.6, charW * 1.1, fontSize * 1.2);

          // Glow
          ctx.shadowColor = "#FF6F00";
          ctx.shadowBlur = 18 * fadeIn;
          ctx.fillStyle = `rgba(255, 213, 79, ${fadeIn})`; // gold
        } else {
          const edgeFade = Math.max(0.06, 1 - distFromCenter * 0.85);
          // Speed tint: fast = dim/blue, slow = bright/warm
          const brightness = 0.35 + (1 - speedFactor) * 0.65;
          ctx.fillStyle =
            speedFactor > 0.05
              ? `rgba(${r},${g},${b},${edgeFade * brightness})`
              : `rgba(176,190,197,${edgeFade * 0.95})`;
          ctx.shadowBlur = 0;
        }

        ctx.fillText(getDigit(globalIdx), x - charW / 2, cy);
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      }

      // ─── CSS blur on canvas (motion blur effect) ─────────────────────────
      el.style.filter = speedFactor > 0.02
        ? `blur(${(speedFactor * 2.5).toFixed(1)}px)`
        : "none";

      // ─── center scan cursor ───────────────────────────────────────────────
      const cursorColor =
        speedFactor > 0.4 ? "rgba(94,146,243,0.55)" : `rgba(255,213,79,${0.4 + zoom * 0.5})`;
      ctx.strokeStyle = cursorColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx, 6);
      ctx.lineTo(cx, H - 6);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cursor cap dots
      ctx.fillStyle = cursorColor;
      ctx.beginPath();
      ctx.arc(cx, 6, 2.5, 0, Math.PI * 2);
      ctx.arc(cx, H - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // ─── state updates ────────────────────────────────────────────────────
      setPosDisplay(Math.round(currentPos));
      if (speedFactor > 0.5) setScanLabel("SCANNING");
      else if (speedFactor > 0.05) setScanLabel("APPROACHING");
      else setScanLabel("FOUND");

      if (t < 1) {
        animId = requestAnimationFrame(render);
      } else {
        el.style.filter = "none";
        setDone(true);
      }
    }

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      el.style.filter = "none";
    };
  }, [targetPosition, pattern, contextDigits, contextStart]);

  const labelColor =
    scanLabel === "FOUND"
      ? "#FFD54F"
      : scanLabel === "APPROACHING"
      ? "#FFA040"
      : "#5E92F3";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Canvas wrapper */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          border: done
            ? "1px solid rgba(255,111,0,0.35)"
            : "1px solid rgba(21,101,192,0.3)",
          boxShadow: done
            ? "0 0 32px rgba(255,111,0,0.25)"
            : "0 0 20px rgba(21,101,192,0.15)",
          transition: "box-shadow 0.6s ease, border-color 0.6s ease",
        }}
      >
        <canvas ref={canvasRef} style={{ display: "block" }} />

        {/* HUD overlay — sits above the blurred canvas */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            p: "8px 12px",
            pointerEvents: "none",
          }}
        >
          {/* Position counter */}
          <Typography
            sx={{
              fontFamily: "Roboto Mono, monospace",
              fontSize: "0.7rem",
              color: labelColor,
              opacity: 0.9,
              textShadow: "0 1px 6px rgba(0,0,0,0.8)",
              transition: "color 0.3s",
            }}
          >
            π [{posDisplay.toLocaleString()}]
          </Typography>

          {/* Status badge */}
          <Typography
            sx={{
              fontFamily: "Roboto Mono, monospace",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: labelColor,
              opacity: 0.9,
              textShadow: "0 1px 6px rgba(0,0,0,0.8)",
              transition: "color 0.3s",
            }}
          >
            {scanLabel}
            {scanLabel !== "FOUND" && (
              <Box component="span" sx={{ ml: 0.5, animation: "blink 1s step-end infinite",
                "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } } }}>
                ▌
              </Box>
            )}
          </Typography>
        </Box>
      </Box>

      {/* Status line */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 0.5,
          minHeight: 22,
        }}
      >
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
          {done
            ? `"${pattern}" (${format}) locked at position ${targetPosition.toLocaleString()} of π`
            : "Speed-dependent zoom — slows as it homes in on your digits"}
        </Typography>
        {done && (
          <Typography
            variant="caption"
            sx={{
              color: "#FFD54F",
              fontFamily: "Roboto Mono, monospace",
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            ✓ MATCH LOCKED
          </Typography>
        )}
      </Box>
    </Box>
  );
}
