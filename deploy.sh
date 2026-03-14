#!/bin/bash
# One-shot deploy script for "Where Am I in Pi?" to Vercel
# Prerequisites: Node.js (https://nodejs.org) and Vercel CLI (npm i -g vercel)

set -e

echo "🥧 Pi Day Deployment Script"
echo "================================"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo ""
  echo "⚡ Installing Vercel CLI..."
  npm install -g vercel
fi

# Build check
echo ""
echo "🏗  Building..."
npm run build

# Deploy
echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployed! Happy Pi Day 🥧"
