import { adminDb, supabaseReady } from "@/lib/supabase/server";

// Vercel Cron calls this daily so the free Supabase project never sits idle long enough to pause.
export async function GET() {
  if (!supabaseReady) return Response.json({ ok: false, reason: "not configured" }, { status: 503 });
  const { error } = await adminDb().from("products").select("id", { head: true, count: "exact" });
  return Response.json({ ok: !error }, { status: error ? 500 : 200 });
}
