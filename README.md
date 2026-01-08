# ClinicALL

A modern aesthetic clinic management system built with React 19, TypeScript, and Vite.

## Features

- **Patient Management** - Track patients, medical history, and risk levels
- **Appointment Scheduling** - Calendar view with drag-and-drop support
- **Health Declarations** - Token-based secure health forms
- **Clinical Notes** - Injectable face mapping with FaceMap component
- **Inventory Management** - Track products, expiry dates, and stock levels
- **Multi-tenant Support** - Public clinic landing pages (`/c/:slug`)
- **Billing & Invoicing** - Invoice generation and payment tracking
- **Marketing Tools** - Campaign management (SMS, WhatsApp, Email)
- **Real-time Notifications** - Actionable in-app notification system

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Real-time)
- **AI**: Google Gemini API
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**

   Create `.env.local` with:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   > Note: The app works in mock mode without Supabase credentials.

3. **Start development server:**
   ```bash
   pnpm dev
   ```

4. **Open in browser:**

   http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |

## Project Structure

```
clinicALL/
├── components/       # Reusable UI components
│   ├── ui.tsx       # Core UI components (Button, Input, Card, etc.)
│   ├── FaceMap.tsx  # Injectable face diagram
│   └── ...
├── pages/           # Route-level components
│   ├── admin/       # Admin dashboard pages (lazy loaded)
│   └── ...
├── hooks/           # Custom React hooks
├── contexts/        # React contexts (Auth)
├── lib/             # Utilities (Supabase client)
├── types.ts         # TypeScript interfaces
├── data.ts          # Mock data
└── App.tsx          # Main app with routing
```

## RTL Support

This is a Hebrew-first application with full RTL (right-to-left) support:
- Root element has `dir="rtl"`
- Heebo font for Hebrew text
- Sidebar positioned on the right

## License

Private
