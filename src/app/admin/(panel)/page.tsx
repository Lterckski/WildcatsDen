import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/supabase/server";
import { dateTime, peso, statusLabel } from "@/lib/format";
import type { Order } from "@/lib/types";

const TABS = {
  verify: "GCash to verify",
  prepare: "To prepare",
  ready: "Ready for pickup",
  claimed: "Claimed",
  cancelled: "Cancelled",
  all: "All",
} as const;
type Tab = keyof typeof TABS;

export default async function OrdersPage({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const tab: Tab = (typeof sp.tab === "string" && sp.tab in TABS ? sp.tab : "verify") as Tab;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const supabase = await db();

  let query = supabase.from("orders").select("*").order("created_at", { ascending: tab !== "claimed" && tab !== "cancelled" && tab !== "all" }).limit(200);
  if (tab === "verify") query = query.eq("status", "pending").eq("payment_method", "gcash").is("paid_at", null);
  if (tab === "prepare") query = query.eq("status", "pending").or("payment_method.eq.cash,paid_at.not.is.null");
  if (tab === "ready" || tab === "claimed" || tab === "cancelled") query = query.eq("status", tab);
  if (q) {
    const safe = q.replace(/[,()%]/g, "");
    query = query.or(`code.ilike.%${safe}%,name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }
  const { data } = await query;
  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Orders</h1>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="flex flex-wrap gap-2">
          {(Object.keys(TABS) as Tab[]).map((t) => (
            <Link
              key={t}
              href={`/admin?tab=${t}`}
              className={`border px-3 py-1.5 text-sm ${t === tab ? "border-maroon bg-maroon text-white" : "bg-white hover:border-foreground"}`}
            >
              {TABS[t]}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2">
          <input type="hidden" name="tab" value={tab} />
          <Input name="q" defaultValue={q} placeholder="Search code, name, email, phone" className="h-9 w-72 bg-white" />
        </form>
      </div>

      <div className="bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Placed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link href={`/admin/orders/${o.id}`} className="font-mono font-bold text-maroon underline-offset-4 hover:underline">{o.code}</Link>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{o.name}</p>
                  <p className="text-xs text-muted-foreground">{o.cit_student ? "CIT-U student" : "Non-student"}</p>
                </TableCell>
                <TableCell>
                  {o.payment_method === "gcash" ? "GCash" : "Cash"}{" "}
                  {o.paid_at ? <Badge variant="secondary">Paid</Badge> : <Badge variant="outline">Unpaid</Badge>}
                </TableCell>
                <TableCell>{statusLabel[o.status]}</TableCell>
                <TableCell className="text-right font-medium">{peso(o.total)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{dateTime(o.created_at)}</TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No orders here.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
