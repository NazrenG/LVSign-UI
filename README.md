# LV Sign — Web app

Internal document-approval UI for LV Logistics. React 19 + Vite + Tailwind CSS v4.

```bash
npm install
npm run dev      # http://localhost:5173  (sign-in: /login)
npm run build
```

## Folder structure

```
src/
├── main.jsx                 # Entry: mounts <App />, imports global CSS
├── app/
│   ├── App.jsx              # Root component (global providers go here)
│   └── router.jsx           # All routes in one place
├── styles/index.css         # Tailwind + design tokens (@theme)
├── constants/               # ROUTES, navigation items, departments
├── data/                    # Mock data (swap for API calls later)
├── utils/                   # cn(), date/text formatters — pure functions
├── hooks/                   # useDisclosure, useMediaQuery, useLockBodyScroll
├── components/
│   ├── ui/                  # Design-system primitives: Button, Card, Badge, Avatar, Input…
│   └── layout/              # AppLayout, Sidebar, SidebarNav, MobileHeader, PageHeader
├── features/                # Domain modules (logic + components that know the domain)
│   ├── agreements/          # statuses, selectors, SigningProgress, SignerChain, table, detail panel
│   ├── dashboard/           # Home page blocks: QuickActions, StatsSummary, cards
│   └── auth/                # LoginForm, DepartmentPicker, SignedDocumentPreview
└── pages/                   # Thin route screens that compose features
```

**Rules of thumb**

- `components/ui` knows nothing about agreements — it can be reused in any app.
- `features/*` own domain logic. Business rules (e.g. "Awaiting 2 of 3") live in
  `agreementSelectors.js`, never inside JSX.
- `pages/*` only select data and arrange feature components.
- Colours/fonts come only from tokens in `styles/index.css` (`bg-canvas`, `text-ink-muted`, `bg-primary`…).

## Screens

| Design screen             | Route                    | Status      |
| ------------------------- | ------------------------ | ----------- |
| Sign in                   | `/login`                 | done        |
| Home (dashboard)          | `/`                      | done        |
| Agreements + detail panel | `/agreements?selected=…` | done        |
| Prepare document (editor) | `/documents/:id/edit`    | placeholder |
| Sign document             | `/documents/:id/sign`    | placeholder |

Responsive: the sidebar becomes a drawer below `lg`, the agreements table becomes a
card list below `md`, and the detail panel is a slide-over below `2xl`.
