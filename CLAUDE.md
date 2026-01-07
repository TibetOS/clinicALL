# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClinicALL is an aesthetic clinic management system built with React 19, TypeScript, and Vite. It's an RTL (Hebrew) application that uses Google's Gemini AI for an AI assistant feature. The app was originally created with Google AI Studio.

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server on port 3000
pnpm build            # Production build
pnpm preview          # Preview production build
```

## Environment Setup

Create `.env.local` with:
```
GEMINI_API_KEY=your_api_key
```

## Architecture

### Routing (HashRouter)
- `/` - Landing page (public)
- `/pricing` - Pricing page
- `/login`, `/signup` - Auth pages
- `/c/:slug` - Public clinic landing page (e.g., `/c/dr-sarah`)
- `/book/:clinicId` - Booking flow
- `/admin/*` - Admin dashboard (wrapped in `AdminLayout`)

### Key Directories
- `components/` - Reusable UI components (`ui.tsx` has Button, Input, Card, Badge, Dialog, Tabs, Switch)
- `pages/` - Route-level components
- `types.ts` - All TypeScript interfaces
- `data.ts` - Mock data (MOCK_PATIENTS, MOCK_APPOINTMENTS, etc.)

### Special Components
- `ClinicAI` - Floating AI chat widget using Gemini API (`@google/genai`)
- `FaceMap` - SVG-based injectable face diagram for clinical notes
- `AdminLayout` - Dashboard shell with RTL sidebar navigation

### Styling
- Tailwind CSS via CDN (configured in `index.html`)
- Custom theme with teal primary color (`#0D9488`)
- Stone color palette for warm neutral backgrounds
- `cn()` utility from `components/ui.tsx` for class merging (clsx + tailwind-merge)

### Data Flow
Currently uses mock data from `data.ts`. Types are defined in `types.ts` for: Patient, Appointment, Service, InventoryItem, Lead, Invoice, Campaign, ClinicalNote.

## RTL Considerations

- App is Hebrew-first with `dir="rtl"` on root
- Font: Heebo (Hebrew) with Inter fallback
- Sidebar is on the right side
- Translation helpers like `getStatusLabel()` in Admin.tsx
