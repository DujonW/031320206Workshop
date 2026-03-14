"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";

interface DOBFormProps {
  onResult: (data: PiSearchResult) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export interface PiSearchResult {
  results: Array<{
    format: string;
    pattern: string;
    position: number | null;
    found: boolean;
  }>;
  searchedDigits: number;
  bestMatch: {
    format: string;
    pattern: string;
    position: number;
    found: boolean;
  } | null;
  piContext: string | null;
  contextDigits: string | null;
  contextStart: number;
  dob: string;
}

export default function DOBForm({ onResult, loading, setLoading }: DOBFormProps) {
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dob) {
      setError("Please enter your date of birth.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/search-pi?dob=${dob}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      onResult({ ...data, dob });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        width: "100%",
        maxWidth: 420,
        mx: "auto",
      }}
    >
      <Typography
        variant="body1"
        sx={{ color: "text.secondary", textAlign: "center" }}
      >
        Enter your date of birth to find where it hides in the infinite digits of π
      </Typography>

      <TextField
        label="Your Date of Birth"
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        inputProps={{ max: today, min: "1900-01-01" }}
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{
          "& .MuiOutlinedInput-root": {
            fontSize: "1.1rem",
          },
        }}
      />

      {error && (
        <Alert severity="error" sx={{ width: "100%", borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading || !dob}
        startIcon={
          loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SearchIcon />
          )
        }
        sx={{
          py: 1.75,
          fontSize: "1.05rem",
          background: loading
            ? undefined
            : "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
          },
        }}
      >
        {loading ? "Searching Pi…" : "Find My Birthday in π"}
      </Button>

      <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center" }}>
        Searches the first 50,000 digits of π
      </Typography>
    </Box>
  );
}
