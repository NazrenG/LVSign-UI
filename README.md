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
├── main.jsx                  # Entry: mounts <App />, imports global CSS
├── app/
│   ├── App.jsx               # Root component (global providers go here)
│   └── router.jsx            # All routes in one place
├── styles/index.css          # Tailwind + design tokens (@theme)
├── constants/                # ROUTES, navigation items, departments
├── data/                     # Mock data: people, agreements, templates, role library
├── services/                 # Data access (templatesService) — swap for API calls here
├── utils/                    # cn(), date/text formatters — pure functions
├── hooks/                    # useDisclosure, useMediaQuery, useClickOutside…
├── components/
│   ├── ui/                   # Design-system primitives (no domain knowledge)
│   │                         #   Button, Card, Input, Select, Toggle, Checkbox,
│   │                         #   SegmentedControl, OptionButtons, StatGroup, Menu…
│   ├── shared/               # Generic steppers used by several features
│   │                         #   StepProgress, VerticalSteps, RoleChain, StepMarker
│   └── layout/               # AppLayout, Sidebar, MobileHeader, PageHeader
├── features/                 # Domain modules
│   ├── agreements/           # statuses, selectors, signing route, table, detail panel
│   ├── dashboard/            # Home page blocks
│   ├── auth/                 # LoginForm, DepartmentPicker
│   └── templates/
│       ├── templateConstants.js   # categories, field types, builder steps…
│       ├── templateSelectors.js   # filtering, sorting, field grouping (pure)
│       ├── reminderSchedule.js    # reminder timeline derived from settings
│       ├── publishChecks.js       # "Ready to publish" validation
│       ├── fieldCalculations.js   # calculated fields (working days)
│       ├── hooks/                 # useTemplateDraft + pure reducer
│       └── components/
│           ├── list/              # CategoryFilter, TemplateCard, FrequentlyUsed…
│           ├── detail/            # ApprovalChainCard, FormFieldsTable, PrefillForm…
│           └── builder/           # BuilderHeader, BuilderStepper, step layout
│               ├── steps/         # BasicInfo, RolesWorkflow, Fields, ExpiryReminders
│               └── basic/ roles/ fields/ expiry/   # cards used by each step
└── pages/                    # Thin route screens that compose features
```

**Rules of thumb**

- `components/ui` knows nothing about agreements or templates — it can be reused in any app.
- `components/shared` holds generic building blocks that several features share
  (e.g. the same stepper draws a signing route and a template approval chain).
- `features/*` own domain logic. Business rules live in plain `.js` files
  (`agreementSelectors.js`, `templateSelectors.js`, `publishChecks.js`), never inside JSX.
- `pages/*` only read data (through `services/`) and arrange feature components.
- Colours/fonts come only from tokens in `styles/index.css`.
- Formatting: Prettier (`npm run format`).

## Screens

| Design screen              | Route                                                   | Status      |
| -------------------------- | ------------------------------------------------------- | ----------- |
| Sign in                    | `/login`                                                | done        |
| Home (dashboard)           | `/`                                                     | done        |
| Agreements + detail panel  | `/agreements?selected=…`                                | done        |
| Prepare document (editor)  | `/documents/:id/edit`                                   | placeholder |
| Sign document              | `/documents/:id/sign`                                   | placeholder |
| Templates                  | `/templates`                                            | done        |
| Template detail + pre-fill | `/templates/:id`                                        | done        |
| Template builder (4 steps) | `/templates/:id/edit?step=basic\|roles\|fields\|expiry` | done        |

New template: `/templates/new/edit`; duplicate: `/templates/new/edit?duplicate=<id>`.

Responsive: the sidebar becomes a drawer below `lg`, the agreements table becomes a
card list below `md`, and the detail panel is a slide-over below `2xl`.
In the template builder the stepper collapses to "Step 2 of 4" below `xl`, the
Fields step drops its field list below `xl` and its side panels below `lg`, and the
reminder timeline becomes a vertical list on phones.
