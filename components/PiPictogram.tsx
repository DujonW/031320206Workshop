"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PiPictogramProps {
  position: number;
  totalDigits: number;
  pattern: string;
  format: string;
}

export default function PiPictogram({
  position,
  totalDigits,
  pattern,
  format,
}: PiPictogramProps) {
  const [animProgress, setAnimProgress] = useState(0);
  const animRef = useRef<number | null>(null);
  const targetProgress = position / totalDigits;

  useEffect(() => {
    const start = Date.now();
    const duration = 1800;

    function step() {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimProgress(eased * targetProgress);
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    }

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetProgress]);

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 120;
  const innerR = 78;
  const strokeWidth = outerR - innerR;
  const trackR = (outerR + innerR) / 2;

  // Convert progress to SVG arc
  function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  function describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  const progressAngle = animProgress * 360;
  const dotAngle = animProgress * 360;
  const dotPos = polarToCartesian(cx, cy, trackR, dotAngle);

  const percentStr = ((position / totalDigits) * 100).toFixed(4);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1565C0" />
              <stop offset="100%" stopColor="#FF6F00" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a2040" />
              <stop offset="100%" stopColor="#0A0E2C" />
            </radialGradient>
          </defs>

          {/* Background circle */}
          <circle cx={cx} cy={cy} r={outerR} fill="url(#bgGrad)" />

          {/* Track ring */}
          <circle
            cx={cx}
            cy={cy}
            r={trackR}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          {animProgress > 0 && animProgress < 1 && (
            <path
              d={describeArc(cx, cy, trackR, 0, progressAngle)}
              fill="none"
              stroke="url(#arcGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
          {animProgress >= 1 && (
            <circle
              cx={cx}
              cy={cy}
              r={trackR}
              fill="none"
              stroke="url(#arcGrad)"
              strokeWidth={strokeWidth}
            />
          )}

          {/* Dot at match position */}
          {animProgress > 0 && (
            <circle
              cx={dotPos.x}
              cy={dotPos.y}
              r={10}
              fill="#FFD54F"
              filter="url(#glow)"
            />
          )}

          {/* Inner content */}
          <text
            x={cx}
            y={cy - 18}
            textAnchor="middle"
            fill="white"
            fontSize="28"
            fontWeight="bold"
            fontFamily="Roboto Mono, monospace"
          >
            {pattern}
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fill="#B0BEC5"
            fontSize="11"
          >
            {format} format
          </text>
          <text
            x={cx}
            y={cy + 30}
            textAnchor="middle"
            fill="#FFD54F"
            fontSize="13"
            fontWeight="600"
          >
            {percentStr}% into π
          </text>

          {/* π symbol */}
          <text
            x={cx}
            y={cy + 54}
            textAnchor="middle"
            fill="rgba(255,255,255,0.15)"
            fontSize="22"
          >
            π
          </text>
        </svg>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: "text.secondary", textAlign: "center" }}
      >
        The golden dot marks your birthday&apos;s position on the Pi arc
      </Typography>
    </Box>
  );
}
