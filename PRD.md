# PRD — Pi Day Birthday Finder

**Product Name:** Where Am I in Pi?
**Version:** 1.0
**Date:** March 14, 2026 (Pi Day)
**Author:** Product Team
**Status:** Approved for Development

---

## 1. Overview

**Where Am I in Pi?** is a Pi Day web application that allows users to enter their date of birth and discover where—if anywhere—that date appears within the digits of π (pi). The app visualizes the position with an interactive pictogram, making mathematics personal and delightful. Launched on Pi Day (March 14), this experience bridges infinite mathematics and individual identity.

---

## 2. Problem Statement

Pi Day is celebrated globally, yet most people engage with it passively. There is no personalized, interactive experience that connects individuals to the mathematical wonder of π. People want to feel a personal connection to abstract concepts — finding their birthday inside an infinite number is a compelling hook.

---

## 3. Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Drive Pi Day engagement | Sessions on March 14 | 10,000+ |
| High shareability | Social shares | 20% of sessions |
| Delight users | Time on page | > 2 min average |
| Performance | Time to interactive | < 3s on 4G |
| Reliability | Uptime on Pi Day | 99.9% |

---

## 4. User Stories

| ID | As a… | I want to… | So that… |
|----|-------|------------|----------|
| US-01 | Visitor | Enter my date of birth | I can search for it in Pi |
| US-02 | Visitor | See multiple date formats searched | I find the best match (MMDD, DDMM, MMDDYYYY, etc.) |
| US-03 | Visitor | See the exact position of my birthday | I know where I live in Pi |
| US-04 | Visitor | See surrounding Pi digits in context | I can visually understand the sequence |
| US-05 | Visitor | See a pictogram showing my position | I have a shareable, visual artifact |
| US-06 | Visitor | Share my result | I can celebrate with friends |
| US-07 | Visitor | See fun Pi Day facts | The experience is educational |

---

## 5. Features

### 5.1 Core Features (MVP)

#### F-01: Date of Birth Input
- Date picker input (day/month/year)
- Validates dates (no future dates, no dates before 1900)
- Responsive, accessible form
- Submit button with animated Pi symbol loader

#### F-02: Multi-Format Search
The app searches for the DOB in multiple numeric formats simultaneously:

| Format | Example (March 14, 1992) |
|--------|--------------------------|
| MMDD | 0314 |
| DDMM | 1403 |
| MMDDYYYY | 03141992 |
| DDMMYYYY | 14031992 |
| YYYYMMDD | 19920314 |
| MMDDYY | 031492 |

Returns all matches sorted by earliest position found.

#### F-03: Position Display
- Shows the digit position within π (e.g., "Position 2,847")
- Shows the surrounding digit context (±20 digits)
- Highlights the matched sequence within the context
- If not found in the searched range: shows a "Pi is infinite — your birthday is hiding deeper!" message

#### F-04: Pi Pictogram
A circular visualization representing the Pi digit sequence:
- Full circle = all searched digits (50,000)
- A glowing arc highlights the sector containing the match
- Inner ring shows: position number, percentage through searched digits
- Color gradient from Pi blue to match gold at the found position
- Animated "sweep" to the match position on load

#### F-05: Digit Tape
A horizontal scrolling "ticker tape" showing Pi digits, centered on the match:
- Displays 40 surrounding digits
- Matched digits highlighted with accent color and animation
- Monospace font for mathematical feel

### 5.2 Secondary Features

#### F-06: Share Result
- Copy-to-clipboard button generates a shareable text
- Format: "My birthday appears at position 2,847 in Pi! 🥧 Try yours at [url]"
- Open Graph image dynamically generated with result

#### F-07: Pi Day Facts Carousel
- Rotating cards with interesting Pi facts
- Displayed while search loads and on results page

#### F-08: Multiple Birthdays
- Users can search up to 3 birthdays in one session (self, partner, children)

---

## 6. Technical Requirements

### 6.1 Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| UI Library | MUI (Material UI) v5 |
| Language | TypeScript |
| Deployment | Vercel |
| Styling | MUI `sx` prop + `theme` system |

### 6.2 Pi Digits Source
- The app computes π digits server-side using the **Gibbons Spigot Algorithm** (Jeremy Gibbons, 2006)
- Computation is cached server-side on first request using `next/cache`
- Default search range: **50,000 decimal digits**
- The full string searched: `"3141592653..."` (including the leading 3)
- Coverage: >99.9% of all possible 4-digit patterns (MMDD/DDMM) found within 50,000 digits
- 8-digit patterns (MMDDYYYY) have ~0.05% probability of appearing in 50,000 digits

### 6.3 API Design
**GET `/api/search-pi?dob=YYYY-MM-DD`**

Response:
```json
{
  "results": [
    { "format": "MMDD", "pattern": "0314", "position": 2847, "found": true },
    { "format": "DDMM", "pattern": "1403", "position": 19201, "found": true },
    { "format": "MMDDYYYY", "pattern": "03141992", "position": null, "found": false }
  ],
  "searchedDigits": 50000,
  "bestMatch": { "format": "MMDD", "pattern": "0314", "position": 2847 },
  "piContext": "...92653589**0314**15926..."
}
```

### 6.4 Performance
- Vercel Serverless Functions (Node.js runtime)
- Pi digit computation cached with `unstable_cache` (indefinite TTL)
- Cold start < 15s (computation only on first invocation)
- Warm start < 100ms
- Static assets served from Vercel CDN

### 6.5 Accessibility
- WCAG 2.1 AA compliance
- Full keyboard navigation
- Screen reader announcements for search results
- High contrast mode support

---

## 7. Design Specifications

### 7.1 Visual Theme
- **Primary color:** `#1565C0` (Pi Blue)
- **Secondary color:** `#FF6F00` (Pie Orange/Gold)
- **Background:** `#0A0E2C` (Deep Space Dark)
- **Surface:** `#141829` (Dark Card)
- **Text:** `#FFFFFF` / `#B0BEC5`
- **Accent (match highlight):** `#FFD54F` (Golden Yellow)

### 7.2 Typography
- **Display:** Roboto Mono (monospace, for digits)
- **UI:** Roboto (MUI default)

### 7.3 Key Screens
1. **Landing:** Large π symbol, brief tagline, date picker centered
2. **Loading:** Animated Pi digits "spinning" into place
3. **Results:** Pictogram + tape + formatted position, share button

---

## 8. Constraints & Assumptions

- Search range limited to first 50,000 digits; some 8-digit patterns will not be found
- App is English-only for v1
- No user accounts or persistence — stateless experience
- Pi computation may cause 5-15s cold start on first Vercel invocation

---

## 9. Out of Scope (v1)

- Search beyond 1 million digits
- Native mobile app
- Custom OG image generation per result
- Analytics dashboard
- Multi-language support

---

## 10. Open Questions

| # | Question | Owner | Due |
|---|----------|-------|-----|
| OQ-1 | Should we show all matching formats or only the earliest? | Product | Pre-launch |
| OQ-2 | What is the UX if no format is found in 50,000 digits? | Design | Pre-launch |
| OQ-3 | Can we expand to 1M digits with a pre-computed static file? | Engineering | v1.1 |

---

## 11. Launch Checklist

- [ ] Vercel project created and linked
- [ ] Domain configured (piday.vercel.app or custom)
- [ ] OG tags for social sharing
- [ ] Pi Day (March 14) launch embargo
- [ ] Load tested for 1,000 concurrent users

---

*Happy Pi Day! π = 3.14159265358979323846...*
