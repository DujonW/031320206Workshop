"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import RefreshIcon from "@mui/icons-material/Refresh";
import DOBForm, { type PiSearchResult } from "@/components/DOBForm";
import PiResult from "@/components/PiResult";
import "@/app/globals.css";

const PI_SNIPPET = "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196";

const PI_FACTS = [
  "π is irrational — it cannot be expressed as a fraction of two integers.",
  "The first 31 digits of π are enough to calculate the circumference of the observable universe to within the width of a hydrogen atom.",
  "March 14 (3/14) is celebrated as Pi Day worldwide.",
  "The digits of π have been computed to over 100 trillion decimal places.",
  "Albert Einstein was born on Pi Day — March 14, 1879.",
  "In 2019, Emma Haruka Iwao computed π to 31.4 trillion digits using Google Cloud.",
  "The symbol π was popularized by Welsh mathematician William Jones in 1706.",
  "π appears in Euler's identity: e^(iπ) + 1 = 0, considered the most beautiful equation in mathematics.",
];

export default function Home() {
  const [result, setResult] = useState<PiSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    setFactIndex(Math.floor(Math.random() * PI_FACTS.length));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pi digits watermark */}
      <Box
        className="pi-bg"
        aria-hidden="true"
        sx={{ userSelect: "none" }}
      >
        {PI_SNIPPET.repeat(40)}
      </Box>

      {/* Radial gradient accent */}
      <Box
        sx={{
          position: "fixed",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(21,101,192,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Box
          sx={{
            pt: { xs: 6, sm: 10 },
            pb: { xs: 4, sm: 6 },
            textAlign: "center",
          }}
        >
          <Chip
            label="🥧 Happy Pi Day — March 14"
            sx={{
              mb: 3,
              bgcolor: "rgba(21,101,192,0.15)",
              border: "1px solid rgba(21,101,192,0.4)",
              color: "primary.light",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.8rem", sm: "4rem", md: "5rem" },
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              mb: 2,
              background:
                "linear-gradient(135deg, #FFFFFF 0%, #5E92F3 50%, #FF6F00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Where Am I in π?
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              maxWidth: 560,
              mx: "auto",
              fontSize: { xs: "1rem", sm: "1.2rem" },
              lineHeight: 1.6,
            }}
          >
            Enter your date of birth and discover exactly where it hides inside
            the infinite, never-repeating digits of π
          </Typography>

          <Typography
            sx={{
              fontFamily: "Roboto Mono, monospace",
              color: "rgba(255,255,255,0.12)",
              fontSize: { xs: "0.7rem", sm: "0.85rem" },
              mt: 3,
              letterSpacing: "0.05em",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            π = {PI_SNIPPET.slice(0, 60)}…
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: { xs: 4, sm: 6 } }} />

        {/* Form / Result */}
        {result ? (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={() => setResult(null)}
                variant="outlined"
                size="small"
                sx={{ borderColor: "rgba(255,255,255,0.2)", color: "text.secondary" }}
              >
                Search another birthday
              </Button>
            </Box>
            <PiResult result={result} />
          </Box>
        ) : (
          <DOBForm
            onResult={setResult}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {/* Pi fact */}
        <Box
          sx={{
            mt: { xs: 6, sm: 8 },
            mb: { xs: 4, sm: 6 },
            p: 3,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "primary.light", fontWeight: 600, display: "block", mb: 1 }}
          >
            π FACT
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
              fontStyle: "italic",
              lineHeight: 1.7,
            }}
          >
            {PI_FACTS[factIndex]}
          </Typography>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            pb: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.2)", fontFamily: "Roboto Mono, monospace" }}
          >
            Searches millions of decimal digits of π via Pi API · Built for Pi Day 2026
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
