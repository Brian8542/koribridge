# KoriBridge

> A language and cultural exchange partner platform connecting Korean learners with native speakers worldwide.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Brian8542/koribridge)

---

## Features

- **Partner Discovery** — Browse public profiles filtered by nationality, language, and proficiency level
- **AI Match Score** — Automatic compatibility scoring based on native / target language pairs and shared interests
- **Real-time Chat** — 1-on-1 messaging with image sharing, message editing, deletion, and read receipts
- **Live Translation** — In-chat message translation powered by MyMemory API
- **Online Presence** — See which partners are currently online via Supabase Realtime
- **Favourites** — Save and quickly access preferred partners
- **Dark Mode** — System-aware theme with manual toggle, persisted to localStorage
- **Progressive Web App** — Installable on mobile via `public/manifest.json` + service worker
- **Admin Dashboard** — User management, report moderation, and platform statistics
- **Push Notifications** — Browser notifications for new messages when the app is in the background
- **Account Management** — Self-service profile editing and account deletion

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [React 18](https://react.dev/) with functional components and hooks |
| Routing | [React Router v6](https://reactrouter.com/) |
| Styling | [Tailwind CSS v3](https://tailwindcss.com/) |
| Backend / DB | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage + Realtime) |
| SEO / Meta | [react-helmet-async](https://github.com/staylor/react-helmet-async) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Project Structure

```
src/
├── components/    # Shared, React.memo-wrapped UI components
├── context/       # AuthContext (session) · ThemeContext (dark mode)
├── hooks/         # useOnlineUsers (Realtime presence) · useLocale
├── lib/           # Supabase client
├── pages/         # One file per route
└── utils/         # formatters · matching score · language level helpers
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` public key |
| `VITE_SUPABASE_URL` | Optional Vite-style alias for `REACT_APP_SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Optional Vite-style alias for `REACT_APP_SUPABASE_ANON_KEY` |

Supabase Edge Functions also use server-side secrets:

| Secret | Used for |
|---|---|
| `RESEND_API_KEY` | Sending welcome emails from `send-welcome-email` |
| `WELCOME_EMAIL_FROM` | Verified sender address, e.g. `KoriBridge <hello@yourdomain.com>` |
| `APP_URL` | Public app URL used in email buttons |
| `ALLOWED_ORIGIN` | Production web origin for Edge Function CORS |

> **Never commit `.env`** — it is already listed in `.gitignore`.

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- A Supabase project with the required tables (see `CLAUDE.md` for the full schema)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Brian8542/koribridge.git
cd koribridge

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your Supabase URL and anon key

# 4. Start the development server
npm start
# Opens http://localhost:3000
```

### Build for Production

```bash
npm run build
# Output is in /dist — deploy the contents of this folder
```

---

## Deployment on Vercel

1. Import the GitHub repository in the [Vercel dashboard](https://vercel.com/new).
2. Add the two environment variables (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`) in **Settings → Environment Variables**.
3. Deploy. `vercel.json` handles SPA routing rewrites and security headers automatically.

---

## Supabase Setup

The app requires the following tables and storage buckets in your Supabase project.  
Refer to `CLAUDE.md` for the complete column-level schema.

**Tables:** `profiles` · `messages` · `blocked_users` · `favorites` · `reports` · `email_deliveries`  
**Storage buckets:** `avatars` (2 MB limit) · `chat-images` (5 MB limit) · `voice-memos`

Enable **Realtime** on the `messages` table for live chat and online-presence features.

---

## Security

- All image uploads are restricted to `image/jpeg`, `image/png`, and `image/webp` (validated client-side by MIME type).
- Input length limits are enforced on all text fields (`display_name` ≤ 50, `bio` ≤ 500, messages ≤ 1000 characters).
- Environment secrets are never bundled — only `REACT_APP_*`/`VITE_*` prefixed variables are embedded in the build, and these Supabase values are *public* keys.
- HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) are set via `vercel.json`.

---

## License

Private — all rights reserved.
