# KoriBridge — CLAUDE.md

Project context for AI-assisted development. Read this before touching any file.

---

## Project Overview

KoriBridge is a Korean-culture language-exchange partner platform built with React 18 + Supabase. Users register a profile, browse partners by nationality / language / level, chat in real-time, and manage favourites / reports.

Deployment target: **Vercel** (SPA, root domain).

---

## Absolute Rules

### Files you must NEVER modify

| File | Reason |
|---|---|
| `src/context/AuthContext.js` | Auth session management. Changing this breaks login flow app-wide. |
| `src/App.js` | Router tree and provider composition. Changing this can break all route guards. |

If a task requires changing auth logic or routing, stop and ask the user first.

---

## Directory Structure

```
koribridge/
├── public/               # Static assets, manifest, sw.js
├── src/
│   ├── components/       # Shared UI components (always React.memo-wrapped)
│   │   ├── AnnouncementBanner.js
│   │   ├── ConfirmModal.js
│   │   ├── ConversationItem.js   ← React.memo
│   │   ├── DeleteAccountModal.js
│   │   ├── ErrorBoundary.js
│   │   ├── ProfileCard.js        ← React.memo
│   │   ├── ProfileFilters.js     ← React.memo
│   │   ├── ProfileSkeleton.js    ← React.memo
│   │   ├── StatsBanner.js        ← React.memo
│   │   └── Toast.js              # ToastProvider + useToast hook
│   ├── context/
│   │   ├── AuthContext.js        ← DO NOT TOUCH
│   │   └── ThemeContext.js       # Dark/light mode
│   ├── hooks/
│   │   ├── useLocale.js          # Browser locale detection
│   │   └── useOnlineUsers.js     # Supabase Presence real-time hook
│   ├── lib/
│   │   └── supabase.js           # Supabase client (reads .env)
│   ├── pages/
│   │   ├── AdminPage.js          # /admin — admin-only dashboard
│   │   ├── AuthPage.js           # /auth — login / signup / password reset
│   │   ├── ChatPage.js           # /chat/:partnerId — real-time 1-on-1 chat
│   │   ├── HomePage.js           # /home — partner browse, favourites, chat list
│   │   ├── NotFoundPage.js       # /404 and catch-all
│   │   ├── PrivacyPage.js        # /privacy
│   │   ├── ProfileDetailPage.js  # /profile/:id
│   │   ├── ProfileSetupPage.js   # /setup — first-time profile creation
│   │   ├── SplashScreen.js       # / — auto-redirects to /auth after 1.5 s
│   │   └── TermsPage.js          # /terms
│   ├── utils/
│   │   ├── formatters.js         # formatTime, formatRelativeTime
│   │   ├── languageLevel.js      # getLanguageLevel(profile)
│   │   └── matching.js           # getMatchScore, getMatchPercentage
│   ├── App.js                    ← DO NOT TOUCH
│   ├── index.css                 # Tailwind directives + custom classes
│   └── index.js                  # ReactDOM root + HelmetProvider
├── .env                          # Secret — never commit (in .gitignore)
├── .env.example                  # Template committed to repo
├── vercel.json                   # SPA rewrites + security headers
└── CLAUDE.md                     # This file
```

---

## Route Map

| Path | Component | Auth required |
|---|---|---|
| `/` | SplashScreen | No |
| `/auth` | AuthPage | No |
| `/setup` | ProfileSetupPage | User only |
| `/home` | HomePage | User + profile |
| `/profile/:id` | ProfileDetailPage | User + profile |
| `/chat/:partnerId` | ChatPage | User + profile |
| `/terms` | TermsPage | No |
| `/privacy` | PrivacyPage | No |
| `/admin` | AdminPage | User + profile |
| `/404` | NotFoundPage | No |

Route guards live in `App.js` (`ProfileRequiredRoute`, `ProfileSetupRoute`). Admin access is checked inside `AdminPage.js` via `profiles.is_admin`.

---

## Supabase Table Structure

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | = auth.users.id |
| `display_name` | text | max 50 chars |
| `nationality` | text | From NATIONALITIES constant |
| `native_language` | text | From LANGUAGES constant |
| `learning_language` | text | From LANGUAGES constant |
| `language_level` | text | `초급` / `중급` / `고급` |
| `bio` | text | max 500 chars |
| `avatar_url` | text | Supabase Storage public URL |
| `interests` | text[] | Subset of INTERESTS constant |
| `is_public` | bool | Whether visible in browse list |
| `is_admin` | bool | Admin dashboard access |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `messages`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `sender_id` | uuid FK → profiles | |
| `receiver_id` | uuid FK → profiles | |
| `content` | text | max 1000 chars |
| `image_url` | text | nullable, Supabase Storage |
| `created_at` | timestamptz | |
| `read_at` | timestamptz | nullable |
| `edited_at` | timestamptz | nullable |

