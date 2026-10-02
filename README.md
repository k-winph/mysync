# MySync — Personal Finance Manager

A **privacy-first, offline-first** personal finance web app (PWA). Track your
income and expenses, debts, taxes, savings goals and stock investments — with
**all data stored on your own device**. No account, no server, no tracking.

MySync is built to be **simple and hard to break** rather than clever and
fragile. It runs entirely in the browser, works offline, and can be installed
to your phone's home screen like a native app.

> **Language:** the app UI ships in **English and Thai** (switchable in
> Settings). The codebase, comments and this document are in English.

---

## Table of contents

- [Highlights](#highlights)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Configuration](#configuration)
- [Key concepts](#key-concepts)
- [Offline & data safety](#offline--data-safety)
- [Deployment (GitHub Pages)](#deployment-github-pages)
- [Versioning & releases](#versioning--releases)
- [Make it your own (fork & customize)](#make-it-your-own-fork--customize)
- [Known limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)

---

## Highlights

- 🔒 **100% on-device** — every record lives in your browser's `localStorage`. Nothing is sent anywhere.
- 📴 **Works offline** — installable PWA with a service worker; open and use it with no connection.
- 🆓 **Free to run** — static site, deployable free on GitHub Pages.
- 🌗 **Light / dark mode**, 🎨 **custom accent color**, and 🇬🇧 / 🇹🇭 **bilingual** UI.
- 💸 **Integer-satang money** — amounts are stored as integers (minor units) to avoid floating-point rounding errors.
- 🖼️ **Shareable summary cards** — turn any month into a 9:16 story image (themed, with category breakdown + portfolio).
- 📤 **Backup & restore** — a complete JSON backup you can share to the cloud, plus Excel/CSV export and import.

---

## Features

**Money tracking**
- Income / expense transactions with categories, tags, notes and dates
- Custom categories (icon + color) and a managed tag list
- A **running cumulative balance** that carries over across months automatically
- Yearly income-vs-expense breakdown; tap a month for a popup (category donuts + that month's transactions)
- Filtered totals — the Records list shows income/expense sums for whatever filter is active
- **Share a month as an image** — a 9:16 card (accent + light/dark themed) with category %, savings rate, vs-last-month, and portfolio highlights (top gainer + top holding)
- Spending-by-category donut on the dashboard

**Debts** — three distinct kinds
- **One-time** — a single amount you owe, mark paid / unpaid
- **Recurring** — repeating obligations (weekly / monthly / yearly); paying rolls the due date forward
- **Installment** — fixed number of payments with progress tracking
- Due-soon / overdue reminders (local notification, checked on app open)

**Investments**
- Portfolios and stock holdings (shares, average cost, currency)
- Live price refresh via a **swappable provider layer** (Finnhub by default, using your own free API key)
- Multi-currency support with cached FX conversion to a primary currency

**Savings, tax & tools**
- Savings goals with progress and "add funds"
- Thai personal income-tax estimator (configurable brackets)
- Split-the-bill helper — the draft persists on-device until you clear it
- In-app user guide

**App & security**
- Installable PWA (add-to-home-screen) + light haptic feedback on key actions
- Custom accent color (indigo / violet / sky / emerald / rose / amber), applied app-wide via CSS variables
- App lock with a PIN, optional biometric unlock (WebAuthn)
- Backup reminder when you haven't backed up in a while

---

## Tech stack

| Area | Choice |
|------|--------|
| UI framework | [React 18](https://react.dev/) |
| Build tool | [Vite 5](https://vite.dev/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) (+ PostCSS, Autoprefixer) |
| State | [Zustand 5](https://github.com/pmndrs/zustand) with `persist` → `localStorage` |
| Routing | [React Router 6](https://reactrouter.com/) |
| Charts | [Recharts](https://recharts.org/) + hand-built conic-gradient donuts |
| Icons | [lucide-react](https://lucide.dev/) |
| Dates | [Day.js](https://day.js.org/) |
| Import / export | [SheetJS (xlsx)](https://sheetjs.com/) + [PapaParse](https://www.papaparse.com/) |
| PWA / offline | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) |
| Deploy | [GitHub Pages](https://pages.github.com/) via [`gh-pages`](https://www.npmjs.com/package/gh-pages) |

**Requirements:** Node.js 18+ and npm.

---

## Project structure

```
mysync/
├── public/
│   ├── 404.html            # SPA deep-link redirect for GitHub Pages
│   ├── icon-192.png        # PWA / home-screen icons
│   └── icon-512.png
├── index.html              # app shell + 404-redirect restore script
├── vite.config.js          # Vite + PWA manifest + `base`
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx            # entry: Router basename + FeedbackProvider + App
    ├── App.jsx             # routes, theme, language, PIN gate, first-run notify
    ├── index.css           # Tailwind layers + keyframe animations
    │
    ├── pages/              # one screen per route
    │   ├── Dashboard.jsx        # "/"        balance, investments, savings, donut, recent
    │   ├── Balance.jsx          # /balance   yearly income vs expense
    │   ├── Transactions.jsx     # /transactions  list + filters + add/edit
    │   ├── Debt.jsx             # /debt      overview of all three debt kinds
    │   ├── Recurring.jsx        # /debt/recurring
    │   ├── Installments.jsx     # /debt/installments
    │   ├── Tax.jsx              # /tax       Thai income-tax estimator
    │   ├── Stocks.jsx           # /stocks    portfolios list
    │   ├── PortfolioDetail.jsx  # /stocks/:portfolioId
    │   ├── Savings.jsx          # /savings   goals
    │   ├── SplitBill.jsx        # /split     bill splitter (draft persisted to localStorage)
    │   ├── Guide.jsx            # /guide     in-app user guide
    │   └── Settings.jsx         # /settings  everything configurable
    │
    ├── components/         # reusable UI
    │   ├── ui/                  # primitives: Button, Card, Modal, MoneyInput,
    │   │                        #   EmptyState, Feedback (toast + confirm)
    │   ├── BottomNav.jsx        # tab bar (raised center Home button)
    │   ├── PageHeader.jsx       # shared page header (icon badge + title + subtitle)
    │   ├── TransactionModal.jsx / TransactionForm.jsx / TransactionItem.jsx
    │   ├── DebtModal.jsx, HoldingModal.jsx, PortfolioModal.jsx,
    │   ├── GoalModal.jsx, AddFundsModal.jsx
    │   ├── CategoryManager.jsx, TagManager.jsx, CategoryIcon.jsx
    │   ├── LockScreen.jsx, PinPad.jsx, PinSetupModal.jsx   # PIN / biometric
    │   ├── ExpenseDonut.jsx, MoneyText.jsx, DualMoney.jsx, FxChange.jsx
    │   ├── MonthDetailModal.jsx # month popup (donuts + list) + share-as-image
    │   └── Welcome.jsx, NotificationBell.jsx, Layout.jsx
    │
    ├── store/
    │   └── useStore.js     # single Zustand store (persist + versioned migrate)
    │
    ├── services/           # side-effecting I/O
    │   ├── stockApi.js         # swappable stock-price provider layer (Finnhub)
    │   ├── fx.js               # currency exchange-rate fetch
    │   └── exportImport.js     # JSON cloud backup + Excel/CSV export & import
    │
    ├── hooks/
    │   ├── useFx.js            # FX rates for a set of currencies
    │   ├── useQuotes.js        # fetch + cache stock quotes
    │   └── usePwaInstall.js    # beforeinstallprompt wrapper
    │
    ├── utils/
    │   ├── money.js            # satang <-> display, MoneyInput formatting, currencies
    │   ├── date.js             # dayjs helpers (ranges, daysUntil, addPeriod, ...)
    │   ├── tax.js              # tax computation
    │   ├── portfolio.js        # holdings math (value, gain, per-currency totals)
    │   ├── monthImage.js       # Canvas renderer for the 9:16 share-a-month card
    │   ├── notify.js           # local notifications (service-worker aware)
    │   ├── webauthn.js, pin.js # biometric + PIN hashing
    │   ├── haptics.js          # navigator.vibrate wrapper (respects setting)
    │   └── id.js               # id generator
    │
    └── constants/
        ├── strings.js          # all UI text, English + Thai (live-switching Proxy)
        ├── categories.js       # default seed categories
        ├── accents.js          # accent-color presets + applyAccent() (CSS vars)
        ├── taxBrackets.js      # tax brackets
        └── guide.js            # in-app guide content
```

---

## Getting started

```bash
# 1. Clone your repo
git clone https://github.com/<your-username>/mysync.git
cd mysync

# 2. Install dependencies
npm install

# 3. Run the dev server (http://localhost:5173)
npm run dev
```

That's it — no environment variables or backend to set up. Optional stock-price
refresh needs a free API key you paste **inside the app** (see
[Configuration](#configuration)); it is never committed to the repo.

---

## Available scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally to test it |
| `npm run deploy` | `build` then publish `dist/` to the `gh-pages` branch |

---

## Configuration

### Stock price API key (optional)

Live stock prices use **your own free API key**, entered in the app under
**Settings → Stocks**, and stored on-device only. The default provider is
[Finnhub](https://finnhub.io/register) (free tier). No key = the rest of the app
still works; you just won't get price updates.

> Finnhub's free tier covers **US stocks** in real time. Thai (SET) symbols use
> a `.BK` suffix (e.g. `PTT.BK`) but are **not** included in the free plan — see
> [Known limitations](#known-limitations).

### App base path / repo name

The app is served from a sub-path (`/mysync/`). Two places must agree with your
GitHub repository name:

- `vite.config.js` → `base: '/mysync/'`
- `src/main.jsx` → `<BrowserRouter basename="/mysync/">`

If your repo is named something else, change **both** (see
[Make it your own](#make-it-your-own-fork--customize)).

---

## Key concepts

**Money is integer satang.** All amounts are stored as integer minor units
(satang / cents) — never floats — so arithmetic is exact. `utils/money.js`
converts to/from display strings (`formatMoney`, `parseMoney`, `MoneyInput`).

**One store, persisted.** All app data lives in a single Zustand store
(`store/useStore.js`) persisted to `localStorage` under the key `mysync-store`.
The store is **versioned**: `STORE_VERSION` + a `migrate()` function upgrade old
saved data when the shape changes. Top-level collections:

```
transactions, categories, tags, debts, portfolios, holdings,
savingsGoals, fx (cached rates), settings
```

**Internationalization.** `constants/strings.js` holds `{ en, th }` trees behind
a `Proxy` that reads the active language live; `App.jsx` sets it from
`settings.language`, so switching language re-renders everything instantly.

**Networking is minimal.** The **only** two network calls in the whole app are
stock prices (`services/stockApi.js`) and FX rates (`services/fx.js`).
Everything else is local.

---

## Offline & data safety

- **Offline:** as an installed PWA (service worker set to `autoUpdate`), the app
  shell is cached and every core feature — transactions, debts, tax, savings,
  split-bill, backup — works with no connection. Investments work offline too
  (view/add/edit holdings, see the **last cached prices**); only *refreshing to
  current prices* and *FX rate updates* need the internet.
- **Backup / restore:** because data lives only in the browser, **backing up is
  on you**. Settings → Data gives you three options:
  - *Back up to cloud* — builds a complete `.json` backup and opens the share
    sheet (save to Google Drive, Files, email, …). If the device can't share a
    file, it downloads instead. Best on mobile.
  - *Export to Excel* — a `.xlsx` with every collection (transactions,
    categories, tags, debts, stocks, goals).
  - *Export to CSV* — transactions only.
  *Import from file* restores a `.json` or `.xlsx` you saved earlier. Do this
  regularly, especially before clearing browser data or switching devices. The
  app nudges you if it's been more than 14 days since your last backup.

---

## Deployment (GitHub Pages)

The project deploys as a static site to GitHub Pages using `gh-pages`.

```bash
npm run deploy      # builds and pushes dist/ to the gh-pages branch
```

Then, in your repo: **Settings → Pages → Source = `gh-pages` branch**. Your app
will be live at `https://<your-username>.github.io/mysync/`.

Notes:
- `base` in `vite.config.js` **must** equal `/<repo-name>/` or assets 404.
- SPA deep links are handled by `public/404.html`, which stashes the requested
  route and hands it back to `index.html` on load — so refreshing on
  `/mysync/settings` works.
- The service worker uses `autoUpdate`. After a redeploy, an installed PWA picks
  up the new version on its next launch (you may need to fully close and reopen
  the app once).

---

## Versioning & releases

MySync uses [Semantic Versioning](https://semver.org/): **`MAJOR.MINOR.PATCH`**.

| Bump | When | Example |
|------|------|---------|
| **PATCH** | Bug fixes only, no new features | `v1.0.0` → `v1.0.1` |
| **MINOR** | New features, backward-compatible (nothing existing breaks) | `v1.0.0` → `v1.1.0` |
| **MAJOR** | Breaking change (e.g. a data shape old backups can't restore) | `v1.x` → `v2.0.0` |

> This batch of changes (share-as-image, accent themes, running balance,
> persisted split-bill, filtered totals, JSON backup) adds features without
> breaking anything, so it's a **MINOR** bump: `v1.0.0` → **`v1.1.0`**.

### Tagging a new version

First commit your work, then tag it. The easiest way is `npm version`, which
updates `package.json`, makes a commit, **and** creates the matching git tag in
one step. Pass the exact version so `package.json` and the tag line up:

```bash
# 1. Commit the feature work first
git add -A
git commit -m "feat: share images, accent themes, running balance, JSON backup"

# 2. Set the version + create an annotated tag v1.1.0 (one command)
npm version 1.1.0 -m "Release v%s"

# 3. Push the commits and the tag to GitHub
git push origin main        # or your default branch
git push origin v1.1.0      # push just this tag (or: git push --tags)
```

Prefer to tag by hand instead of `npm version`? Do it directly:

```bash
git tag -a v1.1.0 -m "MySync v1.1.0 — share images, accent themes, JSON backup"
git push origin v1.1.0
```

### Handy tag commands

```bash
git tag                       # list all tags
git describe --tags           # show the current/nearest tag
git show v1.1.0               # see what a tag points at
git tag -d v1.1.0            # delete a tag locally (if you tagged by mistake)
git push origin :v1.1.0      # delete that tag on GitHub too
```

### Turning a tag into a GitHub Release (optional)

A tag is enough for versioning, but a **Release** gives it a changelog page and
downloadable archives. On GitHub: **Releases → Draft a new release → choose tag
`v1.1.0` → add notes → Publish release.** (Re-running `npm run deploy` is still
what updates the live GitHub Pages site — tags and releases don't deploy by
themselves.)

> Note: `package.json` currently reads `0.1.0` while your git history is tagged
> `v1.0.0`. Running `npm version 1.1.0` as above realigns them — afterwards both
> the file and the tag say `1.1.0`.

---

## Make it your own (fork & customize)

1. **Fork / clone** the repo and rename it (e.g. `myfinance`).
2. **Match the base path** to the new repo name — change **both**:
   - `vite.config.js` → `base: '/myfinance/'`
   - `src/main.jsx` → `basename="/myfinance/"`
   - (also update `homepage`, `scope`, `start_url`, and the shortcut `url` in `vite.config.js`)
3. **Rebrand:**
   - App name / description / theme color → the `manifest` in `vite.config.js` and `<title>` in `index.html`
   - Icons → replace `public/icon-192.png` and `public/icon-512.png` (keep the sizes)
   - UI copy → `src/constants/strings.js`
4. **Tune the defaults:**
   - Starter categories → `src/constants/categories.js`
   - Tax brackets → `src/constants/taxBrackets.js`
   - Supported currencies → `CURRENCIES` in `src/utils/money.js`
5. **Add a stock provider** (e.g. one that covers your market). The layer is
   designed for this — in `src/services/stockApi.js`, add an entry to
   `PROVIDERS` with a `quote(symbol, apiKey)` that returns
   `{ priceCents, changeCents, changePct }` (or throws). Nothing else needs to
   change.
6. `npm install`, `npm run dev`, build features, then `npm run deploy`.

**A note on stored data:** when you change the store's shape, bump
`STORE_VERSION` in `src/store/useStore.js` and add a case to `migrate()` so
existing users' saved data upgrades cleanly instead of breaking.

---

## Known limitations

- **Thai (SET) stock prices aren't available on free API tiers.** Finnhub free
  is US-only; Twelve Data lists SET but behind a paid plan; Yahoo Finance has
  free Thai data but blocks direct browser calls (CORS). Getting Thai prices
  therefore needs either a paid API key, a small proxy (e.g. a Cloudflare
  Worker), or manual price entry. Non-Thai (e.g. US) stocks refresh fine on the
  free tier.
- **No cloud sync.** By design. Data is per-browser; moving devices = export +
  import. Clearing site data / browser storage deletes everything, so keep
  backups.
- **Local notifications only.** Debt reminders fire when you *open* the app
  (there is no push server), consistent with the no-backend design.

---

## Contributing

Issues and pull requests are welcome. Keep changes aligned with the project's
guiding principle: **prefer simple and robust over clever and fragile.** Code,
variable names and comments are in English; user-facing strings go in
`constants/strings.js` with both `en` and `th` entries.

---

## License

No license file is included yet. If you want others to reuse your code, add one
(for a permissive choice, the [MIT License](https://choosealicense.com/licenses/mit/)
is common). Until a license is added, all rights are reserved by the author.

---

*Built with care as a private, offline-first finance tracker. Your money data
stays yours.*
