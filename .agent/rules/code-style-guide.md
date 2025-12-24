---
trigger: always_on
---

### Project Structure

```
root/
├── public/                     # Static assets (favicon, robots.txt, etc.)
├── src/
│   ├── assets/                 # Processed assets (images, fonts, scss)
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/             # Shared/Reusable UI components
│   │   ├── common/             # Generic components (AppButton.vue, AppInput.vue)
│   │   └── layout/             # Structural components (TheHeader.vue, TheSidebar.vue)
│   │
│   ├── composables/            # Custom Vue Composables (useFetch, useTheme)
│   │
│   ├── config/                 # App-wide configuration (env vars, constants)
│   │
│   ├── plugins/                # Third-party plugin configs (i18n, vuetify, etc.)
│   │
│   ├── router/                 # Vue Router logic
│   │   ├── routes.ts           # Centralized route definitions
│   │   ├── guards.ts           # Navigation guards (Auth, etc.)
│   │   └── index.ts            # Router instance creation
│   │
│   ├── services/               # API calls and integrations
│   │   ├── api/                # Axios instances and interceptors
│   │   └── modules/            # Domain-specific services (auth.service.ts)
│   │
│   ├── stores/                 # Pinia state management
│   │   ├── auth.ts             # Individual Pinia stores
│   │   ├── user.ts
│   │   └── index.ts            # Pinia root instance
│   │
│   ├── styles/                 # Global styles (SCSS/CSS)
│   │   ├── _variables.scss     # Design tokens
│   │   └── main.scss           # Entry point for styles
│   │
│   ├── types/                  # Global TypeScript interfaces
│   │
│   ├── utils/                  # Pure helper functions (formatters, validators)
│   │
│   ├── views/                  # Page-level components
│   │   └── Dashboard/
│   │       ├── components/     # Feature-specific components
│   │       └── DashboardView.vue
│   │
│   ├── App.vue                 # Root component
│   └── main.ts                 # Entry point (initializes Vue, Pinia, Router)
│
├── .env                        # Environment variables
├── index.html                  # Vite entry HTML
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── VISUAL_STYLE_GUIDE.md       # Styling references and UI rules
```

---

### Core Principles for Development

- **SFC Modularity:** Use **Vue Single File Components (SFCs)** with the `<script setup lang="ts">` syntax.
    
- **Small Component Rule:** If a component exceeds 150-200 lines, break it down into smaller sub-components or move logic into a `composable`.
    
- **Composition API:** Leverage the Composition API for better logic reuse and TypeScript support.
    
- **Pinia Store Usage:** Use the "Setup Store" syntax in Pinia (using `ref` and `computed`) for consistency with the Composition API.
    
- **Naming Conventions:**
    
    - **Components:** PascalCase (e.g., `AppButton.vue`).
        
    - **Views:** Postfixed with `View` (e.g., `HomeView.vue`) to distinguish from shared components.
        
    - **Composables:** Prefixed with `use` (e.g., `useAuth.ts`).
        
- **Visual Consistency:** All UI decisions must be documented in `VISUAL_STYLE_GUIDE.md` before implementation to ensure a cohesive look and feel.