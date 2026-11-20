import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseReady = Boolean(url && publishable && process.env.SUPABASE_SECRET_KEY);

/** Acts as the signed-in staff member (or anonymous shopper); row-level security applies. */
export async function db() {
  const store = await cookies();
  return createServerClient(url, publishable, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components can't set cookies; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** Bypasses row-level security. Server only: guest checkout, order pages, staff accounts. */
export function adminDb() {
  return createClient(url, process.env.SUPABASE_SECRET_KEY ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
