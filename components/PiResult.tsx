"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import CelebrationIcon from "@mui/icons-material/Celebration";
import PiScanAnimation from "./PiScanAnimation";
import type { PiSearchResult } from "./DOBForm";

interface PiResultProps {
  result: PiSearchResult;
}

const FORMAT_LABELS: Record<string, string> = {
  MMDD: "Month-Day",
  DDMM: "Day-Month",
  MMDDYYYY: "US Long",
  DDMMYYYY: "EU Long",
  YYYYMMDD: "ISO",
  MMDDYY: "US Short",
};

export default function PiResult({ result }: PiResultProps) {
  const [copied, setCopied] = useState(false);
  const { bestMatch, results, searchedDigits, contextDigits, contextStart } = result;

  const displayDate = result.dob.replace(/-/g, "/");

  async function handleCopy() {
    const text = bestMatch
      ? `🥧 My birthday (${displayDate}) appears at position ${bestMatch.position.toLocaleString()} in the digits of π — in ${FORMAT_LABELS[bestMatch.format]} format as "${bestMatch.pattern}"! Find yours at whereaminpi.app`
      : `🥧 My birthday (${displayDate}) was not found in the first ${searchedDigits.toLocaleString()} digits of π. Pi is still hiding it! Find yours at whereaminpi.app`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        animation: "fadeInUp 0.6s ease-out",
        "@keyframes fadeInUp": {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ color: "text.secondary", mb: 0.5 }}>
          Results for
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "primary.light" }}
        >
          {displayDate}
        </Typography>
      </Box>

      {/* Best Match Hero */}
      {bestMatch ? (
        <Card
          sx={{
            background:
              "linear-gradient(135deg, rgba(21,101,192,0.15) 0%, rgba(255,111,0,0.1) 100%)",
            border: "1px solid rgba(255,111,0,0.3)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <CelebrationIcon
                sx={{ color: "secondary.main", fontSize: 32, mt: 0.5 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "white", mb: 0.5 }}
                >
                  Found at position{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "#FFD54F",
                      fontFamily: "Roboto Mono, monospace",
                    }}
                  >
                    {bestMatch.position.toLocaleString()}
                  </Box>
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  Your birthday appears as{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "secondary.light",
                      fontFamily: "Roboto Mono, monospace",
                      fontWeight: 700,
                      fontSize: "1.1em",
                    }}
                  >
                    {bestMatch.pattern}
                  </Box>{" "}
                  ({FORMAT_LABELS[bestMatch.format]} format) — digit{" "}
                  {bestMatch.position.toLocaleString()} of the first{" "}
                  {searchedDigits.toLocaleString()} decimal digits of π
                </Typography>
              </Box>
              <Tooltip title={copied ? "Copied!" : "Share your result"}>
                <IconButton
                  onClick={handleCopy}
                  sx={{
                    color: copied ? "success.main" : "text.secondary",
                    border: "1px solid rgba(255,255,255,0.1)",
                    "&:hover": { color: "white" },
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card
          sx={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <CardContent sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
              Not found in the first {searchedDigits.toLocaleString()} digits
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
              π is infinite — your birthday is hiding somewhere deeper in the
              endless sequence. It&apos;s guaranteed to appear eventually!
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* SDAZ Pi Scan Animation */}
      {bestMatch && contextDigits && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <PiScanAnimation
            targetPosition={bestMatch.position}
            pattern={bestMatch.pattern}
            format={bestMatch.format}
            contextDigits={contextDigits}
            contextStart={contextStart}
          />

          {/* Stats pills below animation */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <StatPill
              label="Position"
              value={`#${bestMatch.position.toLocaleString()}`}
            />
            <StatPill
              label="Format"
              value={`${bestMatch.format} (${bestMatch.pattern})`}
            />
            <StatPill
              label="% into π"
              value={`${((bestMatch.position / searchedDigits) * 100).toFixed(3)}%`}
            />
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* All formats */}
      <Box>
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "text.secondary", fontSize: "0.95rem" }}
        >
          All formats searched
        </Typography>
        <Grid container spacing={1.5}>
          {results.map((r) => (
            <Grid item xs={12} sm={6} key={r.format}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: r.found
                    ? "rgba(21,101,192,0.12)"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${r.found ? "rgba(21,101,192,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {r.found ? (
                  <CheckCircleIcon
                    sx={{ color: "primary.light", fontSize: 20, flexShrink: 0 }}
                  />
                ) : (
                  <NotInterestedIcon
                    sx={{
                      color: "rgba(255,255,255,0.2)",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}
                  >
                    <Chip
                      label={r.format}
                      size="small"
                      sx={{
                        fontSize: "0.65rem",
                        height: 18,
                        bgcolor: r.found
                          ? "primary.dark"
                          : "rgba(255,255,255,0.05)",
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Roboto Mono, monospace",
                        fontSize: "0.9rem",
                        color: r.found ? "white" : "text.secondary",
                      }}
                    >
                      {r.pattern}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: r.found ? "primary.light" : "text.secondary" }}
                  >
                    {r.found
                      ? `Position ${r.position?.toLocaleString()}`
                      : "Not in first 1M digits"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 2,
        px: 2,
        py: 1,
        minWidth: 80,
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontSize: "0.7rem", mb: 0.25 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Roboto Mono, monospace",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#FFD54F",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
