# Fonestack: project instructions for Copilot

## Stack
- Next.js 14.2 App Router, React 18, TypeScript, Tailwind, lucide-react. Supabase through `@supabase/supabase-js` only (no `@supabase/ssr`). Resend through fetch. Gemini through `GEMINI_API_KEY`. `exceljs` is installed. PostHog runs on the public site only.

## Admin architecture (keep this pattern)
- Admin pages are client components in `app/admin/**`. They use `supabase` from `@/lib/supabase`, typed by `lib/database.types.ts`. The login gate is `components/AdminLayoutClient.tsx` (it checks `auth.getUser()` and the `admin_users` table).
- Admin API routes live in `app/api/admin/**`. They authenticate with `Authorization: Bearer <access token>`, create a Supabase client from the anon key plus that token, verify the user exists in `admin_users`, and never use a service-role key. Copy the pattern in `app/api/admin/invoices/send-email/route.ts`. Pages call them with `fetch` and the session access token.
- Existing pages: `/admin` (overview), `/admin/inventory`, `/admin/invoices`, `/admin/invoices/new`, `/admin/invoices/[id]`, `/admin/leads` (device_requests), `/admin/trade-ins`, `/admin/imei`, `/admin/settings`. Public: `/invoice/[id]` (uses the RPC `get_public_invoice`).

## Database facts
- Tables: products, invoices, admin_users (id, email, created_at, role, name), device_requests, trade_in_requests, settings (key/value), plus whatever new migrations add. Functions: `next_invoice_number()` and `get_public_invoice(p_invoice_id)`.
- `invoices.total_amount` and `invoices.amount_due` are generated columns: never insert or update them. Invoice statuses: `pending`, `deposit`, `paid`, `cancelled` (the new-invoice page sets paid when the deposit equals the total, deposit when it is above 0, otherwise pending).
- Never modify or drop existing RLS policies, triggers or functions. New migrations go in `supabase/migrations/` (timestamped after the latest file), must be idempotent (`if not exists`, `drop policy if exists` only for policies the migration itself creates), and must enable RLS on every new table. Keep `lib/database.types.ts` in sync with every schema change.

## Roles
`admin_users.role`: `owner` has full access. `staff` can do everything except delete anything, open Settings, and open the Team and Activity pages. `technician` can use Device requests, Trade-ins, IMEI lookup and read-only Inventory. Any existing role value other than `staff` or `technician` (including `admin` or null) counts as owner.

## Rules
- No secrets in code or commits. No service-role key anywhere. No new npm dependencies unless the task says so.
- Do not add analytics to admin pages.
- Invoices never check or block on stock.
- Match the look of the existing admin pages and reuse existing helpers (for example formatNaira) instead of duplicating them. Split files larger than about 400 lines.
- Handle loading, empty and error states and show clear error messages.
- After every task run `npx tsc --noEmit`, `npm run lint` and `npm run build`, and fix all errors. Do not ask me questions. Make the most conservative choice and list assumptions in the final report.
- Final report format: files changed, SQL migrations I must run (in order), env vars needed, assumptions.
