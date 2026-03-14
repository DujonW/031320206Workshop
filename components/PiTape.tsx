"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PiTapeProps {
  context: string; // e.g. "...92653[0314]15926..."
  pattern: string;
}

export default function PiTape({ context, pattern }: PiTapeProps) {
  // Parse context: everything before [, the match, and after ]
  const matchStart = context.indexOf("[");
  const matchEnd = context.indexOf("]");

  if (matchStart === -1 || matchEnd === -1) {
    return (
      <Box
        sx={{
          fontFamily: "Roboto Mono, monospace",
          fontSize: "1.1rem",
          letterSpacing: "0.1em",
          color: "text.secondary",
          overflowX: "auto",
          whiteSpace: "nowrap",
          p: 2,
        }}
      >
        {context}
      </Box>
    );
  }

  const before = context.slice(0, matchStart).replace(/\.\.\./g, "");
  const match = context.slice(matchStart + 1, matchEnd);
  const after = context.slice(matchEnd + 1).replace(/\.\.\./g, "");

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", mb: 1, display: "block" }}
      >
        Pi digits surrounding your match
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          overflowX: "auto",
          bgcolor: "rgba(255,255,255,0.03)",
          borderRadius: 2,
          border: "1px solid rgba(255,255,255,0.08)",
          p: "12px 16px",
          gap: 0,
          "&::-webkit-scrollbar": { height: "4px" },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255,255,255,0.2)",
            borderRadius: "2px",
          },
        }}
      >
        {/* Fade-in ellipsis */}
        <Typography
          component="span"
          sx={{
            fontFamily: "Roboto Mono, monospace",
            fontSize: { xs: "0.8rem", sm: "1rem" },
            color: "rgba(255,255,255,0.25)",
            mr: 0.5,
            flexShrink: 0,
          }}
        >
          …
        </Typography>

        {/* Before */}
        {before.split("").map((char, i) => (
          <Typography
            key={`b-${i}`}
            component="span"
            sx={{
              fontFamily: "Roboto Mono, monospace",
              fontSize: { xs: "0.85rem", sm: "1.05rem" },
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.05em",
              flexShrink: 0,
            }}
          >
            {char}
          </Typography>
        ))}

        {/* Match highlight */}
        {match.split("").map((char, i) => (
          <Box
            key={`m-${i}`}
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: "1.4rem", sm: "1.6rem" },
              height: { xs: "1.8rem", sm: "2rem" },
              bgcolor: "#FF6F00",
              borderRadius: "4px",
              mx: "1px",
              flexShrink: 0,
              boxShadow: "0 0 12px rgba(255,111,0,0.5)",
            }}
          >
            <Typography
              component="span"
              sx={{
                fontFamily: "Roboto Mono, monospace",
                fontSize: { xs: "0.85rem", sm: "1.05rem" },
                color: "white",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              {char}
            </Typography>
          </Box>
        ))}

        {/* After */}
        {after.split("").map((char, i) => (
          <Typography
            key={`a-${i}`}
            component="span"
            sx={{
              fontFamily: "Roboto Mono, monospace",
              fontSize: { xs: "0.85rem", sm: "1.05rem" },
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.05em",
              flexShrink: 0,
            }}
          >
            {char}
          </Typography>
        ))}

        {/* Trailing ellipsis */}
        <Typography
          component="span"
          sx={{
            fontFamily: "Roboto Mono, monospace",
            fontSize: { xs: "0.8rem", sm: "1rem" },
            color: "rgba(255,255,255,0.25)",
            ml: 0.5,
            flexShrink: 0,
          }}
        >
          …
        </Typography>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: "#FF6F00", mt: 1, display: "block", textAlign: "center" }}
      >
        ↑ Your birthday digits ({pattern}) highlighted in orange
      </Typography>
    </Box>
  );
}
