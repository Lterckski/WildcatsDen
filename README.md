# Wildcats Den

The online merch store of the CIT-U Wildcats. Shoppers browse, pick sizes and check out as guests; orders are picked up at the SSG Office and paid with GCash (receipt checked by staff) or cash on pickup. Staff run everything from `/admin`.

Next.js (App Router) · Tailwind + shadcn/ui · Supabase (Postgres, Auth, Storage) · Resend · Vercel.

## Set up

1. **Supabase.** Create a free project. In the SQL editor run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql` for the starter catalog. Turn on the `pg_cron` extension first if the migration asks for it (Database → Extensions).
2. **Keys.** Copy `.env.example` to `.env.local` and fill it in.
3. **First admin.** In Supabase → Authentication → Users, add a user with a password, then run:
   ```sql
   insert into public.profiles (id, full_name, role)
   select id, 'Your name', 'admin' from auth.users where email = 'you@example.com';
   ```
   Add everyone else from `/admin/staff`.
4. **Run.** `npm install`, then `npm run dev` and open http://localhost:3000.

## How orders work

| Status | Meaning |
| --- | --- |
| Placed | New. GCash orders wait for staff to verify the receipt. |
| Ready for pickup | Staff packed it; the customer gets an email. |
| Claimed | Picked up. For cash orders this also records the payment. |
| Cancelled | By staff, or automatically. Stock goes back on the shelf. |

Stock is taken when the order is placed. Unpaid orders not claimed within 7 days are cancelled every hour by `pg_cron` and their stock returns. Orders with verified GCash payments are never auto-cancelled.

**Roles.** Admin can do everything. Staff can do everything except manage staff accounts.

## Free-tier notes

- **Storage (1 GB).** The shoot photos ship with the site in `public/products`. Photos uploaded in the admin and GCash receipts are shrunk to WebP in the browser first.
- **Pausing.** Supabase pauses free projects after a week without traffic. `vercel.json` pings `/api/keepalive` daily.
- **Email.** Until a domain is verified in Resend, emails only reach the Resend account owner's address.
- **Vercel Hobby** is for non-commercial use; plan on Pro for the real launch.

## Checks

```bash
npx tsc --noEmit && npx eslint src && npm run build
supabase/tests/run.sh   # needs a local Postgres (brew install postgresql@16)
```