### `blocked_users`
| Column | Type |
|---|---|
| `id` | uuid PK |
| `blocker_id` | uuid FK → profiles |
| `blocked_id` | uuid FK → profiles |

Unique constraint on `(blocker_id, blocked_id)`. Insert error code `23505` = already blocked (safe to ignore).

### `favorites`
| Column | Type |
|---|---|
| `id` | uuid PK |
| `user_id` | uuid FK → profiles |
| `partner_id` | uuid FK → profiles |

### `reports`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `reporter_id` | uuid FK → profiles | |
| `reported_id` | uuid FK → profiles | |
| `reason` | text | max 1000 chars |
| `status` | text | `pending` / `resolved` |
| `created_at` | timestamptz | |
| `resolved_at` | timestamptz | nullable |

### Storage Buckets
| Bucket | Used for | Max file size |
|---|---|---|
| `avatars` | Profile photos | 2 MB |
| `chat-images` | In-chat image messages | 5 MB |

Allowed MIME types for both buckets: `image/jpeg`, `image/png`, `image/webp`.

---

## Coding Conventions

### General
- **No comments** unless the WHY is non-obvious (hidden constraint, workaround, subtle invariant).
- No `console.log`. `console.error` is allowed only inside `ErrorBoundary`.
- No `dangerouslySetInnerHTML` anywhere.
- All user-facing text is in **Korean** (UI copy, error messages, toasts).

### Components
- Every component that appears in a list must be wrapped in `React.memo`.
- Functions passed as props to `React.memo` components must be stabilised with `useCallback`.
- New shared components go in `src/components/`. New page components go in `src/pages/`.

### Page titles
Every page must include a `<Helmet>` tag:
```jsx
import { Helmet } from "react-helmet-async";
<Helmet><title>KoriBridge - 페이지명</title></Helmet>
```

### Toast notifications
Use `useToast()` for all user-facing feedback — never `alert()` or `window.confirm()`.
```js
const { showToast } = useToast();
showToast("메시지", "success" | "error" | "info");
```

### Supabase queries
- Always destructure `{ data, error }` and check `error` before using `data`.
- Use `try / catch` for async operations that modify state.
- Never expose raw Supabase errors to the user — show a Korean-language toast instead.

### Image uploads
```js
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Always validate file.type against this list before upload.
// file input accept attribute: accept=".jpg,.jpeg,.png,.webp"
```

### Input limits
| Field | Limit |
|---|---|
| `display_name` | 50 chars (`maxLength={50}`) |
| `bio` | 500 chars (`maxLength={500}`) |
| Chat message | 1000 chars — enforced in `ChatPage` |
| Report reason | 1000 chars — `.slice(0, 1000)` before insert |

### Tailwind custom classes (defined in `index.css`)
| Class | Usage |
|---|---|
| `.card` | White rounded card with shadow |
| `.btn-primary` | Red filled button |
| `.btn-secondary` | Light gray outlined button |
| `.input-field` | Styled text / select input |

---

## Environment Variables

| Variable | Description |
|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_URL` | Optional Vite-style alias for Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Optional Vite-style alias for Supabase anon/public key |

Copy `.env.example` → `.env` and fill in values from the Supabase dashboard (Settings → API).

---

## Development Commands

```bash
npm start        # Start dev server on http://localhost:3000
npm run build    # Production build → /dist
npm test         # Run test suite
```

Always run `npm test` and `npm run build` before committing. Vite chunk-size warnings are acceptable when the build exits successfully.

---

## 로그인 관련 절대 규칙

- `signInWithOAuth` 호출 시 반드시 `redirectTo: window.location.origin + "/home"` 를 포함할 것 — 누락 시 Google OAuth 완료 후 SplashScreen(`/`)으로 복귀해 로그인 화면으로 튕기는 버그 재발.
- `src/context/AuthContext.jsx` 와 `src/App.jsx` 는 절대 수정 금지.
- `profile === null && !loading` 조건 절대 변경 금지 — 이 조건이 프로필 미완성 유저를 `/setup` 으로 보내는 유일한 게이트임.
