# Architecture

The app now uses a clearer split between route handlers, domain validation, UI, and business logic:

- `src/app/**`
  Next.js pages and route entrypoints only.
- `src/server/api/**`
  Shared request parsing and route-response helpers.
- `src/server/auth/**`
  Server-only session and admin guards.
- `src/server/services/**`
  Business workflows and Prisma-backed operations.
- `src/server/orders/**` and `src/server/payments/**`
  Server-only domain utilities and integrations.
- `src/features/**`
  Feature-owned validation, client API wrappers, and UI components.

Migrated slices:

- `admin/products`
- `checkout`
- `payments/razorpay`

Migration rule for new code:

- Prefer `@/features/**` for feature UI, feature validation, and browser-side API calls.
- Prefer `@/server/**` for route helpers, auth, payments, and business logic.
- Keep `src/app/**` thin by delegating real work to those layers.
